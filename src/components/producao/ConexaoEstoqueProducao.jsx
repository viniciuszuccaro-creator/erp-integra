import { base44 } from "@/api/base44Client";
import { converterParaKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V21.4 - CONEXÃO: Produção ↔ Estoque
 * Gatilho 1: OP muda para "Em Corte" → Consome matéria-prima
 * Gatilho 2: OP finalizada → Entrada de produto acabado
 */

/**
 * Consumo de Matéria-Prima (SAÍDA)
 */
export async function consumirMateriaPrimaOP(opId) {
  console.log('📦 Consumindo matéria-prima da OP...');

  const op = await base44.entities.OrdemProducao.get(opId);

  if (op.estoque_baixado) {
    console.log('⚠️ Estoque já foi baixado para esta OP.');
    return;
  }

  const movimentacoes = [];

  for (const material of op.materiais_necessarios || []) {
    const produto = await base44.entities.Produto.get(material.produto_id);

    // V22.0: Converter quantidade para KG
    const quantidadeKG = converterParaKG(
      material.quantidade_kg,
      'KG', // Já está em KG
      produto
    );

    // Criar movimentação de SAÍDA
    const mov = await base44.entities.MovimentacaoEstoque.create({
      empresa_id: op.empresa_id,
      group_id: op.group_id,
      origem_movimento: 'producao',
      origem_documento_id: opId,
      tipo_movimento: 'saida',
      produto_id: material.produto_id,
      produto_descricao: material.descricao,
      codigo_produto: produto.codigo,
      quantidade: quantidadeKG,
      unidade_medida: 'KG',
      estoque_anterior: produto.estoque_atual || 0,
      estoque_atual: (produto.estoque_atual || 0) - quantidadeKG,
      disponivel_anterior: produto.estoque_disponivel || 0,
      disponivel_atual: (produto.estoque_disponivel || 0) - quantidadeKG,
      data_movimentacao: new Date().toISOString(),
      documento: op.numero_op,
      motivo: `Consumo de matéria-prima - OP ${op.numero_op}`,
      valor_unitario: produto.custo_medio || 0,
      valor_total: quantidadeKG * (produto.custo_medio || 0),
      responsavel: op.operador_responsavel || 'Produção'
    });

    // Atualizar produto
    await base44.entities.Produto.update(material.produto_id, {
      estoque_atual: (produto.estoque_atual || 0) - quantidadeKG,
      estoque_disponivel: (produto.estoque_disponivel || 0) - quantidadeKG
    });

    movimentacoes.push(mov);
  }

  // Marcar OP como baixada
  await base44.entities.OrdemProducao.update(opId, {
    estoque_baixado: true,
    baixa_estoque_ids: movimentacoes.map(m => m.id)
  });

  console.log(`✅ ${movimentacoes.length} movimentações de saída criadas.`);
  return movimentacoes;
}

/**
 * Entrada de Produto Acabado (ENTRADA)
 */
export async function entrarProdutoAcabadoOP(opId) {
  console.log('📦 Dando entrada de produto acabado...');

  const op = await base44.entities.OrdemProducao.get(opId);

  const movimentacoes = [];

  for (const item of op.itens_producao || []) {
    if (!item.peso_real_total) continue;

    // V21.4: Produto acabado SEMPRE entra em KG
    const pesoKG = item.peso_real_total;

    // Buscar/criar produto acabado
    const produtoAcabado = await base44.entities.Produto.filter({
      descricao: `Peça ${item.elemento} ${item.posicao}`,
      tipo_item: 'Produto Acabado',
      empresa_id: op.empresa_id
    });

    let produtoId;
    if (produtoAcabado.length > 0) {
      produtoId = produtoAcabado[0].id;
    } else {
      const novoProduto = await base44.entities.Produto.create({
        empresa_id: op.empresa_id,
        group_id: op.group_id,
        descricao: `Peça ${item.elemento} ${item.posicao}`,
        codigo: `PROD-${item.elemento}-${item.posicao}`,
        tipo_item: 'Produto Acabado',
        unidade_medida: 'KG',
        unidade_estoque: 'KG',
        estoque_atual: 0,
        status: 'Ativo'
      });
      produtoId = novoProduto.id;
    }

    const produto = await base44.entities.Produto.get(produtoId);

    // Criar movimentação de ENTRADA
    const mov = await base44.entities.MovimentacaoEstoque.create({
      empresa_id: op.empresa_id,
      group_id: op.group_id,
      origem_movimento: 'producao',
      origem_documento_id: opId,
      tipo_movimento: 'entrada',
      produto_id: produtoId,
      produto_descricao: produto.descricao,
      quantidade: pesoKG,
      unidade_medida: 'KG',
      estoque_anterior: produto.estoque_atual || 0,
      estoque_atual: (produto.estoque_atual || 0) + pesoKG,
      data_movimentacao: new Date().toISOString(),
      documento: op.numero_op,
      motivo: `Entrada de produção - OP ${op.numero_op}`,
      responsavel: 'Produção'
    });

    // Atualizar produto
    await base44.entities.Produto.update(produtoId, {
      estoque_atual: (produto.estoque_atual || 0) + pesoKG,
      estoque_disponivel: (produto.estoque_disponivel || 0) + pesoKG
    });

    movimentacoes.push(mov);
  }

  console.log(`✅ ${movimentacoes.length} produtos acabados deram entrada no estoque.`);
  return movimentacoes;
}

export { consumirMateriaPrimaOP, entrarProdutoAcabadoOP };