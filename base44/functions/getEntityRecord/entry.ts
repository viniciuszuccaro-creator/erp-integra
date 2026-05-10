/**
 * getEntityRecord — busca registros de entidade por ID ou filtro genérico.
 * V3: suporta dois modos:
 *   - Por ID: { entityName, id }
 *   - Por filtro: { entityName, filter, limit, sortField }
 * Usa asServiceRole para garantir acesso sem filtros de contexto (multiempresa).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const { entityName, id, filter, limit, sortField } = body;
    if (!entityName) {
      return Response.json({ error: 'entityName é obrigatório' }, { status: 400 });
    }

    const api = base44.asServiceRole.entities[entityName];
    if (!api) {
      return Response.json({ error: `Entidade "${entityName}" não encontrada` }, { status: 404 });
    }

    // MODO 1: busca por ID
    if (id) {
      if (typeof api.get === 'function') {
        try {
          const record = await api.get(id);
          if (record && record.id) {
            return Response.json({ record, _ts: Date.now() });
          }
        } catch (_) {}
      }
      if (typeof api.filter === 'function') {
        try {
          const res = await api.filter({ id }, '-updated_date', 1);
          if (Array.isArray(res) && res.length > 0) {
            return Response.json({ record: res[0], _ts: Date.now() });
          }
        } catch (_) {}
      }
      return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    // MODO 2: busca por filtro genérico (para ConfiguracaoSistema e outros)
    if (filter && typeof filter === 'object') {
      const maxLimit = Math.min(Number(limit) || 50, 500);
      const sort = sortField || '-updated_date';
      if (typeof api.filter === 'function') {
        const res = await api.filter(filter, sort, maxLimit);
        const data = Array.isArray(res) ? res : [];
        return Response.json({ data, _ts: Date.now() });
      }
    }

    return Response.json({ error: 'Parâmetros insuficientes: forneça id ou filter' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});