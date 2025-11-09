import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Mail,
  MessageSquare,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Progress } from "@/components/ui/progress";

/**
 * Dashboard de ROI de Campanhas de Marketing
 */
export default function DashboardROICampanhas() {
  const [periodoFiltro, setPeriodoFiltro] = useState("30"); // dias

  const { data: campanhas = [] } = useQuery({
    queryKey: ['campanhas-roi'],
    queryFn: () => base44.entities.Campanha.list('-created_date'),
  });

  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades-campanhas'],
    queryFn: () => base44.entities.Oportunidade.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-campanhas'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  // Filtrar campanhas por período
  const campanhasFiltradas = campanhas.filter(c => {
    if (!c.data_inicio) return true;
    const dataInicio = new Date(c.data_inicio);
    const hoje = new Date();
    const diasDiferenca = (hoje - dataInicio) / (1000 * 60 * 60 * 24);
    return diasDiferenca <= parseInt(periodoFiltro);
  });

  // Calcular métricas por campanha
  const metricasCampanhas = campanhasFiltradas.map(campanha => {
    const investimento = campanha.investimento_realizado || campanha.orcamento || 0;
    const leads = campanha.leads_gerados || 0;
    const conversoes = campanha.conversoes || 0;
    const receitaGerada = campanha.receita_gerada || 0;
    
    const roi = investimento > 0 ? ((receitaGerada - investimento) / investimento) * 100 : 0;
    const custoLead = leads > 0 ? investimento / leads : 0;
    const custoConversao = conversoes > 0 ? investimento / conversoes : 0;
    const taxaConversao = leads > 0 ? (conversoes / leads) * 100 : 0;

    return {
      campanha,
      investimento,
      leads,
      conversoes,
      receitaGerada,
      roi,
      custoLead,
      custoConversao,
      taxaConversao
    };
  });

  // KPIs Gerais
  const totalInvestimento = metricasCampanhas.reduce((sum, m) => sum + m.investimento, 0);
  const totalLeads = metricasCampanhas.reduce((sum, m) => sum + m.leads, 0);
  const totalConversoes = metricasCampanhas.reduce((sum, m) => sum + m.conversoes, 0);
  const totalReceita = metricasCampanhas.reduce((sum, m) => sum + m.receitaGerada, 0);
  const roiGeral = totalInvestimento > 0 
    ? ((totalReceita - totalInvestimento) / totalInvestimento) * 100 
    : 0;
  const custoMedioLead = totalLeads > 0 ? totalInvestimento / totalLeads : 0;
  const taxaConversaoGeral = totalLeads > 0 ? (totalConversoes / totalLeads) * 100 : 0;

  // Dados para gráficos
  const dadosROIPorCampanha = metricasCampanhas
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 10)
    .map(m => ({
      nome: m.campanha.nome,
      roi: m.roi,
      receita: m.receitaGerada,
      investimento: m.investimento
    }));

  const dadosPorTipo = {};
  metricasCampanhas.forEach(m => {
    const tipo = m.campanha.tipo;
    if (!dadosPorTipo[tipo]) {
      dadosPorTipo[tipo] = {
        tipo,
        investimento: 0,
        receita: 0,
        leads: 0,
        conversoes: 0
      };
    }
    dadosPorTipo[tipo].investimento += m.investimento;
    dadosPorTipo[tipo].receita += m.receitaGerada;
    dadosPorTipo[tipo].leads += m.leads;
    dadosPorTipo[tipo].conversoes += m.conversoes;
  });

  const dadosTipoCampanha = Object.values(dadosPorTipo).map(d => ({
    ...d,
    roi: d.investimento > 0 ? ((d.receita - d.investimento) / d.investimento) * 100 : 0
  }));

  // Performance por Canal
  const dadosPerformanceCanal = dadosTipoCampanha.map(d => ({
    canal: d.tipo,
    'Taxa Conversão': d.leads > 0 ? (d.conversoes / d.leads) * 100 : 0,
    'Custo/Lead': d.leads > 0 ? d.investimento / d.leads : 0,
    'ROI': d.roi
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Período:</label>
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
                <SelectItem value="99999">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-700 mb-1">ROI Médio</p>
                <p className="text-3xl font-bold text-blue-900">{roiGeral.toFixed(1)}%</p>
                <p className="text-xs text-blue-600 mt-1">
                  {roiGeral >= 0 ? '↑ Positivo' : '↓ Negativo'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-700 mb-1">Receita Gerada</p>
                <p className="text-2xl font-bold text-green-900">
                  R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Investido: R$ {totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-700 mb-1">Leads Gerados</p>
                <p className="text-3xl font-bold text-purple-900">{totalLeads}</p>
                <p className="text-xs text-purple-600 mt-1">
                  R$ {custoMedioLead.toFixed(2)} por lead
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-orange-700 mb-1">Taxa Conversão</p>
                <p className="text-3xl font-bold text-orange-900">{taxaConversaoGeral.toFixed(1)}%</p>
                <p className="text-xs text-orange-600 mt-1">
                  {totalConversoes} conversões
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ROI por Campanha */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              ROI por Campanha (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosROIPorCampanha} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={150} />
                <Tooltip 
                  formatter={(value, name) => 
                    name === 'roi' ? `${value.toFixed(1)}%` : `R$ ${value.toLocaleString('pt-BR')}`
                  }
                />
                <Bar dataKey="roi" fill="#3b82f6">
                  {dadosROIPorCampanha.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.roi >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Tipo */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Investimento por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={dadosTipoCampanha}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tipo, investimento }) => 
                    `${tipo}: R$ ${investimento.toFixed(0)}`
                  }
                  outerRadius={120}
                  dataKey="investimento"
                >
                  {dadosTipoCampanha.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar de Performance */}
        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Performance Comparativa por Canal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={dadosPerformanceCanal}>
                <PolarGrid />
                <PolarAngleAxis dataKey="canal" />
                <PolarRadiusAxis />
                <Radar name="Taxa Conversão (%)" dataKey="Taxa Conversão" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Radar name="ROI (%)" dataKey="ROI" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por Campanha */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Ranking de Campanhas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">#</th>
                  <th className="text-left p-3 text-sm font-semibold">Campanha</th>
                  <th className="text-left p-3 text-sm font-semibold">Tipo</th>
                  <th className="text-right p-3 text-sm font-semibold">Investimento</th>
                  <th className="text-right p-3 text-sm font-semibold">Leads</th>
                  <th className="text-right p-3 text-sm font-semibold">Conversões</th>
                  <th className="text-right p-3 text-sm font-semibold">Receita</th>
                  <th className="text-right p-3 text-sm font-semibold">ROI</th>
                  <th className="text-right p-3 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {metricasCampanhas
                  .sort((a, b) => b.roi - a.roi)
                  .map((m, idx) => (
                    <tr key={m.campanha.id} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          idx === 0 ? 'bg-yellow-500' :
                          idx === 1 ? 'bg-slate-400' :
                          idx === 2 ? 'bg-orange-600' :
                          'bg-blue-500'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{m.campanha.nome}</p>
                        <p className="text-xs text-slate-500">
                          {m.campanha.data_inicio && new Date(m.campanha.data_inicio).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {m.campanha.tipo === 'E-mail Marketing' && <Mail className="w-3 h-3 mr-1" />}
                          {m.campanha.tipo === 'WhatsApp' && <MessageSquare className="w-3 h-3 mr-1" />}
                          {m.campanha.tipo}
                        </Badge>
                      </td>
                      <td className="text-right p-3 text-red-600 font-semibold">
                        R$ {m.investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right p-3">
                        <div>
                          <p className="font-bold">{m.leads}</p>
                          <p className="text-xs text-slate-500">
                            R$ {m.custoLead.toFixed(2)}/lead
                          </p>
                        </div>
                      </td>
                      <td className="text-right p-3">
                        <div>
                          <p className="font-bold text-purple-600">{m.conversoes}</p>
                          <p className="text-xs text-slate-500">
                            {m.taxaConversao.toFixed(1)}%
                          </p>
                        </div>
                      </td>
                      <td className="text-right p-3 text-green-700 font-bold text-lg">
                        R$ {m.receitaGerada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right p-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`px-3 py-1 rounded-full font-bold ${
                            m.roi >= 100 ? 'bg-green-100 text-green-700' :
                            m.roi >= 50 ? 'bg-blue-100 text-blue-700' :
                            m.roi >= 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {m.roi >= 0 ? '+' : ''}{m.roi.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="text-right p-3">
                        <Badge className={
                          m.campanha.status === 'Ativa' ? 'bg-green-600' :
                          m.campanha.status === 'Concluída' ? 'bg-blue-600' :
                          m.campanha.status === 'Pausada' ? 'bg-orange-600' :
                          'bg-slate-600'
                        }>
                          {m.campanha.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="bg-blue-50 font-bold">
                <tr>
                  <td colSpan="3" className="p-3 text-blue-900">TOTAIS</td>
                  <td className="text-right p-3 text-red-700">
                    R$ {totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right p-3 text-blue-900">
                    {totalLeads}
                  </td>
                  <td className="text-right p-3 text-purple-700">
                    {totalConversoes}
                  </td>
                  <td className="text-right p-3 text-green-700 text-lg">
                    R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-right p-3 text-blue-900 text-lg">
                    {roiGeral >= 0 ? '+' : ''}{roiGeral.toFixed(1)}%
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights da IA */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">💡 Insights da IA de Marketing</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  • <strong>Melhor canal:</strong> {
                    dadosTipoCampanha.sort((a, b) => b.roi - a.roi)[0]?.tipo || 'N/A'
                  } com ROI de {dadosTipoCampanha.sort((a, b) => b.roi - a.roi)[0]?.roi.toFixed(1)}%
                </p>
                <p>
                  • <strong>Custo/Lead mais eficiente:</strong> {
                    dadosTipoCampanha
                      .filter(d => d.leads > 0)
                      .sort((a, b) => (a.investimento/a.leads) - (b.investimento/b.leads))[0]?.tipo || 'N/A'
                  }
                </p>
                <p>
                  • <strong>Recomendação:</strong> {
                    roiGeral < 50 
                      ? 'Revisar estratégia de campanhas - ROI abaixo do esperado'
                      : roiGeral > 100
                      ? '✅ Performance excelente! Considere aumentar investimento nos canais de maior ROI'
                      : 'Performance satisfatória. Continue monitorando e otimizando'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}