import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Package, 
  Truck, 
  ShoppingCart, 
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Factory,
  CreditCard
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function DashboardOperacionalBI() {
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");

  const { data: pedidos = [] } = useQuery({
    queryKey: ["pedidos"],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: ops = [] } = useQuery({
    queryKey: ["ordens-producao"],
    queryFn: () => base44.entities.OrdemProducao.list(),
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ["entregas"],
    queryFn: () => base44.entities.Entrega.list(),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ["contasReceber"],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos"],
    queryFn: () => base44.entities.Produto.list(),
  });

  const totalVendas = pedidos.reduce((acc, p) => acc + (p.valor_total || 0), 0);
  const pedidosAbertos = pedidos.filter(p => 
    p.status !== "Entregue" && p.status !== "Cancelado"
  ).length;
  const opsEmProducao = ops.filter(op => 
    op.status !== "Concluída" && op.status !== "Cancelada"
  ).length;
  const entregasPendentes = entregas.filter(e => 
    e.status !== "Entregue"
  ).length;
  const contasAtrasadas = contasReceber.filter(c => c.status === "Atrasado").length;

  const dadosVendasMes = [
    { mes: "Jan", valor: 45000 },
    { mes: "Fev", valor: 52000 },
    { mes: "Mar", valor: 48000 },
    { mes: "Abr", valor: 61000 },
    { mes: "Mai", valor: 55000 },
    { mes: "Jun", valor: 67000 },
  ];

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Operacional BI</h1>
          <p className="text-sm text-slate-600 mt-1">Visão consolidada com IA e análises preditivas</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={periodoFiltro}
            onChange={(e) => setPeriodoFiltro(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Ano</option>
          </select>

          <Button className="bg-purple-600 hover:bg-purple-700">
            <Zap className="w-4 h-4 mr-2" />
            IA: Sugerir Ações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Vendas Total</p>
                <p className="text-2xl font-bold">
                  R$ {(totalVendas / 1000).toFixed(0)}k
                </p>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Pedidos Abertos</p>
                <p className="text-2xl font-bold">{pedidosAbertos}</p>
              </div>
              <ShoppingCart className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">OPs Produção</p>
                <p className="text-2xl font-bold">{opsEmProducao}</p>
              </div>
              <Factory className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Entregas Pend.</p>
                <p className="text-2xl font-bold">{entregasPendentes}</p>
              </div>
              <Truck className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Contas Atrasadas</p>
                <p className="text-2xl font-bold">{contasAtrasadas}</p>
              </div>
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Produtos</p>
                <p className="text-2xl font-bold">{produtos.length}</p>
              </div>
              <Package className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosVendasMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Evolução de Produção</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[
                { mes: "Jan", ops: 12 },
                { mes: "Fev", ops: 15 },
                { mes: "Mar", ops: 18 },
                { mes: "Abr", ops: 22 },
                { mes: "Mai", ops: 19 },
                { mes: "Jun", ops: 25 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ops" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Sugestões da IA de Decisão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contasAtrasadas > 0 && (
              <div className="p-3 bg-white rounded-lg border border-orange-200">
                <p className="font-semibold text-sm text-orange-900">
                  💰 {contasAtrasadas} conta(s) atrasada(s)
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Sugestão: Ativar régua de cobrança automatizada ou aplicar desconto para quitação imediata
                </p>
              </div>
            )}

            {opsEmProducao > 10 && (
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="font-semibold text-sm text-blue-900">
                  🏭 {opsEmProducao} OPs em produção
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Sugestão: Verificar gargalos e redistribuir cargas entre turnos
                </p>
              </div>
            )}

            {entregasPendentes > 5 && (
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <p className="font-semibold text-sm text-green-900">
                  🚚 {entregasPendentes} entrega(s) pendente(s)
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Sugestão: Otimizar rotas com IA para reduzir custos de frete
                </p>
              </div>
            )}

            {contasAtrasadas === 0 && opsEmProducao < 5 && entregasPendentes === 0 && (
              <div className="text-center py-8 text-slate-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Tudo funcionando perfeitamente! 🎉</p>
                <p className="text-xs mt-1">A IA não detectou ações urgentes no momento.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}