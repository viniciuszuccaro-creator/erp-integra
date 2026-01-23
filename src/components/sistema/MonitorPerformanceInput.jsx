import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * V22.0 - Monitor de Performance de Input
 * Mede latência real entre eventos de teclado e onChange
 */
export default function MonitorPerformanceInput() {
  const [measurements, setMeasurements] = useState([]);
  const [testValue, setTestValue] = useState('');
  const lastKeydownRef = useRef(null);

  const handleKeyDown = () => {
    lastKeydownRef.current = performance.now();
  };

  const handleChange = (e) => {
    const changeTime = performance.now();
    const latency = lastKeydownRef.current 
      ? changeTime - lastKeydownRef.current 
      : 0;

    setTestValue(e.target.value);

    if (latency > 0) {
      setMeasurements(prev => [...prev.slice(-19), {
        timestamp: new Date().toISOString(),
        latency: latency.toFixed(2),
        value: e.target.value,
        status: latency > 50 ? 'alto' : latency > 20 ? 'medio' : 'bom'
      }]);
    }
  };

  const latenciaMedia = measurements.length > 0
    ? (measurements.reduce((sum, m) => sum + parseFloat(m.latency), 0) / measurements.length).toFixed(2)
    : 0;

  const latenciaMax = measurements.length > 0
    ? Math.max(...measurements.map(m => parseFloat(m.latency))).toFixed(2)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Monitor de Performance - Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-semibold mb-2">
            🧪 Campo de Teste
          </p>
          <Input
            value={testValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite aqui para medir latência..."
            className="bg-white"
          />
          <p className="text-xs text-blue-700 mt-2">
            Digite naturalmente. A latência entre tecla pressionada e onChange será medida.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <p className="text-xs text-green-700">Medições</p>
              <p className="text-2xl font-bold text-green-900">{measurements.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3">
              <p className="text-xs text-yellow-700">Média (ms)</p>
              <p className="text-2xl font-bold text-yellow-900">{latenciaMedia}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <p className="text-xs text-red-700">Máxima (ms)</p>
              <p className="text-2xl font-bold text-red-900">{latenciaMax}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 max-h-64 overflow-auto">
          <p className="text-sm font-semibold text-slate-700">Últimas Medições:</p>
          {measurements.length === 0 && (
            <p className="text-sm text-slate-500 italic">Nenhuma medição ainda. Digite no campo acima.</p>
          )}
          {measurements.slice().reverse().map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
              <span className="text-slate-600">
                {new Date(m.timestamp).toLocaleTimeString('pt-BR')}
              </span>
              <span className="font-mono text-slate-900">{m.value.slice(-10)}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{m.latency}ms</span>
                {m.status === 'bom' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {m.status === 'medio' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                {m.status === 'alto' && <AlertTriangle className="w-4 h-4 text-red-600" />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-100 rounded-lg text-xs space-y-1">
          <p className="font-semibold text-slate-900">📏 Referência de Latência:</p>
          <div className="space-y-1 ml-4">
            <p className="text-green-700">✅ {'<'} 20ms: Excelente (imperceptível)</p>
            <p className="text-yellow-700">⚠️ 20-50ms: Aceitável (leve delay)</p>
            <p className="text-red-700">❌ {'>'} 50ms: Problemático (interfere na digitação)</p>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={() => setMeasurements([])}
          className="w-full"
        >
          Limpar Medições
        </Button>
      </CardContent>
    </Card>
  );
}