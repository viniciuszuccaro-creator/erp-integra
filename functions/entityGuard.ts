import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, backendHasPermission, assertContextPresence, audit } from './_lib/guard.js';
import { notify } from './_lib/notificationService.js';
import { computeRisk } from './_lib/security/riskScoring.js';

// entityGuard: valida RBAC e multiempresa para operações CRUD genéricas de entidades sensíveis
// Payload: { entity, op: 'create'|'update'|'delete'|'read', data?, id?, filtros? , module, section }
// Use este endpoint em formulários críticos via SDK em vez de chamar entities.* diretamente

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { entity, op = 'read', data = null, id = null, filtros = {}, module: moduleName, section } = body || {};

    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';
    if (!entity || !op) return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });

    // RBAC
    const allowed = backendHasPermission(perfil, moduleName || entity, section || null, op, user.role);
    if (!allowed) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Multiempresa: exige empresa_id/group_id para create/update/delete
    if (op !== 'read') {
      const ctxErr = assertContextPresence(data || {}, true);
      if (ctxErr) return ctxErr;
    } else {
      // Para leitura sem id, filtros devem conter contexto
      if (!id) {
        const hasCtx = (filtros && (filtros.group_id || filtros.empresa_id));
        if (!hasCtx) return Response.json({ error: 'Filtro sem contexto multiempresa' }, { status: 400 });
      }
    }

    // Regras específicas de negócio
    if ((entity === 'ContaPagar' || entity === 'ContaReceber') && (op === 'create' || op === 'update')) {
      const payload = data || {};
      if (!payload.centro_custo_id || !payload.plano_contas_id) {
        return Response.json({ error: 'centro_custo_id e plano_contas_id são obrigatórios' }, { status: 400 });
      }
    }

    if (op === 'delete' && (entity === 'ContaPagar' || entity === 'ContaReceber')) {
      const registro = await base44.asServiceRole.entities[entity].get(id);
      const bloqueado = entity === 'ContaPagar'
        ? (registro?.status === 'Pago' || registro?.status_pagamento === 'Pago')
        : (registro?.status === 'Recebido');
      if (bloqueado) {
        return Response.json({ error: 'Exclusão proibida para títulos pagos/recebidos. Use cancelamento com justificativa.' }, { status: 400 });
      }
    }

    const api = base44.asServiceRole.entities[entity];
    let result = null;
    if (op === 'create') result = await api.create(data);
    else if (op === 'update') result = await api.update(id, data);
    else if (op === 'delete') result = await api.delete(id);
    else if (op === 'read') result = id ? await api.get(id) : await api.filter(filtros);

    // Risco (somente score/auditoria, sem bloqueio)
    const risk = computeRisk({ event: { entity_name: entity, type: op }, data, ip, userAgent });

    await audit(base44, user, {
      acao: op === 'read' ? 'Visualização' : op === 'delete' ? 'Exclusão' : op === 'update' ? 'Edição' : 'Criação',
      modulo: moduleName || entity,
      entidade: entity,
      registro_id: id || (result?.id ?? null),
      descricao: `entityGuard ${op} ${entity} (risco: ${risk.level})`,
      dados_novos: op !== 'read' ? { ...(data || null), __risk: risk } : null
    });

    const isPilotEntity = entity === 'Produto' || entity === 'ContaPagar' || entity === 'ContaReceber';
    if (isPilotEntity && (risk?.level === 'Crítico' || risk?.level === 'Alto')) {
      try {
        await notify(base44, {
          titulo: 'Alerta de Segurança',
          mensagem: `${entity} • ${op} • risco ${risk.level}`,
          categoria: 'Segurança',
          prioridade: risk.level === 'Crítico' ? 'Alta' : 'Normal',
          empresa_id: (data?.empresa_id || null),
          dados: { entity, op, id: id || result?.id, risk }
        });
      } catch (_) {}
    }

    return Response.json({ ok: true, data: result });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});