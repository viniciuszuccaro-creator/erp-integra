import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';

// Gera MovimentacaoEstoque de reserva ao criar/atualizar Pedido
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);

    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || null;
    const pedido = payload?.data || null;
    if (!event || event.entity_name !== 'Pedido' || !pedido) {
      return Response.json({ ok: true, skipped: true });
    }

    const permErr = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (permErr) return permErr;

    const ctxErr = assertContextPresence({ empresa_id: pedido?.empresa_id, group_id: pedido?.group_id }, true);
    if (ctxErr) return ctxErr;

    const status = (pedido?.status || '').toString();
    if (['Cancelado'].includes(status)) {
      return Response.json({ ok: true, skipped: true, reason: 'Pedido cancelado' });
    }

    const jaExiste = await base44.asServiceRole.entities.MovimentacaoEstoque.filter({ origem_documento_id: pedido.id, tipo_movimento: 'reserva' }, undefined, 1);
    if (jaExiste?.length) {
      return Response.json({ ok: true, skipped: true, reason: 'Reserva já registrada' });
    }

    const linhas = [
      ...(Array.isArray(pedido.itens_revenda) ? pedido.itens_revenda : []),
      ...(Array.isArray(pedido.itens_corte_dobra) ? pedido.itens_corte_dobra : []),
      ...(Array.isArray(pedido.itens_armado_padrao) ? pedido.itens_armado_padrao : []),
    ].filter(Boolean);

    let count = 0;
    for (const item of linhas) {
      if (!item?.produto_id || !item?.quantidade) continue;
      await base44.asServiceRole.entities.MovimentacaoEstoque.create({
        group_id: pedido.group_id || null,
        empresa_id: pedido.empresa_id || null,
        origem_movimento: 'pedido',
        origem_documento_id: pedido.id,
        tipo_movimento: 'reserva',
        produto_id: item.produto_id,
        produto_descricao: item.produto_descricao || item.descricao || 'Produto',
        codigo_produto: undefined,
        quantidade: Number(item.quantidade),
        unidade_medida: item.unidade || 'UN',
        data_movimentacao: new Date().toISOString(),
        valor_total: 0,
        motivo: 'Reserva automática do pedido',
      });
      count++;
    }

    await audit(base44, ctx.user, { acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', registro_id: null, descricao: `Reserva criada para pedido ${pedido.id} (${count} itens)` });
    return Response.json({ ok: true, reservas: count });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});