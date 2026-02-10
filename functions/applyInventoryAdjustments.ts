import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';
import { computeMovements, persistMovements, buildFinalizePatch } from './_lib/inventoryUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    const event = payload?.event;
    const data = payload?.data;
    const inventario_id = payload?.inventario_id || data?.id || event?.entity_id;
    if (!inventario_id) return Response.json({ error: 'inventario_id é obrigatório' }, { status: 400 });

    if (data && data.status && data.status !== 'Aprovado') {
      return Response.json({ ok: true, skipped: true });
    }

    const perm = await assertPermission(base44, ctx, 'Estoque', 'Inventario', 'editar');
    if (perm) return perm;

    const inv = await base44.asServiceRole.entities.Inventario.get(inventario_id);
    if (!inv) return Response.json({ error: 'Inventário não encontrado' }, { status: 404 });

    const movimentoRecords = computeMovements(inv, user);
    if (movimentoRecords.length === 0) {
      return Response.json({ ok: true, skipped: true });
    }

    const movimentos = await persistMovements(base44, movimentoRecords);

    await base44.asServiceRole.entities.Inventario.update(inventario_id, buildFinalizePatch(user));

    await audit(base44, user, { acao: 'Edição', modulo: 'Estoque', entidade: 'Inventario', registro_id: inventario_id, descricao: 'Aplicação de ajustes de inventário', dados_novos: { movimentos } });

    return Response.json({ ok: true, movimentos_count: movimentos.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});