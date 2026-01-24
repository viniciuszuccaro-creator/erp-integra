import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUDIT HELPER - AUDITORIA COMPLETA E CENTRALIZADA
 * Registra todas as ações do sistema: UI, automações, IA, chatbot
 * Backend universal para auditoria
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
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
      origem,
      metadata
    } = payload;

    // Criar registro de auditoria
    const auditRecord = {
      usuario: usuario || 'Sistema',
      usuario_id: usuario_id || null,
      empresa_id: empresa_id || null,
      empresa_nome: empresa_nome || null,
      acao: acao || 'Ação',
      modulo: modulo || 'Sistema',
      entidade: entidade || 'Genérica',
      registro_id: registro_id || null,
      descricao: descricao || `${acao} em ${entidade}`,
      dados_anteriores: dados_anteriores || null,
      dados_novos: dados_novos || null,
      data_hora: new Date().toISOString(),
      sucesso: true
    };

    // Adicionar metadata customizada
    if (origem) {
      auditRecord.descricao = `[${origem}] ${auditRecord.descricao}`;
    }

    if (metadata) {
      auditRecord.dados_novos = {
        ...(auditRecord.dados_novos || {}),
        _metadata: metadata
      };
    }

    await base44.asServiceRole.entities.AuditLog.create(auditRecord);

    return Response.json({ 
      success: true, 
      audit_id: auditRecord.id 
    });

  } catch (error) {
    // Mesmo em caso de erro, tentar registrar
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Erro',
        modulo: 'Auditoria',
        entidade: 'AuditHelper',
        descricao: `Erro ao auditar: ${error.message}`,
        dados_novos: { error: error.message, stack: error.stack },
        data_hora: new Date().toISOString(),
        sucesso: false
      });
    } catch {}

    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});