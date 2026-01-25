/**
 * ETAPA 3: Helper de Integração Completa
 * Orquestra todas as integrações automáticas
 */

import { base44 } from '@/api/base44Client';

/**
 * Confirmar entrega com cascata completa
 * 1. Atualizar status entrega
 * 2. Baixar estoque automaticamente
 * 3. Registrar custo frete
 * 4. Enviar notificação
 * 5. Criar auditoria
 */
export async function confirmarEntregaCompleta(entrega, pedido, comprovanteData, user) {
  const resultados = {
    entrega: null,
    movimentacoes: [],
    conta_pagar: null,
    notificacao: null,
    auditoria: null,
    erros: []
  };

  try {
    // 1. Atualizar Entrega com comprovante
    const entregaAtualizada = await base44.entities.Entrega.update(entrega.id, {
      status: 'Entregue',
      data_entrega: new Date().toISOString(),
      comprovante_entrega: {
        ...comprovanteData,
        data_hora_recebimento: new Date().toISOString()
      },
      historico_status: [
        ...(entrega.historico_status || []),
        {
          status: 'Entregue',
          data_hora: new Date().toISOString(),
          usuario: user?.full_name || 'Motorista',
          observacao: 'Entrega confirmada com POD digital'
        }
      ]
    });
    resultados.entrega = entregaAtualizada;

    // 2. Baixar Estoque Automaticamente
    if (pedido?.itens_revenda?.length > 0) {
      for (const item of pedido.itens_revenda) {
        if (item.produto_id) {
          try {
            const produtos = await base44.entities.Produto.filter({ 
              id: item.produto_id,
              empresa_id: pedido.empresa_id 
            });
            
            const produto = produtos[0];
            if (produto && (produto.estoque_atual || 0) >= (item.quantidade || 0)) {
              const novoEstoque = (produto.estoque_atual || 0) - (item.quantidade || 0);
              
              const mov = await base44.entities.MovimentacaoEstoque.create({
                empresa_id: pedido.empresa_id,
                tipo_movimento: "saida",
                origem_movimento: "pedido",
                origem_documento_id: pedido.id,
                produto_id: item.produto_id,
                produto_descricao: item.descricao || item.produto_descricao,
                quantidade: item.quantidade,
                unidade_medida: item.unidade,
                estoque_anterior: produto.estoque_atual || 0,
                estoque_atual: novoEstoque,
                data_movimentacao: new Date().toISOString(),
                documento: pedido.numero_pedido,
                motivo: "Entrega confirmada - Baixa automática ETAPA 3",
                responsavel: user?.full_name || 'Sistema',
                responsavel_id: user?.id,
                aprovado: true
              });
              
              await base44.entities.Produto.update(item.produto_id, {
                estoque_atual: novoEstoque
              });

              resultados.movimentacoes.push(mov);
            }
          } catch (err) {
            resultados.erros.push(`Estoque produto ${item.produto_id}: ${err.message}`);
          }
        }
      }
    }

    // 3. Registrar Custo de Frete (se aplicável)
    if (pedido?.valor_frete > 0) {
      try {
        const conta = await base44.entities.ContaPagar.create({
          empresa_id: pedido.empresa_id,
          origem: 'empresa',
          origem_tipo: 'tarifa',
          canal_origem: 'Automático',
          descricao: `Frete - Entrega ${pedido.numero_pedido}`,
          categoria: 'Transporte',
          valor: pedido.valor_frete,
          data_emissao: new Date().toISOString(),
          data_vencimento: new Date().toISOString(),
          status: 'Pendente',
          pedido_id: pedido.id,
          observacoes: 'Gerado automaticamente pela confirmação de entrega - ETAPA 3'
        });
        resultados.conta_pagar = conta;
      } catch (err) {
        resultados.erros.push(`Custo frete: ${err.message}`);
      }
    }

    // 4. Enviar Notificação
    try {
      await base44.functions.invoke('notificarStatusEntrega', {
        entrega_id: entrega.id,
        pedido_id: pedido.id,
        novo_status: 'Entregue',
        canal: 'email'
      });
      resultados.notificacao = 'Enviada';
    } catch (err) {
      resultados.erros.push(`Notificação: ${err.message}`);
    }

    // 5. Criar Auditoria
    try {
      const audit = await base44.entities.AuditLog.create({
        usuario: user?.full_name || 'Motorista',
        usuario_id: user?.id,
        empresa_id: pedido.empresa_id,
        acao: 'Criação',
        modulo: 'Expedição',
        entidade: 'Entrega',
        registro_id: entrega.id,
        descricao: `Entrega confirmada - POD digital capturado - ETAPA 3`,
        dados_novos: {
          comprovante: comprovanteData,
          movimentacoes: resultados.movimentacoes.length,
          custo_frete: resultados.conta_pagar ? pedido.valor_frete : 0
        },
        data_hora: new Date().toISOString()
      });
      resultados.auditoria = audit;
    } catch (err) {
      resultados.erros.push(`Auditoria: ${err.message}`);
    }

  } catch (err) {
    resultados.erros.push(`Erro geral: ${err.message}`);
  }

  return resultados;
}

