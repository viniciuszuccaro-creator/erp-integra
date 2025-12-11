import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * V21.7 - DASHBOARD DO CICLO DE VIDA DE PEDIDOS
 * Analytics e KPIs do fluxo completo de pedidos
 */
export default function DashboardCicloPedidos() {
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date'),
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes'],
    queryFn: () => base44.entities.MovimentacaoEstoque.list('-created_date', 100),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber'],
    queryFn: () => base44.entities.ContaReceber.list('-created_date', 100),
  });

  // 📊 KPIs do Ciclo
  const kpis = useMemo(() => {
    const totalPedidos = pedidos.length;
    const rascunhos = pedidos.filter(p => p.status === 'Rascunho').length;
    const aguardandoAprovacao = pedidos.filter(p => p.status === 'Aguardando Aprovação').length;
    const aprovados = pedidos.filter(p => p.status === 'Aprovado').length;
    const faturados = pedidos.filter(p => p.status === 'Faturado').length;
    const emExpedicao = pedidos.filter(p => p.status === 'Em Expedição').length;
    const emTransito = pedidos.filter(p => p.status === 'Em Trânsito').length;
    const entregues = pedidos.filter(p => p.status === 'Entregue').length;
    const cancelados = pedidos.filter(p => p.status === 'Cancelado').length;

    const pedidosComEstoqueBaixado = movimentacoes.filter(m => 
      m.origem_movimento === 'pedido' && 
      m.tipo_movimento === 'saida' &&
      m.motivo?.includes('Aprovação')
    ).length;

    const pedidosComFinanceiroGerado = contasReceber.filter(c => c.origem_tipo === 'pedido').length;

    const taxaConversao = totalPedidos > 0 ? (entregues / totalPedidos) * 100 : 0;
    const taxaCancelamento = totalPedidos > 0 ? (cancelados / totalPedidos) * 100 : 0;

    return {
      totalPedidos,
      rascunhos,
      aguardandoAprovacao,
      aprovados,
      faturados,
      emExpedicao,
      emTransito,
      entregues,
      cancelados,
      pedidosComEstoqueBaixado,
      pedidosComFinanceiroGerado,
      taxaConversao,
      taxaCancelamento
    };
  }, [pedidos, movimentacoes, contasReceber]);

  // 📈 Dados para Gráficos
  const dadosFluxo = [
    { etapa: 'Rascunho', quantidade: kpis.rascunhos, cor: '#64748b' },
    { etapa: 'Aguardando', quantidade: kpis.aguardandoAprovacao, cor: '#f59e0b' },
    { etapa: 'Aprovado', quantidade: kpis.aprovados, cor: '#22c55e' },
    { etapa: 'Faturado', quantidade: kpis.faturados, cor: '#3b82f6' },
    { etapa: 'Expedição', quantidade: kpis.emExpedicao, cor: '#f97316' },
    { etapa: 'Trânsito', quantidade: kpis.emTransito, cor: '#a855f7' },
    { etapa: 'Entregue', quantidade: kpis.entregues, cor: '#16a34a' }
  ];

  const dadosAutomacoes = [
    { name: 'Estoque Baixado', value: kpis.pedidosComEstoqueBaixado, fill: '#22c55e' },
    { name: 'Financeiro Gerado', value: kpis.pedidosComFinanceiroGerado, fill: '#3b82f6' },
    { name: 'Pendentes', value: kpis.totalPedidos - kpis.pedidosComEstoqueBaixado, fill: '#f59e0b' }
  ];

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Dashboard do Ciclo de Pedidos
          </h2>
          <p className="text-slate-600 mt-1">Acompanhamento em tempo real do fluxo completo</p>
        </div>
        <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 text-lg">
          {kpis.totalPedidos} Pedidos Ativos
        </Badge>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-green-600">{kpis.taxaConversao.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1">{kpis.entregues} entregues</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Em Andamento</p>
                <p className="text-3xl font-bold text-blue-600">
                  {kpis.aprovados + kpis.faturados + kpis.emExpedicao + kpis.emTransito}
                </p>
                <p className="text-xs text-blue-600 mt-1">no fluxo</p>
              </div>
              <Truck className="w-12 h-12 text-blue-600 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Automações</p>
                <p className="text-3xl font-bold text-purple-600">{kpis.pedidosComEstoqueBaixado}</p>
                <p className="text-xs text-purple-600 mt-1">estoque baixado</p>
              </div>
              <Package className="w-12 h-12 text-purple-600 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">
                  {kpis.rascunhos + kpis.aguardandoAprovacao}
                </p>
                <p className="text-xs text-orange-600 mt-1">aguardando ação</p>
              </div>
              <Clock className="w-12 h-12 text-orange-600 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Funil do Ciclo de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosFluxo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="etapa" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Automações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosAutomacoes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosAutomacoes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Etapas Detalhadas */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>📊 Status Detalhado do Fluxo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dadosFluxo.map(etapa => {
              const percentual = kpis.totalPedidos > 0 ? (etapa.quantidade / kpis.totalPedidos) * 100 : 0;
              
              return (
                <div key={etapa.etapa} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: etapa.cor }}
                      />
                      <span className="font-medium text-slate-700">{etapa.etapa}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">
                        {etapa.quantidade} pedido(s)
                      </span>
                      <Badge variant="outline">{percentual.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <Progress value={percentual} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Recomendações */}
      {(kpis.aguardandoAprovacao > 0 || kpis.rascunhos > 5) && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="w-5 h-5" />
              ⚠️ Alertas e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {kpis.aguardandoAprovacao > 0 && (
              <Alert className="bg-yellow-100 border-yellow-300">
                <AlertDescription className="text-sm text-yellow-900">
                  <strong>{kpis.aguardandoAprovacao} pedido(s)</strong> aguardando aprovação de desconto
                </AlertDescription>
              </Alert>
            )}
            
            {kpis.rascunhos > 5 && (
              <Alert className="bg-orange-100 border-orange-300">
                <AlertDescription className="text-sm text-orange-900">
                  <strong>{kpis.rascunhos} rascunho(s)</strong> não finalizados - considere revisar
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}