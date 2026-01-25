import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Criar Pedido via Chatbot
 * Fluxo guiado com validações
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cliente_id, produtos, empresa_id, vendedor_id } = await req.json();

    const user = await base44.auth.me();

    // Validar cliente
    const cliente = await base44.entities.Cliente.get(cliente_id);
    if (!cliente) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Gerar número do pedido
    const pedidosCount = await base44.entities.Pedido.filter({ empresa_id }).then(p => p.length);
    const numero_pedido = `PED-${String(pedidosCount + 1).padStart(6, '0')}`;

    // Calcular valores
    let valor_total = 0;
    const itens_revenda = produtos.map(p => {
      const valor = p.quantidade * p.preco_unitario;
      valor_total += valor;
      return {
        produto_id: p.produto_id,
        produto_descricao: p.descricao,
        quantidade: p.quantidade,
        preco_unitario: p.preco_unitario,
        valor_total: valor
      };
    });

    // Criar pedido
    const pedido = await base44.entities.Pedido.create({
      numero_pedido,
      empresa_id,
      cliente_id,
      cliente_nome: cliente.nome,
      cliente_cpf_cnpj: cliente.cnpj || cliente.cpf,
      vendedor: user?.full_name,
      vendedor_id: vendedor_id || user?.id,
      data_pedido: new Date().toISOString().split('T')[0],
      itens_revenda,
      valor_produtos: valor_total,
      valor_total,
      status: 'Rascunho',
      origem_pedido: 'Chatbot',
      tipo: 'Pedido'
    });

    // Auditoria
    await base44.entities.AuditLog.create({
      usuario: user?.full_name || 'Chatbot',
      usuario_id: user?.id,
      empresa_id,
      acao: 'Criação',
      modulo: 'Comercial',
      entidade: 'Pedido',
      registro_id: pedido.id,
      descricao: `Pedido ${numero_pedido} criado via Chatbot`
    });

    return Response.json({
      resposta: `✅ Pedido ${numero_pedido} criado com sucesso! Valor: R$ ${valor_total.toFixed(2)}`,
      pedido
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});