import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportarProdutoNFe() {
  const [processando, setProcessando] = useState(false);
  const [itensParsed, setItensParsed] = useState([]);

  const handleUploadXML = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessando(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise este XML de NF-e e extraia TODOS os produtos.

Para cada produto retorne:
- codigo (cProd)
- descricao (xProd)
- ncm (NCM)
- unidade (uCom)
- quantidade (qCom)
- valor_unitario (vUnCom)

Retorne array de objetos.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            produtos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  codigo: { type: "string" },
                  descricao: { type: "string" },
                  ncm: { type: "string" },
                  unidade: { type: "string" },
                  quantidade: { type: "number" },
                  valor_unitario: { type: "number" }
                }
              }
            }
          }
        }
      });

      setItensParsed(resultado.produtos || []);
      toast.success(`✅ ${resultado.produtos.length} produtos encontrados!`);
    } catch (error) {
      toast.error('Erro ao processar XML: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleCriarProdutos = async () => {
    setProcessando(true);

    try {
      let criados = 0;
      for (const item of itensParsed) {
        await base44.entities.Produto.create({
          codigo: item.codigo,
          descricao: item.descricao,
          ncm: item.ncm,
          unidade_medida: item.unidade,
          custo_aquisicao: item.valor_unitario,
          preco_venda: item.valor_unitario * 1.3,
          status: 'Ativo',
          grupo: 'Outros'
        });
        criados++;
      }

      toast.success(`✅ ${criados} produtos criados!`);
      setItensParsed([]);
    } catch (error) {
      toast.error('Erro ao criar produtos');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <FileText className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          📄 <strong>Importação IA:</strong> Faça upload de XML de NF-e e a IA criará produtos automaticamente
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <input
            type="file"
            accept=".xml"
            onChange={handleUploadXML}
            className="hidden"
            id="xml-upload"
          />
          <label htmlFor="xml-upload">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-32 border-dashed border-2"
              disabled={processando}
              asChild
            >
              <div className="flex flex-col items-center gap-3">
                {processando ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400" />
                )}
                <div className="text-center">
                  <p className="font-medium">
                    {processando ? 'Processando XML...' : 'Clique para fazer upload do XML'}
                  </p>
                  <p className="text-xs text-slate-500">NF-e formato XML</p>
                </div>
              </div>
            </Button>
          </label>
        </CardContent>
      </Card>

      {itensParsed.length > 0 && (
        <Card>
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-base">
              ✅ {itensParsed.length} Produto(s) Identificado(s)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {itensParsed.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.descricao}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">NCM: {item.ncm}</Badge>
                    <Badge variant="outline" className="text-xs">{item.unidade}</Badge>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            ))}

            <Button 
              onClick={handleCriarProdutos} 
              disabled={processando}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
            >
              {processando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Todos os Produtos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}