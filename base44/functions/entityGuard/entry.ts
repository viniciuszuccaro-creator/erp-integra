import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Rate-limit por IP
const __RL = globalThis.__egRate || (globalThis.__egRate = new Map());
const __WINDOW_MS = 30_000;
const __MAX_REQ = 120;

// Cache de permissões por usuário (evita chamar auth.me() a cada request)
const __PERM_CACHE = globalThis.__egPermCache || (globalThis.__egPermCache = new Map());
const __PERM_TTL = 300_000; // 5 min
const __GUARD_RESULT_CACHE = globalThis.__egResultCache || (globalThis.__egResultCache = new Map());
const __GUARD_RESULT_TTL = 120_000;
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Ping de automação
    if (!body || Object.keys(body).length === 0 || body._automation === true) {
      return Response.json({ ok: true, status: 'healthy' });
    }

    const resultCacheKey = stableStringify({
      token: (req.headers.get('authorization') || '').slice(-32),
      module: body?.module,
      section: body?.section,
      action: body?.action,
      entity_name: body?.entity_name,
      empresa_id: body?.empresa_id,
      group_id: body?.group_id,
    });
    const cachedResult = __GUARD_RESULT_CACHE.get(resultCacheKey);
    if (cachedResult && Date.now() - cachedResult.ts < __GUARD_RESULT_TTL) {
      return Response.json(cachedResult.payload);
    }

    // Rate limit por IP
    let requestIp = 'unknown';
    try {
      requestIp = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
      const now = Date.now();
      const list = __RL.get(requestIp) || [];
      const kept = list.filter((t) => now - t < __WINDOW_MS);
      kept.push(now);
      __RL.set(requestIp, kept);
      if (kept.length > __MAX_REQ) {
        return Response.json({ allowed: false, error: 'rate_limited' }, { status: 429 });
      }
    } catch {}

    // Autenticação — usa cache para não consumir créditos a cada chamada
    let user = null;
    try {
      const authToken = req.headers.get('authorization') || '';
      const cacheKey = authToken.slice(-32); // últimos 32 chars do token como chave
      const cached = __PERM_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.ts < __PERM_TTL) {
        user = cached.user;
      } else {
        user = await base44.auth.me();
        if (user && cacheKey) {
          __PERM_CACHE.set(cacheKey, { user, ts: Date.now() });
          // Limpa entradas antigas (max 500)
          if (__PERM_CACHE.size > 500) {
            const oldest = __PERM_CACHE.keys().next().value;
            __PERM_CACHE.delete(oldest);
          }
        }
      }
    } catch {}

    if (!user) return Response.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });

    // Admin sempre tem acesso
    if (user?.role === 'admin') {
      const payload = { allowed: true };
      __GUARD_RESULT_CACHE.set(resultCacheKey, { payload, ts: Date.now() });
      return Response.json(payload);
    }

    const normalize = (a) => {
      if (!a) return 'visualizar';
      const s = String(a).toLowerCase();
      const map = {
        ver: 'visualizar', view: 'visualizar', read: 'visualizar', listar: 'visualizar',
        delete: 'excluir', remove: 'excluir', apagar: 'excluir',
        create: 'criar', add: 'criar', update: 'editar', edit: 'editar',
        approve: 'aprovar', aprovar: 'aprovar', export: 'exportar', exportar: 'exportar',
        cancel: 'cancelar', cancelar: 'cancelar', execute: 'executar', executar: 'executar', status: 'visualizar'
      };
      return map[s] || s;
    };

    const normalizeModule = (s) => {
      if (!s) return 'Sistema';
      const norm = String(s).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const aliases = {
        financeiro: 'Financeiro', financeiroecontabil: 'Financeiro',
        compras: 'Compras', comprasesuprimentos: 'Compras',
        comercial: 'Comercial', comercialevendas: 'Comercial',
        estoque: 'Estoque', estoqueealmoxarifado: 'Estoque',
        expedicao: 'Expedição', expedicaologistica: 'Expedição',
        producao: 'Produção', crm: 'CRM', fiscal: 'Fiscal',
        rh: 'RH', recursoshumanos: 'RH',
        dashboard: 'Dashboard', relatorios: 'Relatórios',
        agenda: 'Agenda', cadastros: 'Cadastros', cadastrosgerais: 'Cadastros',
        contratos: 'Contratos', administracao: 'Sistema', administracaosistema: 'Sistema', sistema: 'Sistema',
      };
      return aliases[norm] || s || 'Sistema';
    };

    const moduleName = normalizeModule(body?.module || 'Sistema');
    const section = body?.section || null;
    const desired = normalize(body?.action || 'visualizar');

    let securityConfigs = [];
    const shouldLoadSecurityConfigs = !!(body?.empresa_id || body?.group_id);
    try {
      if (shouldLoadSecurityConfigs) {
        securityConfigs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({}, '-updated_date', 200);
      }
    } catch {}
    const hasFlag = (...keys) => securityConfigs.some((c) => keys.includes(c?.chave) && c?.ativa === true && ((body?.empresa_id && c?.empresa_id === body.empresa_id) || (body?.group_id && c?.group_id === body.group_id) || (!c?.empresa_id && !c?.group_id)));

    if (hasFlag('seg_bloquear_ip_suspeito', 'cc_bloquear_ips_suspeitos')) {
      const ipHits = __RL.get(requestIp) || [];
      if (ipHits.length > Math.floor(__MAX_REQ * 0.7)) {
        return Response.json({ allowed: false, error: 'suspicious_ip_blocked' }, { status: 403 });
      }
    }

    // Proteção de entidades críticas
    const targetEntity = body?.entity_name;
    if (targetEntity && (targetEntity === 'AuditLog' || targetEntity === 'PerfilAcesso')) {
      if (['criar', 'editar', 'excluir'].includes(desired)) {
        return Response.json({ allowed: false }, { status: 403 });
      }
    }

    // Verifica perfil de acesso (sem chamada extra se não tiver perfil)
    let allowed = false;
    try {
      if (user?.perfil_acesso_id) {
        const perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
        const perms = perfil?.permissoes;
        if (perms) {
          const normalizeKey = (v) => String(v || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const getByKey = (obj, key) => {
            if (!obj || typeof obj !== 'object') return undefined;
            const found = Object.keys(obj).find((k) => normalizeKey(k) === normalizeKey(key));
            return found ? obj[found] : undefined;
          };
          const leafAllows = (node) => {
            const stack = [node];
            while (stack.length) {
              const current = stack.pop();
              if (Array.isArray(current)) {
                if (current.includes(desired) || current.includes('visualizar') || (desired === 'visualizar' && current.includes('ver'))) return true;
              } else if (current && typeof current === 'object') {
                Object.values(current).forEach((v) => stack.push(v));
              }
            }
            return false;
          };
          const modNode = getByKey(perms, moduleName);
          if (modNode) {
            if (!section) {
              allowed = leafAllows(modNode);
            } else {
              const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
              let cursor = modNode;
              for (const seg of path) { cursor = getByKey(cursor, seg); if (!cursor) break; }
              allowed = leafAllows(cursor);
            }
          }
        }
      } else {
        allowed = false;
      }
    } catch {
      allowed = false;
    }

    // Sem escopo multiempresa → permite (o frontend já valida o contexto)
    // NÃO bloquear por falta de empresa_id pois algumas entidades são globais

    const payload = { allowed };
    __GUARD_RESULT_CACHE.set(resultCacheKey, { payload, ts: Date.now() });
    return Response.json(payload);

  } catch (err) {
    return Response.json({ allowed: false, error: String(err?.message || err || 'guard_error') }, { status: 500 });
  }
});