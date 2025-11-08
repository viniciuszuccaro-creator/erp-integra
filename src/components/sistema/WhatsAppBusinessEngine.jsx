import { base44 } from '@/api/base44Client';

/**
 * WhatsApp Business Engine
 * Sistema de envio automático de mensagens WhatsApp
 */

export const WhatsAppBusinessEngine = {
  /**
   * Enviar mensagem de pedido aprovado
   */
  async enviarPedidoAprovado(pedido, cliente) {
    const whatsapp = cliente.contatos?.find(c => c.tipo === 'WhatsApp');
    if (!whatsapp) return { sucesso: false, motivo: 'sem_whatsapp' };

    const mensagem = `🎉 *Pedido Aprovado!*

Olá ${cliente.nome_fantasia || cliente.nome}!

Seu pedido *${pedido.numero_pedido}* foi aprovado e já está em produção! ✅

📦 *Resumo:*
• Valor: R$ ${pedido.valor_total?.toLocaleString('pt-BR')}
• Prazo: ${pedido.data_prevista_entrega ? new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR') : '-'}

Em breve enviaremos mais atualizações!

Qualquer dúvida, estamos à disposição! 😊`;

    return await this.enviarMensagem(whatsapp.valor, mensagem, {
      tipo: 'pedido_aprovado',
      pedido_id: pedido.id,
      cliente_id: cliente.id
    });
  },

  /**
   * Enviar rastreamento de entrega
   */
  async enviarRastreamentoEntrega(entrega, cliente) {
    const whatsapp = cliente.contatos?.find(c => c.tipo === 'WhatsApp');
    if (!whatsapp) return { sucesso: false, motivo: 'sem_whatsapp' };

    const linkRastreamento = entrega.qr_code 
      ? `https://app.erpzuccaro.com/rastreamento/${entrega.qr_code}`
      : null;

    const mensagem = `🚚 *Sua entrega saiu!*

Olá ${cliente.nome_fantasia || cliente.nome}!

Seu pedido *${entrega.numero_pedido}* saiu para entrega! 🎯

📍 *Detalhes:*
• Motorista: ${entrega.motorista}
• Veículo: ${entrega.veiculo} (${entrega.placa})
• Previsão: ${new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}
${entrega.janela_entrega_inicio ? `• Janela: ${entrega.janela_entrega_inicio} às ${entrega.janela_entrega_fim}` : ''}

${linkRastreamento ? `🔗 *Rastreie em tempo real:*\n${linkRastreamento}\n\n` : ''}Aguardamos você! 😊`;

    return await this.enviarMensagem(whatsapp.valor, mensagem, {
      tipo: 'saida_entrega',
      entrega_id: entrega.id,
      cliente_id: cliente.id,
      link: linkRastreamento
    });
  },

  /**
   * Enviar cobrança (boleto/PIX)
   */
  async enviarCobranca(contaReceber, cliente) {
    const whatsapp = cliente.contatos?.find(c => c.tipo === 'WhatsApp');
    if (!whatsapp) return { sucesso: false, motivo: 'sem_whatsapp' };

    let detalhesCobranca = '';
    if (contaReceber.linha_digitavel) {
      detalhesCobranca = `💳 *Boleto:*\n\`\`\`${contaReceber.linha_digitavel}\`\`\`\n\n`;
    }
    if (contaReceber.pix_copia_cola) {
      detalhesCobranca += `💰 *PIX:*\n\`\`\`${contaReceber.pix_copia_cola}\`\`\`\n\n`;
    }
    if (contaReceber.url_fatura) {
      detalhesCobranca += `🔗 *Link de Pagamento:*\n${contaReceber.url_fatura}\n\n`;
    }

    const vencimento = new Date(contaReceber.data_vencimento);
    const hoje = new Date();
    const diasAteVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    
    let emoji = '📄';
    let urgencia = '';
    if (diasAteVencimento < 0) {
      emoji = '🚨';
      urgencia = `\n⚠️ *ATENÇÃO: Título vencido há ${Math.abs(diasAteVencimento)} dia(s)*\n`;
    } else if (diasAteVencimento <= 3) {
      emoji = '⏰';
      urgencia = `\n⏰ Vence em ${diasAteVencimento} dia(s)!\n`;
    }

    const mensagem = `${emoji} *Cobrança Disponível*

Olá ${cliente.nome_fantasia || cliente.nome}!

${urgencia}
📋 *Detalhes:*
• Valor: R$ ${contaReceber.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Vencimento: ${vencimento.toLocaleDateString('pt-BR')}
• Ref: ${contaReceber.descricao}

${detalhesCobranca}Contamos com você! 🙏`;

    return await this.enviarMensagem(whatsapp.valor, mensagem, {
      tipo: 'cobranca',
      conta_receber_id: contaReceber.id,
      cliente_id: cliente.id
    });
  },

  /**
   * Enviar entrega realizada
   */
  async enviarEntregaRealizada(entrega, cliente) {
    const whatsapp = cliente.contatos?.find(c => c.tipo === 'WhatsApp');
    if (!whatsapp) return { sucesso: false, motivo: 'sem_whatsapp' };

    const mensagem = `✅ *Entrega Concluída!*

Olá ${cliente.nome_fantasia || cliente.nome}!

Seu pedido *${entrega.numero_pedido}* foi entregue com sucesso! 🎉

📦 *Detalhes:*
• Recebido por: ${entrega.comprovante_entrega?.nome_recebedor || '-'}
• Data/Hora: ${new Date(entrega.data_entrega).toLocaleString('pt-BR')}

Esperamos que esteja tudo perfeito!

Se tiver algum problema, entre em contato. 📞`;

    return await this.enviarMensagem(whatsapp.valor, mensagem, {
      tipo: 'entrega_concluida',
      entrega_id: entrega.id,
      cliente_id: cliente.id
    });
  },

  /**
   * Método base de envio
   * Em produção, integraria com WhatsApp Business API
   */
  async enviarMensagem(numero, mensagem, metadata = {}) {
    try {
      // Simular envio (em produção, chamaria API real)
      console.log('📱 WhatsApp enviado para', numero);
      console.log('Mensagem:', mensagem);

      // Registrar histórico
      if (metadata.cliente_id) {
        await base44.entities.HistoricoCliente.create({
          cliente_id: metadata.cliente_id,
          modulo_origem: 'Sistema',
          referencia_id: metadata.pedido_id || metadata.entrega_id || metadata.conta_receber_id,
          referencia_tipo: metadata.tipo === 'pedido_aprovado' ? 'Pedido' :
                          metadata.tipo === 'saida_entrega' ? 'Entrega' :
                          metadata.tipo === 'cobranca' ? 'ContaReceber' : 'Outro',
          tipo_evento: 'Comunicacao',
          titulo_evento: 'WhatsApp Enviado',
          descricao_detalhada: mensagem,
          data_evento: new Date().toISOString(),
          whatsapp_envio: true,
          whatsapp_mensagem: mensagem,
          whatsapp_status: 'Enviado',
          visivel_cliente: true
        });
      }

      return {
        sucesso: true,
        mensagem_id: `whatsapp-${Date.now()}`,
        status: 'enviado',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }
};

export default WhatsAppBusinessEngine;