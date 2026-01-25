import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Target, Flame, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 4: Widget de Prioridade de Lead
 * Score e temperatura da oportunidade com IA
 */

export default function WidgetPrioridadeLead({ oportunidade_id, onAtualizado }) {
  const [analisando, setAnalisando] = useState(false);
  const [previsao, setPrevisao] = useState(null);

  const analisar = async () => {
    setAnalisando(true);
    try {
      const res = await base44.functions.invoke('preverVendasOportunidade', { oportunidade_id });
      setPrevisao(res.data.previsao);
      toast.success(res.data.mensagem);
      if (onAtualizado) onAtualizado(res.data.previsao);
    } catch (err) {
      toast.error('Erro na análise: ' + err.message);
    } finally {
      setAnalisando(false);
    }
  };

  const tempColor = {
    'Frio': 'bg-blue-100 text-blue-800 border-blue-300',
    'Morno': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Quente': 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-purple-600" />
          Prioridade do Lead
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!previsao ? (
          <Button 
            onClick={analisar} 
            disabled={analisando}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {analisando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analisando lead...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analisar com IA
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
              <div className="flex-1">
                <p className="text-sm text-purple-700">Score do Lead</p>
                <p className="text-4xl font-bold text-purple-900">{previsao.score}</p>
                <p className="text-xs text-purple-600 mt-1">de 100 pontos</p>
              </div>
              <Target className="w-12 h-12 text-purple-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Temperatura</p>
                <Badge className={`mt-1 ${tempColor[previsao.temperatura]}`}>
                  <Flame className="w-3 h-3 mr-1" />
                  {previsao.temperatura}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Probabilidade</p>
                <p className="text-2xl font-bold text-green-600">{previsao.probabilidade}%</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">📅 Previsão de Fechamento</p>
              <p className="text-sm text-blue-700">
                {previsao.previsao_fechamento_dias} dias
              </p>
            </div>

            {previsao.motivos_score && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium mb-1">Análise:</p>
                <p className="text-sm text-slate-600">{previsao.motivos_score}</p>
              </div>
            )}

            {previsao.proximos_passos && previsao.proximos_passos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">🎯 Próximos Passos:</p>
                <ul className="space-y-1">
                  {previsao.proximos_passos.map((passo, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{passo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" onClick={analisar} className="w-full">
              <Zap className="w-4 h-4 mr-2" />
              Reanalisar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}