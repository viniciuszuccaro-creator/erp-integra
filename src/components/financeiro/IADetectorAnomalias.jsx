import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Shield, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V22.0 ETAPA 4 - IA Detector de Anomalias Financeiras
 * Detecta padrões suspeitos, valores fora da curva, possíveis duplicidades
 */
export default function IADetectorAnomalias() {
  const { filterInContext } = useContextoVisual();
  const [periodo, setPeriodo] = useState(30);

  const { data: anomalias = [], isLoading } = useQuery({
    queryKey: ['ia-anomalias-financeiras', periodo],
    queryFn: async () => {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - periodo);
      
      const [receber, pagar] = await Promise.all([
        filterInContext('ContaReceber', {}, '-created_date', 200),
        filterInContext('ContaPagar', {}, '-created_date', 200),
      ]);

      const detectadas = [];

      // 1. Detectar valores muito acima da média
      const valores = [...receber, ...pagar].map(c => c.valor || 0).filter(v => v > 0);
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      const desvio = Math.sqrt(valores.map(v => Math.pow(v - media, 2)).reduce((a, b) => a + b, 0) / valores.length);
      
      [...receber, ...pagar].forEach(conta => {
        if ((conta.valor || 0) > media + (3 * desvio)) {
          detectadas.push({
            tipo: 'Valor Atípico',
            severidade: 'alta',
            conta,
            descricao: `Valor R$ ${conta.valor.toLocaleString('pt-BR')} é 3x acima da média (R$ ${media.toFixed(2)})`,
            recomendacao: 'Verificar se o valor está correto e se não é duplicidade',
          });
        }
      });

      // 2. Detectar possíveis duplicidades
      const mapa = {};
      [...receber, ...pagar].forEach(conta => {
        const chave = `${conta.descricao}_${conta.valor}_${conta.data_vencimento}`;
        if (!mapa[chave]) mapa[chave] = [];
        mapa[chave].push(conta);
      });
      
      Object.values(mapa).forEach(grupo => {
        if (grupo.length > 1) {
          detectadas.push({
            tipo: 'Possível Duplicidade',
            severidade: 'media',
            conta: grupo[0],
            descricao: `${grupo.length} títulos com descrição, valor e vencimento idênticos`,
            recomendacao: 'Verificar se não são lançamentos duplicados',
            relacionados: grupo.slice(1).map(c => c.id),
          });
        }
      });

      // 3. Detectar pagamentos muito próximos
      pagar.forEach((conta, idx) => {
        if (idx > 0 && conta.fornecedor === pagar[idx - 1].fornecedor) {
          const diff = Math.abs(
            new Date(conta.created_date).getTime() - new Date(pagar[idx - 1].created_date).getTime()
          ) / (1000 * 60);
          
          if (diff < 5) {
            detectadas.push({
              tipo: 'Lançamentos Sequenciais',
              severidade: 'baixa',
              conta,
              descricao: `2 lançamentos para ${conta.fornecedor} em ${Math.round(diff)} minutos`,
              recomendacao: 'Verificar se ambos são necessários',
            });
          }
        }
      });

      // 4. Detectar taxa de operadora incoerente
      receber.forEach(conta => {
        const taxa = conta.detalhes_pagamento?.taxa_operadora || 0;
        if (taxa > 5 && conta.forma_recebimento?.includes('Cartão Débito')) {
          detectadas.push({
            tipo: 'Taxa Elevada',
            severidade: 'media',
            conta,
            descricao: `Taxa de ${taxa}% em cartão débito (esperado: 1-2%)`,
            recomendacao: 'Revisar taxa cobrada pela operadora',
          });
        }
        if (taxa > 8 && conta.forma_recebimento?.includes('Cartão Crédito')) {
          detectadas.push({
            tipo: 'Taxa Elevada',
            severidade: 'media',
            conta,
            descricao: `Taxa de ${taxa}% em cartão crédito (esperado: 2-5%)`,
            recomendacao: 'Revisar taxa cobrada pela operadora',
          });
        }
      });

      return detectadas.slice(0, 20);
    },
  });

  const porSeveridade = {
    alta: anomalias.filter(a => a.severidade === 'alta').length,
    media: anomalias.filter(a => a.severidade === 'media').length,
    baixa: anomalias.filter(a => a.severidade === 'baixa').length,
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-auto">
      <Card className="border-2 border-orange-500 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">IA Detector de Anomalias</CardTitle>
                <Badge className="bg-orange-600 text-white mt-1">V22.0 Etapa 4</Badge>
              </div>
            </div>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(Number(e.target.value))}
              className="px-3 py-2 border rounded"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={60}>Últimos 60 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-2 border-slate-300">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Total Detectado</p>
            <p className="text-3xl font-bold text-slate-900">{anomalias.length}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Alta Prioridade</p>
            <p className="text-3xl font-bold text-red-600">{porSeveridade.alta}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Média Prioridade</p>
            <p className="text-3xl font-bold text-orange-600">{porSeveridade.media}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-300 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-600 mb-1">Baixa Prioridade</p>
            <p className="text-3xl font-bold text-yellow-600">{porSeveridade.baixa}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Anomalias */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-2" />
              <p className="text-slate-600">IA analisando padrões financeiros...</p>
            </CardContent>
          </Card>
        ) : anomalias.length === 0 ? (
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-green-900">Nenhuma anomalia detectada!</p>
              <p className="text-sm text-slate-600">Suas operações financeiras estão saudáveis.</p>
            </CardContent>
          </Card>
        ) : (
          anomalias.map((anomalia, idx) => {
            const cores = {
              alta: 'border-red-400 bg-red-50',
              media: 'border-orange-400 bg-orange-50',
              baixa: 'border-yellow-400 bg-yellow-50',
            };
            const iconeCor = {
              alta: 'text-red-600',
              media: 'text-orange-600',
              baixa: 'text-yellow-600',
            };

            return (
              <Card key={idx} className={`border-2 ${cores[anomalia.severidade]}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-6 h-6 ${iconeCor[anomalia.severidade]} flex-shrink-0 mt-1`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-slate-900">{anomalia.tipo}</h3>
                        <Badge className={anomalia.severidade === 'alta' ? 'bg-red-600 text-white' : 
                                         anomalia.severidade === 'media' ? 'bg-orange-600 text-white' : 
                                         'bg-yellow-600 text-white'}>
                          {anomalia.severidade.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm font-semibold text-slate-900">{anomalia.conta.descricao}</p>
                          <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                            <span>{anomalia.conta.cliente || anomalia.conta.fornecedor}</span>
                            <span>•</span>
                            <span className="font-bold text-green-600">
                              R$ {(anomalia.conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <p className="text-slate-700">
                            <span className="font-semibold">Detalhes:</span> {anomalia.descricao}
                          </p>
                          <p className="text-blue-700">
                            <span className="font-semibold">💡 Recomendação IA:</span> {anomalia.recomendacao}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}