/**
 * Processar logística reversa completa
 * 1. Atualizar entrega
 * 2. Devolver estoque
 * 3. Bloquear/ajustar financeiro
 * 4. Notificar gestor
 */
export async function processarReversaCompleta(entrega, pedido, dadosReversa, user) {
  const resultados = {
    entrega: null,
    movimentacao: null,
    financeiro: null,
    notificacao: null,
    erros: []
  };

  try {
    // 1. Atualizar Entrega
    const entregaAtualizada = await base44.entities.Entrega.update(entrega.id, {
      status: 'Devolvido',
      logistica_reversa: {
        ativada: true,
        ...dadosReversa,
        data_ocorrencia: new Date().toISOString(),
        responsavel: user?.full_name || 'Motorista'
      }
    });
    resultados.entrega = entregaAtualizada;

    // 2. Devolver Estoque
    if (pedido?.itens_revenda?.length > 0 && dadosReversa.quantidade_devolvida > 0) {
      try {
        const item = pedido.itens_revenda[0]; // Simplificado
        const produtos = await base44.entities.Produto.filter({ id: item.produto_id });
        const produto = produtos[0];

        if (produto) {
          const novoEstoque = (produto.estoque_atual || 0) + dadosReversa.quantidade_devolvida;
          
          const mov = await base44.entities.MovimentacaoEstoque.create({
            empresa_id: pedido.empresa_id,
            tipo_movimento: "entrada",
            origem_movimento: "devolucao",
            origem_documento_id: entrega.id,
            produto_id: item.produto_id,
            produto_descricao: item.descricao,
            quantidade: dadosReversa.quantidade_devolvida,
            unidade_medida: item.unidade,
            estoque_anterior: produto.estoque_atual || 0,
            estoque_atual: novoEstoque,
            data_movimentacao: new Date().toISOString(),
            documento: `REVERSA-${entrega.id}`,
            motivo: `Logística Reversa: ${dadosReversa.motivo}`,
            responsavel: user?.full_name || 'Sistema',
            aprovado: true
          });

          await base44.entities.Produto.update(item.produto_id, {
            estoque_atual: novoEstoque
          });

          resultados.movimentacao = mov;
        }
      } catch (err) {
        resultados.erros.push(`Estoque: ${err.message}`);
      }
    }

    // 3. Bloquear Financeiro (ContaReceber)
    if (dadosReversa.valor_devolvido > 0) {
      try {
        const contas = await base44.entities.ContaReceber.filter({ pedido_id: pedido.id });
        if (contas.length > 0) {
          for (const conta of contas) {
            await base44.entities.ContaReceber.update(conta.id, {
              observacoes: `${conta.observacoes || ''}\n\nREVERSA: R$ ${dadosReversa.valor_devolvido.toFixed(2)} devolvido - ${dadosReversa.motivo}`
            });
          }
        }
        resultados.financeiro = 'Bloqueado/Ajustado';
      } catch (err) {
        resultados.erros.push(`Financeiro: ${err.message}`);
      }
    }

    // 4. Notificar Gestor
    try {
      await base44.integrations.Core.SendEmail({
        to: user?.email || 'admin@sistema.com',
        subject: `⚠️ Logística Reversa - ${pedido.numero_pedido}`,
        body: `
          Logística reversa ativada:<br/>
          Pedido: ${pedido.numero_pedido}<br/>
          Cliente: ${pedido.cliente_nome}<br/>
          Motivo: ${dadosReversa.motivo}<br/>
          Quantidade devolvida: ${dadosReversa.quantidade_devolvida}<br/>
          Valor devolvido: R$ ${dadosReversa.valor_devolvido?.toFixed(2) || 0}<br/>
          Estoque: ${resultados.movimentacao ? 'Devolvido' : 'Não processado'}<br/>
          Financeiro: ${resultados.financeiro || 'Não processado'}
        `
      });
      resultados.notificacao = 'Enviada';
    } catch (err) {
      resultados.erros.push(`Notificação: ${err.message}`);
    }

  } catch (err) {
    resultados.erros.push(`Erro geral: ${err.message}`);
  }

  return resultados;
}