// Global sanitization utility for form payloads (XSS-safe best-effort)
export function sanitizeOnWrite(input) {
  const cleanString = (s) => {
    let out = String(s);
    out = out.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    out = out.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '');
    out = out.replace(/on[a-z]+\s*=\s*'[^']*'/gi, '');
    out = out.replace(/javascript:\s*/gi, '');
    return out.trim();
  };
  const walk = (val) => {
    if (typeof val === 'string') return cleanString(val);
    if (Array.isArray(val)) return val.map(walk);
    if (val && typeof val === 'object') {
      const o = {};
      for (const [k, v] of Object.entries(val)) o[k] = walk(v);
      return o;
    }
    return val;
  };
  return walk(input);
}