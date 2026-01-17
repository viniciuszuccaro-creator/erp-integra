import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * importProdutos
 *
 * Payload esperado (flexível):
 * {
 *   file_url?: string,          // Opcional: URL do arquivo previamente enviado (CSV/XLSX/XLS)
 *   sheet_name?: string,        // Opcional: nome da planilha (quando XLSX)
 *   header_row_index?: number,  // Padrão: 1
 *   start_row_index?: number,   // Padrão: 2
 *   rows?: Array<object>,       // Opcional: linhas já extraídas (cada linha é um objeto)
 *   mapping?: {                 // Mapeamento campo -> coluna (pode ser letra da coluna ou nome do cabeçalho)
 *     codigo?: string, descricao?: string, tipo_item?: string,
 *     setor_atividade_id?: string, setor_atividade_nome?: string,
 *     grupo_produto_id?: string, grupo_produto_nome?: string,
 *     peso_teorico_kg_m?: string, peso_liquido_kg?: string, peso_bruto_kg?: string,
 *     unidade_medida?: string, custo_aquisicao?: string, estoque_minimo?: string, ncm?: string
 *   },
 *   empresa_id: string,         // Obrigatório: empresa destino
 *   group_id?: string,          // Opcional
 *   dryRun?: boolean            // Quando true, não grava; só simula
 * }
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Admin-only operation: apenas administradores podem importar produtos
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));

    const {
      file_url,
      sheet_name,
      header_row_index = 1,
      start_row_index = 2,
      rows: inputRows,
      mapping: inputMapping,
      empresa_id,
      group_id,
      dryRun = false,
    } = payload || {};

    if (!empresa_id) {
      return Response.json({ error: 'empresa_id é obrigatório' }, { status: 400 });
    }

    // Fase 1 - Blindagem Multiempresa: valida escopo pelo header
    const companyIdHeader = req.headers.get('x-company-id');
    if (!companyIdHeader) {
      return Response.json({ error: 'x-company-id é obrigatório no header' }, { status: 400 });
    }
    if (companyIdHeader !== empresa_id) {
      return Response.json({ error: 'Empresa do header não corresponde ao payload' }, { status: 403 });
    }

    // Mapeamento padrão baseado no layout enviado (linha 1 com cabeçalhos)
    // Colunas exatas: A=Cód. Material, B=Descrição, C=Un., D=Estoque Mínimo, E=Classif. Fiscal,
    // F=Peso Teórico, G=Código da Classe, H=Descrição da Classe, I=Peso Líquido, J=Peso Bruto,
    // K=Código do Grupo, L=Descrição do Grupo, M=Custo Principal, N=Descrição Tipo
    const defaultMapping = {
      codigo: 'A',
      descricao: 'B',
      unidade_medida: 'C',
      estoque_minimo: 'D',
      ncm: 'E',
      peso_teorico_kg_m: 'F',
      grupo_produto_id: 'G',
      grupo_produto_nome: 'H',
      peso_liquido_kg: 'I',
      peso_bruto_kg: 'J',
      setor_atividade_id: 'K',
      setor_atividade_nome: 'L',
      custo_aquisicao: 'M',
      tipo_item: 'N',
    };

    // mapping será definido após extrair as linhas (permite auto-mapeamento por cabeçalho)

    // 1) Extrair linhas se file_url foi fornecida
    let rows = Array.isArray(inputRows) ? inputRows : null;

    if (!rows && file_url) {
              const extractSchema = {
                title: 'TabelaProdutos',
                type: 'object',
                additionalProperties: true,
              };

              const extractRes = await base44.integrations.Core.ExtractDataFromUploadedFile({
                file_url,
                json_schema: extractSchema,
              });

              const { status, output } = extractRes || {};
              if (status !== 'success' || !output) {
                return Response.json({ error: 'Falha ao extrair dados do arquivo', details: extractRes }, { status: 400 });
              }

              const pickFirstArray = (obj) => {
                if (Array.isArray(obj)) return obj;
                for (const v of Object.values(obj || {})) {
                  if (Array.isArray(v)) return v;
                  if (v && typeof v === 'object') {
                    const inner = pickFirstArray(v);
                    if (Array.isArray(inner)) return inner;
                  }
                }
                return null;
              };

              if (sheet_name && output && typeof output === 'object' && Array.isArray(output[sheet_name])) {
                rows = output[sheet_name];
              } else if (Array.isArray(output)) {
                rows = output;
              } else if (Array.isArray(output.rows)) {
                rows = output.rows;
              } else if (Array.isArray(output.data)) {
                rows = output.data;
              } else {
                rows = pickFirstArray(output) || Object.values(output).filter((v) => typeof v === 'object');
              }
            }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return Response.json({ error: 'Nenhuma linha encontrada para importar. Informe file_url ou rows.' }, { status: 400 });
    }

    // 2) Normalizar chaves das linhas: aceitar cabeçalhos e/ou letras de colunas
    //    Também recorta pelo intervalo (header_row_index, start_row_index)
    const normalized = normalizeRows(rows, { header_row_index, start_row_index });

    // Tenta detectar cabeçalhos e montar auto-mapeamento
    const headers = guessHeaders(rows);
    const mapping = normalizeMapping(inputMapping || deriveAutoMapping(headers) || defaultMapping);

    const report = {
      dryRun,
      total_input_rows: normalized.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [],
      headers_detected: headers,
      mapping_used: mapping,
      sample_preview: [],
      reasons: {},
    };

    // Pré-carrega produtos existentes desta empresa para acelerar o upsert
    const existingList = await base44.entities.Produto.filter({ empresa_id }, undefined, 10000);
    const byCode = new Map(existingList.map((p) => [p.codigo, p]));

    // 3) Processar cada linha → montar produto → upsert por (codigo + empresa_id)
    for (const [idx, row] of normalized.entries()) {
      try {
        const produto = buildProdutoFromRow(row, mapping, { empresa_id, group_id });
        if (report.sample_preview.length < 5) {
          report.sample_preview.push({ rownum: row.__rownum || (idx + 1), extracted: produto });
        }

        // Pula possíveis linhas de cabeçalho/label vindas da planilha antiga
        if (isHeaderLike(produto)) {
          report.skipped += 1;
          report.details.push({ index: idx, status: 'skipped', reason: 'header_row' });
          report.reasons['header_row'] = (report.reasons['header_row'] || 0) + 1;
          continue;
        }

        if (!produto.codigo || !produto.descricao) {
          report.skipped += 1;
          report.details.push({ index: idx, status: 'skipped', reason: 'Sem codigo/descricao' });
          report.reasons['Sem codigo/descricao'] = (report.reasons['Sem codigo/descricao'] || 0) + 1;
          continue;
        }

        // Upsert por codigo + empresa_id usando cache em memória
        const current = byCode.get(produto.codigo);
        if (dryRun) {
          report.details.push({ index: idx, status: current ? 'would_update' : 'would_create', codigo: produto.codigo });
          if (current) report.updated += 1; else report.created += 1;
          continue;
        }

        if (current) {
          await base44.entities.Produto.update(current.id, produto);
          report.updated += 1;
          report.details.push({ index: idx, status: 'updated', id: current.id, codigo: produto.codigo });
          byCode.set(produto.codigo, { ...current, ...produto });
        } else {
          const created = await base44.entities.Produto.create(produto);
          report.created += 1;
          report.details.push({ index: idx, status: 'created', id: created.id, codigo: produto.codigo });
          byCode.set(produto.codigo, created);
        }
      } catch (e) {
        report.errors += 1;
        report.details.push({ index: idx, status: 'error', error: String(e?.message || e) });
      }
    }

    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});

