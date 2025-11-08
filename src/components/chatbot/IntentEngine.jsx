import { base44 } from '@/api/base44Client';

/**
 * Engine de Detecção de Intents do Chatbot
 * Processa mensagens e detecta intenções usando IA
 */

export const IntentEngine = {
  /**
   * Analisa uma mensagem e detecta a intenção
   */
  async detectarIntent(mensagem, clienteId = null, contexto = {}) {
    try {
      // Buscar histórico do cliente se disponível
      let historico = '';
      if (clienteId) {
        const pedidosCliente = await base44.entities.Pedido.filter({ 
          cliente_id: clienteId 
        }, '-data_pedido', 5);
        
        if (pedidosCliente.length > 0) {
          historico = `\nHistórico: Cliente possui ${pedidosCliente.length} pedidos. Último: ${pedidosCliente[0]?.numero_pedido || '-'}`;
        }
      }

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `
Você é um assistente de vendas de um ERP industrial (metalurgia, ferro, aço).

Mensagem do cliente: "${mensagem}"
${historico}

Analise a mensagem e detecte a INTENÇÃO principal:

1. **orcamento** - Cliente quer orçamento, cotação ou preço
2. **consulta_pedido** - Quer saber sobre um pedido (status, onde está)
3. **consulta_entrega** - Quer rastrear entrega ou saber quando chega
4. **financeiro** - Dúvidas sobre pagamento, fatura, valor
5. **boleto** - Quer 2ª via de boleto, código PIX, link pagamento
6. **falar_atendente** - Quer falar com humano ou problema complexo
7. **reclamacao** - Está insatisfeito, reclamando
8. **outro** - Outras intenções

Retorne em JSON:
{
  "intent": "string (uma das opções acima)",
  "confianca": number (0-100),
  "entidades_detectadas": {
    "numero_pedido": "string ou null",
    "produto_interesse": "string ou null",
    "urgente": boolean
  },
  "resposta_sugerida": "string (resposta profissional e útil)",
  "acoes_sugeridas": ["ação1", "ação2"],
  "necessita_atendente": boolean,
  "sentimento": "Positivo | Neutro | Negativo | Urgente"
}
        `,
        response_json_schema: {
          type: 'object',
          properties: {
            intent: { type: 'string' },
            confianca: { type: 'number' },
            entidades_detectadas: {
              type: 'object',
              properties: {
                numero_pedido: { type: 'string' },
                produto_interesse: { type: 'string' },
                urgente: { type: 'boolean' }
              }
            },
            resposta_sugerida: { type: 'string' },
            acoes_sugeridas: { 
              type: 'array',
              items: { type: 'string' }
            },
            necessita_atendente: { type: 'boolean' },
            sentimento: { type: 'string' }
          }
        }
      });

      return resultado;

    } catch (error) {
      console.error('Erro ao detectar intent:', error);
      return {
        intent: 'outro',
        confianca: 0,
        entidades_detectadas: {},
        resposta_sugerida: 'Desculpe, estou com dificuldades. Gostaria de falar com um atendente?',
        acoes_sugeridas: ['Falar com atendente'],
        necessita_atendente: true,
        sentimento: 'Neutro'
      };
    }
  },

  /**
   * Executa ação baseada no intent detectado
   */
  async executarAcao(intent, entidades, clienteId) {
    switch (intent) {
      case 'orcamento':
        return await this.acaoOrcamento(entidades, clienteId);
      
      case 'consulta_pedido':
        return await this.acaoConsultaPedido(entidades, clienteId);
      
      case 'consulta_entrega':
        return await this.acaoConsultaEntrega(entidades, clienteId);
      
      case 'boleto':
        return await this.acaoBoleto(entidades, clienteId);
      
      case 'financeiro':
        return await this.acaoFinanceiro(entidades, clienteId);
      
      default:
        return null;
    }
  },

  async acaoOrcamento(entidades, clienteId) {
    // Criar orçamento preliminar
    return {
      tipo: 'orcamento_iniciado',
      mensagem: 'Ótimo! Vou ajudá-lo com o orçamento. Você pode enviar o projeto (PDF/DWG) ou descrever o que precisa?',
      dados: {
        proximos_passos: ['upload_projeto', 'descricao_manual']
      }
    };
  },

  async acaoConsultaPedido(entidades, clienteId) {
    if (entidades.numero_pedido) {
      // Buscar pedido específico
      const pedidos = await base44.entities.Pedido.filter({
        numero_pedido: entidades.numero_pedido
      });
      
      if (pedidos.length > 0) {
        const pedido = pedidos[0];
        return {
          tipo: 'pedido_encontrado',
          mensagem: `Encontrei seu pedido ${pedido.numero_pedido}!\n\nStatus: ${pedido.status}\nValor: R$ ${pedido.valor_total?.toLocaleString('pt-BR')}\nData: ${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}`,
          dados: { pedido }
        };
      }
    }
    
    // Buscar últimos pedidos do cliente
    if (clienteId) {
      const pedidos = await base44.entities.Pedido.filter({
        cliente_id: clienteId
      }, '-data_pedido', 3);
      
      if (pedidos.length > 0) {
        const lista = pedidos.map(p => 
          `• ${p.numero_pedido} - ${p.status} - R$ ${p.valor_total?.toLocaleString('pt-BR')}`
        ).join('\n');
        
        return {
          tipo: 'pedidos_encontrados',
          mensagem: `Aqui estão seus últimos pedidos:\n\n${lista}\n\nSobre qual deseja mais detalhes?`,
          dados: { pedidos }
        };
      }
    }

    return {
      tipo: 'pedido_nao_encontrado',
      mensagem: 'Não encontrei pedidos. Você pode me passar o número do pedido?',
      dados: null
    };
  },

  async acaoConsultaEntrega(entidades, clienteId) {
    if (clienteId) {
      const entregas = await base44.entities.Entrega.filter({
        cliente_id: clienteId,
        status: ['Em Trânsito', 'Saiu para Entrega']
      }, '-data_previsao', 3);

      if (entregas.length > 0) {
        const entrega = entregas[0];
        const link = entrega.qr_code 
          ? `https://app.erpzuccaro.com/rastreamento/${entrega.qr_code}`
          : null;

        return {
          tipo: 'entrega_encontrada',
          mensagem: `Sua entrega está ${entrega.status}!\n\nPrevisão: ${new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}\nMotorista: ${entrega.motorista || '-'}${link ? `\n\n🔗 Rastreie em tempo real: ${link}` : ''}`,
          dados: { entrega, link_rastreamento: link }
        };
      }
    }

    return {
      tipo: 'entrega_nao_encontrada',
      mensagem: 'Não encontrei entregas em andamento. Qual o número do seu pedido?',
      dados: null
    };
  },

  async acaoBoleto(entidades, clienteId) {
    if (clienteId) {
      const contas = await base44.entities.ContaReceber.filter({
        cliente_id: clienteId,
        status: 'Pendente'
      }, '-data_vencimento', 5);

      if (contas.length > 0) {
        const mensagens = contas.map(c => {
          const vencimento = new Date(c.data_vencimento);
          const vencido = vencimento < new Date();
          
          return `• R$ ${c.valor?.toLocaleString('pt-BR')} - Venc: ${vencimento.toLocaleDateString('pt-BR')} ${vencido ? '⚠️ VENCIDO' : ''}${c.linha_digitavel ? `\nBoleto: ${c.linha_digitavel}` : ''}${c.pix_copia_cola ? `\nPIX: ${c.pix_copia_cola}` : ''}`;
        }).join('\n\n');

        return {
          tipo: 'boletos_encontrados',
          mensagem: `Encontrei ${contas.length} título(s) em aberto:\n\n${mensagens}`,
          dados: { contas }
        };
      }
    }

    return {
      tipo: 'boleto_nao_encontrado',
      mensagem: 'Não encontrei títulos pendentes. Qual o número do pedido ou nota fiscal?',
      dados: null
    };
  },

  async acaoFinanceiro(entidades, clienteId) {
    if (clienteId) {
      const contas = await base44.entities.ContaReceber.filter({
        cliente_id: clienteId
      }, '-data_vencimento', 10);

      const pendentes = contas.filter(c => c.status === 'Pendente');
      const vencidas = pendentes.filter(c => new Date(c.data_vencimento) < new Date());
      const totalPendente = pendentes.reduce((sum, c) => sum + (c.valor || 0), 0);

      return {
        tipo: 'resumo_financeiro',
        mensagem: `Situação Financeira:\n\n💰 Total em aberto: R$ ${totalPendente.toLocaleString('pt-BR')}\n📋 ${pendentes.length} título(s) pendente(s)${vencidas.length > 0 ? `\n⚠️ ${vencidas.length} vencido(s)` : '\n✅ Nenhum vencido'}`,
        dados: { contas: pendentes, total: totalPendente }
      };
    }

    return {
      tipo: 'financeiro_sem_dados',
      mensagem: 'Preciso identificá-lo primeiro. Qual seu CPF/CNPJ ou número de pedido?',
      dados: null
    };
  }
};

export default IntentEngine;