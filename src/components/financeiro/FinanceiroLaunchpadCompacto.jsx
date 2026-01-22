import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Wallet,
  CreditCard,
  BarChart3,
  FileText,
  Repeat,
  Link2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * FINANCEIRO LAUNCHPAD COMPACTO V22.0 ETAPA 2
 * Dashboard minimalista e estável - SEM abas, apenas KPIs + insights visuais
 */
export default function FinanceiroLaunchpadCompacto({ windowMode = false }) {
  const { empresaAtual, estaNoGrupo, filtrarPorContexto } = useContextoVisual();

  // DADOS
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-launchpad'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-launchpad'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa-launchpad'],
    queryFn: () => base44.entities.TipoDespesa.list(),
  });

  const { data: configsRecorrentes = [] } = useQuery({
    queryKey: ['configs-recorrentes-launchpad'],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.list(),
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento-launchpad'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: conciliacoes = [] } = useQuery({
    queryKey: ['conciliacoes-launchpad'],
    queryFn: () => base44.entities.ConciliacaoBancaria.list(),
  });

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-launchpad'],
    queryFn: () => base44.entities.ExtratoBancario.list(),
  });

  // FILTROS POR CONTEXTO
  const crFiltradas = filtrarPorContexto(contasReceber, 'empresa_id');
  const cpFiltradas = filtrarPorContexto(contasPagar, 'empresa_id');

  // CÁLCULOS PRINCIPAIS
  const totalReceber = crFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const totalPagar = cpFiltradas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0);
  const saldoLiquido = totalReceber - totalPagar;
  const totalRecebido = crFiltradas.filter(c => c.status === 'Recebido').reduce((s, c) => s + (c.valor_recebido || 0), 0);
  const totalPago = cpFiltradas.filter(c => c.status === 'Pago').reduce((s, c) => s + (c.valor_pago || 0), 0);

  // MÉTRICAS IA
  const conciliacoesAutomaticas = conciliacoes.filter(c => c.conciliado_por_ia).length;
  const scoreMedioConciliacao = conciliacoes.reduce((s, c) => s + (c.score_confianca_ia || 0), 0) / (conciliacoes.length || 1);
  const extratosPendentes = extratos.filter(e => !e.conciliado).length;

  // MÉTRICAS RECORRENTES
  const totalRecorrentesAtivas = configsRecorrentes.filter(c => c.ativa).length;
  const valorMensalRecorrente = configsRecorrentes
    .filter(c => c.ativa && c.periodicidade === 'Mensal')
    .reduce((s, c) => s + (c.valor_base || 0), 0);

  // MÉTRICAS FORMAS E GATEWAYS
  const formasAtivas = formasPagamento.filter(f => f.ativa).length;

  // DADOS PARA GRÁFICOS
  const dadosFluxo = [
    { nome: 'A Receber', valor: totalReceber, fill: '#10b981' },
    { nome: 'A Pagar', valor: totalPagar, fill: '#ef4444' },
    { nome: 'Recebido', valor: totalRecebido, fill: '#3b82f6' },
    { nome: 'Pago', valor: totalPago, fill: '#f59e0b' }
  ];

  const dadosCategorias = tiposDespesa
    .map(tipo => {
      const totalPorTipo = cpFiltradas
        .filter(cp => cp.categoria === tipo.categoria)
        .reduce((s, cp) => s + (cp.valor || 0), 0);
      return { categoria: tipo.categoria, valor: totalPorTipo };
    })
    .filter(d => d.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "w-full"}>
      <div className="p-2 space-y-2 bg-gradient-to-br from-slate-50 to-blue-50">
        
        {/* HEADER COMPACTO */}
        <div className="flex items-center justify-between min-h-[50px] max-h-[50px]">
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              Dashboard Financeiro
            </h1>
            <p className="text-xs text-slate-600 truncate">
              {estaNoGrupo ? '🌐 Consolidado' : `${empresaAtual?.nome_fantasia || ''}`}
            </p>
          </div>
          <Badge className="bg-green-600 text-white text-xs px-2 py-0.5 flex-shrink-0">
            V22.0
          </Badge>
        </div>

        {/* KPIS COMPACTOS - SEM REDIMENSIONAMENTO */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-100 min-h-[90px] max-h-[90px]">
            <CardContent className="p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3 h-3 text-green-700 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium truncate">A Receber</p>
              </div>
              <p className="text-base font-bold text-green-700 truncate">
                R$ {(totalReceber / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-green-600 truncate">
                {crFiltradas.filter(c => c.status === 'Pendente').length} títulos
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-300 bg-gradient-to-br from-red-50 to-pink-100 min-h-[90px] max-h-[90px]">
            <CardContent className="p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingDown className="w-3 h-3 text-red-700 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium truncate">A Pagar</p>
              </div>
              <p className="text-base font-bold text-red-700 truncate">
                R$ {(totalPagar / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-red-600 truncate">
                {cpFiltradas.filter(c => c.status === 'Pendente').length} títulos
              </p>
            </CardContent>
          </Card>

          <Card className={`${saldoLiquido >= 0 ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-100' : 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-100'} min-h-[90px] max-h-[90px]`}>
            <CardContent className="p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <DollarSign className="w-3 h-3 flex-shrink-0" />
                <p className="text-xs font-medium truncate">Saldo</p>
              </div>
              <p className={`text-base font-bold truncate ${saldoLiquido >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                R$ {(saldoLiquido / 1000).toFixed(0)}k
              </p>
              <p className={`text-xs truncate ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {saldoLiquido >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-[90px] max-h-[90px]">
            <CardContent className="p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Repeat className="w-3 h-3 text-purple-700 flex-shrink-0" />
                <p className="text-xs text-purple-700 font-medium truncate">Recorrentes</p>
              </div>
              <p className="text-base font-bold text-purple-700">{totalRecorrentesAtivas}</p>
              <p className="text-xs text-purple-600 truncate">
                R$ {(valorMensalRecorrente / 1000).toFixed(0)}k/mês
              </p>
            </CardContent>
          </Card>

          <Card className="border-cyan-300 bg-gradient-to-br from-cyan-50 to-teal-100 min-h-[90px] max-h-[90px]">
            <CardContent className="p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Link2 className="w-3 h-3 text-cyan-700 flex-shrink-0" />
                <p className="text-xs text-cyan-700 font-medium truncate">Conciliação</p>
              </div>
              <p className="text-base font-bold text-cyan-700">{conciliacoesAutomaticas}</p>
              <p className="text-xs text-cyan-600 truncate">
                Score: {scoreMedioConciliacao.toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MÉTRICAS SECUNDÁRIAS COMPACTAS */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
          <Card className="bg-white border min-h-[60px] max-h-[60px]">
            <CardContent className="p-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 truncate">Formas</p>
                  <p className="text-sm font-bold text-blue-600">{formasAtivas}</p>
                </div>
                <CreditCard className="w-4 h-4 text-blue-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border min-h-[60px] max-h-[60px]">
            <CardContent className="p-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 truncate">Tipos</p>
                  <p className="text-sm font-bold text-orange-600">{tiposDespesa.length}</p>
                </div>
                <FileText className="w-4 h-4 text-orange-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border min-h-[60px] max-h-[60px]">
            <CardContent className="p-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 truncate">Recorr.</p>
                  <p className="text-sm font-bold text-green-600">{configsRecorrentes.length}</p>
                </div>
                <Repeat className="w-4 h-4 text-green-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border min-h-[60px] max-h-[60px]">
            <CardContent className="p-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 truncate">Extratos</p>
                  <p className="text-sm font-bold text-teal-600">{extratosPendentes}</p>
                </div>
                <AlertCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border min-h-[60px] max-h-[60px]">
            <CardContent className="p-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 truncate">Recebido</p>
                  <p className="text-sm font-bold text-blue-600">{(totalRecebido / 1000).toFixed(0)}k</p>
                </div>
                <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border min-h-[60px] max-h-[60px]">
            <CardContent className="p-1.5">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 truncate">Pago</p>
                  <p className="text-sm font-bold text-orange-600">{(totalPago / 1000).toFixed(0)}k</p>
                </div>
                <TrendingDown className="w-4 h-4 text-orange-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GRÁFICOS COMPACTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* FLUXO DE CAIXA */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b p-1.5">
              <CardTitle className="text-xs flex items-center gap-1.5 font-semibold">
                <BarChart3 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                Fluxo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dadosFluxo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nome" style={{ fontSize: '11px' }} />
                  <YAxis style={{ fontSize: '11px' }} />
                  <Tooltip formatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {dadosFluxo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* DESPESAS POR CATEGORIA */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b p-1.5">
              <CardTitle className="text-xs flex items-center gap-1.5 font-semibold">
                <FileText className="w-3 h-3 text-purple-600 flex-shrink-0" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-1.5">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={dadosCategorias}
                    dataKey="valor"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label={({ categoria, value }) => `${categoria}: ${(value / 1000).toFixed(0)}k`}
                    labelStyle={{ fontSize: '9px' }}
                  >
                    {dadosCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* IA INSIGHTS COMPACTO */}
        <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b p-1.5">
            <CardTitle className="text-xs flex items-center gap-1.5 text-purple-900 font-semibold">
              <Zap className="w-3 h-3 flex-shrink-0" />
              🤖 Insights IA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-white rounded-lg border border-purple-200 min-h-[65px] max-h-[65px]">
                <p className="text-xs text-slate-600 mb-1 truncate">Score Concil.</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${scoreMedioConciliacao}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-purple-700">{scoreMedioConciliacao.toFixed(0)}%</span>
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-green-200 min-h-[65px] max-h-[65px]">
                <p className="text-xs text-slate-600 mb-1 truncate">Taxa Autom.</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(conciliacoesAutomaticas / (conciliacoes.length || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-green-700">
                    {((conciliacoesAutomaticas / (conciliacoes.length || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-orange-200 min-h-[65px] max-h-[65px] flex flex-col justify-center">
                <p className="text-xs text-slate-600 mb-0.5 truncate">Extratos Pend.</p>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-base font-bold text-orange-700">{extratosPendentes}</span>
                </div>
              </div>
            </div>

            <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-300">
              <p className="text-xs font-semibold text-blue-900 mb-1">💡 Recomendações</p>
              <ul className="space-y-0.5 text-xs text-blue-800">
                {totalReceber > totalPagar && (
                  <li className="truncate">✅ Saldo positivo. Fluxo saudável.</li>
                )}
                {extratosPendentes > 10 && (
                  <li className="truncate">⚠️ {extratosPendentes} extratos. Execute conciliação.</li>
                )}
                {scoreMedioConciliacao > 80 && (
                  <li className="truncate">🎯 Precisão {scoreMedioConciliacao.toFixed(0)}%. IA treinada.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}