import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingDown, Zap, FileText } from 'lucide-react';

export default function IAOtimizacaoCorte({ opId }) {
  const gerarOtimizacao = async () => {
    // Chamada IA para otimizar mapa de corte
    const resultado = {
      economia_estimada: 1250.50,
      reducao_refugo: 15.5,
      mapa_otimizado_url: 'https://example.com/mapa-otimizado.pdf',
      sugestoes: [
        'Reorganizar sequência de corte para reduzir desperdício',
        'Reaproveitar sobras da OP anterior #1234',
        'Usar bitola de 12m em vez de 6m para reduzir emendas'
      ]
    };

    return resultado;
  };

  return (
    <Card className="border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Sparkles className="w-5 h-5" />
          IA de Otimização de Corte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-900 mb-3">
            A IA analisa os padrões de corte e sugere otimizações para reduzir desperdício e refugo
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span className="text-xs text-slate-600">Economia Estimada</span>
              </div>
              <p className="text-xl font-bold text-green-600">R$ 1.250,50</p>
            </div>

            <div className="bg-white p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-slate-600">Redução Refugo</span>
              </div>
              <p className="text-xl font-bold text-orange-600">-15.5%</p>
            </div>
          </div>

          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar Otimização com IA
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Sugestões da IA:</p>
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              • Reorganizar sequência de corte para reduzir desperdício
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              • Reaproveitar sobras da OP anterior #1234
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              • Usar bitola de 12m em vez de 6m para reduzir emendas
            </div>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          Baixar Mapa Otimizado
        </Button>
      </CardContent>
    </Card>
  );
}