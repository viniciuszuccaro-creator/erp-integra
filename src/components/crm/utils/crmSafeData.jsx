export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function isOpenOpportunity(status) {
  return status === 'Aberto' || status === 'Em Andamento';
}