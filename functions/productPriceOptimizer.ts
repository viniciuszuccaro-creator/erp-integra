import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { optimizeProductPrice } from './_lib/pricing/optimizeProductPriceHandler.js';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);

    let payload; try { payload = await req.json(); } catch { payload = {}; }
    const event = payload?.event || null;
    const entityId = event?.entity_id || payload?.produto_id || null;
    const isBatch = !entityId; // Automação diária roda em lote quando não enviar produto_id

    // Se vier evento de update, processa só quando houve alteração de custo relevante
    const data = payload?.data || null;
    const oldData = payload?.old_data || null;
    if (event?.type === 'update') {
      const costFields = ['custo_medio', 'custo_aquisicao'];
      const changed = costFields.some(f => (data?.[f] ?? null) !== (oldData?.[f] ?? null));
      if (!changed) {
        return Response.json({ ok: true, skipped: true, reason: 'no_cost_change' });
      }
    }

    // Autenticação: permitir usuário final OU execução em lote (agendamento) sem usuário logado
    const user = await base44.auth.me().catch(() => null);
    let ctx = null;
    if (user) {
      ctx = await getUserAndPerfil(base44).catch(() => null);
      const perm = await assertPermission(base44, ctx, 'Comercial', 'Produto', 'editar');
      if (perm) return perm; // retorna 403 padronizado do guard quando não autorizado
    } else if (!event && !isBatch) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Execução em lote (sem produto_id): processa N produtos por execução para evitar timeouts // v2
    if (isBatch) {
      const limit = Math.min(Math.max(Number(payload?.limit) || 100, 1), 1000); // 1..1000
      const filtro = payload?.filter || {};

      const produtos = await base44.asServiceRole.entities.Produto.filter(filtro, '-updated_date', limit);
      let updated = 0, skipped = 0, failed = 0;

      for (const p of produtos) {
        try {
          const r = await optimizeProductPrice(base44, ctx, { entityId: p.id, payload: { data: p }, user: user || { full_name: 'Automação' } });
          if (r?.updated) updated++; else skipped++;
        } catch (_) { failed++; }
      }

      try {
        await audit(base44, user || { full_name: 'Automação' }, {
          acao: 'Edição',
          modulo: 'Comercial',
          entidade: 'Produto',
          descricao: 'Otimização de preços em lote (agendada)',
          dados_novos: { total: produtos.length, updated, skipped, failed, duracao_ms: Date.now() - t0 }
        });
      } catch {}

      return Response.json({ ok: true, batch: true, total: produtos.length, updated, skipped, failed });
    }

    // Execução unitária (com produto_id ou webhooks)
    const result = await optimizeProductPrice(base44, ctx, { entityId, payload, user });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});