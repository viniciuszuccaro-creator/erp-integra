import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CALCULAR COMISSÃO AUTOMÁTICA - Após faturamento/pagamento
 * ETAPA 2: Integra com fluxo comercial
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { pedidoId, triggerEvent = 'faturamento' } = await req.json();

    const user = await base44.auth.me();

    const pedido = await base44.asServiceRole.entities.Pedido.get(pedidoId);

    // Calcular comissão baseada em % configurado
    if (pedido.vendedor_id) {
      // Obter configuração de comissão (simplificado: % fixo)
      const percentualComissao = 5; // 5% padrão

      const valorComissao = (pedido.valor_total * percentualComissao) / 100;

      const comissao = await base44.asServiceRole.entities.Comissao.create({
        vendedor: pedido.vendedor || 'Desconhecido',
        vendedor_id: pedido.vendedor_id,
        pedido_id: pedidoId,
        numero_pedido: pedido.numero_pedido,
        cliente: pedido.cliente_nome,
        data_venda: pedido.data_pedido,
        valor_venda: pedido.valor_total,
        percentual_comissao: percentualComissao,
        valor_comissao: valorComissao,
        status: 'Pendente',
        empresa_id: pedido.empresa_id,
        group_id: pedido.group_id
      });

      // Auditar
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        usuario_id: user?.id || 'SISTEMA',
        empresa_id: pedido.empresa_id,
        acao: 'Cálculo Automático',
        modulo: 'Comercial',
        entidade: 'Comissao',
        registro_id: comissao.id,
        descricao: `Comissão automaticamente calculada (${triggerEvent}) - R$ ${valorComissao.toFixed(2)}`,
        dados_novos: { percentual: percentualComissao, valor: valorComissao },
        data_hora: new Date().toISOString(),
        sucesso: true
      });

      return Response.json({ success: true, comissao_id: comissao.id });
    }

    return Response.json({ success: false, reason: 'Vendedor não encontrado' });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});