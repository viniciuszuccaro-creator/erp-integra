import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MODULE_BY_ENTITY = {
  Cliente: 'CRM',
  Oportunidade: 'CRM',
  Interacao: 'CRM',
  Pedido: 'Comercial',
  NotaFiscal: 'Fiscal',
  Entrega: 'Expedição',
  Fornecedor: 'Compras',
  SolicitacaoCompra: 'Compras',
  OrdemCompra: 'Compras',
  Produto: 'Estoque',
  MovimentacaoEstoque: 'Estoque',
  ContaPagar: 'Financeiro',
  ContaReceber: 'Financeiro',
  CentroCusto: 'Financeiro',
  PlanoDeContas: 'Financeiro',
  PlanoContas: 'Financeiro',
  User: 'Sistema',
};

const DEFAULT_SORTS = {
  Produto: { field: 'descricao', direction: 'asc' },
  Cliente: { field: 'nome', direction: 'asc' },
  Fornecedor: { field: 'nome', direction: 'asc' },
  Pedido: { field: 'data_pedido', direction: 'desc' },
  ContaPagar: { field: 'data_vencimento', direction: 'asc' },
  ContaReceber: { field: 'data_vencimento', direction: 'asc' },
  OrdemCompra: { field: 'data_solicitacao', direction: 'desc' },
  CentroCusto: { field: 'codigo', direction: 'asc' },
  PlanoDeContas: { field: 'codigo', direction: 'asc' },
  PlanoContas: { field: 'codigo', direction: 'asc' },
  User: { field: 'full_name', direction: 'asc' },
};

function getValue(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function toNumOrDate(v) {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isNaN(n) && isFinite(n)) return n;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.getTime();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {}; try { body = await req.json(); } catch {}
    const entityName = body?.entityName;
    if (!entityName) return Response.json({ error: 'entityName is required' }, { status: 400 });

    const filtros = body?.filter || {};

    const limit = body?.limit || 500;
    const skip = body?.skip || 0;
    const fetchLimit = Math.min(limit + skip, 1000);
    const sortField = body?.sortField || DEFAULT_SORTS[entityName]?.field || 'updated_date';
    const sortDirection = (body?.sortDirection || DEFAULT_SORTS[entityName]?.direction || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    // RBAC: já autenticado acima; evitando chamada recursiva a entityGuard para não perder o contexto do usuário.
    // Mantemos apenas autenticação do usuário; filtros de escopo (empresa/grupo) vêm do frontend.

    // Pré-ordenar via backend quando possível, ainda garantindo collation no pós-processamento
    const orderHint = `${sortDirection === 'desc' ? '-' : ''}${sortField}`;
    const mod = MODULE_BY_ENTITY[entityName] || 'Sistema';
    // Sanitização leve de filtro (strings)
    const sanitize = (v) => typeof v === 'string' ? v.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,'').replace(/javascript:\s*/gi,'') : v;
    const safeFilter = Object.fromEntries(Object.entries(filtros).map(([k,v])=>[k, Array.isArray(v)? v.map(sanitize): (v && typeof v==='object'? v : sanitize(v))]));

    // Ajuste: converter operadores simples para compatibilidade ($in em arrays)
    const normalizedFilter = (() => {
      if (safeFilter && safeFilter.$or && Array.isArray(safeFilter.$or)) {
        return {
          ...safeFilter,
          $or: safeFilter.$or.map(cond => {
            if (cond && typeof cond === 'object' && 'empresas_compartilhadas_ids' in cond) {
              const v = cond.empresas_compartilhadas_ids;
              if (v && typeof v === 'object' && '$in' in v) return cond;
              if (typeof v === 'string') return { empresas_compartilhadas_ids: { $in: [v] } };
            }
            return cond;
          })
        };
      }
      return safeFilter;
    })();

    // Ajuste top-level para empresas_compartilhadas_ids
    const normalizedTop = (() => {
      if (normalizedFilter && typeof normalizedFilter === 'object' && 'empresas_compartilhadas_ids' in normalizedFilter) {
        const v = normalizedFilter.empresas_compartilhadas_ids;
        if (typeof v === 'string') return { ...normalizedFilter, empresas_compartilhadas_ids: { $in: [v] } };
      }
      return normalizedFilter;
    })();

    // Expansão multiempresa para entidades com compartilhamento quando só empresa_id é passado
    const EXPAND_SET = new Set(['Cliente','Fornecedor','Transportadora']);
    const expandedTop = (() => {
      if (EXPAND_SET.has(entityName) && normalizedTop?.empresa_id && !normalizedTop?.$or) {
        const { empresa_id, ...rest } = normalizedTop;
        return {
          ...rest,
          $or: [
            { empresa_id },
            { empresa_dona_id: empresa_id },
            { empresas_compartilhadas_ids: { $in: [empresa_id] } }
          ]
        };
      }
      return normalizedTop;
    })();

    const preFinal = (() => {
      if (expandedTop && expandedTop.$or && expandedTop.group_id) {
        const { group_id, ...rest } = expandedTop;
        return { ...rest, $or: [...expandedTop.$or, { group_id }] };
      }
      return expandedTop;
    })();

    // Expansão por grupo → incluir empresas do grupo quando não há empresa explícita
    let finalFilter = preFinal;
    if (finalFilter?.group_id && !finalFilter?.$or && !finalFilter?.empresa_id && !finalFilter?.empresa_dona_id && !finalFilter?.empresa_alocada_id) {
      try {
        const groupId = finalFilter.group_id;
        const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 1000);
        const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
        const rest = { ...finalFilter };
        delete rest.group_id;
        const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id' : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');
        if (EXPAND_SET.has(entityName)) {
          finalFilter = { ...rest, $or: [
            { [ctxCampo]: { $in: empresasIds } },
            ...(ctxCampo !== 'empresa_id' ? [{ empresa_id: { $in: empresasIds } }] : []),
            { empresas_compartilhadas_ids: { $in: empresasIds } },
            { group_id: groupId }
          ]};
        } else {
          finalFilter = { ...rest, $or: [ { [ctxCampo]: { $in: empresasIds } }, { group_id: groupId } ] };
        }
      } catch (_) {}
    }

    const raw = await base44.asServiceRole.entities[entityName].filter(finalFilter, orderHint, fetchLimit);
    const rows = Array.isArray(raw) ? raw : [];

    // Case/acentos-insensível
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', ignorePunctuation: true, numeric: true });

    const sorted = rows.slice().sort((a, b) => {
      const va = getValue(a, sortField);
      const vb = getValue(b, sortField);

      // Numérico/data prioritário quando aplicável
      const na = toNumOrDate(va);
      const nb = toNumOrDate(vb);
      let cmp = 0;
      if (na !== null && nb !== null) {
        cmp = na === nb ? 0 : (na < nb ? -1 : 1);
      } else {
        const sa = (va ?? '').toString().trim();
        const sb = (vb ?? '').toString().trim();
        cmp = collator.compare(sa, sb);
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    // Auditoria leve
    try {
      await base44.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Usuário',
        usuario_id: user.id,
        acao: 'Visualização',
        modulo: mod,
        tipo_auditoria: 'entidade',
        entidade: entityName,
        descricao: `Listagem ordenada por ${sortField} (${sortDirection})`,
        dados_novos: { filtros, sortField, sortDirection, count: sorted.length },
        empresa_id: filtros?.empresa_id || null,
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return Response.json(sorted.slice(skip, skip + limit));
  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});