export const safeArray = (value) => Array.isArray(value) ? value : [];

export const safeNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const safeString = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const safeDateKey = (value) => {
  const date = safeDate(value);
  return date ? date.toISOString().split("T")[0] : null;
};

export const isBefore = (left, right = new Date()) => {
  const leftDate = safeDate(left);
  const rightDate = safeDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.getTime() < rightDate.getTime();
};

export const isBeforeOrEqual = (left, right = new Date()) => {
  const leftDate = safeDate(left);
  const rightDate = safeDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.getTime() <= rightDate.getTime();
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