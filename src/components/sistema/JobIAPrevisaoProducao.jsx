import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Previsão de Demanda de Produção
 * Executa: Semanalmente (domingo 23h)
 * Analisa: Histórico de pedidos + sazonalidade
 * Cria: Sugestões de planejamento semanal
 */
export async function executarIAPrevisaoProducao(empresaId) {
  console.log('🧠 [IA Previsão Produção] Iniciando...');

  // Buscar pedidos dos últimos 6 meses
  const dataCutoff = new Date();
  dataCutoff.setMonth(dataCutoff.getMonth() - 6);

  const pedidosHistorico = await base44.entities.Pedido.filter({
    empresa_id: empresaId,
    data_pedido: { $gte: dataCutoff.toISOString().split('T')[0] }
  }, '-data_pedido', 1000);

  // Agrupar por tipo de produção
  const pedidosPorTipo = {
    'corte_dobra': pedidosHistorico.filter(p => (p.itens_corte_dobra?.length || 0) > 0),
    'armado_padrao': pedidosHistorico.filter(p => (p.itens_armado_padrao?.length || 0) > 0),
    'revenda': pedidosHistorico.filter(p => (p.itens_revenda?.length || 0) > 0)
  };

  // Análise por semana
  const previsaoPorSemana = {};
  
  for (let i = 0; i < 26; i++) { // últimas 26 semanas
    const inicioSemana = new Date(dataCutoff);
    inicioSemana.setDate(inicioSemana.getDate() + (i * 7));
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 7);

    const semanaKey = `${inicioSemana.toISOString().split('T')[0]}`;
    
    const pedidosSemana = pedidosHistorico.filter(p => {
      const dataPedido = new Date(p.data_pedido);
      return dataPedido >= inicioSemana && dataPedido < fimSemana;
    });

    previsaoPorSemana[semanaKey] = {
      total_pedidos: pedidosSemana.length,
      valor_total: pedidosSemana.reduce((sum, p) => sum + (p.valor_total || 0), 0),
      peso_total_kg: pedidosSemana.reduce((sum, p) => sum + (p.peso_total_kg || 0), 0)
    };
  }

  // IA: Previsão para próximas 4 semanas
  const previsaoIA = await base44.integrations.Core.InvokeLLM({
    prompt: `Você é uma IA de Planejamento de Produção.

EMPRESA: ${empresaId}
PERÍODO ANALISADO: Últimos 6 meses

HISTÓRICO SEMANAL:
${JSON.stringify(previsaoPorSemana, null, 2)}

TENDÊNCIAS IDENTIFICADAS:
- Total Pedidos Corte/Dobra: ${pedidosPorTipo.corte_dobra.length}
- Total Pedidos Armado: ${pedidosPorTipo.armado_padrao.length}
- Total Pedidos Revenda: ${pedidosPorTipo.revenda.length}

TAREFA:
Preveja a demanda de produção para as próximas 4 semanas.

Considere:
1. Sazonalidade (detectar padrão mensal/semanal)
2. Tendência de crescimento/queda
3. Capacidade produtiva estimada
4. Períodos de alta demanda históricos

Retorne JSON com previsão para cada semana:
- semana_1 a semana_4
  - pedidos_previstos: number
  - peso_total_previsto_kg: number
  - horas_producao_necessarias: number
  - bitolas_criticas: array[string]
  - nivel_ocupacao: "Baixo" | "Normal" | "Alto" | "Crítico"
  - recomendacao: string`,
    response_json_schema: {
      type: 'object',
      properties: {
        semana_1: { 
          type: 'object',
          properties: {
            pedidos_previstos: { type: 'number' },
            peso_total_previsto_kg: { type: 'number' },
            horas_producao_necessarias: { type: 'number' },
            bitolas_criticas: { type: 'array', items: { type: 'string' } },
            nivel_ocupacao: { type: 'string' },
            recomendacao: { type: 'string' }
          }
        },
        semana_2: { 
          type: 'object',
          properties: {
            pedidos_previstos: { type: 'number' },
            peso_total_previsto_kg: { type: 'number' },
            horas_producao_necessarias: { type: 'number' },
            bitolas_criticas: { type: 'array', items: { type: 'string' } },
            nivel_ocupacao: { type: 'string' },
            recomendacao: { type: 'string' }
          }
        },
        semana_3: { 
          type: 'object',
          properties: {
            pedidos_previstos: { type: 'number' },
            peso_total_previsto_kg: { type: 'number' },
            horas_producao_necessarias: { type: 'number' },
            bitolas_criticas: { type: 'array', items: { type: 'string' } },
            nivel_ocupacao: { type: 'string' },
            recomendacao: { type: 'string' }
          }
        },
        semana_4: { 
          type: 'object',
          properties: {
            pedidos_previstos: { type: 'number' },
            peso_total_previsto_kg: { type: 'number' },
            horas_producao_necessarias: { type: 'number' },
            bitolas_criticas: { type: 'array', items: { type: 'string' } },
            nivel_ocupacao: { type: 'string' },
            recomendacao: { type: 'string' }
          }
        }
      }
    }
  });

  // Salvar previsão no sistema
  const configuracao = await base44.entities.ConfiguracaoSistema.filter({
    chave: 'previsao_producao_ia',
    categoria: 'Sistema'
  });

  if (configuracao.length > 0) {
    await base44.entities.ConfiguracaoSistema.update(configuracao[0].id, {
      configuracoes_sistema: {
        ultima_execucao: new Date().toISOString(),
        previsao_4_semanas: previsaoIA,
        historico_precisao: configuracao[0].configuracoes_sistema?.historico_precisao || []
      }
    });
  } else {
    await base44.entities.ConfiguracaoSistema.create({
      chave: 'previsao_producao_ia',
      categoria: 'Sistema',
      configuracoes_sistema: {
        ultima_execucao: new Date().toISOString(),
        previsao_4_semanas: previsaoIA
      }
    });
  }

  console.log('✅ [IA Previsão Produção] Previsão gerada para 4 semanas.');
  return previsaoIA;
}

export default executarIAPrevisaoProducao;