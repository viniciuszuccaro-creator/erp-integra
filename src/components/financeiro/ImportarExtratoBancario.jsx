import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportarExtratoBancario({ empresaId, onImportComplete }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [arquivo, setArquivo] = useState(null);
  const [tipoArquivo, setTipoArquivo] = useState("OFX");
  const [contaBancariaId, setContaBancariaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const { data: contasBancarias = [] } = useQuery({
    queryKey: ['contas-bancarias', empresaId],
    queryFn: () => base44.entities.ContaBancariaEmpresa.filter({ empresa_id: empresaId }),
  });

  const importarMutation = useMutation({
    mutationFn: async (data) => {
      // 1. Upload do arquivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: data.arquivo });

      // 2. Processar arquivo com IA
      const schema = {
        "type": "object",
        "properties": {
          "transacoes": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "data": { "type": "string" },
                "descricao": { "type": "string" },
                "valor": { "type": "number" },
                "tipo": { "type": "string", "enum": ["Entrada", "Saída"] },
                "saldo": { "type": "number" },
                "documento": { "type": "string" }
              }
            }
          }
        }
      };

      const resultado = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });

      if (resultado.status === "error") {
        throw new Error(resultado.details || "Erro ao processar arquivo");
      }

      // 3. Criar registros de ExtratoBancario
      const transacoes = resultado.output.transacoes || [];
      const criados = await Promise.all(transacoes.map(async (t) => {
        return await base44.entities.ExtratoBancario.create({
          group_id: data.group_id,
          empresa_id: data.empresa_id,
          conta_bancaria_id: data.contaBancariaId,
          data_transacao: t.data,
          tipo_movimento: t.tipo,
          descricao: t.descricao,
          valor: t.valor,
          saldo_pos_transacao: t.saldo,
          numero_documento: t.documento,
          status_conciliacao: "Pendente",
          origem_importacao: data.tipoArquivo,
          arquivo_origem_url: file_url
        });
      }));

      return criados;
    },
    onSuccess: (criados) => {
      queryClient.invalidateQueries({ queryKey: ['extratos-bancarios'] });
      toast({ title: `✅ ${criados.length} transações importadas!` });
      setArquivo(null);
      if (onImportComplete) onImportComplete();
    },
    onError: (error) => {
      toast({
        title: "❌ Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!arquivo) {
      toast({ title: "⚠️ Selecione um arquivo", variant: "destructive" });
      return;
    }

    if (!contaBancariaId) {
      toast({ title: "⚠️ Selecione uma conta bancária", variant: "destructive" });
      return;
    }

    const conta = contasBancarias.find(c => c.id === contaBancariaId);

    importarMutation.mutate({
      arquivo,
      tipoArquivo,
      contaBancariaId,
      empresa_id: empresaId,
      group_id: conta?.group_id
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Importar Extrato Bancário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="border-blue-300 bg-blue-50">
            <AlertDescription className="text-xs text-blue-900">
              📄 Importe extratos bancários em formato <strong>OFX</strong>, <strong>CSV</strong> ou <strong>Excel</strong>. A IA processará automaticamente as transações.
            </AlertDescription>
          </Alert>

          <div>
            <Label>Conta Bancária *</Label>
            <Select value={contaBancariaId} onValueChange={setContaBancariaId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta..." />
              </SelectTrigger>
              <SelectContent>
                {contasBancarias.map(conta => (
                  <SelectItem key={conta.id} value={conta.id}>
                    {conta.banco} - Ag: {conta.agencia} / Conta: {conta.numero_conta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Arquivo</Label>
              <Select value={tipoArquivo} onValueChange={setTipoArquivo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFX">OFX</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período (Opcional)</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  placeholder="Início"
                />
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  placeholder="Fim"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Arquivo do Extrato *</Label>
            <Input
              type="file"
              accept=".ofx,.csv,.xlsx,.xls,.pdf"
              onChange={(e) => setArquivo(e.target.files[0])}
              required
            />
            {arquivo && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {arquivo.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={importarMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {importarMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Extrato
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}