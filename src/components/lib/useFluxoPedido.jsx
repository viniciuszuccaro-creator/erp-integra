import { base44 } from "@/api/base44Client";

/**
 * 🔄 HOOK DE FLUXOS AUTOMÁTICOS DO PEDIDO V21.6 COMPLETO
 * 
 * ✅ FLUXO COMPLETO IMPLEMENTADO:
 * - Validação de crédito
 * - Baixa de estoque automática
 * - Geração de Contas a Receber
 * - Criação de Entrega/Retirada
 * - Atualização de status
 * - Cancelamento com estorno
 * 
 * Integrado com: AutomacaoFluxoPedido.jsx
 * Regra-Mãe: Sempre melhorar, nunca apagar
 */

/**
 * 1️⃣ APROVAR PEDIDO → Reserva Estoque + Gera OP + Valida Crédito
 */
export async function aprovarPedidoCompleto(pedido, empresaId) {
  const resultados = {
    validacaoCredito: null,
    reservasEstoque: [],
    opsGeradas: [],
    contasReceber: [],
    erros: []
  };

  try {
    // 1. VALIDAR CRÉDITO DO CLIENTE
    const validacaoCredito = await validarLimiteCredito(pedido);
    resultados.validacaoCredito = validacaoCredito;

    if (!validacaoCredito.aprovado) {
      resultados.erros.push(`Limite de crédito insuficiente: disponível R$ ${validacaoCredito.limite_disponivel}`);
      return resultados;
    }

    // 2. BAIXAR ESTOQUE IMEDIATAMENTE (Itens de Revenda) - V21.5 NOVO FLUXO
    const baixasEstoque = [];
    if (pedido.itens_revenda?.length > 0) {
      for (const item of pedido.itens_revenda) {
        try {
          const baixa = await baixarEstoqueItemAprovacao(item, pedido, empresaId);
          baixasEstoque.push(baixa);
        } catch (error) {
          resultados.erros.push(`Erro ao baixar estoque ${item.descricao}: ${error.message}`);
        }
      }
    }
    resultados.reservasEstoque = baixasEstoque;

    // 3. GERAR OPs AUTOMATICAMENTE (Itens de Produção)
    if (pedido.itens_producao?.length > 0) {
      try {
        const op = await gerarOPAutomatica(pedido, empresaId);
        resultados.opsGeradas.push(op);
      } catch (error) {
        resultados.erros.push(`Erro ao gerar OP: ${error.message}`);
      }
    }

    // 4. GERAR CONTAS A RECEBER (se forma de pagamento definida)
    if (pedido.forma_pagamento && pedido.parcelas?.length > 0) {
      for (const parcela of pedido.parcelas) {
        try {
          const conta = await gerarContaReceber(pedido, parcela, empresaId);
          resultados.contasReceber.push(conta);
        } catch (error) {
          resultados.erros.push(`Erro ao gerar conta a receber: ${error.message}`);
        }
      }
    }

    // 5. ATUALIZAR LIMITE DE CRÉDITO UTILIZADO
    if (pedido.cliente_id) {
      await atualizarLimiteCreditoCliente(pedido.cliente_id, pedido.valor_total, 'adicionar');
    }

    // 6. ATUALIZAR STATUS DO PEDIDO
    await base44.entities.Pedido.update(pedido.id, {
      status: "Aprovado",
      data_aprovacao: new Date().toISOString()
    });

    // 7. REGISTRAR NO HISTÓRICO DO CLIENTE
    await base44.entities.HistoricoCliente.create({
      empresa_id: empresaId,
      cliente_id: pedido.cliente_id,
      cliente_nome: pedido.cliente_nome,
      modulo_origem: "Comercial",
      referencia_id: pedido.id,
      referencia_tipo: "Pedido",
      referencia_numero: pedido.numero_pedido,
      tipo_evento: "Aprovacao",
      titulo_evento: "Pedido Aprovado e Processado",
      descricao_detalhada: `Pedido aprovado. ${resultados.reservasEstoque.length} baixas de estoque, ${resultados.opsGeradas.length} OPs geradas`,
      usuario_responsavel: "Sistema",
      data_evento: new Date().toISOString(),
      valor_relacionado: pedido.valor_total
    });

  } catch (error) {
    resultados.erros.push(`Erro geral: ${error.message}`);
  }

  return resultados;
}

