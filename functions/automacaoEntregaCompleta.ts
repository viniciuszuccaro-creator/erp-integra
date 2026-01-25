import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 3: Automação completa da entrega
 * Dispara ações quando entrega é confirmada: saída estoque + custo frete + notificação
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entrega_id } = await req.json();

    if (!entrega_id) {
      return Response.json({ error: 'ID da entrega obrigatório' }, { status: 400 });
    }

    // Buscar entrega
    const entrega = await base44.asServiceRole.entities.Entrega.filter({ id: entrega_id });
    if (!entrega || entrega.length === 0) {
      return Response.json({ error: 'Entrega não encontrada' }, { status: 404 });
    }

    const entregaData = entrega[0];
    const acoes = [];

    // 1. Gerar Saída de Estoque (se ainda não foi gerada)
    if (entregaData.pedido_id) {
      const pedido = await base44.asServiceRole.entities.Pedido.filter({ id: entregaData.pedido_id });
      
      if (pedido && pedido.length > 0) {
        const pedidoData = pedido[0];
        const itens = [
          ...(pedidoData.itens_revenda || []),
          ...(pedidoData.itens_armado_padrao || []),
          ...(pedidoData.itens_corte_dobra || [])
        ];

        for (const item of itens) {
          if (!item.produto_id || !item.quantidade) continue;

          // Criar movimentação de saída
          await base44.asServiceRole.entities.MovimentacaoEstoque.create({
            group_id: entregaData.group_id,
            empresa_id: entregaData.empresa_id,
            origem_movimento: 'pedido',
            origem_documento_id: entregaData.pedido_id,
            tipo_movimento: 'saida',
            produto_id: item.produto_id,
            produto_descricao: item.produto_descricao || item.descricao,
            codigo_produto: item.codigo_produto,
            quantidade: item.quantidade,
            unidade_medida: item.unidade,
            data_movimentacao: new Date().toISOString(),
            documento: entregaData.numero_pedido,
            motivo: `Saída automática - Entrega confirmada ${entrega_id}`,
            responsavel: 'Sistema',
            responsavel_id: 'automacao'
          });

          // Atualizar estoque do produto
          const produto = await base44.asServiceRole.entities.Produto.filter({ id: item.produto_id });
          if (produto && produto.length > 0) {
            const produtoData = produto[0];
            await base44.asServiceRole.entities.Produto.update(item.produto_id, {
              estoque_atual: (produtoData.estoque_atual || 0) - item.quantidade,
              estoque_reservado: Math.max(0, (produtoData.estoque_reservado || 0) - item.quantidade)
            });
          }
        }

        acoes.push('Saída de estoque gerada');
      }
    }

    // 2. Registrar custo de frete no financeiro
    if (entregaData.custo_operacional > 0) {
      await base44.asServiceRole.entities.ContaPagar.create({
        group_id: entregaData.group_id,
        empresa_id: entregaData.empresa_id,
        origem: 'empresa',
        origem_tipo: 'outro',
        canal_origem: 'ERP',
        descricao: `Custo de frete - Entrega ${entregaData.cliente_nome}`,
        fornecedor: entregaData.transportadora || 'Frota Própria',
        fornecedor_id: entregaData.transportadora_id,
        categoria: 'Transporte',
        valor: entregaData.custo_operacional,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        status_pagamento: 'Pendente',
        numero_documento: `ENT-${entrega_id.slice(-8)}`
      });

      acoes.push('Custo de frete registrado');
    }

    // 3. Enviar notificação ao cliente
    if (entregaData.contato_entrega?.email) {
      try {
        await base44.integrations.Core.SendEmail({
          to: entregaData.contato_entrega.email,
          subject: '✅ Entrega Confirmada',
          body: `Olá ${entregaData.cliente_nome},

Sua entrega foi confirmada com sucesso!

📦 Pedido: ${entregaData.numero_pedido || 'N/A'}
📍 Endereço: ${entregaData.endereco_entrega_completo?.logradouro}, ${entregaData.endereco_entrega_completo?.numero}
📅 Data: ${new Date(entregaData.data_entrega).toLocaleDateString('pt-BR')}
✍️ Recebido por: ${entregaData.comprovante_entrega?.nome_recebedor || 'N/A'}

Obrigado pela preferência!

ERP Zuccaro`
        });
        acoes.push('Notificação enviada ao cliente');
      } catch (err) {
        acoes.push('Erro ao enviar notificação: ' + err.message);
      }
    }

    // 4. Auditoria
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema',
      acao: 'Automação',
      modulo: 'Expedição',
      entidade: 'Entrega',
      registro_id: entrega_id,
      descricao: `Automação completa de entrega: ${acoes.join(', ')}`,
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