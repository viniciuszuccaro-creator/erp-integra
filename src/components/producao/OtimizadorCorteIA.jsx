import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Zap, Download, TrendingDown, CheckCircle } from "lucide-react";

/**
 * V21.2 - Otimizador de Corte com IA
 * Minimiza refugo e gera arquivo CNC
 */
export default function OtimizadorCorteIA({ isOpen, onClose, empresaId }) {
  const [otimizando, setOtimizando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const { data: opsAtivas = [] } = useQuery({
    queryKey: ['ops-otimizar', empresaId],
    queryFn: () => base44.entities.OrdemProducao.filter({
      empresa_id: empresaId,
      status: 'Liberada'
    }),
    enabled: isOpen
  });

  const otimizarMutation = useMutation({
    mutationFn: async () => {
      setOtimizando(true);

      // Coletar todas as peças de C/D
      const todasPecas = [];
      opsAtivas.forEach(op => {
        (op.itens_producao || [])
          .filter(item => item.modalidade === 'corte_dobra')
          .forEach(item => {
            todasPecas.push({
              op_id: op.id,
              numero_op: op.numero_op,
              elemento: item.elemento,
              bitola: item.bitola_principal_id,
              bitola_nome: item.bitola_principal,
              comprimento_mm: item.comprimento_barra * 10, // cm → mm
              quantidade: item.quantidade_barras_principal || item.quantidade
            });
          });
      });

      // Agrupar por bitola
      const pecasPorBitola = {};
      todasPecas.forEach(peca => {
        if (!pecasPorBitola[peca.bitola]) {
          pecasPorBitola[peca.bitola] = [];
        }
        pecasPorBitola[peca.bitola].push(peca);
      });

      // IA: Otimização de Corte
      const resultadoIA = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um otimizador de corte de barras de aço.

Dados de entrada:
${JSON.stringify(pecasPorBitola, null, 2)}

Comprimento padrão da barra: 12000 mm

TAREFA:
1. Para cada bitola, organize as peças em barras de forma a MINIMIZAR o refugo (sobra).
2. Retorne um plano de corte otimizado.
3. Calcule o refugo total (em mm e %).

Retorne JSON com:
- plano_corte: array de objetos { bitola, barra_numero, pecas_nesta_barra: [{elemento, comprimento_mm}], refugo_mm }
- refugo_total_mm: total de refugo
- percentual_refugo: %
- economia_vs_manual: %
- arquivo_cnc: código NC para máquina CNC (formato básico G-code)`,
        response_json_schema: {
          type: 'object',
          properties: {
            plano_corte: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  bitola: { type: 'string' },
                  barra_numero: { type: 'number' },
                  pecas_nesta_barra: { type: 'array' },
                  refugo_mm: { type: 'number' }
                }
              }
            },
            refugo_total_mm: { type: 'number' },
            percentual_refugo: { type: 'number' },
            economia_vs_manual: { type: 'number' },
            arquivo_cnc: { type: 'string' }
          }
        }
      });

      setResultado(resultadoIA);
      return resultadoIA;
    },
    onSettled: () => {
      setOtimizando(false);
    }
  });

  const handleOtimizar = () => {
    if (opsAtivas.length === 0) {
      alert('Nenhuma OP liberada para otimizar');
      return;
    }
    otimizarMutation.mutate();
  };

  const handleBaixarCNC = () => {
    if (!resultado?.arquivo_cnc) return;

    const blob = new Blob([resultado.arquivo_cnc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlanoCorte_${new Date().getTime()}.nc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Otimizador de Corte IA (V21.2)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert className="border-orange-300 bg-orange-50">
            <Zap className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-sm text-orange-800">
              <strong>IA de Corte:</strong> Analisa todas as OPs liberadas, agrupa por bitola e minimiza refugo.
              Gera arquivo CNC (.NC) para máquinas automatizadas.
            </AlertDescription>
          </Alert>

          {!resultado ? (
            <>
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700">OPs Liberadas Disponíveis:</p>
                    <Badge className="bg-blue-600">{opsAtivas.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700">Total de Peças C/D:</p>
                    <Badge variant="outline">
                      {opsAtivas.reduce((sum, op) => 
                        sum + (op.itens_producao || []).filter(i => i.modalidade === 'corte_dobra').length, 0
                      )}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleOtimizar}
                  disabled={otimizando || opsAtivas.length === 0}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {otimizando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Otimizando com IA...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Otimizar Corte IA
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
                    Otimização Concluída!
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-green-300">
                      <p className="text-xs text-green-700">Refugo Total</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {(resultado.refugo_total_mm / 1000).toFixed(2)} m
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-green-300">
                      <p className="text-xs text-green-700">% Refugo</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {resultado.percentual_refugo?.toFixed(1)}%
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-green-300">
                      <p className="text-xs text-green-700">Economia vs Manual</p>
                      <p className="text-2xl font-bold text-green-600">
                        {resultado.economia_vs_manual?.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <Alert className="border-blue-300 bg-blue-50">
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      <strong>IA reduziu {resultado.economia_vs_manual?.toFixed(1)}% de desperdício!</strong>
                      Economia estimada: R$ {((resultado.refugo_total_mm / 1000) * 8 * 0.888).toFixed(2)}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Plano de Corte */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plano de Corte Otimizado</CardTitle>
                </CardHeader>
                <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                  <div className="space-y-3">
                    {(resultado.plano_corte || []).map((barra, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border text-sm">
                        <div className="flex justify-between mb-2">
                          <p className="font-bold">Barra #{barra.barra_numero} - {barra.bitola}</p>
                          <Badge variant="outline">Refugo: {barra.refugo_mm} mm</Badge>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          {(barra.pecas_nesta_barra || []).map((peca, pidx) => (
                            <p key={pidx}>
                              • {peca.elemento || `Peça ${pidx + 1}`}: {peca.comprimento_mm} mm
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={handleBaixarCNC}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Arquivo CNC (.NC)
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}