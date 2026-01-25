import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 3: Otimização de Rotas com IA
 * Calcula a melhor sequência de entregas usando IA + Google Maps
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entregas_ids, ponto_partida } = await req.json();

    if (!entregas_ids || entregas_ids.length === 0) {
      return Response.json({ error: 'IDs de entregas obrigatórios' }, { status: 400 });
    }

    // Buscar entregas
    const entregas = await base44.entities.Entrega.filter({
      id: { $in: entregas_ids }
    });

    if (entregas.length === 0) {
      return Response.json({ error: 'Nenhuma entrega encontrada' }, { status: 404 });
    }

    // Montar endereços para IA
    const enderecos = entregas.map(e => ({
      id: e.id,
      endereco: `${e.endereco_entrega_completo?.logradouro}, ${e.endereco_entrega_completo?.numero} - ${e.endereco_entrega_completo?.cidade}/${e.endereco_entrega_completo?.estado}`,
      lat: e.endereco_entrega_completo?.latitude,
      lng: e.endereco_entrega_completo?.longitude,
      prioridade: e.prioridade,
      janela_inicio: e.janela_entrega_inicio,
      janela_fim: e.janela_entrega_fim
    }));

    // Usar IA para otimizar rota
    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um especialista em logística. Otimize a sequência de entrega considerando:

Ponto de partida: ${ponto_partida || 'Depósito central'}

Entregas:
${enderecos.map((e, i) => `${i + 1}. ${e.endereco} (Prioridade: ${e.prioridade}, Janela: ${e.janela_inicio || 'N/A'} - ${e.janela_fim || 'N/A'})`).join('\n')}

Retorne a sequência otimizada considerando:
- Distância total minimizada
- Prioridades (Urgente > Alta > Normal > Baixa)
- Janelas de entrega preferenciais
- Evitar retornos desnecessários

Inclua também:
- Distância estimada total (km)
- Tempo estimado total (minutos)
- Justificativa da sequência`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          sequencia_otimizada: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs das entregas na ordem otimizada'
          },
          distancia_total_km: { type: 'number' },
          tempo_total_min: { type: 'number' },
          justificativa: { type: 'string' },
          alertas: {
            type: 'array',
            items: { type: 'string' },
            description: 'Alertas sobre conflitos de janela ou prioridade'
          }
        }
      }
    });

    // Registrar auditoria
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      usuario_id: user.id,
      acao: 'Criação',
      modulo: 'Expedição',
      entidade: 'Rota',
      descricao: `Otimização de rota com ${entregas.length} entregas via IA`,
      dados_novos: resultado,
      data_hora: new Date().toISOString()
    });

    return Response.json({
      success: true,
      rota_otimizada: resultado,
      entregas_detalhes: entregas
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});