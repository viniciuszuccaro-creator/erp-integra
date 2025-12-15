import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, TrendingUp, Clock, DollarSign, Zap, CheckCircle2 } from "lucide-react";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";

export default function IARecomendacaoPagamento({ conta, onAplicar }) {
  const { recomendarMelhorForma, calcularParcelas, sugerirParcelamentoIdeal } = useFormasPagamento();
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  if (!conta) return null;

  const recomendacoes = recomendarMelhorForma(conta.valor, 'pdv');
  const melhorOpcao = recomendacoes[0];
  const parcelamentos = sugerirParcelamentoIdeal(conta.valor, conta.valor * 0.3);

  const scoreIA = Math.round(
    (melhorOpcao?.percentual_economia || 0) * 0.4 +
    (100 - (melhorOpcao?.prazo_compensacao || 0)) * 0.3 +
    30
  );

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="border-b bg-white/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          IA - Recomendação de Pagamento
          <Badge className="bg-purple-100 text-purple-700 ml-auto">
            Score IA: {scoreIA}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {melhorOpcao && (
          <>
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">
                      💡 Melhor opção: {melhorOpcao.forma.descricao}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Valor Final: R$ {melhorOpcao.valor_final.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-green-700 font-semibold">
                          Economia: R$ {melhorOpcao.economia.toFixed(2)} ({melhorOpcao.percentual_economia.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Compensação: {melhorOpcao.prazo_compensacao} dias</span>
                      </div>
                    </div>
                    {onAplicar && (
                      <Button
                        size="sm"
                        onClick={() => onAplicar(melhorOpcao.forma)}
                        className="mt-3 bg-green-600 hover:bg-green-700"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Aplicar Recomendação
                      </Button>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              className="w-full"
            >
              {mostrarDetalhes ? '▼' : '►'} Ver Todas as Opções ({recomendacoes.length})
            </Button>

            {mostrarDetalhes && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recomendacoes.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-slate-200 hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{rec.forma.descricao}</span>
                      <Badge variant="outline" className="text-xs">
                        Score: {rec.score_cliente.toFixed(0)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Valor Final:</span>
                        <p className="font-semibold">R$ {rec.valor_final.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Economia:</span>
                        <p className="font-semibold text-green-600">R$ {rec.economia.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Prazo:</span>
                        <p className="font-semibold">{rec.prazo_compensacao}d</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {parcelamentos.length > 0 && (
              <Alert className="border-blue-300 bg-blue-50">
                <AlertDescription>
                  <p className="font-semibold text-blue-900 mb-2">
                    🎯 Sugestão de Parcelamento
                  </p>
                  <div className="space-y-2">
                    {parcelamentos.slice(0, 3).map((parc, idx) => (
                      <div key={idx} className="text-xs bg-white p-2 rounded">
                        <span className="font-semibold">{parc.forma.descricao}</span>
                        {' • '}
                        <span>{parc.parcelas_ideais}x de R$ {parc.valor_parcela.toFixed(2)}</span>
                        {' • '}
                        <span className="text-slate-500">Total: R$ {parc.valor_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {!melhorOpcao && (
          <Alert>
            <AlertDescription className="text-sm text-slate-600">
              ⚠️ Configure formas de pagamento em Cadastros para receber recomendações da IA.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}