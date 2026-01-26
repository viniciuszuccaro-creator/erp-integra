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
    if (!data) return Response.json({ error: 'Invalid payload' }, { status: 400 });

    // Apenas quando NF for Autorizada
    if (!(data?.status === 'Autorizada')) return Response.json({ ok: true, skipped: true });

    // Permissões
    const permCom = await assertPermission(base44, ctx, 'Comercial', 'Comissao', 'criar');
    if (permCom) return permCom;
    const permEst = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
    if (permEst) return permEst;

    const percPadrao = 5; // % padrão caso não exista regra
    // Tenta localizar pedido relacionado
    let pedido = null;
    if (data?.pedido_id) {
      const ps = await base44.asServiceRole.entities.Pedido.filter({ id: data.pedido_id });
      pedido = ps?.[0] || null;
    }

    const vendedor = pedido?.vendedor || data?.vendedor || (ctx.user?.full_name || ctx.user?.email);
    const vendedor_id = pedido?.vendedor_id || ctx.user?.id;
    const valor_venda = Number(pedido?.valor_total ?? data?.valor_total ?? 0);

    const comPayload = {
      vendedor,
      vendedor_id,
      pedido_id: pedido?.id || null,
      numero_pedido: pedido?.numero_pedido || null,
      cliente: data?.cliente_fornecedor || pedido?.cliente_nome || '',
      data_venda: data?.data_emissao || new Date().toISOString().slice(0,10),
      valor_venda,
      percentual_comissao: Number(pedido?.percentual_comissao || percPadrao),
      valor_comissao: Math.round(valor_venda * Number(pedido?.percentual_comissao || percPadrao) / 100 * 100) / 100,
      status: 'Pendente',
      observacoes: 'Gerada automaticamente na autorização da NF-e',
      group_id: data?.group_id || pedido?.group_id || null,
      empresa_id: data?.empresa_faturamento_id || pedido?.empresa_id || null
    };

    const created = await base44.asServiceRole.entities.Comissao.create(comPayload);

    // Gera movimentações de saída por itens da NF
    const itens = Array.isArray(data?.itens) ? data.itens : [];
    const movimentosSaida = [];
    for (const it of itens) {
      const pid = it?.produto_id;
      const qtd = Number(it?.quantidade || 0);
      if (!pid || qtd <= 0) continue;
      const [produto] = await base44.asServiceRole.entities.Produto.filter({ id: pid });
      if (produto) {
        // reduz reservado quando existir
        const novoReservado = Math.max(0, Number(produto.estoque_reservado || 0) - qtd);
        await base44.asServiceRole.entities.Produto.update(produto.id, { estoque_reservado: novoReservado });
      }
      const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create({
        origem_movimento: 'nfe',
        tipo_movimento: 'saida',
        produto_id: pid,
        produto_descricao: produto?.descricao || it?.descricao,
        quantidade: qtd,
        unidade_medida: it?.unidade || produto?.unidade_estoque || 'UN',
        empresa_id: data?.empresa_origem_id || data?.empresa_faturamento_id || pedido?.empresa_id || null,
        group_id: data?.group_id || pedido?.group_id || null,
        data_movimentacao: new Date().toISOString(),
        motivo: `Saída NF ${data?.numero || data?.id}`,
        valor_total: Number(it?.valor_total || 0),
        responsavel: user?.full_name || user?.email,
        responsavel_id: user?.id
      });
      movimentosSaida.push(mov?.id);
    }

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Comercial', entidade: 'Comissao', registro_id: created?.id,
      descricao: 'Comissão gerada automaticamente na autorização da NF', dados_novos: comPayload
    });

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', registro_id: null,
      descricao: `Saídas geradas pela NF ${data?.numero || data?.id}`,
      dados_novos: { movimentosSaida }
    });

    return Response.json({ ok: true, comissao_id: created?.id, movimentos_saida: movimentosSaida });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});