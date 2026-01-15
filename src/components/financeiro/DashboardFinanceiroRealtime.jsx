import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle, 
  Clock,
  CreditCard,
  Wallet,
  Activity,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * ETAPAS 8 E 9: DASHBOARD FINANCEIRO TEMPO REAL V21.4
 * Consolidação Caixa Diário + Conciliação Bancária
 */

function DashboardFinanceiroRealtime({ empresaId, windowMode = false }) {
  const [metricas, setMetricas] = useState({
    saldoCaixa: 0,
    receitasHoje: 0,
    despesasHoje: 0,
    contasVencerHoje: 0,
    contasVencidas: 0,
    cartoesACompensar: 0,
    conciliacoesHoje: 0,
    divergenciasBancarias: 0
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber'],
    queryFn: () => base44.entities.ContaReceber.list()
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar'],
    queryFn: () => base44.entities.ContaPagar.list()
  });

  const { data: movimentosCartao = [] } = useQuery({
    queryKey: ['movimentos-cartao'],
    queryFn: () => base44.entities.MovimentoCartao.list()
  });

  const { data: conciliacoes = [] } = useQuery({
    queryKey: ['conciliacoes-bancarias'],
    queryFn: () => base44.entities.ConciliacaoBancaria.list()
  });

  const { data: caixaMovimentos = [] } = useQuery({
    queryKey: ['caixa-movimentos'],
    queryFn: () => base44.entities.CaixaMovimento.list()
  });

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];

    const receitasHoje = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(hoje) && m.tipo === 'Entrada')
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    const despesasHoje = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(hoje) && m.tipo === 'Saída')
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    const saldo = receitasHoje - despesasHoje;

    const vencerHoje = contasPagar.filter(c => c.data_vencimento === hoje && c.status === 'Pendente').length;
    
    const vencidas = contasPagar.filter(c => {
      if (c.status !== 'Pendente') return false;
      return new Date(c.data_vencimento) < new Date(hoje);
    }).length;

    const cartoesACompensar = movimentosCartao.filter(m => 
      m.status_compensacao === 'A Compensar' || m.status_compensacao === 'Em Trânsito'
    ).length;

    const conciliacoesHoje = conciliacoes.filter(c => c.data_conciliacao?.startsWith(hoje)).length;

    const divergencias = conciliacoes.reduce((sum, c) => 
      sum + (c.divergencias_pendentes?.filter(d => !d.resolvido).length || 0), 0
    );

    setMetricas({
      saldoCaixa: saldo,
      receitasHoje,
      despesasHoje,
      contasVencerHoje: vencerHoje,
      contasVencidas: vencidas,
      cartoesACompensar,
      conciliacoesHoje,
      divergenciasBancarias: divergencias
    });
  }, [contasReceber, contasPagar, movimentosCartao, conciliacoes, caixaMovimentos]);

  const containerClass = windowMode ? "w-full h-full flex flex-col" : "w-full h-full space-y-6";

  const dadosFluxoCaixa7Dias = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];
    
    const receitas = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(dataStr) && m.tipo === 'Entrada')
      .reduce((sum, m) => sum + (m.valor || 0), 0);
    
    const despesas = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(dataStr) && m.tipo === 'Saída')
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    dadosFluxoCaixa7Dias.push({
      dia: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
      receitas: receitas / 1000,
      despesas: despesas / 1000,
      saldo: (receitas - despesas) / 1000
    });
  }

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6"}>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className={metricas.saldoCaixa >= 0 ? 'border-green-200' : 'border-red-200'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo Caixa Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className={`w-5 h-5 ${metricas.saldoCaixa >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-2xl font-bold ${metricas.saldoCaixa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metricas.saldoCaixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Receitas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {metricas.receitasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Despesas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                {metricas.despesasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Vencem Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{metricas.contasVencerHoje}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Vencidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{metricas.contasVencidas}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Cartões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{metricas.cartoesACompensar}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Conciliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">{metricas.conciliacoesHoje}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Divergências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{metricas.divergenciasBancarias}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico fluxo de caixa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fluxo de Caixa - Últimos 7 Dias (em milhares)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosFluxoCaixa7Dias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} name="Receitas" />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
              <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div></div>
  );
}
export default React.memo(DashboardFinanceiroRealtime);