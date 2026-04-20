/**
 * upsertConfig — Atualiza ou cria um registro de ConfiguracaoSistema de forma confiável.
 * Bypassa o wrapper de entidades do layout (que pode injetar scope incorreto).
 * 
 * Modos:
 *  - { id, data }              → update do registro com o ID fornecido
 *  - { chave, data, scope }    → upsert por chave+scope (group_id/empresa_id)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) {}

    const { id, chave, data, scope } = body;
    if (!data || typeof data !== 'object') {
      return Response.json({ error: 'data é obrigatório' }, { status: 400 });
    }

    const api = base44.asServiceRole.entities.ConfiguracaoSistema;

    // MODO 1: update por ID direto
    if (id) {
      const updated = await api.update(id, data);
      return Response.json({ record: updated, _ts: Date.now() });
    }

    // MODO 2: upsert por chave + scope
    if (chave) {
      // Busca por chave + scope mais amplo (tenta encontrar o registro existente)
      const filtro = { chave };
      if (scope?.group_id) filtro.group_id = scope.group_id;
      if (scope?.empresa_id) filtro.empresa_id = scope.empresa_id;

      const existing = await api.filter(filtro, '-updated_date', 5).catch(() => []);
      const match = Array.isArray(existing) ? existing[0] : null;

      if (match?.id) {
        // Atualiza o registro existente com os novos dados
        const updated = await api.update(match.id, data);
        return Response.json({ record: updated, mode: 'update', _ts: Date.now() });
      } else {
        // Cria novo registro com chave + scope + data
        const payload = { chave, ...data };
        if (scope?.group_id) payload.group_id = scope.group_id;
        if (scope?.empresa_id) payload.empresa_id = scope.empresa_id;
        // Garante que categoria esteja presente
        if (data?.categoria) payload.categoria = data.categoria;
        const created = await api.create(payload);
        return Response.json({ record: created, mode: 'create', _ts: Date.now() });
      }
    }

    return Response.json({ error: 'Forneça id ou chave' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});