import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { audit } from './_lib/guard';

// Consolidação Multiempresas: agrega KPIs por group_id (Pedidos, Receber, Pagar) e registra snapshot no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    const pedidos = await base44.asServiceRole.entities.Pedido.filter({}, '-updated_date', 500);
    const receber = await base44.asServiceRole.entities.ContaReceber.filter({}, '-updated_date', 500);
    const pagar = await base44.asServiceRole.entities.ContaPagar.filter({}, '-updated_date', 500);

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

    // Gravar uma entrada de auditoria consolidada (mantém histórico sem criar nova entidade)
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema',
      acao: 'Criação',
      modulo: 'Sistema',
      entidade: 'ConsolidaçãoGrupo',
      descricao: `Snapshot multiempresa (${summary.length} grupos/escopos)`,
      dados_novos: { gerado_em: new Date().toISOString(), summary },
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true, groups: summary.length, summary });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});