import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Package, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

/**
 * Dashboard analítico de logística (LEGADO - preservado)
 * NOVO: DashboardLogisticaInteligente.jsx com IA avançada
 */
function DashboardLogistico({ entregas, windowMode = false }) {
  // KPIs
  const totalEntregas = entregas.length;
  const entregasEntregues = entregas.filter(e => e.status === "Entregue").length;
  const entregasFrustradas = entregas.filter(e => e.status === "Entrega Frustrada").length;
  const emTransito = entregas.filter(e => ["Saiu para Entrega", "Em Trânsito"].includes(e.status)).length;
  const taxaSucesso = totalEntregas > 0 ? ((entregasEntregues / totalEntregas) * 100).toFixed(1) : 0;

  // Tempo médio de entrega
  const entregasComTempo = entregas.filter(e => e.data_entrega && e.data_saida);
  const tempoMedio = entregasComTempo.length > 0
    ? entregasComTempo.reduce((sum, e) => {
        const dias = Math.floor((new Date(e.data_entrega) - new Date(e.data_saida)) / (1000 * 60 * 60 * 24));
        return sum + dias;
      }, 0) / entregasComTempo.length
    : 0;

  // Por status
  const porStatus = {};
  entregas.forEach(e => {
    porStatus[e.status] = (porStatus[e.status] || 0) + 1;
  });

  const dadosStatus = Object.entries(porStatus).map(([status, quantidade]) => ({
    status,
    quantidade
  }));

  // Por cidade
  const porCidade = {};
  entregas.forEach(e => {
    const cidade = e.endereco_entrega_completo?.cidade || "Não informado";
    porCidade[cidade] = (porCidade[cidade] || 0) + 1;
  });

  const dadosCidades = Object.entries(porCidade)
    .map(([cidade, quantidade]) => ({ cidade, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  // Por dia
  const porDia = {};
  entregas.forEach(e => {
    const dia = e.data_previsao ? new Date(e.data_previsao).toLocaleDateString('pt-BR') : 'Sem data';
    if (!porDia[dia]) {
      porDia[dia] = { dia, entregas: 0, entregues: 0 };
    }
    porDia[dia].entregas++;
    if (e.status === "Entregue") {
      porDia[dia].entregues++;
    }
  });

  const dadosPorDia = Object.values(porDia);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "w-full h-full space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6"}>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total</p>
                <p className="text-2xl font-bold">{totalEntregas}</p>
              </div>
              <Package className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700">Entregues</p>
                <p className="text-2xl font-bold text-green-900">{entregasEntregues}</p>
                <p className="text-xs text-green-600 mt-1">{taxaSucesso}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700">Em Trânsito</p>
                <p className="text-2xl font-bold text-blue-900">{emTransito}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700">Frustradas</p>
                <p className="text-2xl font-bold text-red-900">{entregasFrustradas}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700">Tempo Médio</p>
                <p className="text-2xl font-bold text-purple-900">{tempoMedio.toFixed(1)}</p>
                <p className="text-xs text-purple-600">dias</p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Entregas por Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {dadosStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, quantidade }) => `${status}: ${quantidade}`}
                    outerRadius={100}
                    dataKey="quantidade"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-500">Sem dados</div>
            )}
          </CardContent>
        </Card>

        {/* Por Cidade */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Top 10 Cidades</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosCidades}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cidade" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" name="Entregas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Por Dia */}
      {dadosPorDia.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">Entregas por Dia</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="entregas" stroke="#3b82f6" name="Total" strokeWidth={2} />
                <Line type="monotone" dataKey="entregues" stroke="#10b981" name="Entregues" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
    );
    }
    export default React.memo(DashboardLogistico);