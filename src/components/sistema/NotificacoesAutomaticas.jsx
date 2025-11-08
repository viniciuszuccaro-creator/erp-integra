
import { base44 } from '@/api/base44Client';
import WhatsAppBusinessEngine from './WhatsAppBusinessEngine';

/**
 * Sistema de Notificações Automáticas
 * Envia notificações por eventos do sistema
 */

export const NotificacoesAutomaticas = {
  /**
   * Notificar aprovação de pedido
   */
  async notificarPedidoAprovado(pedido) {
    const cliente = await base44.entities.Cliente.get(pedido.cliente_id);
    
    // Criar notificação no sistema
    await base44.entities.Notificacao.create({
      titulo: '✅ Pedido Aprovado',
      mensagem: `Seu pedido ${pedido.numero_pedido} foi aprovado e está em produção!`,
      tipo: 'sucesso',
      categoria: 'Comercial',
      prioridade: 'Normal',
      destinatario_id: cliente.portal_usuario_id,
      link_acao: `/pedidos/${pedido.id}`,
      entidade_relacionada: 'Pedido',
      registro_id: pedido.id
    });

    // Enviar WhatsApp se configurado
    if (cliente.canal_preferencial === 'WhatsApp') {
      await WhatsAppBusinessEngine.enviarPedidoAprovado(pedido, cliente);
    }

    return true;
  },

  /**
   * Notificar saída para entrega
   */
  async notificarSaidaEntrega(entrega) {
    const cliente = await base44.entities.Cliente.get(entrega.cliente_id);
    
    const linkRastreamento = entrega.qr_code 
      ? `https://app.erpzuccaro.com/rastreamento/${entrega.qr_code}`
      : null;

    await base44.entities.Notificacao.create({
      titulo: '🚚 Entrega Saiu para Transporte',
      mensagem: `Seu pedido ${entrega.numero_pedido} saiu para entrega!\n\nMotorista: ${entrega.motorista}\nPrevisão: ${new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}${linkRastreamento ? `\n\nRastreie: ${linkRastreamento}` : ''}`,
      tipo: 'info',
      categoria: 'Comercial',
      prioridade: 'Alta',
      destinatario_id: cliente.portal_usuario_id,
      link_acao: linkRastreamento,
      entidade_relacionada: 'Entrega',
      registro_id: entrega.id
    });

    // NOVO: Enviar WhatsApp
    if (cliente.canal_preferencial === 'WhatsApp') {
      await WhatsAppBusinessEngine.enviarRastreamentoEntrega(entrega, cliente);
    }

    return true;
  },

  /**
   * Notificar entrega realizada
   */
  async notificarEntregaRealizada(entrega) {
    const cliente = await base44.entities.Cliente.get(entrega.cliente_id);
    
    await base44.entities.Notificacao.create({
      titulo: '✅ Entrega Concluída',
      mensagem: `Seu pedido ${entrega.numero_pedido} foi entregue com sucesso!\n\nRecebido por: ${entrega.comprovante_entrega?.nome_recebedor || '-'}\nData: ${new Date(entrega.data_entrega).toLocaleString('pt-BR')}`,
      tipo: 'sucesso',
      categoria: 'Comercial',
      prioridade: 'Normal',
      destinatario_id: cliente.portal_usuario_id,
      entidade_relacionada: 'Entrega',
      registro_id: entrega.id
    });

    // NOVO: Enviar WhatsApp
    if (cliente.canal_preferencial === 'WhatsApp') {
      await WhatsAppBusinessEngine.enviarEntregaRealizada(entrega, cliente);
    }

    return true;
  },

  /**
   * Notificar cobrança vencendo
   */
  async notificarCobrancaVencendo(contaReceber, diasAntecedencia = 3) {
    const cliente = await base44.entities.Cliente.get(contaReceber.cliente_id);
    
    await base44.entities.Notificacao.create({
      titulo: diasAntecedencia > 0 ? '💰 Cobrança Vencendo' : diasAntecedencia === 0 ? '⏰ Cobrança Vence Hoje' : '🚨 Título Vencido',
      mensagem: diasAntecedencia > 0 
        ? `Você tem um título vencendo em ${diasAntecedencia} dias!\n\nValor: R$ ${contaReceber.valor?.toLocaleString('pt-BR')}\nVencimento: ${new Date(contaReceber.data_vencimento).toLocaleDateString('pt-BR')}${contaReceber.linha_digitavel ? `\n\nBoleto: ${contaReceber.linha_digitavel}` : ''}`
        : diasAntecedencia === 0
        ? `Seu título vence HOJE!\n\nValor: R$ ${contaReceber.valor?.toLocaleString('pt-BR')}`
        : `Título vencido há ${Math.abs(diasAntecedencia)} dia(s)!\n\nValor: R$ ${contaReceber.valor?.toLocaleString('pt-BR')}\n\nPor favor, regularize sua situação.`,
      tipo: diasAntecedencia < 0 ? 'urgente' : diasAntecedencia === 0 ? 'aviso' : 'info',
      categoria: 'Financeiro',
      prioridade: diasAntecedencia < 0 ? 'Urgente' : 'Alta',
      destinatario_id: cliente.portal_usuario_id,
      entidade_relacionada: 'ContaReceber',
      registro_id: contaReceber.id
    });

    // NOVO: Enviar WhatsApp
    if (cliente.canal_preferencial === 'WhatsApp' || diasAntecedencia < 0) {
      await WhatsAppBusinessEngine.enviarCobranca(contaReceber, cliente);
    }

    return true;
  },

  /**
   * Notificar OP criada
   */
  async notificarOPCriada(op) {
    // Notificar operador responsável
    if (op.operador_responsavel_id) {
      await base44.entities.Notificacao.create({
        titulo: '🏭 Nova OP Atribuída',
        mensagem: `Você recebeu uma nova Ordem de Produção!\n\nOP: ${op.numero_op}\nCliente: ${op.cliente_nome}\nPrazo: ${new Date(op.data_prevista_conclusao).toLocaleDateString('pt-BR')}`,
        tipo: 'info',
        categoria: 'Geral',
        prioridade: op.prioridade === 'Urgente' ? 'Urgente' : 'Normal',
        destinatario_id: op.operador_responsavel_id,
        entidade_relacionada: 'OrdemProducao',
        registro_id: op.id
      });
    }

    return true;
  }
};

export default NotificacoesAutomaticas;
