import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * V21.7 - AUTOMAÇÃO 100% DO CICLO DE VIDA DO PEDIDO
 * 
 * SISTEMA INTELIGENTE DE TRANSIÇÕES AUTOMÁTICAS
 * Cada ação no sistema dispara automaticamente a próxima etapa do ciclo
 * 
 * REGRA-MÃE: Acrescentar • Reorganizar • Conectar • Melhorar
 */

// 🔥 GATILHO 1: APROVAÇÃO → BAIXA ESTOQUE AUTOMÁTICA
export async function gatilhoAprovacao(pedidoId) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return;

    // Baixar estoque de revenda
    if (pedido.itens_revenda?.length > 0) {
      for (const item of pedido.itens_revenda) {
        if (!item.produto_id) continue;

        const [produto] = await base44.entities.Produto.filter({
          id: item.produto_id,
          empresa_id: pedido.empresa_id
        });

        if (!produto) continue;

        const qtd = item.quantidade || 0;
        const estoqueDisponivel = (produto.estoque_atual || 0) - (produto.estoque_reservado || 0);

        if (estoqueDisponivel < qtd) {
          throw new Error(`❌ Estoque insuficiente: ${produto.descricao} (disponível: ${estoqueDisponivel}, necessário: ${qtd})`);
        }

        const novoEstoque = (produto.estoque_atual || 0) - qtd;

        await base44.entities.MovimentacaoEstoque.create({
          empresa_id: pedido.empresa_id,
          tipo_movimento: 'saida',
          origem_movimento: 'pedido',
          origem_documento_id: pedidoId,
          produto_id: item.produto_id,
          produto_descricao: item.descricao || item.produto_descricao,
          codigo_produto: item.codigo_sku,
          quantidade: qtd,
          unidade_medida: item.unidade,
          estoque_anterior: produto.estoque_atual || 0,
          estoque_atual: novoEstoque,
          data_movimentacao: new Date().toISOString(),
          documento: pedido.numero_pedido,
          motivo: `🤖 Baixa automática - Aprovação do pedido`,
          responsavel: 'Sistema Automático',
          aprovado: true
        });

        await base44.entities.Produto.update(item.produto_id, {
          estoque_atual: novoEstoque
        });
      }
    }

    // 🔥 TRANSIÇÃO AUTOMÁTICA: APROVADO → PRONTO PARA FATURAR
    await base44.entities.Pedido.update(pedidoId, {
      status: 'Pronto para Faturar'
    });

    await registrarAuditoria(pedido, 'Aprovado', 'Pronto para Faturar', '🤖 Transição automática após baixa de estoque');

    toast.success('✅ Estoque baixado! Pedido automaticamente movido para "Pronto para Faturar"');
    
    return true;
  } catch (error) {
    toast.error(error.message || '❌ Erro na automação de aprovação');
    return false;
  }
}

// 🔥 GATILHO 2: FATURAMENTO → GERA FINANCEIRO AUTOMÁTICO
export async function gatilhoFaturamento(pedidoId, nfeId = null) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return;

    const numParcelas = pedido.numero_parcelas || 1;
    const valorParcela = pedido.valor_total / numParcelas;
    const intervalo = pedido.intervalo_parcelas || 30;

    // Gerar títulos a receber
    for (let i = 0; i < numParcelas; i++) {
      const dataVencimento = new Date(pedido.data_pedido);
      dataVencimento.setDate(dataVencimento.getDate() + (intervalo * i));

      await base44.entities.ContaReceber.create({
        empresa_id: pedido.empresa_id,
        origem_tipo: 'pedido',
        pedido_id: pedidoId,
        nota_fiscal_id: nfeId,
        descricao: `🤖 Auto: Pedido ${pedido.numero_pedido} - Parcela ${i + 1}/${numParcelas}`,
        cliente: pedido.cliente_nome,
        cliente_id: pedido.cliente_id,
        numero_parcela: `${i + 1}/${numParcelas}`,
        valor: valorParcela,
        data_emissao: pedido.data_pedido,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status: 'Pendente',
        forma_recebimento: pedido.forma_pagamento,
        forma_cobranca: pedido.forma_pagamento === 'Boleto' ? 'Boleto' : 
                        pedido.forma_pagamento === 'PIX' ? 'PIX' : 'Não Definida',
        numero_documento: `${pedido.numero_pedido}-${i + 1}`,
        visivel_no_portal: true
      });
    }

    // 🔥 TRANSIÇÃO AUTOMÁTICA: FATURADO → EM EXPEDIÇÃO
    await base44.entities.Pedido.update(pedidoId, {
      status: 'Em Expedição'
    });

    await registrarAuditoria(pedido, 'Faturado', 'Em Expedição', `🤖 Gerados ${numParcelas} título(s) automaticamente`);

    toast.success(`✅ ${numParcelas} título(s) gerado(s)! Pedido movido para "Em Expedição"`);
    
    return true;
  } catch (error) {
    toast.error('❌ Erro na automação de faturamento');
    return false;
  }
}

