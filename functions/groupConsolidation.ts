import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission } from './_lib/guard.js';

// Consolidação Multiempresas: agrega KPIs por group_id (Pedidos, Receber, Pagar) e registra snapshot no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user?.role !== 'admin') {
      const denied = await assertPermission(base44, { user, perfil }, 'Sistema', 'ConsolidacaoGrupo', 'visualizar');
      if (denied) return denied;
    }

    const t0 = Date.now();
    let filtros = {};
    try {
      const b = await req.json();
      if (b?.filtros && (b.filtros.group_id || b.filtros.empresa_id)) filtros = b.filtros;
    } catch (_) {}

    const pedidos = await base44.asServiceRole.entities.Pedido.filter(filtros, '-updated_date', 500);
    const receber = await base44.asServiceRole.entities.ContaReceber.filter(filtros, '-updated_date', 500);
    const pagar = await base44.asServiceRole.entities.ContaPagar.filter(filtros, '-updated_date', 500);

    // Diagnóstico de GAPS multiempresa
    const gaps = {
      pedido_sem_empresa: pedidos.filter(p => !p?.empresa_id).length,
      pedido_sem_grupo: pedidos.filter(p => !p?.group_id).length,
      receber_sem_empresa: receber.filter(r => !r?.empresa_id).length,
      pagar_sem_empresa: pagar.filter(c => !c?.empresa_id).length,
    };

    const groups = new Map();
    const add = (gid) => { if (!groups.has(gid)) groups.set(gid, { group_id: gid || null, pedidos: 0, valor_pedidos: 0, receber: 0, valor_receber: 0, pagar: 0, valor_pagar: 0 }); };

    for (const p of pedidos) {
      add(p?.group_id || p?.empresa_id || null);
      const g = groups.get(p?.group_id || p?.empresa_id || null);
      g.pedidos += 1;
      g.valor_pedidos += Number(p?.valor_total || 0);
    }
    for (const r of receber) {
      add(r?.group_id || r?.empresa_id || null);
      const g = groups.get(r?.group_id || r?.empresa_id || null);
      g.receber += 1;
      g.valor_receber += Number(r?.valor || 0) - Number(r?.valor_recebido || 0);
    }
    for (const c of pagar) {
      add(c?.group_id || c?.empresa_id || null);
      const g = groups.get(c?.group_id || c?.empresa_id || null);
      g.pagar += 1;
      g.valor_pagar += Number(c?.valor || 0) - Number(c?.valor_pago || 0);
    }

    const summary = Array.from(groups.values());

    // Gravar uma entrada de auditoria consolidada + GAPS
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema',
      acao: 'Criação',
      modulo: 'Sistema',
      entidade: 'ConsolidaçãoGrupo',
      descricao: `Snapshot multiempresa (${summary.length} grupos/escopos) — gaps: ${JSON.stringify(gaps)}`,
      dados_novos: { gerado_em: new Date().toISOString(), summary, gaps },
      data_hora: new Date().toISOString(),
    });

    const durationMs = Date.now() - t0;
    if (durationMs > 500) {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'Sistema',
          acao: 'Visualização',
          modulo: 'Sistema',
          tipo_auditoria: 'sistema',
          entidade: 'Performance',
          descricao: `groupConsolidation demorou ${durationMs}ms`,
          dados_novos: { durationMs, filtros },
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
    }
    return Response.json({ ok: true, groups: summary.length, summary });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});