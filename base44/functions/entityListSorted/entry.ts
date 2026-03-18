import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const MODULE_BY_ENTITY = {
  Cliente: 'CRM', Oportunidade: 'CRM', Interacao: 'CRM', Pedido: 'Comercial',
  NotaFiscal: 'Fiscal', Entrega: 'Expedição', Fornecedor: 'Compras',
  SolicitacaoCompra: 'Compras', OrdemCompra: 'Compras', Produto: 'Estoque',
  MovimentacaoEstoque: 'Estoque', ContaPagar: 'Financeiro', ContaReceber: 'Financeiro',
  CentroCusto: 'Financeiro', PlanoDeContas: 'Financeiro', PlanoContas: 'Financeiro', User: 'Sistema',
};

const DEFAULT_SORTS = {
  Produto: { field: 'descricao', direction: 'asc' }, Cliente: { field: 'nome', direction: 'asc' },
  Fornecedor: { field: 'nome', direction: 'asc' }, Transportadora: { field: 'razao_social', direction: 'asc' },
  Colaborador: { field: 'nome_completo', direction: 'asc' }, Banco: { field: 'descricao', direction: 'asc' },
  FormaPagamento: { field: 'descricao', direction: 'asc' }, Pedido: { field: 'data_pedido', direction: 'desc' },
  ContaPagar: { field: 'data_vencimento', direction: 'asc' }, ContaReceber: { field: 'data_vencimento', direction: 'asc' },
  OrdemCompra: { field: 'data_solicitacao', direction: 'desc' }, CentroCusto: { field: 'codigo', direction: 'asc' },
  PlanoDeContas: { field: 'codigo', direction: 'asc' }, PlanoContas: { field: 'codigo', direction: 'asc' },
  User: { field: 'full_name', direction: 'asc' },
};

const SORT_FIELD_MAP = {
  Produto: new Set(['codigo', 'codigo_barras', 'descricao', 'tipo_item', 'unidade_medida', 'setor_atividade_nome', 'grupo_produto_nome', 'marca_nome', 'status', 'estoque_atual', 'preco_venda', 'updated_date']),
  Cliente: new Set(['nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj', 'status', 'updated_date', 'endereco_principal.cidade', 'valor_compras_12meses', 'quantidade_pedidos', 'condicao_comercial.limite_credito']),
  Fornecedor: new Set(['nome', 'razao_social', 'cnpj', 'categoria', 'status', 'updated_date']),
  Transportadora: new Set(['razao_social', 'nome_fantasia', 'cnpj', 'status', 'updated_date']),
  Colaborador: new Set(['nome_completo', 'cargo', 'departamento', 'status', 'updated_date']),
  Banco: new Set(['codigo', 'descricao', 'status', 'updated_date']),
  FormaPagamento: new Set(['descricao', 'codigo', 'status', 'updated_date']),
  default: new Set(['updated_date', 'nome', 'codigo', 'status'])
};

const SEARCH_FIELDS = {
  Produto: ['descricao', 'codigo', 'codigo_barras', 'grupo_produto_nome', 'marca_nome', 'unidade_medida', 'setor_atividade_nome', 'subgrupo'],
  Cliente: ['nome', 'razao_social', 'nome_fantasia', 'cpf', 'cnpj', 'endereco_principal.cidade', 'endereco_principal.estado'],
  Fornecedor: ['nome', 'razao_social', 'cnpj', 'cpf', 'ramo_atividade', 'emails.email', 'telefones.numero'],
  Transportadora: ['razao_social', 'nome_fantasia', 'cnpj', 'cidade', 'estado', 'whatsapp'],
  Colaborador: ['nome_completo', 'cpf', 'email', 'departamento', 'cargo'],
  Banco: ['codigo', 'descricao'],
  FormaPagamento: ['descricao', 'codigo'],
  default: ['nome', 'descricao', 'codigo', 'razao_social', 'cpf', 'cnpj']
};

