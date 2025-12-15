import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormasPagamento } from '@/components/lib/useFormasPagamento';
import { DollarSign, Sparkles, TrendingDown, Calculator, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * SIMULADOR DE PAGAMENTO V21.8
 * IA que recomenda melhor forma com base em valor e capacidade
 */
export default function SimuladorPagamento({ valorInicial = 1000, contexto = 'pdv' }) {
  const [valor, setValor] = useState(valorInicial);
  const [capacidadeMensal, setCapacidadeMensal] = useState(500);
  const { recomendarMelhorForma, sugerirParcelamentoIdeal, calcularValorFinal } = useFormasPagamento();

  const recomendacoes = recomendarMelhorForma(valor, contexto);
  const sugestoesParcelamento = sugerirParcelamentoIdeal(valor, capacidadeMensal);

  return (
    <div className="w-full h-full p-6 space-y-6 overflow-auto">
      <div className="flex items-center gap-2">
        <Calculator className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Simulador Inteligente de Pagamento</h2>
      </div>

      {/* INPUTS */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor da Compra</Label>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <Input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                  className="font-bold text-lg"
                />
              </div>
            </div>
            <div>
              <Label>Capacidade Mensal (para parcelamento)</Label>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <Input
                  type="number"
                  step="0.01"
                  value={capacidadeMensal}
                  onChange={(e) => setCapacidadeMensal(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MELHOR OPÇÃO - IA */}
      {recomendacoes.length > 0 && (
        <Card className="border-green-500 border-2 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Sparkles className="w-5 h-5" />
              🤖 IA Recomenda: Melhor Opção
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                  style={{ backgroundColor: recomendacoes[0].forma.cor + '40' }}
                >
                  {recomendacoes[0].forma.icone}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{recomendacoes[0].forma.descricao}</p>
                  <Badge className="mt-1">{recomendacoes[0].forma.tipo}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Você paga:</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {recomendacoes[0].valor_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {recomendacoes[0].economia > 0 && (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-semibold text-green-600">
                      Economiza R$ {recomendacoes[0].economia.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OUTRAS OPÇÕES */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Outras Opções Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {recomendacoes.slice(1).map(rec => (
              <Card 
                key={rec.forma.id}
                className="cursor-pointer hover:shadow-lg transition-all border hover:border-blue-300"
                onClick={() => handleSelecionar(rec.forma)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{rec.forma.icone}</span>
                    <p className="font-semibold text-sm">{rec.forma.descricao}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Valor:</span>
                      <span className="font-bold">R$ {rec.valor_final.toFixed(2)}</span>
                    </div>
                    {rec.economia !== 0 && (
                      <div className={`flex justify-between text-xs ${rec.economia > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        <span>{rec.economia > 0 ? 'Economia:' : 'Taxa:'}</span>
                        <span className="font-bold">
                          {rec.economia > 0 ? '-' : '+'}R$ {Math.abs(rec.economia).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SUGESTÕES DE PARCELAMENTO */}
      {sugestoesParcelamento.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="bg-purple-100 border-b border-purple-200">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="w-5 h-5" />
              💡 Sugestões de Parcelamento (Cabem no seu orçamento)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {sugestoesParcelamento.map(sugestao => (
                <div 
                  key={sugestao.forma.id}
                  className="p-4 bg-white rounded-lg border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition-all"
                  onClick={() => handleSelecionar(sugestao.forma)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sugestao.forma.icone}</span>
                      <div>
                        <p className="font-semibold">{sugestao.forma.descricao}</p>
                        <Badge className="bg-purple-600 mt-1">
                          {sugestao.parcelas_ideais}x de R$ {sugestao.valor_parcela.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-600">Total:</p>
                      <p className="text-lg font-bold text-purple-900">
                        R$ {sugestao.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}