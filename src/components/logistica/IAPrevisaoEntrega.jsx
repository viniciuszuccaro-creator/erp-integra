import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, AlertTriangle } from 'lucide-react';

/**
 * ETAPA 3: IA Previsão de Entrega
 * Analisa histórico e prevê tempo real
 */

export default function IAPrevisaoEntrega({ entrega }) {
  const { data: previsao, isLoading } = useQuery({
    queryKey: ['ia-previsao', entrega.id],
    queryFn: async () => {
      // Buscar histórico de entregas similares
      const historico = await base44.entities.Entrega.filter({
        transportadora_id: entrega.transportadora_id,
        status: 'Entregue',
        'endereco_entrega_completo.cidade': entrega.endereco_entrega_completo?.cidade
      }, '-data_entrega', 20);

      if (historico.length === 0) {
        return {
          tempo_estimado_min: 60,
          confianca: 'Baixa',
          fatores: ['Sem histórico']
        };
      }

      // Calcular média
      const tempos = historico
        .filter(e => e.data_saida && e.data_entrega)
        .map(e => {
          const diff = new Date(e.data_entrega) - new Date(e.data_saida);
          return diff / (1000 * 60); // minutos
        });

      const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;

      return {
        tempo_estimado_min: Math.round(media),
        confianca: tempos.length >= 10 ? 'Alta' : tempos.length >= 5 ? 'Média' : 'Baixa',
        fatores: [
          `${tempos.length} entregas analisadas`,
          `Mesma região: ${entrega.endereco_entrega_completo?.cidade}`,
          `Transportadora: ${entrega.transportadora || 'Própria'}`
        ]
      };
    },
    enabled: !!entrega.id
  });

  if (isLoading) return null;

  const horas = Math.floor((previsao?.tempo_estimado_min || 0) / 60);
  const minutos = (previsao?.tempo_estimado_min || 0) % 60;

  return (
    <Card className="w-full border-l-4 border-l-purple-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          Previsão IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-purple-700">
              {horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`}
            </p>
            <p className="text-xs text-slate-600">Tempo Estimado</p>
          </div>
          <Clock className="w-8 h-8 text-purple-300" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Confiança:</span>
          <Badge className={
            previsao?.confianca === 'Alta' ? 'bg-green-600' :
            previsao?.confianca === 'Média' ? 'bg-yellow-600' : 'bg-orange-600'
          }>
            {previsao?.confianca}
          </Badge>
        </div>

        <div className="space-y-1">
          {previsao?.fatores?.map((fator, idx) => (
            <p key={idx} className="text-xs text-slate-600 flex items-center gap-1">
              • {fator}
            </p>
          ))}
        </div>

        {previsao?.confianca === 'Baixa' && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-2 flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-yellow-700 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Poucos dados históricos. Previsão pode ser imprecisa.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}