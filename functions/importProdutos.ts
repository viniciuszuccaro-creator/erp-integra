import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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

    // Mapeamento padrão baseado no que foi informado pelo usuário (colunas por letra)
    // Ex.: 29A, 29B etc. – usamos apenas a letra.
    const defaultMapping = {
      codigo: 'A',
      descricao: 'B',
      tipo_item: 'AI',
      setor_atividade_id: 'R',
      setor_atividade_nome: 'S',
      grupo_produto_id: 'M',
      grupo_produto_nome: 'N',
      peso_teorico_kg_m: 'I',
      peso_liquido_kg: 'P',
      peso_bruto_kg: 'Q',
      unidade_medida: 'D',
      custo_aquisicao: 'AD',
      estoque_minimo: 'F',
      ncm: 'G',
    };

    const mapping = normalizeMapping(inputMapping || defaultMapping);

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

      // Tente acomodar formatos diferentes
      if (Array.isArray(output)) {
        rows = output;
      } else if (Array.isArray(output.rows)) {
        rows = output.rows;
      } else if (Array.isArray(output.data)) {
        rows = output.data;
      } else {
        // Como fallback, tente converter objeto em lista de linhas, se contiver índices
        rows = Object.values(output).filter((v) => typeof v === 'object');
      }
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return Response.json({ error: 'Nenhuma linha encontrada para importar. Informe file_url ou rows.' }, { status: 400 });
    }

    // 2) Normalizar chaves das linhas: aceitar cabeçalhos e/ou letras de colunas
    //    Também recorta pelo intervalo (header_row_index, start_row_index)
    const normalized = normalizeRows(rows, { header_row_index, start_row_index });

    const report = {
      dryRun,
      total_input_rows: normalized.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [],
    };

    // 3) Processar cada linha → montar produto → upsert por (codigo + empresa_id)
    for (const [idx, row] of normalized.entries()) {
      try {
        const produto = buildProdutoFromRow(row, mapping, { empresa_id, group_id });

        if (!produto.descricao || !produto.unidade_medida) {
          report.skipped += 1;
          report.details.push({ index: idx, status: 'skipped', reason: 'Sem descricao/unidade_medida' });
          continue;
        }

        // Upsert por codigo + empresa_id
        const existing = await base44.entities.Produto.filter({ codigo: produto.codigo, empresa_id }, undefined, 1);
        if (dryRun) {
          // Simulação
          report.details.push({ index: idx, status: existing.length ? 'would_update' : 'would_create', codigo: produto.codigo });
          if (existing.length) report.updated += 1; else report.created += 1;
          continue;
        }

        if (existing.length) {
          const current = existing[0];
          await base44.entities.Produto.update(current.id, produto);
          report.updated += 1;
          report.details.push({ index: idx, status: 'updated', id: current.id, codigo: produto.codigo });
        } else {
          const created = await base44.entities.Produto.create(produto);
          report.created += 1;
          report.details.push({ index: idx, status: 'created', id: created.id, codigo: produto.codigo });
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
  // Se já parecer uma lista de objetos "linha" (com valores), retornamos como está.
  // Caso contenha metadados de índice, ignoramos linhas antes de start_row_index.
  // Aqui assumimos que o extrator já retornou objetos por linha (com chaves de cabeçalho ou letras de coluna)
  return rows
    .map((r, i) => ({ __rownum: i + 1, ...r }))
    .filter((r) => r.__rownum >= start_row_index);
}

function getCell(row, keyOrLetter) {
  // Tenta por chave literal (cabeçalho)
  if (row[keyOrLetter] != null && row[keyOrLetter] !== '') return row[keyOrLetter];

  // Tenta por variantes (case-insensitive)
  const foundKey = Object.keys(row).find((k) => k.toLowerCase() === String(keyOrLetter).toLowerCase());
  if (foundKey && row[foundKey] != null && row[foundKey] !== '') return row[foundKey];

  // Se veio uma letra de coluna (ex.: 'AD'), tente chaves como 'A','B','C',... 'AD'
  const letter = String(keyOrLetter).toUpperCase();
  if (row[letter] != null && row[letter] !== '') return row[letter];

  return undefined;
}

function num(v) {
  if (v == null || v === '') return undefined;
  const n = Number(String(v).replace(/\./g, '').replace(/,/g, '.'));
  return Number.isFinite(n) ? n : undefined;
}

function buildProdutoFromRow(row, mapping, { empresa_id, group_id }) {
  const produto = {
    empresa_id,
    group_id,
    codigo: sanitizeStr(getCell(row, mapping.codigo)),
    descricao: sanitizeStr(getCell(row, mapping.descricao)),
    tipo_item: sanitizeStr(getCell(row, mapping.tipo_item)),
    setor_atividade_id: sanitizeStr(getCell(row, mapping.setor_atividade_id)),
    setor_atividade_nome: sanitizeStr(getCell(row, mapping.setor_atividade_nome)),
    grupo_produto_id: sanitizeStr(getCell(row, mapping.grupo_produto_id)),
    grupo_produto_nome: sanitizeStr(getCell(row, mapping.grupo_produto_nome)),
    peso_teorico_kg_m: num(getCell(row, mapping.peso_teorico_kg_m)),
    peso_liquido_kg: num(getCell(row, mapping.peso_liquido_kg)),
    peso_bruto_kg: num(getCell(row, mapping.peso_bruto_kg)),
    unidade_medida: sanitizeStr(getCell(row, mapping.unidade_medida)),
    custo_aquisicao: num(getCell(row, mapping.custo_aquisicao)),
    estoque_minimo: num(getCell(row, mapping.estoque_minimo)),
    ncm: sanitizeStr(getCell(row, mapping.ncm)),
    status: 'Ativo',
    modo_cadastro: 'Lote/Importação',
  };

  // Remover chaves undefined para evitar sobrescrever com null
  Object.keys(produto).forEach((k) => produto[k] === undefined && delete produto[k]);
  return produto;
}

function sanitizeStr(v) {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}