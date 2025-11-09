import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Rastreabilidade Total
 * Mapeia TODAS as OPs e Pedidos que usaram um lote específico
 * Usado em: Recalls, Qualidade, Devoluções
 */
export async function executarIARastreabilidade(produtoId, numeroLote) {
  console.log('🧠 IA Rastreabilidade iniciada...');

  const produto = await base44.entities.Produto.get(produtoId);

  // 1. Buscar movimentações de SAÍDA deste lote
  const saidas = await base44.entities.MovimentacaoEstoque.filter({
    produto_id: produtoId,
    tipo_movimento: 'saida',
    lote: numeroLote
  });

  const rastreabilidade = {
    produto: produto.descricao,
    lote: numeroLote,
    ordens_producao: [],
    pedidos_afetados: [],
    clientes_afetados: [],
    quantidade_total_consumida: 0
  };

  // 2. Mapear OPs que consumiram este lote
  for (const saida of saidas) {
    if (saida.origem_movimento === 'producao' && saida.origem_documento_id) {
      const op = await base44.entities.OrdemProducao.get(saida.origem_documento_id);
      
      rastreabilidade.ordens_producao.push({
        numero_op: op.numero_op,
        cliente: op.cliente_nome,
        data_producao: op.data_inicio_real,
        quantidade_consumida: saida.quantidade,
        pedido_id: op.pedido_id
      });

      rastreabilidade.quantidade_total_consumida += saida.quantidade;

      // 3. Mapear Pedido vinculado à OP
      if (op.pedido_id && !rastreabilidade.pedidos_afetados.find(p => p.pedido_id === op.pedido_id)) {
        const pedido = await base44.entities.Pedido.get(op.pedido_id);
        
        rastreabilidade.pedidos_afetados.push({
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_nome: pedido.cliente_nome,
          valor: pedido.valor_total,
          data_pedido: pedido.data_pedido
        });

        // 4. Mapear Cliente
        if (!rastreabilidade.clientes_afetados.includes(pedido.cliente_nome)) {
          rastreabilidade.clientes_afetados.push(pedido.cliente_nome);
        }
      }
    }
  }

  console.log(`✅ Rastreabilidade: ${rastreabilidade.ordens_producao.length} OPs, ${rastreabilidade.pedidos_afetados.length} pedidos, ${rastreabilidade.clientes_afetados.length} clientes afetados.`);

  return rastreabilidade;
}

export default executarIARastreabilidade;