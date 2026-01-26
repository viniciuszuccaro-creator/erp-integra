import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';

// Orquestra transições: Oportunidade -> OrcamentoCliente -> Pedido -> NotaFiscal
// Usado por automations (entity) em updates de OrcamentoCliente e Pedido
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);

    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || null;
    const data = payload?.data || payload?.record || payload?.pedido || payload?.orcamento || null;

    if (!event || !event.entity_name) {
      return Response.json({ error: 'Evento inválido' }, { status: 400 });
    }

    // Rotas por entidade
    if (event.entity_name === 'OrcamentoCliente' && event.type === 'update') {
      // Permissão Comercial para criar Pedido
      const permErr = await assertPermission(base44, ctx, 'Comercial', 'Pedido', 'criar');
      if (permErr) return permErr;

      if (!data) return Response.json({ ok: true, skipped: true, reason: 'Sem dados do orçamento' });
      const ctxErr = assertContextPresence({ empresa_id: data?.empresa_id, group_id: data?.group_id }, true);
      if (ctxErr) return ctxErr;

      const statusAtual = (data?.status || data?.situacao || '').toString().toLowerCase();
      if (!['confirmado', 'aprovado'].includes(statusAtual)) {
        return Response.json({ ok: true, skipped: true, reason: 'Orçamento não confirmado' });
      }

      // Evitar duplicidade: já existe Pedido para este orçamento?
      const existentes = await base44.asServiceRole.entities.Pedido.filter({ origem_pedido: 'Manual', origem_externa_id: data.id }, undefined, 1);
      if (existentes?.length) {
        return Response.json({ ok: true, skipped: true, reason: 'Pedido já criado' });
      }

      const pedido = await base44.asServiceRole.entities.Pedido.create({
        numero_pedido: `${Date.now()}`,
        tipo: 'Pedido',
        origem_pedido: 'Manual',
        origem_externa_id: data.id,
        group_id: data.group_id || null,
        empresa_id: data.empresa_id || null,
        data_pedido: new Date().toISOString().slice(0,10),
        cliente_id: data.cliente_id || null,
        cliente_nome: data.cliente_nome || data.cliente || 'Cliente',
        valor_total: Number(data?.valor_total || data?.total || 0),
        status: 'Aguardando Aprovação',
      });

      await audit(base44, ctx.user, { acao: 'Criação', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: `Pedido criado a partir do orçamento ${data.id}` });
      return Response.json({ ok: true, created_pedido_id: pedido.id });
    }

    if (event.entity_name === 'Pedido' && event.type === 'update') {
      // Permissão Fiscal para criar NF (rascunho)
      const permErr = await assertPermission(base44, ctx, 'Fiscal', 'NotaFiscal', 'criar');
      if (permErr) return permErr;
      if (!data) return Response.json({ ok: true, skipped: true, reason: 'Sem dados do pedido' });
      const ctxErr = assertContextPresence({ empresa_id: data?.empresa_id, group_id: data?.group_id }, true);
      if (ctxErr) return ctxErr;

      const status = (data?.status || '').toString();
      if (!['Pronto para Faturar', 'Faturado'].includes(status)) {
        return Response.json({ ok: true, skipped: true, reason: 'Pedido ainda não está pronto para NF' });
      }

      const jaExiste = await base44.asServiceRole.entities.NotaFiscal.filter({ pedido_id: data.id }, undefined, 1);
      if (jaExiste?.length) {
        return Response.json({ ok: true, skipped: true, reason: 'NF já existente para o pedido' });
      }

      const nf = await base44.asServiceRole.entities.NotaFiscal.create({
        numero: `${Date.now()}`,
        serie: '1',
        tipo: 'NF-e (Saída)',
        modelo: '55',
        natureza_operacao: 'Venda de Mercadorias',
        pedido_id: data.id,
        numero_pedido: data.numero_pedido || undefined,
        empresa_faturamento_id: data.empresa_id || null,
        empresa_atendimento_id: data.empresa_id || null,
        empresa_origem_id: data.empresa_id || null,
        group_id: data.group_id || null,
        data_emissao: new Date().toISOString().slice(0,10),
        valor_total: Number(data?.valor_total || 0),
        status: 'Rascunho',
      });

      await audit(base44, ctx.user, { acao: 'Criação', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: nf.id, descricao: `NF criada a partir do pedido ${data.id}` });
      return Response.json({ ok: true, created_nfe_id: nf.id });
    }

    return Response.json({ ok: true, skipped: true, reason: 'Evento não tratado' });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});