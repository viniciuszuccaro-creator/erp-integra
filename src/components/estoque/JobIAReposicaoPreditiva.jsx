import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Reposição Preditiva
 * Executa: Diariamente (4h da manhã)
 * Cria: SolicitacaoCompra automática baseada em previsão de demanda
 */
export async function executarIAReposicaoPreditiva(empresaId) {
  console.log('🧠 IA Reposição Preditiva iniciada...');

  const produtos = await base44.entities.Produto.filter({
    empresa_id: empresaId,
    status: 'Ativo'
  });

  const solicitacoesCriadas = [];

  for (const produto of produtos) {
    const estoqueDisponivel = produto.estoque_disponivel || 0;
    const estoqueMinimo = produto.estoque_minimo || 0;
    const leadTimeDias = produto.prazo_entrega_padrao || 7;

    // Verificar se já está abaixo do mínimo
    if (estoqueDisponivel >= estoqueMinimo) continue;

    // Buscar histórico de vendas (últimos 90 dias)
    const dataCutoff = new Date();
    dataCutoff.setDate(dataCutoff.getDate() - 90);

    const vendasHistorico = await base44.entities.MovimentacaoEstoque.filter({
      produto_id: produto.id,
      tipo_movimento: 'saida',
      origem_movimento: { $in: ['pedido', 'producao'] }
    }, '-data_movimentacao', 100);

    const vendasRecentes = vendasHistorico.filter(v => 
      new Date(v.data_movimentacao) >= dataCutoff
    );

    // IA: Previsão de Demanda
    const analiseIA = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é uma IA de Gestão de Estoque e Supply Chain.

PRODUTO:
- Descrição: ${produto.descricao}
- Estoque Disponível: ${estoqueDisponivel.toFixed(2)} KG
- Estoque Mínimo: ${estoqueMinimo.toFixed(2)} KG
- Estoque Máximo: ${produto.estoque_maximo || 0} KG
- Lead Time Fornecedor: ${leadTimeDias} dias

HISTÓRICO DE VENDAS (últimos 90 dias):
Total de Movimentações: ${vendasRecentes.length}
${JSON.stringify(vendasRecentes.slice(0, 20).map(v => ({
  data: v.data_movimentacao,
  quantidade_kg: v.quantidade,
  origem: v.origem_movimento
})), null, 2)}

TAREFA:
Calcule a demanda prevista para os próximos ${leadTimeDias + 7} dias e sugira a quantidade ideal de reposição.

Considere:
1. Média móvel de consumo diário (últimos 30 dias)
2. Sazonalidade (se houver padrão)
3. Estoque de segurança (20% acima do mínimo)
4. Lead time do fornecedor

Retorne JSON com:
- demanda_prevista_kg: número
- quantidade_sugerida_compra_kg: número
- nivel_urgencia: "Baixa" | "Média" | "Alta" | "Crítica"
- justificativa: string
- fornecedor_sugerido_id: string (se disponível)`,
      response_json_schema: {
        type: 'object',
        properties: {
          demanda_prevista_kg: { type: 'number' },
          quantidade_sugerida_compra_kg: { type: 'number' },
          nivel_urgencia: { type: 'string' },
          justificativa: { type: 'string' },
          fornecedor_sugerido_id: { type: 'string' }
        }
      }
    });

    // Criar Solicitação de Compra
    const solicitacao = await base44.entities.SolicitacaoCompra.create({
      numero_solicitacao: `IA-${Date.now()}`,
      data_solicitacao: new Date().toISOString().split('T')[0],
      solicitante: 'IA Reposição Preditiva',
      setor: 'Estoque',
      produto_id: produto.id,
      produto_descricao: produto.descricao,
      quantidade_solicitada: analiseIA.quantidade_sugerida_compra_kg,
      unidade_medida: 'KG',
      justificativa: analiseIA.justificativa,
      prioridade: analiseIA.nivel_urgencia,
      data_necessidade: new Date(Date.now() + leadTimeDias * 24*60*60*1000).toISOString().split('T')[0],
      status: 'Pendente'
    });

    solicitacoesCriadas.push(solicitacao);
  }

  console.log(`✅ IA Reposição concluída. ${solicitacoesCriadas.length} solicitações criadas.`);
  return solicitacoesCriadas;
}

export default function IAControlStockTab({ empresaId }) {
  // ... state ...

  return (
    <div className="space-y-6">
      {/* KPIs IA */}
      {/* ... grid com cards ... */}

      {/* Botão Executar IA */}
      <Card className="border-2 border-green-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">Reposição Preditiva</p>
              <p className="text-sm text-slate-600">
                Analisa demanda, lead time e cria solicitações automaticamente
              </p>
            </div>
            <Button
              onClick={executarReposicaoIA}
              disabled={executandoIA}
              className="bg-green-600 hover:bg-green-700"
            >
              {executandoIA ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Executar IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="disponivel" fill="#ef4444" name="Disponível" />
                <Bar dataKey="minimo" fill="#f59e0b" name="Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}