// Utilitários
function normalizeMapping(raw) {
  const out = { ...raw };
  // Se o usuário mandou algo como '29AD', ficar apenas com letras
  for (const k of Object.keys(out)) {
    const v = String(out[k] || '').trim();
    const col = v.replace(/\d+/g, '').toUpperCase();
    out[k] = col || v;
  }
  return out;
}

function normalizeRows(rows, { header_row_index = 1, start_row_index = 2 }) {
  // Fallback especial: alguns CSVs PT-BR abrem/extraem como "uma coluna só" com campos separados por ';'.
  // Se detectarmos esse padrão, reconstituímos objetos com chaves por LETRAS (A, B, C, ...) e também pelos cabeçalhos.
  const start = Number(start_row_index) || 2;
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const looksSingleColumn = rows.every((r) => {
    const vals = Object.values(r || {});
    return vals.length === 1 && typeof vals[0] === 'string';
  });

  const hasSemicolons = rows
    .slice(0, Math.min(10, rows.length))
    .some((r) => {
      const v = Object.values(r || {})[0];
      return typeof v === 'string' && v.includes(';');
    });

  let processed = rows;
  if (looksSingleColumn && hasSemicolons) {
    processed = toObjectsFromSemicolonRows(rows, { header_row_index });
  }

  return processed
    .map((r, i) => ({ __rownum: i + 1, ...r }))
    .filter((r) => r.__rownum >= start);
}

