import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, DollarSign, Zap } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 3: Integração Estoque-Financeiro via Entrega
 * Demonstra automações completas
 */

export default function IntegracaoEstoqueFinanceiro({ entrega_id }) {
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const executarIntegracao = async () => {
    setProcessando(true);

    try {
      const res = await base44.functions.invoke('automacaoEntregaCompleta', {
        entrega_id
      });

      setResultado(res.data);
      toast.success('Integração executada com sucesso!');
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Card className="w-full border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Zap className="w-5 h-5" />
          Integração Automática
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Ao confirmar a entrega, o sistema automaticamente:
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            <span>Dá baixa no estoque (MovimentacaoEstoque)</span>
            <Badge className="bg-green-600 ml-auto">Auto</Badge>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span>Registra custo de frete (ContaPagar)</span>
            <Badge className="bg-blue-600 ml-auto">Auto</Badge>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>Notifica o cliente via email</span>
            <Badge className="bg-purple-600 ml-auto">Auto</Badge>
          </div>
        </div>

        <Button
          onClick={executarIntegracao}
          disabled={processando}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {processando ? '⚙️ Processando...' : '▶️ Executar Integração'}
        </Button>

        {/* Resultado */}
        {resultado && (
          <div className="bg-green-50 border border-green-300 p-3 rounded text-sm">
            <p className="font-medium text-green-800 mb-2">✅ Ações Executadas:</p>
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