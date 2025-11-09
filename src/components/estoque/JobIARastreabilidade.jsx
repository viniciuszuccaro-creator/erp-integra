import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Rastreabilidade Completa
 * Mapeia origem → destino de cada KG de produto
 * 
 * GATILHO: Sob demanda (quando cliente pedir rastreio)
 */
export async function rastrearOrigem(produtoId, empresaId) {
  console.log('🔎 [IA Rastreabilidade] Rastreando origem...');

  const produto = await base44.entities.Produto.get(produtoId);
  
  // Buscar todas movimentações deste produto
  const movimentacoes = await base44.entities.MovimentacaoEstoque.filter({
    produto_id: produtoId,
    empresa_id: empresaId
  }, '-data_movimentacao', 1000);

  const rastreio = {
    produto_id: produtoId,
    produto_descricao: produto.descricao,
    estoque_atual_kg: produto.estoque_atual,
    origem_detalhada: []
  };

  // Agrupar por lote (FIFO)
  const entradasPorLote = {};
  
  movimentacoes.forEach(mov => {
    if (mov.tipo_movimento === 'entrada') {
      const lote = mov.lote || 'SEM-LOTE';
      
      if (!entradasPorLote[lote]) {
        entradasPorLote[lote] = {
          lote: lote,
          data_entrada: mov.data_movimentacao,
          quantidade_original: 0,
          quantidade_disponivel: 0,
          fornecedor: mov.nota_fiscal_id ? 'Fornecedor' : 'Produção Interna',
          documento: mov.documento,
          nf: mov.nota_fiscal_id
        };
      }

      entradasPorLote[lote].quantidade_original += mov.quantidade;
      entradasPorLote[lote].quantidade_disponivel += mov.quantidade;
    } else if (mov.tipo_movimento === 'saida') {
      // FIFO: Baixar dos lotes mais antigos primeiro
      const lotesOrdenados = Object.values(entradasPorLote)
        .sort((a, b) => new Date(a.data_entrada) - new Date(b.data_entrada));

      let quantidadeBaixar = mov.quantidade;

      for (const lote of lotesOrdenados) {
        if (quantidadeBaixar <= 0) break;
        if (lote.quantidade_disponivel <= 0) continue;

        const baixado = Math.min(quantidadeBaixar, lote.quantidade_disponivel);
        lote.quantidade_disponivel -= baixado;
        quantidadeBaixar -= baixado;
      }
    }
  });

  rastreio.origem_detalhada = Object.values(entradasPorLote)
    .filter(lote => lote.quantidade_disponivel > 0)
    .map(lote => ({
      lote: lote.lote,
      quantidade_kg: lote.quantidade_disponivel.toFixed(2),
      data_entrada: new Date(lote.data_entrada).toLocaleDateString('pt-BR'),
      fornecedor: lote.fornecedor,
      documento: lote.documento,
      percentual_estoque: produto.estoque_atual > 0 
        ? ((lote.quantidade_disponivel / produto.estoque_atual) * 100).toFixed(1)
        : 0
    }));

  console.log('✅ [IA Rastreabilidade] Rastreio completo gerado.');
  return rastreio;
}

export default rastrearOrigem;