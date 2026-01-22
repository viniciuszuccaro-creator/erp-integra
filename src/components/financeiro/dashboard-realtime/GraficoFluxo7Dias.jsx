import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GraficoFluxo7Dias({ dadosFluxoCaixa7Dias }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b p-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600 flex-shrink-0" />
          Fluxo de Caixa - Últimos 7 Dias (mil)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dadosFluxoCaixa7Dias}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="dia" style={{ fontSize: '11px' }} />
            <YAxis style={{ fontSize: '11px' }} />
            <Tooltip />
            <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} name="Receitas" />
            <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
            <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}