/**
 * 2️⃣ VALIDAR LIMITE DE CRÉDITO
 */
async function validarLimiteCredito(pedido) {
  if (!pedido.cliente_id) {
    return { aprovado: true, motivo: "Sem cliente vinculado" };
  }

  const clientes = await base44.entities.Cliente.filter({ id: pedido.cliente_id });
  const cliente = clientes[0];

  if (!cliente) {
    return { aprovado: true, motivo: "Cliente não encontrado" };
  }

  const limiteTotal = cliente.condicao_comercial?.limite_credito || 0;
  const limiteUtilizado = cliente.condicao_comercial?.limite_credito_utilizado || 0;
  const limiteDisponivel = limiteTotal - limiteUtilizado;

  // Se tem override no pedido
  if (pedido.limite_credito_override) {
    return {
      aprovado: true,
      limite_total: limiteTotal,
      limite_utilizado: limiteUtilizado,
      limite_disponivel: limiteDisponivel,
      motivo: `Override aprovado: ${pedido.limite_credito_justificativa}`
    };
  }

  // Validação normal
  const aprovado = pedido.valor_total <= limiteDisponivel || limiteTotal === 0;

  return {
    aprovado,
    limite_total: limiteTotal,
    limite_utilizado: limiteUtilizado,
    limite_disponivel: limiteDisponivel,
    valor_pedido: pedido.valor_total,
    motivo: aprovado ? "Crédito aprovado" : "Limite insuficiente"
  };
}

/**
 * 3️⃣ BAIXAR ESTOQUE NA APROVAÇÃO (V21.5 - NOVO FLUXO)
 */
async function baixarEstoqueItemAprovacao(item, pedido, empresaId) {
  const produtos = await base44.entities.Produto.filter({
    id: item.produto_id,
    empresa_id: empresaId
  });

  const produto = produtos[0];

  if (!produto) {
    throw new Error("Produto não encontrado no estoque");
  }

  const estoqueAtual = produto.estoque_atual || 0;

  if (estoqueAtual < item.quantidade) {
    throw new Error(`Estoque insuficiente. Disponível: ${estoqueAtual} ${item.unidade}`);
  }

  const novoEstoque = estoqueAtual - item.quantidade;

  // Criar movimentação de saída imediata
  const movimentacao = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    tipo_movimento: "saida",
    origem_movimento: "pedido",
    origem_documento_id: pedido.id,
    produto_id: item.produto_id,
    produto_descricao: item.descricao || item.produto_descricao,
    codigo_produto: item.codigo_sku,
    quantidade: item.quantidade,
    unidade_medida: item.unidade,
    estoque_anterior: estoqueAtual,
    estoque_atual: novoEstoque,
    reservado_anterior: 0,
    reservado_atual: 0,
    disponivel_anterior: estoqueAtual,
    disponivel_atual: novoEstoque,
    data_movimentacao: new Date().toISOString(),
    documento: pedido.numero_pedido,
    motivo: `Baixa automática - Pedido ${pedido.numero_pedido} aprovado`,
    responsavel: "Sistema Automático",
    valor_unitario: item.preco_unitario || item.valor_unitario,
    valor_total: item.valor_total || (item.quantidade * (item.preco_unitario || 0)),
    aprovado: true
  });

  // Atualizar produto
  await base44.entities.Produto.update(item.produto_id, {
    estoque_atual: novoEstoque
  });

  return movimentacao;
}

/**
 * 4️⃣ GERAR OP AUTOMÁTICA
 */
