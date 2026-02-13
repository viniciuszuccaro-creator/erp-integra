import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, extractRequestMeta } from './_lib/guard.js';
import { computeMovements, persistMovements, buildFinalizePatch } from './_lib/inventoryUtils.js';
import { handleApplyInventoryAdjustments } from './_lib/inventario/applyAdjustmentsHandler.js';
import { resolveEntityIdFromPayload, isApprovedStatus } from './_lib/validationUtils.js';
import { stockAudit } from './_lib/estoque/auditUtils.js';
import { notify } from './_lib/notificationService.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const meta = extractRequestMeta(req);

    const payload = await req.json();
    const event = payload?.event;
    const data = payload?.data;
    const inventario_id = resolveEntityIdFromPayload({ ...payload, data, event }, ['inventario_id']);
    if (!inventario_id) return Response.json({ error: 'inventario_id é obrigatório' }, { status: 400 });

    if (!isApprovedStatus(data)) {
      return Response.json({ ok: true, skipped: true });
    }

    const perm = await assertPermission(base44, ctx, 'Estoque', 'Inventario', 'editar');
    if (perm) return perm;

    const inv = await base44.asServiceRole.entities.Inventario.get(inventario_id);
    if (!inv) return Response.json({ error: 'Inventário não encontrado' }, { status: 404 });
    {
      const ctxErr = assertContextPresence(inv, true);
      if (ctxErr) return ctxErr;
    }

    const { movimentos_count, skipped } = await handleApplyInventoryAdjustments(base44, ctx, { ...inv, id: inventario_id }, user);
    if (skipped) return Response.json({ ok: true, skipped: true });

    await stockAudit(base44, user, {
      acao: 'Edição',
      entidade: 'Inventario',
      registro_id: inventario_id,
      descricao: 'Ajustes de inventário aplicados',
      empresa_id: inv?.empresa_id || null,
      dados_novos: { movimentos_count }
    }, meta);

    // Notificação leve para o NotificationCenter (multiempresa)
    await notify(base44, {
      titulo: 'Inventário: Ajustes Aplicados',
      mensagem: `${movimentos_count} movimentação(ões) de estoque geradas a partir do inventário`,
      tipo: 'info',
      categoria: 'Estoque',
      prioridade: 'Normal',
      empresa_id: inv?.empresa_id || null,
      dados: { inventario_id, movimentos_count }
    });

    return Response.json({ ok: true, movimentos_count });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});