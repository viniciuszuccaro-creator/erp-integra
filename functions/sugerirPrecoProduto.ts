import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Sugestão Inteligente de Preço
 * Analisa mercado, histórico e custos
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { produto_id, empresa_id } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const produto = await base44.entities.Produto.get(produto_id);
    if (!produto) {
      return Response.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Buscar pedidos com este produto
    const pedidos = await base44.entities.Pedido.filter({ 
      empresa_id 
    }, '-data_pedido', 100);

    const vendasProduto = pedidos.filter(p => 
      p.itens_revenda?.some(i => i.produto_id === produto_id)
    );

    // Análise com IA
    const sugestao = await base44.integrations.Core.InvokeLLM({
      prompt: `Analise o preço ideal para este produto:

Produto: ${produto.descricao}
Custo atual: R$ ${produto.custo_medio || produto.custo_aquisicao || 0}
Preço venda atual: R$ ${produto.preco_venda || 0}
Margem mínima: ${produto.margem_minima_percentual || 10}%
Quantidade vendida 30 dias: ${produto.quantidade_vendida_30dias || 0}
Classificação ABC: ${produto.classificacao_abc || 'Sem Movimento'}

Histórico de vendas (últimos 5):
${vendasProduto.slice(0, 5).map(p => {
  const item = p.itens_revenda?.find(i => i.produto_id === produto_id);
  return `- ${p.data_pedido}: R$ ${item?.preco_unitario || 0} (${item?.quantidade || 0} un)`;
}).join('\n') || 'Sem histórico'}

Com base nestes dados, sugira:
1. Preço ótimo de venda
2. Margem de lucro resultante
3. Justificativa da sugestão
4. Elasticidade prevista`,
      response_json_schema: {
        type: 'object',
        properties: {
          preco_sugerido: { type: 'number' },
          margem_sugerida: { type: 'number' },
          justificativa: { type: 'string' },
          elasticidade: { 
            type: 'string',
            enum: ['Baixa', 'Média', 'Alta']
          },
          impacto_vendas: { type: 'string' }
        }
      }
    });

    // Auditoria IA
    await base44.entities.AuditoriaIA.create({
      tipo_operacao: 'Sugestão Preço',
      entidade_afetada: 'Produto',
      entidade_id: produto_id,
      prompt_enviado: 'Sugerir preço ótimo',
      resposta_ia: JSON.stringify(sugestao),
      confianca_score: 0.85,
      usuario: user.full_name,
      usuario_id: user.id
    });

    return Response.json({
      sugestao,
      mensagem: `💡 Preço sugerido: R$ ${sugestao.preco_sugerido?.toFixed(2)} (Margem: ${sugestao.margem_sugerida?.toFixed(1)}%)`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});