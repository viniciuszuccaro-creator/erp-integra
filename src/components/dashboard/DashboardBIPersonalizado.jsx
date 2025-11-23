import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package,
  Truck,
  AlertTriangle,
  Sparkles,
  Settings
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';

export default function DashboardBIPersonalizado() {
  const { openWindow } = useWindow();
  const [periodoFiltro, setPeriodoFiltro] = useState('mes');

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ['dashboards_bi'],
    queryFn: () => base44.entities.DashboardBI.list()
  });

  const dashboardAtual = dashboards[0];

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const kpis = dashboardAtual?.kpis_principais || {};
  const insights = dashboardAtual?.ia_insights || [];

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard BI Personalizado</h1>
            <p className="text-sm text-slate-600">
              ETAPA 12 - Business Intelligence • IA de Decisão • Multiempresa
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={periodoFiltro}
              onChange={(e) => setPeriodoFiltro(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="ano">Este Ano</option>
            </select>

            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>

        {/* Insights da IA */}
        {insights.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {insights.slice(0, 2).map((insight, idx) => (
              <Card key={idx} className={`border-l-4 ${
                insight.impacto === 'Crítico' ? 'border-l-red-500 bg-red-50/30' :
                insight.impacto === 'Alto' ? 'border-l-orange-500 bg-orange-50/30' :
                'border-l-blue-500 bg-blue-50/30'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      insight.impacto === 'Crítico' ? 'text-red-600' :
                      insight.impacto === 'Alto' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          insight.tipo === 'Alerta' ? 'destructive' :
                          insight.tipo === 'Recomendação' ? 'default' :
                          'secondary'
                        }>
                          {insight.tipo}
                        </Badge>
                        <span className="text-xs text-slate-500">{insight.categoria}</span>
                      </div>
                      <p className="font-medium text-sm mb-1">{insight.titulo}</p>
                      <p className="text-xs text-slate-700">{insight.descricao}</p>
                      
                      {insight.acoes_sugeridas?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {insight.acoes_sugeridas.map((acao, i) => (
                            <p key={i} className="text-xs text-slate-600">→ {acao}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Faturamento</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {kpis.financeiro?.faturamento_mes?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
                <p className="text-xs text-green-600 mt-1">↑ 12% vs mês anterior</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pedidos do Mês</p>
                <p className="text-2xl font-bold text-blue-600">
                  {kpis.vendas?.pedidos_mes || 0}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Ticket: R$ {kpis.vendas?.ticket_medio?.toFixed(2) || '0,00'}
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">OPs Abertas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {kpis.producao?.ops_abertas || 0}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {kpis.producao?.ops_atrasadas || 0} atrasadas
                </p>
              </div>
              <Package className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Entregas Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {kpis.logistica?.entregas_pendentes || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {kpis.logistica?.taxa_entrega_no_prazo || 0}% no prazo
                </p>
              </div>
              <Truck className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visão Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Margem Líquida</p>
              <p className="text-lg font-bold text-blue-600">
                {kpis.financeiro?.margem_liquida?.toFixed(2) || 0}%
              </p>
            </div>
            
            <div className="p-3 bg-red-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Contas a Receber Vencidas</p>
              <p className="text-lg font-bold text-red-600">
                R$ {kpis.financeiro?.contas_receber_vencidas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </p>
            </div>

            <div className="p-3 bg-orange-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Contas a Pagar Vencidas</p>
              <p className="text-lg font-bold text-orange-600">
                R$ {kpis.financeiro?.contas_pagar_vencidas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Produção */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visão Produção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">KG Produzidos/Mês</p>
              <p className="text-lg font-bold">
                {kpis.producao?.kg_produzidos_mes?.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) || 0} kg
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Refugo</p>
              <p className="text-lg font-bold text-orange-600">
                {kpis.producao?.refugo_percentual?.toFixed(2) || 0}%
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">OPs Atrasadas</p>
              <p className="text-lg font-bold text-red-600">
                {kpis.producao?.ops_atrasadas || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visão Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Valor Total Estoque</p>
              <p className="text-lg font-bold">
                R$ {kpis.estoque?.valor_total_estoque?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </p>
            </div>

            <div className="p-3 bg-orange-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Itens Abaixo do Mínimo</p>
              <p className="text-lg font-bold text-orange-600">
                {kpis.estoque?.itens_estoque_minimo || 0}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600 mb-1">Giro Médio</p>
              <p className="text-lg font-bold">
                {kpis.estoque?.giro_estoque_dias || 0} dias
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}