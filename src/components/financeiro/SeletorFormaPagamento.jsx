import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Zap, TrendingDown, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { useFormasPagamento } from '@/components/lib/useFormasPagamento';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * SELETOR VISUAL DE FORMA DE PAGAMENTO V21.8
 * Componente reutilizável com IA de recomendação
 * Usado em: PDV, Pedidos, Contas a Receber, Portal
 */
export default function SeletorFormaPagamento({ 
  valorCompra, 
  contexto = 'pdv',
  onChange,
  formaSelecionada = null,
  showRecomendacoes = true,
  showParcelamento = true
}) {
  const { 
    obterFormasPorContexto, 
    calcularValorFinal, 
    calcularParcelas,
    recomendarMelhorForma,
    validarFormaPagamento
  } = useFormasPagamento();

  const [parcelas, setParcelas] = useState(1);
  const [abaAtiva, setAbaAtiva] = useState('todas');

  const formasDisponiveis = obterFormasPorContexto(contexto);
  const recomendacoes = showRecomendacoes ? recomendarMelhorForma(valorCompra, contexto) : [];
  const detalhesParcelamento = formaSelecionada ? calcularParcelas(valorCompra, formaSelecionada, 12) : null;

  const handleSelecionar = (forma) => {
    const validacao = validarFormaPagamento(forma.id);
    if (!validacao.valido) {
      alert(validacao.erro);
      return;
    }
    onChange?.(forma, parcelas);
  };

  const renderForma = (forma, isRecomendada = false) => {
    const valorFinal = calcularValorFinal(valorCompra, forma.id);
    const economia = valorCompra - valorFinal;
    const percentualDiferenca = ((economia / valorCompra) * 100).toFixed(1);
    const isSelecionada = formaSelecionada?.id === forma.id;

    return (
      <Card 
        key={forma.id}
        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
          isSelecionada ? 'border-blue-500 bg-blue-50' : 
          isRecomendada ? 'border-green-500 bg-green-50' : 
          'border-slate-200 hover:border-blue-300'
        }`}
        onClick={() => handleSelecionar(forma)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: forma.cor + '20' }}
              >
                {forma.icone}
              </div>
              <div>
                <p className="font-bold text-sm">{forma.descricao}</p>
                <Badge variant="outline" className="text-xs">{forma.tipo}</Badge>
              </div>
            </div>
            {isRecomendada && (
              <Badge className="bg-green-600 animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                IA
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <span className="text-xs text-slate-600">Valor final:</span>
              <span className="font-bold text-sm">
                R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {economia !== 0 && (
              <div className={`flex items-center justify-between p-2 rounded ${
                economia > 0 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                {economia > 0 ? (
                  <>
                    <span className="text-xs text-green-700 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Economia:
                    </span>
                    <span className="font-bold text-sm text-green-700">
                      -R$ {economia.toFixed(2)} ({percentualDiferenca}%)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-orange-700 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Taxa:
                    </span>
                    <span className="font-bold text-sm text-orange-700">
                      +R$ {Math.abs(economia).toFixed(2)} ({Math.abs(percentualDiferenca)}%)
                    </span>
                  </>
                )}
              </div>
            )}

            {forma.permite_parcelamento && (
              <Badge className="bg-purple-100 text-purple-700 text-xs w-full justify-center">
                <Calendar className="w-3 h-3 mr-1" />
                Até {forma.maximo_parcelas}x de R$ {(valorFinal / forma.maximo_parcelas).toFixed(2)}
              </Badge>
            )}

            {forma.prazo_compensacao_dias > 0 && (
              <p className="text-xs text-slate-500 text-center">
                Compensação em {forma.prazo_compensacao_dias} dias
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {showRecomendacoes && recomendacoes.length > 0 && (
        <Alert className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
          <Sparkles className="w-4 h-4 text-green-600" />
          <AlertDescription>
            <strong>🤖 IA Recomenda:</strong> {recomendacoes[0].forma.descricao} - 
            Economia de R$ {recomendacoes[0].economia.toFixed(2)} ({recomendacoes[0].percentual_economia.toFixed(1)}%)
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-3 w-full bg-slate-100">
          <TabsTrigger value="todas">Todas ({formasDisponiveis.length})</TabsTrigger>
          <TabsTrigger value="recomendadas">
            <Sparkles className="w-3 h-3 mr-1" />
            IA ({recomendacoes.slice(0, 3).length})
          </TabsTrigger>
          <TabsTrigger value="parcelamento">
            <Calendar className="w-3 h-3 mr-1" />
            Parcelar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {formasDisponiveis.map(forma => renderForma(forma))}
          </div>
        </TabsContent>

        <TabsContent value="recomendadas" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {recomendacoes.slice(0, 3).map(rec => renderForma(rec.forma, true))}
          </div>
          {recomendacoes.length === 0 && (
            <p className="text-center py-8 text-slate-500">Nenhuma recomendação disponível</p>
          )}
        </TabsContent>

        <TabsContent value="parcelamento" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {formasDisponiveis.filter(f => f.permite_parcelamento).map(forma => renderForma(forma))}
          </div>
          {formasDisponiveis.filter(f => f.permite_parcelamento).length === 0 && (
            <p className="text-center py-8 text-slate-500">Nenhuma forma aceita parcelamento</p>
          )}
        </TabsContent>
      </Tabs>

      {/* SIMULADOR DE PARCELAS */}
      {formaSelecionada?.permite_parcelamento && showParcelamento && detalhesParcelamento && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="bg-purple-100 border-b border-purple-200 pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
              <Calendar className="w-4 h-4" />
              Simulação de Parcelamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {detalhesParcelamento.map(opcao => (
                <button
                  key={opcao.numero_parcelas}
                  onClick={() => setParcelas(opcao.numero_parcelas)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    parcelas === opcao.numero_parcelas 
                      ? 'border-purple-600 bg-purple-100' 
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <p className="font-bold text-lg text-purple-900">{opcao.numero_parcelas}x</p>
                  <p className="text-xs text-slate-600">
                    R$ {opcao.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-purple-600 font-semibold mt-1">
                    Total: R$ {opcao.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}