import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * ETAPA 3: Widget Integração Financeiro
 * Status da integração com contas a pagar
 */

export default function WidgetIntegracaoFinanceiro({ entrega, pedido }) {
  const valorFrete = pedido?.valor_frete || 0;
  const custoReal = entrega?.custo_operacional || 0;
  const diferencaEconomia = valorFrete - custoReal;
  const status = entrega?.status === 'Entregue' ? 'registrado' : 'pendente';

  return (
    <Card className="w-full border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Integração Financeiro
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-slate-600">Frete Cobrado</p>
            <p className="text-lg font-bold text-green-700">
              R$ {valorFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-slate-600">Custo Real</p>
            <p className="text-lg font-bold text-blue-700">
              R$ {custoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {diferencaEconomia > 0 && (
          <div className="p-2 bg-green-100 border border-green-300 rounded flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-green-800 font-medium">Economia</p>
              <p className="text-sm font-bold text-green-700">
                R$ {diferencaEconomia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          {status === 'registrado' ? (
            <Badge className="bg-green-600 w-full justify-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Custo Registrado
            </Badge>
          ) : (
            <Badge variant="outline" className="w-full justify-center border-orange-300 text-orange-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Aguardando Confirmação
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}