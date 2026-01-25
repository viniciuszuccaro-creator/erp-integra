import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

/**
 * ETAPA 3: Timeline Visual de Entrega
 * Componente simplificado para portal cliente
 */

export default function TimelineEntregaVisual({ entrega }) {
  const etapas = [
    { status: 'Aguardando Separação', label: 'Separação' },
    { status: 'Pronto para Expedir', label: 'Pronto' },
    { status: 'Saiu para Entrega', label: 'Saiu' },
    { status: 'Em Trânsito', label: 'Em Trânsito' },
    { status: 'Entregue', label: 'Entregue' }
  ];

  const statusIndex = {
    'Aguardando Separação': 0,
    'Em Separação': 0,
    'Pronto para Expedir': 1,
    'Saiu para Entrega': 2,
    'Em Trânsito': 3,
    'Entregue': 4,
    'Cancelado': -1
  };

  const indiceAtual = statusIndex[entrega.status] ?? 0;

  if (entrega.status === 'Cancelado') {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center">
          <Badge className="bg-red-600 text-lg px-6 py-2">
            ❌ Entrega Cancelada
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Status da Entrega</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {etapas.map((etapa, idx) => {
            const completo = idx < indiceAtual;
            const atual = idx === indiceAtual;
            const pendente = idx > indiceAtual;

            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {completo && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                  {atual && <Clock className="w-6 h-6 text-blue-600 animate-pulse" />}
                  {pendente && <Circle className="w-6 h-6 text-slate-300" />}
                </div>

                <div className="flex-1">
                  <p className={`font-medium text-sm ${
                    completo ? 'text-green-700' :
                    atual ? 'text-blue-700' :
                    'text-slate-400'
                  }`}>
                    {etapa.label}
                  </p>
                  {atual && (
                    <p className="text-xs text-blue-600">Em andamento</p>
                  )}
                  {completo && (
                    <p className="text-xs text-green-600">✓ Concluído</p>
                  )}
                </div>

                {atual && (
                  <Badge className="bg-blue-600 text-xs">Atual</Badge>
                )}
              </div>
            );
          })}
        </div>

        {entrega.data_previsao && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-slate-600 text-center">
              Previsão: {new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}