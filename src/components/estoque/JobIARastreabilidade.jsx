import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Rastreabilidade Total (Lote → NF-e)
 * Executa: Sob demanda ou ao emitir NF-e
 * Cria: Mapa completo de rastreabilidade do produto
 */
export async function rastrearOrigem(produtoId, empresaId) {
  console.log('🔍 [IA Rastreabilidade] Rastreando origem...');

  const produto = await base44.entities.Produto.get(produtoId);

  // Buscar todas movimentações (mais recente primeiro)
  const movimentacoes = await base44.entities.MovimentacaoEstoque.filter({
    produto_id: produtoId,
    empresa_id: empresaId
  }, '-data_movimentacao', 500);

  // Mapa de rastreabilidade
  const rastreio = {
    produto_id: produtoId,
    produto_descricao: produto.descricao,
    estoque_atual: produto.estoque_atual || 0,
    cadeia_producao: [],
    cadeia_comercial: [],
    lotes_origem: [],
    fornecedores: [],
    nfes_entrada: [],
    nfes_saida: [],
    ops_consumo: [],
    pedidos_venda: []
  };

  for (const mov of movimentacoes) {
    // Entrada de matéria-prima
    if (mov.origem_movimento === 'compra' && mov.tipo_movimento === 'entrada') {
      rastreio.lotes_origem.push({
        lote: mov.lote,
        data_entrada: mov.data_movimentacao,
        quantidade_kg: mov.quantidade,
        fornecedor: mov.responsavel,
        nota_fiscal: mov.documento
      });

      if (mov.documento) {
        rastreio.nfes_entrada.push(mov.documento);
      }
    }

    // Consumo em produção
    if (mov.origem_movimento === 'producao' && mov.tipo_movimento === 'saida') {
      const op = await base44.entities.OrdemProducao.filter({
        id: mov.origem_documento_id
      });

      if (op.length > 0) {
        rastreio.ops_consumo.push({
          numero_op: op[0].numero_op,
          data_consumo: mov.data_movimentacao,
          quantidade_consumida_kg: mov.quantidade,
          produto_final: op[0].itens_producao?.[0]?.elemento || 'N/A'
        });
      }
    }

    // Saída para venda
    if (mov.origem_movimento === 'pedido' && mov.tipo_movimento === 'saida') {
      const pedido = await base44.entities.Pedido.filter({
        id: mov.origem_documento_id
      });

      if (pedido.length > 0) {
        rastreio.pedidos_venda.push({
          numero_pedido: pedido[0].numero_pedido,
          cliente: pedido[0].cliente_nome,
          data_venda: mov.data_movimentacao,
          quantidade_vendida_kg: mov.quantidade
        });
      }
    }

    // NF-e de saída
    if (mov.origem_movimento === 'nfe' && mov.tipo_movimento === 'saida') {
      rastreio.nfes_saida.push(mov.documento);
    }
  }

  // IA: Análise de Cadeia
  const analiseIA = await base44.integrations.Core.InvokeLLM({
    prompt: `Você é uma IA de Rastreabilidade e Compliance.

PRODUTO: ${produto.descricao}
ESTOQUE ATUAL: ${produto.estoque_atual || 0} KG

CADEIA IDENTIFICADA:
- Lotes de Origem: ${rastreio.lotes_origem.length}
- OPs de Consumo: ${rastreio.ops_consumo.length}
- NF-es Entrada: ${rastreio.nfes_entrada.length}
- NF-es Saída: ${rastreio.nfes_saida.length}
- Pedidos Venda: ${rastreio.pedidos_venda.length}

Dados Detalhados:
${JSON.stringify(rastreio, null, 2)}

TAREFA:
Analise a rastreabilidade completa e gere um relatório.

Retorne JSON com:
- rastreabilidade_completa: boolean (se tem origem conhecida)
- percentual_rastreado: number (0-100)
- lacunas_identificadas: array[string]
- conformidade_fiscal: "Conforme" | "Não Conforme" | "Parcial"
- observacoes: string`,
    response_json_schema: {
      type: 'object',
      properties: {
        rastreabilidade_completa: { type: 'boolean' },
        percentual_rastreado: { type: 'number' },
        lacunas_identificadas: { 
          type: 'array',
          items: { type: 'string' }
        },
        conformidade_fiscal: { type: 'string' },
        observacoes: { type: 'string' }
      }
    }
  });

  console.log(`✅ [IA Rastreabilidade] ${analiseIA.percentual_rastreado}% rastreado.`);
  return { ...rastreio, analise_ia: analiseIA };
}

export default rastrearOrigem;