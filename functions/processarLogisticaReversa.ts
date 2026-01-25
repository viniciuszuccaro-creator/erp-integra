import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 3: Processamento de Logística Reversa
 * Devolução/Recusa → Entrada Estoque + Bloqueio Financeiro + Notificações
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entrega_id, motivo, quantidade_devolvida, observacoes } = await req.json();

    if (!entrega_id || !motivo) {
      return Response.json({ error: 'Entrega e motivo obrigatórios' }, { status: 400 });
    }

    // Buscar entrega
    const entregas = await base44.entities.Entrega.filter({ id: entrega_id });
    if (!entregas || entregas.length === 0) {
      return Response.json({ error: 'Entrega não encontrada' }, { status: 404 });
    }

    const entrega = entregas[0];
    const acoes = [];

    // 1. Atualizar entrega com dados de logística reversa
    await base44.entities.Entrega.update(entrega_id, {
      logistica_reversa: {
        ativada: true,
        motivo,
        data_ocorrencia: new Date().toISOString(),
        responsavel: user.full_name || user.email,
        quantidade_devolvida: quantidade_devolvida || 0,
        observacoes_devolucao: observacoes
      },
      status: 'Devolvido'
    });
    acoes.push('Logística reversa ativada');

    // 2. Gerar entrada de estoque (devolução)
    if (entrega.pedido_id && quantidade_devolvida > 0) {
      const pedido = await base44.entities.Pedido.filter({ id: entrega.pedido_id });
      
      if (pedido && pedido.length > 0) {
        const pedidoData = pedido[0];
        const itens = [
          ...(pedidoData.itens_revenda || []),
          ...(pedidoData.itens_armado_padrao || []),
          ...(pedidoData.itens_corte_dobra || [])
        ];

        for (const item of itens) {
          if (!item.produto_id) continue;

          const qtdDevolver = Math.min(item.quantidade, quantidade_devolvida);

          // Criar movimentação de entrada (devolução)
          const movimentacao = await base44.entities.MovimentacaoEstoque.create({
            group_id: entrega.group_id,
            empresa_id: entrega.empresa_id,
            origem_movimento: 'devolucao',
            origem_documento_id: entrega_id,
            tipo_movimento: 'entrada',
            produto_id: item.produto_id,
            produto_descricao: item.produto_descricao || item.descricao,
            quantidade: qtdDevolver,
            unidade_medida: item.unidade,
            data_movimentacao: new Date().toISOString(),
            documento: entrega.numero_pedido || entrega_id,
            motivo: `Devolução - ${motivo}`,
            responsavel: user.full_name || user.email,
            responsavel_id: user.id
          });

          // Atualizar estoque do produto
          const produto = await base44.entities.Produto.filter({ id: item.produto_id });
          if (produto && produto.length > 0) {
            const produtoData = produto[0];
            await base44.entities.Produto.update(item.produto_id, {
              estoque_atual: (produtoData.estoque_atual || 0) + qtdDevolver
            });
          }

          acoes.push(`Entrada de estoque: ${qtdDevolver} ${item.unidade} de ${item.produto_descricao}`);
        }
      }
    }

    // 3. Bloquear/Ajustar financeiro
    if (entrega.pedido_id) {
      const contasReceber = await base44.entities.ContaReceber.filter({
        pedido_id: entrega.pedido_id,
        status: 'Pendente'
      });

      for (const conta of contasReceber) {
        await base44.entities.ContaReceber.update(conta.id, {
          observacoes: (conta.observacoes || '') + `\n[ALERTA] Logística reversa em ${new Date().toLocaleString('pt-BR')}: ${motivo}`
        });
      }

      acoes.push('Financeiro notificado sobre devolução');
    }

    // 4. Notificar gestor
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '⚠️ Logística Reversa Registrada',
        body: `Cliente: ${entrega.cliente_nome}
Motivo: ${motivo}
Quantidade: ${quantidade_devolvida || 'Total'}
Observações: ${observacoes || 'N/A'}

Ações: ${acoes.join(', ')}

Pedido: ${entrega.numero_pedido || 'N/A'}`
      });
    } catch (_) {}

    // 5. Auditoria
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      empresa_id: entrega.empresa_id,
      acao: 'Criação',
      modulo: 'Expedição',
      entidade: 'LogisticaReversa',
      registro_id: entrega_id,
      descricao: `Logística reversa processada: ${motivo}`,
      dados_novos: { motivo, quantidade_devolvida, acoes },
      data_hora: new Date().toISOString()
    });

    return Response.json({
      success: true,
      acoes_executadas: acoes
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});