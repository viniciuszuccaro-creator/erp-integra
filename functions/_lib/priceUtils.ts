// Utilities for price optimization with external quotations (multiempresa-ready)
export async function getTabelaPrecosIAConfig(base44) {
  try {
    // Busca configs de categoria Comercial e retorna o primeiro que contenha tabela_precos_ia
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Comercial' }, '-updated_date', 5);
    if (!Array.isArray(cfgs)) return null;
    for (const c of cfgs) {
      const tpi = c?.configuracoes_comerciais?.tabela_precos_ia || c?.tabela_precos_ia;
      if (tpi) return tpi;
    }
    return null;
  } catch (_) {
    return null;
  }
}

export async function fetchExternalQuotes(cfg, context, produto) {
  try {
    if (!cfg || cfg.fonte_cotacoes !== 'externa' || !cfg.url_api) return null;
    const headers = { 'Content-Type': 'application/json' };
    if (cfg.api_key) {
      // Tenta ambos padrões de header
      headers['Authorization'] = `Bearer ${cfg.api_key}`;
      headers['x-api-key'] = cfg.api_key;
    }
    const body = {
      empresa_id: context?.empresa_id || null,
      group_id: context?.group_id || null,
      produto: {
        id: produto?.id,
        descricao: produto?.descricao,
        grupo: produto?.grupo,
        unidade: produto?.unidade_principal,
      }
    };
    const resp = await fetch(cfg.url_api, { method: 'POST', headers, body: JSON.stringify(body), redirect: 'follow' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data;
  } catch (_) {
    return null;
  }
}

function extractSteelIndex(quotes) {
  if (!quotes) return null;
  // Aceita diferentes formatos comuns
  if (typeof quotes === 'number') return quotes;
  if (Array.isArray(quotes)) {
    const cand = quotes.find((q) => q?.material?.toLowerCase?.() === 'aço' || q?.material?.toLowerCase?.() === 'aco');
    return Number(cand?.preco || cand?.price || cand?.value) || null;
  }
  return Number(quotes?.preco || quotes?.price || quotes?.steel_price || quotes?.aco || quotes?.indice) || null;
}

export function computeOptimizedPrice(produto, quotes, cfg) {
  const custoBase = Number(produto?.custo_medio ?? produto?.custo_aquisicao ?? 0) || 0;
  const markupMin = Number(cfg?.markup_minimo_percentual ?? 10);
  const regra = cfg?.regra_prioridade || 'custo';

  const steelIdx = extractSteelIndex(quotes);

  let precoSugerido = 0;
  if (steelIdx && steelIdx > 0 && (regra === 'mercado' || regra === 'historico')) {
    // Preço ancorado no índice de aço + markup mínimo
    precoSugerido = steelIdx * (1 + markupMin / 100);
  } else if (custoBase > 0) {
    // Fallback em custo + markup
    precoSugerido = custoBase * (1 + markupMin / 100);
  } else {
    // Último recurso: mantém preço atual
    precoSugerido = Number(produto?.preco_venda || 0);
  }

  // Ajustes por políticas específicas (segmento/grupo de produto)
  try {
    const politicas = Array.isArray(cfg?.politicas_precificacao) ? cfg.politicas_precificacao : [];
    const seg = produto?.grupo || produto?.classificacao_abc || '';
    const pol = politicas.find(p => (p.segmento || '').toLowerCase() === String(seg).toLowerCase());
    if (pol) {
      const adj = Number(pol.ajuste || 0); // % +- adicional
      if (!Number.isNaN(adj) && adj !== 0) {
        precoSugerido = precoSugerido * (1 + adj / 100);
      }
      const margemMinSeg = Number(pol.margem_minima || NaN);
      if (!Number.isNaN(margemMinSeg) && custoBase > 0) {
        const precoMinSeg = custoBase * (1 + margemMinSeg / 100);
        if (precoSugerido < precoMinSeg) precoSugerido = precoMinSeg;
      }
    }
  } catch (_) {}

  // Arredondamento comercial
  precoSugerido = Math.max(0, Number(precoSugerido?.toFixed(2) || 0));

  // Margem resultante
  const margemPercent = custoBase > 0 ? Math.max(0, Math.round(((precoSugerido - custoBase) / custoBase) * 100)) : Math.max(0, Math.round(markupMin));

  return {
    preco_venda: precoSugerido,
    margem_minima_percentual: margemPercent
  };
}