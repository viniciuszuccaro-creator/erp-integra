export async function loadAnomalyConfig(base44) {
  try {
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Financeiro', chave: 'anomalias_financeiras' }, '-updated_date', 1);
    const cfg = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
    return {
      limiar_atraso_dias: Number(cfg?.limiar_atraso_dias ?? 1),
      bloquear_valor_negativo: cfg?.permitir_valor_negativo !== true,
    };
  } catch (_) {
    return { limiar_atraso_dias: 1, bloquear_valor_negativo: true };
  }
}

export function computeIssues(receber, pagar, cfg) {
  const issues = [];
  const hoje = new Date();
  const limiar = Number(cfg?.limiar_atraso_dias ?? 1);
  const bloquearNeg = cfg?.bloquear_valor_negativo !== false;

  const diasAtraso = (venc) => {
    if (!venc) return 0;
    const diff = (hoje.getTime() - new Date(venc).getTime()) / (1000*60*60*24);
    return Math.floor(diff);
  };

  const computeIQR = (arr) => {
    const xs = arr.filter(v => Number.isFinite(v)).sort((a,b)=>a-b);
    if (xs.length < 4) return { q1: null, q3: null, iqr: null };
    const q = (p) => {
      const pos = (xs.length - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      return xs[base] + (xs[base + 1] - xs[base]) * rest;
    };
    const q1 = q(0.25), q3 = q(0.75);
    return { q1, q3, iqr: q3 - q1 };
  };

  const valoresR = (Array.isArray(receber) ? receber : []).map(x => Number(x?.valor || 0)).filter(v => v > 0);
  const valoresP = (Array.isArray(pagar) ? pagar : []).map(x => Number(x?.valor || 0)).filter(v => v > 0);
  const { q1: q1R, q3: q3R, iqr: iqrR } = computeIQR(valoresR);
  const { q1: q1P, q3: q3P, iqr: iqrP } = computeIQR(valoresP);
  const highR = (q3R != null && iqrR != null) ? q3R + 1.5 * iqrR : Infinity;
  const highP = (q3P != null && iqrP != null) ? q3P + 1.5 * iqrP : Infinity;

  for (const r of Array.isArray(receber) ? receber : []) {
    const valor = Number(r?.valor);
    if (bloquearNeg && valor < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Receber', id: r.id, empresa_id: r?.empresa_id });
    const atraso = diasAtraso(r?.data_vencimento);
    if (r?.status === 'Pendente' && atraso >= limiar) {
      issues.push({ tipo: 'Atraso Receber', entidade: 'Receber', id: r.id, dias: atraso, empresa_id: r?.empresa_id });
    }
    if (valor > highR && Number.isFinite(highR)) {
      issues.push({ tipo: 'Valor atípico Receber', entidade: 'Receber', id: r.id, valor, empresa_id: r?.empresa_id });
    }
  }
  for (const c of Array.isArray(pagar) ? pagar : []) {
    const valor = Number(c?.valor);
    if (bloquearNeg && valor < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Pagar', id: c.id, empresa_id: c?.empresa_id });
    const atraso = diasAtraso(c?.data_vencimento);
    if (c?.status === 'Pendente' && atraso >= limiar) {
      issues.push({ tipo: 'Atraso Pagar', entidade: 'Pagar', id: c.id, dias: atraso, empresa_id: c?.empresa_id });
    }
    if (valor > highP && Number.isFinite(highP)) {
      issues.push({ tipo: 'Valor atípico Pagar', entidade: 'Pagar', id: c.id, valor, empresa_id: c?.empresa_id });
    }
  }
  return issues;
}