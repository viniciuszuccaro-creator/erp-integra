import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Rate-limit por IP
const __RL = globalThis.__egRate || (globalThis.__egRate = new Map());
const __WINDOW_MS = 30_000;
const __MAX_REQ = 120;

// Cache de permissões por usuário (evita chamar auth.me() a cada request)
const __PERM_CACHE = globalThis.__egPermCache || (globalThis.__egPermCache = new Map());
const __PERM_TTL = 300_000; // 5 min

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Ping de automação
    if (!body || Object.keys(body).length === 0 || body._automation === true) {
      return Response.json({ ok: true, status: 'healthy' });
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
      return Response.json({ allowed: true });
    }

    const normalize = (a) => {
      if (!a) return 'visualizar';
      const s = String(a).toLowerCase();
      const map = {
        ver: 'visualizar', view: 'visualizar', read: 'visualizar', listar: 'visualizar',
        delete: 'excluir', remove: 'excluir', apagar: 'excluir',
        create: 'criar', add: 'criar', update: 'editar', edit: 'editar',
        approve: 'aprovar', aprovar: 'aprovar', export: 'exportar', exportar: 'exportar'
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
        contratos: 'Contratos', administracao: 'Sistema', sistema: 'Sistema',
      };
      return aliases[norm] || s || 'Sistema';
    };

    const moduleName = normalizeModule(body?.module || 'Sistema');
    const section = body?.section || null;
    const desired = normalize(body?.action || 'visualizar');

    let securityConfigs = [];
    try {
      securityConfigs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({}, '-updated_date', 200);
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
          const modNode = perms[moduleName];
          if (modNode) {
            if (!section) {
              allowed = Object.values(modNode).some((node) => {
                if (Array.isArray(node)) return node.includes(desired) || node.includes('visualizar');
                if (node && typeof node === 'object') return Object.values(node).some((v) => Array.isArray(v) && (v.includes(desired) || v.includes('visualizar')));
                return false;
              });
            } else {
              const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
              let cursor = modNode;
              for (const seg of path) { if (!cursor) break; cursor = cursor[seg]; }
              if (Array.isArray(cursor)) allowed = cursor.includes(desired) || cursor.includes('visualizar');
              else if (cursor && typeof cursor === 'object') {
                const stack = [cursor];
                while (stack.length && !allowed) {
                  const node = stack.pop();
                  if (Array.isArray(node)) { if (node.includes(desired) || node.includes('visualizar')) allowed = true; }
                  else if (node && typeof node === 'object') Object.values(node).forEach(v => stack.push(v));
                }
              }
            }
          }
        }
      } else {
        // Sem perfil configurado → permite (usuário sem restrições explícitas)
        allowed = true;
      }
    } catch {
      // Em caso de erro ao buscar perfil, permite para não bloquear o usuário
      allowed = true;
    }

    // Sem escopo multiempresa → permite (o frontend já valida o contexto)
    // NÃO bloquear por falta de empresa_id pois algumas entidades são globais

    return Response.json({ allowed });

  } catch (err) {
    // Em caso de erro interno, PERMITE (fail-open) para não bloquear operações
    return Response.json({ allowed: true, _fallback: true });
  }
});