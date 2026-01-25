import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, Brain, TrendingDown, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Widget Resumo Rotas IA
 */

export default function WidgetResumoRotas() {
  const { filterInContext } = useContextoVisual();

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas-resumo'],
    queryFn: () => filterInContext('Rota', {}, '-created_date', 20)
  });

  const rotasOtimizadas = rotas.filter(r => r.otimizada_ia);
  const kmEconomizados = rotas.reduce((acc, r) => acc + (r.km_economizado_ia || 0), 0);
  const percentualEconomia = rotas.length > 0 
    ? (rotasOtimizadas.length / rotas.length) * 100 
    : 0;

  return (
    <Card className="w-full border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          Otimização IA de Rotas
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border">
            <Route className="w-5 h-5 text-purple-600 mb-1" />
            <p className="text-2xl font-bold text-purple-700">{rotasOtimizadas.length}</p>
            <p className="text-xs text-slate-600">Rotas IA</p>
          </div>
          
          <div className="p-3 bg-white rounded-lg border">
            <TrendingDown className="w-5 h-5 text-green-600 mb-1" />
            <p className="text-2xl font-bold text-green-700">{kmEconomizados.toFixed(0)}</p>
            <p className="text-xs text-slate-600">KM economizados</p>
          </div>
        </div>

        <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-900">
              Taxa de Otimização
            </span>
            <Badge className="bg-purple-600">
              {percentualEconomia.toFixed(0)}%
            </Badge>
          </div>
          <p className="text-xs text-purple-700 mt-1">
            Economia média: 20-30% por rota
          </p>
        </div>

        <div className="pt-2 border-t">
          <Badge className="bg-purple-600 w-full justify-center">
            <Brain className="w-3 h-3 mr-1" />
            IA Real • LLM Ativo
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}