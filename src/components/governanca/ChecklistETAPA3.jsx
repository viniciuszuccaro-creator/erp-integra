import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

/**
 * ETAPA 3: Checklist de Implementação
 * Visualização do progresso completo
 */

export default function ChecklistETAPA3() {
  const itens = [
    { grupo: 'Roteirização & POD', items: [
      { label: 'Otimização IA + Google Maps', completo: true },
      { label: 'Interface seleção entregas', completo: true },
      { label: 'Criação automática de Rota', completo: true },
      { label: 'POD Digital (Foto)', completo: true },
      { label: 'POD Digital (Assinatura)', completo: true },
      { label: 'POD Digital (Geolocalização)', completo: true },
      { label: 'POD Digital (Dados Recebedor)', completo: true }
    ]},
    { grupo: 'Integrações', items: [
      { label: 'Saída Estoque Automática', completo: true },
      { label: 'Custo Frete Financeiro', completo: true },
      { label: 'Notificação Cliente Email', completo: true },
      { label: 'Logística Reversa Estoque', completo: true },
      { label: 'Logística Reversa Financeiro', completo: true }
    ]},
    { grupo: 'Apps & Real-time', items: [
      { label: 'App Motorista Mobile-First', completo: true },
      { label: 'Lista Entregas Motorista', completo: true },
      { label: 'Navegação GPS', completo: true },
      { label: 'Portal Cliente Pedidos', completo: true },
      { label: 'Portal Cliente Financeiro', completo: true },
      { label: 'Portal Cliente Rastreamento', completo: true },
      { label: 'Updates Real-time WebSocket', completo: true }
    ]},
    { grupo: 'Componentização', items: [
      { label: 'Componentes pequenos (<200 linhas)', completo: true },
      { label: 'Hooks reutilizáveis', completo: true },
      { label: 'Helpers centralizados', completo: true },
      { label: 'Multi-empresa 100%', completo: true },
      { label: 'RBAC integrado', completo: true },
      { label: 'Auditoria completa', completo: true }
    ]}
  ];

  const totalItens = itens.reduce((sum, g) => sum + g.items.length, 0);
  const completos = itens.reduce((sum, g) => sum + g.items.filter(i => i.completo).length, 0);
  const percentual = Math.round((completos / totalItens) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Checklist ETAPA 3</span>
          <span className="text-2xl font-bold text-green-600">{percentual}%</span>
        </CardTitle>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {itens.map((grupo, gIdx) => (
          <div key={gIdx}>
            <p className="font-semibold text-sm text-slate-700 mb-2">{grupo.grupo}</p>
            <div className="space-y-1">
              {grupo.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  className="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded"
                >
                  {item.completo ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                  <span className={item.completo ? 'text-slate-900' : 'text-slate-400'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t text-center">
          <p className="text-sm font-medium text-green-700">
            ✅ {completos}/{totalItens} Requisitos Completos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}