import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Consultar Pedido via Chatbot
 * Com RBAC e Multiempresa
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cliente_id, numero_pedido, empresa_id } = await req.json();

    const user = await base44.auth.me();
    
    // Filtro com contexto multiempresa
    const filtro = { empresa_id };
    if (cliente_id) filtro.cliente_id = cliente_id;
    if (numero_pedido) filtro.numero_pedido = numero_pedido;

    const pedidos = await base44.entities.Pedido.filter(filtro, '-data_pedido', 10);

    if (pedidos.length === 0) {
      return Response.json({
        resposta: 'Não encontrei pedidos para os critérios informados.',
        pedidos: []
      });
    }

    const pedido = pedidos[0];
    const resposta = `
📦 Pedido ${pedido.numero_pedido}
Status: ${pedido.status}
Cliente: ${pedido.cliente_nome}
Valor: R$ ${pedido.valor_total?.toFixed(2) || '0.00'}
Data: ${pedido.data_pedido}
${pedido.data_prevista_entrega ? `Previsão entrega: ${pedido.data_prevista_entrega}` : ''}
    `.trim();

    return Response.json({
      resposta,
      pedidos
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});