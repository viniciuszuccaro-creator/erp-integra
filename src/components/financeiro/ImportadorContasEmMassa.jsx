import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ImportadorContasEmMassa({ tipo = "receber" }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [tipoImportacao, setTipoImportacao] = useState(tipo);

  const schema = {
    receber: {
      type: "array",
      items: {
        type: "object",
        properties: {
          descricao: { type: "string" },
          cliente: { type: "string" },
          valor: { type: "number" },
          data_vencimento: { type: "string" },
          numero_documento: { type: "string" },
          observacoes: { type: "string" }
        }
      }
    },
    pagar: {
      type: "array",
      items: {
        type: "object",
        properties: {
          descricao: { type: "string" },
          fornecedor: { type: "string" },
          valor: { type: "number" },
          data_vencimento: { type: "string" },
          categoria: { type: "string" },
          numero_documento: { type: "string" },
          observacoes: { type: "string" }
        }
      }
    }
  };

  const importarMutation = useMutation({
    mutationFn: async (dados) => {
      if (tipoImportacao === "receber") {
        const promises = dados.map(item => 
          base44.entities.ContaReceber.create({
            ...item,
            status: "Pendente",
            data_emissao: new Date().toISOString().split('T')[0]
          })
        );
        return await Promise.all(promises);
      } else {
        const promises = dados.map(item => 
          base44.entities.ContaPagar.create({
            ...item,
            status: "Pendente",
            data_emissao: new Date().toISOString().split('T')[0]
          })
        );
        return await Promise.all(promises);
      }
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: tipoImportacao === 'receber' ? ['contasReceber'] : ['contasPagar'] });
      setResultado({
        sucesso: true,
        quantidade: results.length,
        mensagem: `${results.length} conta(s) importada(s) com sucesso!`
      });
      toast({ title: `✅ ${results.length} conta(s) importada(s)!` });
    },
    onError: (error) => {
      setResultado({
        sucesso: false,
        mensagem: `Erro na importação: ${error.message}`
      });
      toast({
        title: "❌ Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivo(file);
      setResultado(null);
    }
  };

  const handleImportar = async () => {
    if (!arquivo) {
      toast({
        title: "⚠️ Selecione um arquivo",
        variant: "destructive"
      });
      return;
    }

    setProcessando(true);

    try {
      // Upload do arquivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: arquivo });

      // Extrair dados com IA
      const resultado = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema[tipoImportacao]
      });

      if (resultado.status === 'error') {
        throw new Error(resultado.details || 'Erro ao processar arquivo');
      }

      // Importar dados
      await importarMutation.mutateAsync(resultado.output);
    } catch (error) {
      toast({
        title: "❌ Erro no processamento",
        description: error.message,
        variant: "destructive"
      });
      setResultado({
        sucesso: false,
        mensagem: error.message
      });
    } finally {
      setProcessando(false);
    }
  };

  const downloadTemplate = () => {
    const template = tipoImportacao === 'receber' 
      ? 'descricao,cliente,valor,data_vencimento,numero_documento,observacoes\n"Venda de Produtos","Cliente A",1500.00,2025-01-15,NF-001,"Primeira parcela"'
      : 'descricao,fornecedor,valor,data_vencimento,categoria,numero_documento,observacoes\n"Compra de Materiais","Fornecedor A",2500.00,2025-01-20,Fornecedores,OC-001,"Nota de entrada"';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_contas_${tipoImportacao}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 w-full h-full overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Importação em Massa de Contas
          </h2>
          <p className="text-sm text-slate-600">Importe múltiplas contas via arquivo CSV, Excel ou PDF com IA</p>
        </div>
      </div>

      {/* Seletor de Tipo */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Tipo de Importação</Label>
              <Select value={tipoImportacao} onValueChange={setTipoImportacao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receber">Contas a Receber</SelectItem>
                  <SelectItem value="pagar">Contas a Pagar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert className="border-blue-300 bg-blue-50">
              <AlertDescription className="text-xs">
                <p className="font-semibold mb-1">📋 Formatos Suportados:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>CSV (.csv) - formato tabular</li>
                  <li>Excel (.xlsx) - planilha</li>
                  <li>PDF (.pdf) - extraído com IA</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div>
              <Label>Arquivo para Importação</Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {arquivo && (
                <p className="text-xs text-slate-600 mt-2">
                  Arquivo selecionado: <strong>{arquivo.name}</strong>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Template CSV
              </Button>
              <Button
                onClick={handleImportar}
                disabled={!arquivo || processando}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {processando ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Contas
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado da Importação */}
      {resultado && (
        <Alert className={resultado.sucesso ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
          <AlertDescription className="flex items-center gap-2">
            {resultado.sucesso ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="font-semibold">{resultado.sucesso ? 'Importação Concluída!' : 'Erro na Importação'}</p>
              <p className="text-xs mt-1">{resultado.mensagem}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Instruções de Uso */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-sm">📖 Como Importar</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
            <li>Baixe o template CSV ou prepare seu arquivo Excel/PDF</li>
            <li>Preencha com os dados das contas (descrição, {tipoImportacao === 'receber' ? 'cliente' : 'fornecedor'}, valor, vencimento, etc)</li>
            <li>Faça upload do arquivo - a IA irá extrair e validar os dados automaticamente</li>
            <li>Revise e confirme a importação</li>
            <li>As contas serão criadas com status "Pendente" e podem ser editadas posteriormente</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}