function toObjectsFromSemicolonRows(rows, { header_row_index = 1 }) {
  const letters = generateLetters(200);
  const headerIdx = Math.max(1, Number(header_row_index) || 1) - 1;

  const rowsAsArrays = rows.map((r) => {
    const v = Object.values(r || {})[0];
    const line = typeof v === 'string' ? v : '';
    return splitSemicolonLine(line);
  });

  const header = rowsAsArrays[headerIdx] || [];
  const headerClean = header.map((h) => stripQuotes(String(h || '').trim().replace(/^\uFEFF/, '')));

  return rowsAsArrays.map((cells) => {
    const obj = {};
    for (let j = 0; j < cells.length && j < letters.length; j++) {
      const value = stripQuotes(String(cells[j] ?? '').trim());
      const letterKey = letters[j];
      if (value !== '') obj[letterKey] = value;
      const headerKeyRaw = headerClean[j];
      if (headerKeyRaw) {
        obj[headerKeyRaw] = value;
      }
    }
    return obj;
  });
}

function splitSemicolonLine(line) {
  // Parser simples para ; com suporte básico a aspas duplas
  const out = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ';' && !inQuotes) {
      out.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function stripQuotes(s) {
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1);
  }
  return s;
}

function slugify(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateLetters(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    let num = i + 1;
    let label = '';
    while (num > 0) {
      const rem = (num - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      num = Math.floor((num - 1) / 26);
    }
    arr.push(label);
  }
  return arr;
}

function getCell(row, keyOrLetter) {
  if (!row) return undefined;
  const rawKey = String(keyOrLetter || '').trim();
  if (!rawKey) return undefined;

  // 1) Tentativa direta
  if (row[rawKey] != null && row[rawKey] !== '') return row[rawKey];

  // 2) Case-insensitive
  const lower = rawKey.toLowerCase();
  const foundInsensitive = Object.keys(row).find((k) => k.toLowerCase() === lower);
  if (foundInsensitive && row[foundInsensitive] != null && row[foundInsensitive] !== '') return row[foundInsensitive];

  // 3) Normalização avançada (remove acentos, pontuação e espaços)
  const norm = (s) => String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // acentos
    .replace(/[^a-z0-9]/g, '');        // não alfanuméricos

  const normKey = norm(rawKey);
  const foundNormalized = Object.keys(row).find((k) => norm(k) === normKey);
  if (foundNormalized && row[foundNormalized] != null && row[foundNormalized] !== '') return row[foundNormalized];

  // 4) Se veio uma letra de coluna (ex.: 'AD'), tentar por letras também
  const letter = rawKey.toUpperCase();
  if (row[letter] != null && row[letter] !== '') return row[letter];

  // 5) Fallback: usar a POSIÇÃO da coluna a partir da letra (A=1, ..., Z=26, AA=27...)
  const letterToIndex = (str) => {
    if (!str) return 0;
    let idx = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c >= 65 && c <= 90) { // A-Z
        idx = idx * 26 + (c - 64);
      }
    }
    return idx;
  };
  const colIndex = letterToIndex(letter);
  if (colIndex > 0) {
    const values = Object.values(row);
    const v = values[colIndex - 1];
    if (v != null && v !== '') return v;
  }

  return undefined;
}

function num(v) {
  if (v == null || v === '') return undefined;
  const n = Number(String(v).replace(/\./g, '').replace(/,/g, '.'));
  return Number.isFinite(n) ? n : undefined;
}

function getAny(row, candidates) {
  for (const key of candidates) {
    if (!key) continue;
    const val = getCell(row, key);
    if (val != null && val !== '') return val;
  }
  return undefined;
}

