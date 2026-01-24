import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * SECURITY ALERTS - Alertas de Segurança
 * Monitora e reporta eventos de segurança suspeitos
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Buscar logs recentes de ações de segurança
    const logsSeguranca = await base44.asServiceRole.entities.AuditLog.filter(
      { acao: 'Bloqueio' },
      '-data_hora',
      10
    );

    // Detectar padrões suspeitos (exemplo básico)
    const alertas = [];
    const ultimaHora = new Date(Date.now() - 3600000);
    const multiplosBlockeios = logsSeguranca.filter(
      l => new Date(l.data_hora) > ultimaHora
    ).length;

    if (multiplosBlockeios > 5) {
      alertas.push({
        severity: 'alta',
        type: 'MultiplosBlockeios',
        count: multiplosBlockeios
      });
    }

    return Response.json({ 
      valid: true,
      alertCount: alertas.length,
      recentBlockCount: multiplosBlockeios,
      message: 'Sistema de alertas operacional'
    });

  } catch (error) {
    return Response.json({ 
      valid: false, 
      reason: error.message 
    }, { status: 500 });
  }
});