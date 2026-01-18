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

const get = (row, keys) => {
  for (const k of keys) {
    if (!k) continue;
    if (row[k] != null && row[k] !== "") return row[k];
    const upper = String(k).toUpperCase();
    if (row[upper] != null && row[upper] !== "") return row[upper];
    const lower = String(k).toLowerCase();
    const foundInsensitive = Object.keys(row).find((rk) => rk.toLowerCase() === lower);
    if (foundInsensitive && row[foundInsensitive] != null && row[foundInsensitive] !== "") return row[foundInsensitive];
  }
  return undefined;
};

// Normalização e detecção da linha de cabeçalho
const norm = (s) => String(s || "").normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const isHeaderRow = (row) => {
  const code = norm(get(row, ["Cód. Material", "Cod. Material", "A"]));
  const desc = norm(get(row, ["Descrição", "B"]));
  const un = norm(get(row, ["Un.", "C"]));
  if (["cod. material", "codigo material", "cod material"].includes(code)) return true;
  if (["descricao", "descrição", "produto", "nome"].includes(desc)) return true;
  if (["un.", "un", "unidade"].includes(un)) return true;
  return false;
};

// Mapeamento fixo conforme especificação do usuário (linha 1 = cabeçalhos, dados a partir da linha 2)
const HEADERS = {
  codigo: ["Cód. Material", "Cod. Material", "A"],
  descricao: ["Descrição", "B"],
  unidade_medida: ["Un.", "C"],
  estoque_minimo: ["Estoque Minimo", "D"],
  ncm: ["Classif. Fiscal", "E"],
  peso_teorico_kg_m: ["Peso Teórico", "F"],
  grupo_produto_id: ["Codigo da Classe", "G"],
  grupo_produto_nome: ["Descrição da Classe", "H"],
  peso_liquido_kg: ["Peso Liquido", "I"],
  peso_bruto_kg: ["Peso Bruto", "J"],
  setor_atividade_id: ["Codigo do Grupo", "K"],
  setor_atividade_nome: ["Descrição do Grupo", "L"],
  custo_aquisicao: ["Custo Principal", "M"],
  tipo_item: ["Descrição Tipo", "N"],
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
              if (!grupoId) return base44.entities.Empresa.list();
              const [byGroup, byGrupo] = await Promise.all([
                base44.entities.Empresa.filter({ group_id: grupoId }),
                base44.entities.Empresa.filter({ grupo_id: grupoId }),
              ]);
              return (byGroup && byGroup.length) ? byGroup : (byGrupo || []);
            },
            staleTime: 120000,
          });



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
      if (b[0] === 0xFF && b[1] === 0xFE) return 'UTF-16';
      if (b[0] === 0xFE && b[1] === 0xFF) return 'UTF-16';
      if (b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF) return 'UTF-8';
    } catch (_) {}
    return 'UTF-8';
  };

  const extrairLinhas = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);

    const ext = (file?.name || '').split('.').pop()?.toLowerCase();
    const encoding = await detectEncoding(file);
    if (['xls','xlsx'].includes(ext)) {
      const { data } = await base44.functions.invoke('parseSpreadsheet', { file_url });
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      return rows;
    }

    // 1) Tenta extrair como array de arrays (CSV): primeira linha = cabeçalho
    let res = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: { type: "array", items: { type: "array" } },
      encoding,
      ignore_errors: true,
    });

    if (Array.isArray(res?.output) && res.output.length > 1 && Array.isArray(res.output[0])) {
      const headerRow = res.output[0].map((h) => String(h || "").trim());
      const dataRows = res.output.slice(1);
      const objetos = dataRows.map((linha) => {
        const obj = {};
        headerRow.forEach((header, i) => {
          if (header) obj[header] = linha[i];
        });
        return obj;
      });
      return objetos.filter((o) => Object.keys(o).length > 0);
    }

    // 2) Fallback: extrai como objeto genérico e procura arrays de objetos em 'rows'/'data' ou propriedades
    res = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: { type: "object", additionalProperties: true },
      encoding,
      ignore_errors: true,
    });

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
        const headersPrimeiros = Array.isArray(rows) && rows[0] ? Object.keys(rows[0]) : [];
        const dicas = [];
        if (!hasDesc) dicas.push(`- Cabeçalho de Descrição ausente (ex.: ${expectedDesc}).`);
        if (!hasUn) dicas.push(`- Cabeçalho de Unidade ausente (ex.: ${expectedUn}).`);
        if (!empresaId && !(importarParaTodasEmpresas && grupoId)) dicas.push('- Selecione a empresa de destino.');
        const msg = `Nada para importar. Verifique o cabeçalho da planilha e os campos obrigatórios.\nObrigatórios: Descrição, Unidade (Un.) e Empresa de destino.\n${dicas.join('\n')}\nDetectamos estes cabeçalhos: ${headersPrimeiros.join(', ')}`;
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
                {grupos.map((g) => (
                                        <SelectItem key={g.id} value={g.id}>
                                          {g.nome_fantasia || g.razao_social || g.nome_do_grupo || g.nome || g.id}
                                        </SelectItem>
                                      ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Empresa de destino</Label>
            <Select value={empresaId} onValueChange={setEmpresaId}>
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