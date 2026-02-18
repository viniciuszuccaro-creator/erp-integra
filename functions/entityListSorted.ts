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

    // RBAC via função entityGuard (sem imports locais)
    const mod = MODULE_BY_ENTITY[entityName] || 'Sistema';
    try {
      const guard = await base44.asServiceRole.functions.invoke('entityGuard', {
        module: mod,
        section: entityName,
        action: 'visualizar',
        empresa_id: filtros?.empresa_id || filtros?.empresa_alocada_id || filtros?.empresa_dona_id || null,
        group_id: filtros?.group_id || null,
      });
      if (!guard?.data?.allowed) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (_) {
      // Em caso de erro no guard, nega por segurança
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Pré-ordenar via backend quando possível, ainda garantindo collation no pós-processamento
    const orderHint = `${sortDirection === 'desc' ? '-' : ''}${sortField}`;
    // Sanitização leve de filtro (strings)
    const sanitize = (v) => typeof v === 'string' ? v.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,'').replace(/javascript:\s*/gi,'') : v;
    const safeFilter = Object.fromEntries(Object.entries(filtros).map(([k,v])=>[k, Array.isArray(v)? v.map(sanitize): (v && typeof v==='object'? v : sanitize(v))]));

    const raw = await base44.asServiceRole.entities[entityName].filter(safeFilter, orderHint, fetchLimit);
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