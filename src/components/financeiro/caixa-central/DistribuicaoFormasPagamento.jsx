import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <p className="text-slate-600 text-sm">Carregando...</p>
    </div>
  </div>
);

function DistribuicaoFormasPagamentoContent({ porForma }) {
  return (
    <Card>
      <CardHeader className="py-2">
        <CardTitle className="text-base">Distribuição por Forma de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(porForma).map(([forma, valores]) => (
            <div key={forma} className="p-2 border rounded-lg bg-slate-50">
              <p className="font-semibold text-slate-900 mb-1 text-sm">{forma}</p>
              <div className="space-y-0.5 text-xs">
                <p className="text-green-600">+ R$ {valores.receber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-red-600">- R$ {valores.pagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="font-semibold text-blue-600">
                  = R$ {(valores.receber - valores.pagar).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DistribuicaoFormasPagamento(props) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DistribuicaoFormasPagamentoContent {...props} />
    </Suspense>
  );
}