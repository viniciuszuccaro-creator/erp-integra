/**
 * getEntityRecord — busca um registro completo por ID, sem filtros de contexto.
 * Usado pelo visualizador universal para preencher o formulário de edição.
 * V2: usa asServiceRole para garantir acesso sem filtros de empresa/grupo.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const { entityName, id } = body;
    if (!entityName || !id) {
      return Response.json({ error: 'entityName e id são obrigatórios' }, { status: 400 });
    }

    // Usa asServiceRole para buscar sem filtros de contexto (multiempresa)
    const api = base44.asServiceRole.entities[entityName];
    if (!api) {
      return Response.json({ error: `Entidade "${entityName}" não encontrada` }, { status: 404 });
    }

    // Tenta .get() primeiro
    if (typeof api.get === 'function') {
      try {
        const record = await api.get(id);
        if (record && record.id) {
          // Adiciona _ts para forçar resposta sempre fresca (evita cache do Layout wrapper)
          return Response.json({ record, _ts: Date.now() });
        }
      } catch (_) {}
    }

    // Fallback: filter por id
    if (typeof api.filter === 'function') {
      try {
        const res = await api.filter({ id }, '-updated_date', 1);
        if (Array.isArray(res) && res.length > 0 && res[0].id) {
          return Response.json({ record: res[0], _ts: Date.now() });
        }
      } catch (_) {}
    }

    return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});