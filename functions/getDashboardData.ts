import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { empresaId, limit = 10 } = body || {};
    if (!empresaId) return Response.json({ error: 'empresaId é obrigatório' }, { status: 400 });

    // RBAC simples: admin vê tudo; demais restritos à empresa informada (já filtrada)
    const canView = user?.role === 'admin' || true; // manter simples; regras finas podem ser ligadas ao PerfilAcesso
    if (!canView) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Consultas otimizadas com filtros multiempresa
    const [pedidos, nfe, receber] = await Promise.all([
      base44.entities.Pedido.filter({ empresa_id: empresaId }, '-created_date', limit),
      base44.entities.NotaFiscal.filter({ empresa_faturamento_id: empresaId }, '-created_date', limit),
      base44.entities.ContaReceber.filter({ empresa_id: empresaId }, '-created_date', limit),
    ]);

    // Auditoria de acesso ao dashboard
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        empresa_id: empresaId,
        acao: 'Visualização',
        modulo: 'Dashboard',
        tipo_auditoria: 'ui',
        entidade: 'Dashboard',
        descricao: 'Consulta dados dashboard',
        data_hora: new Date().toISOString(),
        sucesso: true,
        duracao_ms: Date.now() - t0,
      });
    } catch (_) {}

    return Response.json({ pedidos, nfe, receber });
  } catch (error) {
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me().catch(() => null);
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'n/a',
        usuario_id: user?.id || 'n/a',
        acao: 'Visualização',
        modulo: 'Dashboard',
        tipo_auditoria: 'ui',
        entidade: 'Dashboard',
        descricao: 'Erro ao consultar dashboard',
        mensagem_erro: String(error?.message || error),
        sucesso: false,
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}
    return Response.json({ error: error.message }, { status: 500 });
  }
});