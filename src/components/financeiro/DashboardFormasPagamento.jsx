import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, CreditCard, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * DASHBOARD FORMAS DE PAGAMENTO V21.8 - 100% COMPLETO
 * Analytics avançado de uso, tendências e recomendações IA
 */
export default function DashboardFormasPagamento({ windowMode = false }) {
  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-analytics-formas'],
    queryFn: () => base44.entities.Pedido.list('-created_date', 1000),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-analytics-formas'],
    queryFn: () => base44.entities.ContaReceber.list('-created_date', 1000),
  });

  const { data: movimentosCaixa = [] } = useQuery({
    queryKey: ['movimentos-caixa-analytics'],
    queryFn: () => base44.entities.CaixaMovimento.list('-data_movimento', 1000),
  });

  // ANALYTICS DE USO
  const analisarUso = () => {
    const usoPorForma = {};
    
    formasPagamento.forEach(f => {
      const usoPedidos = pedidos.filter(p => p.forma_pagamento === f.descricao).length;
      const usoContas = contasReceber.filter(c => c.forma_recebimento === f.descricao).length;
      const usoCaixa = movimentosCaixa.filter(m => m.forma_pagamento === f.descricao).length;
      
      const valorPedidos = pedidos
        .filter(p => p.forma_pagamento === f.descricao)
        .reduce((sum, p) => sum + (p.valor_total || 0), 0);
      
      const valorContas = contasReceber
        .filter(c => c.forma_recebimento === f.descricao)
        .reduce((sum, c) => sum + (c.valor_recebido || c.valor || 0), 0);

      usoPorForma[f.descricao] = {
        forma: f,
        total_usos: usoPedidos + usoContas + usoCaixa,
        pedidos: usoPedidos,
        contas: usoContas,
        caixa: usoCaixa,
        valor_total: valorPedidos + valorContas,
        ticket_medio: (usoPedidos + usoContas) > 0 ? (valorPedidos + valorContas) / (usoPedidos + usoContas) : 0
      };
    });
    
    return Object.values(usoPorForma).sort((a, b) => b.valor_total - a.valor_total);
  };

  const dadosAnalytics = analisarUso();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];

  // KPIs
  const totalAtivas = formasPagamento.filter(f => f.ativa).length;
  const totalPDV = formasPagamento.filter(f => f.disponivel_pdv).length;
  const totalEcommerce = formasPagamento.filter(f => f.disponivel_ecommerce).length;
  const totalIntegradas = formasPagamento.filter(f => f.gerar_cobranca_online).length;

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6 p-6"}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Formas de Pagamento</h2>
          <p className="text-sm text-slate-600">Analytics completo de uso e performance</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Formas Ativas</p>
                <p className="text-3xl font-bold text-green-600">{totalAtivas}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Disponíveis PDV</p>
                <p className="text-3xl font-bold text-blue-600">{totalPDV}</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">E-commerce</p>
                <p className="text-3xl font-bold text-purple-600">{totalEcommerce}</p>
              </div>
              <CreditCard className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Integradas</p>
                <p className="text-3xl font-bold text-orange-600">{totalIntegradas}</p>
              </div>
              <Zap className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Volume de Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosAnalytics.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="forma.descricao" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_usos" fill="#3b82f6" name="Total de Usos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Valor Transacionado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosAnalytics.filter(d => d.valor_total > 0).slice(0, 8)}
                  dataKey="valor_total"
                  nameKey="forma.descricao"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `R$ ${(entry.valor_total / 1000).toFixed(0)}k`}
                >
                  {dadosAnalytics.filter(d => d.valor_total > 0).slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* TOP PERFORMERS */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="bg-green-100 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="w-5 h-5" />
              Top 5 por Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {dadosAnalytics.slice(0, 5).map((item, index) => (
                <div key={item.forma.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-600 text-white">#{index + 1}</Badge>
                    <span className="text-2xl">{item.forma.icone}</span>
                    <p className="font-semibold">{item.forma.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{item.total_usos}</p>
                    <p className="text-xs text-slate-500">transações</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="bg-blue-100 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <DollarSign className="w-5 h-5" />
              Top 5 por Valor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {dadosAnalytics.filter(d => d.valor_total > 0).slice(0, 5).map((item, index) => (
                <div key={item.forma.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-600 text-white">#{index + 1}</Badge>
                    <span className="text-2xl">{item.forma.icone}</span>
                    <div>
                      <p className="font-semibold">{item.forma.descricao}</p>
                      <p className="text-xs text-slate-500">
                        Ticket médio: R$ {item.ticket_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECOMENDAÇÕES IA */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 border-b">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="w-5 h-5" />
            🤖 Recomendações da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {dadosAnalytics.filter(d => d.total_usos === 0).length > 0 && (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertDescription>
                <strong>⚠️ Formas sem uso:</strong> {dadosAnalytics.filter(d => d.total_usos === 0).map(d => d.forma.descricao).join(', ')}. Considere desativar para simplificar a gestão.
              </AlertDescription>
            </Alert>
          )}
          
          {formasPagamento.filter(f => f.tipo === 'PIX' && !f.gerar_cobranca_online).length > 0 && (
            <Alert className="border-blue-300 bg-blue-50">
              <AlertDescription>
                <strong>💡 Oportunidade:</strong> Você tem {formasPagamento.filter(f => f.tipo === 'PIX' && !f.gerar_cobranca_online).length} forma(s) PIX sem cobrança online. Ative para gerar QR Codes automaticamente.
              </AlertDescription>
            </Alert>
          )}

          {dadosAnalytics[0]?.total_usos > 0 && (
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription>
                <strong>🏆 Destaque:</strong> {dadosAnalytics[0].forma.descricao} é sua forma mais utilizada com {dadosAnalytics[0].total_usos} transações e R$ {dadosAnalytics[0].valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </AlertDescription>
            </Alert>
          )}

          {formasPagamento.filter(f => f.aceita_desconto && f.percentual_desconto_padrao > 5).length > 0 && (
            <Alert className="border-amber-300 bg-amber-50">
              <AlertDescription>
                <strong>⚡ Otimização:</strong> Você tem formas com desconto acima de 5%. Monitore o impacto na margem de lucro.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}