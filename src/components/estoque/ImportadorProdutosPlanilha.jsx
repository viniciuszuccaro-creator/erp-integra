import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, CheckCircle2, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helpers
const num = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(String(v).replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(n) ? n : undefined;
};

const sanitize = (v) => {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

const removeDiacritics = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const get = (row, keys) => {
  const normKey = (s) => removeDiacritics(String(s || '').toLowerCase().trim().replace(/^\uFEFF/, ''));
  const tryReturn = (key) => (key != null && row[key] != null && row[key] !== '') ? row[key] : undefined;
  const rowKeys = Object.keys(row || {});
  const rowKeysNorm = rowKeys.map((rk) => ({ raw: rk, norm: normKey(rk) }));

  for (const k of keys) {
    if (!k) continue;
    // 1) direto e variações simples
    const direct = tryReturn(k); if (direct !== undefined) return direct;
    const upper = tryReturn(String(k).toUpperCase()); if (upper !== undefined) return upper;

    // 2) comparações normalizadas
    const target = normKey(k);
    const eq = rowKeysNorm.find((rk) => rk.norm === target);
    if (eq) { const v = tryReturn(eq.raw); if (v !== undefined) return v; }

    // 3) fuzzy: inclui o alvo dentro do cabeçalho normalizado (ex.: "descr" casa com "descricao do produto")
    if (target.length >= 4) {
      const incl = rowKeysNorm.find((rk) => rk.norm.includes(target));
      if (incl) { const v = tryReturn(incl.raw); if (v !== undefined) return v; }
    }
  }
  return undefined;
};

// Normalização e detecção da linha de cabeçalho
const norm = (s) => String(s || "").normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
// Após converter a planilha em objetos, não há linha de cabeçalho nas linhas retornadas.
// Para evitar falsos positivos (ex.: valores "UN"/"KG" sendo confundidos com cabeçalho), sempre retornamos false.
const isHeaderRow = () => false; // nunca descarta linhas de dados

// Mapeamento fixo conforme especificação do usuário (linha 1 = cabeçalhos, dados a partir da linha 2)
const HEADERS = {
  codigo: [
    "Cód. Material", "Cod. Material", "Código", "Codigo", "Código Material", "Codigo Material",
    "SKU", "Código Interno", "Codigo Interno", "A"
  ],
  descricao: [
    "Descrição", "Descricao", "Descrição Produto", "Descricao Produto", "Descrição do Produto", "Descricao do Produto",
    "Descrição do Material", "Descricao do Material", "Descrição Material", "Descricao Material",
    "Produto", "Nome", "Nome do Produto", "Item", "B"
  ],
  unidade_medida: [
    "Un.", "UN", "Un", "Unidade", "Unid.", "Unid", "Unidade de Medida", "Unidade Medida",
    "UNIDADE", "UM", "UNI", "UND", "C"
  ],
  estoque_minimo: ["Estoque Minimo", "Estoque Mínimo", "Estoque Mínimo (Qtd)", "D"],
  ncm: ["Classif. Fiscal", "NCM", "Classificação Fiscal", "Classificacao Fiscal", "E"],
  peso_teorico_kg_m: ["Peso Teórico", "Peso Teorico", "Peso Teorico KG/M", "F"],
  grupo_produto_id: ["Codigo da Classe", "Código da Classe", "Código do Grupo de Produto", "ID Grupo Produto", "G"],
  grupo_produto_nome: ["Descrição da Classe", "Descricao da Classe", "Grupo do Produto", "Grupo Produto", "H"],
  peso_liquido_kg: ["Peso Liquido", "Peso Líquido", "I"],
  peso_bruto_kg: ["Peso Bruto", "J"],
  setor_atividade_id: ["Codigo do Grupo", "Código do Grupo", "ID Setor Atividade", "K"],
  setor_atividade_nome: ["Descrição do Grupo", "Descricao do Grupo", "Setor de Atividade", "L"],
  custo_aquisicao: ["Custo Principal", "Custo", "Preço de Custo", "Preco de Custo", "M"],
  tipo_item: ["Descrição Tipo", "Descricao Tipo", "Tipo do Item", "Tipo", "N"],
};

// Normalizadores para evitar 422 (enum inválido)
const mapUnidade = (v) => {
  const s = norm(v || '').replace(/\./g, '');
  switch (s) {
    case 'un': case 'und': case 'unid': return 'UN';
    case 'pc': case 'pç': case 'peca': case 'pec': case 'peça': return 'PC';
    case 'kg': case 'kilo': return 'KG';
    case 'lt': case 'l': return 'LT';
    case 'mt': case 'm': return 'MT';
    case 'cx': case 'caixa': return 'CX';
    case 'm2': case 'm²': return 'M2';
    case 'm3': case 'm³': return 'M3';
    default: return 'UN';
  }
};
const mapTipoItem = (v) => {
        const s = norm(v || '');
        if (s.includes('rev')) return 'Revenda';
        if (s.includes('mater') || s.includes('prima')) return 'Matéria-Prima Produção';
        if (s.includes('acab')) return 'Produto Acabado';
        if (s.includes('consum')) return 'Consumo Interno';
        if (s.includes('serv')) return 'Serviço';
        return 'Revenda';
      };

      // Validações adicionais
      const UNIDADES_ACEITAS = ['UN','PC','KG','LT','MT','CX','M2','M3'];
      const sanitizeNCM = (v) => {
        const s = String(v || '').replace(/\./g, '').trim();
        return s || undefined;
      };
      const isNCMValido = (v) => {
        const s = String(v || '').replace(/\./g, '').trim();
        return s === '' || /^\d{8}$/.test(s);
      };
      const makeKey = (empresaId, codigo) => `${empresaId || ''}__${String(codigo || '').toUpperCase()}`;

export default function ImportadorProdutosPlanilha({ onConcluido, closeSelf }) {
  const { empresaAtual } = useContextoVisual();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [preview, setPreview] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [totalLinhas, setTotalLinhas] = useState(0);
  const [erro, setErro] = useState('');
  const [grupoId, setGrupoId] = useState('');
  const [empresaId, setEmpresaId] = useState(empresaAtual?.id || '');
const [importarParaTodasEmpresas, setImportarParaTodasEmpresas] = useState(false);
const [baseProdutos, setBaseProdutos] = useState([]);
const [validationErrors, setValidationErrors] = useState([]); // {empresa_id, codigo, motivo}
const [duplicidades, setDuplicidades] = useState([]); // {empresa_id, codigo, existente, novo}
const [escolhasDuplicidades, setEscolhasDuplicidades] = useState({}); // key -> 'atualizar' | 'pular'
const [checando, setChecando] = useState(false);
  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos-empresariais'],
    queryFn: () => base44.entities.GrupoEmpresarial.list(),
    staleTime: 300000,
  });
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-por-grupo', grupoId],
    queryFn: async () => {
      // Garantir que o grupo selecionado existe e recarregar quando trocar
      if (!grupoId) return base44.entities.Empresa.list();
      // Alguns clientes usam campos diferentes (group_id vs grupo_id)
      const [byGroup, byGrupo, byGroupExact] = await Promise.all([
        base44.entities.Empresa.filter({ group_id: grupoId }),
        base44.entities.Empresa.filter({ grupo_id: grupoId }),
        base44.entities.Empresa.filter({ groupId: grupoId }),
      ]);
      const merged = [...(byGroup || []), ...(byGrupo || []), ...(byGroupExact || [])];
      // dedup por id
      const map = new Map();
      merged.forEach(e => { if (e?.id) map.set(e.id, e); });
      const arr = Array.from(map.values());
      return arr.length ? arr : [];
    },
    staleTime: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Opções de grupos: usa GrupoEmpresarial quando disponível; caso contrário, deriva dos group_id das empresas
  const groupsOptions = React.useMemo(() => {
    if (Array.isArray(grupos) && grupos.length > 0) return grupos;
    const ids = new Set();
    (empresas || []).forEach(e => {
      if (e?.group_id) ids.add(e.group_id);
      if (e?.grupo_id) ids.add(e.grupo_id);
      if (e?.groupId) ids.add(e.groupId);
    });
    return Array.from(ids).map(id => ({ id, nome: id }));
  }, [grupos, empresas]);



  React.useEffect(() => {
    if (!empresaId && empresaAtual?.id) {
      setEmpresaId(empresaAtual.id);
    } else if (!empresaId && empresas?.length > 0) {
      setEmpresaId(empresas[0].id);
    }
  }, [empresaAtual?.id, empresas?.length, empresaId]);

  // Calcula a lista de produtos alvo (considerando importação por grupo)
  const getProdutosAlvo = () => {
    if (!baseProdutos?.length) return [];
    if ((importarParaTodasEmpresas && grupoId && empresas?.length) || (!empresaId && grupoId && empresas?.length)) {
      return empresas.flatMap(emp => baseProdutos.map(p => ({ ...p, empresa_id: emp.id, group_id: grupoId, compartilhado_grupo: true })));
    }
    return baseProdutos;
  };

  const downloadErrosCSV = () => {
    if (!validationErrors.length) return;
    const headers = ['empresa_id','codigo','motivo'];
    const rows = validationErrors.map(e => [e.empresa_id || '', e.codigo || '', e.motivo || '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(x => `"${String(x).replace(/"/g,'"')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'erros_importacao_produtos.csv';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  // Validação e checagem de duplicidade no banco
  React.useEffect(() => {
    const validar = async () => {
      if (!baseProdutos?.length) { setValidationErrors([]); setDuplicidades([]); setEscolhasDuplicidades({}); return; }
      const produtosAlvo = getProdutosAlvo();
      setChecando(true);
      setValidationErrors([]);
      setDuplicidades([]);
      setEscolhasDuplicidades({});

      const erros = [];
      const internos = new Set();
      const vistos = new Set();
      for (const p of produtosAlvo) {
        const k = makeKey(p.empresa_id, p.codigo);
        if (!p?.codigo) erros.push({ empresa_id: p.empresa_id, codigo: '-', motivo: 'Código ausente' });
        if (!p?.descricao || String(p.descricao).trim() === '') erros.push({ empresa_id: p.empresa_id, codigo: p.codigo, motivo: 'Descrição obrigatória ausente' });
        if (!UNIDADES_ACEITAS.includes(p.unidade_medida)) erros.push({ empresa_id: p.empresa_id, codigo: p.codigo, motivo: 'Unidade de medida inválida' });
        if (!isNCMValido(p.ncm)) erros.push({ empresa_id: p.empresa_id, codigo: p.codigo, motivo: 'NCM inválido' });
        if (vistos.has(k)) internos.add(k); else vistos.add(k);
      }
      // Duplicidades internas na planilha
      if (internos.size) {
        internos.forEach(k => {
          const [empId, code] = k.split('__');
          erros.push({ empresa_id: empId, codigo: code, motivo: 'Código duplicado na empresa (na planilha)' });
        });
      }

      // Checagem no banco por empresa+codigo
      const keys = Array.from(new Set(produtosAlvo
        .filter(p => p.codigo)
        .map(p => makeKey(p.empresa_id, p.codigo))));

      const duplics = [];
      const chunk = 200;
      for (let i = 0; i < keys.length; i += chunk) {
        const slice = keys.slice(i, i + chunk);
        const calls = slice.map(async (k) => {
          const [empId, code] = k.split('__');
          // se já é duplicidade interna, não precisa checar no banco
          if (internos.has(k)) return null;
          const encontrados = await base44.entities.Produto.filter({ empresa_id: empId, codigo: code }, undefined, 1);
          if (Array.isArray(encontrados) && encontrados.length > 0) {
            // pegue o primeiro produto correspondente da planilha para compor o "novo"
            const novo = produtosAlvo.find(p => makeKey(p.empresa_id, p.codigo) === k);
            duplics.push({ empresa_id: empId, codigo: code, existente: encontrados[0], novo });
          }
          return null;
        });
        await Promise.allSettled(calls);
      }
      setValidationErrors(erros);
      setDuplicidades(duplics);
      setChecando(false);
    };
    validar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseProdutos, empresaId, grupoId, importarParaTodasEmpresas, empresas?.length]);

  const detectEncoding = async (file) => {
    try {
      const buf = await file.slice(0, 4).arrayBuffer();
      const b = new Uint8Array(buf);
      if (b[0] === 0xFF && b[1] === 0xFE) return 'UTF-16LE';
      if (b[0] === 0xFE && b[1] === 0xFF) return 'UTF-16BE';
      if (b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) return 'UTF-8';
    } catch (_) {}
    return 'UTF-8';
  };

  // CSV parser com suporte a BOM e linha "sep=;"/"sep=,"
  const parseCSVRows = (raw) => {
    let text = String(raw || '');
    // remove BOM
    text = text.replace(/^\uFEFF/, '');

    // checa diretiva de separador do Excel (primeira linha: sep=; ou sep=,)
    let sepDirective = null;
    const firstBreak = (() => {
      const n = text.indexOf('\n');
      const r = text.indexOf('\r');
      if (n === -1 && r === -1) return -1;
      if (n === -1) return r;
      if (r === -1) return n;
      return Math.min(n, r);
    })();
    if (firstBreak > -1) {
      const firstLine = text.slice(0, firstBreak).trim();
      const m = /^sep=(.|\t)$/i.exec(firstLine);
      if (m) {
        sepDirective = m[1] === 't' ? '\t' : m[1];
        // remove a linha de diretiva do conteúdo antes de parsear
        text = text.slice(firstBreak + 1);
      }
    }

    // detectar delimitador ("," ";" ou tab) na primeira linha útil
    const detectDelim = (line) => {
      if (sepDirective) return sepDirective;
      const cand = [',', ';', '\t'];
      const counts = { ',': 0, ';': 0, '\t': 0 };
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        const next = line[i + 1];
        if (inQ) {
          if (ch === '"' && next === '"') { i++; continue; }
          if (ch === '"') { inQ = false; continue; }
        } else {
          if (ch === '"') { inQ = true; continue; }
          if (cand.includes(ch)) counts[ch]++;
          if (ch === '\n' || ch === '\r') break;
        }
      }
      const best = cand.reduce((a, b) => (counts[a] >= counts[b] ? a : b));
      return counts[best] > 0 ? best : ';'; // default mais comum em pt-BR
    };

    const firstLineEnd = (() => {
      const n = text.indexOf('\n');
      const r = text.indexOf('\r');
      if (n === -1 && r === -1) return text.length;
      if (n === -1) return r;
      if (r === -1) return n;
      return Math.min(n, r);
    })();
    const delim = detectDelim(text.slice(0, firstLineEnd));

    const rows = [];
    let row = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];
      if (inQuotes) {
        if (ch === '"' && next === '"') { cur += '"'; i++; continue; }
        if (ch === '"') { inQuotes = false; continue; }
        cur += ch;
      } else {
        if (ch === '"') { inQuotes = true; continue; }
        if (ch === delim) { row.push(cur); cur = ''; continue; }
        if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && next === '\n') i++; // CRLF
          row.push(cur); rows.push(row); row = []; cur = '';
          continue;
        }
        cur += ch;
      }
    }
    row.push(cur);
    rows.push(row);
    return rows.filter(r => r.some(c => String(c || '').trim() !== ''));
  };

  const extrairLinhas = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);

    const ext = (file?.name || '').split('.').pop()?.toLowerCase();
    const encoding = await detectEncoding(file);

    // CSV: parse local para evitar problemas de encoding no servidor
    if (ext === 'csv') {
      const buf = await file.arrayBuffer();

      // primeira tentativa: usar encoding detectado
      const decodeWith = (enc) => {
        try { return new TextDecoder(enc).decode(buf); } catch { return null; }
      };

      let text = null;
      if (encoding === 'UTF-16LE' || encoding === 'UTF-16BE') {
        text = decodeWith(encoding === 'UTF-16LE' ? 'utf-16le' : 'utf-16be');
      } else {
        text = decodeWith('utf-8');
      }
      // heurística: se tiver muitos \u0000 ou �, tenta alternativas
      const hasNulls = text && /\u0000/.test(text);
      const manyReplacement = text && ((text.match(/\uFFFD/g)?.length) || 0) > 5;
      if (!text || hasNulls || manyReplacement) {
        text = decodeWith('utf-16le') || decodeWith('utf-16be') || decodeWith('iso-8859-1') || decodeWith('windows-1252') || text;
      }

      // 1) Parser local
      const rowsAA = parseCSVRows(text || '');
      if (Array.isArray(rowsAA) && rowsAA.length > 0) {
        const headerRowRaw = rowsAA[0].map((h) => String(h ?? '').replace(/^\uFEFF/, '').trim());
        const dataRows = rowsAA.slice(1);
        const maxLen = Math.max(headerRowRaw.length, ...dataRows.map(r => r.length, 0));
        let headerRow = headerRowRaw;
        const nonEmptyHeaders = headerRowRaw.filter(h => h).length;
        if (nonEmptyHeaders === 0) {
          headerRow = Array.from({ length: maxLen }, (_, i) => `COL_${i + 1}`);
        } else if (headerRowRaw.length < maxLen) {
          headerRow = [
            ...headerRowRaw,
            ...Array.from({ length: maxLen - headerRowRaw.length }, (_, i) => `COL_${headerRowRaw.length + i + 1}`)
          ];
        }
        const objetos = dataRows.map((linha) => {
          const obj = {};
          for (let i = 0; i < maxLen; i++) {
            const val = linha[i];
            const header = headerRow[i];
            if (header) obj[header] = val;
            const letter = String.fromCharCode(65 + i); // A, B, C...
            obj[letter] = val;
          }
          return obj;
        });
        if (objetos.length > 0) return objetos.filter((o) => Object.keys(o).length > 0);
      }

      // 2) Fallback: extrator do Core tentando array de arrays
      try {
        const r = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: file_url,
          json_schema: { type: 'array', items: { type: 'array' } }
        });
        const arr = Array.isArray(r?.output) ? r.output : [];
        if (arr.length > 0 && Array.isArray(arr[0])) {
          const headerRow = arr[0].map((h) => String(h ?? '').trim());
          const dataRows = arr.slice(1);
          const maxLen = Math.max(headerRow.length, ...dataRows.map(r => r.length, 0));
          const objetos = dataRows.map((linha) => {
            const obj = {};
            for (let i = 0; i < maxLen; i++) {
              const val = linha[i];
              const header = headerRow[i] || `COL_${i+1}`;
              if (header) obj[header] = val;
              const letter = String.fromCharCode(65 + i);
              obj[letter] = val;
            }
            return obj;
          });
          if (objetos.length > 0) return objetos.filter((o) => Object.keys(o).length > 0);
        }
      } catch (_) {}

      return [];
    }

    if (['xls','xlsx'].includes(ext)) {
      const { data } = await base44.functions.invoke('parseSpreadsheet', { file_url });
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      return rows;
    }

    // 1) Tenta extrair como array de arrays (CSV): primeira linha = cabeçalho
    const attemptExtract = async (schema) => {
      const encs = [
        (encoding === 'UTF-16LE' || encoding === 'UTF-16BE') ? 'UTF-16' : encoding,
        'UTF-16',
        'ISO-8859-1'
      ];
      for (const enc of encs) {
        try {
          const r = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: schema,
            encoding: enc,
            ignore_errors: true,
          });
          if (r && (r.output || r.data)) return r;
        } catch (_) { /* tenta próximo encoding */ }
      }
      return null;
    };

    let res = await attemptExtract({ type: "array", items: { type: "array" } });

    if (Array.isArray(res?.output) && res.output.length > 1 && Array.isArray(res.output[0])) {
      const headerRow = res.output[0].map((h) => String(h || "").trim());
      const dataRows = res.output.slice(1);
      const objetos = dataRows.map((linha) => {
        const obj = {};
        headerRow.forEach((header, i) => {
          const val = linha[i];
          if (header) obj[header] = val;
          const letter = String.fromCharCode(65 + i);
          obj[letter] = val;
        });
        return obj;
      });
      return objetos.filter((o) => Object.keys(o).length > 0);
    }

    // 2) Fallback: extrai como objeto genérico e procura arrays de objetos em 'rows'/'data' ou propriedades
    res = res || await attemptExtract({ type: "object", additionalProperties: true });

    const out = res?.output || {};
    const pickArrayOfObjects = (obj) => {
      if (Array.isArray(obj) && obj.every((it) => typeof it === "object" && !Array.isArray(it))) return obj;
      if (Array.isArray(obj?.rows)) return obj.rows;
      if (Array.isArray(obj?.data)) return obj.data;
      for (const val of Object.values(obj)) {
        if (Array.isArray(val) && val.every((it) => typeof it === "object" && !Array.isArray(it))) return val;
      }
      return [];
    };

    const rows = pickArrayOfObjects(out);
    return Array.isArray(rows) ? rows : [];
  };

  const montarProduto = (row) => {
    const produto = {
      empresa_id: empresaId,
      codigo: sanitize(get(row, HEADERS.codigo)),
      descricao: sanitize(get(row, HEADERS.descricao))?.slice(0, 250),
      unidade_medida: mapUnidade(get(row, HEADERS.unidade_medida)),
      estoque_minimo: num(get(row, HEADERS.estoque_minimo)) || 0,
      ncm: sanitizeNCM(get(row, HEADERS.ncm)),
      peso_teorico_kg_m: num(get(row, HEADERS.peso_teorico_kg_m)),
      grupo_produto_id: sanitize(get(row, HEADERS.grupo_produto_id)),
      grupo_produto_nome: sanitize(get(row, HEADERS.grupo_produto_nome)),
      peso_liquido_kg: num(get(row, HEADERS.peso_liquido_kg)),
      peso_bruto_kg: num(get(row, HEADERS.peso_bruto_kg)),
      setor_atividade_id: sanitize(get(row, HEADERS.setor_atividade_id)),
      setor_atividade_nome: sanitize(get(row, HEADERS.setor_atividade_nome)),
      custo_aquisicao: num(get(row, HEADERS.custo_aquisicao)),
      tipo_item: mapTipoItem(get(row, HEADERS.tipo_item)),
      status: "Ativo",
      modo_cadastro: "Lote/Importação",
    };

    // Remover indefinidos
    Object.keys(produto).forEach((k) => produto[k] === undefined && delete produto[k]);
    return produto;
  };

  const handleArquivo = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setArquivo(f);
    setProcessando(true);
    try {
      if (!empresaId && !grupoId) {
        setErro('Selecione a empresa OU um grupo antes de importar.');
        toast.error('Selecione a empresa ou um grupo.');
        return;
      }
      const rows = await extrairLinhas(f);
      if (!rows.length) {
        toast.error("Não encontramos linhas na planilha.");
        return;
      }

      const dataRows = rows.filter((r) => !isHeaderRow(r));
      setTotalLinhas(dataRows.length);

      // Montar preview (limitada) apenas com dados
      const baseAll = dataRows
        .map((r) => montarProduto(r))
        .filter((p) => p?.descricao);
      const pre = baseAll.slice(0, 50);
      setPreview(pre);
      setBaseProdutos(baseAll);
      setErro('');
      toast.success(`Arquivo lido: ${dataRows.length} item(ns) de produto`);
    } finally {
      setProcessando(false);
    }
  };

  const importar = async () => {
    setErro('');
    if (!arquivo) {
      setErro('Selecione um arquivo válido.');
      toast.error("Selecione um arquivo válido.");
      return;
    }
    if (!empresaId && !grupoId) {
      setErro('Selecione a empresa de destino ou um grupo.');
      toast.error('Selecione a empresa ou um grupo.');
      return;
    }
    toast("Iniciando importação...");
    setProcessando(true);
    try {
      // Reextrai linhas para processar tudo (não só o preview)
      const rows = await extrairLinhas(arquivo);
      const dataRows = rows.filter((r) => !isHeaderRow(r));
      const baseProdutos = dataRows.map((r) => montarProduto(r)).filter((p) => p?.descricao);
      let produtos;
      if ((importarParaTodasEmpresas && grupoId && empresas?.length) || (!empresaId && grupoId && empresas?.length)) {
        produtos = empresas.flatMap(emp => baseProdutos.map(p => ({ ...p, empresa_id: emp.id, group_id: grupoId, compartilhado_grupo: true })));
      } else {
        produtos = baseProdutos;
      }

      // Remover itens com erros de validação
      const errorKeys = new Set(validationErrors.map(e => makeKey(e.empresa_id, e.codigo)));
      produtos = produtos.filter(p => !errorKeys.has(makeKey(p.empresa_id, p.codigo)));

      // Executar atualizações para duplicidades marcadas como "atualizar"
      const dupChoice = (d) => escolhasDuplicidades[makeKey(d.empresa_id, d.codigo)] === 'atualizar';
      const paraAtualizar = duplicidades.filter(dupChoice);
      let updatedTotal = 0;
      if (paraAtualizar.length > 0) {
        const chunkU = 200;
        for (let i = 0; i < paraAtualizar.length; i += chunkU) {
          const parte = paraAtualizar.slice(i, i + chunkU);
          const res = await Promise.allSettled(parte.map(d => {
            const patch = { ...d.novo };
            delete patch.id;
            delete patch.empresa_id;
            delete patch.group_id;
            delete patch.created_date;
            delete patch.updated_date;
            delete patch.created_by;
            delete patch.codigo; // não alteramos o código-chave na atualização
            if (patch.ncm != null) patch.ncm = sanitizeNCM(patch.ncm);
            Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k]);
            return base44.entities.Produto.update(d.existente.id, patch);
          }));
          updatedTotal += res.filter(r => r.status === 'fulfilled').length;
        }
      }

      // Remover todas as duplicidades (atualizadas ou puladas) da criação
      const dupKeys = new Set(duplicidades.map(d => makeKey(d.empresa_id, d.codigo)));
      produtos = produtos.filter(p => !dupKeys.has(makeKey(p.empresa_id, p.codigo)));

      if (produtos.length === 0) {
        const hasDesc = dataRows.some(r => !!sanitize(get(r, HEADERS.descricao)));
        const hasUn = dataRows.some(r => !!sanitize(get(r, HEADERS.unidade_medida)));
        const expectedDesc = HEADERS.descricao.filter(h => h.length > 1).join(', ');
        const expectedUn = HEADERS.unidade_medida.filter(h => h.length > 1).join(', ');
        const headersPrimeiros = (() => {
          const set = new Set();
          (Array.isArray(rows) ? rows.slice(0,5) : []).forEach(r => Object.keys(r || {}).forEach(k => set.add(k)));
          return Array.from(set);
        })();
        const dicas = [];
        if (!hasDesc) dicas.push(`- Cabeçalho de Descrição ausente (ex.: ${expectedDesc}).`);
        if (!hasUn) dicas.push(`- Cabeçalho de Unidade ausente (ex.: ${expectedUn}).`);
        if (!empresaId && !grupoId) dicas.push('- Selecione a empresa de destino ou um grupo.');
        const msg = `Nada para importar. Verifique o cabeçalho da planilha e os campos obrigatórios.\nObrigatórios: Descrição, Unidade (Un.) e Empresa ou Grupo de destino.\n${dicas.join('\n')}\nDetectamos estes cabeçalhos: ${headersPrimeiros.join(', ')}`;
        setErro(msg);
        toast.error('Nada para importar. Veja os detalhes acima.');
        return;
      }

      // Importação sequencial robusta (evita falhas de bulk em alguns provedores)
      const chunkSize = 200;
      let createdTotal = 0;
      for (let i = 0; i < produtos.length; i += chunkSize) {
        const chunk = produtos.slice(i, i + chunkSize);
        const results = await Promise.allSettled(chunk.map((p) => base44.entities.Produto.create(p)));
        createdTotal += results.filter(r => r.status === 'fulfilled').length;
      }

      toast.success(`Importação concluída: ${createdTotal} produto(s) criado(s).`);
      onConcluido && onConcluido();
      closeSelf && closeSelf();
    } catch (e) {
      toast.error(e?.message || "Erro ao importar");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Card className="border-indigo-200">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base">Importar Planilha de Produtos</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Alert className="border-indigo-200 bg-indigo-50">
          <AlertDescription className="text-sm text-indigo-900">
            Envie uma planilha com 14 colunas (A–N) e cabeçalho na linha 1. Dados a partir da linha 2. Formatos: XLS, XLSX, CSV, CSV UTF‑8.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Grupo (opcional)</Label>
            <Select value={grupoId} onValueChange={(v) => { setGrupoId(v); setEmpresaId(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {(groupsOptions || []).map((g) => (
                                        <SelectItem key={g.id} value={g.id}>
                                          {g.nome_fantasia || g.razao_social || g.nome_do_grupo || g.nome || g.descricao || g.sigla || g.id}
                                        </SelectItem>
                                      ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Empresa de destino</Label>
            <Select value={empresaId} onValueChange={setEmpresaId} disabled={!!grupoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nome_fantasia || e.razao_social || e.nome || e.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Input
            type="file"
            accept=".xls,.xlsx,.csv,text/csv"
            onChange={handleArquivo}
            disabled={processando}
          />
          {arquivo && (
            <p className="text-xs text-slate-500 mt-1">{arquivo.name}</p>
          )}
        </div>

        {erro && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">{erro}</AlertDescription>
          </Alert>
        )}

        {preview.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm">Pré-visualização (mostrando {preview.length} de {totalLinhas} itens){importarParaTodasEmpresas || (!empresaId && grupoId) ? ' • Modo: Grupo (todas as empresas)' : ''} • Grupos: {Array.from(new Set(preview.map(p => p.grupo_produto_nome || p.grupo_produto_id).filter(Boolean))).length} • Setores: {Array.from(new Set(preview.map(p => p.setor_atividade_nome || p.setor_atividade_id).filter(Boolean))).length}</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="max-h-64 overflow-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white">
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>UN</TableHead>
                      <TableHead>Estoque Mín.</TableHead>
                      <TableHead>NCM</TableHead>
                      <TableHead>Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{p.codigo || "-"}</TableCell>
                        <TableCell className="font-medium">{p.descricao}</TableCell>
                        <TableCell>{p.unidade_medida}</TableCell>
                        <TableCell>{p.estoque_minimo ?? 0}</TableCell>
                        <TableCell>{p.ncm || "-"}</TableCell>
                        <TableCell>R$ {(p.custo_aquisicao || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox id="importar-grupo" checked={importarParaTodasEmpresas} onCheckedChange={(v) => setImportarParaTodasEmpresas(!!v)} />
                <Label htmlFor="importar-grupo" className="text-sm">
                  Importar para todas as empresas do grupo selecionado
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Duplicidades */}
        {duplicidades.length > 0 && (
          <Card className="border-amber-200 mt-4">
            <CardHeader className="bg-amber-50 border-b">
              <CardTitle className="text-sm">Produtos duplicados por código na empresa ({duplicidades.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const all = {}; duplicidades.forEach(d => { all[makeKey(d.empresa_id, d.codigo)] = 'atualizar'; });
                  setEscolhasDuplicidades(all);
                }}>Marcar todos como Atualizar</Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const all = {}; duplicidades.forEach(d => { all[makeKey(d.empresa_id, d.codigo)] = 'pular'; });
                  setEscolhasDuplicidades(all);
                }}>Marcar todos como Pular</Button>
              </div>
              <div className="max-h-56 overflow-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white">
                      <TableHead>Empresa</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição (existente → novo)</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duplicidades.map((d, idx) => {
                      const key = makeKey(d.empresa_id, d.codigo);
                      const escolha = escolhasDuplicidades[key] || '';
                      return (
                        <TableRow key={idx}>
                          <TableCell>{d.empresa_id}</TableCell>
                          <TableCell>{d.codigo}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div><span className="text-slate-500">Existente:</span> {d.existente?.descricao || '-'}</div>
                              <div><span className="text-slate-500">Novo:</span> {d.novo?.descricao || '-'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select value={escolha} onValueChange={(v) => setEscolhasDuplicidades(prev => ({ ...prev, [key]: v }))}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Escolha" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="atualizar">Atualizar produto existente</SelectItem>
                                <SelectItem value="pular">Pular produto</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Relatório de erros */}
        {(checando || validationErrors.length > 0) && (
          <Card className="border-red-200 mt-4">
            <CardHeader className="bg-red-50 border-b">
              <CardTitle className="text-sm flex items-center justify-between w-full">
                <span>
                  {checando ? 'Validando produtos…' : `Erros de validação (${validationErrors.length})`}
                </span>
                {!checando && validationErrors.length > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadErrosCSV} className="gap-2">
                    <Download className="w-4 h-4" /> Baixar CSV
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            {!checando && validationErrors.length > 0 && (
              <CardContent className="p-3">
                <div className="max-h-56 overflow-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white">
                        <TableHead>Empresa</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationErrors.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell>{e.empresa_id}</TableCell>
                          <TableCell>{e.codigo}</TableCell>
                          <TableCell>{e.motivo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => closeSelf && closeSelf()} disabled={processando}>
            Cancelar
          </Button>
          <Button type="button" onClick={importar} disabled={processando || !arquivo || (!empresaId && !grupoId) || checando || validationErrors.length > 0 || (duplicidades.length > 0 && Object.keys(escolhasDuplicidades).length < duplicidades.length)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {processando ? "Importando..." : "Importar Agora"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}