function normalizeSortField(entityName, requested) {
  if (!requested || typeof requested !== 'string') return (DEFAULT_SORTS[entityName]?.field) || 'updated_date';
  const r = String(requested).toLowerCase();
  let canonical = requested;

  // Aliases globais sempre aceitos
  if (['recentes', 'atualizados', 'updated', 'updated_date'].includes(r)) return 'updated_date';
  if (['criacao', 'criação', 'created_date'].includes(r)) return 'created_date';

  if (entityName === 'Produto') {
    if (['cod', 'código', 'codigo'].includes(r)) canonical = 'codigo';
    else if (['descrição', 'descricao', 'descr'].includes(r)) canonical = 'descricao';
    else if (['tipo', 'tipoitem', 'tipo_item'].includes(r)) canonical = 'tipo_item';
    else if (['setor', 'setor_atividade', 'setor_atividade_nome'].includes(r)) canonical = 'setor_atividade_nome';
    else if (['grupo', 'grupo_produto', 'grupo_produto_nome'].includes(r)) canonical = 'grupo_produto_nome';
    else if (['marca', 'marca_nome'].includes(r)) canonical = 'marca_nome';
    else if (['estoque', 'estoque_atual', 'saldo'].includes(r)) canonical = 'estoque_atual';
    else if (['preco', 'preço', 'preco_venda', 'preço_venda', 'valor'].includes(r)) canonical = 'preco_venda';
    else if (['codigo_barras', 'barcode', 'ean', 'gtin'].includes(r)) canonical = 'codigo_barras';
  }
  if (entityName === 'Cliente') {
    if (['cidade', 'municipio'].includes(r)) canonical = 'endereco_principal.cidade';
    else if (['compras', 'mais_compras', 'valor_compras'].includes(r)) canonical = 'valor_compras_12meses';
    else if (['limite', 'credito', 'limite_credito'].includes(r)) canonical = 'condicao_comercial.limite_credito';
  }

  // Para entidades com whitelist definida, validar; para entidades genéricas de cadastro, aceitar qualquer campo simples (sem $, sem .)
  const allowed = SORT_FIELD_MAP[entityName];
  if (allowed) {
    if (!allowed.has(canonical)) {
      return (DEFAULT_SORTS[entityName]?.field) || 'updated_date';
    }
  } else {
    // Entidade genérica: aceitar qualquer campo que seja um identificador simples válido
    if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(canonical)) {
      return 'updated_date';
    }
  }
  return canonical;
}

function sanitizeVal(v) {
  return (typeof v === 'string') ? v.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '').replace(/javascript:\s*/gi, '') : v;
}

function normalizeFilterShared(f) {
  let out = f || {};
  if (out && typeof out === 'object' && 'empresas_compartilhadas_ids' in out) {
    const v = out.empresas_compartilhadas_ids;
    if (typeof v === 'string') out = { ...out, empresas_compartilhadas_ids: { $in: [v] } };
  }
  if (out.$or && Array.isArray(out.$or)) {
    out = {
      ...out,
      $or: out.$or.map(cond => {
        if (cond && typeof cond === 'object' && 'empresas_compartilhadas_ids' in cond) {
          const v = cond.empresas_compartilhadas_ids;
          if (typeof v === 'string') return { empresas_compartilhadas_ids: { $in: [v] } };
        }
        return cond;
      })
    };
  }
  return out;
}

async function expandByGroupIfNeeded(base44, entityName, f) {
  const ctxCampo = (entityName === 'Fornecedor' || entityName === 'Transportadora') ? 'empresa_dona_id'
    : (entityName === 'Colaborador' ? 'empresa_alocada_id' : 'empresa_id');
  const EXPAND_SET = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

  if (EXPAND_SET.has(entityName) && f?.empresa_id && !f?.$or) {
    const { empresa_id, ...rest } = f;
    f = {
      ...rest,
      $or: [
        { empresa_id },
        { empresa_dona_id: empresa_id },
        { empresas_compartilhadas_ids: { $in: [empresa_id] } }
      ]
    };
  }

  if (f && f.$or && f.group_id) {
    const { group_id, ...rest } = f;
    f = { ...rest, $or: [...f.$or, { group_id }] };
  }

  if (f?.group_id && !f?.$or && !f?.empresa_id && !f?.empresa_dona_id && !f?.empresa_alocada_id) {
    try {
      const groupId = f.group_id;
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 1000);
      const empresasIds = (empresas || []).map(e => e.id).filter(Boolean);
      const rest = { ...f };
      delete rest.group_id;
      if (EXPAND_SET.has(entityName)) {
        f = {
          ...rest,
          $or: [
            { [ctxCampo]: { $in: empresasIds } },
            ...(ctxCampo !== 'empresa_id' ? [{ empresa_id: { $in: empresasIds } }] : []),
            { empresas_compartilhadas_ids: { $in: empresasIds } },
            { group_id: groupId }
          ]
        };
      } else {
        f = { ...rest, $or: [{ [ctxCampo]: { $in: empresasIds } }, { group_id: groupId }] };
      }
    } catch (_) { }
  }
  return f;
}

const SIMPLE_CATALOG_ENTITIES_LIST = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'Departamento', 'Cargo', 'Turno', 'GrupoProduto', 'Marca',
  'SetorAtividade', 'LocalEstoque', 'TabelaFiscal', 'CentroResultado',
  'OperadorCaixa', 'RotaPadrao', 'ModeloDocumento', 'KitProduto', 'CatalogoWeb',
  'Servico', 'CondicaoComercial', 'TabelaPreco', 'PerfilAcesso',
  'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
  'GatewayPagamento', 'ApiExterna', 'Webhook', 'ChatbotIntent', 'ChatbotCanal',
  'JobAgendado', 'EventoNotificacao', 'SegmentoCliente', 'RegiaoAtendimento',
  'ContatoB2B', 'CentroCusto', 'PlanoDeContas', 'PlanoContas',
  'Veiculo', 'Motorista', 'Representante', 'GrupoEmpresarial', 'Empresa',
]);

