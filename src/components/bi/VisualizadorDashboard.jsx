import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Package,
  Users,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VisualizadorDashboard({ dashboardId }) {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard_bi', dashboardId],
    queryFn: async () => {
      const dashboards = await base44.entities.DashboardBI.list();
      return dashboards.find(d => d.id === dashboardId);
    }
  });

  // Dados mockados para exemplo
  const dadosVendas = [
    { mes: 'Jan', valor: 120000 },
    { mes: 'Fev', valor: 145000 },
    { mes: 'Mar', valor: 162000 },
    { mes: 'Abr', valor: 155000 },
    { mes: 'Mai', valor: 178000 },
    { mes: 'Jun', valor: 195000 }
  ];

  const dadosProdutos = [
    { nome: 'Armado', valor: 45 },
    { nome: 'Corte/Dobra', valor: 30 },
    { nome: 'Revenda', valor: 25 }
  ];

  const CORES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{dashboard.nome_dashboard}</h1>
            <p className="text-sm text-slate-600">{dashboard.tipo_dashboard}</p>
          </div>
          <Badge variant="secondary">
            Atualizado: {new Date(dashboard.atualizado_em).toLocaleDateString('pt-BR')}
          </Badge>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          {/* KPIs Principais */}
          <Card className="col-span-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-slate-600">Faturamento Mês</p>
              <p className="text-3xl font-bold text-slate-900">
                R$ {((dashboard.kpis_principais?.financeiro?.faturamento_mes || 195000) / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-green-600 mt-1">+12.5% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardContent className="p-6">
              <Package className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-600">OPs Abertas</p>
              <p className="text-3xl font-bold text-slate-900">
                {dashboard.kpis_principais?.producao?.ops_abertas || 42}
              </p>
              <p className="text-xs text-blue-600 mt-1">18 em andamento</p>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-sm text-slate-600">Novos Clientes</p>
              <p className="text-3xl font-bold text-slate-900">28</p>
              <p className="text-xs text-purple-600 mt-1">Este mês</p>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardContent className="p-6">
              <BarChart3 className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-sm text-slate-600">Ticket Médio</p>
              <p className="text-3xl font-bold text-slate-900">
                R$ {((dashboard.kpis_principais?.vendas?.ticket_medio || 15420) / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-orange-600 mt-1">+8.2% vs média</p>
            </CardContent>
          </Card>

          {/* Gráfico de Vendas */}
          <Card className="col-span-8">
            <CardHeader>
              <CardTitle>Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosVendas}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Faturamento"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Produtos */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Vendas por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosProdutos}
                    dataKey="valor"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {dadosProdutos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights da IA */}
          {dashboard.ia_insights?.length > 0 && (
            <Card className="col-span-12 border-purple-300 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Sparkles className="w-5 h-5" />
                  Insights da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {dashboard.ia_insights.slice(0, 3).map((insight, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex items-start justify-between mb-2">
                        <Badge 
                          variant={
                            insight.tipo === 'Oportunidade' ? 'success' :
                            insight.tipo === 'Alerta' ? 'destructive' :
                            'default'
                          }
                          className="text-xs"
                        >
                          {insight.tipo}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.impacto}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-sm mb-2">{insight.titulo}</h3>
                      <p className="text-xs text-slate-600 mb-3">{insight.descricao}</p>

                      {insight.acoes_sugeridas?.length > 0 && (
                        <div className="text-xs text-blue-700">
                          ✓ {insight.acoes_sugeridas[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}