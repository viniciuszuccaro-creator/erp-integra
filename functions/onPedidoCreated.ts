import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event, data } = body || {};
    if (event?.type !== 'create' || !data) return Response.json({ ok: true, skipped: true });

    // Permissão: editar estoque e criar movimentação
    const perm = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (perm) return perm;

    const itensKeys = ['itens_revenda','itens_armado_padrao','itens_corte_dobra'];
    const movimentos = [];

    for (const key of itensKeys) {
      const itens = Array.isArray(data?.[key]) ? data[key] : [];
      for (const it of itens) {
        const produtoId = it?.produto_id;
        const quantidade = Number(it?.quantidade || 0);
        if (!produtoId || quantidade <= 0) continue;

        const [produto] = await base44.asServiceRole.entities.Produto.filter({ id: produtoId });
        const podeSomar = produto && (produto.unidade_estoque === it?.unidade || !it?.unidade);

        if (podeSomar) {
          const novoReservado = Number(produto.estoque_reservado || 0) + quantidade;
          await base44.asServiceRole.entities.Produto.update(produto.id, { estoque_reservado: novoReservado });
        }

        const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create({
          origem_movimento: 'pedido',
          tipo_movimento: 'reserva',
          produto_id: produtoId,
          produto_descricao: produto?.descricao,
          quantidade,
          unidade_medida: it?.unidade || produto?.unidade_estoque || 'UN',
          empresa_id: data?.empresa_id || null,
          group_id: data?.group_id || null,
          data_movimentacao: new Date().toISOString(),
          motivo: `Reserva para Pedido ${data?.numero_pedido || data?.id}`,
          valor_total: 0,
          responsavel: user?.full_name || user?.email,
          responsavel_id: user?.id
        });
        movimentos.push(mov?.id);
      }
    }

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque',
      registro_id: null, descricao: `Reservas criadas a partir do Pedido ${data?.id}`,
      dados_novos: { movimentos }
    });

    return Response.json({ ok: true, movimentos });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});