import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * VALIDAÇÃO FLUXO FINANCEIRO - Impede operações inválidas
 * ETAPA 2: centro_custo_id obrigatório, proibição de exclusão após processamento
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      operation,
      entityName,
      data,
      entityId
    } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ valid: false, reason: 'Não autenticado' }, { status: 401 });
    }

    // Validações para ContaPagar e ContaReceber
    if (['ContaPagar', 'ContaReceber'].includes(entityName)) {
      // CREATE: Validar campos obrigatórios
      if (operation === 'create') {
        if (!data.centro_custo_id) {
          return Response.json({
            valid: false,
            reason: 'centro_custo_id é obrigatório'
          }, { status: 400 });
        }
        if (!data.empresa_id && !data.group_id) {
          return Response.json({
            valid: false,
            reason: 'empresa_id ou group_id obrigatório'
          }, { status: 400 });
        }
      }

      // DELETE: Proibir exclusão se já foi processado
      if (operation === 'delete') {
        const registro = await base44.asServiceRole.entities[entityName].get(entityId);
        
        if (['Pago', 'Recebido', 'Compensado'].includes(registro.status)) {
          return Response.json({
            valid: false,
            reason: 'Não é permitido excluir registros já processados. Use cancelamento com justificativa.'
          }, { status: 403 });
        }
      }

      // UPDATE: Se mudar status para Pago/Recebido, validar dados de pagamento
      if (operation === 'update' && (data.status === 'Pago' || data.status === 'Recebido')) {
        if (!data.forma_pagamento) {
          return Response.json({
            valid: false,
            reason: 'forma_pagamento é obrigatória para marcar como Pago/Recebido'
          }, { status: 400 });
        }
        if (!data.data_pagamento) {
          return Response.json({
            valid: false,
            reason: 'data_pagamento é obrigatória'
          }, { status: 400 });
        }
      }
    }

    // Validação de Aprovação de Desconto em Pedido
    if (entityName === 'Pedido' && operation === 'update') {
      const pedido = await base44.asServiceRole.entities.Pedido.get(entityId);
      
      // Se desconto foi solicitado e não aprovado ainda
      if (data.desconto_solicitado_percentual && data.desconto_solicitado_percentual > 0) {
        if (data.status_aprovacao === 'pendente' || !data.status_aprovacao) {
          // Validar que não pode faturar com desconto não aprovado
          if (data.status === 'Pronto para Faturar' || data.status === 'Faturado') {
            return Response.json({
              valid: false,
              reason: 'Não é possível faturar pedido com desconto não aprovado'
            }, { status: 403 });
          }
        }
      }

      // Validar margem mínima
      if (data.margem_aplicada_vendedor !== undefined) {
        const margemMinima = data.margem_minima_produto || 10;
        if (data.margem_aplicada_vendedor < margemMinima) {
          return Response.json({
            valid: false,
            reason: `Margem mínima não atingida. Mínimo: ${margemMinima}%, Aplicada: ${data.margem_aplicada_vendedor}%`
          }, { status: 403 });
        }
      }
    }

    return Response.json({ valid: true });

  } catch (error) {
    return Response.json({
      valid: false,
      reason: error.message
    }, { status: 500 });
  }
});