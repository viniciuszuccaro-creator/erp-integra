import { useMemo } from "react";
import useConfiguracaoSistema from "@/components/lib/useConfiguracaoSistema";

// Hook de políticas de preço (multiempresa via ConfiguracaoSistema)
export default function useTabelaPreco() {
  // Categoria/Chave padronizadas para ETAPA 1
  const { config, get, isLoading, error } = useConfiguracaoSistema({ categoria: 'Comercial', chave: 'tabela_precos_ia' });

  const markupMinimo = get('configuracoes_comerciais.tabela_precos_ia.markup_minimo_percentual')
    ?? get('tabela_precos_ia.markup_minimo_percentual')
    ?? 10;

  const politicas = get('configuracoes_comerciais.tabela_precos_ia.politicas_precificacao')
    ?? get('tabela_precos_ia.politicas_precificacao')
    ?? [];

  const regraPrioridade = get('configuracoes_comerciais.tabela_precos_ia.regra_prioridade')
    ?? get('tabela_precos_ia.regra_prioridade')
    ?? 'custo';

  const calcularPrecoMinimo = (custo) => {
    const c = Number(custo || 0);
    const m = Number(markupMinimo || 0);
    if (c <= 0) return 0;
    return Number((c * (1 + m / 100)).toFixed(2));
  };

  const aplicarPoliticas = useMemo(() => {
    return (produto) => {
      const custoBase = Number(produto?.custo_medio ?? produto?.custo_aquisicao ?? 0);
      let preco = calcularPrecoMinimo(custoBase);

      // Aplica política simples por segmento/grupo quando existir
      const grupo = produto?.grupo || produto?.grupo_produto || produto?.segmento;
      const regra = Array.isArray(politicas) ? politicas.find(p => p?.segmento === grupo) : null;
      if (regra) {
        const margemMin = Number(regra?.margem_minima ?? markupMinimo);
        const ajuste = Number(regra?.ajuste ?? 0); // +/- %
        const base = Math.max(margemMin, Number(markupMinimo));
        preco = Number((custoBase * (1 + base / 100) * (1 + ajuste / 100)).toFixed(2));
      }

      // Reserva para priorização futura (custo/mercado/histórico)
      return {
        preco_sugerido: Math.max(0, preco),
        margem_minima_percentual: Number(markupMinimo),
        regra_aplicada: regraPrioridade,
      };
    };
  }, [politicas, markupMinimo, regraPrioridade]);

  return {
    isLoading,
    error,
    config,
    markupMinimo,
    politicas,
    regraPrioridade,
    calcularPrecoMinimo,
    aplicarPoliticas,
  };
}