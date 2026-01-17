import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

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

export default function ImportadorProdutosPlanilha({ onConcluido, closeSelf }) {
  const { empresaAtual } = useContextoVisual();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [preview, setPreview] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [totalLinhas, setTotalLinhas] = useState(0);

  const extrairLinhas = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);

    // 1) Tenta extrair como array de arrays (XLS/CSV): primeira linha = cabeçalho
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
      empresa_id: empresaAtual?.id,
      codigo: sanitize(get(row, HEADERS.codigo)),
      descricao: sanitize(get(row, HEADERS.descricao)),
      unidade_medida: sanitize(get(row, HEADERS.unidade_medida)) || "UN",
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
      tipo_item: sanitize(get(row, HEADERS.tipo_item)) || "Revenda",
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
      if (!empresaAtual?.id) {
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
      toast.success(`Arquivo lido: ${dataRows.length} item(ns) de produto`);
    } finally {
      setProcessando(false);
    }
  };

  const importar = async () => {
    if (!fileUrl) {
      toast.error("Selecione um arquivo válido.");
      return;
    }
    if (!empresaAtual?.id) {
      toast.error("Defina a empresa de destino.");
      return;
    }
    setProcessando(true);
    try {
      // Reextrai linhas para processar tudo (não só o preview)
      const rows = await extrairLinhas(arquivo);
      const dataRows = rows.filter((r) => !isHeaderRow(r));
      const produtos = dataRows.map((r) => montarProduto(r)).filter((p) => p?.descricao);
      if (produtos.length === 0) {
        toast.error("Nada para importar.");
        return;
      }

      // Importação em lotes
      const chunkSize = 200;
      let createdTotal = 0;
      for (let i = 0; i < produtos.length; i += chunkSize) {
        const chunk = produtos.slice(i, i + chunkSize);
        const res = await base44.entities.Produto.bulkCreate(chunk);
        createdTotal += Array.isArray(res) ? res.length : chunk.length;
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
          <Button variant="outline" onClick={() => closeSelf && closeSelf()} disabled={processando}>
            Cancelar
          </Button>
          <Button onClick={importar} disabled={processando || !arquivo} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {processando ? "Importando..." : "Importar Agora"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}