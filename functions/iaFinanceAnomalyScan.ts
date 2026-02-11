import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Detecção simples de anomalias financeiras em Pagar/Receber com alertas no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    const receber = await base44.asServiceRole.entities.ContaReceber.filter({}, '-updated_date', 500);
    const pagar = await base44.asServiceRole.entities.ContaPagar.filter({}, '-updated_date', 500);

    const issues = [];
     const hoje = new Date().toISOString().slice(0,10);

     // Limiares configuráveis (fallbacks seguros)
     let limiarAtrasoDias = 1;
     let valorNegativoHabilita = true;
     try {
       const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Financeiro', chave: 'anomalias_financeiras' }, '-updated_date', 1);
       const cfg = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
       limiarAtrasoDias = Number(cfg?.limiar_atraso_dias ?? 1);
       valorNegativoHabilita = cfg?.permitir_valor_negativo !== true;
     } catch {}

     const diasAtraso = (venc) => {
       if (!venc) return 0;
       const diff = (new Date(hoje).getTime() - new Date(venc).getTime()) / (1000*60*60*24);
       return Math.floor(diff);
     };

    for (const r of receber) {
      if (valorNegativoHabilita && Number(r?.valor) < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Receber', id: r.id });
      const atraso = diasAtraso(r?.data_vencimento);
      if (r?.status === 'Pendente' && atraso >= limiarAtrasoDias) {
        issues.push({ tipo: 'Atraso Receber', entidade: 'Receber', id: r.id, dias: atraso });
      }
    }
    for (const c of pagar) {
      if (valorNegativoHabilita && Number(c?.valor) < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Pagar', id: c.id });
      const atraso = diasAtraso(c?.data_vencimento);
      if (c?.status === 'Pendente' && atraso >= limiarAtrasoDias) {
        issues.push({ tipo: 'Atraso Pagar', entidade: 'Pagar', id: c.id, dias: atraso });
      }
    }

    // Registrar resumo + notificar
    if (issues.length > 0) {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Visualização', modulo: 'Financeiro', entidade: 'Monitoramento',
        descricao: `Anomalias detectadas: ${issues.length}`,
        dados_novos: { issues: issues.slice(0, 50) },
        data_hora: new Date().toISOString(),
      });

      // Notificação resumida
      try {
        await base44.asServiceRole.entities.Notificacao?.create?.({
          titulo: 'Anomalias Financeiras Detectadas',
          mensagem: `${issues.length} ocorrências encontradas (pagar/receber).`,
          tipo: 'alerta',
          categoria: 'Financeiro',
          prioridade: 'Alta',
          empresa_id: Array.isArray(receber) && receber[0]?.empresa_id ? receber[0].empresa_id : (Array.isArray(pagar) && pagar[0]?.empresa_id ? pagar[0].empresa_id : undefined)
        });
      } catch {}
    }

    return Response.json({ ok: true, issues: issues.length, details: issues });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});