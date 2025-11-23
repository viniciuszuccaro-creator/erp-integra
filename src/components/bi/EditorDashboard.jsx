import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Plus, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function EditorDashboard({ dashboardId }) {
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard_editor', dashboardId],
    queryFn: async () => {
      const lista = await base44.entities.DashboardBI.list();
      return lista.find(d => d.id === dashboardId);
    }
  });

  const [widgets, setWidgets] = useState(dashboard?.widgets || []);

  const salvarMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.DashboardBI.update(dashboardId, {
        widgets: dados.widgets,
        atualizado_em: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard_editor']);
      queryClient.invalidateQueries(['dashboards_bi']);
      toast.success('Dashboard salvo!');
    }
  });

  const adicionarWidget = (tipo) => {
    const novoWidget = {
      id: `widget-${Date.now()}`,
      tipo,
      titulo: `Novo ${tipo}`,
      posicao: { x: 0, y: 0, largura: 4, altura: 4 }
    };

    setWidgets([...widgets, novoWidget]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Editor de Dashboard
            </h1>
            <p className="text-sm text-slate-600">{dashboard?.nome_dashboard}</p>
          </div>

          <Button
            onClick={() => salvarMutation.mutate({ widgets })}
            disabled={salvarMutation.isPending}
            className="bg-blue-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="mb-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => adicionarWidget('KPI')}>
            <Plus className="w-4 h-4 mr-2" />
            KPI
          </Button>
          <Button variant="outline" size="sm" onClick={() => adicionarWidget('Gráfico Linha')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Gráfico Linha
          </Button>
          <Button variant="outline" size="sm" onClick={() => adicionarWidget('Gráfico Barra')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Gráfico Barra
          </Button>
          <Button variant="outline" size="sm" onClick={() => adicionarWidget('Gráfico Pizza')}>
            <PieChart className="w-4 h-4 mr-2" />
            Gráfico Pizza
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {widgets.map(widget => (
            <Card key={widget.id}>
              <CardHeader>
                <CardTitle className="text-sm">{widget.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{widget.tipo}</Badge>
              </CardContent>
            </Card>
          ))}

          {widgets.length === 0 && (
            <Card className="col-span-4">
              <CardContent className="p-12 text-center">
                <p className="text-slate-600">Adicione widgets ao dashboard</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}