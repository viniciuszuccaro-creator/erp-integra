import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Previsão de Conversão de Oportunidades
 * Score e temperatura do lead com IA
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { oportunidade_id } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oportunidade = await base44.entities.Oportunidade.get(oportunidade_id);
    if (!oportunidade) {
      return Response.json({ error: 'Oportunidade não encontrada' }, { status: 404 });
    }

    // Buscar interações
    const interacoes = await base44.entities.Interacao.filter({
      cliente_id: oportunidade.cliente_id
    }, '-data', 10);

    // Análise com IA
    const previsao = await base44.integrations.Core.InvokeLLM({
      prompt: `Analise esta oportunidade de venda e preveja a probabilidade de conversão:

Oportunidade: ${oportunidade.titulo}
Cliente: ${oportunidade.cliente_nome}
Valor estimado: R$ ${oportunidade.valor_estimado || 0}
Etapa atual: ${oportunidade.etapa_funil}
Origem: ${oportunidade.origem}
Dias desde criação: ${Math.floor((Date.now() - new Date(oportunidade.created_date).getTime()) / (1000*60*60*24))}

Interações recentes:
${interacoes.slice(0, 5).map(i => `- ${i.data}: ${i.tipo} - ${i.assunto}`).join('\n') || 'Sem interações'}

Retorne:
1. Probabilidade de conversão (0-100%)
2. Temperatura do lead (Frio, Morno, Quente)
3. Score (0-100)
4. Próximos passos recomendados
5. Previsão de fechamento (dias)`,
      response_json_schema: {
        type: 'object',
        properties: {
          probabilidade: { type: 'number' },
          temperatura: {
            type: 'string',
            enum: ['Frio', 'Morno', 'Quente']
          },
          score: { type: 'number' },
          proximos_passos: {
            type: 'array',
            items: { type: 'string' }
          },
          previsao_fechamento_dias: { type: 'number' },
          motivos_score: { type: 'string' }
        }
      }
    });

    // Atualizar oportunidade
    await base44.entities.Oportunidade.update(oportunidade_id, {
      probabilidade: previsao.probabilidade,
      temperatura: previsao.temperatura,
      score: previsao.score
    });

    // Auditoria IA
    await base44.entities.AuditoriaIA.create({
      tipo_operacao: 'Previsão Conversão',
      entidade_afetada: 'Oportunidade',
      entidade_id: oportunidade_id,
      prompt_enviado: 'Prever conversão',
      resposta_ia: JSON.stringify(previsao),
      confianca_score: previsao.score / 100,
      usuario: user.full_name,
      usuario_id: user.id
    });

    return Response.json({
      previsao,
      mensagem: `🎯 Score: ${previsao.score}/100 | Temperatura: ${previsao.temperatura} | Probabilidade: ${previsao.probabilidade}%`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});