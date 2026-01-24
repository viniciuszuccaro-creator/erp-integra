import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUDIT AUTOMATION - Registra execução de automações
 * ETAPA 1: Rastreabilidade completa de processos automatizados
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      automationName, 
      entityName, 
      operation, 
      entityId, 
      data,
      status = 'sucesso',
      details = {}
    } = await req.json();

    const user = await base44.auth.me();

    // Registrar execução de automação
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema - Automação',
      usuario_id: user?.id || 'SISTEMA',
      empresa_id: data?.empresa_id || null,
      acao: operation === 'create' ? 'Criação Automática' : 
            operation === 'update' ? 'Atualização Automática' :
            operation === 'delete' ? 'Exclusão Automática' : 'Execução Automática',
      modulo: 'Automação',
      entidade: entityName,
      registro_id: entityId,
      descricao: `Automação '${automationName}' executada: ${operation} em ${entityName}`,
      dados_novos: details,
      data_hora: new Date().toISOString(),
      sucesso: status === 'sucesso'
    });

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});