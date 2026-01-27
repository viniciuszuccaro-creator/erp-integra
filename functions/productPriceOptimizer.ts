import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    let payload; try { payload = await req.json(); } catch { payload = {}; }
    const event = payload?.event || null;
    const entityId = event?.entity_id || payload?.produto_id;
    if (!entityId) return Response.json({ error: 'produto_id obrigatório' }, { status: 400 });

    const produto = payload?.data || await base44.asServiceRole.entities.Produto.get(entityId);

    const prompt = `Sugira preco_venda e margem_minima_percentual para o produto com base nos dados. Responda JSON.\nDados: ${JSON.stringify({
      descricao: produto?.descricao,
      custo_medio: produto?.custo_medio,
      custo_aquisicao: produto?.custo_aquisicao,
      preco_venda_atual: produto?.preco_venda,
      quantidade_vendida_12meses: produto?.quantidade_vendida_12meses,
      classificacao_abc: produto?.classificacao_abc,
      grupo: produto?.grupo,
      unidade_principal: produto?.unidade_principal,
    })}`;

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          preco_venda: { type: 'number' },
          margem_minima_percentual: { type: 'number' },
        },
      },
    });

    const patch = {};
    if (typeof res?.preco_venda === 'number') patch.preco_venda = Math.max(0, res.preco_venda);
    if (typeof res?.margem_minima_percentual === 'number') patch.margem_minima_percentual = Math.max(0, Math.min(100, Math.round(res.margem_minima_percentual)));

    if (Object.keys(patch).length) {
      await base44.asServiceRole.entities.Produto.update(entityId, patch);
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'automacao',
        acao: 'Edição',
        modulo: 'Estoque',
        entidade: 'Produto',
        registro_id: entityId,
        descricao: 'Preço e margem otimizados por IA',
        dados_novos: patch,
        duracao_ms: Date.now() - t0,
      });
    } catch {}

    return Response.json({ success: true, updated: patch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});