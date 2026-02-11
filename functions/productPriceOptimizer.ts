import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getTabelaPrecosIAConfig, fetchExternalQuotes, computeOptimizedPrice } from './_lib/priceUtils.js';
import { optimizeProductPrice } from './_lib/pricing/optimizeProductPriceHandler.js';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    let payload; try { payload = await req.json(); } catch { payload = {}; }
    const event = payload?.event || null;
    const entityId = event?.entity_id || payload?.produto_id;
    if (!entityId) return Response.json({ error: 'produto_id obrigatório' }, { status: 400 });

    // Skip when it's an update that didn't change cost fields
    const data = payload?.data || null;
    const oldData = payload?.old_data || null;
    if (event?.type === 'update') {
      const costFields = ['custo_medio', 'custo_aquisicao'];
      const changed = costFields.some(f => (data?.[f] ?? null) !== (oldData?.[f] ?? null));
      if (!changed) {
        return Response.json({ ok: true, skipped: true, reason: 'no_cost_change' });
      }
    }

    const user = await base44.auth.me().catch(() => null);
    let ctx = null;
    if (user) {
      ctx = await getUserAndPerfil(base44).catch(() => null);
      const perm = await assertPermission(base44, ctx, 'Comercial', 'Produto', 'editar');
      if (perm) return perm;
    } else if (!event) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await optimizeProductPrice(base44, ctx, { entityId, payload, user });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});