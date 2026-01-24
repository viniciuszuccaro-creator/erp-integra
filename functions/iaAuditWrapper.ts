import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * IA AUDIT WRAPPER - Auditoria de Chamadas de IA
 * Registra todas as interações com modelos de IA
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prompt, model, response } = await req.json();

    const user = await base44.auth.me();

    // Registrar auditoria da chamada IA
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || 'Sistema',
      usuario_id: user?.id || 'auto',
      acao: 'Execução',
      modulo: 'IA',
      entidade: 'LLM',
      descricao: `Chamada IA com modelo "${model}"`,
      dados_novos: { 
        model,
        promptLength: prompt?.length || 0,
        hasResponse: !!response
      },
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({ 
      valid: true,
      message: 'Chamada IA auditada com sucesso'
    });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});