import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, assertContextPresence, audit } from './_lib/guard.js';

// Aplica ajustes de Inventario (gera MovimentacaoEstoque tipo 'ajuste')
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);

    const payload = await req.json().catch(() => ({}));
    const event = payload?.event || null;
    const inv = payload?.data || null;
    if (!event || event.entity_name !== 'Inventario' || !inv) {
      return Response.json({ ok: true, skipped: true });
    }

    const permErr = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (permErr) return permErr;

    const ctxErr = assertContextPresence({ empresa_id: inv?.empresa_id, group_id: inv?.group_id }, true);
    if (ctxErr) return ctxErr;

    const status = (inv?.status || '').toString();
    if (status !== 'Aprovado') {
      return Response.json({ ok: true, skipped: true, reason: 'Inventário não aprovado' });
    }

    const itens = Array.isArray(inv.itens) ? inv.itens : [];
    let count = 0;
    for (const it of itens) {
      const dif = Number(it?.diferenca || (Number(it?.contagem_fisica||0) - Number(it?.estoque_sistema||0)));
      if (!it?.produto_id || !dif) continue;
      await base44.asServiceRole.entities.MovimentacaoEstoque.create({
        group_id: inv.group_id || null,
        empresa_id: inv.empresa_id || null,
        origem_movimento: 'ajuste',
        origem_documento_id: inv.id,
        tipo_movimento: 'ajuste',
        produto_id: it.produto_id,
        produto_descricao: it.produto_descricao || 'Produto',
        quantidade: Math.abs(dif),
        unidade_medida: it.unidade || 'UN',
        data_movimentacao: new Date().toISOString(),
        motivo: dif > 0 ? 'Ajuste de inventário (entrada)' : 'Ajuste de inventário (saída)',
        valor_total: 0,
      });
      count++;
    }

    await audit(base44, ctx.user, { acao: 'Edição', modulo: 'Estoque', entidade: 'Inventario', registro_id: inv.id, descricao: `Aplicado inventário (${count} ajustes)` });
    return Response.json({ ok: true, ajustes: count });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});