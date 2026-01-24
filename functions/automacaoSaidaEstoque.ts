import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUTOMAÇÃO SAÍDA ESTOQUE - Gera MovimentacaoEstoque após faturamento
 * ETAPA 2: Transição automática Pedido Faturado → Saída de Estoque
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { pedidoId, tipoSaida = 'saida' } = await req.json();

    const user = await base44.auth.me();

    const pedido = await base44.asServiceRole.entities.Pedido.get(pedidoId);

    if (!['Faturado', 'Em Expedição'].includes(pedido.status)) {
      return Response.json({
        valid: false,
        reason: 'Pedido deve estar faturado ou em expedição'
      }, { status: 400 });
    }

    // Processar saída de estoque para cada item
    const itens = [...(pedido.itens_revenda || []), ...(pedido.itens_armado_padrao || [])];
    const movimentacoes = [];

    for (const item of itens) {
      if (item.produto_id) {
        // Criar MovimentacaoEstoque de saída
        const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create({
          empresa_id: pedido.empresa_id,
          group_id: pedido.group_id,
          origem_movimento: 'pedido',
          origem_documento_id: pedidoId,
          tipo_movimento: tipoSaida,
          produto_id: item.produto_id,
          produto_descricao: item.produto_descricao,
          quantidade: item.quantidade,
          unidade_medida: item.unidade,
          estoque_anterior: 0, // Será preenchido no frontend
          data_movimentacao: new Date().toISOString(),
          motivo: `Faturamento Pedido ${pedido.numero_pedido}`
        });

        // Atualizar produto: diminuir estoque_atual e liberar reserva
        const produto = await base44.asServiceRole.entities.Produto.get(item.produto_id);
        await base44.asServiceRole.entities.Produto.update(item.produto_id, {
          estoque_atual: Math.max(0, (produto.estoque_atual || 0) - item.quantidade),
          estoque_reservado: Math.max(0, (produto.estoque_reservado || 0) - item.quantidade)
        });

        movimentacoes.push(mov);
      }
    }

    // Auditar
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema',
      usuario_id: user?.id || 'SISTEMA',
      empresa_id: pedido.empresa_id,
      acao: 'Automação',
      modulo: 'Estoque',
      entidade: 'MovimentacaoEstoque',
      registro_id: pedidoId,
      descricao: `${movimentacoes.length} saídas de estoque geradas automaticamente para pedido ${pedido.numero_pedido}`,
      dados_novos: { quantidade_movimentacoes: movimentacoes.length },
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({
      success: true,
      movimentacoes_criadas: movimentacoes.length
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});