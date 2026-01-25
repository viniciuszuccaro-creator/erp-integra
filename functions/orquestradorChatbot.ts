import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Orquestrador Central do Chatbot Transacional
 * Interpreta mensagem, detecta intenção e executa ação ERP
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { mensagem, cliente_id, empresa_id } = await req.json();

    const user = await base44.auth.me();

    // Registrar interação
    await base44.entities.ChatbotInteracao.create({
      cliente_id,
      empresa_id,
      mensagem_usuario: mensagem,
      canal: 'Web',
      data_hora: new Date().toISOString()
    });

    // Usar IA para detectar intenção
    const deteccao = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um assistente ERP. Analise a mensagem do usuário e detecte a intenção.

Mensagem: "${mensagem}"

Intenções possíveis:
- consultar_pedido: usuário quer ver status de pedido
- criar_pedido: usuário quer fazer um pedido
- gerar_boleto: usuário quer gerar boleto/cobrança
- consultar_entrega: usuário quer rastrear entrega
- consultar_financeiro: usuário quer ver contas
- falar_com_vendedor: usuário quer atendimento humano
- outros: outras solicitações

Retorne a intenção detectada e parâmetros extraídos.`,
      response_json_schema: {
        type: 'object',
        properties: {
          intencao: { type: 'string' },
          confianca: { type: 'number' },
          parametros: { type: 'object' },
          resposta_sugerida: { type: 'string' }
        }
      }
    });

    const { intencao, parametros, resposta_sugerida } = deteccao;

    // Executar ação baseada na intenção
    let resultado = { resposta: resposta_sugerida };

    switch (intencao) {
      case 'consultar_pedido':
        resultado = await base44.functions.invoke('consultarPedido', { 
          cliente_id, 
          numero_pedido: parametros?.numero_pedido,
          empresa_id 
        });
        break;
      
      case 'gerar_boleto':
        resultado = await base44.functions.invoke('gerarBoletoChatbot', {
          cliente_id,
          valor: parametros?.valor,
          empresa_id
        });
        break;

      case 'consultar_entrega':
        const entregas = await base44.entities.Entrega.filter({ 
          cliente_id, 
          empresa_id 
        }, '-data_previsao', 5);
        resultado.resposta = `Você tem ${entregas.length} entregas ativas.`;
        resultado.entregas = entregas;
        break;
    }

    // Atualizar interação com resposta
    await base44.entities.ChatbotInteracao.create({
      cliente_id,
      empresa_id,
      mensagem_bot: resultado.resposta,
      intencao_detectada: intencao,
      acao_executada: intencao,
      data_hora: new Date().toISOString()
    });

    // Auditoria
    if (user) {
      await base44.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        empresa_id,
        acao: 'Interação Chatbot',
        modulo: 'Chatbot',
        entidade: 'ChatbotInteracao',
        descricao: `Intenção: ${intencao}`,
        dados_novos: { mensagem, intencao, resultado }
      });
    }

    return Response.json(resultado);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});