import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission } from './_lib/guard.js';
import { loadChurnConfig, evaluateChurnRisk } from './_lib/churnUtils.js';

// Sinalização de churn no CRM: analisa Oportunidades e gera alerts no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const permErr = await assertPermission(base44, ctx, 'CRM', 'Oportunidade', 'visualizar');
    if (permErr) return permErr;
    const oportunidades = await base44.asServiceRole.entities.Oportunidade.filter({}, '-updated_date', 500);

    const cfg = await loadChurnConfig(base44);
    const flagged = [];

    for (const o of oportunidades) {
      const evalRes = evaluateChurnRisk(o, cfg);
      if (!evalRes.flagged) continue;
      flagged.push(o.id);
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'Sistema',
          acao: 'Visualização', modulo: 'CRM', entidade: 'Oportunidade', registro_id: o.id,
          descricao: `Sinal de churn: dias_sem_contato=${evalRes.detalhes.dias_sem_contato}, prob=${evalRes.detalhes.probabilidade}, atrasoPrev=${evalRes.detalhes.atraso_prev}`,
          dados_novos: { recomendacao: evalRes.recomendacao },
          data_hora: new Date().toISOString(),
        });
        await base44.asServiceRole.entities.Notificacao?.create?.({
          titulo: 'Risco de Churn detectado',
          mensagem: `Oportunidade ${o?.titulo || o?.id} em risco (dias:${evalRes.detalhes.dias_sem_contato}, prob:${evalRes.detalhes.probabilidade}%).`,
          tipo: 'alerta',
          categoria: 'CRM',
          prioridade: 'Média',
          empresa_id: o?.empresa_id
        });
      } catch {}
    }

    return Response.json({ ok: true, sinalizadas: flagged.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});