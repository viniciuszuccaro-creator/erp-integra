import { getTabelaPrecosIAConfig, fetchExternalQuotes, computeOptimizedPrice } from '../priceUtils.js';
import { audit } from '../guard.js';

// Handler pequeno e reutilizável para otimização de preço de produto
export async function optimizeProductPrice(base44, ctx, { entityId, payload, user }) {
  const t0 = Date.now();

  // Carregar produto (se não estiver no payload)
  const produto = payload?.data || await base44.asServiceRole.entities.Produto.get(entityId);

  // Config comercial (multiempresa) + cotações externas quando configuradas
  const cfg = await getTabelaPrecosIAConfig(base44);
  if (cfg && cfg.habilitado === false) {
    return { success: true, skipped: true, reason: 'tabela_precos_ia desabilitada' };
  }

  const context = { empresa_id: produto?.empresa_id || null, group_id: produto?.group_id || null };
  const quotes = await fetchExternalQuotes(cfg, context, produto);

  // Cálculo determinístico com cotações; fallback para heurística baseada em custo
  const opt = computeOptimizedPrice(produto, quotes, cfg || {});

  const patch = { preco_venda: opt.preco_venda, margem_minima_percentual: opt.margem_minima_percentual };
  if (Object.keys(patch).length) {
    await base44.asServiceRole.entities.Produto.update(entityId, patch);
  }

  try {
    await audit(base44, user || { full_name: 'Automação' }, {
      acao: 'Edição',
      modulo: 'Comercial',
      entidade: 'Produto',
      registro_id: entityId,
      descricao: 'Preço e margem otimizados (cotações externas + políticas)',
      dados_novos: { ...patch, fonte_cotacoes: cfg?.fonte_cotacoes || 'nenhuma' },
      empresa_id: produto?.empresa_id || null,
      duracao_ms: Date.now() - t0,
    });
  } catch {}

  return { success: true, updated: patch };
}