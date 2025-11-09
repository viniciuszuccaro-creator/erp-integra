import { base44 } from "@/api/base44Client";
import { converterParaKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V21.4 - CONEXÃO: Expedição ↔ Estoque
 * Gatilho: Romaneio aprovado → Saída de estoque
 */
export async function baixarEstoqueExpedicao(romaneioId) {
  console.log('📦 Baixando estoque da expedição...');

  const romaneio = await base44.entities.Romaneio.get(romaneioId);
  const entregas = await base44.entities.Entrega.filter({
    romaneio_id: romaneioId
  });

  const movimentacoes = [];

  for (const entrega of entregas) {
    const pedido = await base44.entities.Pedido.get(entrega.pedido_id);

    // Processar todos os itens do pedido
    const todosItens = [
      ...(pedido.itens_revenda || []).map(i => ({ ...i, tipo: 'revenda' })),
      ...(pedido.itens_armado_padrao || []).map(i => ({ ...i, tipo: 'armado' })),
      ...(pedido.itens_corte_dobra || []).map(i => ({ ...i, tipo: 'corte_dobra' }))
    ];

    for (const item of todosItens) {
      let produtoId;
      let quantidadeKG;

      if (item.tipo === 'revenda') {
        produtoId = item.produto_id;
        const produto = await base44.entities.Produto.get(produtoId);
        
        // V22.0: Converter unidade de venda → KG
        quantidadeKG = converterParaKG(
          item.quantidade,
          item.unidade,
          produto
        );
      } else {
        // Produto de produção: buscar peso da OP
        const op = await base44.entities.OrdemProducao.filter({
          pedido_id: pedido.id
        });

        if (op.length === 0) continue;

        const itemOP = op[0].itens_producao?.find(i => 
          i.elemento === item.elemento && i.posicao === item.posicao
        );

        if (!itemOP?.peso_real_total) continue;

        quantidadeKG = itemOP.peso_real_total;
        
        // Buscar produto acabado
        const produtoAcabado = await base44.entities.Produto.filter({
          descricao: `Peça ${item.elemento} ${item.posicao}`,
          tipo_item: 'Produto Acabado',
          empresa_id: pedido.empresa_id
        });

        if (produtoAcabado.length === 0) continue;
        produtoId = produtoAcabado[0].id;
      }

      const produto = await base44.entities.Produto.get(produtoId);

      // Criar movimentação de SAÍDA
      const mov = await base44.entities.MovimentacaoEstoque.create({
        empresa_id: romaneio.empresa_id,
        grupo_id: romaneio.group_id,
        origem_movimento: 'pedido',
        origem_documento_id: pedido.id,
        tipo_movimento: 'saida',
        produto_id: produtoId,
        produto_descricao: produto.descricao,
        quantidade: quantidadeKG,
        unidade_medida: 'KG',
        estoque_anterior: produto.estoque_atual || 0,
        estoque_atual: (produto.estoque_atual || 0) - quantidadeKG,
        reservado_anterior: produto.estoque_reservado || 0,
        reservado_atual: Math.max(0, (produto.estoque_reservado || 0) - quantidadeKG),
        disponivel_anterior: produto.estoque_disponivel || 0,
        disponivel_atual: (produto.estoque_disponivel || 0),
        data_movimentacao: new Date().toISOString(),
        documento: `${pedido.numero_pedido} - ${romaneio.numero_romaneio}`,
        motivo: `Expedição - Romaneio ${romaneio.numero_romaneio}`,
        valor_unitario: produto.preco_venda || 0,
        valor_total: quantidadeKG * (produto.preco_venda || 0),
        responsavel: romaneio.motorista || 'Expedição'
      });

      // Atualizar produto (liberar reserva + baixar)
      await base44.entities.Produto.update(produtoId, {
        estoque_atual: (produto.estoque_atual || 0) - quantidadeKG,
        estoque_reservado: Math.max(0, (produto.estoque_reservado || 0) - quantidadeKG),
        estoque_disponivel: (produto.estoque_disponivel || 0)
      });

      movimentacoes.push(mov);
    }
  }

  console.log(`✅ ${movimentacoes.length} movimentações de saída (expedição) criadas.`);
  return movimentacoes;
}

export default baixarEstoqueExpedicao;