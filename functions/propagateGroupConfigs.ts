import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission } from './_lib/guard.js';

// Propagação de configurações do nível de GRUPO para EMPRESAS do grupo
// Suporta TabelaPreco e FormaPagamento (extensível no futuro)
// Payload esperado: { group_id: string, entidades?: string[], override?: boolean }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user?.role !== 'admin') {
      const denied = await assertPermission(base44, { user, perfil }, 'Sistema', 'PropagacaoGrupo', 'executar');
      if (denied) return denied;
    }

    const raw = await req.json();
    // Suporta chamadas diretas (payload simples) e automações de entidade (payload com event/data)
    const event = raw?.event || null;
    const data = raw?.data || null;
    const body = event ? {
      group_id: data?.group_id ?? raw?.group_id ?? null,
      empresa_id: data?.empresa_id ?? raw?.empresa_id ?? null,
      entidades: raw?.entidades ?? (event?.entity_name ? [event.entity_name] : undefined),
      direction: raw?.direction,
      override: raw?.override,
      strategy: raw?.strategy
    } : raw;

    const groupIdIn = body?.group_id || null;
    const empresaIdIn = body?.empresa_id || null;
    const direction = body?.direction || (empresaIdIn && !groupIdIn ? 'empresa_to_grupo' : 'grupo_to_empresas');
    const entidades = Array.isArray(body?.entidades) && body.entidades.length > 0 ? body.entidades : ['PlanoDeContas','CentroCusto','TabelaPreco','FormaPagamento'];
    const override = !!body?.override;
    const strategy = body?.strategy || (override ? 'override' : 'skip');

    let groupId = groupIdIn;
    if (!groupId && empresaIdIn) {
      const emp = await base44.asServiceRole.entities.Empresa.filter({ id: empresaIdIn }, undefined, 1).then(r => r?.[0]).catch(() => null);
      groupId = emp?.group_id || null;
    }
    if (!groupId) return Response.json({ error: 'Contexto inválido: group_id ou empresa_id obrigatório' }, { status: 400 });

    const allEmpresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 500);

    const targetEmpresas = (Array.isArray(body?.empresas_ids) && body.empresas_ids.length)
      ? allEmpresas.filter(e => body.empresas_ids.includes(e.id))
      : (event?.entity_name === 'Empresa' && data?.id
          ? allEmpresas.filter(e => e.id === data.id)
          : allEmpresas);

    const results = [];
    const ops = [];

    const copiarRegistros = async (entityName) => {
      const baseRegs = await base44.asServiceRole.entities[entityName].filter({ group_id: groupId }, undefined, 1000);
      let created = 0, updated = 0, skipped = 0, conflicted = 0;
      for (const emp of targetEmpresas) {
        for (const r of baseRegs) {
          const keyFields = ['codigo','nome','descricao','titulo'];
          const keyField = keyFields.find(k => r?.[k]);
          const filtro = { empresa_id: emp.id };
          if (keyField) filtro[keyField] = r[keyField];
          const existing = await base44.asServiceRole.entities[entityName].filter(filtro, undefined, 1);

          const basePayload = { ...r };
          delete basePayload.id; delete basePayload.created_date; delete basePayload.updated_date; delete basePayload.created_by; delete basePayload.group_id;
          basePayload.empresa_id = emp.id;

          if (existing?.length) {
            if (strategy === 'override') {
              await base44.asServiceRole.entities[entityName].update(existing[0].id, basePayload);
              updated++; ops.push({ entity: entityName, action: 'update', empresa_id: emp.id, key: keyField ? r[keyField] : null });
            } else if (strategy === 'merge') {
              const patch = {};
              for (const [k, v] of Object.entries(basePayload)) {
                if (existing[0][k] === undefined || existing[0][k] === null) patch[k] = v;
              }
              if (Object.keys(patch).length > 0) {
                await base44.asServiceRole.entities[entityName].update(existing[0].id, patch);
                updated++; ops.push({ entity: entityName, action: 'merge', empresa_id: emp.id, key: keyField ? r[keyField] : null });
              } else {
                skipped++;
              }
            } else {
              // skip
              skipped++; conflicted++;
            }
          } else {
            await base44.asServiceRole.entities[entityName].create(basePayload);
            created++; ops.push({ entity: entityName, action: 'create', empresa_id: emp.id, key: keyField ? r[keyField] : null });
          }
        }
      }
      results.push({ entity: entityName, total: baseRegs.length, created, updated, skipped, conflicted });
    };

    if (direction === 'grupo_to_empresas') {
      for (const en of entidades) {
        if (!base44.asServiceRole.entities?.[en]) continue;
        await copiarRegistros(en);
      }
    } else if (direction === 'empresa_to_grupo' && empresaIdIn) {
      // Copia configurações da empresa origem para o nível do grupo (sem sobrescrever IDs)
      const copiarEmpresaParaGrupo = async (entityName) => {
        const baseRegs = await base44.asServiceRole.entities[entityName].filter({ empresa_id: empresaIdIn }, undefined, 1000);
        let created = 0, updated = 0, skipped = 0, conflicted = 0;
        for (const r of baseRegs) {
          const keyFields = ['codigo','nome','descricao','titulo'];
          const keyField = keyFields.find(k => r?.[k]);
          const filtro = { group_id: groupId };
          if (keyField) filtro[keyField] = r[keyField];
          const existing = await base44.asServiceRole.entities[entityName].filter(filtro, undefined, 1);

          const basePayload = { ...r };
          delete basePayload.id; delete basePayload.created_date; delete basePayload.updated_date; delete basePayload.created_by; delete basePayload.empresa_id;
          basePayload.group_id = groupId;

          if (existing?.length) {
            if (strategy === 'override') {
              await base44.asServiceRole.entities[entityName].update(existing[0].id, basePayload);
              updated++; ops.push({ entity: entityName, action: 'update', group_id: groupId, key: keyField ? r[keyField] : null });
            } else if (strategy === 'merge') {
              const patch = {};
              for (const [k, v] of Object.entries(basePayload)) {
                if (existing[0][k] === undefined || existing[0][k] === null) patch[k] = v;
              }
              if (Object.keys(patch).length > 0) {
                await base44.asServiceRole.entities[entityName].update(existing[0].id, patch);
                updated++; ops.push({ entity: entityName, action: 'merge', group_id: groupId, key: keyField ? r[keyField] : null });
              } else {
                skipped++;
              }
            } else {
              skipped++; conflicted++;
            }
          } else {
            await base44.asServiceRole.entities[entityName].create(basePayload);
            created++; ops.push({ entity: entityName, action: 'create', group_id: groupId, key: keyField ? r[keyField] : null });
          }
        }
        results.push({ entity: entityName, total: baseRegs.length, created, updated, skipped, conflicted, direction });
      };
      for (const en of entidades) {
        if (!base44.asServiceRole.entities?.[en]) continue;
        await copiarEmpresaParaGrupo(en);
      }
    }

    // Auditoria
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Sistema',
        usuario_id: user?.id,
        acao: 'Criação',
        modulo: 'Sistema',
        entidade: 'PropagacaoGrupo',
        descricao: `Propagação (${direction}) concluída (${results.map(r=>r.entity+':'+(r.created||0)+'/'+(r.updated||0)+'/'+(r.skipped||0)).join(', ')})`,
        dados_novos: { group_id: groupId, empresa_origem: empresaIdIn || null, direction, entidades, override, strategy, results, ops_count: ops.length },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json({ ok: true, direction, results });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});