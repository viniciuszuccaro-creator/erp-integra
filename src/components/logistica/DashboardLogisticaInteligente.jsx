import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Package, 
  MapPin, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

/**
 * 📊 DASHBOARD DE LOGÍSTICA INTELIGENTE V21.5
 * Analytics avançado com IA preditiva
 */
export default function DashboardLogisticaInteligente({ windowMode = false }) {
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date', 500),
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas'],
    queryFn: () => base44.entities.Entrega.list('-created_date', 500),
  });

  const { data: regioes = [] } = useQuery({
    queryKey: ['regioes'],
    queryFn: () => base44.entities.RegiaoAtendimento.list(),
  });

  // 🤖 IA: Análise de Performance
  const analytics = useMemo(() => {
    const hoje = new Date();
    const mes30Dias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

    const entregasRecentes = entregas.filter(e => 
      new Date(e.created_date) >= mes30Dias
    );

    const entregasPrazo = entregasRecentes.filter(e => 
      e.status === 'Entregue' && 
      (!e.data_previsao || new Date(e.data_entrega) <= new Date(e.data_previsao))
    ).length;

    const taxaPontualidade = entregasRecentes.length > 0 
      ? (entregasPrazo / entregasRecentes.length) * 100 
      : 0;

    const entregasFrustradas = entregasRecentes.filter(e => 
      e.status === 'Entrega Frustrada'
    ).length;

    const taxaSucesso = entregasRecentes.length > 0
      ? ((entregasRecentes.length - entregasFrustradas) / entregasRecentes.length) * 100
      : 100;

    // Pedidos por região
    const pedidosPorRegiao = {};
    pedidos.forEach(p => {
      if (['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)) {
        const regiao = p.endereco_entrega_principal?.cidade || 'Sem Região';
        pedidosPorRegiao[regiao] = (pedidosPorRegiao[regiao] || 0) + 1;
      }
    });

    const topRegioes = Object.entries(pedidosPorRegiao)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([regiao, quantidade]) => ({ regiao, quantidade }));

    // Status atual das entregas
    const statusDistribuicao = {};
    const statusList = ['Aguardando Separação', 'Em Separação', 'Pronto para Expedir', 'Saiu para Entrega', 'Em Trânsito', 'Entregue'];
    statusList.forEach(status => {
      statusDistribuicao[status] = entregas.filter(e => e.status === status).length;
    });

    const pieData = Object.entries(statusDistribuicao)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));

    return {
      taxaPontualidade,
      taxaSucesso,
      totalEntregas: entregasRecentes.length,
      entregasFrustradas,
      topRegioes,
      pieData,
      emTransito: pedidos.filter(p => p.status === 'Em Trânsito').length,
      prontosFaturar: pedidos.filter(p => p.status === 'Pronto para Faturar').length,
    };
  }, [pedidos, entregas]);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Taxa de Pontualidade</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {analytics.taxaPontualidade.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600 mt-1">Últimos 30 dias</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <Progress value={analytics.taxaPontualidade} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Taxa de Sucesso</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {analytics.taxaSucesso.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 mt-1">Entregas bem-sucedidas</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <Progress value={analytics.taxaSucesso} className="mt-4" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Em Trânsito</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {analytics.emTransito}
                </p>
                <p className="text-xs text-purple-600 mt-1">Veículos em rota</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Prontos p/ Faturar</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {analytics.prontosFaturar}
                </p>
                <p className="text-xs text-orange-600 mt-1">Aguardando NF-e</p>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🤖 IA: Previsão e Alertas */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            🤖 Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-sm font-medium">💡 Recomendação:</p>
            <p className="text-sm opacity-90">
              {analytics.taxaPontualidade < 85 
                ? "Considere redistribuir rotas - taxa de pontualidade abaixo do ideal."
                : analytics.emTransito > 10
                ? "Alto volume em trânsito - reforce a equipe de expedição."
                : "Performance excelente! Continue assim."}
            </p>
          </div>
          
          {analytics.entregasFrustradas > 0 && (
            <div className="bg-yellow-500/20 border border-yellow-300/30 rounded-lg p-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                ⚠️ Atenção:
              </p>
              <p className="text-sm opacity-90">
                {analytics.entregasFrustradas} entrega(s) frustrada(s) nos últimos 30 dias. Revisar logística reversa.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Regiões */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Top 5 Regiões - Pedidos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topRegioes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="regiao" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Operacionais */}
      <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            ⚡ Alertas Operacionais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {analytics.prontosFaturar > 5 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">
                    {analytics.prontosFaturar} pedidos prontos para faturar
                  </p>
                  <p className="text-sm text-blue-700">
                    Acelere a emissão de NF-e para não atrasar entregas
                  </p>
                </div>
              </div>
            )}

            {analytics.emTransito > 15 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Truck className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900">
                    Alto volume em trânsito ({analytics.emTransito} entregas)
                  </p>
                  <p className="text-sm text-purple-700">
                    Monitore atrasos e prepare equipe para descarga
                  </p>
                </div>
              </div>
            )}

            {analytics.taxaPontualidade < 85 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">
                    Taxa de pontualidade baixa ({analytics.taxaPontualidade.toFixed(1)}%)
                  </p>
                  <p className="text-sm text-red-700">
                    Revisar rotas, prazos e capacidade de entrega
                  </p>
                </div>
              </div>
            )}

            {analytics.entregasFrustradas > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    {analytics.entregasFrustradas} entrega(s) frustrada(s)
                  </p>
                  <p className="text-sm text-yellow-700">
                    Reagendar e verificar endereços/contatos
                  </p>
                </div>
              </div>
            )}

            {analytics.taxaSucesso > 95 && analytics.taxaPontualidade > 90 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">
                    🎉 Performance excepcional!
                  </p>
                  <p className="text-sm text-green-700">
                    Logística operando com excelência - {analytics.taxaSucesso.toFixed(1)}% de sucesso
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}