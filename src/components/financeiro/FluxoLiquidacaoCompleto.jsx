import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle } from 'lucide-react';

/**
 * V22.0 ETAPA 4 - Fluxo de Liquidação Completo
 * Diagrama visual do fluxo completo de liquidação
 */
export default function FluxoLiquidacaoCompleto() {
  const etapas = [
    {
      numero: 1,
      titulo: 'Seleção de Títulos',
      descricao: 'Selecionar contas a receber/pagar pendentes',
      status: 'completo'
    },
    {
      numero: 2,
      titulo: 'Envio para Caixa',
      descricao: 'Criar ordem de liquidação no caixa central',
      status: 'completo'
    },
    {
      numero: 3,
      titulo: 'Registro Completo',
      descricao: 'Forma, bandeira, taxa, autorização',
      status: 'completo'
    },
    {
      numero: 4,
      titulo: 'Estágio: Caixa',
      descricao: 'Registrar data recebido no caixa',
      status: 'completo'
    },
    {
      numero: 5,
      titulo: 'Estágio: Banco',
      descricao: 'Registrar data compensado no banco',
      status: 'completo'
    },
    {
      numero: 6,
      titulo: 'Conciliação',
      descricao: 'Conciliar com extrato bancário',
      status: 'completo'
    },
    {
      numero: 7,
      titulo: 'Auditoria',
      descricao: 'Registro automático em AuditLog',
      status: 'completo'
    }
  ];

  return (
    <Card className="border-2 border-blue-400">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-lg">Fluxo de Liquidação V22.0</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {etapas.map((etapa, idx) => (
            <div key={idx}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {etapa.numero}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-900">{etapa.titulo}</h4>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-sm text-slate-600">{etapa.descricao}</p>
                  <Badge className="bg-green-600 text-white mt-2">
                    {etapa.status === 'completo' ? '✅ Implementado' : 'Pendente'}
                  </Badge>
                </div>
              </div>
              {idx < etapas.length - 1 && (
                <div className="ml-5 my-2">
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}