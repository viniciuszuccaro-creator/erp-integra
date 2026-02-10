import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart as RechartsPie, Pie, Cell } from "recharts";
import { Package, PieChart } from "lucide-react";

export default function TopProdutosStatusPeriodoSection({ topProdutos, dadosVendasStatus, COLORS }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            Top 5 Produtos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {topProdutos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProdutos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="nome" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                         contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="valor" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma venda no período</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            Pedidos por Status (Período Atual)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dadosVendasStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie data={dadosVendasStatus} cx="50%" cy="50%" labelLine={false}
                     label={({nome, quantidade}) => `${nome}: ${quantidade}`}
                     outerRadius={100} fill="#8884d8" dataKey="quantidade">
                  {dadosVendasStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} pedidos`, props.payload.nome]}
                         contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="py-20 text-center text-slate-500">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhum pedido no período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}