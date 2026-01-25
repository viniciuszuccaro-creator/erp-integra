import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Package, DollarSign, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 3: Widget de Automação de Entrega
 * Demonstra e executa todas as automações de uma entrega
 */

export default function AutomacaoEntregaWidget({ entrega_id, compact = false }) {
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const executar = async () => {
    setExecutando(true);
    try {
      const res = await base44.functions.invoke('automacaoEntregaCompleta', {
        entrega_id
      });
      setResultado(res.data);
      toast.success('✅ Automações executadas!');
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setExecutando(false);
    }
  };

  if (compact) {
    return (
      <Button
        onClick={executar}
        disabled={executando}
        size="sm"
        className="bg-purple-600 hover:bg-purple-700"
      >
        {executando ? (
          <Loader2 className="w-3 h-3 animate-spin mr-1" />
        ) : (
          <Zap className="w-3 h-3 mr-1" />
        )}
        Auto
      </Button>
    );
  }

  return (
    <Card className="w-full border-l-4 border-l-purple-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-600" />
          Automação Completa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
            <Package className="w-3 h-3 text-green-600" />
            <span>Saída de Estoque</span>
            <CheckCircle2 className="w-3 h-3 text-green-600 ml-auto" />
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
            <DollarSign className="w-3 h-3 text-blue-600" />
            <span>Custo de Frete</span>
            <CheckCircle2 className="w-3 h-3 text-blue-600 ml-auto" />
          </div>
          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
            <Mail className="w-3 h-3 text-purple-600" />
            <span>Notificação Cliente</span>
            <CheckCircle2 className="w-3 h-3 text-purple-600 ml-auto" />
          </div>
        </div>

        <Button
          onClick={executar}
          disabled={executando}
          className="w-full bg-purple-600 hover:bg-purple-700"
          size="sm"
        >
          {executando ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
              Executando...
            </>
          ) : (
            <>
              <Zap className="w-3 h-3 mr-2" />
              Executar Todas
            </>
          )}
        </Button>

        {resultado && (
          <div className="bg-green-50 border border-green-300 p-2 rounded text-xs">
            <p className="font-medium text-green-800 mb-1">✅ Concluído:</p>
            <ul className="space-y-1 text-green-700">
              {resultado.acoes_executadas?.map((acao, i) => (
                <li key={i}>• {acao}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}