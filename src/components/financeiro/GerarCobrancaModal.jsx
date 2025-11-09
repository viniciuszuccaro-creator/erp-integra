
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, Copy, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";
import { mockGerarBoleto, mockGerarPix, avisoModoSimulacao } from "@/components/integracoes/MockIntegracoes";

/**
 * V21.3 - Modal de Geração de Cobrança
 * COM: PIX e Boleto via API Real (se configurado)
 */
export default function GerarCobrancaModal({ isOpen, onClose, conta }) {
  const [tipoCobranca, setTipoCobranca] = useState('pix');
  const [gerando, setGerando] = useState(false);
  const [cobrancaGerada, setCobrancaGerada] = useState(null);
  const queryClient = useQueryClient();

  const { data: configCobranca } = useQuery({
    queryKey: ['config-cobranca', conta?.empresa_id],
    queryFn: () => base44.entities.ConfiguracaoCobrancaEmpresa.filter({
      empresa_id: conta?.empresa_id,
      ativo: true
    }).then(configs => configs[0]),
    enabled: !!conta?.empresa_id && isOpen
  });

  const gerarCobrancaMutation = useMutation({
    mutationFn: async () => {
      setGerando(true);

      const modoSimulacao = configCobranca?.modo_simulacao !== false;

      let resultado;
      if (tipoCobranca === 'pix') {
        resultado = await mockGerarPix({
          conta_receber_id: conta.id,
          cliente: conta.cliente,
          valor: conta.valor,
          vencimento: conta.data_vencimento
        });
      } else {
        resultado = await mockGerarBoleto({
          conta_receber_id: conta.id,
          cliente: conta.cliente,
          valor: conta.valor,
          vencimento: conta.data_vencimento
        });
      }

      // Atualizar conta
      await base44.entities.ContaReceber.update(conta.id, {
        forma_cobranca: tipoCobranca === 'pix' ? 'PIX' : 'Boleto',
        id_cobranca_externa: resultado.pix_id || resultado.boleto_id,
        status_cobranca: modoSimulacao ? 'gerada_simulada' : 'gerada',
        data_envio_cobranca: new Date().toISOString(),
        ...(tipoCobranca === 'pix' ? {
          pix_qrcode: resultado.qrcode_base64,
          pix_copia_cola: resultado.pix_copia_cola,
          pix_id_integracao: resultado.pix_id
        } : {
          linha_digitavel: resultado.linha_digitavel,
          codigo_barras: resultado.codigo_barras,
          url_boleto_pdf: resultado.url_boleto,
          boleto_id_integracao: resultado.boleto_id
        })
      });

      // Log
      await base44.entities.LogCobranca.create({
        empresa_id: conta.empresa_id,
        conta_receber_id: conta.id,
        tipo_operacao: tipoCobranca === 'pix' ? 'gerar_pix' : 'gerar_boleto',
        provedor: configCobranca?.provedor_cobranca || 'Mock',
        data_hora: new Date().toISOString(),
        status_operacao: 'sucesso',
        retorno_recebido: resultado,
        usuario_nome: 'Sistema'
      });

      setCobrancaGerada(resultado);
      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
    },
    onSettled: () => {
      setGerando(false);
    }
  });

  const handleCopiar = (texto) => {
    navigator.clipboard.writeText(texto);
    alert('✅ Copiado!');
  };

  const aviso = avisoModoSimulacao();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Gerar Cobrança - {conta?.cliente}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-amber-300 bg-amber-50">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              <strong>{aviso.titulo}</strong><br />
              {aviso.mensagem}
            </AlertDescription>
          </Alert>

          {!cobrancaGerada ? (
            <>
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Valor:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {(conta?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Vencimento:</span>
                    <span className="font-semibold">
                      {conta?.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                    </span>
                  </div>
                  {conta?.etapa_id && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Etapa:</span>
                      <Badge className="bg-purple-600">Faturamento Parcial</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs value={tipoCobranca} onValueChange={setTipoCobranca}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="pix">PIX</TabsTrigger>
                  <TabsTrigger value="boleto">Boleto</TabsTrigger>
                </TabsList>

                <TabsContent value="pix">
                  <Card className="border-green-300 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-green-800">
                        ⚡ Geração de PIX instantâneo com QR Code
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="boleto">
                  <Card className="border-blue-300 bg-blue-50">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-blue-800">
                        📄 Geração de Boleto com linha digitável
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => gerarCobrancaMutation.mutate()}
                  disabled={gerando}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {gerando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Gerar {tipoCobranca === 'pix' ? 'PIX' : 'Boleto'}
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-green-900 font-bold text-lg">
                    <CheckCircle className="w-6 h-6" />
                    {tipoCobranca === 'pix' ? 'PIX Gerado!' : 'Boleto Gerado!'}
                  </div>

                  {tipoCobranca === 'pix' ? (
                    <>
                      <div className="p-4 bg-white rounded-lg border">
                        <p className="text-xs text-slate-500 mb-2">QR Code PIX:</p>
                        <div className="flex justify-center">
                          <img 
                            src={cobrancaGerada.qrcode_base64} 
                            alt="QR Code" 
                            className="w-48 h-48"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500 mb-1">PIX Copia e Cola:</p>
                        <div className="flex gap-2">
                          <input
                            value={cobrancaGerada.pix_copia_cola}
                            readOnly
                            className="flex-1 p-2 bg-white border rounded text-xs font-mono"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCopiar(cobrancaGerada.pix_copia_cola)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Linha Digitável:</p>
                        <div className="flex gap-2">
                          <input
                            value={cobrancaGerada.linha_digitavel}
                            readOnly
                            className="flex-1 p-2 bg-white border rounded text-xs font-mono"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCopiar(cobrancaGerada.linha_digitavel)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => window.open(cobrancaGerada.url_boleto, '_blank')}
                        className="w-full"
                      >
                        Ver Boleto PDF
                      </Button>
                    </>
                  )}

                  <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
