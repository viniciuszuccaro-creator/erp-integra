import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, FileText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GraficosFinanceirosMestre({ dadosFluxo, dadosCategorias }) {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* FLUXO DE CAIXA */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b p-2">
          <CardTitle className="text-sm flex items-center gap-2 font-semibold">
            <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            Fluxo Financeiro Consolidado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dadosFluxo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nome" style={{ fontSize: '11px' }} />
              <YAxis style={{ fontSize: '11px' }} />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
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
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b p-2">
          <CardTitle className="text-sm flex items-center gap-2 font-semibold">
            <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dadosCategorias}
                dataKey="valor"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={({ categoria, value }) => `${categoria}: ${(value/1000).toFixed(0)}k`}
                labelStyle={{ fontSize: '10px' }}
              >
                {dadosCategorias.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}