// 🔥 GATILHO 3: EXPEDIÇÃO → CRIA ENTREGA AUTOMÁTICA
export async function gatilhoExpedicao(pedidoId) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return;

    // Criar entrega apenas se não for retirada
    if (pedido.tipo_frete !== 'Retirada') {
      await base44.entities.Entrega.create({
        empresa_id: pedido.empresa_id,
        pedido_id: pedidoId,
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        endereco_entrega_completo: pedido.endereco_entrega_principal || {},
        contato_entrega: pedido.contatos_cliente?.[0] ? {
          nome: pedido.cliente_nome,
          telefone: pedido.contatos_cliente[0].valor
        } : {},
        data_previsao: pedido.data_prevista_entrega,
        data_separacao: new Date().toISOString(),
        tipo_frete: pedido.tipo_frete,
        valor_frete: pedido.valor_frete || 0,
        peso_total_kg: pedido.peso_total_kg || 0,
        valor_mercadoria: pedido.valor_total || 0,
        volumes: Math.ceil((pedido.peso_total_kg || 0) / 50), // Estima volumes
        status: 'Pronto para Expedir',
        prioridade: pedido.prioridade || 'Normal',
        rastreamento_habilitado: true,
        qr_code: `QR-${pedido.numero_pedido}-${Date.now()}`
      });
    }

    await registrarAuditoria(pedido, 'Em Expedição', 'Em Expedição', '🤖 Entrega criada automaticamente');

    toast.success('✅ Entrega criada automaticamente!');
    
    return true;
  } catch (error) {
    toast.error('❌ Erro na criação automática de entrega');
    return false;
  }
}

// 🔥 GATILHO 4: SAÍDA DO VEÍCULO → EM TRÂNSITO AUTOMÁTICO
export async function gatilhoSaidaVeiculo(entregaId) {
  try {
    const [entrega] = await base44.entities.Entrega.filter({ id: entregaId });
    if (!entrega || !entrega.pedido_id) return;

    await base44.entities.Entrega.update(entregaId, {
      status: 'Em Trânsito',
      data_saida: new Date().toISOString()
    });

    await base44.entities.Pedido.update(entrega.pedido_id, {
      status: 'Em Trânsito'
    });

    await registrarAuditoriaEntrega(entrega, 'Saiu para Entrega', 'Em Trânsito');

    toast.success('🚚 Pedido automaticamente movido para "Em Trânsito"');
    
    return true;
  } catch (error) {
    toast.error('❌ Erro ao atualizar status');
    return false;
  }
}

// 🔥 GATILHO 5: COMPROVANTE REGISTRADO → ENTREGUE AUTOMÁTICO
export async function gatilhoComprovanteEntrega(entregaId, comprovante) {
  try {
    const [entrega] = await base44.entities.Entrega.filter({ id: entregaId });
    if (!entrega || !entrega.pedido_id) return;

    await base44.entities.Entrega.update(entregaId, {
      status: 'Entregue',
      data_entrega: new Date().toISOString(),
      comprovante_entrega: comprovante
    });

    await base44.entities.Pedido.update(entrega.pedido_id, {
      status: 'Entregue'
    });

    await registrarAuditoriaEntrega(entrega, 'Em Trânsito', 'Entregue');

    toast.success('🎉 Pedido automaticamente marcado como "Entregue"');
    
    return true;
  } catch (error) {
    toast.error('❌ Erro ao confirmar entrega');
    return false;
  }
}