async function gerarOPAutomatica(pedido, empresaId) {
  const numeroOP = `OP-${Date.now()}`;

  // Calcular materiais necessários
  const materiaisNecessarios = [];
  let pesoTotal = 0;

  for (const item of pedido.itens_producao || []) {
    // Ferro principal
    if (item.ferro_principal_bitola && item.ferro_principal_peso_kg) {
      materiaisNecessarios.push({
        bitola_id: item.ferro_principal_bitola,
        descricao: `Ferro ${item.ferro_principal_bitola}`,
        quantidade_kg: item.ferro_principal_peso_kg * item.quantidade,
        unidade: "KG"
      });
      pesoTotal += item.ferro_principal_peso_kg * item.quantidade;
    }

    // Estribo
    if (item.estribo_bitola && item.estribo_peso_kg) {
      materiaisNecessarios.push({
        bitola_id: item.estribo_bitola,
        descricao: `Estribo ${item.estribo_bitola}`,
        quantidade_kg: item.estribo_peso_kg * item.quantidade,
        unidade: "KG"
      });
      pesoTotal += item.estribo_peso_kg * item.quantidade;
    }
  }

  const op = await base44.entities.OrdemProducao.create({
    empresa_id: empresaId,
    numero_op: numeroOP,
    pedido_id: pedido.id,
    numero_pedido: pedido.numero_pedido,
    cliente_id: pedido.cliente_id,
    cliente_nome: pedido.cliente_nome,
    origem: "pedido",
    gerada_automaticamente: true,
    tipo_producao: "misto",
    data_emissao: new Date().toISOString().split('T')[0],
    data_prevista_inicio: new Date().toISOString().split('T')[0],
    data_prevista_conclusao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    prazo_dias: 7,
    prioridade: pedido.prioridade || "Normal",
    status: "Liberada",
    itens_producao: pedido.itens_producao,
    materiais_necessarios: materiaisNecessarios,
    peso_teorico_total_kg: pesoTotal,
    itens_total: pedido.itens_producao?.length || 0,
    itens_concluidos: 0,
    percentual_conclusao: 0,
    historico_status: [{
      status_anterior: null,
      status_novo: "Liberada",
      data_hora: new Date().toISOString(),
      usuario: "Sistema Automático",
      observacao: "OP gerada automaticamente na aprovação do pedido"
    }]
  });

  // Atualizar pedido com OP gerada
  await base44.entities.Pedido.update(pedido.id, {
    ordem_producao_ids: [...(pedido.ordem_producao_ids || []), op.id],
    status: "Em Produção"
  });

  return op;
}

/**
 * 5️⃣ GERAR CONTA A RECEBER
 */
async function gerarContaReceber(pedido, parcela, empresaId) {
  return await base44.entities.ContaReceber.create({
    empresa_id: empresaId,
    origem_tipo: "pedido",
    descricao: `Pedido ${pedido.numero_pedido} - Parcela ${parcela.numero_parcela}`,
    cliente: pedido.cliente_nome,
    cliente_id: pedido.cliente_id,
    pedido_id: pedido.id,
    valor: parcela.valor,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: parcela.data_vencimento,
    status: "Pendente",
    forma_recebimento: pedido.forma_pagamento,
    numero_parcela: parcela.numero_parcela.toString(),
    observacoes: `Gerado automaticamente do pedido ${pedido.numero_pedido}`
  });
}

/**
 * 6️⃣ ATUALIZAR LIMITE DE CRÉDITO DO CLIENTE
 */
async function atualizarLimiteCreditoCliente(clienteId, valor, operacao = 'adicionar') {
  const clientes = await base44.entities.Cliente.filter({ id: clienteId });
  const cliente = clientes[0];

  if (!cliente) return;

  const limiteAtual = cliente.condicao_comercial?.limite_credito_utilizado || 0;
  const novoLimite = operacao === 'adicionar' ? limiteAtual + valor : limiteAtual - valor;

  await base44.entities.Cliente.update(clienteId, {
    condicao_comercial: {
      ...(cliente.condicao_comercial || {}),
      limite_credito_utilizado: Math.max(0, novoLimite)
    }
  });
}

/**
 * 7️⃣ FATURAR PEDIDO → Baixa Estoque + Cria Entrega
 */
