import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, extractRequestMeta } from './_lib/guard.js';
import { processReservas } from './_lib/orderReservationUtils.js';
import { ensureEventType } from './_lib/validationUtils.js';
import { handleOnPedidoCreated } from './_lib/pedido/onPedidoCreatedHandler.js';
import { stockAudit } from './_lib/estoque/auditUtils.js';
import { notify } from './_lib/notificationService.js';
import { emitPedidoMovementsGenerated } from './_lib/pedido/pedidoEvents.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const meta = extractRequestMeta(req);

    const body = await req.json();
    const { event, data } = body || {};
    if (!ensureEventType(event, 'create') || !data) return Response.json({ ok: true, skipped: true });
    {
      const ctxErr = assertContextPresence(data, true);
      if (ctxErr) return ctxErr;
    }

    // Permissão: editar estoque e criar movimentação
    const perm = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (perm) return perm;

    const { movimentos } = await handleOnPedidoCreated(base44, ctx, data, user);

    await stockAudit(base44, user, {
      acao: 'Criação',
      entidade: 'MovimentacaoEstoque',
      registro_id: data?.id || null,
      descricao: 'Movimentações geradas a partir de Pedido criado',
      empresa_id: data?.empresa_id || null,
      dados_novos: { quantidade_movimentos: Array.isArray(movimentos) ? movimentos.length : (movimentos?.length || 0) }
    }, meta);

    // Notificação leve via helper centralizado (multiempresa)
    await emitPedidoMovementsGenerated(base44, { pedido: data, movimentos, validation: null });

    return Response.json({ ok: true, movimentos });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});