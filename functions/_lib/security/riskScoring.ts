// Heurística leve de risco (somente score/auditoria, sem bloqueio)

export function computeRisk({ event, data, ip, userAgent }) {
  const hora = new Date().getHours();
  const offHours = (hora < 7 || hora > 20);
  const entidade = event?.entity_name;
  const tipo = event?.type; // create/update/delete

  let score = 0;
  let tags = [];

  if (offHours) { score += 1; tags.push('off_hours'); }
  if (tipo === 'delete') { score += 2; tags.push('delete'); }
  if (['ContaPagar','ContaReceber','NotaFiscal'].includes(entidade)) { score += 2; tags.push('financeiro'); }
  if (userAgent && /bot|crawler|scraper/i.test(userAgent)) { score += 1; tags.push('ua_suspeito'); }
  if (ip && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(ip) === false) { score += 1; tags.push('ip_externo'); }

  const level = score >= 4 ? 'Crítico' : score >= 3 ? 'Alto' : score >= 2 ? 'Médio' : 'Baixo';
  const tipo_alerta = level === 'Crítico' ? 'Ação Sensível Fora de Hora' : level === 'Alto' ? 'Ação Sensível' : 'Normal';

  return { score, level, tags, tipo_alerta };
}