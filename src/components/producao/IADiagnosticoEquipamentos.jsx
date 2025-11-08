import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, CheckCircle, Settings, Activity } from 'lucide-react';

/**
 * IA de Diagnóstico de Equipamentos
 * Detecta anomalias e prevê manutenções
 */
export default function IADiagnosticoEquipamentos({ equipamentos = [] }) {
  const [analises, setAnalises] = useState([
    {
      equipamento: 'Máquina de Corte CNC #1',
      status: 'normal',
      temperatura_celsius: 65,
      temperatura_limite: 85,
      vibracao_hz: 45,
      vibracao_limite: 60,
      tempo_uso_horas: 1240,
      proxima_manutencao_horas: 1500,
      alerta: null
    },
    {
      equipamento: 'Dobradeira Hidráulica #2',
      status: 'atencao',
      temperatura_celsius: 78,
      temperatura_limite: 85,
      vibracao_hz: 58,
      vibracao_limite: 60,
      tempo_uso_horas: 1480,
      proxima_manutencao_horas: 1500,
      alerta: {
        tipo: 'manutencao_proxima',
        mensagem: 'Manutenção preventiva próxima (20h restantes)',
        prioridade: 'media'
      }
    },
    {
      equipamento: 'Máquina de Solda #3',
      status: 'critico',
      temperatura_celsius: 92,
      temperatura_limite: 85,
      vibracao_hz: 65,
      vibracao_limite: 60,
      tempo_uso_horas: 1520,
      proxima_manutencao_horas: 1500,
      alerta: {
        tipo: 'temperatura_alta',
        mensagem: 'Temperatura acima do limite! Risco de falha.',
        prioridade: 'alta'
      }
    }
  ]);

  const equipamentosCriticos = analises.filter(a => a.status === 'critico').length;
  const equipamentosAtencao = analises.filter(a => a.status === 'atencao').length;
  const equipamentosNormais = analises.filter(a => a.status === 'normal').length;

  const statusConfig = {
    normal: { cor: 'green', icone: CheckCircle, bgClass: 'bg-green-50', borderClass: 'border-green-300' },
    atencao: { cor: 'orange', icone: AlertTriangle, bgClass: 'bg-orange-50', borderClass: 'border-orange-300' },
    critico: { cor: 'red', icone: AlertTriangle, bgClass: 'bg-red-50', borderClass: 'border-red-300' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            IA de Diagnóstico de Equipamentos
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Monitoramento preditivo com sensores IoT
          </p>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{equipamentosNormais}</p>
            <p className="text-xs text-green-700">Normais</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{equipamentosAtencao}</p>
            <p className="text-xs text-orange-700">Atenção</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2 animate-pulse" />
            <p className="text-2xl font-bold text-red-900">{equipamentosCriticos}</p>
            <p className="text-xs text-red-700">Críticos</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Equipamentos */}
      <div className="space-y-3">
        {analises.map((analise, idx) => {
          const config = statusConfig[analise.status];
          const Icon = config.icone;

          return (
            <Card key={idx} className={`border ${config.borderClass} ${config.bgClass}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Icon className={`w-6 h-6 text-${config.cor}-600 mt-1`} />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-900">{analise.equipamento}</p>
                      <Badge className={`bg-${config.cor}-600`}>
                        {analise.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                      <div>
                        <p className="text-slate-600">Temperatura</p>
                        <p className={`font-semibold ${
                          analise.temperatura_celsius > analise.temperatura_limite 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {analise.temperatura_celsius}°C / {analise.temperatura_limite}°C
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Vibração</p>
                        <p className={`font-semibold ${
                          analise.vibracao_hz > analise.vibracao_limite 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {analise.vibracao_hz} Hz / {analise.vibracao_limite} Hz
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Próxima Manutenção</p>
                        <p className="font-semibold text-blue-600">
                          {analise.proxima_manutencao_horas - analise.tempo_uso_horas}h restantes
                        </p>
                      </div>
                    </div>

                    {analise.alerta && (
                      <Alert className={`${config.borderClass} ${config.bgClass}`}>
                        <AlertTriangle className={`w-4 h-4 text-${config.cor}-600`} />
                        <AlertDescription className="text-xs">
                          <p className="font-semibold">{analise.alerta.mensagem}</p>
                          <p className="mt-1">
                            💡 Sugestão: Agendar manutenção preventiva imediatamente
                          </p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <Activity className="w-4 h-4 inline mr-1" />
          <strong>Funcionalidade Futura:</strong> Integração com sensores IoT reais para monitoramento em tempo real de temperatura, vibração e outras métricas dos equipamentos.
        </p>
      </div>
    </div>
  );
}