import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function nowIso() { return new Date().toISOString(); }

async function sendEmail(base44, to, subject, body) {
  if (!to) return;
  try {
    await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body });
  } catch (_) { /* ignore */ }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, entity_name, entity_id, value, comments, notify_to, aprovador_email, motivo } = await req.json().catch(() => ({}));

    if (!action) return Response.json({ error: 'action required' }, { status: 400 });

    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const api = base44.entities?.[entity_name];
    if (!api || !api.filter || !api.update) return Response.json({ error: 'Unsupported entity' }, { status: 400 });

    // load current row
    const rows = await api.filter({ id: String(entity_id) }, undefined, 1);
    const row = rows?.[0];
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });

    // helpers
    const writeAudit = async (acao, descricao, dados_novos = {}, dados_anteriores = {}) => {
      try {
        await base44.entities.AuditLog.create({
          acao, modulo: 'Comercial', tipo_auditoria: 'entidade', entidade: entity_name,
          registro_id: String(entity_id), descricao,
          dados_anteriores, dados_novos,
          data_hora: nowIso(), usuario: user.full_name || user.email, usuario_id: user.id,
          empresa_id: row.empresa_id || null, empresa_nome: row.empresa_nome || null,
        });
      } catch (_) {}
    };

    if (action === 'request') {
      const patch = {};
      if (entity_name === 'Pedido') {
        patch.status_aprovacao = 'pendente';
        if (typeof value === 'number') patch.desconto_solicitado_percentual = value;
        patch.usuario_solicitante_id = user.id;
      }
      const updated = await api.update(row.id, patch);
      await writeAudit('Aprovação', `Solicitação de aprovação para ${entity_name} ${row.id}.`, patch, {});
      await sendEmail(base44, aprovador_email || notify_to, `Aprovação pendente: ${entity_name} ${row.id}`,
        `Olá,\n\nExiste uma solicitação de aprovação para ${entity_name} ${row.id}.\nComentário: ${comments || '-'}\n\nAbra o ERP para decidir.`);
      return Response.json({ ok: true, updated });
    }

    if (action === 'decide') {
      const approved = String(value).toLowerCase() === 'aprovado' || value === true || value === 'approve';
      const patch = {};
      if (entity_name === 'Pedido') {
        patch.status_aprovacao = approved ? 'aprovado' : 'negado';
        patch.usuario_aprovador_id = user.id;
        patch.data_aprovacao = nowIso();
        if (comments) patch.comentarios_aprovacao = comments;
      }
      const updated = await api.update(row.id, patch);
      await writeAudit(approved ? 'Aprovação' : 'Rejeição', `Decisão: ${approved ? 'APROVADO' : 'NEGADO'} em ${entity_name} ${row.id}.`, patch, {});
      await sendEmail(base44, notify_to, `Decisão de aprovação: ${approved ? 'Aprovado' : 'Negado'}`,
        `Registro: ${entity_name} ${row.id}\nDecisor: ${user.full_name || user.email}\nComentário: ${comments || '-'}\nMotivo: ${motivo || '-'}\nData: ${nowIso()}`);
      return Response.json({ ok: true, updated });
    }

    if (action === 'acceptBudget') {
      if (entity_name !== 'Pedido') return Response.json({ error: 'acceptBudget only supports Pedido' }, { status: 400 });
      const patch = { tipo: 'Pedido', status: 'Aprovado', status_aprovacao: 'aprovado', usuario_aprovador_id: user.id, data_aprovacao: nowIso(), comentarios_aprovacao: comments || null };
      const updated = await api.update(row.id, patch);
      await writeAudit('Aprovação', `Cliente aceitou orçamento e converteu em pedido. Pedido ${row.id}.`, patch, {});
      await sendEmail(base44, notify_to, 'Orçamento aceito', `O orçamento ${row.numero_pedido || row.id} foi aceito pelo cliente.`);
      return Response.json({ ok: true, updated });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
});