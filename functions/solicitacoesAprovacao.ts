import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const { action } = payload || {};

    if (action === 'create') {
      const {
        group_id,
        empresa_id,
        tipo_solicitacao,
        entidade_alvo,
        entidade_alvo_id,
        dados_propostos,
        justificativa,
        aprovador_id,
        perfil_aprovador_necessario
      } = payload;

      if (!group_id && !empresa_id) {
        return Response.json({ error: 'Contexto multiempresa obrigatório' }, { status: 400 });
      }

      const record = await base44.entities.SolicitacaoAprovacao.create({
        group_id: group_id || null,
        empresa_id: empresa_id || null,
        solicitante_id: user.id,
        solicitante_nome: user.full_name || user.email,
        tipo_solicitacao,
        entidade_alvo,
        entidade_alvo_id,
        dados_propostos,
        justificativa,
        aprovador_id: aprovador_id || null,
        perfil_aprovador_necessario: perfil_aprovador_necessario || null,
        status: 'pendente',
        data_solicitacao: new Date().toISOString()
      });

      try {
        await base44.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          empresa_id: empresa_id || null,
          acao: 'Criação',
          modulo: 'Comercial',
          entidade: 'SolicitacaoAprovacao',
          registro_id: record.id,
          descricao: `Solicitação criada (${tipo_solicitacao}) para ${entidade_alvo}#${entidade_alvo_id}`,
          dados_novos: record
        });
      } catch {}

      return Response.json(record);
    }

    if (action === 'approve' || action === 'reject') {
      const { solicitacao_id, comentarios_aprovacao } = payload;
      if (!solicitacao_id) return Response.json({ error: 'solicitacao_id é obrigatório' }, { status: 400 });

      // Verifica quem pode aprovar: admin ou possuir permissão via perfil (Comercial -> [aprovar])
      let can = user.role === 'admin';
      if (!can && user.perfil_acesso_id) {
        try {
          const perfil = await base44.entities.PerfilAcesso.get(user.perfil_acesso_id);
          const mod = perfil?.permissoes?.Comercial;
          if (mod) {
            // procura por qualquer seção com 'aprovar'
            can = Object.values(mod).some(v => Array.isArray(v) ? v.includes('aprovar') : false);
          }
        } catch {}
      }
      if (!can) return Response.json({ error: 'Forbidden' }, { status: 403 });

      const s = await base44.entities.SolicitacaoAprovacao.get(solicitacao_id);
      if (!s) return Response.json({ error: 'Solicitação não encontrada' }, { status: 404 });

      const novoStatus = action === 'approve' ? 'aprovado' : 'rejeitado';
      const updated = await base44.entities.SolicitacaoAprovacao.update(solicitacao_id, {
        status: novoStatus,
        comentarios_aprovacao: comentarios_aprovacao || null,
        data_decisao: new Date().toISOString()
      });

      try {
        await base44.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          empresa_id: s.empresa_id || null,
          acao: action === 'approve' ? 'Aprovação' : 'Rejeição',
          modulo: 'Comercial',
          entidade: 'SolicitacaoAprovacao',
          registro_id: solicitacao_id,
          descricao: `${action === 'approve' ? 'Aprovada' : 'Rejeitada'} para ${s.entidade_alvo}#${s.entidade_alvo_id}`,
          dados_novos: updated,
          dados_anteriores: s
        });
      } catch {}

      // Se aprovado e for desconto_pedido, aplica mudanças no pedido
      if (novoStatus === 'aprovado' && s.tipo_solicitacao === 'desconto_pedido' && s.entidade_alvo === 'Pedido') {
        try {
          const pedidoAtual = await base44.entities.Pedido.get(s.entidade_alvo_id);
          if (pedidoAtual) {
            const merged = { ...pedidoAtual, ...s.dados_propostos, status: 'Aprovado' };
            await base44.entities.Pedido.update(pedidoAtual.id, merged);
          }
        } catch {}
      }

      return Response.json(updated);
    }

    if (action === 'list') {
      const { status, tipo_solicitacao } = payload;
      const filtro = {};
      if (status) filtro.status = status;
      if (tipo_solicitacao) filtro.tipo_solicitacao = tipo_solicitacao;
      const items = await base44.entities.SolicitacaoAprovacao.filter(filtro, '-created_date', 50);
      return Response.json(items);
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});