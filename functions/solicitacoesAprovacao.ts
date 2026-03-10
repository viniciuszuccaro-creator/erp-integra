import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function isoNow() { return new Date().toISOString(); }

async function rbacGuard(base44, { module = 'Comercial', section = 'Aprovacoes', action = 'visualizar', empresa_id = null, group_id = null }) {
  try {
    const res = await base44.functions.invoke('entityGuard', { module, section, action, empresa_id, group_id });
    if (res?.data && res.data.allowed === false) {
      return { ok: false, resp: Response.json({ error: 'Forbidden' }, { status: 403 }) };
    }
  } catch (_) { /* Em caso de erro do guard, não bloquear automaticamente */ }
  return { ok: true };
}

function assertContext({ empresa_id, group_id }) {
  if (!empresa_id && !group_id) {
    return Response.json({ error: 'Contexto multiempresa obrigatório (empresa_id ou group_id)' }, { status: 422 });
  }
  return null;
}

async function notifyApprovers(base44, { titulo, corpo, empresa_id, group_id }) {
  try {
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
    for (const adm of admins || []) {
      if (adm?.email) {
        try { await base44.functions.invoke('sendEmailProvider', { to: adm.email, subject: titulo, body: corpo }); } catch { /* ignore */ }
      }
      // WhatsApp para aprovadores (se houver Colaborador vinculado com telefone)
      try {
        const col = (await base44.asServiceRole.entities.Colaborador.filter({ vincular_a_usuario_id: adm.id }, undefined, 1))?.[0];
        const numero = col?.whatsapp || col?.telefone || null;
        if (numero) {
          await base44.functions.invoke('whatsappSend', { action: 'sendText', numero, mensagem: `${titulo}\n${corpo}`.slice(0, 900), empresaId: empresa_id || null, groupId: group_id || null });
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const { action } = payload || {};

    if (action === 'create') {
      const {
        group_id = null,
        empresa_id = null,
        tipo_solicitacao,
        entidade_alvo,
        entidade_alvo_id,
        dados_propostos = null,
        justificativa = null,
      } = payload || {};

      const ctxErr = assertContext({ empresa_id, group_id });
      if (ctxErr) return ctxErr;

      const guard = await rbacGuard(base44, { module: 'Comercial', section: 'Aprovacoes', action: 'criar', empresa_id, group_id });
      if (!guard.ok) return guard.resp;

      if (!tipo_solicitacao || !entidade_alvo || !entidade_alvo_id) {
        return Response.json({ error: 'Campos obrigatórios: tipo_solicitacao, entidade_alvo, entidade_alvo_id' }, { status: 400 });
      }

      // Política piloto rígida: toda solicitação exige Diretoria (admin)
      const record = await base44.entities.SolicitacaoAprovacao.create({
        group_id,
        empresa_id,
        solicitante_id: user.id,
        solicitante_nome: user.full_name || user.email,
        tipo_solicitacao,
        entidade_alvo,
        entidade_alvo_id: String(entidade_alvo_id),
        dados_propostos,
        justificativa,
        perfil_aprovador_necessario: 'Diretoria',
        status: 'pendente',
        data_solicitacao: isoNow(),
      });

      try {
        await base44.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          empresa_id,
          group_id,
          acao: 'Criação',
          modulo: 'Comercial',
          tipo_auditoria: 'entidade',
          entidade: 'SolicitacaoAprovacao',
          registro_id: record.id,
          descricao: `Solicitação criada (${tipo_solicitacao}) para ${entidade_alvo}#${entidade_alvo_id}`,
          dados_novos: record,
          data_hora: isoNow(),
        });
      } catch {}

      await notifyApprovers(base44, {
        titulo: `Aprovação pendente: ${tipo_solicitacao} • ${entidade_alvo} #${entidade_alvo_id}`,
        corpo: `Perfil: Diretoria (piloto rígido)\nSolicitante: ${user.full_name || user.email}\nJustificativa: ${justificativa || '-'}\nEmpresa: ${empresa_id || '-'} • Grupo: ${group_id || '-'}`,
        empresa_id,
        group_id,
      });

      return Response.json(record);
    }

    if (action === 'approve' || action === 'reject') {
      const { solicitacao_id, comentarios_aprovacao = null, empresa_id = null, group_id = null } = payload || {};
      if (!solicitacao_id) return Response.json({ error: 'solicitacao_id é obrigatório' }, { status: 400 });
      const ctxErr = assertContext({ empresa_id, group_id });
      if (ctxErr) return ctxErr;

      const guard = await rbacGuard(base44, { module: 'Comercial', section: 'Aprovacoes', action: 'aprovar', empresa_id, group_id });
      if (!guard.ok) return guard.resp;

      // Carrega solicitação
      const s = (await base44.entities.SolicitacaoAprovacao.filter({ id: String(solicitacao_id) }, undefined, 1))?.[0];
      if (!s) return Response.json({ error: 'Solicitação não encontrada' }, { status: 404 });

      // Piloto rígido: apenas diretoria (admin) pode aprovar/rejeitar
      if (s?.perfil_aprovador_necessario === 'Diretoria' && user.role !== 'admin') {
        return Response.json({ error: 'Apenas diretoria pode decidir esta solicitação' }, { status: 403 });
      }

      const novoStatus = action === 'approve' ? 'aprovado' : 'rejeitado';
      const updated = await base44.entities.SolicitacaoAprovacao.update(s.id, {
        status: novoStatus,
        comentarios_aprovacao: comentarios_aprovacao || null,
        data_decisao: isoNow(),
      });

      try {
        await base44.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          empresa_id: s.empresa_id || empresa_id || null,
          group_id: s.group_id || group_id || null,
          acao: novoStatus === 'aprovado' ? 'Aprovação' : 'Rejeição',
          modulo: 'Comercial',
          tipo_auditoria: 'entidade',
          entidade: 'SolicitacaoAprovacao',
          registro_id: s.id,
          descricao: `${novoStatus === 'aprovado' ? 'Aprovada' : 'Rejeitada'} para ${s.entidade_alvo}#${s.entidade_alvo_id}`,
          dados_novos: updated,
          dados_anteriores: s,
          data_hora: isoNow(),
        });
      } catch {}

      // Aplicação mínima da decisão (sequência: aplica efeito → auditoria de entidade alvo é tratada em flows existentes)
      if (novoStatus === 'aprovado') {
        try {
          if (s.entidade_alvo === 'Pedido') {
            const ped = (await base44.entities.Pedido.filter({ id: s.entidade_alvo_id }, undefined, 1))?.[0];
            if (ped) {
              const patch = { ...(s.dados_propostos || {}), status_aprovacao: 'aprovado', usuario_aprovador_id: user.id, data_aprovacao: isoNow() };
              await base44.entities.Pedido.update(ped.id, patch);
            }
          } else if (s.entidade_alvo === 'ContaPagar') {
            const cp = (await base44.entities.ContaPagar.filter({ id: s.entidade_alvo_id }, undefined, 1))?.[0];
            if (cp) { await base44.entities.ContaPagar.update(cp.id, { status_pagamento: 'Aprovado' }); }
          } else if (s.entidade_alvo === 'ContaReceber') {
            // Em geral não há aprovação financeira de CR; mantemos como exemplo de genericidade
          }
        } catch { /* nunca quebra a resposta */ }
      }

      return Response.json(updated);
    }

    if (action === 'list') {
      const { status = null, tipo_solicitacao = null, empresa_id = null, group_id = null } = payload || {};
      const ctxErr = assertContext({ empresa_id, group_id });
      if (ctxErr) return ctxErr;

      const guard = await rbacGuard(base44, { module: 'Comercial', section: 'Aprovacoes', action: 'visualizar', empresa_id, group_id });
      if (!guard.ok) return guard.resp;

      const filtro = {};
      if (status) filtro.status = status;
      if (tipo_solicitacao) filtro.tipo_solicitacao = tipo_solicitacao;
      if (empresa_id) filtro.empresa_id = empresa_id;
      if (group_id) filtro.group_id = group_id;

      const items = await base44.entities.SolicitacaoAprovacao.filter(filtro, '-created_date', 50);
      return Response.json(items);
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});