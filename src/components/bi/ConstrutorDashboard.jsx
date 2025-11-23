import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Plus,
  Sparkles,
  Save,
  Eye,
  Grid3x3
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { toast } from 'sonner';

export default function ConstrutorDashboard() {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Personalizado');

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ['dashboards_bi'],
    queryFn: () => base44.entities.DashboardBI.list()
  });

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const criarDashboardMutation = useMutation({
    mutationFn: async (dados) => {
      return await base44.entities.DashboardBI.create({
        ...dados,
        usuario_id: user.id,
        widgets: [],
        kpis_principais: {},
        ia_insights: [],
        visibilidade: 'Privado',
        atualizado_em: new Date().toISOString()
      });
    },
    onSuccess: (novoDashboard) => {
      queryClient.invalidateQueries(['dashboards_bi']);
      toast.success('Dashboard criado!');
      abrirEditor(novoDashboard);
    }
  });

  const abrirEditor = (dashboard) => {
    openWindow(
      () => import('@/components/bi/EditorDashboard'),
      { dashboardId: dashboard.id },
      {
        title: `Editor: ${dashboard.nome_dashboard}`,
        width: 1400,
        height: 900
      }
    );
  };

  const abrirVisualizacao = (dashboard) => {
    openWindow(
      () => import('@/components/bi/VisualizadorDashboard'),
      { dashboardId: dashboard.id },
      {
        title: dashboard.nome_dashboard,
        width: 1400,
        height: 900
      }
    );
  };

  const handleCriar = () => {
    if (!nome.trim()) {
      toast.error('Digite um nome para o dashboard');
      return;
    }

    criarDashboardMutation.mutate({
      nome_dashboard: nome,
      tipo_dashboard: tipo
    });
  };

  const tiposDashboard = [
    { tipo: 'Operacional', icon: Activity, cor: 'blue' },
    { tipo: 'Executivo', icon: TrendingUp, cor: 'purple' },
    { tipo: 'Financeiro', icon: BarChart3, cor: 'green' },
    { tipo: 'Produção', icon: Grid3x3, cor: 'orange' },
    { tipo: 'Personalizado', icon: Sparkles, cor: 'indigo' }
  ];

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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Business Intelligence & Analytics
        </h1>
        <p className="text-sm text-slate-600">
          Etapa 12 - Dashboards Personalizados com IA
        </p>
      </div>

      <div className="flex-1 overflow-auto space-y-6">
        {/* Criar Novo Dashboard */}
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Plus className="w-5 h-5" />
              Criar Novo Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Nome do Dashboard..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="col-span-2"
              />

              <Button
                onClick={handleCriar}
                disabled={criarDashboardMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Criar
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {tiposDashboard.map(t => (
                <button
                  key={t.tipo}
                  onClick={() => setTipo(t.tipo)}
                  className={`p-3 border-2 rounded-lg transition-all ${
                    tipo === t.tipo 
                      ? `border-${t.cor}-500 bg-${t.cor}-50` 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <t.icon className={`w-6 h-6 mx-auto mb-1 ${
                    tipo === t.tipo ? `text-${t.cor}-600` : 'text-slate-400'
                  }`} />
                  <p className={`text-xs font-medium ${
                    tipo === t.tipo ? `text-${t.cor}-900` : 'text-slate-600'
                  }`}>
                    {t.tipo}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dashboards Existentes */}
        <div className="grid grid-cols-3 gap-4">
          {dashboards.map(dashboard => (
            <Card key={dashboard.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{dashboard.nome_dashboard}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{dashboard.tipo_dashboard}</p>
                  </div>

                  <Badge variant="secondary">
                    {dashboard.widgets?.length || 0} widgets
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* IA Insights */}
                {dashboard.ia_insights?.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">
                        {dashboard.ia_insights.length} Insights da IA
                      </span>
                    </div>
                    <p className="text-xs text-purple-800">
                      {dashboard.ia_insights[0].titulo}
                    </p>
                  </div>
                )}

                {/* KPIs Preview */}
                {dashboard.kpis_principais && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {dashboard.kpis_principais.financeiro?.faturamento_mes && (
                      <div className="bg-slate-50 p-2 rounded">
                        <p className="text-slate-600">Faturamento</p>
                        <p className="font-semibold">
                          R$ {(dashboard.kpis_principais.financeiro.faturamento_mes / 1000).toFixed(0)}k
                        </p>
                      </div>
                    )}
                    {dashboard.kpis_principais.producao?.ops_abertas && (
                      <div className="bg-slate-50 p-2 rounded">
                        <p className="text-slate-600">OPs Abertas</p>
                        <p className="font-semibold">
                          {dashboard.kpis_principais.producao.ops_abertas}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => abrirVisualizacao(dashboard)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => abrirEditor(dashboard)}
                    className="flex-1 bg-blue-600"
                  >
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {dashboards.length === 0 && (
            <Card className="col-span-3">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  Nenhum dashboard criado ainda
                </p>
                <p className="text-sm text-slate-500">
                  Crie seu primeiro dashboard personalizado acima
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}