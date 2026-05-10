export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function isPendingStatus(status) {
  return String(status || '').toLowerCase() === 'pendente';
}

export function isDatePast(dateValue, referenceDate = new Date()) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !Number.isNaN(date.getTime()) && date < referenceDate;
}

export function formatMoneyShort(value) {
  return `R$ ${(safeNumber(value) / 1000).toFixed(0)}k`;
}