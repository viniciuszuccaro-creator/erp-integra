/**
 * getEntityRecord — busca registros de entidade por ID ou filtro genérico.
 * V3: suporta dois modos:
 *   - Por ID: { entityName, id }
 *   - Por filtro: { entityName, filter, limit, sortField }
 * Usa asServiceRole para garantir acesso sem filtros de contexto (multiempresa).
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const __RECORD_CACHE = globalThis.__getEntityRecordCache || (globalThis.__getEntityRecordCache = new Map());
const CACHE_TTL_MS = 30_000;
const STALE_TTL_MS = 300_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const stableStringify = (value) => {
  try {
    if (!value || typeof value !== 'object') return JSON.stringify(value);
    const ordered = Array.isArray(value)
      ? value.map((item) => JSON.parse(stableStringify(item)))
      : Object.keys(value).sort().reduce((acc, key) => ({ ...acc, [key]: value[key] }), {});
    return JSON.stringify(ordered);
  } catch (_) {
    return String(value);
  }
};

const withRetry = async (fn) => {
  let lastError = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err?.response?.status || err?.status;
      if (status !== 429) throw err;
      await sleep(700 * (attempt + 1));
    }
  }
  throw lastError;
};

Deno.serve(async (req) => {
  let requestBody = {};
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try { requestBody = await req.json(); } catch (_) {}

    const { entityName, id, filter, limit, sortField } = requestBody;
    if (!entityName) {
      return Response.json({ error: 'entityName é obrigatório' }, { status: 400 });
    }

    const cacheKey = `${entityName}:${id || ''}:${stableStringify(filter || {})}:${limit || ''}:${sortField || ''}`;
    const cached = __RECORD_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return Response.json({ ...cached.payload, _cached: true });
    }

    const api = base44.asServiceRole.entities[entityName];
    if (!api) {
      return Response.json({ error: `Entidade "${entityName}" não encontrada` }, { status: 404 });
    }

    // MODO 1: busca por ID
    if (id) {
      if (typeof api.get === 'function') {
        try {
          const record = await withRetry(() => api.get(id));
          if (record && record.id) {
            const payload = { record, _ts: Date.now() };
            __RECORD_CACHE.set(cacheKey, { payload, ts: Date.now() });
            return Response.json(payload);
          }
        } catch (_) {}
      }
      if (typeof api.filter === 'function') {
        try {
          const res = await withRetry(() => api.filter({ id }, '-updated_date', 1));
          if (Array.isArray(res) && res.length > 0) {
            const payload = { record: res[0], _ts: Date.now() };
            __RECORD_CACHE.set(cacheKey, { payload, ts: Date.now() });
            return Response.json(payload);
          }
        } catch (_) {}
      }
      return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    // MODO 2: busca por filtro genérico (para ConfiguracaoSistema e outros)
    if (filter && typeof filter === 'object') {
      const maxLimit = Math.min(Number(limit) || 50, 500);
      const sort = sortField || '-updated_date';
      if (typeof api.filter === 'function') {
        const res = await withRetry(() => api.filter(filter, sort, maxLimit));
        const data = Array.isArray(res) ? res : [];
        const payload = { data, _ts: Date.now() };
        __RECORD_CACHE.set(cacheKey, { payload, ts: Date.now() });
        return Response.json(payload);
      }
    }

    return Response.json({ error: 'Parâmetros insuficientes: forneça id ou filter' }, { status: 400 });
  } catch (err) {
    const message = String(err?.message || err);
    const status = err?.response?.status || err?.status || (message.toLowerCase().includes('rate limit') ? 429 : 500);
    if (status === 429) {
      try {
        const cacheKey = `${requestBody?.entityName}:${requestBody?.id || ''}:${stableStringify(requestBody?.filter || {})}:${requestBody?.limit || ''}:${requestBody?.sortField || ''}`;
        const cached = __RECORD_CACHE.get(cacheKey);
        if (cached && Date.now() - cached.ts < STALE_TTL_MS) {
          return Response.json({ ...cached.payload, _stale: true });
        }
      } catch (_) {}
    }
    return Response.json({ error: message }, { status });
  }
});