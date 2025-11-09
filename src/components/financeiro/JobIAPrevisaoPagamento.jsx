import { base44 } from "@/api/base44Client";

/**
 * V21.3 - Job IA: Previsão de Pagamento
 * Executa: Diariamente (3h da manhã)
 * Calcula: índice de probabilidade de pagamento (0-100%)
 */
export async function executarIAPrevisaoPagamento(empresaId) {
  console.log('🧠 IA Previsão de Pagamento iniciada...');

  const contas = await base44.entities.ContaReceber.filter({
    empresa_id: empresaId,
    status: { $in: ['Pendente', 'Atrasado'] }
  });

  const resultados = [];

  for (const conta of contas) {
    if (!conta.cliente_id) continue;

    // Buscar histórico do cliente
    const cliente = await base44.entities.Cliente.get(conta.cliente_id);
    const historicoContas = await base44.entities.ContaReceber.filter({
      cliente_id: conta.cliente_id,
      status: 'Recebido'
    }, '-data_recebimento', 50);

    // IA: Analisar padrão de pagamento
    const analiseIA = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é uma IA de Análise de Crédito e Risco.

CLIENTE:
- Nome: ${cliente.nome}
- Classificação ABC: ${cliente.classificacao_abc}
- Score Pagamento: ${cliente.score_pagamento || 100}
- Dias Atraso Médio: ${cliente.dias_atraso_medio || 0}
- Valor Compras 12m: R$ ${cliente.valor_compras_12meses || 0}

HISTÓRICO DE PAGAMENTOS (últimos):
${JSON.stringify(historicoContas.slice(0, 10).map(h => ({
  valor: h.valor,
  vencimento: h.data_vencimento,
  pagamento: h.data_recebimento,
  dias_atraso: Math.floor((new Date(h.data_recebimento) - new Date(h.data_vencimento)) / (1000*60*60*24))
})), null, 2)}

TÍTULO ATUAL:
- Valor: R$ ${conta.valor}
- Vencimento: ${conta.data_vencimento}
- Dias até vencer: ${Math.floor((new Date(conta.data_vencimento) - new Date()) / (1000*60*60*24))}
- Dias de atraso: ${conta.dias_atraso || 0}

TAREFA:
Calcule a probabilidade (0-100%) de este título ser pago no prazo ou com atraso tolerável (<10 dias).

Considere:
1. Histórico de pagamento do cliente (peso 40%)
2. Score de pagamento (peso 20%)
3. Classificação ABC (peso 15%)
4. Dias de atraso médio (peso 15%)
5. Valor do título vs ticket médio (peso 10%)

Retorne JSON com:
- indice_previsao: número (0-100)
- confianca_analise: número (0-100)
- fatores_risco: [strings]
- recomendacao: string`,
      response_json_schema: {
        type: 'object',
        properties: {
          indice_previsao: { type: 'number' },
          confianca_analise: { type: 'number' },
          fatores_risco: { 
            type: 'array',
            items: { type: 'string' }
          },
          recomendacao: { type: 'string' }
        }
      }
    });

    // Atualizar conta
    await base44.entities.ContaReceber.update(conta.id, {
      indice_previsao_pagamento: analiseIA.indice_previsao
    });

    resultados.push({
      conta_id: conta.id,
      cliente: conta.cliente,
      indice_calculado: analiseIA.indice_previsao,
      confianca: analiseIA.confianca_analise
    });
  }

  console.log(`✅ IA Previsão concluída. ${resultados.length} títulos atualizados.`);
  return resultados;
}

export default executarIAPrevisaoPagamento;