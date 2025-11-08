import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Flame, ThermometerSun, Snowflake, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * IA de Priorização de Leads
 * Analisa taxa de conversão e temperatura dos leads
 */
export default function IALeadsPriorizacao({ oportunidades = [] }) {
  const [leadsClassificados, setLeadsClassificados] = useState([]);

  useEffect(() => {
    analisarLeads();
  }, [oportunidades]);

  const analisarLeads = () => {
    const classificados = oportunidades.map(opp => {
      let score = opp.score || 50;
      let temperatura = opp.temperatura || 'Morno';

      // ANÁLISE 1: Valor estimado
      if (opp.valor_estimado > 50000) score += 20;
      else if (opp.valor_estimado > 20000) score += 10;

      // ANÁLISE 2: Probabilidade
      score = Math.min(100, score + (opp.probabilidade || 0) * 0.3);

      // ANÁLISE 3: Tempo sem contato
      const diasSemContato = opp.dias_sem_contato || 0;
      if (diasSemContato > 15) {
        score -= 15;
        temperatura = 'Frio';
      } else if (diasSemContato <= 3) {
        score += 10;
        temperatura = 'Quente';
      }

      // ANÁLISE 4: Quantidade de interações
      if (opp.quantidade_interacoes > 5) {
        score += 10;
        temperatura = 'Quente';
      }

      return {
        ...opp,
        score: Math.min(100, Math.max(0, score)),
        temperatura,
        prioridade: score > 70 ? 'Alta' : score > 40 ? 'Média' : 'Baixa'
      };
    });

    setLeadsClassificados(
      classificados.sort((a, b) => b.score - a.score)
    );
  };

  const leadsQuentes = leadsClassificados.filter(l => l.temperatura === 'Quente').length;
  const leadsMornos = leadsClassificados.filter(l => l.temperatura === 'Morno').length;
  const leadsFrios = leadsClassificados.filter(l => l.temperatura === 'Frio').length;

  const temperaturaConfig = {
    'Quente': { cor: 'red', icone: Flame, bgClass: 'bg-red-50', textClass: 'text-red-700' },
    'Morno': { cor: 'orange', icone: ThermometerSun, bgClass: 'bg-orange-50', textClass: 'text-orange-700' },
    'Frio': { cor: 'blue', icone: Snowflake, bgClass: 'bg-blue-50', textClass: 'text-blue-700' }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="border-b bg-white/80">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-5 h-5 text-purple-600" />
          Priorização Inteligente de Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3 text-center">
              <Flame className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-900">{leadsQuentes}</p>
              <p className="text-xs text-red-700">Quentes</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-3 text-center">
              <ThermometerSun className="w-6 h-6 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-900">{leadsMornos}</p>
              <p className="text-xs text-orange-700">Mornos</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3 text-center">
              <Snowflake className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-900">{leadsFrios}</p>
              <p className="text-xs text-blue-700">Frios</p>
            </CardContent>
          </Card>
        </div>

        {/* Top 5 Leads Priorizados */}
        {leadsClassificados.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-purple-900 text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Top 5 Leads para Focar
            </h4>
            {leadsClassificados.slice(0, 5).map((lead, idx) => {
              const config = temperaturaConfig[lead.temperatura];
              const Icon = config.icone;

              return (
                <Card key={idx} className={`border ${config.bgClass}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${config.bgClass} rounded-lg`}>
                        <Icon className={`w-5 h-5 ${config.textClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{lead.titulo}</p>
                          <Badge variant="outline" className="text-xs">
                            #{idx + 1}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{lead.cliente_nome}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={lead.score} className="h-1 flex-1" />
                          <span className="text-xs font-semibold text-slate-700">
                            {lead.score}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          R$ {(lead.valor_estimado || 0).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-slate-500">{lead.etapa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {leadsClassificados.length === 0 && (
          <div className="text-center py-8 text-purple-600">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma oportunidade para analisar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}