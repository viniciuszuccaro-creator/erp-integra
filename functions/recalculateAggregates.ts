import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const empresas = await base44.entities.Empresa?.list?.('-updated_date', 200) || [];

    const totals = [];
    for (const emp of empresas) {
      const empresa_id = emp.id;
      const group_id = emp.group_id || null;
      const pedidos = await base44.entities.Pedido.filter({ empresa_id }, '-updated_date', 1000);
      const entregas = await base44.entities.Entrega.filter({ empresa_id }, '-updated_date', 1000);
      const notas = await base44.entities.NotaFiscal.filter({ empresa_id }, '-updated_date', 1000);
      totals.push({ empresa_id, group_id, pedidos: pedidos.length, entregas: entregas.length, notas: notas.length });
    }

    // Agregados por grupo
    const byGroup = totals.reduce((acc, t) => {
      const gid = t.group_id || 'sem_grupo';
      if (!acc[gid]) acc[gid] = { group_id: gid, pedidos: 0, entregas: 0, notas: 0, empresas: 0 };
      acc[gid].pedidos += t.pedidos; acc[gid].entregas += t.entregas; acc[gid].notas += t.notas; acc[gid].empresas += 1;
      return acc;
    }, {});

    // Registrar um snapshot no SyncReport (se existir)
    try {
      await base44.asServiceRole.entities.SyncReport.create({
        tipo: 'aggregates',
        detalhes: { totals, byGroup },
        gerado_por: user.email,
        gerado_em: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({ success: true, totals, byGroup });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});