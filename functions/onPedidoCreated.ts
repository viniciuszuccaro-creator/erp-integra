import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, extractRequestMeta, ensureContextFields } from './_lib/guard.js';
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
    const { event, data, old_data } = body || {};
    if (!event || !data) return Response.json({ ok: true, skipped: true });
    {
      const ctxErr = assertContextPresence(data, true);
      if (ctxErr) return ctxErr;
    }

    const dataEnriched = await ensureContextFields(base44, data, true);
    if ((dataEnriched as any)?.error) return dataEnriched;

    if (event.type === 'create') {
      // Permissão: editar estoque e criar movimentação
      const perm = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
      if (perm) return perm;

      const { movimentos } = await handleOnPedidoCreated(base44, ctx, dataEnriched, user);

      await stockAudit(base44, user, {
        acao: 'Criação',
        entidade: 'MovimentacaoEstoque',
        registro_id: dataEnriched?.id || null,
        descricao: 'Movimentações geradas a partir de Pedido criado',
        empresa_id: dataEnriched?.empresa_id || null,
        dados_novos: { quantidade_movimentos: Array.isArray(movimentos) ? movimentos.length : (movimentos?.length || 0) }
      }, meta);

      // Notificação leve via helper centralizado (multiempresa)
      await emitPedidoMovementsGenerated(base44, { pedido: dataEnriched, movimentos, validation: null });
    }

    if (event.type === 'update') {
      const prev = old_data || {};
      const novo = data;
      const statusAnt = prev.status;
      const statusNovo = novo.status;
      if (statusNovo && statusNovo !== statusAnt && /em\s*tr[âa]nsito/i.test(statusNovo)) {
        const internal_token = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
        const clienteId = novo.cliente_id || null;
        const empresaId = novo.empresa_id || null;
        const groupId = novo.group_id || null;
        const vars = { cliente: novo.cliente_nome || '', pedido: novo.numero_pedido || novo.id || '', data_prevista: novo.data_prevista_entrega || '', rastreio: novo.link_rastreamento || '' };
        try {
          await base44.asServiceRole.functions.invoke('whatsappSend', { action: 'sendText', empresaId, groupId, clienteId, pedidoId: novo.id, templateKey: 'pedido_em_transito', vars, internal_token });
        } catch (_) {}
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: user.full_name || 'Sistema', usuario_id: user.id, acao: 'Criação', modulo: 'Comercial', tipo_auditoria: 'integracao', entidade: 'WhatsApp', descricao: 'Aviso de pedido em trânsito enviado', empresa_id: empresaId, group_id: groupId, dados_novos: { pedido_id: novo.id, numero_pedido: novo.numero_pedido }, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});