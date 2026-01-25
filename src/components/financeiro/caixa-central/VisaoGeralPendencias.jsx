import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Loader2 } from 'lucide-react';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <p className="text-slate-600 text-sm">Carregando...</p>
    </div>
  </div>
);

function VisaoGeralPendenciasContent({ contasReceber = [], contasPagar = [], onSelectItem = () => {} }) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Contas a Receber Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-auto">
            {contasReceber.slice(0, 10).map((conta) => (
              <div 
                key={conta.id} 
                className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                onClick={() => onSelectItem(conta)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">{conta.descricao}</p>
                  <p className="text-xs text-slate-600">{conta.cliente || 'Cliente não informado'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
            {contasReceber.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Nenhuma conta a receber pendente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            Contas a Pagar Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-auto">
            {contasPagar.slice(0, 10).map((conta) => (
              <div 
                key={conta.id} 
                className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                onClick={() => onSelectItem(conta)}
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">{conta.descricao}</p>
                  <p className="text-xs text-slate-600">{conta.fornecedor || 'Fornecedor não informado'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">
                    R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
            {contasPagar.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">Nenhuma conta a pagar pendente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VisaoGeralPendencias(props) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VisaoGeralPendenciasContent {...props} />
    </Suspense>
  );
}