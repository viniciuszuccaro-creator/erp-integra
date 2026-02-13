import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Lightweight entityGuard endpoint for scheduled healthchecks
// - Accepts empty payload or {_automation: true} and returns {ok:true}
// - Logs a service-role AuditLog entry (non-blocking) for observability
// - Does NOT import local modules to avoid deployment failures

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const meta = {
      ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null,
      user_agent: req.headers.get('user-agent') || null,
      request_id: req.headers.get('x-request-id') || null,
    };

    const isAutomationPing = !body || Object.keys(body).length === 0 || body._automation === true;

    if (isAutomationPing) {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'system:automation',
          usuario_id: null,
          acao: 'Visualização',
          modulo: 'Sistema',
          tipo_auditoria: 'sistema',
          entidade: 'entityGuard',
          descricao: 'Auto-healing healthcheck OK',
          dados_novos: { _automation: true, _meta: meta },
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
      return Response.json({ ok: true, status: 'healthy' });
    }

    // For any non-scheduler payload, respond with a lightweight ack (no RBAC here)
    return Response.json({ ok: true, note: 'entityGuard health endpoint active', received: body });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});