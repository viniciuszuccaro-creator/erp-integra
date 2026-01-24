import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUTOMATION AUDIT WRAPPER - Auditoria de Automações
 * Registra toda vez que uma automação é disparada
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { automationName, automationType, triggerData } = await req.json();

    const user = await base44.auth.me();

    // Registrar auditoria da automação
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || 'Sistema',
      usuario_id: user?.id || 'auto',
      acao: 'Execução',
      modulo: 'Automações',
      entidade: 'Automação',
      descricao: `Automação "${automationName}" (tipo: ${automationType}) disparada`,
      dados_novos: triggerData || {},
      data_hora: new Date().toISOString(),
      sucesso: true
    });

    return Response.json({ 
      valid: true,
      message: 'Automação auditada com sucesso'
    });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});