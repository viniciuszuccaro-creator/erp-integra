import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

/**
 * Relatório Financeiro - V21.3
 * Análises de recebimento, pagamento e margem
 */
export default function RelatorioFinanceiro({ contasReceber = [], contasPagar = [] }) {
  const totalRecebido = contasReceber
    .filter(c => c.status === 'Recebido')
    .reduce((sum, c) => sum + (c.valor_recebido || c.valor || 0), 0);

  const totalPago = contasPagar
    .filter(c => c.status === 'Pago')
    .reduce((sum, c) => sum + (c.valor_pago || c.valor || 0), 0);

  const saldoLiquido = totalRecebido - totalPago;

  // Receitas por mês
  const receitasPorMes = {};
  contasReceber.filter(c => c.status === 'Recebido').forEach(c => {
    const mes = c.data_recebimento?.slice(0, 7) || 'Sem data';
    receitasPorMes[mes] = (receitasPorMes[mes] || 0) + (c.valor_recebido || c.valor || 0);
  });

  const dadosGrafico = Object.entries(receitasPorMes)
    .sort()
    .slice(-6)
    .map(([mes, valor]) => ({
      mes,
      receita: valor,
      despesa: contasPagar
        .filter(c => c.status === 'Pago' && c.data_pagamento?.slice(0, 7) === mes)
        .reduce((s, c) => s + (c.valor_pago || c.valor || 0), 0)
    }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Recebido</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Pago</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md ${saldoLiquido >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo Líquido</CardTitle>
            <DollarSign className={`w-5 h-5 ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas vs Despesas (Últimos 6 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="receita" fill="#10b981" name="Receitas" />
              <Bar dataKey="despesa" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}