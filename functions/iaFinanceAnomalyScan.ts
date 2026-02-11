import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { loadAnomalyConfig, computeIssues } from './_lib/anomalyUtils.js';
import * as ss from 'npm:simple-statistics@7.8.3';

// Detecção simples de anomalias financeiras em Pagar/Receber com alertas no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    const receber = await base44.asServiceRole.entities.ContaReceber.filter({}, '-updated_date', 500);
    const pagar = await base44.asServiceRole.entities.ContaPagar.filter({}, '-updated_date', 500);

    const cfg = await loadAnomalyConfig(base44);
    let issues = computeIssues(receber, pagar, cfg) || [];

    // ML leve: detectar outliers por valor (z-score) e atraso (MAD)
    const valoresReceber = receber.map(r => Number(r.valor || 0)).filter(v => v > 0);
    const valoresPagar = pagar.map(p => Number(p.valor || 0)).filter(v => v > 0);
    const addOutliers = (lista, entidade) => {
      if (!lista.length) return;
      const mean = ss.mean(lista);
      const stdev = ss.standardDeviation(lista) || 1;
      const thresholdZ = 3; // padrão
      lista.forEach((v, idx) => {
        const z = (v - mean) / stdev;
        if (Math.abs(z) >= thresholdZ) {
          const ref = entidade === 'ContaReceber' ? receber[idx] : pagar[idx];
          issues.push({ entidade, tipo: 'valor_outlier', severity: 'alto', valor: v, zscore: Number(z.toFixed(2)), id: ref?.id, cliente_fornecedor: ref?.cliente || ref?.fornecedor, data: ref });
        }
      });
    };
    addOutliers(valoresReceber, 'ContaReceber');
    addOutliers(valoresPagar, 'ContaPagar');

    // MAD para dias de atraso (somente pendentes/vencidos)
    const hoje = new Date();
    const diasAtraso = (dt) => Math.floor((hoje - new Date(dt)) / (1000*60*60*24));
    const pendReceber = receber.filter(c => c.status === 'Pendente' && c.data_vencimento);
    const pendPagar = pagar.filter(c => c.status === 'Pendente' && c.data_vencimento);
    const diasRec = pendReceber.map(c => Math.max(0, diasAtraso(c.data_vencimento)));
    const diasPag = pendPagar.map(c => Math.max(0, diasAtraso(c.data_vencimento)));
    const detectMad = (arr, base, entidade) => {
      if (!arr.length) return;
      const med = ss.median(arr);
      const absDev = arr.map(x => Math.abs(x - med));
      const mad = ss.median(absDev) || 1;
      // threshold aproximado: 3 * MAD (robusto)
      const thr = med + 3 * mad;
      arr.forEach((v, i) => {
        if (v >= thr && v > 0) {
          const ref = base[i];
          issues.push({ entidade, tipo: 'atraso_outlier_mad', severity: 'medio', dias: v, med, mad, id: ref?.id, data: ref });
        }
      });
    };
    detectMad(diasRec, pendReceber, 'ContaReceber');
    detectMad(diasPag, pendPagar, 'ContaPagar');

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
      let alvoEmpresaId = Array.isArray(receber) && receber[0]?.empresa_id ? receber[0].empresa_id : (Array.isArray(pagar) && pagar[0]?.empresa_id ? pagar[0].empresa_id : undefined);
      const resumoSeveridade = issues.reduce((acc, i) => { acc[i.severity] = (acc[i.severity]||0)+1; return acc; }, {});
      try {
        await base44.asServiceRole.entities.Notificacao?.create?.({
          titulo: 'Anomalias Financeiras Detectadas',
          mensagem: `${issues.length} ocorrências (Alta:${resumoSeveridade.alto||0} • Média:${resumoSeveridade.medio||0} • Baixa:${resumoSeveridade.baixo||0}).`,
          tipo: 'alerta',
          categoria: 'Financeiro',
          prioridade: 'Alta',
          empresa_id: alvoEmpresaId,
          dados: { resumoSeveridade, exemplos: issues.slice(0,5) }
        });
      } catch {}

      // Alerta opcional por WhatsApp (interno) se configurado
      try {
        if (alvoEmpresaId) {
          const cfgs = await base44.asServiceRole.entities.ConfiguracaoWhatsApp.filter({ empresa_id: alvoEmpresaId }, '-updated_date', 1);
          const whats = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
          const podeWhats = whats && whats.ativo !== false && (whats.enviar_cobranca === true || whats.enviar_cobranca === undefined);
          const numeroAlvo = whats?.numero_whatsapp;
          if (podeWhats && numeroAlvo) {
            const exemplo = issues[0];
            const msg = `ALERTA Financeiro: ${issues.length} ocorrência(s). Top: ${exemplo?.entidade}:${exemplo?.tipo}${exemplo?.dias ? ' ('+exemplo.dias+'d)' : ''}.`;
            await base44.asServiceRole.functions.invoke('whatsappSend', {
              action: 'sendText',
              numero: numeroAlvo,
              mensagem: msg,
              empresaId: alvoEmpresaId
            });
          }
        }
      } catch (_) {}
    }

    return Response.json({ ok: true, issues: issues.length, details: issues });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});