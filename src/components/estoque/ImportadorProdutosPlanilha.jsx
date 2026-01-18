import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Label } from "@/components/ui/label";
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
  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos-empresariais'],
    queryFn: () => base44.entities.GrupoEmpresarial.list(),
    staleTime: 300000,
  });
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-por-grupo', grupoId],
    queryFn: () => grupoId ? base44.entities.Empresa.filter({ group_id: grupoId }) : base44.entities.Empresa.list(),
    staleTime: 120000,
  });



  React.useEffect(() => {
    if (!empresaId && empresaAtual?.id) {
      setEmpresaId(empresaAtual.id);
    } else if (!empresaId && empresas?.length > 0) {
      setEmpresaId(empresas[0].id);
    }
  }, [empresaAtual?.id, empresas?.length, empresaId]);

  const extrairLinhas = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);

    const ext = (file?.name || '').split('.').pop()?.toLowerCase();
    if (['xls','xlsx'].includes(ext)) {
      const { data } = await base44.functions.invoke('parseSpreadsheet', { file_url });
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      return rows;
    }

    // 1) Tenta extrair como array de arrays (CSV): primeira linha = cabeçalho
    let res = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: { type: "array", items: { type: "array" } },
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
      ncm: sanitize(get(row, HEADERS.ncm)),
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
      if (!empresaId) {
        setErro('Defina a empresa de destino antes de importar.');
        toast.error("Defina a empresa de destino antes de importar.");
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
      const pre = dataRows
        .map((r) => montarProduto(r))
        .filter((p) => p?.descricao)
        .slice(0, 50);
      setPreview(pre);
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
    if (!empresaId) {
      setErro('Defina a empresa de destino.');
      toast.error("Defina a empresa de destino.");
      return;
    }
    toast("Iniciando importação...");
    setProcessando(true);
    try {
      // Reextrai linhas para processar tudo (não só o preview)
      const rows = await extrairLinhas(arquivo);
      const dataRows = rows.filter((r) => !isHeaderRow(r));
      const produtos = dataRows.map((r) => montarProduto(r)).filter((p) => p?.descricao);
      if (produtos.length === 0) {
        setErro('Nada para importar. Verifique o cabeçalho da planilha e os campos obrigatórios.');
        toast.error("Nada para importar. Verifique o cabeçalho da planilha e os campos obrigatórios.");
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
            <Label>Grupo</Label>
            <Select value={grupoId} onValueChange={(v) => { setGrupoId(v); setEmpresaId(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {grupos.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nome_fantasia || g.razao_social || g.nome || g.id}
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
              <CardTitle className="text-sm">Pré-visualização (mostrando {preview.length} de {totalLinhas} itens) • Grupos: {Array.from(new Set(preview.map(p => p.grupo_produto_nome || p.grupo_produto_id).filter(Boolean))).length} • Setores: {Array.from(new Set(preview.map(p => p.setor_atividade_nome || p.setor_atividade_id).filter(Boolean))).length}</CardTitle>
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
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => closeSelf && closeSelf()} disabled={processando}>
            Cancelar
          </Button>
          <Button type="button" onClick={importar} disabled={processando || !arquivo || !empresaId} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {processando ? "Importando..." : "Importar Agora"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}