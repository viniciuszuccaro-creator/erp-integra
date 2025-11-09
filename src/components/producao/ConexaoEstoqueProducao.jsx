import { base44 } from "@/api/base44Client";
import { converterParaKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V21.4 - CONEXÃO: Produção ↔ Estoque (COMPLETO)
 * Gatilho 1: OP muda para "Em Corte" → Consome matéria-prima
 * Gatilho 2: OP finalizada → Entrada de produto acabado
 * Gatilho 3: Refugo → Movimentação de perda + Lançamento contábil
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
      'KG',
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
 * V21.4: NOVO - Entrada de Produto Acabado (ENTRADA)
 * Chamado quando OP muda para "Finalizada"
 */
export async function entrarProdutoAcabadoOP(opId) {
  console.log('📦 Dando entrada de produto acabado...');

  const op = await base44.entities.OrdemProducao.get(opId);

  if (!op.itens_producao || op.itens_producao.length === 0) {
    console.log('⚠️ OP sem itens produzidos.');
    return;
  }

  const movimentacoes = [];

  for (const item of op.itens_producao) {
    if (!item.peso_real_total || item.peso_real_total === 0) continue;

    // V21.4: Produto acabado SEMPRE entra em KG
    const pesoKG = item.peso_real_total;

    // Buscar/criar produto acabado
    const descricaoProduto = `Peça ${item.elemento} ${item.posicao}`;
    
    let produtoAcabado = await base44.entities.Produto.filter({
      descricao: descricaoProduto,
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
        descricao: descricaoProduto,
        codigo: `PROD-${item.elemento}-${item.posicao}`,
        tipo_item: 'Produto Acabado',
        grupo: 'Produto Acabado',
        unidade_principal: 'KG',
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
      disponivel_anterior: produto.estoque_disponivel || 0,
      disponivel_atual: (produto.estoque_disponivel || 0) + pesoKG,
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

/**
 * V21.4: NOVO - Registrar Refugo como Movimentação + Contábil
 * Chamado ao registrar refugo em apontamento
 */
export async function registrarRefugoEstoque(opId, refugoData) {
  console.log('🗑️ Registrando refugo no estoque...');

  const op = await base44.entities.OrdemProducao.get(opId);

  // Buscar bitola refugada
  const bitola = await base44.entities.Produto.get(refugoData.bitola_id);

  const pesoRefugadoKG = refugoData.peso_refugado_kg;

  // Criar movimentação de PERDA
  const mov = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: op.empresa_id,
    group_id: op.group_id,
    origem_movimento: 'producao',
    origem_documento_id: opId,
    tipo_movimento: 'saida',
    produto_id: refugoData.bitola_id,
    produto_descricao: `Refugo - ${bitola.descricao}`,
    quantidade: pesoRefugadoKG,
    unidade_medida: 'KG',
    data_movimentacao: new Date().toISOString(),
    documento: op.numero_op,
    motivo: `Refugo - ${refugoData.motivo}: ${refugoData.detalhes}`,
    responsavel: refugoData.operador || 'Produção',
    valor_unitario: bitola.custo_medio || 0,
    valor_total: pesoRefugadoKG * (bitola.custo_medio || 0)
  });

  // V21.4: Lançamento contábil de refugo (Perda)
  const valorPerda = pesoRefugadoKG * (bitola.custo_medio || 0);

  const lancamento = await base44.entities.LancamentoContabil.create({
    empresa_id: op.empresa_id,
    group_id: op.group_id,
    data_lancamento: new Date().toISOString().split('T')[0],
    historico: `Perda por refugo - OP ${op.numero_op}`,
    documento: op.numero_op,
    tipo_documento: 'Ordem de Produção',
    documento_origem_id: opId,
    conta_debito_codigo: '3.1.05',
    conta_debito_descricao: 'Perdas e Refugos',
    conta_credito_codigo: '1.1.03',
    conta_credito_descricao: 'Estoque de Matéria-Prima',
    valor: valorPerda,
    origem: 'Produção',
    automatico: true,
    status: 'Efetivado',
    periodo_competencia: new Date().toISOString().substring(0, 7)
  });

  // Atualizar OP com custo de refugo
  await base44.entities.OrdemProducao.update(opId, {
    custo_refugo_calculado: (op.custo_refugo_calculado || 0) + valorPerda,
    lancamento_contabil_refugo_id: lancamento.id
  });

  console.log(`✅ Refugo registrado: ${pesoRefugadoKG.toFixed(2)} KG, R$ ${valorPerda.toFixed(2)}`);
  return { movimentacao: mov, lancamento };
}

export { consumirMateriaPrimaOP, entrarProdutoAcabadoOP, registrarRefugoEstoque };