import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event, data, old_data } = await req.json();
    if (!event || !data) return Response.json({ ok: true, skipped: true });

    const ficouPronto = data?.status === 'Pronto para Faturar' && old_data?.status !== 'Pronto para Faturar';
    const ficouAprovado = data?.status === 'Aprovado' && old_data?.status !== 'Aprovado';
    if (!(ficouPronto || ficouAprovado)) return Response.json({ ok: true, skipped: true });

    const perm = await assertPermission(base44, ctx, 'Fiscal', 'NotaFiscal', 'criar');
    if (perm) return perm;

    // Monta dados mínimos para emissão de NF (modo simulado se não configurado)
    const itens = [];
    const coletar = (arr, unidadeFallback) => (Array.isArray(arr) ? arr : []).forEach(it => itens.push({
      produto_id: it.produto_id,
      codigo_produto: it.codigo_sku,
      descricao: it.produto_descricao || it.descricao,
      ncm: it.ncm || undefined,
      cfop: data?.cfop_pedido || undefined,
      unidade: it.unidade || unidadeFallback || 'UN',
      quantidade: Number(it.quantidade || 0),
      valor_unitario: Number(it.preco_unitario || it.valor_unitario || 0),
      valor_total: Number(it.valor_total || it.preco_venda_total || 0),
    }));
    coletar(data.itens_revenda, 'UN');
    coletar(data.itens_armado_padrao, 'UN');
    coletar(data.itens_corte_dobra, 'UN');

    const nfPayload = {
      numero_pedido: data.numero_pedido,
      pedido_id: data.id,
      cliente_fornecedor: data.cliente_nome,
      cliente_fornecedor_id: data.cliente_id,
      data_emissao: new Date().toISOString().slice(0,10),
      valor_total: data.valor_total || 0,
      empresa_faturamento_id: data.empresa_id,
      empresa_atendimento_id: data.empresa_id,
      empresa_origem_id: data.empresa_id,
      group_id: data.group_id || null,
      itens,
      natureza_operacao: data.natureza_operacao || 'Venda de Mercadorias',
      cfop: data.cfop_pedido || '5102',
      status: 'Rascunho'
    };

    // Dispara webhook ERP (se configurado) antes da emissão
    try {
      const empresaId = data?.empresa_id || nfPayload?.empresa_faturamento_id || null;
      let cfg = null;
      if (empresaId) {
        const c = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Integracoes', chave: `integracoes_${empresaId}` }, undefined, 1);
        cfg = c?.[0]?.erp || c?.[0]?.integracao_erp || null;
      }
      if (!cfg && data?.group_id) {
        const cg = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Integracoes', chave: `integracoes_group_${data.group_id}` }, undefined, 1);
        cfg = cg?.[0]?.erp || cg?.[0]?.integracao_erp || null;
      }
      if (cfg?.webhook_url) {
        await fetch(cfg.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(cfg.token ? { Authorization: `Bearer ${cfg.token}` } : {}) },
          body: JSON.stringify({ tipo: 'pedido_status', status: data?.status, pedido_id: data?.id, numero_pedido: data?.numero_pedido, empresa_id: empresaId, group_id: data?.group_id || null, nf_preview: nfPayload })
        }).catch(()=>null);
        try { await audit(base44, user, { acao: 'Execução', modulo: 'Integrações', entidade: 'ERP', descricao: 'Webhook disparado (Pedido→ERP)', dados_novos: { pedido: data?.id, status: data?.status }, empresa_id: empresaId, group_id: data?.group_id || null }); } catch {}
      }
    } catch (_) {}

    // Chama função fiscal (simulado quando não configurado)
    const res = await base44.asServiceRole.functions.invoke('nfeActions', { action: 'emitir', provider: 'enotas', data: nfPayload });
    const ok = res?.data && !res.data.error;

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Fiscal', entidade: 'NotaFiscal', registro_id: res?.data?.nota_fiscal_id || null,
      descricao: `NF disparada automaticamente a partir do Pedido ${data.numero_pedido}`,
      dados_novos: { payload: nfPayload, retorno: res?.data }
    });

    return Response.json({ ok: true, retorno: res?.data });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});