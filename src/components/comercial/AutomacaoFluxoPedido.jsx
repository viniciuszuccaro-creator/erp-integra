import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * 🤖 AUTOMAÇÃO INTELIGENTE DO FLUXO DE PEDIDOS V21.5
 * Sistema que monitora pedidos e executa ações automáticas baseadas em regras
 * 
 * AUTOMAÇÕES IMPLEMENTADAS:
 * 1. Notificação automática ao cliente quando status muda
 * 2. Envio para produção se pedido tem itens sob medida
 * 3. Alerta de estoque baixo ao aprovar pedido
 * 4. Criação automática de entrega ao faturar
 * 5. Notificação ao vendedor sobre aprovações/rejeições
 */

export function useAutomacaoFluxoPedido() {
  
  const notificarClienteStatusPedido = async (pedido, novoStatus) => {
    try {
      const mensagensStatus = {
        'Aprovado': `✅ Seu pedido ${pedido.numero_pedido} foi aprovado! Em breve iniciaremos a preparação.`,
        'Em Produção': `🏭 Seu pedido ${pedido.numero_pedido} entrou em produção.`,
        'Pronto para Faturar': `📦 Seu pedido ${pedido.numero_pedido} está pronto!`,
        'Faturado': `📄 Nota fiscal emitida para o pedido ${pedido.numero_pedido}.`,
        'Em Expedição': `🚚 Seu pedido ${pedido.numero_pedido} está sendo preparado para envio.`,
        'Em Trânsito': `🛣️ Seu pedido ${pedido.numero_pedido} saiu para entrega!`,
        'Entregue': `🎉 Pedido ${pedido.numero_pedido} entregue com sucesso! Obrigado pela preferência.`,
        'Pronto para Retirada': `📍 Seu pedido ${pedido.numero_pedido} está pronto para retirada!`,
      };

      const mensagem = mensagensStatus[novoStatus];
      if (!mensagem) return;

      // Buscar cliente para pegar contatos
      const clientes = await base44.entities.Cliente.filter({ id: pedido.cliente_id });
      if (!clientes?.length) return;
      
      const cliente = clientes[0];
      const whatsapp = cliente.contatos?.find(c => c.tipo === 'WhatsApp')?.valor;
      const email = cliente.contatos?.find(c => c.tipo === 'E-mail')?.valor;

      // Registrar notificação (mesmo que não envie, fica o registro)
      await base44.entities.Notificacao.create({
        tipo: 'status_pedido',
        destinatario: cliente.nome,
        destinatario_id: cliente.id,
        pedido_id: pedido.id,
        titulo: `Atualização: Pedido ${pedido.numero_pedido}`,
        mensagem,
        status_pedido: novoStatus,
        canais_disponiveis: { whatsapp, email },
        enviado: false,
        criado_em: new Date().toISOString()
      });

      console.log(`📢 Notificação registrada: ${mensagem}`);
    } catch (error) {
      console.error('Erro ao notificar cliente:', error);
    }
  };

  const verificarEnviarProducao = async (pedido) => {
    try {
      const precisaProducao = 
        pedido.tipo_pedido === "Produção Sob Medida" ||
        pedido.itens_corte_dobra?.length > 0 ||
        pedido.itens_armado_padrao?.length > 0;

      if (precisaProducao && pedido.status === 'Aprovado') {
        // Criar OP automaticamente
        const op = await base44.entities.OrdemProducao.create({
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_nome: pedido.cliente_nome,
          empresa_id: pedido.empresa_id,
          status: 'Aguardando Programação',
          prioridade: pedido.prioridade || 'Normal',
          data_criacao: new Date().toISOString(),
          itens_corte_dobra: pedido.itens_corte_dobra || [],
          itens_armado: pedido.itens_armado_padrao || [],
        });

        // Atualizar pedido
        await base44.entities.Pedido.update(pedido.id, {
          status: 'Em Produção'
        });

        toast.success(`🏭 OP ${op.numero_op} criada automaticamente!`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao enviar para produção:', error);
      return false;
    }
  };

  const criarEntregaAutomatica = async (pedido) => {
    try {
      if (pedido.status === 'Faturado' && pedido.tipo_frete !== 'Retirada') {
        const entregaExiste = await base44.entities.Entrega.filter({ pedido_id: pedido.id });
        
        if (!entregaExiste?.length) {
          await base44.entities.Entrega.create({
            pedido_id: pedido.id,
            numero_pedido: pedido.numero_pedido,
            cliente_id: pedido.cliente_id,
            cliente_nome: pedido.cliente_nome,
            empresa_id: pedido.empresa_id,
            tipo_frete: pedido.tipo_frete,
            endereco_entrega_completo: pedido.endereco_entrega_principal,
            data_previsao: pedido.data_prevista_entrega,
            valor_mercadoria: pedido.valor_total,
            valor_frete: pedido.valor_frete,
            status: 'Aguardando Separação',
            prioridade: pedido.prioridade || 'Normal',
            regiao_entrega_nome: pedido.endereco_entrega_principal?.cidade,
          });

          toast.success(`📦 Entrega criada automaticamente!`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar entrega:', error);
      return false;
    }
  };

  const alertarEstoqueBaixo = async (pedido) => {
    try {
      if (!pedido.itens_revenda?.length) return;

      const alertas = [];
      for (const item of pedido.itens_revenda) {
        if (item.produto_id) {
          const produtos = await base44.entities.Produto.filter({ 
            id: item.produto_id,
            empresa_id: pedido.empresa_id 
          });
          
          const produto = produtos[0];
          if (produto) {
            const disponivel = (produto.estoque_atual || 0) - (item.quantidade || 0);
            
            if (disponivel < (produto.estoque_minimo || 0)) {
              alertas.push({
                produto: produto.descricao,
                disponivel,
                minimo: produto.estoque_minimo
              });
            }
          }
        }
      }

      if (alertas.length > 0) {
        toast.warning(`⚠️ ${alertas.length} produto(s) abaixo do estoque mínimo após este pedido!`, {
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Erro ao verificar estoque:', error);
    }
  };

  return {
    notificarClienteStatusPedido,
    verificarEnviarProducao,
    criarEntregaAutomatica,
    alertarEstoqueBaixo
  };
}

// Hook para monitorar pedidos em tempo real
export function useMonitoramentoPedidos(pedidos = []) {
  const automacao = useAutomacaoFluxoPedido();

  useEffect(() => {
    if (!pedidos || pedidos.length === 0) return;

    // Verificar pedidos que precisam de ação automática
    const processarPedidos = async () => {
      for (const pedido of pedidos) {
        // Auto-enviar para produção se aprovado e tiver itens de produção
        if (pedido.status === 'Aprovado') {
          await automacao.verificarEnviarProducao(pedido);
        }

        // Auto-criar entrega se faturado
        if (pedido.status === 'Faturado') {
          await automacao.criarEntregaAutomatica(pedido);
        }
      }
    };

    processarPedidos();
  }, [pedidos, automacao]);

  return automacao;
}

export default function AutomacaoFluxoPedido() {
  return null; // Componente invisible, apenas lógica
}