export async function faturarPedidoCompleto(pedido, nfe, empresaId) {
  const resultados = {
    baixasEstoque: [],
    entrega: null,
    erros: []
  };

  try {
    // 1. BAIXAR ESTOQUE (Itens de Revenda)
    if (pedido.itens_revenda?.length > 0) {
      for (const item of pedido.itens_revenda) {
        try {
          const baixa = await baixarEstoqueItem(item, pedido, empresaId);
          resultados.baixasEstoque.push(baixa);
        } catch (error) {
          resultados.erros.push(`Erro ao baixar ${item.descricao}: ${error.message}`);
        }
      }
    }

    // 2. CRIAR ENTREGA AUTOMATICAMENTE
    const entrega = await base44.entities.Entrega.create({
      empresa_id: empresaId,
      pedido_id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      nfe_id: nfe?.id,
      cliente_id: pedido.cliente_id,
      cliente_nome: pedido.cliente_nome,
      endereco_entrega_completo: pedido.endereco_entrega_principal,
      contato_entrega: pedido.contatos_cliente?.[0] || {},
      data_previsao: pedido.data_prevista_entrega,
      transportadora: pedido.transportadora,
      tipo_frete: pedido.tipo_frete,
      volumes: pedido.volumes,
      peso_total_kg: pedido.peso_total_kg,
      valor_frete: pedido.valor_frete,
      valor_mercadoria: pedido.valor_total,
      status: "Pronto para Expedir",
      prioridade: pedido.prioridade || "Normal",
      qr_code: `ENT-${Date.now()}`,
      historico_status: [{
        status: "Pronto para Expedir",
        data_hora: new Date().toISOString(),
        usuario: "Sistema Automático",
        observacao: "Entrega criada automaticamente no faturamento"
      }]
    });

    resultados.entrega = entrega;

    // 3. ATUALIZAR PEDIDO
    await base44.entities.Pedido.update(pedido.id, {
      status: "Faturado",
      ordem_expedicao_id: entrega.id,
      data_entrega_realizada: new Date().toISOString().split('T')[0]
    });

  } catch (error) {
    resultados.erros.push(`Erro no faturamento: ${error.message}`);
  }

  return resultados;
}

/**
 * 8️⃣ BAIXAR ESTOQUE
 */
async function baixarEstoqueItem(item, pedido, empresaId) {
  const produtos = await base44.entities.Produto.filter({
    id: item.produto_id,
    empresa_id: empresaId
  });

  const produto = produtos[0];

  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  // Liberar reserva primeiro
  const novoReservado = Math.max(0, (produto.estoque_reservado || 0) - item.quantidade);
  const novoEstoque = (produto.estoque_atual || 0) - item.quantidade;

  if (novoEstoque < 0) {
    throw new Error(`Estoque insuficiente para ${produto.descricao}`);
  }

  // Criar movimentação de saída
  const movimentacao = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    tipo_movimento: "liberacao_reserva",
    origem_movimento: "pedido",
    origem_documento_id: pedido.id,
    produto_id: item.produto_id,
    produto_descricao: item.descricao,
    codigo_produto: item.codigo_sku,
    quantidade: item.quantidade,
    unidade_medida: item.unidade,
    estoque_anterior: produto.estoque_atual,
    estoque_atual: novoEstoque,
    reservado_anterior: produto.estoque_reservado || 0,
    reservado_atual: novoReservado,
    data_movimentacao: new Date().toISOString(),
    documento: pedido.numero_pedido,
    motivo: `Baixa por faturamento - NF-e`,
    responsavel: "Sistema Automático"
  });

  // Atualizar produto
  await base44.entities.Produto.update(item.produto_id, {
    estoque_atual: novoEstoque,
    estoque_reservado: novoReservado
  });

  return movimentacao;
}

/**
 * 9️⃣ CONCLUIR OP → Liberar para Expedição
 */
export async function concluirOPCompleto(op, empresaId) {
  const resultados = {
    baixasMaterial: [],
    entrega: null,
    erros: []
  };

  try {
    // 1. BAIXAR MATERIAIS CONSUMIDOS (se configurado)
    if (op.materiais_necessarios?.length > 0) {
      for (const material of op.materiais_necessarios) {
        try {
          await baixarMaterialProducao(material, op, empresaId);
        } catch (error) {
          resultados.erros.push(`Material ${material.descricao}: ${error.message}`);
        }
      }
    }

    // 2. ATUALIZAR OP
    await base44.entities.OrdemProducao.update(op.id, {
      status: "Finalizada",
      data_conclusao_real: new Date().toISOString(),
      percentual_conclusao: 100,
      historico_status: [
        ...(op.historico_status || []),
        {
          status_anterior: op.status,
          status_novo: "Finalizada",
          data_hora: new Date().toISOString(),
          usuario: "Sistema",
          observacao: "OP concluída - material liberado para expedição"
        }
      ]
    });

    // 3. ATUALIZAR PEDIDO (se vinculado)
    if (op.pedido_id) {
      await base44.entities.Pedido.update(op.pedido_id, {
        status: "Pronto para Faturar"
      });
    }

  } catch (error) {
    resultados.erros.push(`Erro ao concluir OP: ${error.message}`);
  }

  return resultados;
}

/**
 * 🔟 BAIXAR MATERIAL DA PRODUÇÃO
 */
