import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

// Workflow de pagamento - aprovar e pagar títulos (ContaPagar)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);

    const { entity = 'ContaPagar', id, action, payload = {} } = await req.json();
    if (!id || !action) return Response.json({ error: 'id e action são obrigatórios' }, { status: 400 });

    // Permissões de Financeiro
    if (action === 'solicitar_aprovacao') {
      const perm = await assertPermission(base44, ctx, 'Financeiro', entity, 'editar');
      if (perm) return perm;
    } else if (action === 'aprovar' || action === 'rejeitar') {
      const perm = await assertPermission(base44, ctx, 'Financeiro', entity, 'aprovar');
      if (perm) return perm;
    } else if (action === 'pagar') {
      const perm = await assertPermission(base44, ctx, 'Financeiro', entity, 'editar');
      if (perm) return perm;
    }

    const atual = await base44.entities[entity].get(id);
    if (!atual) return Response.json({ error: 'Título não encontrado' }, { status: 404 });

    let patch = {};
    if (action === 'solicitar_aprovacao') {
      patch.status_pagamento = 'Aguardando Aprovação';
    } else if (action === 'aprovar') {
      patch.status_pagamento = 'Aprovado';
      patch.aprovado_por_id = ctx.user?.id || null;
      patch.data_aprovacao = new Date().toISOString();
    } else if (action === 'rejeitar') {
      patch.status_pagamento = 'Rejeitado';
      patch.rejeitado_por = ctx.user?.full_name || ctx.user?.email || 'Usuário';
      patch.motivo_rejeicao = payload?.motivo || '';
    } else if (action === 'pagar') {
      patch.status_pagamento = 'Pago';
      patch.status = 'Pago';
      patch.data_pagamento = payload?.data_pagamento || new Date().toISOString().slice(0,10);
      patch.valor_pago = payload?.valor_pago ?? atual.valor;
      patch.detalhes_pagamento = {
        ...(atual.detalhes_pagamento || {}),
        forma_pagamento: payload?.forma_pagamento || atual?.forma_pagamento || 'Transferência',
        data_recebido_caixa: payload?.data_pagamento || new Date().toISOString().slice(0,10),
        status_compensacao: 'Aguardando'
      };
    } else {
      return Response.json({ error: 'Ação inválida' }, { status: 400 });
    }

    const atualizado = await base44.entities[entity].update(id, patch);
    await audit(base44, ctx.user, { acao: 'Edição', modulo: 'Financeiro', entidade: entity, registro_id: id, descricao: `Workflow pagamento: ${action}` });

    return Response.json({ ok: true, data: atualizado });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});