// 🔥 GATILHO 6: RETIRADA CONFIRMADA → ENTREGUE AUTOMÁTICO
export async function gatilhoRetirada(pedidoId, dadosRecebedor) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return;

    // Criar entrega de retirada
    await base44.entities.Entrega.create({
      empresa_id: pedido.empresa_id,
      pedido_id: pedidoId,
      numero_pedido: pedido.numero_pedido,
      cliente_id: pedido.cliente_id,
      cliente_nome: pedido.cliente_nome,
      tipo_frete: 'Retirada',
      status: 'Entregue',
      data_entrega: new Date().toISOString(),
      comprovante_entrega: {
        nome_recebedor: dadosRecebedor.nome,
        documento_recebedor: dadosRecebedor.documento,
        data_hora_recebimento: new Date().toISOString(),
        observacoes_recebimento: dadosRecebedor.observacoes
      }
    });

    await base44.entities.Pedido.update(pedidoId, {
      status: 'Entregue'
    });

    await registrarAuditoria(pedido, pedido.status, 'Entregue', '🤖 Retirada confirmada automaticamente');

    toast.success('✅ Retirada confirmada! Pedido finalizado automaticamente');
    
    return true;
  } catch (error) {
    toast.error('❌ Erro ao confirmar retirada');
    return false;
  }
}

// 🔥 GATILHO 7: AUTO-FATURAMENTO (NF-e Simulada)
export async function gatilhoAutoFaturamento(pedidoId) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return;

    // Criar NF-e simulada/homologação
    const nfe = await base44.entities.NotaFiscal.create({
      numero: `AUTO-${Date.now()}`,
      serie: '1',
      tipo: 'NF-e (Saída)',
      natureza_operacao: pedido.natureza_operacao || 'Venda de mercadoria',
      cliente_fornecedor: pedido.cliente_nome,
      cliente_fornecedor_id: pedido.cliente_id,
      cliente_cpf_cnpj: pedido.cliente_cpf_cnpj,
      pedido_id: pedidoId,
      numero_pedido: pedido.numero_pedido,
      empresa_faturamento_id: pedido.empresa_id,
      data_emissao: new Date().toISOString().split('T')[0],
      data_saida: new Date().toISOString().split('T')[0],
      valor_produtos: pedido.valor_produtos || 0,
      valor_desconto: pedido.desconto_geral_pedido_valor || 0,
      valor_frete: pedido.valor_frete || 0,
      valor_total: pedido.valor_total || 0,
      ambiente: 'Homologação',
      status: 'Autorizada',
      chave_acesso: `AUTO${Date.now()}${Math.random().toString(36).substring(7)}`,
      itens: (pedido.itens_revenda || []).map((item, idx) => ({
        numero_item: idx + 1,
        produto_id: item.produto_id,
        codigo_produto: item.codigo_sku,
        descricao: item.descricao,
        ncm: '7308.90.90',
        cfop: pedido.cfop_pedido || '5102',
        unidade: item.unidade,
        quantidade: item.quantidade,
        valor_unitario: item.preco_unitario,
        valor_total: item.valor_item
      }))
    });

    // 🔥 GATILHO AUTOMÁTICO DE FATURAMENTO
    await gatilhoFaturamento(pedidoId, nfe.id);

    await registrarAuditoria(pedido, 'Pronto para Faturar', 'Faturado', '🤖 NF-e gerada automaticamente');

    toast.success('✅ NF-e gerada! Financeiro criado! Movido para "Em Expedição"');
    
    return nfe.id;
  } catch (error) {
    toast.error('❌ Erro no auto-faturamento');
    return null;
  }
}

