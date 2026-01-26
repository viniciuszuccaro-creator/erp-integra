import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event, data } = body || {};
    if (!data) return Response.json({ error: 'Invalid payload' }, { status: 400 });

    // Apenas quando NF for Autorizada
    if (!(data?.status === 'Autorizada')) return Response.json({ ok: true, skipped: true });

    // Permissões
    const permCom = await assertPermission(base44, ctx, 'Comercial', 'Comissao', 'criar');
    if (permCom) return permCom;

    const percPadrao = 5; // % padrão caso não exista regra
    // Tenta localizar pedido relacionado
    let pedido = null;
    if (data?.pedido_id) {
      const ps = await base44.asServiceRole.entities.Pedido.filter({ id: data.pedido_id });
      pedido = ps?.[0] || null;
    }

    const vendedor = pedido?.vendedor || data?.vendedor || (ctx.user?.full_name || ctx.user?.email);
    const vendedor_id = pedido?.vendedor_id || ctx.user?.id;
    const valor_venda = Number(pedido?.valor_total ?? data?.valor_total ?? 0);

    const comPayload = {
      vendedor,
      vendedor_id,
      pedido_id: pedido?.id || null,
      numero_pedido: pedido?.numero_pedido || null,
      cliente: data?.cliente_fornecedor || pedido?.cliente_nome || '',
      data_venda: data?.data_emissao || new Date().toISOString().slice(0,10),
      valor_venda,
      percentual_comissao: Number(pedido?.percentual_comissao || percPadrao),
      valor_comissao: Math.round(valor_venda * Number(pedido?.percentual_comissao || percPadrao) / 100 * 100) / 100,
      status: 'Pendente',
      observacoes: 'Gerada automaticamente na autorização da NF-e',
      group_id: data?.group_id || pedido?.group_id || null,
      empresa_id: data?.empresa_faturamento_id || pedido?.empresa_id || null
    };

    const created = await base44.asServiceRole.entities.Comissao.create(comPayload);

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Comercial', entidade: 'Comissao', registro_id: created?.id,
      descricao: 'Comissão gerada automaticamente na autorização da NF', dados_novos: comPayload
    });

    return Response.json({ ok: true, comissao_id: created?.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});