async function baixarMaterialProducao(material, op, empresaId) {
  const produtos = await base44.entities.Produto.filter({
    id: material.bitola_id || material.produto_id,
    empresa_id: empresaId
  });

  const produto = produtos[0];
  if (!produto) return;

  const novoEstoque = (produto.estoque_atual || 0) - material.quantidade_kg;

  await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    tipo_movimento: "saida",
    origem_movimento: "producao",
    origem_documento_id: op.id,
    produto_id: produto.id,
    produto_descricao: material.descricao,
    quantidade: material.quantidade_kg,
    unidade_medida: "KG",
    estoque_anterior: produto.estoque_atual,
    estoque_atual: novoEstoque,
    data_movimentacao: new Date().toISOString(),
    documento: op.numero_op,
    motivo: `Consumo na produção - OP ${op.numero_op}`,
    responsavel: "Sistema"
  });

  await base44.entities.Produto.update(produto.id, {
    estoque_atual: Math.max(0, novoEstoque)
  });
}

/**
 * 1️⃣1️⃣ CANCELAR PEDIDO → Libera Reservas + Cancela Contas
 */
export async function cancelarPedidoCompleto(pedido, empresaId) {
  const resultados = {
    reservasLiberadas: [],
    contasCanceladas: [],
    erros: []
  };

  try {
    // 1. LIBERAR RESERVAS DE ESTOQUE
    const movimentacoes = await base44.entities.MovimentacaoEstoque.filter({
      origem_documento_id: pedido.id,
      tipo_movimento: "reserva"
    });

    for (const mov of movimentacoes) {
      try {
        await liberarReservaEstoque(mov, empresaId);
        resultados.reservasLiberadas.push(mov);
      } catch (error) {
        resultados.erros.push(`Erro ao liberar reserva: ${error.message}`);
      }
    }

    // 2. CANCELAR CONTAS A RECEBER
    const contas = await base44.entities.ContaReceber.filter({
      pedido_id: pedido.id,
      status: "Pendente"
    });

    for (const conta of contas) {
      await base44.entities.ContaReceber.update(conta.id, {
        status: "Cancelado"
      });
      resultados.contasCanceladas.push(conta);
    }

    // 3. LIBERAR LIMITE DE CRÉDITO
    if (pedido.cliente_id) {
      await atualizarLimiteCreditoCliente(pedido.cliente_id, pedido.valor_total, 'remover');
    }

    // 4. ATUALIZAR PEDIDO
    await base44.entities.Pedido.update(pedido.id, {
      status: "Cancelado"
    });

  } catch (error) {
    resultados.erros.push(`Erro ao cancelar: ${error.message}`);
  }

  return resultados;
}

/**
 * 1️⃣2️⃣ LIBERAR RESERVA DE ESTOQUE
 */
async function liberarReservaEstoque(movimentacaoReserva, empresaId) {
  const produtos = await base44.entities.Produto.filter({
    id: movimentacaoReserva.produto_id,
    empresa_id: empresaId
  });

  const produto = produtos[0];
  if (!produto) return;

  // Criar movimentação de liberação
  await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    tipo_movimento: "liberacao_reserva",
    origem_movimento: "pedido",
    origem_documento_id: movimentacaoReserva.origem_documento_id,
    produto_id: produto.id,
    produto_descricao: produto.descricao,
    codigo_produto: produto.codigo,
    quantidade: movimentacaoReserva.quantidade,
    unidade_medida: produto.unidade_medida,
    estoque_anterior: produto.estoque_atual,
    estoque_atual: produto.estoque_atual,
    reservado_anterior: produto.estoque_reservado || 0,
    reservado_atual: Math.max(0, (produto.estoque_reservado || 0) - movimentacaoReserva.quantidade),
    data_movimentacao: new Date().toISOString(),
    documento: movimentacaoReserva.documento,
    motivo: "Liberação de reserva - pedido cancelado",
    responsavel: "Sistema"
  });

  // Atualizar produto
  await base44.entities.Produto.update(produto.id, {
    estoque_reservado: Math.max(0, (produto.estoque_reservado || 0) - movimentacaoReserva.quantidade)
  });
}

export default {
  aprovarPedidoCompleto,
  faturarPedidoCompleto,
  concluirOPCompleto,
  cancelarPedidoCompleto,
  validarLimiteCredito
};