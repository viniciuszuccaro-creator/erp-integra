import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 4: Gerenciador de Intenções
 * Dashboard de performance das intenções do chatbot
 */

export default function GerenciadorIntencoes() {
  const { empresaAtual, filterInContext } = useContextoVisual();

  const { data: intents = [] } = useQuery({
    queryKey: ['chatbot', 'intents', empresaAtual?.id],
    queryFn: () => filterInContext('ChatbotIntent', {}, '-created_date', 100),
    enabled: !!empresaAtual
  });

  const { data: interacoes = [] } = useQuery({
    queryKey: ['chatbot', 'interacoes', empresaAtual?.id],
    queryFn: () => filterInContext('ChatbotInteracao', {}, '-data_hora', 500),
    enabled: !!empresaAtual
  });

  const stats = intents.map(intent => {
    const usos = interacoes.filter(i => i.intencao_detectada === intent.intent_name).length;
    const sucessos = interacoes.filter(i => 
      i.intencao_detectada === intent.intent_name && i.acao_executada
    ).length;
    const taxa = usos > 0 ? (sucessos / usos * 100).toFixed(1) : 0;

    return {
      ...intent,
      total_usos: usos,
      total_sucessos: sucessos,
      taxa_sucesso: taxa
    };
  });

  const totalInteracoes = interacoes.length;
  const totalIntencoes = intents.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Intenções</p>
                <p className="text-3xl font-bold">{totalIntencoes}</p>
              </div>
              <Zap className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Interações 30d</p>
                <p className="text-3xl font-bold">{totalInteracoes}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taxa Média Sucesso</p>
                <p className="text-3xl font-bold">
                  {stats.length > 0 ? (stats.reduce((acc, s) => acc + parseFloat(s.taxa_sucesso), 0) / stats.length).toFixed(0) : 0}%
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Intenção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.map(stat => (
              <div key={stat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{stat.intent_name}</h4>
                  <p className="text-sm text-slate-600">{stat.acao_backend}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stat.total_usos}</p>
                    <p className="text-xs text-slate-500">usos</p>
                  </div>
                  <div className="text-center">
                    <Badge className={
                      parseFloat(stat.taxa_sucesso) > 80 ? 'bg-green-600' :
                      parseFloat(stat.taxa_sucesso) > 50 ? 'bg-yellow-600' : 'bg-red-600'
                    }>
                      {stat.taxa_sucesso}%
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">sucesso</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}