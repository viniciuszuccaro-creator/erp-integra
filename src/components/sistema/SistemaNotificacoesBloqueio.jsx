import { base44 } from "@/api/base44Client";

/**
 * V21.3 - Sistema de Notificações de Bloqueio de Crédito
 * Dispara quando cliente é bloqueado
 */
export async function notificarBloqueioCliente(clienteId, motivo, valorTotal, etapasVencidas) {
  const cliente = await base44.entities.Cliente.get(clienteId);

  // 1. Notificar Vendedor Responsável
  if (cliente.vendedor_responsavel_id) {
    await base44.entities.Notificacao.create({
      titulo: '🚨 Cliente Bloqueado - Ação Necessária',
      mensagem: `O cliente ${cliente.nome} foi BLOQUEADO automaticamente pelo sistema.\n\n` +
        `Motivo: ${motivo}\n` +
        `Etapas vencidas: ${etapasVencidas}\n` +
        `Valor total: R$ ${valorTotal.toFixed(2)}\n\n` +
        `⚠️ NOVOS PEDIDOS SERÃO BLOQUEADOS até regularização.\n\n` +
        `Entre em contato com o cliente urgentemente.`,
      tipo: 'urgente',
      categoria: 'Financeiro',
      prioridade: 'Urgente',
      destinatario_id: cliente.vendedor_responsavel_id,
      link_acao: `/cadastros?tab=clientes&id=${clienteId}`,
      entidade_relacionada: 'Cliente',
      registro_id: clienteId,
      acao_necessaria: true,
      acao_descricao: 'Contatar cliente para regularização'
    });
  }

  // 2. Notificar Gerente Financeiro
  const notifFinanceiro = await base44.entities.Notificacao.create({
    titulo: '⚠️ Bloqueio Automático Aplicado',
    mensagem: `Cliente: ${cliente.nome}\n` +
      `CPF/CNPJ: ${cliente.cnpj || cliente.cpf}\n` +
      `Vendedor: ${cliente.vendedor_responsavel || 'Não atribuído'}\n\n` +
      `Detalhes:\n` +
      `- ${etapasVencidas} etapas vencidas há +20 dias\n` +
      `- Valor total: R$ ${valorTotal.toFixed(2)}\n` +
      `- Classificação ABC: ${cliente.classificacao_abc}\n\n` +
      `Sistema bloqueou novos pedidos automaticamente.`,
    tipo: 'aviso',
    categoria: 'Financeiro',
    prioridade: 'Alta',
    link_acao: `/cadastros?tab=clientes&id=${clienteId}`,
    entidade_relacionada: 'Cliente',
    registro_id: clienteId
  });

  // 3. Criar Histórico no Cliente
  await base44.entities.HistoricoCliente.create({
    cliente_id: clienteId,
    cliente_nome: cliente.nome,
    empresa_id: cliente.empresa_id,
    group_id: cliente.group_id,
    modulo_origem: 'Financeiro',
    tipo_evento: 'Alerta',
    titulo_evento: '🚨 Bloqueio de Crédito Aplicado',
    descricao_detalhada: `Cliente bloqueado automaticamente pela Régua de Cobrança IA.\n\n` +
      `Motivo: ${etapasVencidas} etapas vencidas há mais de 20 dias.\n` +
      `Valor total inadimplente: R$ ${valorTotal.toFixed(2)}`,
    usuario_responsavel: 'IA - Régua de Cobrança',
    data_evento: new Date().toISOString(),
    visivel_cliente: false,
    prioridade: 'Urgente',
    acao_necessaria: true,
    acao_descricao: 'Regularizar pagamentos para desbloquear'
  });

  // 4. Se cliente tem portal, criar notificação lá também
  if (cliente.pode_ver_portal && cliente.portal_usuario_id) {
    await base44.entities.Notificacao.create({
      titulo: '⚠️ Crédito Suspenso',
      mensagem: `Prezado(a) ${cliente.nome},\n\n` +
        `Identificamos pagamentos pendentes em sua conta.\n\n` +
        `Por favor, regularize as pendências para continuar comprando.\n\n` +
        `Entre em contato com nosso financeiro.`,
      tipo: 'aviso',
      categoria: 'Financeiro',
      prioridade: 'Alta',
      destinatario_id: cliente.portal_usuario_id
    });
  }

  console.log(`✅ Notificações de bloqueio enviadas para ${cliente.nome}`);
  
  return {
    cliente_id: clienteId,
    notificacoes_enviadas: 3,
    vendedor_notificado: !!cliente.vendedor_responsavel_id,
    portal_notificado: cliente.pode_ver_portal
  };
}

export default notificarBloqueioCliente;