// 🔥 GATILHO 8: AUTO-EXPEDIÇÃO (Cria entrega e avança)
export async function gatilhoAutoExpedicao(pedidoId) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return;

    await gatilhoExpedicao(pedidoId);

    // 🚀 SE FOR RETIRADA, VAI DIRETO PARA "PRONTO PARA RETIRADA"
    if (pedido.tipo_frete === 'Retirada') {
      await base44.entities.Pedido.update(pedidoId, {
        status: 'Pronto para Retirada'
      });
      
      await registrarAuditoria(pedido, 'Em Expedição', 'Pronto para Retirada', '🤖 Auto: Pedido retirada pronto');
      toast.success('📦 Pedido pronto para retirada!');
    } else {
      // SE FOR ENTREGA, CRIA A ENTREGA E VAI PARA "EM TRÂNSITO" SIMULADO
      await base44.entities.Pedido.update(pedidoId, {
        status: 'Em Trânsito'
      });
      
      await registrarAuditoria(pedido, 'Em Expedição', 'Em Trânsito', '🤖 Auto: Veículo saiu automaticamente');
      toast.success('🚚 Pedido em trânsito automaticamente!');
    }

    return true;
  } catch (error) {
    toast.error('❌ Erro na auto-expedição');
    return false;
  }
}

// 🔥 ORQUESTRADOR INTELIGENTE - Decide próxima etapa automaticamente
export async function orquestrarProximaEtapa(pedidoId) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return null;

    let proximaEtapa = null;
    let acao = null;

    switch (pedido.status) {
      case 'Rascunho':
        if (pedido.desconto_geral_pedido_percentual === 0 || pedido.status_aprovacao === 'aprovado') {
          proximaEtapa = '🤖 Auto: Aprovar → Baixar Estoque';
          acao = async () => await gatilhoAprovacao(pedidoId);
        } else {
          proximaEtapa = '⏳ Aguardando Aprovação de Desconto';
        }
        break;

      case 'Aguardando Aprovação':
        proximaEtapa = '⏳ Aguardando gerência aprovar desconto';
        break;

      case 'Aprovado':
        proximaEtapa = '✅ Já avançado para Pronto p/ Faturar';
        break;

      case 'Pronto para Faturar':
        proximaEtapa = '🤖 Auto: Emitir NF-e → Gerar Financeiro';
        acao = async () => await gatilhoAutoFaturamento(pedidoId);
        break;

      case 'Faturado':
        proximaEtapa = '✅ Já avançado para Em Expedição';
        break;

      case 'Em Expedição':
        proximaEtapa = '🤖 Auto: Criar Entrega → Em Trânsito';
        acao = async () => await gatilhoAutoExpedicao(pedidoId);
        break;

      case 'Em Trânsito':
        proximaEtapa = '⏳ Aguardando confirmação de entrega';
        break;

      case 'Pronto para Retirada':
        proximaEtapa = '⏳ Aguardando cliente retirar';
        break;

      case 'Entregue':
        proximaEtapa = '🎉 Ciclo 100% Finalizado';
        break;

      default:
        proximaEtapa = 'N/A';
    }

    return { proximaEtapa, acao };
  } catch (error) {
    console.error('Erro no orquestrador:', error);
    return null;
  }
}

