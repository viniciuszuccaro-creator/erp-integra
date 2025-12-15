import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles, Calendar, DollarSign, Users, Package, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalisadorRecebimentosIA() {
  const [periodoAnalise, setPeriodoAnalise] = useState(30);

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  // Análise de Inadimplência por Cliente
  const analisarInadimplencia = () => {
    const clientesComAtraso = {};
    
    contasReceber
      .filter(c => c.status === 'Atrasado' || (c.status === 'Pendente' && new Date(c.data_vencimento) < new Date()))
      .forEach(conta => {
        if (!clientesComAtraso[conta.cliente_id]) {
          const cliente = clientes.find(cl => cl.id === conta.cliente_id);
          clientesComAtraso[conta.cliente_id] = {
            cliente_nome: conta.cliente,
            total_atrasado: 0,
            quantidade_titulos: 0,
            dias_medio_atraso: 0,
            score_pagamento: cliente?.score_pagamento || 100,
            risco: 'Baixo'
          };
        }
        
        const diasAtraso = Math.floor((new Date() - new Date(conta.data_vencimento)) / (1000 * 60 * 60 * 24));
        clientesComAtraso[conta.cliente_id].total_atrasado += conta.valor || 0;
        clientesComAtraso[conta.cliente_id].quantidade_titulos += 1;
        clientesComAtraso[conta.cliente_id].dias_medio_atraso += diasAtraso;
      });

    Object.values(clientesComAtraso).forEach(cliente => {
      cliente.dias_medio_atraso = Math.round(cliente.dias_medio_atraso / cliente.quantidade_titulos);
      
      if (cliente.dias_medio_atraso > 60 || cliente.total_atrasado > 50000) {
        cliente.risco = 'Alto';
      } else if (cliente.dias_medio_atraso > 30 || cliente.total_atrasado > 20000) {
        cliente.risco = 'Médio';
      }
    });

    return Object.values(clientesComAtraso).sort((a, b) => b.total_atrasado - a.total_atrasado);
  };

  // Análise de Performance por Canal
  const analisarCanais = () => {
    const canais = {};
    
    contasReceber.forEach(conta => {
      const canal = conta.canal_origem || 'Manual';
      if (!canais[canal]) {
        canais[canal] = {
          canal,
          total: 0,
          recebido: 0,
          pendente: 0,
          atrasado: 0,
          ticket_medio: 0,
          quantidade: 0
        };
      }
      
      canais[canal].total += conta.valor || 0;
      canais[canal].quantidade += 1;
      
      if (conta.status === 'Recebido') {
        canais[canal].recebido += conta.valor || 0;
      } else if (conta.status === 'Atrasado') {
        canais[canal].atrasado += conta.valor || 0;
      } else {
        canais[canal].pendente += conta.valor || 0;
      }
    });

    Object.values(canais).forEach(canal => {
      canal.ticket_medio = canal.total / canal.quantidade;
      canal.taxa_recebimento = (canal.recebido / canal.total) * 100;
    });

    return Object.values(canais).sort((a, b) => b.total - a.total);
  };

  // Previsão de Recebimentos (próximos 30 dias)
  const preverRecebimentos = () => {
    const hoje = new Date();
    const proximos30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const previsao = contasReceber
      .filter(c => c.status === 'Pendente')
      .filter(c => {
        const venc = new Date(c.data_vencimento);
        return venc >= hoje && venc <= proximos30Dias;
      })
      .reduce((acc, conta) => {
        const semana = Math.ceil((new Date(conta.data_vencimento) - hoje) / (7 * 24 * 60 * 60 * 1000));
        const cliente = clientes.find(cl => cl.id === conta.cliente_id);
        const probabilidadePagamento = cliente?.score_pagamento || 50;
        
        if (!acc[semana]) {
          acc[semana] = {
            semana: `Semana ${semana}`,
            previsto: 0,
            provavel: 0,
            pessimista: 0
          };
        }
        
        acc[semana].previsto += conta.valor;
        acc[semana].provavel += conta.valor * (probabilidadePagamento / 100);
        acc[semana].pessimista += conta.valor * 0.5; // 50% pessimista
        
        return acc;
      }, {});

    return Object.values(previsao).sort((a, b) => parseInt(a.semana.split(' ')[1]) - parseInt(b.semana.split(' ')[1]));
  };

  // Análise de Marketplaces
  const analisarMarketplaces = () => {
    const marketplaces = {};
    
    contasReceber
      .filter(c => c.marketplace_origem && c.marketplace_origem !== 'Nenhum')
      .forEach(conta => {
        const mp = conta.marketplace_origem;
        if (!marketplaces[mp]) {
          marketplaces[mp] = {
            nome: mp,
            total: 0,
            recebido: 0,
            pendente: 0,
            quantidade: 0,
            taxa_media: 0
          };
        }
        
        marketplaces[mp].total += conta.valor || 0;
        marketplaces[mp].quantidade += 1;
        
        if (conta.status === 'Recebido') {
          marketplaces[mp].recebido += conta.valor || 0;
        } else {
          marketplaces[mp].pendente += conta.valor || 0;
        }
      });

    return Object.values(marketplaces).sort((a, b) => b.total - a.total);
  };

  // Recomendações da IA
  const gerarRecomendacoesIA = () => {
    const inadimplencia = analisarInadimplencia();
    const canais = analisarCanais();
    const recomendacoes = [];

    if (inadimplencia.length > 0) {
      const totalInadimplente = inadimplencia.reduce((sum, c) => sum + c.total_atrasado, 0);
      recomendacoes.push({
        tipo: 'alerta',
        titulo: 'Inadimplência Detectada',
        descricao: `${inadimplencia.length} cliente(s) com R$ ${totalInadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em atraso. Ative a régua de cobrança automática.`,
        acao: 'Ativar Régua de Cobrança',
        prioridade: inadimplencia.filter(c => c.risco === 'Alto').length > 0 ? 'alta' : 'media'
      });
    }

    const canalMaisLucrativo = canais[0];
    if (canalMaisLucrativo && canalMaisLucrativo.taxa_recebimento < 80) {
      recomendacoes.push({
        tipo: 'oportunidade',
        titulo: `Canal ${canalMaisLucrativo.canal} com baixa conversão`,
        descricao: `Taxa de recebimento de apenas ${canalMaisLucrativo.taxa_recebimento.toFixed(1)}%. Revise o processo de cobrança neste canal.`,
        acao: 'Revisar Processo',
        prioridade: 'media'
      });
    }

    const contasVencendoHoje = contasReceber.filter(c => 
      c.status === 'Pendente' && 
      new Date(c.data_vencimento).toDateString() === new Date().toDateString()
    );

    if (contasVencendoHoje.length > 0) {
      recomendacoes.push({
        tipo: 'acao',
        titulo: 'Títulos Vencendo Hoje',
        descricao: `${contasVencendoHoje.length} título(s) vencendo hoje. Envie lembretes automáticos.`,
        acao: 'Enviar Lembretes',
        prioridade: 'alta'
      });
    }

    return recomendacoes;
  };

  const clientesInadimplentes = analisarInadimplencia();
  const performanceCanais = analisarCanais();
  const previsaoRecebimentos = preverRecebimentos();
  const performanceMarketplaces = analisarMarketplaces();
  const recomendacoesIA = gerarRecomendacoesIA();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 w-full h-full overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Análise Inteligente de Recebimentos
          </h2>
          <p className="text-sm text-slate-600">Insights gerados por IA para otimizar seu fluxo de caixa</p>
        </div>
      </div>

      {/* Recomendações da IA */}
      {recomendacoesIA.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Recomendações da IA
          </h3>
          {recomendacoesIA.map((rec, idx) => (
            <Alert key={idx} className={
              rec.prioridade === 'alta' ? 'border-red-300 bg-red-50' :
              rec.prioridade === 'media' ? 'border-yellow-300 bg-yellow-50' :
              'border-blue-300 bg-blue-50'
            }>
              <AlertDescription>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{rec.titulo}</p>
                    <p className="text-xs mt-1">{rec.descricao}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0">
                    {rec.acao}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Previsão de Recebimentos */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Previsão de Recebimentos (Próximos 30 Dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={previsaoRecebimentos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Bar dataKey="previsto" name="Previsto" fill="#10b981" />
              <Bar dataKey="provavel" name="Provável (IA)" fill="#3b82f6" />
              <Bar dataKey="pessimista" name="Cenário Pessimista" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grid de Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes Inadimplentes */}
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Clientes com Maior Inadimplência
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {clientesInadimplentes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum cliente inadimplente</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientesInadimplentes.slice(0, 10).map((cliente, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{cliente.cliente_nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={
                          cliente.risco === 'Alto' ? 'bg-red-100 text-red-700' :
                          cliente.risco === 'Médio' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        } size="sm">
                          {cliente.risco}
                        </Badge>
                        <span className="text-xs text-slate-600">{cliente.quantidade_titulos} título(s)</span>
                        <span className="text-xs text-slate-600">• {cliente.dias_medio_atraso} dias atraso</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">R$ {cliente.total_atrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-500">Score: {cliente.score_pagamento}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance por Canal */}
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Performance por Canal de Origem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {performanceCanais.map((canal, idx) => (
                <div key={idx} className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{canal.canal}</p>
                      <p className="text-xs text-slate-600">{canal.quantidade} títulos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">R$ {canal.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-600">Ticket: R$ {canal.ticket_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${canal.taxa_recebimento}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-green-600">{canal.taxa_recebimento.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance de Marketplaces */}
      {performanceMarketplaces.length > 0 && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Recebimentos por Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceMarketplaces}
                    dataKey="total"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.nome}: R$ ${entry.total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
                  >
                    {performanceMarketplaces.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {performanceMarketplaces.map((mp, idx) => (
                  <div key={idx} className="p-3 bg-white border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{mp.nome}</p>
                        <p className="text-xs text-slate-600">{mp.quantidade} vendas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: COLORS[idx % COLORS.length] }}>
                          R$ {mp.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex gap-1 mt-1">
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            Recebido: R$ {mp.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">💡 Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">
              <strong>Canal mais lucrativo:</strong> {performanceCanais[0]?.canal || 'N/A'} com {performanceCanais[0]?.taxa_recebimento.toFixed(1)}% de taxa de recebimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">🎯 Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">
              <strong>Oportunidade de melhoria:</strong> Reduzir inadimplência em {clientesInadimplentes.length > 0 ? '30%' : '0%'} pode liberar R$ {(clientesInadimplentes.reduce((sum, c) => sum + c.total_atrasado, 0) * 0.3).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">📊 Tendência</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">
              <strong>Previsão próxima semana:</strong> R$ {(previsaoRecebimentos[0]?.provavel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com {Math.round((previsaoRecebimentos[0]?.provavel / previsaoRecebimentos[0]?.previsto * 100) || 0)}% de probabilidade
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}