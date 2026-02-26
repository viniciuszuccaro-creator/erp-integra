import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function pickAllowed(entityName, data) {
  // Remove read-only fields and IDs
  const clone = { ...data };
  delete clone.id; delete clone.created_date; delete clone.updated_date; delete clone.created_by;
  // NotaFiscal nunca é espelhada entre escopos
  if (entityName === 'NotaFiscal') return null;
  return clone;
}

async function listEmpresasByGroup(base44, groupId) {
  try {
    const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId });
    if (Array.isArray(empresas) && empresas.length) return empresas;
  } catch (_) {}
  // Fallback: todas empresas ativas
  try {
    return await base44.asServiceRole.entities.Empresa.filter({ status: 'Ativa' });
  } catch (_) { return []; }
}

function nowIso() { return new Date().toISOString(); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Automations call with payload: { event, data, old_data, payload_too_large }
    const body = await req.json();
    const event = body?.event || {};
    const entityName = event?.entity_name;
    const eventType = event?.type; // create | update | delete
    const entityId = event?.entity_id;

    if (!entityName || !eventType || !entityId) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Carrega o registro atual (delete pode não ter data)
    let record = body?.data;
    if (!record && eventType !== 'delete') {
      try { record = await base44.asServiceRole.entities[entityName].get(entityId); } catch (_) {}
    }

    // Regras NF-e: nunca sincronizar (apenas política separada em nfeActions)
    if (entityName === 'NotaFiscal') {
      return Response.json({ ok: true, skipped: 'NotaFiscal' });
    }

    const groupId = record?.group_id || body?.data?.group_id || body?.old_data?.group_id || null;
    const empresaId = record?.empresa_id || body?.data?.empresa_id || null;

    // Proteção anti-loop: se acabou de sincronizar, ignorar
    const existingMaps = await base44.asServiceRole.entities.SyncMap.filter({ entity_name: entityName });
    const mapsById = (existingMaps || []).filter(m => m.source_id === entityId || m.target_id === entityId);
    const recent = mapsById.find(m => {
      const t = new Date(m.last_sync_at || 0).getTime();
      return Date.now() - t < 2500; // 2.5s janela anti-loop
    });
    if (recent) {
      return Response.json({ ok: true, ignored: 'recent-sync' });
    }

    // DELETE: apagar espelhos
    if (eventType === 'delete') {
      for (const m of mapsById) {
        const counterpartId = (m.source_id === entityId) ? m.target_id : m.source_id;
        try { await base44.asServiceRole.entities[entityName].delete(counterpartId); } catch (_) {}
        try { await base44.asServiceRole.entities.SyncMap.delete(m.id); } catch (_) {}
      }
      return Response.json({ ok: true, deleted: mapsById.length });
    }

    // CREATE/UPDATE: bidirecional
    if (empresaId) {
      // empresa -> grupo (UP)
      // Se já existe mapeamento up, atualiza; senão cria no grupo (sem empresa_id)
      const upMap = mapsById.find(m => m.direction === 'up');
      const payload = pickAllowed(entityName, record);
      const groupFilter = { ...(groupId ? { group_id: groupId } : {}) };
      if (!payload) return Response.json({ ok: true, skipped: 'not-allowed' });
      delete payload.empresa_id;
      let targetId = upMap?.target_id;
      if (targetId) {
        await base44.asServiceRole.entities[entityName].update(targetId, payload);
        await base44.asServiceRole.entities.SyncMap.update(upMap.id, { last_sync_at: nowIso() });
      } else {
        const created = await base44.asServiceRole.entities[entityName].create({ ...payload, ...groupFilter });
        await base44.asServiceRole.entities.SyncMap.create({ entity_name: entityName, group_id: groupId || null, empresa_id: empresaId, source_id: entityId, target_id: created.id, direction: 'up', last_sync_at: nowIso() });
      }
      return Response.json({ ok: true, direction: 'up' });
    }

    // grupo -> empresas (DOWN)
    if (groupId) {
      const empresas = await listEmpresasByGroup(base44, groupId);
      const payload = pickAllowed(entityName, record);
      if (!payload) return Response.json({ ok: true, skipped: 'not-allowed' });
      const results = [];
      for (const emp of empresas) {
        const empId = emp.id;
        const map = (existingMaps || []).find(m => (m.source_id === entityId && m.empresa_id === empId && m.direction === 'down') || (m.target_id === entityId && m.empresa_id === empId && m.direction === 'up'))
          || mapsById.find(m => m.empresa_id === empId && (m.source_id === entityId || m.target_id === entityId));
        const isMirror = map && map.target_id && map.source_id === entityId && map.direction === 'down';
        const targetId = isMirror ? map.target_id : null;
        const dataDown = { ...payload, empresa_id: empId };
        if (targetId) {
          await base44.asServiceRole.entities[entityName].update(targetId, dataDown);
          await base44.asServiceRole.entities.SyncMap.update(map.id, { last_sync_at: nowIso() });
          results.push({ empresa_id: empId, action: 'updated' });
        } else {
          const created = await base44.asServiceRole.entities[entityName].create({ ...dataDown, group_id: groupId });
          await base44.asServiceRole.entities.SyncMap.create({ entity_name: entityName, group_id: groupId, empresa_id: empId, source_id: entityId, target_id: created.id, direction: 'down', last_sync_at: nowIso() });
          results.push({ empresa_id: empId, action: 'created' });
        }
      }
      return Response.json({ ok: true, direction: 'down', results });
    }

    return Response.json({ ok: true, note: 'no scope' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});