import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

/**
 * WIZARD FLUXO COMERCIAL - Dashboard visual BPMN
 * ETAPA 2: Visualização de progresso do fluxo
 */

export default function WizardFluxoComercial({ fluxo = {} }) {
  const etapas = [
    { id: 'oportunidade', label: 'Oportunidade', status: fluxo.etapa_atual === 'oportunidade' },
    { id: 'orcamento', label: 'Orçamento', status: fluxo.etapa_atual === 'orcamento' },
    { id: 'pedido', label: 'Pedido', status: fluxo.etapa_atual === 'pedido' },
    { id: 'nf', label: 'Nota Fiscal', status: fluxo.etapa_atual === 'nf' },
    { id: 'comissao', label: 'Comissão', status: fluxo.etapa_atual === 'comissao' }
  ];

  const getStatusIcon = (stage) => {
    if (fluxo.etapas_completas?.includes(stage)) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (fluxo.etapa_atual === stage) return <Clock className="w-5 h-5 text-blue-600" />;
    return <AlertCircle className="w-5 h-5 text-slate-400" />;
  };

  const percentualConclusao = fluxo.etapas_completas ? (fluxo.etapas_completas.length / etapas.length) * 100 : 0;

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl">
      <h2 className="text-xl font-bold text-slate-900">Fluxo Comercial</h2>

      {/* Barra de Progresso */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Progresso</span>
          <span className="font-bold text-blue-600">{Math.round(percentualConclusao)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${percentualConclusao}%` }}
          />
        </div>
      </div>

      {/* Etapas Visuais */}
      <div className="flex items-center justify-between gap-2">
        {etapas.map((etapa, idx) => (
          <div key={etapa.id} className="flex items-center flex-1">
            <Card className={`flex-1 border-2 ${
              fluxo.etapas_completas?.includes(etapa.id) ? 'border-green-300 bg-green-50' :
              fluxo.etapa_atual === etapa.id ? 'border-blue-300 bg-blue-50' :
              'border-slate-200 bg-white'
            }`}>
              <CardContent className="pt-4 flex flex-col items-center gap-2">
                {getStatusIcon(etapa.id)}
                <span className="text-xs font-semibold text-center">{etapa.label}</span>
              </CardContent>
            </Card>
            {idx < etapas.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Status Atual */}
      {fluxo.etapa_atual && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-4 text-sm">
            <span className="text-slate-600">Etapa Atual:</span>
            <Badge className="ml-2 bg-blue-600">
              {etapas.find(e => e.id === fluxo.etapa_atual)?.label}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}