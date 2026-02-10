import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';
import { processReservas } from './_lib/orderReservationUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event, data } = body || {};
    if (event?.type !== 'create' || !data) return Response.json({ ok: true, skipped: true });

    // Permissão: editar estoque e criar movimentação
    const perm = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (perm) return perm;

    const movimentos = await processReservas(base44, data, user);

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque',
      registro_id: null, descricao: `Reservas criadas a partir do Pedido ${data?.id}`,
      dados_novos: { movimentos }
    });

    return Response.json({ ok: true, movimentos });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});