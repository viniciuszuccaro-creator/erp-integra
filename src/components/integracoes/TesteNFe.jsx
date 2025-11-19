import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle, AlertCircle, Send, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * Teste de Emissão de NF-e
 * V21.1.2 - WINDOW MODE READY
 */
export default function TesteNFe({ configuracao, windowMode = false }) {
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [pedidoTeste, setPedidoTeste] = useState("");

  const { toast } = useToast();

  const executarTeste = async () => {
    setTestando(true);
    setResultado(null);

    try {
      // Simular emissão de NF-e
      await new Promise(resolve => setTimeout(resolve, 2000));

      const nfeSimulada = {
        status: 'success',
        numero: Math.floor(Math.random() * 1000000),
        serie: configuracao?.parametros_fiscais?.serie_nfe || '1',
        chave_acesso: Array(44).fill(0).map(() => Math.floor(Math.random() * 10)).join(''),
        protocolo: `${Date.now()}`,
        data_autorizacao: new Date().toISOString(),
        ambiente: configuracao?.parametros_fiscais?.ambiente_nfe || 'Homologação',
        xml_url: 'https://exemplo.com/nfe.xml',
        pdf_url: 'https://exemplo.com/nfe.pdf',
        mensagem_sefaz: '100 - Autorizado o uso da NF-e',
        codigo_status: '100'
      };

      setResultado(nfeSimulada);

      toast({
        title: "✅ NF-e Autorizada!",
        description: `Nota fiscal ${nfeSimulada.numero} emitida com sucesso`
      });
    } catch (error) {
      setResultado({
        status: 'error',
        mensagem: error.message
      });
      
      toast({
        title: "❌ Erro na Emissão",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTestando(false);
    }
  };

  return (
    <div className={`space-y-4 ${windowMode ? 'w-full h-full overflow-auto p-6 bg-white' : ''}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Testar Emissão de NF-e
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-300 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription>
              <strong>🧪 Modo de Simulação</strong><br />
              Esta integração está em modo de teste. A NF-e não será transmitida para a SEFAZ.
              Configure o certificado digital e o provedor (eNotas, NFe.io, etc.) para ativar.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="pedido_teste">Número do Pedido (opcional)</Label>
            <Input
              id="pedido_teste"
              value={pedidoTeste}
              onChange={(e) => setPedidoTeste(e.target.value)}
              placeholder="PED-2025-001"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Ambiente:</strong> {configuracao?.parametros_fiscais?.ambiente_nfe || 'Homologação'}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Série:</strong> {configuracao?.parametros_fiscais?.serie_nfe || '1'}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Próximo Número:</strong> {configuracao?.parametros_fiscais?.proximo_numero_nfe || 1}
            </p>
          </div>

          <Button
            onClick={executarTeste}
            disabled={testando}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {testando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Emitindo NF-e...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Emitir NF-e de Teste
              </>
            )}
          </Button>

          {resultado && resultado.status === 'success' && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-900 font-semibold mb-3">
                    <CheckCircle className="w-5 h-5" />
                    NF-e Autorizada com Sucesso!
                  </div>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Número:</strong> {resultado.numero}</p>
                    <p><strong>Série:</strong> {resultado.serie}</p>
                    <p><strong>Chave de Acesso:</strong> {resultado.chave_acesso}</p>
                    <p><strong>Protocolo:</strong> {resultado.protocolo}</p>
                    <p><strong>Ambiente:</strong> {resultado.ambiente}</p>
                    <p><strong>Autorizado em:</strong> {new Date(resultado.data_autorizacao).toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-green-700 mt-2">{resultado.mensagem_sefaz}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver XML
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4 mr-1" />
                      Ver DANFE
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {resultado && resultado.status === 'error' && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="w-5 h-5" />
                  <p>{resultado.mensagem}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}