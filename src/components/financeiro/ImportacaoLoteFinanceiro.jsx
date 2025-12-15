import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, 
  Download, Zap, TrendingUp 
} from "lucide-react";

export default function ImportacaoLoteFinanceiro({ tipo = 'receber', onClose, windowMode = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const processarArquivoMutation = useMutation({
    mutationFn: async (file) => {
      // Upload do arquivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extrair dados com IA
      const schema = tipo === 'receber' ? {
        type: "object",
        properties: {
          cliente: { type: "string" },
          descricao: { type: "string" },
          valor: { type: "number" },
          data_vencimento: { type: "string" },
          numero_documento: { type: "string" },
          observacoes: { type: "string" }
        },
        required: ["cliente", "descricao", "valor", "data_vencimento"]
      } : {
        type: "object",
        properties: {
          fornecedor: { type: "string" },
          descricao: { type: "string" },
          valor: { type: "number" },
          data_vencimento: { type: "string" },
          categoria: { type: "string" },
          numero_documento: { type: "string" },
          observacoes: { type: "string" }
        },
        required: ["fornecedor", "descricao", "valor", "data_vencimento"]
      };

      const resultado = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: schema
      });

      if (resultado.status === 'error') {
        throw new Error(resultado.details || 'Erro ao processar arquivo');
      }

      return resultado.output;
    },
    onSuccess: (dados) => {
      setResultado(dados);
      toast({ 
        title: "✅ Arquivo processado!",
        description: `${dados.length} registro(s) extraído(s)`
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao processar arquivo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const importarDadosMutation = useMutation({
    mutationFn: async (dados) => {
      const entidade = tipo === 'receber' ? 'ContaReceber' : 'ContaPagar';
      
      const registros = dados.map(item => ({
        ...item,
        status: "Pendente",
        data_emissao: new Date().toISOString().split('T')[0],
        origem_tipo: "importacao_lote"
      }));

      return await base44.entities[entidade].bulkCreate(registros);
    },
    onSuccess: (registros) => {
      queryClient.invalidateQueries({ queryKey: tipo === 'receber' ? ['contasReceber'] : ['contasPagar'] });
      toast({ 
        title: `✅ ${registros.length} conta(s) importada(s)!`,
        description: "Importação concluída com sucesso"
      });
      if (onClose) onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro na importação",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivo(file);
      processarArquivoMutation.mutate(file);
    }
  };

  const downloadModelo = () => {
    const modelo = tipo === 'receber' 
      ? `Cliente,Descrição,Valor,Data Vencimento,Nº Documento,Observações
Cliente Exemplo,Venda de Produtos,1500.00,2025-01-15,DOC-001,Primeira parcela
Cliente Exemplo 2,Serviços Prestados,2500.00,2025-01-20,DOC-002,Pagamento único`
      : `Fornecedor,Descrição,Valor,Data Vencimento,Categoria,Nº Documento,Observações
Fornecedor A,Compra de Material,3500.00,2025-01-10,Fornecedores,NF-123,Matéria prima
Fornecedor B,Serviço de Manutenção,800.00,2025-01-15,Manutenção,OS-456,Manutenção preventiva`;

    const blob = new Blob([modelo], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo_importacao_${tipo}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast({ title: "📥 Modelo baixado!" });
  };

  return (
    <div className={windowMode ? "w-full h-full p-6 overflow-auto" : ""}>
      <Card className="border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Importação em Lote - {tipo === 'receber' ? 'Contas a Receber' : 'Contas a Pagar'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Alert className="border-blue-300 bg-blue-50">
            <AlertDescription className="text-sm text-blue-900">
              <p className="font-semibold mb-1">📄 Formatos Aceitos</p>
              <p className="text-xs">CSV, Excel (.xlsx), ou PDF com tabela. A IA irá extrair automaticamente os dados do arquivo.</p>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={downloadModelo}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo CSV
            </Button>
          </div>

          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50/50">
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-financeiro"
            />
            <label htmlFor="file-upload-financeiro">
              <Button
                onClick={() => document.getElementById('file-upload-financeiro').click()}
                disabled={processarArquivoMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processarArquivoMutation.isPending ? (
                  <>Processando com IA...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivo
                  </>
                )}
              </Button>
            </label>
            {arquivo && (
              <p className="text-sm text-slate-600 mt-2">
                📎 {arquivo.name}
              </p>
            )}
          </div>

          {resultado && resultado.length > 0 && (
            <>
              <Alert className="border-green-300 bg-green-50">
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-900">✨ {resultado.length} registro(s) extraído(s)</p>
                      <p className="text-xs text-green-700">
                        Valor Total: R$ {resultado.reduce((sum, r) => sum + (r.valor || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Button
                      onClick={() => importarDadosMutation.mutate(resultado)}
                      disabled={importarDadosMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Importar Tudo
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {resultado.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border hover:border-blue-400">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">
                        {tipo === 'receber' ? item.cliente : item.fornecedor}
                      </span>
                      <Badge className="bg-blue-100 text-blue-700">
                        R$ {item.valor?.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Descrição:</span>
                        <p className="font-medium">{item.descricao}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Vencimento:</span>
                        <p className="font-medium">{item.data_vencimento}</p>
                      </div>
                    </div>
                    {item.numero_documento && (
                      <p className="text-xs text-slate-500 mt-1">
                        Nº Doc: {item.numero_documento}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}