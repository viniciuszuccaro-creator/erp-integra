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

  for (const r of Array.isArray(receber) ? receber : []) {
    if (bloquearNeg && Number(r?.valor) < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Receber', id: r.id, empresa_id: r?.empresa_id });
    const atraso = diasAtraso(r?.data_vencimento);
    if (r?.status === 'Pendente' && atraso >= limiar) {
      issues.push({ tipo: 'Atraso Receber', entidade: 'Receber', id: r.id, dias: atraso, empresa_id: r?.empresa_id });
    }
  }
  for (const c of Array.isArray(pagar) ? pagar : []) {
    if (bloquearNeg && Number(c?.valor) < 0) issues.push({ tipo: 'Valor negativo', entidade: 'Pagar', id: c.id, empresa_id: c?.empresa_id });
    const atraso = diasAtraso(c?.data_vencimento);
    if (c?.status === 'Pendente' && atraso >= limiar) {
      issues.push({ tipo: 'Atraso Pagar', entidade: 'Pagar', id: c.id, dias: atraso, empresa_id: c?.empresa_id });
    }
  }
  return issues;
}