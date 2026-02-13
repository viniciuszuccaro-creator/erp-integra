import { getTabelaPrecosIAConfig, fetchExternalQuotes, computeOptimizedPrice } from '../priceUtils.js';
import { audit } from '../guard.js';

// Handler pequeno e reutilizável para otimização de preço de produto
export async function optimizeProductPrice(base44, ctx, { entityId, payload, user }) {
  const t0 = Date.now();

  // Carregar produto (se não estiver no payload)
  const produto = payload?.data || await base44.asServiceRole.entities.Produto.get(entityId);

  // Config comercial (multiempresa) + cotações externas quando configuradas
  const cfg = await getTabelaPrecosIAConfig(base44, produto?.empresa_id || null);
  if (!cfg) {
    return { success: true, skipped: true, reason: 'sem_configuracao' };
  }
  if (cfg.habilitado === false) {
    return { success: true, skipped: true, reason: 'desabilitado_global' };
  }
  if (Array.isArray(cfg.empresas_habilitadas) && produto?.empresa_id && !cfg.empresas_habilitadas.includes(produto.empresa_id)) {
    return { success: true, skipped: true, reason: 'feature_flag_empresa' };
  }
  if (Array.isArray(cfg.empresas_bloqueadas) && produto?.empresa_id && cfg.empresas_bloqueadas.includes(produto.empresa_id)) {
    return { success: true, skipped: true, reason: 'empresa_bloqueada' };
  }

  const context = { empresa_id: produto?.empresa_id || null, group_id: produto?.group_id || null };

  // Skip seguro quando configuração exige externa mas não há URL definida
  if ((cfg?.fonte_cotacoes === 'externa') && !cfg?.url_api) {
    return { success: true, skipped: true, reason: 'missing_api_url' };
  }

  let quotes = null;
  let quoteSource = cfg?.fonte_cotacoes || 'nenhuma';
  if (cfg?.fonte_cotacoes === 'externa') {
    try {
      quotes = await fetchExternalQuotes(cfg, context, produto);
    } catch (e) {
      quotes = null; // sem cotações quando falhar
      quoteSource = 'fallback_sem_cotacoes';
    }
  }

  // Cálculo determinístico com cotações; fallback para heurística baseada em custo
  const opt = computeOptimizedPrice(produto, quotes, cfg || {});

  const patch = { preco_venda: opt.preco_venda, margem_minima_percentual: opt.margem_minima_percentual };
  const needsUpdate = (produto?.preco_venda !== opt.preco_venda) || (produto?.margem_minima_percentual !== opt.margem_minima_percentual);

  if (!needsUpdate) {
    try {
      await audit(base44, user || { full_name: 'Automação' }, {
        acao: 'Edição',
        modulo: 'Comercial',
        entidade: 'Produto',
        registro_id: entityId,
        descricao: 'Otimização de preço/margem ignorada (sem mudança) — short-circuit',
        dados_novos: { ...patch, skipped: 'no_change', fonte_cotacoes: quoteSource },
        empresa_id: produto?.empresa_id || null,
        duracao_ms: Date.now() - t0,
      });
    } catch {}

    return { success: true, skipped: true, reason: 'no_change' };
  }

  await base44.asServiceRole.entities.Produto.update(entityId, patch);

  try {
    await audit(base44, user || { full_name: 'Automação' }, {
      acao: 'Edição',
      modulo: 'Comercial',
      entidade: 'Produto',
      registro_id: entityId,
      descricao: 'Preço/margem otimizados (políticas internas/externas)',
      dados_novos: { ...patch, fonte_cotacoes: quoteSource },
      empresa_id: produto?.empresa_id || null,
      duracao_ms: Date.now() - t0,
    });
  } catch {}

  return { success: true, updated: patch };
}