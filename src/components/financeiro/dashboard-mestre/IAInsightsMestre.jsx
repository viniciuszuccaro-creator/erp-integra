import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Zap, AlertCircle } from 'lucide-react';

export default function IAInsightsMestre({ 
  totalReceber,
  totalPagar,
  scoreMedioConciliacao,
  conciliacoesAutomaticas,
  conciliacoes,
  extratosPendentes,
  totalRecorrentesAtivas
}) {
  return (
    <Card className="border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b p-2">
        <CardTitle className="text-sm flex items-center gap-2 text-purple-900 font-semibold">
          <Zap className="w-4 h-4 flex-shrink-0" />
          🤖 Insights da IA Financeira
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 space-y-2.5">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 bg-white rounded-lg border border-purple-200 min-h-[70px] max-h-[70px]">
            <p className="text-xs text-slate-600 mb-1.5">Score Conciliação</p>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${scoreMedioConciliacao}%` }}
                />
              </div>
              <span className="text-sm font-bold text-purple-700">{scoreMedioConciliacao.toFixed(0)}%</span>
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-green-200 min-h-[70px] max-h-[70px]">
            <p className="text-xs text-slate-600 mb-1.5">Taxa Automação</p>
            <div className="flex items-center gap-1.5">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${(conciliacoesAutomaticas / (conciliacoes.length || 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-green-700">
                {((conciliacoesAutomaticas / (conciliacoes.length || 1)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-orange-200 min-h-[70px] max-h-[70px] flex flex-col justify-center">
            <p className="text-xs text-slate-600 mb-1">Extratos Pendentes</p>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <span className="text-lg font-bold text-orange-700">{extratosPendentes}</span>
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-300">
          <p className="text-xs font-semibold text-blue-900 mb-1.5">💡 Recomendações Inteligentes</p>
          <ul className="space-y-0.5 text-xs text-blue-800">
            {totalReceber > totalPagar && (
              <li>✅ Saldo positivo previsto. Fluxo de caixa saudável.</li>
            )}
            {extratosPendentes > 10 && (
              <li>⚠️ {extratosPendentes} extratos pendentes. Execute conciliação automática.</li>
            )}
            {scoreMedioConciliacao > 80 && (
              <li>🎯 Precisão de conciliação ({scoreMedioConciliacao.toFixed(0)}%). IA treinada.</li>
            )}
            {totalRecorrentesAtivas > 0 && (
              <li>🔄 {totalRecorrentesAtivas} despesas recorrentes automatizadas.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}