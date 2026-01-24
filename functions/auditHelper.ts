import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUDIT HELPER - HELPER CENTRALIZADO DE AUDITORIA
 * Função auxiliar para criar logs de auditoria de forma padronizada
 * ETAPA 1: Auditoria universal
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      usuario,
      usuario_id,
      empresa_id,
      empresa_nome,
      acao,
      modulo,
      entidade,
      registro_id,
      descricao,
      dados_anteriores,
      dados_novos,
      ip_address,
      user_agent,
      sucesso = true,
      duracao_ms,
      test
    } = await req.json();

    // Modo teste - retornar sucesso imediatamente
    if (test === true) {
      return Response.json({ success: true, message: 'Audit Helper operacional' });
    }

    // Criar log de auditoria
    const log = await base44.asServiceRole.entities.AuditLog.create({
      usuario: usuario || 'Sistema',
      usuario_id: usuario_id || null,
      empresa_id: empresa_id || null,
      empresa_nome: empresa_nome || null,
      acao,
      modulo,
      entidade,
      registro_id: registro_id || null,
      descricao,
      dados_anteriores: dados_anteriores || null,
      dados_novos: dados_novos || null,
      ip_address: ip_address || null,
      user_agent: user_agent || null,
      data_hora: new Date().toISOString(),
      sucesso,
      duracao_ms: duracao_ms || null
    });

    return Response.json({ success: true, log_id: log.id });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});