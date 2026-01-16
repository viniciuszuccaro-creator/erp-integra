import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { event = {}, data = null } = payload || {};
    const entityName = event?.entity_name || payload?.entity_name;
    const entityId = event?.entity_id || payload?.entity_id;

    if (!entityName || !entityId) {
      return Response.json({ error: 'Missing entity_name or entity_id' }, { status: 400 });
    }

    // Prefer data from payload; if too large or missing, fetch minimal data
    let record = data;
    if (!record || Object.keys(record).length === 0) {
      const list = await base44.asServiceRole.entities[entityName]?.filter?.({ id: entityId }, '-updated_date', 1);
      record = Array.isArray(list) && list.length ? list[0] : null;
    }

    if (!record) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    // If group_id is missing but empresa_id exists, fetch Empresa to get group_id
    if (!record.group_id && record.empresa_id) {
      try {
        const empresas = await base44.asServiceRole.entities.Empresa?.filter?.({ id: record.empresa_id }, '-updated_date', 1);
        const empresa = Array.isArray(empresas) && empresas.length ? empresas[0] : null;
        if (empresa?.group_id) {
          await base44.asServiceRole.entities[entityName].update(entityId, { group_id: empresa.group_id });
          return Response.json({ success: true, fixed: true, group_id: empresa.group_id });
        }
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
      }
    }

    return Response.json({ success: true, fixed: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});