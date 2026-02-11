import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { getUserAndPerfil, assertPermission } from './_lib/guard.js';

// Sinalização de churn no CRM: analisa Oportunidades e gera alerts no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const permErr = await assertPermission(base44, ctx, 'CRM', 'Oportunidade', 'visualizar');
    if (permErr) return permErr;
    const oportunidades = await base44.asServiceRole.entities.Oportunidade.filter({}, '-updated_date', 500);

    // Carrega sensibilidade via configuração (fallback seguro)
    let minDiasSemContato = 14;
    let maxAtrasoPrev = 7;
    let minProbabilidade = 40; // abaixo disso sinaliza
    try {
      const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'CRM', chave: 'churn_ia' }, '-updated_date', 1);
      const cfg = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
      minDiasSemContato = Number(cfg?.min_dias_sem_contato ?? 14);
      maxAtrasoPrev = Number(cfg?.max_atraso_previsao_dias ?? 7);
      minProbabilidade = Number(cfg?.min_probabilidade ?? 40);
    } catch {}

    const flagged = [];
    const now = Date.now();

    for (const o of oportunidades) {
      const dias = Number(o?.dias_sem_contato || 0);
      const prob = Number(o?.probabilidade || 0);
      const atrasoPrev = (() => {
        if (!o?.data_previsao) return 0;
        const d = new Date(o.data_previsao).getTime();
        return d < now ? Math.ceil((now - d) / (1000*60*60*24)) : 0;
      })();

      if (dias >= minDiasSemContato || prob <= minProbabilidade || atrasoPrev >= maxAtrasoPrev) {
        flagged.push(o.id);
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            usuario: 'Sistema',
            acao: 'Visualização', modulo: 'CRM', entidade: 'Oportunidade', registro_id: o.id,
            descricao: `Sinal de churn: dias_sem_contato=${dias}, prob=${prob}, atrasoPrev=${atrasoPrev}`,
            dados_novos: { recomendacao: 'Agendar follow-up nas próximas 24h' },
            data_hora: new Date().toISOString(),
          });
          // Notificação para CRM
          await base44.asServiceRole.entities.Notificacao?.create?.({
            titulo: 'Risco de Churn detectado',
            mensagem: `Oportunidade ${o?.titulo || o?.id} em risco (dias:${dias}, prob:${prob}%).`,
            tipo: 'alerta',
            categoria: 'CRM',
            prioridade: 'Média'
          });
        } catch {}
      }
    }

    return Response.json({ ok: true, sinalizadas: flagged.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});