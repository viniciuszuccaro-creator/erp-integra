import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { loadAnomalyConfig, computeIssues } from './_lib/anomalyUtils.js';
import * as ss from 'npm:simple-statistics@7.8.3';
import { notify } from './_lib/notificationService.js';

// Detecção de anomalias financeiras (ML leve) com alerta no NotificationCenter
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    const isScheduled = !user;
    if (!isScheduled && user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Filtros opcionais (multiempresa): { empresa_id?, group_id? }
    let body = {};
    try { body = await req.json(); } catch { body = {}; }
    const filtros = (body?.filtros && (body.filtros.empresa_id || body.filtros.group_id)) ? body.filtros : {};

    // Coleta com escopo (quando fornecido)
    const receber = await base44.asServiceRole.entities.ContaReceber.filter(filtros, '-updated_date', 500);
    const pagar = await base44.asServiceRole.entities.ContaPagar.filter(filtros, '-updated_date', 500);

    // Regras configuráveis + detecções já existentes
          const cfg = await loadAnomalyConfig(base44);
          let issues = computeIssues(receber, pagar, cfg) || [];

          // 2.0: Persistir flags em títulos de Pagar quando aplicável (service role)
          try {
            const idsDiverg = Array.from(new Set(issues.filter(i => i.entidade === 'ContaPagar' && i.tipo === 'taxa_marketplace_divergente' && i.id).map(i => i.id))).slice(0, 50);
            const idsDup = Array.from(new Set(issues.filter(i => i.entidade === 'ContaPagar' && i.tipo === 'duplicidade_pagar' && i.id).map(i => i.id))).slice(0, 50);
            await Promise.all([
              ...idsDiverg.map(id => base44.asServiceRole.entities.ContaPagar.update(id, { alerta_taxa_divergente: true })),
              ...idsDup.map(id => base44.asServiceRole.entities.ContaPagar.update(id, { duplicidade_detectada: true }))
            ]);
          } catch (_) {}

    // ML leve: outliers por Z-Score (valor)
    const valoresRec = receber.map(r => Number(r.valor || 0)).filter(v => v > 0);
    const valoresPag = pagar.map(p => Number(p.valor || 0)).filter(v => v > 0);

    const addZOutliers = (arr, baseList, entidade) => {
      if (!arr.length) return;
      const mean = ss.mean(arr);
      const stdev = ss.standardDeviation(arr) || 1;
      const zThr = Number(cfg?.finance?.anomaly?.zscore_threshold ?? 3); // |z| >= zThr
      arr.forEach((v, i) => {
        const z = (v - mean) / stdev;
        if (Math.abs(z) >= zThr) {
          const ref = baseList[i];
          issues.push({ entidade, tipo: 'valor_outlier', severity: 'alto', valor: v, zscore: Number(z.toFixed(2)), id: ref?.id, data: ref });
        }
      });
    };

    addZOutliers(valoresRec, receber, 'ContaReceber');
    addZOutliers(valoresPag, pagar, 'ContaPagar');

    // ML leve: IQR (valor)
    const detectIQR = (arr, baseList, entidade) => {
      if (!arr.length) return;
      const sorted = [...arr].sort((a, b) => a - b);
      const q1 = ss.quantileSorted(sorted, 0.25);
      const q3 = ss.quantileSorted(sorted, 0.75);
      const iqr = q3 - q1 || 1;
      const k = Number(cfg?.finance?.anomaly?.iqr_multiplier ?? 1.5);
      const low = q1 - k * iqr;
      const high = q3 + k * iqr;
      arr.forEach((v, i) => {
        if (v < low || v > high) {
          const ref = baseList[i];
          issues.push({ entidade, tipo: 'valor_outlier_iqr', severity: 'medio', valor: v, q1, q3, iqr, id: ref?.id, data: ref });
        }
      });
    };

    detectIQR(valoresRec, receber, 'ContaReceber');
    detectIQR(valoresPag, pagar, 'ContaPagar');

    // ML leve: MAD (dias atraso) para pendentes
    const hoje = new Date();
    const daysLate = (dt) => Math.floor((hoje - new Date(dt)) / (1000 * 60 * 60 * 24));

    const pendRec = receber.filter(c => c.status === 'Pendente' && c.data_vencimento);
    const pendPag = pagar.filter(c => c.status === 'Pendente' && c.data_vencimento);

    const detectMad = (baseList, entidade) => {
      const arr = baseList.map(c => Math.max(0, daysLate(c.data_vencimento)));
      if (!arr.length) return;
      const med = ss.median(arr);
      const absDev = arr.map(x => Math.abs(x - med));
      const mad = ss.median(absDev) || 1;
      const madK = Number(cfg?.finance?.anomaly?.mad_multiplier ?? 3);
      const thr = med + madK * mad; // robusto
      arr.forEach((v, i) => {
        if (v >= thr && v > 0) {
          const ref = baseList[i];
          issues.push({ entidade, tipo: 'atraso_outlier_mad', severity: 'medio', dias: v, med, mad, id: ref?.id, data: ref });
        }
      });
    };

    detectMad(pendRec, 'ContaReceber');
    detectMad(pendPag, 'ContaPagar');

    // Auditoria + Alerta no NotificationCenter
    if (issues.length > 0) {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Visualização',
        modulo: 'Financeiro',
        entidade: 'Monitoramento',
        descricao: `Anomalias detectadas: ${issues.length}`,
        dados_novos: { issues: issues.slice(0, 50) },
        data_hora: new Date().toISOString(),
      });

      const resumoSeveridade = issues.reduce((acc, i) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc; }, {});
      // Usa empresa do primeiro título como contexto padrão
      const alvoEmpresaId = (filtros?.empresa_id) || (receber[0]?.empresa_id) || (pagar[0]?.empresa_id) || null;

      await notify(base44, {
        titulo: 'Anomalias Financeiras Detectadas',
        mensagem: `${issues.length} ocorrência(s) (Alta:${resumoSeveridade.alto || 0} • Média:${resumoSeveridade.medio || 0} • Baixa:${resumoSeveridade.baixo || 0}).`,
        tipo: 'alerta',
        categoria: 'Financeiro',
        prioridade: 'Alta',
        empresa_id: alvoEmpresaId,
        dados: { resumoSeveridade, exemplos: issues.slice(0, 5) }
      });

      // Canal opcional: WhatsApp (se configurado em Configuração do Sistema)
      try {
        if (cfg?.finance?.alerts?.whatsapp?.enabled && cfg.finance.alerts.whatsapp.to) {
          const msg = `Financeiro: ${issues.length} anomalia(s). Alta:${resumoSeveridade.alto || 0} • Média:${resumoSeveridade.medio || 0} • Baixa:${resumoSeveridade.baixo || 0}.`;
          await base44.asServiceRole.functions.invoke('whatsappSend', {
            to: cfg.finance.alerts.whatsapp.to,
            message: msg,
            empresa_id: alvoEmpresaId || null,
          });
        }
      } catch (_) {}
    }

    return Response.json({ ok: true, issues: issues.length, details: issues });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});