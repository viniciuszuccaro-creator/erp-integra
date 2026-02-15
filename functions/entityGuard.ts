import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Lightweight entityGuard endpoint for scheduled healthchecks
// - Accepts empty payload or {_automation: true} and returns {ok:true}
// - Logs a service-role AuditLog entry (non-blocking) for observability
// - Does NOT import local modules to avoid deployment failures

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const meta = {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null,
      user_agent: req.headers.get('user-agent') || null,
      request_id: req.headers.get('x-request-id') || null,
    };

    const isAutomationPing = !body || Object.keys(body).length === 0 || body._automation === true;

    if (isAutomationPing) {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'system:automation',
          usuario_id: null,
          acao: 'Visualização',
          modulo: 'Sistema',
          tipo_auditoria: 'sistema',
          entidade: 'entityGuard',
          descricao: 'Auto-healing healthcheck OK',
          dados_novos: { _automation: true, _meta: meta },
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
      return Response.json({ ok: true, status: 'healthy' });
    }

    // RBAC check payload: { module, section, action, entity_name?, operation?, empresa_id?, group_id? }
    try {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return Response.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });

      // Load user profile (service role to avoid permission gaps fetching profile)
      let perfil = null;
      try {
        if (user?.perfil_acesso_id) {
          perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
        }
      } catch {}

      const normalize = (a) => {
        if (!a) return 'visualizar';
        const s = String(a).toLowerCase();
        const map = { ver:'visualizar', view:'visualizar', read:'visualizar', listar:'visualizar', status:'visualizar', delete:'excluir', remove:'excluir', destroy:'excluir', apagar:'excluir', cancel:'cancelar', cancelar:'cancelar', create:'criar', add:'criar', emitir:'criar', enviar:'criar', update:'editar', edit:'editar', carta:'editar', corrigir:'editar', approve:'aprovar', aprovar:'aprovar', export:'exportar', exportar:'exportar' };
        return map[s] || s;
      };

      const backendHasPermission = (perfilAcesso, moduleName, section, action = 'visualizar', userRole = null) => {
        if (userRole === 'admin') return true;
        const perms = perfilAcesso?.permissoes;
        if (!perms) return false;
        const desired = normalize(action);
        const modNode = perms[moduleName];
        if (!modNode) return false;
        if (!section) {
          return Object.values(modNode).some((node) => {
            if (Array.isArray(node)) return node.includes(desired) || (desired === 'visualizar' && node.includes('ver'));
            if (node && typeof node === 'object') {
              return Object.values(node).some((v) => Array.isArray(v) && (v.includes(desired) || (desired === 'visualizar' && v.includes('ver'))));
            }
            return false;
          });
        }
        const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
        let cursor = modNode;
        for (let i = 0; i < path.length; i++) { if (cursor == null) return false; cursor = cursor[path[i]]; }
        if (!cursor) return false;
        if (Array.isArray(cursor)) return cursor.includes(desired) || (desired === 'visualizar' && cursor.includes('ver'));
        if (typeof cursor === 'object') {
          const stack = [cursor];
          while (stack.length) { const node = stack.pop(); if (Array.isArray(node)) { if (node.includes(desired) || (desired === 'visualizar' && node.includes('ver'))) return true; } else if (node && typeof node === 'object') { Object.values(node).forEach((v)=>stack.push(v)); } }
          return false;
        }
        return false;
      };

      const moduleName = body?.module || 'Sistema';
      const section = body?.section || null;
      const action = body?.action || 'visualizar';
      const desired = normalize(action);

      let allowed = backendHasPermission(perfil, moduleName, section, desired, user?.role || null);

      // SoD runtime block
      try {
        const conflicts = perfil?.conflitos_sod_detectados || [];
        const modLc = String(moduleName || '').toLowerCase();
        const hasConflict = conflicts.some((c) => String(c?.tipo_conflito || '').toLowerCase().startsWith(modLc + ':') && String(c?.tipo_conflito || '').toLowerCase().includes(desired));
        if (hasConflict) allowed = false;
      } catch {}

      // Dynamic RBAC (behavioral): limit discount approvals for low-margin sellers
      try {
        const isComercial = moduleName === 'Comercial';
        const op = String(body?.operation || '').toLowerCase();
        const secStr = Array.isArray(section) ? section.join('.') : String(section || '');
        const isDiscountOp = op.includes('desconto') || /desconto/i.test(secStr) || (desired === 'aprovar' && /pedido.*financeiro/i.test(secStr));
        if (isComercial && isDiscountOp && user?.role !== 'admin') {
          const recent = await base44.asServiceRole.entities.Pedido.filter({ vendedor_id: user.id }, '-updated_date', 50);
          const margins = Array.isArray(recent) ? recent.map(p => Number(p?.margem_aplicada_vendedor || 0)).filter(v => !isNaN(v)) : [];
          const mean = margins.length ? margins.reduce((a,b)=>a+b,0)/margins.length : null;
          const threshold = 10; // %
          if (mean !== null && mean < threshold) {
            allowed = false;
          }
        }
      } catch {}

      if (!allowed) {
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            usuario: user?.full_name || user?.email || 'Usuário',
            usuario_id: user?.id,
            acao: 'Bloqueio', modulo: moduleName, tipo_auditoria: 'seguranca', entidade: Array.isArray(section)? section.join('.') : (section || '-'),
            descricao: `RBAC backend negou ação: ${moduleName}/${section || '-'} → ${desired}`,
            empresa_id: body?.empresa_id || null,
            dados_novos: { entity: body?.entity_name || null, operation: body?.operation || null }
          });
        } catch {}
        return Response.json({ allowed: false }, { status: 403 });
      }

      return Response.json({ allowed: true });
    } catch (e) {
      return Response.json({ allowed: false, error: e.message }, { status: 500 });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});