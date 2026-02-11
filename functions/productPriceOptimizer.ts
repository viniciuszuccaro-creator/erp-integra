import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getTabelaPrecosIAConfig, fetchExternalQuotes, computeOptimizedPrice } from './_lib/priceUtils.js';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    let payload; try { payload = await req.json(); } catch { payload = {}; }
    const event = payload?.event || null;
    const entityId = event?.entity_id || payload?.produto_id;
    if (!entityId) return Response.json({ error: 'produto_id obrigatório' }, { status: 400 });

    const produto = payload?.data || await base44.asServiceRole.entities.Produto.get(entityId);

// Config comercial (multiempresa preparada) + cotações externas quando configuradas
const cfg = await getTabelaPrecosIAConfig(base44);
const context = { empresa_id: produto?.empresa_id || null, group_id: produto?.group_id || null };
const quotes = await fetchExternalQuotes(cfg, context, produto);

// Cálculo determinístico com cotações; fallback para heurística baseada em custo
const opt = computeOptimizedPrice(produto, quotes, cfg || {});

const patch = { preco_venda: opt.preco_venda, margem_minima_percentual: opt.margem_minima_percentual };
    if (Object.keys(patch).length) {
      await base44.asServiceRole.entities.Produto.update(entityId, patch);
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'automacao',
        acao: 'Edição',
        modulo: 'Estoque',
        entidade: 'Produto',
        registro_id: entityId,
        descricao: 'Preço e margem otimizados (cotações externas + políticas)',
        dados_novos: patch,
        empresa_id: produto?.empresa_id || null,
        duracao_ms: Date.now() - t0,
      });
    } catch {}

    return Response.json({ success: true, updated: patch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});