// 🔥 FUNÇÃO AUXILIAR: Registrar Auditoria
async function registrarAuditoria(pedido, statusAnterior, statusNovo, descricao) {
  try {
    const user = await base44.auth.me();
    
    await base44.entities.AuditLog.create({
      usuario_id: user.id,
      usuario: user.full_name,
      empresa_id: pedido.empresa_id,
      acao: 'Automação de Ciclo',
      modulo: 'Comercial',
      entidade: 'Pedido',
      registro_id: pedido.id,
      descricao,
      data_hora: new Date().toISOString(),
      dados_anteriores: { status: statusAnterior },
      dados_novos: { status: statusNovo },
      sucesso: true
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

async function registrarAuditoriaEntrega(entrega, statusAnterior, statusNovo) {
  try {
    const user = await base44.auth.me();
    
    await base44.entities.AuditLog.create({
      usuario_id: user.id,
      usuario: user.full_name,
      empresa_id: entrega.empresa_id,
      acao: 'Automação de Entrega',
      modulo: 'Expedição',
      entidade: 'Entrega',
      registro_id: entrega.id,
      descricao: `🤖 Transição automática: ${statusAnterior} → ${statusNovo}`,
      data_hora: new Date().toISOString(),
      dados_anteriores: { status: statusAnterior },
      dados_novos: { status: statusNovo },
      sucesso: true
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

// 🔥 VALIDADOR PRÉ-TRANSIÇÃO
export async function validarTransicao(pedidoId, statusDestino) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return { valido: false, motivo: 'Pedido não encontrado' };

    const validacoes = {
      'Aprovado': () => {
        if (!pedido.cliente_id) return { valido: false, motivo: 'Cliente não informado' };
        if (!pedido.itens_revenda?.length && !pedido.itens_armado_padrao?.length && !pedido.itens_corte_dobra?.length) {
          return { valido: false, motivo: 'Sem itens no pedido' };
        }
        return { valido: true };
      },
      'Pronto para Faturar': () => {
        return { valido: true };
      },
      'Faturado': () => {
        if (!pedido.forma_pagamento) return { valido: false, motivo: 'Forma de pagamento não definida' };
        return { valido: true };
      },
      'Em Expedição': () => {
        if (pedido.tipo_frete !== 'Retirada' && !pedido.endereco_entrega_principal?.logradouro) {
          return { valido: false, motivo: 'Endereço de entrega não informado' };
        }
        return { valido: true };
      }
    };

    const validador = validacoes[statusDestino];
    if (!validador) return { valido: true };

    return validador();
  } catch (error) {
    return { valido: false, motivo: error.message };
  }
}

// 🔥 EXECUÇÃO AUTOMÁTICA COMPLETA DO CICLO
export async function executarCicloAutomatico(pedidoId, maxIteracoes = 10) {
  let iteracao = 0;
  
  while (iteracao < maxIteracoes) {
    try {
      const resultado = await orquestrarProximaEtapa(pedidoId);
      
      if (!resultado?.acao) {
        console.log('Ciclo automático finalizado:', resultado?.proximaEtapa);
        break;
      }

      console.log(`🤖 Executando automação ${iteracao + 1}:`, resultado.proximaEtapa);
      await resultado.acao();
      
      // Aguardar 1 segundo entre transições
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      iteracao++;
    } catch (error) {
      console.error('Erro no ciclo automático:', error);
      break;
    }
  }
  
  return iteracao;
}

// 🚀 MEGA AUTOMAÇÃO: RASCUNHO → ENTREGUE (TUDO DE UMA VEZ)
export async function executarCicloCompletoIntegral(pedidoId) {
  try {
    const [pedido] = await base44.entities.Pedido.filter({ id: pedidoId });
    if (!pedido) return { sucesso: false, erro: 'Pedido não encontrado' };

    const etapasExecutadas = [];
    let statusAtual = pedido.status;

    // ETAPA 1: APROVAR (se necessário)
    if (statusAtual === 'Rascunho' || statusAtual === 'Aguardando Aprovação') {
      const validacao = await validarTransicao(pedidoId, 'Aprovado');
      if (!validacao.valido) {
        return { sucesso: false, erro: validacao.motivo };
      }

      await gatilhoAprovacao(pedidoId);
      etapasExecutadas.push('Aprovado → Estoque Baixado → Pronto p/ Faturar');
      statusAtual = 'Pronto para Faturar';
      await new Promise(r => setTimeout(r, 1000));
    }

    // ETAPA 2: FATURAR (automático)
    if (statusAtual === 'Pronto para Faturar') {
      await gatilhoAutoFaturamento(pedidoId);
      etapasExecutadas.push('NF-e Gerada → Financeiro Criado → Em Expedição');
      statusAtual = 'Em Expedição';
      await new Promise(r => setTimeout(r, 1000));
    }

    // ETAPA 3: EXPEDIR (automático)
    if (statusAtual === 'Em Expedição' || statusAtual === 'Faturado') {
      await gatilhoAutoExpedicao(pedidoId);
      etapasExecutadas.push('Entrega Criada → Em Trânsito/Pronto p/ Retirada');
      statusAtual = pedido.tipo_frete === 'Retirada' ? 'Pronto para Retirada' : 'Em Trânsito';
    }

    toast.success(`🎉 Ciclo automático executado! ${etapasExecutadas.length} etapas concluídas`);

    return { 
      sucesso: true, 
      etapasExecutadas,
      statusFinal: statusAtual
    };
  } catch (error) {
    return { 
      sucesso: false, 
      erro: error.message 
    };
  }
}