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
      // Garante que chave está no payload do update (necessário para manter consistência)
      const updateData = { ...data };
      if (chave && !updateData.chave) updateData.chave = chave;
      if (scope?.group_id) updateData.group_id = scope.group_id;
      if (scope?.empresa_id) updateData.empresa_id = scope.empresa_id;
      const updated = await api.update(id, updateData);
      return Response.json({ record: updated, id, _ts: Date.now() });
    }

    // MODO 2: upsert por chave + scope
    if (chave) {
      // Estratégia de busca progressiva: exato → só grupo → só empresa → só chave
      const tryFind = async (filtro) => {
        try { const r = await api.filter(filtro, '-updated_date', 5); return Array.isArray(r) ? r[0] || null : null; } catch { return null; }
      };

      let match = null;

      // 1) Exato: chave + grupo + empresa
      if (!match && scope?.group_id && scope?.empresa_id) {
        match = await tryFind({ chave, group_id: scope.group_id, empresa_id: scope.empresa_id });
      }
      // 2) Chave + só empresa
      if (!match && scope?.empresa_id) {
        match = await tryFind({ chave, empresa_id: scope.empresa_id });
      }
      // 3) Chave + só grupo
      if (!match && scope?.group_id) {
        match = await tryFind({ chave, group_id: scope.group_id });
      }
      // 4) Qualquer registro com essa chave — mas SOMENTE se não há scope definido
      // (evita atualizar registro de outro grupo/empresa)
      if (!match && !scope?.group_id && !scope?.empresa_id) {
        match = await tryFind({ chave });
      }

      if (match?.id) {
        // Atualiza preservando chave, categoria e scope — nunca sobrescreve com undefined
        const updatePayload = { ...data, chave };
        if (!updatePayload.categoria && match.categoria) updatePayload.categoria = match.categoria;
        if (scope?.group_id) updatePayload.group_id = scope.group_id;
        if (scope?.empresa_id) updatePayload.empresa_id = scope.empresa_id;
        const updated = await api.update(match.id, updatePayload);
        return Response.json({ record: updated, mode: 'update', id: match.id, _ts: Date.now() });
      } else {
        // Cria novo registro com chave + scope + data
        const payload = { chave, ...data };
        if (scope?.group_id) payload.group_id = scope.group_id;
        if (scope?.empresa_id) payload.empresa_id = scope.empresa_id;
        if (data?.categoria) payload.categoria = data.categoria;
        const created = await api.create(payload);
        return Response.json({ record: created, mode: 'create', id: created.id, _ts: Date.now() });
      }
    }

    return Response.json({ error: 'Forneça id ou chave' }, { status: 400 });
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});