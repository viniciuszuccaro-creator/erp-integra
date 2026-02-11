import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';
import { processReservas } from './_lib/orderReservationUtils.js';
import { ensureEventType } from './_lib/validationUtils.js';
import { handleOnPedidoCreated } from './_lib/pedido/onPedidoCreatedHandler.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event, data } = body || {};
    if (!ensureEventType(event, 'create') || !data) return Response.json({ ok: true, skipped: true });

    // Permissão: editar estoque e criar movimentação
    const perm = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (perm) return perm;

    const { movimentos } = await handleOnPedidoCreated(base44, ctx, data, user);
    return Response.json({ ok: true, movimentos });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});