function buildProdutoFromRow(row, mapping, { empresa_id, group_id }) {
  const produto = {
    empresa_id,
    group_id,
    codigo: sanitizeStr(getAny(row, [mapping?.codigo, 'Cód. Material linha1 colunaA','Cód. Material','Cod. Material','Cód Material','Codigo Material','Código Material','Código','Codigo','A'])),
    descricao: sanitizeStr(getAny(row, [mapping?.descricao, 'Descrição l1 cB','Descrição','Descricao','Produto','B'])),
    tipo_item: sanitizeStr(getAny(row, [mapping?.tipo_item, 'Descrição Tipo l1 cO','Descrição Tipo','Descricao Tipo','Tipo do item','Tipo Item','AI'])),
    setor_atividade_id: sanitizeStr(getAny(row, [mapping?.setor_atividade_id, 'Codigo do Grupo l1 cL','Codigo do Grupo','Código do Grupo','R'])),
    setor_atividade_nome: sanitizeStr(getAny(row, [mapping?.setor_atividade_nome, 'Descrição do Grupo l1 cM','Descrição do Grupo','Descricao do Grupo','S'])),
    grupo_produto_id: sanitizeStr(getAny(row, [mapping?.grupo_produto_id, 'Codigo da Classe l1 cH','Codigo da Classe','Código da Classe','M'])),
    grupo_produto_nome: sanitizeStr(getAny(row, [mapping?.grupo_produto_nome, 'Descrição da Classe l1 cI','Descrição da Classe','Descricao da Classe','N'])),
    peso_teorico_kg_m: num(getAny(row, [mapping?.peso_teorico_kg_m, 'Peso Teórico l1 cF','Peso Teórico','Peso Teorico','I'])),
    peso_liquido_kg: num(getAny(row, [mapping?.peso_liquido_kg, 'Peso Liquido l1 cJ','Peso Liquido','Peso Líquido','P'])),
    peso_bruto_kg: num(getAny(row, [mapping?.peso_bruto_kg, 'Peso Bruto l1 cK','Peso Bruto','Q'])),
    unidade_medida: sanitizeStr(getAny(row, [mapping?.unidade_medida, 'Un. l1 cC','Un.','UN','Un','Unidade','Unidade Medida','D'])) || 'UN',
    custo_aquisicao: num(getAny(row, [mapping?.custo_aquisicao, 'Custo Principal l1 cN','Custo Principal','Custo','AD'])),
    estoque_minimo: num(getAny(row, [mapping?.estoque_minimo, 'Estoque Minimo l1 cD','Estoque Minimo','Estoque Mínimo','F'])),
    ncm: sanitizeStr(getAny(row, [mapping?.ncm, 'Classif. Fiscal l1 cE','Classif. Fiscal','Classif Fiscal','NCM','G'])),
    codigo_barras: sanitizeStr(getAny(row, [mapping?.codigo_barras, 'Código Barra l1 cG','Código Barra','Codigo Barra'])),

    status: 'Ativo',
    modo_cadastro: 'Lote/Importação',
  };

  // Remover chaves undefined para evitar sobrescrever com null
        Object.keys(produto).forEach((k) => produto[k] === undefined && delete produto[k]);

        // Preenchimento automático quando IDs não vierem mas os nomes vierem no relatório
        if (!produto.grupo_produto_id && produto.grupo_produto_nome) {
          produto.grupo_produto_id = `classe-${slugify(produto.grupo_produto_nome)}`;
        }
        if (!produto.setor_atividade_id && produto.setor_atividade_nome) {
          produto.setor_atividade_id = `setor-${slugify(produto.setor_atividade_nome)}`;
        }

        return produto;
      }

function sanitizeStr(v) {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}

function norm(s) {
        return String(s || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
      }

      // Helpers de cabeçalho e auto-mapeamento
      function headerNormalize(s) {
        return String(s || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();
      }

      function guessHeaders(rows) {
        if (!Array.isArray(rows) || rows.length === 0) return [];
        const first = rows.find(r => r && Object.keys(r).length > 0);
        if (!first) return [];
        // Se for array, não temos nomes – retornamos vazio
        if (Array.isArray(first)) return [];
        return Object.keys(first);
      }

      function deriveAutoMapping(headers) {
        if (!headers || headers.length === 0) return null;
        const idx = {};
        headers.forEach((h) => { idx[headerNormalize(h)] = h; });

        const pick = (...cands) => {
          for (const c of cands) {
            const key = Object.keys(idx).find(k => k.includes(c));
            if (key) return idx[key];
          }
          return null;
        };

        return {
          codigo: pick('cod material', 'codigo material', 'cod produto', 'codigo', 'sku', 'referencia'),
          descricao: pick('descricao', 'descrição', 'produto', 'nome'),
          unidade_medida: pick('un.', 'unidade', 'unid', 'un'),
          estoque_minimo: pick('estoque minimo', 'estoque min'),
          ncm: pick('ncm', 'classif fiscal', 'classificacao fiscal'),
          peso_teorico_kg_m: pick('peso teorico', 'peso teorico kg m', 'peso kg m'),
          grupo_produto_id: pick('codigo da classe', 'cod classe', 'classe codigo'),
          grupo_produto_nome: pick('descricao da classe', 'classe descricao'),
          peso_liquido_kg: pick('peso liquido', 'peso liq'),
          peso_bruto_kg: pick('peso bruto'),
          setor_atividade_id: pick('codigo do grupo', 'cod grupo', 'grupo codigo'),
          setor_atividade_nome: pick('descricao do grupo', 'grupo descricao'),
          custo_aquisicao: pick('custo principal', 'custo'),
          tipo_item: pick('descricao tipo', 'tipo', 'tipo item'),
        };
      }

function isHeaderLike(prod) {
  const d = norm(prod?.descricao);
  const c = norm(prod?.codigo);
  const u = norm(prod?.unidade_medida);
  const headerWords = ['descricao', 'descrição', 'produto', 'nome'];
  const codeWords = ['codigo', 'código', 'sku', 'referencia'];
  if (headerWords.includes(d)) return true;
  if (codeWords.includes(c)) return true;
  if (u === 'unidade') return true;
  return false;
}