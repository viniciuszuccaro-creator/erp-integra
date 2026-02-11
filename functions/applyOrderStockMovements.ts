import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const pedido = body?.pedido;
    if (!pedido?.empresa_id) {
      return Response.json({ error: 'empresa_id obrigatório no pedido' }, { status: 400 });
    }

    const itens = Array.isArray(pedido.itens_revenda) ? pedido.itens_revenda : [];
    let movimentos = 0;

    for (const item of itens) {
      if (!item?.produto_id || !item?.quantidade) continue;

      const prods = await base44.entities.Produto.filter({ id: item.produto_id, empresa_id: pedido.empresa_id });
      const produto = prods?.[0];
      if (!produto) continue;

      const estoqueAtual = Number(produto.estoque_atual || 0);
      const qtd = Number(item.quantidade || 0);
      if (qtd <= 0) continue;

      const novoEstoque = Math.max(0, estoqueAtual - qtd);

      await base44.entities.MovimentacaoEstoque.create({
        empresa_id: pedido.empresa_id,
        tipo_movimento: 'saida',
        origem_movimento: 'pedido',
        origem_documento_id: pedido.id || `temp_${Date.now()}`,
        produto_id: item.produto_id,
        produto_descricao: item.descricao || item.produto_descricao || produto.descricao,
        codigo_produto: item.codigo_sku || produto.codigo,
        quantidade: qtd,
        unidade_medida: item.unidade || produto.unidade_medida || 'UN',
        estoque_anterior: estoqueAtual,
        estoque_atual: novoEstoque,
        data_movimentacao: new Date().toISOString(),
        documento: pedido.numero_pedido,
        motivo: `Baixa automática - Pedido ${pedido.id ? 'atualizado' : 'criado'} aprovado`,
        responsavel: user.full_name || user.email || 'Usuário',
        aprovado: true,
      });

      await base44.entities.Produto.update(item.produto_id, { estoque_atual: novoEstoque });
      movimentos += 1;
    }

    // Auditoria
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email || 'Usuário',
      usuario_id: user.id,
      empresa_id: pedido.empresa_id,
      acao: 'Edição',
      modulo: 'Estoque',
      tipo_auditoria: 'entidade',
      entidade: 'MovimentacaoEstoque',
      registro_id: pedido.id || null,
      descricao: `Baixa de estoque por aprovação de pedido (#movimentos=${movimentos})`,
      dados_novos: { pedido_id: pedido.id, numero_pedido: pedido.numero_pedido, itens_processados: movimentos },
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true, movimentos });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});