import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, QrCode, Copy, CheckCircle, AlertCircle, Send } from "lucide-react";
import { mockGerarBoleto, mockGerarPix, avisoModoSimulacao } from "@/components/integracoes/MockIntegracoes";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function GerarCobrancaModal({ isOpen, onClose, contaReceber, windowMode = false }) {
  const [gerando, setGerando] = useState(false);
  const [cobrancaGerada, setCobrancaGerada] = useState(null);
  const [tipoCobranca, setTipoCobranca] = useState("boleto");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const gerarCobrancaMutation = useMutation({
    mutationFn: async () => {
      setGerando(true);

      let resultado;

      if (tipoCobranca === "boleto") {
        resultado = await mockGerarBoleto({
          conta_receber_id: contaReceber.id,
          cliente: contaReceber.cliente,
          valor: contaReceber.valor,
          vencimento: contaReceber.data_vencimento
        });
      } else {
        resultado = await mockGerarPix({
          conta_receber_id: contaReceber.id,
          cliente: contaReceber.cliente,
          valor: contaReceber.valor,
          vencimento: contaReceber.data_vencimento
        });
      }

      // Atualizar conta a receber
      await base44.entities.ContaReceber.update(contaReceber.id, {
        forma_cobranca: tipoCobranca === "boleto" ? "Boleto" : "PIX",
        status_cobranca: "gerada_simulada",
        id_cobranca_externa: resultado.boleto_id || resultado.pix_id,
        linha_digitavel: resultado.linha_digitavel,
        pix_copia_cola: resultado.pix_copia_cola,
        pix_qrcode: resultado.qrcode_url || resultado.qrcode_base64,
        url_boleto_pdf: resultado.url_boleto,
        data_envio_cobranca: new Date().toISOString(),
        provedor_pagamento: "Mock/Simulação"
      });

      // Registrar log
      await base44.entities.LogCobranca.create({
        empresa_id: contaReceber.empresa_id,
        conta_receber_id: contaReceber.id,
        tipo_operacao: tipoCobranca === "boleto" ? "gerar_boleto" : "gerar_pix",
        provedor: "Mock/Simulação",
        data_hora: new Date().toISOString(),
        status_operacao: "simulado",
        retorno_recebido: resultado,
        linha_digitavel: resultado.linha_digitavel,
        pix_copia_cola: resultado.pix_copia_cola,
        url_boleto: resultado.url_boleto,
        usuario_nome: "Sistema"
      });

      setCobrancaGerada(resultado);
      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({
        title: `✅ ${tipoCobranca === "boleto" ? "Boleto" : "PIX"} Gerado (Simulação)`,
        description: "Cobrança criada com sucesso"
      });
    }
  });

  const copiarPix = () => {
    navigator.clipboard.writeText(cobrancaGerada.pix_copia_cola);
    toast({ title: "✅ Código PIX copiado!" });
  };

  const aviso = avisoModoSimulacao();

  const content = (
    <div className={`space-y-4 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      {!windowMode && (
        <h2 className="text-xl font-bold mb-4">Gerar Cobrança - {contaReceber?.cliente}</h2>
      )}
          <Alert className="border-amber-300 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertDescription>
              <strong>{aviso.titulo}</strong><br />
              {aviso.mensagem}
            </AlertDescription>
          </Alert>

          {!cobrancaGerada ? (
            <>
              <div className="p-4 bg-slate-50 rounded">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Valor:</span>
                  <span className="font-bold text-2xl">
                    R$ {contaReceber?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Vencimento:</span>
                  <span className="font-semibold">
                    {new Date(contaReceber?.data_vencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <Tabs value={tipoCobranca} onValueChange={setTipoCobranca}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="boleto">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Boleto
                  </TabsTrigger>
                  <TabsTrigger value="pix">
                    <QrCode className="w-4 h-4 mr-2" />
                    PIX
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="boleto" className="mt-4">
                  <div className="p-4 bg-blue-50 rounded text-sm text-blue-900">
                    <p><strong>✓</strong> Boleto bancário registrado</p>
                    <p><strong>✓</strong> Válido em qualquer banco ou lotérica</p>
                    <p><strong>✓</strong> Código de barras incluso</p>
                  </div>
                </TabsContent>

                <TabsContent value="pix" className="mt-4">
                  <div className="p-4 bg-green-50 rounded text-sm text-green-900">
                    <p><strong>✓</strong> Pagamento instantâneo</p>
                    <p><strong>✓</strong> Válido por 24 horas</p>
                    <p><strong>✓</strong> QR Code + Copia e Cola</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gerar {tipoCobranca === "boleto" ? "Boleto" : "PIX"}
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Cobrança Gerada */}
              {tipoCobranca === "boleto" ? (
                <div className="bg-blue-50 border border-blue-200 rounded p-6 space-y-4">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold mb-3">
                    <CheckCircle className="w-6 h-6" />
                    Boleto Gerado com Sucesso!
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Nosso Número:</span>
                      <span className="font-semibold">{cobrancaGerada.nosso_numero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Valor:</span>
                      <span className="font-bold text-lg">
                        R$ {cobrancaGerada.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Vencimento:</span>
                      <span className="font-semibold">
                        {new Date(cobrancaGerada.vencimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-blue-800">Linha Digitável</Label>
                    <div className="bg-white p-3 rounded border border-blue-300 mt-2">
                      <p className="font-mono text-xs break-all">{cobrancaGerada.linha_digitavel}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Baixar PDF
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                      navigator.clipboard.writeText(cobrancaGerada.linha_digitavel);
                      toast({ title: "✅ Linha digitável copiada!" });
                    }}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-6 space-y-4">
                  <div className="flex items-center gap-2 text-green-900 font-semibold mb-3">
                    <CheckCircle className="w-6 h-6" />
                    PIX Gerado com Sucesso!
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Valor:</span>
                      <span className="font-bold text-lg">
                        R$ {cobrancaGerada.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Válido por:</span>
                      <span className="font-semibold">{cobrancaGerada.validade_horas}h</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded border border-green-300 text-center">
                    <div className="w-48 h-48 bg-slate-200 mx-auto rounded flex items-center justify-center mb-3">
                      <QrCode className="w-24 h-24 text-slate-400" />
                    </div>
                    <p className="text-xs text-green-700">QR Code PIX (Simulado)</p>
                  </div>

                  <div>
                    <Label className="text-green-800">PIX Copia e Cola</Label>
                    <div className="bg-white p-3 rounded border border-green-300 mt-2">
                      <p className="font-mono text-xs break-all">{cobrancaGerada.pix_copia_cola}</p>
                    </div>
                  </div>

                  <Button size="sm" className="w-full" onClick={copiarPix}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código PIX
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                  Concluir
                </Button>
              </div>
            </>
          )}
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerar Cobrança - {contaReceber?.cliente}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}