async function listOne(base44, user, q) {
  const entityName = q?.entityName;
  if (!entityName) return { entityName, items: [] };
  const filtros = q?.filter || {};

  const isSimple = SIMPLE_CATALOG_ENTITIES_LIST.has(entityName);
  const scopeProvided = !!filtros?.empresa_id || !!filtros?.group_id
    || (!!filtros?.$or && Array.isArray(filtros.$or) && filtros.$or.length > 0);
  // Entidades simples de catálogo dispensam escopo multiempresa
  if (user.role !== 'admin' && !scopeProvided && !isSimple) {
    return { entityName, items: [], error: 'escopo_multiempresa_obrigatorio' };
  }

  const pageSize = q?.pageSize || q?.limit;
  const pageNum = Math.max(1, Number(q?.page) || 1);
  const limit = Math.max(1, Math.min(pageSize || 100, 500));
  const skip = Math.max(0, Number(q?.offset ?? q?.skip ?? ((pageNum > 1) ? (pageNum - 1) * limit : 0)) || 0);

  const def = DEFAULT_SORTS[entityName] || { field: 'updated_date', direction: 'desc' };
  const requestedField = q?.sortField || q?.sortBy || def.field;
  const sortField = normalizeSortField(entityName, requestedField);
  const sortDirection = ((q?.sortDirection || def.direction) || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  const orderHint = `${sortDirection === 'desc' ? '-' : ''}${sortField}`;

  const safeFilter = Object.fromEntries(
    Object.entries(filtros).map(([k, v]) => [k, Array.isArray(v) ? v.map(sanitizeVal) : (v && typeof v === 'object' ? v : sanitizeVal(v))])
  );
  let top = normalizeFilterShared(safeFilter);
  // Entidades simples de catálogo (sem empresa_id/group_id): não expandir por grupo
  if (!isSimple) {
    top = await expandByGroupIfNeeded(base44, entityName, top);
  }

  const term = q?.search || q?.busca || filtros?.__search || filtros?.search || filtros?.busca || null;
  let finalWithSearch = top;
  if (term && typeof term === 'string' && term.trim().length) {
    const fields = SEARCH_FIELDS[entityName] || SEARCH_FIELDS.default;
    const rx = { $regex: term.trim(), $options: 'i' };
    const orConds = fields.map(f => ({ [f]: rx }));
    finalWithSearch = finalWithSearch && Object.keys(finalWithSearch).length
      ? { $and: [finalWithSearch, { $or: orConds }] }
      : { $or: orConds };
  }

  const rows = await base44.asServiceRole.entities[entityName].filter(finalWithSearch, orderHint, limit, skip) || [];

  return { entityName, items: rows };
}

// Fase 3: resposta comprimida com gzip quando cliente suporta
async function compressedJson(data, req) {
  const json = JSON.stringify(data);
  const acceptEncoding = req.headers.get('accept-encoding') || '';
  if (!acceptEncoding.includes('gzip')) {
    return new Response(json, { headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const encoded = new TextEncoder().encode(json);
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(encoded);
    writer.close();
    const compressed = await new Response(cs.readable).arrayBuffer();
    return new Response(compressed, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Vary': 'Accept-Encoding',
      },
    });
  } catch (_) {
    // fallback sem compressão
    return new Response(json, { headers: { 'Content-Type': 'application/json' } });
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) { }

    // MODO LOTE: { queries: [{ entityName, filter, sortField, sortDirection, limit, skip, page, pageSize, search }...] }
    const queries = Array.isArray(body?.queries) ? body.queries : null;
    if (queries && queries.length > 0) {
      const results = new Array(queries.length);

      // Sequencial com delay entre queries para evitar burst de 429
      for (let i = 0; i < queries.length; i++) {
        const q = queries[i];
        try {
          results[i] = await listOne(base44, user, q);
        } catch (err) {
          results[i] = { entityName: q?.entityName, items: [], error: String(err?.message || err) };
        }
        if (i < queries.length - 1) {
          await new Promise(r => setTimeout(r, 200)); // 200ms entre queries
        }
      }

      return compressedJson({ results }, req);
    }

    // MODO SINGLE (retrocompatível: retorna array de itens)
    const single = await listOne(base44, user, {
      entityName: body?.entityName,
      filter: body?.filter || {},
      sortField: body?.sortField, sortDirection: body?.sortDirection,
      limit: body?.limit, skip: body?.skip, page: body?.page, pageSize: body?.pageSize,
      search: body?.search || body?.busca
    });
    if (single.error === 'escopo_multiempresa_obrigatorio') {
      return Response.json({ error: single.error }, { status: 400 });
    }
    return compressedJson(single.items, req);

  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});