import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 4: Widget de Sugestão de Preço com IA
 * Precificação inteligente baseada em dados
 */

export default function WidgetSugestaoPrecoIA({ produto_id, preco_atual, custo_atual, onAplicar }) {
  const { empresaAtual } = useContextoVisual();
  const [analisando, setAnalisando] = useState(false);
  const [sugestao, setSugestao] = useState(null);

  const analisar = async () => {
    setAnalisando(true);
    try {
      const res = await base44.functions.invoke('sugerirPrecoProduto', {
        produto_id,
        empresa_id: empresaAtual?.id
      });
      setSugestao(res.data.sugestao);
      toast.success(res.data.mensagem);
    } catch (err) {
      toast.error('Erro na análise: ' + err.message);
    } finally {
      setAnalisando(false);
    }
  };

  const aplicarPreco = () => {
    if (onAplicar && sugestao) {
      onAplicar(sugestao.preco_sugerido);
      toast.success('Preço aplicado!');
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-green-600" />
          Sugestão de Preço IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!sugestao ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Preço Atual</p>
                <p className="text-xl font-bold">R$ {preco_atual?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Custo Atual</p>
                <p className="text-xl font-bold">R$ {custo_atual?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <Button 
              onClick={analisar} 
              disabled={analisando}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {analisando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Analisando mercado...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sugerir Preço Ótimo
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <p className="text-sm text-green-700 mb-1">Preço Sugerido</p>
              <p className="text-3xl font-bold text-green-900">
                R$ {sugestao.preco_sugerido?.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Margem: {sugestao.margem_sugerida?.toFixed(1)}%
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Justificativa:</p>
              <p className="text-sm text-slate-600">{sugestao.justificativa}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm">Elasticidade:</span>
              <Badge variant="outline">{sugestao.elasticidade}</Badge>
            </div>

            {sugestao.impacto_vendas && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  {sugestao.impacto_vendas}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={aplicarPreco} className="flex-1 bg-green-600 hover:bg-green-700">
                <DollarSign className="w-4 h-4 mr-2" />
                Aplicar Preço
              </Button>
              <Button variant="outline" onClick={() => setSugestao(null)}>
                Nova Análise
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}