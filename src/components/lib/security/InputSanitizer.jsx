export function sanitizeString(value) {
  if (typeof value !== "string") return value;
  // remove tags simples e normaliza espaço
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim();
}

export function sanitizeObject(obj) {
  if (obj == null || typeof obj !== "object") return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const out = {};
  for (const k of Object.keys(obj)) {
    out[k] = sanitizeObject(obj[k]);
  }
  return out;
}