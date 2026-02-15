import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';
import { computeUpdatesForContaPagar, computeUpdatesForContaReceber } from './_lib/paymentStatusUtils.js';


Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { entity, id, action, justificativa } = await req.json();
    if (!['ContaPagar','ContaReceber'].includes(entity) || !id) {
      return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // RBAC por módulo Financeiro
    const perm = await assertPermission(base44, ctx, 'Financeiro', entity, 'editar');
    if (perm) return perm;

    const api = base44.asServiceRole.entities[entity];
    const registro = await api.get(id);

    let updates = {};
    if (entity === 'ContaPagar') {
      updates = computeUpdatesForContaPagar(action, justificativa, registro);
    } else if (entity === 'ContaReceber') {
      updates = computeUpdatesForContaReceber(action, justificativa, registro);
    }

    const updated = await api.update(id, updates);

    await audit(base44, user, {
      acao: 'Edição',
      modulo: 'Financeiro',
      entidade: entity,
      registro_id: id,
      descricao: `Transição pagamento: ${action}`,
      empresa_id: registro?.empresa_id || null,
      dados_anteriores: registro,
      dados_novos: { ...updates, __justificativa: justificativa || null }
    });

    return Response.json({ ok: true, data: updated });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});