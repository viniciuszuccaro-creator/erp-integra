import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Detecção simples de anomalias financeiras em Pagar/Receber com alertas no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const receber = await base44.asServiceRole.entities.ContaReceber.filter({}, '-updated_date', 500);
    const pagar = await base44.asServiceRole.entities.ContaPagar.filter({}, '-updated_date', 500);

    const issues = [];
    const hoje = new Date().toISOString().slice(0,10);

    const atrasado = (venc) => {
      if (!venc) return false;
      return new Date(venc) < new Date(hoje);
    };

    for (const r of receber) {
      if (Number(r?.valor) < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Receber', id: r.id });
      if (r?.status === 'Pendente' && atrasado(r?.data_vencimento)) {
        issues.push({ tipo: 'Atraso Receber', entidade: 'Receber', id: r.id });
      }
    }
    for (const c of pagar) {
      if (Number(c?.valor) < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Pagar', id: c.id });
      if (c?.status === 'Pendente' && atrasado(c?.data_vencimento)) {
        issues.push({ tipo: 'Atraso Pagar', entidade: 'Pagar', id: c.id });
      }
    }

    // Registrar resumo
    if (issues.length > 0) {
      await base44.asServiceRole.entities.AuditLog.create({
        acao: 'Visualização', modulo: 'Financeiro', entidade: 'Monitoramento',
        descricao: `Anomalias detectadas: ${issues.length}`,
        dados_novos: { issues: issues.slice(0, 50) },
        data_hora: new Date().toISOString(),
      });
    }

    return Response.json({ ok: true, issues: issues.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});