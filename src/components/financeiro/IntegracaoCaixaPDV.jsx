import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';

/**
 * V22.0 ETAPA 4 - Integração com Caixa PDV
 * Widget que conecta o módulo financeiro com o Caixa PDV
 */
export default function IntegracaoCaixaPDV() {
  const { openWindow } = useWindow();

  const funcionalidades = [
    '💰 Vendas PDV com múltiplos pagamentos',
    '📄 Liquidar Contas a Receber de outros vendedores',
    '💚 Receber títulos pendentes com NF-e automática',
    '💸 Pagar fornecedores direto do caixa',
    '🎯 Controle multi-operador',
    '📊 Integração total com Caixa Central'
  ];

  return (
    <Card className="border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Caixa PDV Completo V22.0
            </h3>
            <Badge className="bg-emerald-600 text-white">
              Integração com Caixa Central
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {funcionalidades.map((func, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{func}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-emerald-300">
          <ArrowRight className="w-5 h-5 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Fluxo Integrado</p>
            <p className="text-xs text-slate-600">
              PDV → Caixa Central → Conciliação → Auditoria
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => {
              const CaixaPDVCompleto = React.lazy(() => import('./CaixaPDVCompleto'));
              openWindow(
                CaixaPDVCompleto,
                { windowMode: true },
                {
                  title: '💰 Caixa PDV Completo V22.0',
                  width: 1500,
                  height: 850,
                  uniqueKey: 'caixa-pdv-completo'
                }
              );
            }}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Abrir Caixa PDV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}