import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Previsão de Churn com IA
 * Analisa comportamento do cliente e prevê risco de perda
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cliente_id } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cliente = await base44.entities.Cliente.get(cliente_id);
    if (!cliente) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Buscar histórico
    const pedidos = await base44.entities.Pedido.filter({ 
      cliente_id 
    }, '-data_pedido', 50);

    const interacoes = await base44.entities.Interacao.filter({ 
      cliente_id 
    }, '-data', 20);

    // Análise com IA
    const analise = await base44.integrations.Core.InvokeLLM({
      prompt: `Analise o risco de churn (perda) deste cliente B2B:

Cliente: ${cliente.nome}
Dias sem comprar: ${cliente.dias_sem_comprar || 0}
Total de pedidos: ${pedidos.length}
Valor compras 12 meses: R$ ${cliente.valor_compras_12meses || 0}
Última compra: ${cliente.data_ultima_compra || 'Nunca'}
Score pagamento: ${cliente.score_pagamento || 100}/100
Interações recentes: ${interacoes.length}

Histórico de pedidos (últimos 3):
${pedidos.slice(0, 3).map(p => `- ${p.data_pedido}: R$ ${p.valor_total}, Status: ${p.status}`).join('\n')}

Baseado nestes dados, calcule:
1. Risco de churn (Baixo, Médio, Alto, Crítico)
2. Probabilidade de churn (0-100%)
3. Motivos principais
4. Ações recomendadas`,
      response_json_schema: {
        type: 'object',
        properties: {
          risco_churn: { 
            type: 'string',
            enum: ['Baixo', 'Médio', 'Alto', 'Crítico']
          },
          probabilidade_churn: { type: 'number' },
          motivos: { 
            type: 'array',
            items: { type: 'string' }
          },
          acoes_recomendadas: {
            type: 'array',
            items: { type: 'string' }
          },
          score_saude: { type: 'number' }
        }
      }
    });

    // Atualizar cliente
    await base44.entities.Cliente.update(cliente_id, {
      risco_churn: analise.risco_churn,
      score_saude_cliente: analise.score_saude,
      proxima_acao: analise.acoes_recomendadas[0] ? {
        descricao: analise.acoes_recomendadas[0],
        responsavel: user.full_name
      } : undefined
    });

    // Auditoria IA
    await base44.entities.AuditoriaIA.create({
      tipo_operacao: 'Previsão Churn',
      entidade_afetada: 'Cliente',
      entidade_id: cliente_id,
      prompt_enviado: 'Analisar risco churn',
      resposta_ia: JSON.stringify(analise),
      confianca_score: analise.score_saude / 100,
      usuario: user.full_name,
      usuario_id: user.id
    });

    return Response.json({
      analise,
      mensagem: `Risco de Churn: ${analise.risco_churn} (${analise.probabilidade_churn}%)`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});