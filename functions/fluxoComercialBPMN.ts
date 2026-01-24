import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * FLUXO COMERCIAL BPMN - Orquestração de transições automáticas
 * ETAPA 2: Oportunidade → Orçamento → Pedido → NotaFiscal
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      action,
      entityType,
      entityId,
      data = {}
    } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ valid: false, reason: 'Não autenticado' }, { status: 401 });
    }

    let resultado = {};

    // AÇÃO: Converter Oportunidade → OrcamentoCliente
    if (action === 'converter_orcamento' && entityType === 'Oportunidade') {
      const oportunidade = await base44.asServiceRole.entities.Oportunidade.get(entityId);
      
      const orcamento = await base44.asServiceRole.entities.OrcamentoCliente.create({
        oportunidade_id: entityId,
        cliente_id: oportunidade.cliente_id,
        cliente_nome: oportunidade.cliente_nome,
        titulo: `Orçamento - ${oportunidade.titulo}`,
        descricao: oportunidade.descricao,
        valor_total: oportunidade.valor_estimado,
        status: 'rascunho',
        empresa_id: oportunidade.empresa_id,
        group_id: oportunidade.group_id,
        criado_em: new Date().toISOString()
      });

      // Atualizar oportunidade
      await base44.asServiceRole.entities.Oportunidade.update(entityId, {
        etapa: 'Proposta',
        status: 'Em Andamento'
      });

      resultado = { orcamento_id: orcamento.id, msg: 'Orçamento criado' };
    }

    // AÇÃO: Converter OrcamentoCliente → Pedido
    if (action === 'converter_pedido' && entityType === 'OrcamentoCliente') {
      const orcamento = await base44.asServiceRole.entities.OrcamentoCliente.get(entityId);
      
      const pedido = await base44.asServiceRole.entities.Pedido.create({
        numero_pedido: `PED-${Date.now()}`,
        orcamento_id: entityId,
        cliente_id: orcamento.cliente_id,
        cliente_nome: orcamento.cliente_nome,
        data_pedido: new Date().toISOString().split('T')[0],
        valor_total: orcamento.valor_total,
        status: 'Rascunho',
        empresa_id: orcamento.empresa_id,
        group_id: orcamento.group_id
      });

      // Atualizar orçamento
      await base44.asServiceRole.entities.OrcamentoCliente.update(entityId, {
        status: 'convertido',
        pedido_id: pedido.id
      });

      resultado = { pedido_id: pedido.id, msg: 'Pedido criado de orçamento' };
    }

    // AÇÃO: Aprovar Pedido → Reservar Estoque
    if (action === 'aprovar_pedido' && entityType === 'Pedido') {
      const pedido = await base44.asServiceRole.entities.Pedido.get(entityId);
      
      // Atualizar pedido
      await base44.asServiceRole.entities.Pedido.update(entityId, {
        status: 'Aprovado'
      });

      // Reservar itens no estoque
      const itens = [...(pedido.itens_revenda || []), ...(pedido.itens_armado_padrao || [])];
      for (const item of itens) {
        if (item.produto_id) {
          // Criar reserva no MovimentacaoEstoque
          await base44.asServiceRole.entities.MovimentacaoEstoque.create({
            empresa_id: pedido.empresa_id,
            group_id: pedido.group_id,
            origem_movimento: 'pedido',
            origem_documento_id: entityId,
            tipo_movimento: 'reserva',
            produto_id: item.produto_id,
            produto_descricao: item.produto_descricao,
            quantidade: item.quantidade,
            unidade_medida: item.unidade,
            data_movimentacao: new Date().toISOString(),
            document: `Pedido ${pedido.numero_pedido}`
          });

          // Atualizar estoque_reservado do produto
          const produto = await base44.asServiceRole.entities.Produto.get(item.produto_id);
          await base44.asServiceRole.entities.Produto.update(item.produto_id, {
            estoque_reservado: (produto.estoque_reservado || 0) + item.quantidade
          });
        }
      }

      resultado = { msg: 'Pedido aprovado e estoque reservado' };
    }

    // Auditar transição
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      empresa_id: data.empresa_id,
      acao: `BPMN ${action}`,
      modulo: 'Comercial',
      entidade: entityType,
      registro_id: entityId,
      descricao: `Transição BPMN: ${action} em ${entityType}`,
      dados_novos: resultado,
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({ success: true, resultado });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});