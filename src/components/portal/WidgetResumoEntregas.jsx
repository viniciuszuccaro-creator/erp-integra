import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Widget Resumo Entregas
 * Para Portal do Cliente
 */

export default function WidgetResumoEntregas() {
  const { user } = useUser();

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-cliente', user?.id],
    queryFn: async () => {
      const cliente = await base44.entities.Cliente.filter({ 
        portal_usuario_id: user?.id 
      });
      if (cliente.length === 0) return [];
      
      return base44.entities.Entrega.filter({ 
        cliente_id: cliente[0].id 
      }, '-created_date', 20);
    },
    enabled: !!user
  });

  const stats = {
    total: entregas.length,
    emTransito: entregas.filter(e => e.status === 'Em Trânsito').length,
    entregues: entregas.filter(e => e.status === 'Entregue').length,
    aguardando: entregas.filter(e => ['Aguardando Separação', 'Em Separação', 'Pronto para Expedir'].includes(e.status)).length
  };

  const metricas = [
    { label: 'Total', valor: stats.total, icon: Truck, cor: 'blue' },
    { label: 'Em Trânsito', valor: stats.emTransito, icon: Package, cor: 'purple' },
    { label: 'Entregues', valor: stats.entregues, icon: CheckCircle2, cor: 'green' },
    { label: 'Aguardando', valor: stats.aguardando, icon: Clock, cor: 'orange' }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          Minhas Entregas
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {metricas.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className={`p-3 bg-${m.cor}-50 rounded-lg border border-${m.cor}-200`}>
                <Icon className={`w-5 h-5 text-${m.cor}-600 mb-1`} />
                <p className={`text-2xl font-bold text-${m.cor}-700`}>{m.valor}</p>
                <p className="text-xs text-slate-600">{m.label}</p>
              </div>
            );
          })}
        </div>

        {stats.emTransito > 0 && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <Package className="w-4 h-4" />
              {stats.emTransito} entrega(s) a caminho!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}