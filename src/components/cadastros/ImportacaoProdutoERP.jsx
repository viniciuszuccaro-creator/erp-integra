import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle2, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";

/**
 * ImportacaoProdutoERP
 *
 * Importa produtos usando o backend functions/importProdutos, com mapeamento ERP (colunas por letra).
 * Multiempresa: exige empresa_id. Dry-run opcional para validar antes de gravar.
 */
const defaultMapping = {
  codigo: "A",
  descricao: "B",
  tipo_item: "AI",
  setor_atividade_id: "R",
  setor_atividade_nome: "S",
  grupo_produto_id: "M",
  grupo_produto_nome: "N",
  peso_teorico_kg_m: "I",
  peso_liquido_kg: "P",
  peso_bruto_kg: "Q",
  unidade_medida: "D",
  custo_aquisicao: "AD",
  estoque_minimo: "F",
  ncm: "G",
};

export default function ImportacaoProdutoERP({ onConcluido, closeSelf }) {
  const [empresas, setEmpresas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [escopo, setEscopo] = useState("empresa"); // 'empresa' | 'grupo'
  const [empresaId, setEmpresaId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [relatorio, setRelatorio] = useState(null);
  const [dryRun, setDryRun] = useState(true);
  const [mapping, setMapping] = useState(defaultMapping);
  const [amostrasHeaders, setAmostrasHeaders] = useState([]);


  useEffect(() => {
    (async () => {
      try {
        const [listaEmpresas, listaGrupos] = await Promise.all([
          base44.entities.Empresa.list(),
          base44.entities.GrupoEmpresarial.list(),
        ]);
        setEmpresas(listaEmpresas || []);
        setGrupos(listaGrupos || []);
        if (listaEmpresas?.length) setEmpresaId(listaEmpresas[0].id);
        if (listaGrupos?.length) setGrupoId(listaGrupos[0].id);
      } catch (e) {
        // silencioso
      }
    })();
  }, []);

  const extrairCabecalhos = async (file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { type: "object", additionalProperties: true }
      });
      const rows = Array.isArray(res.output)
        ? res.output
        : (Array.isArray(res.output?.rows)
          ? res.output.rows
          : (Array.isArray(res.output?.data) ? res.output.data : []));
      if (rows && rows.length > 0) {
        const keys = Object.keys(rows[0] || {});
        setAmostrasHeaders(keys.filter((k) => !!k));
      }
    } catch (e) {
      // silencioso
    }
  };

  const enviar = async () => {
    if (!arquivo) {
      toast.error("Selecione um arquivo (.xlsx/.xls/.csv)");
      return;
    }
    if (escopo === "empresa" && !empresaId) {
      toast.error("Selecione a empresa de destino");
      return;
    }
    if (escopo === "grupo" && !grupoId) {
      toast.error("Selecione o grupo de destino");
      return;
    }

    setProcessando(true);
    setRelatorio(null);

    try {
      // 1) Upload do arquivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: arquivo });

      // 2) Extrai as linhas no frontend para máxima compatibilidade com planilhas antigas
      const extractRes = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { title: 'TabelaProdutos', type: 'object', additionalProperties: true }
      });
      const out = extractRes?.output || {};
      const rows = Array.isArray(out)
        ? out
        : (Array.isArray(out.rows)
          ? out.rows
          : (Array.isArray(out.data) ? out.data : Object.values(out).filter(v => typeof v === 'object')));

      if (!Array.isArray(rows) || rows.length === 0) {
        toast.error("Não encontramos linhas na planilha. Verifique o arquivo ou ajuste o mapeamento.");
        setProcessando(false);
        return;
      }

      // 3) Invoca função backend passando as linhas e o mapeamento escolhido
      // 3) Normaliza mapeamento (aceita '29AD' -> 'AD')
      const normalizeCol = (v) => typeof v === 'string' ? v.trim().toUpperCase().replace(/^[0-9]+/, '').replace(/[^A-Z]/g, '') : v;
      const cleanedMapping = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [k, normalizeCol(v)]));

      // 4) Invoca função backend passando as linhas e o mapeamento escolhido
      const payload = {
        file_url,
        rows,
        mapping: cleanedMapping,
        header_row_index: 1,
        start_row_index: 2,
        dryRun,
        empresa_id: empresaId
      };
      if (escopo === "grupo") {
        payload.group_id = grupoId;
      }
      const { data } = await base44.functions.invoke("importProdutos", payload);

      setRelatorio(data);

      if (data?.errors > 0) {
        toast.error(`Importação finalizada com ${data.errors} erro(s)`);
      } else if (dryRun) {
        toast.success(`Simulação concluída: criaria ${data.created} e atualizaria ${data.updated}`);
      } else {
        toast.success(`Importação concluída: ${data.created} criados, ${data.updated} atualizados`);
        onConcluido && onConcluido();
        if (closeSelf) closeSelf();
      }
    } catch (error) {
      toast.error(error?.message || "Erro ao importar");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="border-indigo-200 bg-indigo-50">
        <Package className="w-4 h-4 text-indigo-600" />
        <AlertDescription className="text-sm text-indigo-900">
          Importação ERP (mapeada por colunas). Use para planilhas do legado já padronizadas.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Parâmetros</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-semibold">Escopo</label>
              <Select value={escopo} onValueChange={setEscopo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o escopo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empresa">Empresa</SelectItem>
                  <SelectItem value="grupo">Grupo</SelectItem>
                </SelectContent>
              </Select>

              {escopo === "empresa" ? (
                <div className="mt-3">
                  <label className="text-sm font-semibold">Empresa de destino</label>
                  <Select value={empresaId} onValueChange={setEmpresaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome_fantasia || e.razao_social || e.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="mt-3">
                  <label className="text-sm font-semibold">Grupo de destino</label>
                  <Select value={grupoId} onValueChange={setGrupoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {grupos.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.nome_do_grupo || g.razao_social_holding || g.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">Modo</label>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="button"
                  variant={dryRun ? "default" : "outline"}
                  onClick={() => setDryRun(true)}
                  className={dryRun ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                >
                  Simulação
                </Button>
                <Button
                  type="button"
                  variant={!dryRun ? "default" : "outline"}
                  onClick={() => setDryRun(false)}
                  className={!dryRun ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Gravar
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Arquivo</label>
              <Input type="file" accept=".xlsx,.xls,.csv" onChange={async (e) => { const f = e.target.files?.[0] || null; setArquivo(f); if (f) { await extrairCabecalhos(f); } }} />
              {arquivo && (
                <p className="text-xs text-slate-500 mt-1">{arquivo.name}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-4 space-y-2">
            <p className="text-sm font-semibold">Mapeamento de Colunas</p>
            <p className="text-xs text-slate-500">Use letra da coluna (ex: AD) ou selecione um cabeçalho detectado da planilha.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                ["codigo","Código"],
                ["descricao","Descrição"],
                ["ncm","NCM"],
                ["unidade_medida","Unidade"],
                ["custo_aquisicao","Custo"],
                ["estoque_minimo","Estoque mínimo"],
                ["tipo_item","Tipo do item"],
                ["setor_atividade_id","Setor ID"],
                ["setor_atividade_nome","Setor Nome"],
                ["grupo_produto_id","Grupo ID"],
                ["grupo_produto_nome","Grupo Nome"],
                ["peso_teorico_kg_m","Peso kg/m"],
              ].map(([key,label]) => (
                <div key={key}>
                  <label className="text-xs font-medium">{label}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={mapping[key] || ""}
                      onChange={(e) => setMapping(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder="Ex: AD ou 'Código'"
                    />
                    {amostrasHeaders.length > 0 && (
                      <Select onValueChange={(v) => setMapping(prev => ({ ...prev, [key]: v }))}>
                        <SelectTrigger className="min-w-[120px]">
                          <SelectValue placeholder="Cabeçalho" />
                        </SelectTrigger>
                        <SelectContent>
                          {amostrasHeaders.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={enviar} disabled={processando || !arquivo || (escopo === 'empresa' ? !empresaId : !grupoId)} className="gap-2">
              {processando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {dryRun ? "Processar (Simulação)" : "Importar Agora"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {relatorio && (
        <Card className="border-2 border-slate-200">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Resultado</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-green-600">Criados: {relatorio.created}</Badge>
              <Badge className="bg-blue-600">Atualizados: {relatorio.updated}</Badge>
              <Badge className="bg-yellow-600">Ignorados: {relatorio.skipped}</Badge>
              <Badge className="bg-red-600">Erros: {relatorio.errors}</Badge>
            </div>

            <div className="max-h-72 overflow-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-white sticky top-0">
                  <tr>
                    <th className="text-left p-2">Linha</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {(relatorio.details || []).map((d, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{d.index + 1}</td>
                      <td className="p-2">
                        {d.status === "error" ? (
                          <Badge className="bg-red-600">Erro</Badge>
                        ) : d.status?.startsWith("would_") ? (
                          <Badge className="bg-slate-600">Simulação</Badge>
                        ) : d.status === "created" ? (
                          <Badge className="bg-green-600">Criado</Badge>
                        ) : d.status === "updated" ? (
                          <Badge className="bg-blue-600">Atualizado</Badge>
                        ) : (
                          <Badge className="bg-yellow-600">{d.status}</Badge>
                        )}
                      </td>
                      <td className="p-2">{d.codigo || '-'}</td>
                      <td className="p-2 text-slate-600 text-xs">{d.reason || d.error || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}