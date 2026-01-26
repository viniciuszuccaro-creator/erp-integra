import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';

// Gera saída de estoque quando a NF é autorizada
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);

    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || null;
    const nf = payload?.data || null;
    if (!event || event.entity_name !== 'NotaFiscal' || !nf) {
      return Response.json({ ok: true, skipped: true });
    }

    const permErr = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (permErr) return permErr;

    const ctxErr = assertContextPresence({ empresa_id: nf?.empresa_origem_id || nf?.empresa_faturamento_id, group_id: nf?.group_id }, true);
    if (ctxErr) return ctxErr;

    const status = (nf?.status || '').toString();
    if (status !== 'Autorizada') {
      return Response.json({ ok: true, skipped: true, reason: 'NF não autorizada' });
    }

    const jaExiste = await base44.asServiceRole.entities.MovimentacaoEstoque.filter({ origem_documento_id: nf.id, tipo_movimento: 'saida' }, undefined, 1);
    if (jaExiste?.length) {
      return Response.json({ ok: true, skipped: true, reason: 'Saída já lançada' });
    }

    const itens = Array.isArray(nf.itens) ? nf.itens : [];
    let count = 0;
    for (const it of itens) {
      if (!it?.produto_id || !it?.quantidade) continue;
      await base44.asServiceRole.entities.MovimentacaoEstoque.create({
        group_id: nf.group_id || null,
        empresa_id: nf.empresa_origem_id || nf.empresa_faturamento_id || null,
        origem_movimento: 'nfe',
        origem_documento_id: nf.id,
        tipo_movimento: 'saida',
        produto_id: it.produto_id,
        produto_descricao: it.descricao || 'Produto',
        codigo_produto: it.codigo_produto || undefined,
        quantidade: Number(it.quantidade),
        unidade_medida: it.unidade || 'UN',
        data_movimentacao: new Date().toISOString(),
        valor_total: Number(it.valor_total || 0),
        motivo: 'Saída por NF-e autorizada',
      });
      count++;
    }

    await audit(base44, ctx.user, { acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', registro_id: null, descricao: `Saída gerada pela NF ${nf.id} (${count} itens)` });
    return Response.json({ ok: true, saidas: count });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});