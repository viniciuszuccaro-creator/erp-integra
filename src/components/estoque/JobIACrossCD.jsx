import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Cross-CD Otimizado
 * Executa: Diário / Sob Demanda
 * Sugere: Transferências entre empresas ANTES de criar compra
 */
export async function executarIACrossCD(produtoId, quantidadeNecessaria, empresaDestinoId) {
  console.log('🧠 IA Cross-CD iniciada...');

  const produto = await base44.entities.Produto.get(produtoId);
  const grupoId = produto.group_id;

  // Buscar mesmo produto em outras empresas do grupo
  const produtosGrupo = await base44.entities.Produto.filter({
    group_id: grupoId,
    descricao: produto.descricao,
    codigo: produto.codigo,
    status: 'Ativo'
  });

  const opcoesTransferencia = [];

  for (const prodOutro of produtosGrupo) {
    if (prodOutro.empresa_id === empresaDestinoId) continue; // Pula a própria

    const disponivelOrigem = prodOutro.estoque_disponivel || 0;
    
    if (disponivelOrigem > quantidadeNecessaria) {
      // Empresa tem estoque suficiente!
      
      // Calcular custo de transferência vs compra
      const custoTransferencia = quantidadeNecessaria * (produto.custo_medio || 0) * 1.05; // 5% overhead
      const custoCompra = quantidadeNecessaria * (produto.ultimo_preco_compra || produto.custo_medio || 0);
      
      opcoesTransferencia.push({
        empresa_origem_id: prodOutro.empresa_id,
        empresa_origem_nome: prodOutro.empresa_dona_id, // Simplificado
        disponivel_kg: disponivelOrigem,
        custo_transferencia: custoTransferencia,
        custo_compra: custoCompra,
        economia: custoCompra - custoTransferencia,
        recomendacao: custoTransferencia < custoCompra ? 'Transferir' : 'Comprar'
      });
    }
  }

  if (opcoesTransferencia.length === 0) {
    console.log('❌ Nenhuma empresa do grupo tem estoque suficiente.');
    return { sugestao: 'comprar', opcoes: [] };
  }

  // Ordenar por economia
  opcoesTransferencia.sort((a, b) => b.economia - a.economia);

  const melhorOpcao = opcoesTransferencia[0];

  console.log(`✅ Cross-CD: Transferir de ${melhorOpcao.empresa_origem_nome} economiza R$ ${melhorOpcao.economia.toFixed(2)}`);

  return {
    sugestao: 'transferir',
    opcoes: opcoesTransferencia,
    recomendacao_ia: melhorOpcao
  };
}

export default executarIACrossCD;