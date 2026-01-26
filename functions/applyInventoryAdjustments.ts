import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { inventario_id } = await req.json();
    if (!inventario_id) return Response.json({ error: 'inventario_id é obrigatório' }, { status: 400 });

    const perm = await assertPermission(base44, ctx, 'Estoque', 'Inventario', 'editar');
    if (perm) return perm;

    const inv = await base44.asServiceRole.entities.Inventario.get(inventario_id);
    if (!inv) return Response.json({ error: 'Inventário não encontrado' }, { status: 404 });

    if (!Array.isArray(inv.itens) || inv.itens.length === 0) {
      return Response.json({ ok: true, skipped: true });
    }

    const movimentos = [];
    for (const item of inv.itens) {
      const delta = Number(item.ajuste || 0);
      if (!item.produto_id || delta === 0) continue;

      await base44.asServiceRole.entities.MovimentacaoEstoque.create({
        origem_movimento: 'ajuste',
        tipo_movimento: 'ajuste',
        produto_id: item.produto_id,
        produto_descricao: item.produto_descricao,
        quantidade: delta,
        unidade_medida: item.unidade || 'UN',
        empresa_id: inv.empresa_id,
        group_id: inv.group_id || null,
        data_movimentacao: new Date().toISOString(),
        motivo: `Ajuste inventário ${inventario_id}`,
        responsavel: user?.full_name || user?.email,
        responsavel_id: user?.id
      });
      movimentos.push(item.produto_id);
    }

    await base44.asServiceRole.entities.Inventario.update(inventario_id, {
      status: 'Concluído',
      aprovado_por: user?.full_name || user?.email,
      aprovado_por_id: user?.id,
      data_aprovacao: new Date().toISOString()
    });

    await audit(base44, user, { acao: 'Edição', modulo: 'Estoque', entidade: 'Inventario', registro_id: inventario_id, descricao: 'Aplicação de ajustes de inventário', dados_novos: { movimentos } });

    return Response.json({ ok: true, movimentos_count: movimentos.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});