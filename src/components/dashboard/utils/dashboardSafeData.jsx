export const safeArray = (value) => Array.isArray(value) ? value : [];

export const safeNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isSameDay = (left, right = new Date()) => {
  const leftDate = safeDate(left);
  const rightDate = safeDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.toDateString() === rightDate.toDateString();
};

export const isSameMonth = (left, right = new Date()) => {
  const leftDate = safeDate(left);
  const rightDate = safeDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.getMonth() === rightDate.getMonth() && leftDate.getFullYear() === rightDate.getFullYear();
};