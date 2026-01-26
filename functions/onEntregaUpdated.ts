import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { event, data, old_data } = body || {};
    if (!event || event.type !== 'update' || !data) return Response.json({ ok: true, skipped: true });

    const statusChanged = data?.status && data?.status !== old_data?.status;
    if (!statusChanged) return Response.json({ ok: true, skipped: true });

    const results = { contas_pagar_criadas: [], movimentos_estoque: [] };

    // 1) Confirmação de entrega -> opcional ContaPagar do frete
    if (data.status === 'Entregue') {
      const frete = Number(data?.valor_frete || 0);
      const transportadoraNome = data?.transportadora || null;
      const transportadoraId = data?.transportadora_id || null;

      // Conta de frete a pagar (service role; RBAC verificado via guard)
      if (frete > 0 && (transportadoraId || transportadoraNome)) {
        await assertPermission(base44, ctx, 'Financeiro', 'ContaPagar', 'criar');
        // tenta localizar CC e Plano de Contas padrão para logística
        let centroId = null; let planoId = null;
        try {
          const ccs = await base44.asServiceRole.entities.CentroCusto.filter({ descricao: 'Logística', empresa_id: data.empresa_id });
          centroId = ccs?.[0]?.id || null;
        } catch {}
        try {
          const pcs = await base44.asServiceRole.entities.PlanoDeContas.filter({ descricao: 'Frete', empresa_id: data.empresa_id });
          planoId = pcs?.[0]?.id || null;
        } catch {}

        if (centroId && planoId) {
          try {
            const conta = await base44.asServiceRole.entities.ContaPagar.create({
              descricao: `Frete entrega pedido ${data?.numero_pedido || ''}`.trim(),
              fornecedor: transportadoraNome || 'Transportadora',
              fornecedor_id: transportadoraId || undefined,
              valor: frete,
              data_emissao: new Date().toISOString().slice(0,10),
              data_vencimento: new Date().toISOString().slice(0,10),
              status: 'Pendente',
              status_pagamento: 'Pendente',
              forma_pagamento: 'Boleto',
              empresa_id: data?.empresa_id || null,
              group_id: data?.group_id || null,
              centro_custo_id: centroId,
              plano_contas_id: planoId,
              observacoes: 'Gerada automaticamente na confirmação de entrega'
            });
            results.contas_pagar_criadas.push(conta?.id);
          } catch (e) {
            await audit(base44, user, { acao: 'Erro', modulo: 'Financeiro', entidade: 'ContaPagar', descricao: `Falha ao criar frete: ${e.message}` });
          }
        } else {
          await audit(base44, user, { acao: 'Visualização', modulo: 'Financeiro', entidade: 'ContaPagar', descricao: 'Sem CC/Plano padrão para frete; não foi criada ContaPagar.' });
        }
      }

      // Baixa final de estoque (saída genérica quando aplicável)
      try {
        await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
        const qtyKg = Number(data?.peso_total_kg || 0);
        const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create({
          origem_movimento: 'pedido',
          tipo_movimento: 'saida',
          produto_descricao: `Baixa por Entrega do Pedido ${data?.numero_pedido || ''}`.trim(),
          quantidade: qtyKg > 0 ? qtyKg : 1,
          unidade_medida: qtyKg > 0 ? 'KG' : 'UN',
          empresa_id: data?.empresa_id || null,
          group_id: data?.group_id || null,
          data_movimentacao: new Date().toISOString(),
          motivo: `Entrega ${data?.id} confirmada`,
          responsavel: user?.full_name || user?.email,
          responsavel_id: user?.id
        });
        results.movimentos_estoque.push(mov?.id);
      } catch (e) {
        await audit(base44, user, { acao: 'Erro', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', descricao: `Falha baixa por entrega: ${e.message}` });
      }

      await audit(base44, user, { acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: data.id, descricao: 'Entrega confirmada (gatilho financeiro/estoque)' });
    }

    // 2) Logística reversa -> entrada em estoque
    if (data.status === 'Devolvido' || data?.logistica_reversa?.ativada) {
      const permEst = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
      if (!permEst) {
        const qty = Number(data?.logistica_reversa?.quantidade_devolvida || 0);
        const val = Number(data?.logistica_reversa?.valor_devolvido || 0);
        if (qty > 0) {
          try {
            const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create({
              origem_movimento: 'devolucao',
              tipo_movimento: 'entrada',
              produto_id: data?.logistica_reversa?.produto_id || null,
              produto_descricao: data?.logistica_reversa?.motivo || 'Logística Reversa',
              quantidade: qty,
              unidade_medida: 'UN',
              empresa_id: data?.empresa_id || null,
              group_id: data?.group_id || null,
              data_movimentacao: new Date().toISOString(),
              motivo: `Logística Reversa da Entrega ${data?.id}`,
              valor_total: val,
              responsavel: user?.full_name || user?.email,
              responsavel_id: user?.id
            });
            results.movimentos_estoque.push(mov?.id);
          } catch (e) {
            await audit(base44, user, { acao: 'Erro', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', descricao: `Falha entrada reversa: ${e.message}` });
          }
        }
      }

      await audit(base44, user, { acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: data.id, descricao: 'Logística Reversa processada' });
    }

    return Response.json({ ok: true, ...results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});