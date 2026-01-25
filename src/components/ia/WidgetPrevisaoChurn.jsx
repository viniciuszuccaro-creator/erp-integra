import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { TrendingDown, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 4: Widget de Previsão de Churn
 * Análise preditiva de risco de perda de cliente
 */

export default function WidgetPrevisaoChurn({ cliente_id, risco_atual, onAtualizado }) {
  const [analisando, setAnalisando] = useState(false);
  const [analise, setAnalise] = useState(null);

  const analisar = async () => {
    setAnalisando(true);
    try {
      const res = await base44.functions.invoke('preverChurnCliente', { cliente_id });
      setAnalise(res.data.analise);
      toast.success(res.data.mensagem);
      if (onAtualizado) onAtualizado(res.data.analise);
    } catch (err) {
      toast.error('Erro na análise: ' + err.message);
    } finally {
      setAnalisando(false);
    }
  };

  const riscoColor = {
    'Baixo': 'bg-green-100 text-green-800 border-green-300',
    'Médio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Alto': 'bg-orange-100 text-orange-800 border-orange-300',
    'Crítico': 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            Previsão de Churn
          </div>
          {risco_atual && (
            <Badge className={riscoColor[risco_atual] || 'bg-slate-100'}>
              {risco_atual}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analise ? (
          <Button 
            onClick={analisar} 
            disabled={analisando}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {analisando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analisando com IA...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Analisar Risco
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Risco de Churn:</span>
              <Badge className={riscoColor[analise.risco_churn] || 'bg-slate-100'}>
                {analise.risco_churn}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Probabilidade:</span>
              <span className="text-xl font-bold text-orange-600">
                {analise.probabilidade_churn}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium">Saúde:</span>
              <span className="text-xl font-bold text-green-600">
                {analise.score_saude}/100
              </span>
            </div>

            {analise.motivos && analise.motivos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Motivos Principais:</p>
                <ul className="space-y-1">
                  {analise.motivos.slice(0, 3).map((motivo, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      <span>{motivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analise.acoes_recomendadas && analise.acoes_recomendadas.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Ações Recomendadas:</p>
                <ul className="space-y-1">
                  {analise.acoes_recomendadas.slice(0, 3).map((acao, idx) => (
                    <li key={idx} className="text-sm text-blue-600 flex items-start gap-2">
                      <span>✓</span>
                      <span>{acao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              variant="outline" 
              onClick={analisar}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Análise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}