import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, DollarSign, Brain, Calendar } from "lucide-react";

/**
 * V21.3 - Fluxo de Caixa Projetado
 * COM: Índice de Previsão IA, Peso nas Projeções
 */
export default function FluxoCaixaProjetado({ empresaId }) {
  const [periodoMeses, setPeriodoMeses] = useState(3);

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['fluxo-receber', empresaId],
    queryFn: () => base44.entities.ContaReceber.filter({
      empresa_id: empresaId,
      status: { $in: ['Pendente', 'Atrasado'] }
    })
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['fluxo-pagar', empresaId],
    queryFn: () => base44.entities.ContaPagar.filter({
      empresa_id: empresaId,
      status: { $in: ['Pendente', 'Atrasado'] }
    })
  });

  // Projetar fluxo por mês
  const projetarFluxo = () => {
    const meses = [];
    const hoje = new Date();

    for (let i = 0; i < periodoMeses; i++) {
      const mesRef = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const mesProx = new Date(hoje.getFullYear(), hoje.getMonth() + i + 1, 0);

      const mesKey = mesRef.toISOString().substring(0, 7); // YYYY-MM

      // Receber
      const receberMes = contasReceber.filter(c => {
        const venc = new Date(c.data_vencimento);
        return venc >= mesRef && venc <= mesProx;
      });

      // V21.3: Aplicar índice de previsão IA
      const receberPrevisto = receberMes.reduce((sum, c) => {
        const indicePrev = c.indice_previsao_pagamento || 50;
        return sum + (c.valor * (indicePrev / 100));
      }, 0);

      const receberTotal = receberMes.reduce((sum, c) => sum + c.valor, 0);

      // Pagar
      const pagarMes = contasPagar.filter(c => {
        const venc = new Date(c.data_vencimento);
        return venc >= mesRef && venc <= mesProx;
      });

      const pagarTotal = pagarMes.reduce((sum, c) => sum + c.valor, 0);

      meses.push({
        mes: mesKey,
        mesNome: mesRef.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receber_previsto: receberPrevisto,
        receber_total: receberTotal,
        pagar: pagarTotal,
        saldo: receberPrevisto - pagarTotal,
        confianca_ia: receberTotal > 0 
          ? (receberMes.reduce((sum, c) => sum + (c.indice_previsao_pagamento || 50), 0) / receberMes.length)
          : 50
      });
    }

    return meses;
  };

  const dadosFluxo = projetarFluxo();

  const saldoAcumulado = dadosFluxo.reduce((acc, mes, idx) => {
    const anterior = idx > 0 ? acc[idx - 1].acumulado : 0;
    acc.push({
      ...mes,
      acumulado: anterior + mes.saldo
    });
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Fluxo de Caixa Projetado (V21.3)
            </CardTitle>
            <select
              value={periodoMeses}
              onChange={(e) => setPeriodoMeses(parseInt(e.target.value))}
              className="p-2 border rounded-lg bg-white"
            >
              <option value="3">Próximos 3 meses</option>
              <option value="6">Próximos 6 meses</option>
              <option value="12">Próximos 12 meses</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Alert className="border-purple-300 bg-purple-50">
            <Brain className="w-4 h-4 text-purple-600" />
            <AlertDescription className="text-sm text-purple-800">
              <strong>IA Preditiva:</strong> Os valores de recebimento são ponderados pelo índice de previsão de pagamento calculado pela IA.
            </AlertDescription>
          </Alert>

          {/* Gráfico Principal */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={saldoAcumulado}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mesNome" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Legend />
              <Bar dataKey="receber_previsto" fill="#10b981" name="Receber (IA)" />
              <Bar dataKey="pagar" fill="#ef4444" name="Pagar" />
              <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
            </BarChart>
          </ResponsiveContainer>

          {/* Gráfico Acumulado */}
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={saldoAcumulado}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mesNome" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="acumulado" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Saldo Acumulado"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Tabela Resumo */}
          <div className="space-y-2">
            {saldoAcumulado.map((mes, idx) => (
              <Card key={idx} className={`border ${
                mes.saldo < 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
              }`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <p className="font-bold">{mes.mesNome.toUpperCase()}</p>
                      <Badge className="bg-purple-600" title="Confiança da Previsão IA">
                        <Brain className="w-3 h-3 mr-1" />
                        {mes.confianca_ia.toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Receber (IA)</p>
                        <p className="font-bold text-green-600">
                          +R$ {mes.receber_previsto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-slate-500">Pagar</p>
                        <p className="font-bold text-red-600">
                          -R$ {mes.pagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs text-slate-500">Saldo</p>
                        <p className={`font-bold text-lg ${mes.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {mes.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}