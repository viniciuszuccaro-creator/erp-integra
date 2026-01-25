import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, MapPin, Clock } from 'lucide-react';

/**
 * ETAPA 3: Timeline visual de status da entrega
 * Componente reutilizável para apps e portal
 */

export default function StatusEntregaTimeline({ entrega }) {
  const historico = entrega?.historico_status || [];

  const statusOrdenado = [
    'Aguardando Separação',
    'Em Separação',
    'Pronto para Expedir',
    'Saiu para Entrega',
    'Em Trânsito',
    'Entregue'
  ];

  const statusAtual = entrega?.status;
  const indexAtual = statusOrdenado.indexOf(statusAtual);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Timeline de Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline Visual */}
        <div className="relative">
          {statusOrdenado.map((status, idx) => {
            const concluido = idx <= indexAtual;
            const itemHistorico = historico.find(h => h.status === status);

            return (
              <div key={status} className="flex items-start gap-3 mb-4 last:mb-0">
                {/* Indicador */}
                <div className="flex flex-col items-center">
                  {concluido ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300" />
                  )}
                  {idx < statusOrdenado.length - 1 && (
                    <div className={`w-0.5 h-8 ${concluido ? 'bg-green-600' : 'bg-slate-200'}`} />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 pb-4">
                  <p className={`font-medium ${concluido ? 'text-slate-900' : 'text-slate-400'}`}>
                    {status}
                  </p>
                  {itemHistorico && (
                    <>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(itemHistorico.data_hora).toLocaleString('pt-BR')}
                      </p>
                      {itemHistorico.observacao && (
                        <p className="text-xs text-slate-600 mt-1">{itemHistorico.observacao}</p>
                      )}
                      {itemHistorico.localizacao && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                          <MapPin className="w-3 h-3" />
                          {itemHistorico.localizacao.latitude?.toFixed(5)}, {itemHistorico.localizacao.longitude?.toFixed(5)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Atual Destacado */}
        <div className="bg-blue-50 border border-blue-300 p-3 rounded">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status Atual:</span>
            <Badge className="bg-blue-600">{statusAtual}</Badge>
          </div>
        </div>

        {/* Última Atualização */}
        {entrega?.rastreamento_ultima_atualizacao && (
          <p className="text-xs text-slate-500 text-center">
            Última atualização: {new Date(entrega.rastreamento_ultima_atualizacao).toLocaleString('pt-BR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}