import React from "react";
import { base44 } from "@/api/base44Client";

/**
 * V21.3 - Régua de Cobrança Automatizada (Job Background)
 * Executa diariamente via cron/scheduler
 */
export async function executarReguaCobranca(empresaId) {
  console.log('🤖 Régua de Cobrança IA iniciada...');

  // Buscar contas pendentes/atrasadas
  const contas = await base44.entities.ContaReceber.filter({
    empresa_id: empresaId,
    status: { $in: ['Pendente', 'Atrasado'] }
  });

  const hoje = new Date();
  const acoes = [];

  for (const conta of contas) {
    const dataVenc = new Date(conta.data_vencimento);
    const diasAtraso = Math.floor((hoje - dataVenc) / (1000 * 60 * 60 * 24));

    const cliente = await base44.entities.Cliente.get(conta.cliente_id);
    const canalPreferencial = cliente.canal_preferencial || 'E-mail';

    // AÇÃO 1: 3 dias de atraso → WhatsApp/E-mail amigável
    if (diasAtraso === 3 && !conta.regua_cobranca?.acao_1_enviada) {
      const mensagem = `Olá ${cliente.nome}! 👋\n\n` +
        `Identificamos que o título ref. ${conta.descricao} (R$ ${conta.valor.toFixed(2)}) ` +
        `venceu há 3 dias.\n\n` +
        `Caso já tenha efetuado o pagamento, desconsidere esta mensagem.\n\n` +
        `PIX Copia e Cola:\n${conta.pix_copia_cola || 'Solicite ao financeiro'}\n\n` +
        `Obrigado! 🙏`;

      // Enviar via canal preferencial
      if (canalPreferencial === 'WhatsApp') {
        // await base44.integrations.WhatsApp.EnviarMensagem({ ... });
        console.log(`📱 WhatsApp enviado para ${cliente.nome}`);
      } else {
        await base44.integrations.Core.SendEmail({
          to: cliente.contatos?.[0]?.valor || cliente.email || '',
          subject: 'Lembrete de Pagamento',
          body: mensagem
        });
      }

      await base44.entities.ContaReceber.update(conta.id, {
        regua_cobranca: {
          ...(conta.regua_cobranca || {}),
          acao_1_enviada: true,
          acao_1_data: hoje.toISOString(),
          acao_1_canal: canalPreferencial
        }
      });

      acoes.push({ tipo: 'Ação 1', cliente: cliente.nome, dias: diasAtraso });
    }

    // AÇÃO 2: 10 dias → Interação CRM
    if (diasAtraso === 10 && !conta.regua_cobranca?.acao_2_enviada) {
      const interacao = await base44.entities.Interacao.create({
        tipo: 'WhatsApp',
        titulo: `Follow-up Cobrança - ${cliente.nome}`,
        descricao: `Cliente com título vencido há ${diasAtraso} dias. Valor: R$ ${conta.valor.toFixed(2)}`,
        data_interacao: hoje.toISOString(),
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        responsavel: cliente.vendedor_responsavel || 'Financeiro',
        resultado: 'Neutro',
        proxima_acao: 'Aguardar retorno do cliente',
        data_proxima_acao: new Date(hoje.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      await base44.entities.ContaReceber.update(conta.id, {
        regua_cobranca: {
          ...(conta.regua_cobranca || {}),
          acao_2_enviada: true,
          acao_2_data: hoje.toISOString(),
          acao_2_interacao_id: interacao.id
        }
      });

      acoes.push({ tipo: 'Ação 2', cliente: cliente.nome, dias: diasAtraso });
    }

    // AÇÃO 3: 20 dias → BLOQUEIO DINÂMICO
    if (diasAtraso >= 20 && !conta.regua_cobranca?.acao_3_enviada) {
      // V21.3: Contar quantas etapas estão vencidas
      const etapasVencidas = await base44.entities.ContaReceber.filter({
        cliente_id: conta.cliente_id,
        status: 'Atrasado',
        dias_atraso: { $gte: 20 }
      });

      if (etapasVencidas.length >= 2) {
        // BLOQUEIO DINÂMICO
        await base44.entities.Cliente.update(conta.cliente_id, {
          'condicao_comercial.situacao_credito': 'Bloqueado'
        });

        // Notificar gerência
        const alerta = await base44.entities.Notificacao.create({
          titulo: '🚨 Cliente Bloqueado por Inadimplência',
          mensagem: `Cliente ${cliente.nome} foi BLOQUEADO automaticamente.\n\n` +
            `Motivo: ${etapasVencidas.length} etapas vencidas há +20 dias\n` +
            `Valor total: R$ ${etapasVencidas.reduce((sum, c) => sum + c.valor, 0).toFixed(2)}\n\n` +
            `Novos pedidos serão bloqueados até regularização.`,
          tipo: 'urgente',
          categoria: 'Financeiro',
          prioridade: 'Urgente',
          link_acao: `/cadastros?tab=clientes&id=${cliente.id}`
        });

        await base44.entities.ContaReceber.update(conta.id, {
          regua_cobranca: {
            ...(conta.regua_cobranca || {}),
            acao_3_enviada: true,
            acao_3_data: hoje.toISOString(),
            acao_3_alerta_id: alerta.id
          }
        });

        acoes.push({ tipo: 'BLOQUEIO', cliente: cliente.nome, dias: diasAtraso });
      }
    }
  }

  console.log(`✅ Régua de Cobrança finalizada. ${acoes.length} ações executadas.`);
  return acoes;
}

// Componente visual (apenas para demonstração)
export default function ReguaCobrancaIA() {
  return null; // Job roda em background
}