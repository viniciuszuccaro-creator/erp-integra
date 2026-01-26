import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

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

    const updates = {};
    if (entity === 'ContaPagar') {
      if (action === 'aprovar') {
        updates.status_pagamento = 'Aprovado';
      } else if (action === 'pagar') {
        updates.status_pagamento = 'Pago';
        updates.status = 'Pago';
        updates.data_pagamento = new Date().toISOString().slice(0,10);
        updates.detalhes_pagamento = {
          ...(registro?.detalhes_pagamento || {}),
          status_compensacao: 'Aguardando'
        };
      } else if (action === 'cancelar') {
        updates.status_pagamento = 'Cancelado';
        updates.motivo_rejeicao = justificativa || 'Cancelado';
      }
    } else if (entity === 'ContaReceber') {
      if (action === 'receber') {
        updates.status = 'Recebido';
        updates.data_recebimento = new Date().toISOString().slice(0,10);
        updates.detalhes_pagamento = {
          ...(registro?.detalhes_pagamento || {}),
          status_compensacao: 'Aguardando'
        };
      } else if (action === 'cancelar') {
        updates.status = 'Cancelado';
        updates.motivo_rejeicao = justificativa || 'Cancelado';
      }
    }

    const updated = await api.update(id, updates);

    await audit(base44, user, { acao: 'Edição', modulo: 'Financeiro', entidade: entity, registro_id: id, descricao: `Transição pagamento: ${action}`, dados_novos: updates });

    return Response.json({ ok: true, data: updated });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});