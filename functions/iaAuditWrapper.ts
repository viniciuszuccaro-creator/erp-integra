import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * IA AUDIT WRAPPER - AUDITORIA DE INTERAÇÕES COM IA
 * Registra todas as chamadas à IA no sistema
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      prompt,
      response,
      model,
      modulo,
      entidade,
      registro_id,
      usuario_id,
      empresa_id,
      tokens_usados,
      custo_estimado,
      duracao_ms
    } = await req.json();

    // Registro em AuditoriaIA (específico)
    await base44.asServiceRole.entities.AuditoriaIA.create({
      prompt_resumo: prompt?.substring(0, 200),
      resposta_resumo: response?.substring(0, 200),
      modelo: model || 'InvokeLLM',
      modulo: modulo || 'Sistema',
      entidade: entidade || 'Genérica',
      registro_id: registro_id || null,
      usuario_id: usuario_id || null,
      empresa_id: empresa_id || null,
      tokens_usados: tokens_usados || 0,
      custo_estimado: custo_estimado || 0,
      duracao_ms: duracao_ms || 0,
      status: 'concluido',
      data_execucao: new Date().toISOString()
    });

    // Registro em AuditLog (universal)
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'IA',
      usuario_id: usuario_id || null,
      empresa_id: empresa_id || null,
      acao: 'Processamento',
      modulo: modulo || 'IA',
      entidade: entidade || 'IA',
      registro_id: registro_id || null,
      descricao: `IA processou: ${prompt?.substring(0, 100)}`,
      dados_novos: { model, tokens: tokens_usados, duracao_ms },
      data_hora: new Date().toISOString()
    });

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
});