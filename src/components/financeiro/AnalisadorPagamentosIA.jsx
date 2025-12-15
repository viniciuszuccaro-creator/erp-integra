import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingDown, AlertTriangle, Sparkles, DollarSign, Package, BarChart3, Shield } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalisadorPagamentosIA() {
  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  // Análise por Categoria
  const analisarCategorias = () => {
    const categorias = {};
    
    contasPagar.forEach(conta => {
      const cat = conta.categoria || 'Outros';
      if (!categorias[cat]) {
        categorias[cat] = {
          categoria: cat,
          total: 0,
          pago: 0,
          pendente: 0,
          quantidade: 0
        };
      }
      
      categorias[cat].total += conta.valor || 0;
      categorias[cat].quantidade += 1;
      
      if (conta.status === 'Pago') {
        categorias[cat].pago += conta.valor || 0;
      } else {
        categorias[cat].pendente += conta.valor || 0;
      }
    });

    return Object.values(categorias).sort((a, b) => b.total - a.total);
  };

  // Análise de Marketplaces
  const analisarMarketplaces = () => {
    const marketplaces = {};
    
    contasPagar
      .filter(c => c.marketplace_origem && c.marketplace_origem !== 'Nenhum')
      .forEach(conta => {
        const mp = conta.marketplace_origem;
        if (!marketplaces[mp]) {
          marketplaces[mp] = {
            nome: mp,
            total: 0,
            pago: 0,
            quantidade: 0,
            taxa_esperada: conta.taxa_marketplace_esperada || 0,
            taxa_cobrada: conta.taxa_marketplace_cobrada || 0
          };
        }
        
        marketplaces[mp].total += conta.valor || 0;
        marketplaces[mp].quantidade += 1;
        
        if (conta.status === 'Pago') {
          marketplaces[mp].pago += conta.valor || 0;
        }
      });

    return Object.values(marketplaces).sort((a, b) => b.total - a.total);
  };

  // Detectar Duplicidades
  const detectarDuplicidades = () => {
    const duplicidades = [];
    
    contasPagar.forEach((conta, idx) => {
      if (conta.duplicidade_detectada) {
        duplicidades.push({
          conta,
          contas_similares: conta.contas_similares_ids || []
        });
      }
    });

    return duplicidades;
  };

  // Análise de Fornecedores Críticos
  const analisarFornecedoresCriticos = () => {
    const fornecedoresAnalise = {};
    
    contasPagar.forEach(conta => {
      if (!fornecedoresAnalise[conta.fornecedor_id]) {
        const fornecedor = fornecedores.find(f => f.id === conta.fornecedor_id);
        fornecedoresAnalise[conta.fornecedor_id] = {
          fornecedor_nome: conta.fornecedor,
          total_devido: 0,
          quantidade_titulos: 0,
          atrasados: 0,
          score: fornecedor?.score_confiabilidade || 50
        };
      }
      
      fornecedoresAnalise[conta.fornecedor_id].total_devido += conta.valor || 0;
      fornecedoresAnalise[conta.fornecedor_id].quantidade_titulos += 1;
      
      if (conta.status === 'Pendente' && new Date(conta.data_vencimento) < new Date()) {
        fornecedoresAnalise[conta.fornecedor_id].atrasados += 1;
      }
    });

    return Object.values(fornecedoresAnalise)
      .sort((a, b) => b.total_devido - a.total_devido)
      .slice(0, 10);
  };

  // Recomendações da IA
  const gerarRecomendacoesIA = () => {
    const recomendacoes = [];
    const duplicidades = detectarDuplicidades();
    const categorias = analisarCategorias();

    if (duplicidades.length > 0) {
      recomendacoes.push({
        tipo: 'alerta',
        titulo: 'Possíveis Duplicidades Detectadas',
        descricao: `IA detectou ${duplicidades.length} possível(is) duplicidade(s). Revise para evitar pagamentos duplicados.`,
        acao: 'Revisar Duplicidades',
        prioridade: 'alta'
      });
    }

    const categoriaMaisCara = categorias[0];
    if (categoriaMaisCara && categoriaMaisCara.total > 50000) {
      recomendacoes.push({
        tipo: 'oportunidade',
        titulo: `Categoria ${categoriaMaisCara.categoria} com alto custo`,
        descricao: `R$ ${categoriaMaisCara.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} investidos. Considere renegociar contratos.`,
        acao: 'Analisar Contratos',
        prioridade: 'media'
      });
    }

    const contasAguardandoAprovacao = contasPagar.filter(c => c.status_pagamento === 'Pendente' || c.status === 'Pendente');
    if (contasAguardandoAprovacao.length > 5) {
      recomendacoes.push({
        tipo: 'acao',
        titulo: 'Fila de Aprovação Acumulada',
        descricao: `${contasAguardandoAprovacao.length} conta(s) aguardando aprovação. Acelere o processo de aprovação.`,
        acao: 'Aprovar Pendentes',
        prioridade: 'media'
      });
    }

    return recomendacoes;
  };

  const performanceCategorias = analisarCategorias();
  const performanceMarketplaces = analisarMarketplaces();
  const fornecedoresCriticos = analisarFornecedoresCriticos();
  const recomendacoesIA = gerarRecomendacoesIA();

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6 w-full h-full overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Análise Inteligente de Pagamentos
          </h2>
          <p className="text-sm text-slate-600">Insights gerados por IA para otimizar custos e gestão de fornecedores</p>
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

      {/* Grid de Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por Categoria */}
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceCategorias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#ef4444" />
                <Bar dataKey="pago" name="Pago" fill="#10b981" />
                <Bar dataKey="pendente" name="Pendente" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fornecedores Críticos */}
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Top Fornecedores (por valor devido)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {fornecedoresCriticos.map((forn, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{forn.fornecedor_nome}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-600">{forn.quantidade_titulos} título(s)</span>
                      {forn.atrasados > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {forn.atrasados} atrasado(s)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">R$ {forn.total_devido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-slate-500">Score: {forn.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxas de Marketplace */}
      {performanceMarketplaces.length > 0 && (
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Análise de Taxas de Marketplace
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
                        <p className="text-xs text-slate-600">{mp.quantidade} taxas cobradas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">R$ {mp.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            Taxa: {mp.taxa_cobrada || mp.taxa_esperada}%
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

      {/* Resumo de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">💰 Total de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {contasPagar.reduce((sum, c) => sum + (c.valor || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">⏳ Aguardando Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {contasPagar.filter(c => c.status_pagamento === 'Pendente' || c.status === 'Pendente').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">✅ Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {contasPagar.filter(c => c.status === 'Pago').reduce((sum, c) => sum + (c.valor || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">🔍 Categoria Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-bold text-slate-900">
              {performanceCategorias[0]?.categoria || 'N/A'}
            </p>
            <p className="text-xs text-slate-600">
              R$ {(performanceCategorias[0]?.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">💡 Insight</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">
              <strong>Maior categoria de gasto:</strong> {performanceCategorias[0]?.categoria || 'N/A'} representa {((performanceCategorias[0]?.total / contasPagar.reduce((sum, c) => sum + (c.valor || 0), 0)) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">🎯 Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">
              <strong>Oportunidade:</strong> Negociar descontos de 5% pode economizar R$ {(contasPagar.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0) * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">📊 Tendência</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700">
              <strong>Aprovação necessária:</strong> {contasPagar.filter(c => c.status === 'Pendente').length} título(s) para reduzir gargalo
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}