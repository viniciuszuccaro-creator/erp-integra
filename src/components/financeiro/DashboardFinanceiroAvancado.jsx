import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  AlertCircle, CheckCircle2, Clock, Package, ShoppingCart 
} from "lucide-react";

export default function DashboardFinanceiroAvancado({ contasReceber = [], contasPagar = [] }) {
  const [periodoAnalise, setPeriodoAnalise] = useState('30dias');

  // Filtrar por período
  const dataLimite = new Date();
  if (periodoAnalise === '30dias') dataLimite.setDate(dataLimite.getDate() - 30);
  if (periodoAnalise === '90dias') dataLimite.setDate(dataLimite.getDate() - 90);
  if (periodoAnalise === '12meses') dataLimite.setMonth(dataLimite.getMonth() - 12);

  const contasReceberPeriodo = contasReceber.filter(c => 
    new Date(c.data_emissao || c.created_date) >= dataLimite
  );
  const contasPagarPeriodo = contasPagar.filter(c => 
    new Date(c.data_emissao || c.created_date) >= dataLimite
  );

  // Análise por Canal de Origem
  const canaisOrigem = [...new Set(contasReceberPeriodo.map(c => c.canal_origem || 'Manual'))];
  const dadosCanais = canaisOrigem.map(canal => ({
    canal,
    receitas: contasReceberPeriodo.filter(c => (c.canal_origem || 'Manual') === canal).reduce((sum, c) => sum + (c.valor || 0), 0),
    quantidade: contasReceberPeriodo.filter(c => (c.canal_origem || 'Manual') === canal).length
  })).sort((a, b) => b.receitas - a.receitas);

  // Análise por Marketplace
  const marketplaces = [...new Set([
    ...contasReceberPeriodo.map(c => c.marketplace_origem).filter(Boolean),
    ...contasPagarPeriodo.map(c => c.marketplace_origem).filter(Boolean)
  ])].filter(m => m !== 'Nenhum');

  const dadosMarketplaces = marketplaces.map(marketplace => {
    const receitas = contasReceberPeriodo.filter(c => c.marketplace_origem === marketplace).reduce((sum, c) => sum + (c.valor || 0), 0);
    const despesas = contasPagarPeriodo.filter(c => c.marketplace_origem === marketplace).reduce((sum, c) => sum + (c.valor || 0), 0);
    return {
      marketplace,
      receitas,
      despesas,
      lucro: receitas - despesas,
      margem: receitas > 0 ? ((receitas - despesas) / receitas * 100) : 0
    };
  }).sort((a, b) => b.lucro - a.lucro);

  // Análise Temporal (últimos 6 meses)
  const mesesAnalise = [];
  for (let i = 5; i >= 0; i--) {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
    
    const receitasMes = contasReceber.filter(c => {
      const dataEmissao = new Date(c.data_emissao || c.created_date);
      return dataEmissao.getMonth() === data.getMonth() && dataEmissao.getFullYear() === data.getFullYear();
    }).reduce((sum, c) => sum + (c.valor || 0), 0);

    const despesasMes = contasPagar.filter(c => {
      const dataEmissao = new Date(c.data_emissao || c.created_date);
      return dataEmissao.getMonth() === data.getMonth() && dataEmissao.getFullYear() === data.getFullYear();
    }).reduce((sum, c) => sum + (c.valor || 0), 0);

    mesesAnalise.push({
      mes: mesAno,
      receitas: receitasMes,
      despesas: despesasMes,
      saldo: receitasMes - despesasMes
    });
  }

  // Status de Recebimento
  const statusRecebimento = [
    { 
      name: 'Recebidas', 
      value: contasReceberPeriodo.filter(c => c.status === 'Recebido').length,
      total: contasReceberPeriodo.filter(c => c.status === 'Recebido').reduce((sum, c) => sum + (c.valor || 0), 0),
      color: '#10b981'
    },
    { 
      name: 'Pendentes', 
      value: contasReceberPeriodo.filter(c => c.status === 'Pendente').length,
      total: contasReceberPeriodo.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0),
      color: '#f59e0b'
    },
    { 
      name: 'Atrasadas', 
      value: contasReceberPeriodo.filter(c => c.status === 'Atrasado').length,
      total: contasReceberPeriodo.filter(c => c.status === 'Atrasado').reduce((sum, c) => sum + (c.valor || 0), 0),
      color: '#ef4444'
    }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Dashboard Analítico Avançado
        </h3>
        <Tabs value={periodoAnalise} onValueChange={setPeriodoAnalise} className="w-auto">
          <TabsList>
            <TabsTrigger value="30dias">30 dias</TabsTrigger>
            <TabsTrigger value="90dias">90 dias</TabsTrigger>
            <TabsTrigger value="12meses">12 meses</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Análise por Canal de Origem */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            Receitas por Canal de Origem
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosCanais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Legend />
              <Bar dataKey="receitas" fill="#3b82f6" name="Receitas" />
              <Bar dataKey="quantidade" fill="#8b5cf6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Análise por Marketplace */}
      {dadosMarketplaces.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Lucratividade por Marketplace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 mb-4">
              {dadosMarketplaces.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{item.marketplace}</span>
                    <Badge className={item.lucro >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      Margem: {item.margem.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Receitas:</span>
                      <p className="font-semibold text-green-600">R$ {item.receitas.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Despesas:</span>
                      <p className="font-semibold text-red-600">R$ {item.despesas.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Lucro:</span>
                      <p className={`font-semibold ${item.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {item.lucro.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evolução Temporal */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            Evolução Receitas vs Despesas (6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mesesAnalise}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} name="Receitas" />
              <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
              <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} name="Saldo" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status de Recebimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Status de Recebimento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusRecebimento}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusRecebimento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-sm">Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {statusRecebimento.map((status, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <div>
                    <p className="font-semibold text-sm">{status.name}</p>
                    <p className="text-xs text-slate-500">{status.value} títulos</p>
                  </div>
                </div>
                <span className="font-bold text-sm" style={{ color: status.color }}>
                  R$ {status.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Insights de IA */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="border-b bg-white/50">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            💡 Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          {dadosCanais.length > 0 && (
            <Alert className="border-blue-300 bg-blue-50">
              <AlertDescription className="text-sm text-blue-900">
                <strong>📊 Canal Mais Lucrativo:</strong> {dadosCanais[0].canal} com R$ {dadosCanais[0].receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({dadosCanais[0].quantidade} transações)
              </AlertDescription>
            </Alert>
          )}
          
          {dadosMarketplaces.length > 0 && dadosMarketplaces[0].margem > 0 && (
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription className="text-sm text-green-900">
                <strong>🏆 Marketplace Top:</strong> {dadosMarketplaces[0].marketplace} com margem de {dadosMarketplaces[0].margem.toFixed(1)}% (Lucro: R$ {dadosMarketplaces[0].lucro.toFixed(2)})
              </AlertDescription>
            </Alert>
          )}

          {mesesAnalise.length > 0 && (
            <Alert className="border-purple-300 bg-purple-50">
              <AlertDescription className="text-sm text-purple-900">
                <strong>📈 Tendência:</strong> {
                  mesesAnalise[mesesAnalise.length - 1].saldo > mesesAnalise[0].saldo
                    ? `Crescimento de ${((mesesAnalise[mesesAnalise.length - 1].saldo / mesesAnalise[0].saldo - 1) * 100).toFixed(1)}% nos últimos 6 meses`
                    : `Necessita atenção - Redução de saldo detectada`
                }
              </AlertDescription>
            </Alert>
          )}

          {contasReceber.filter(c => c.status === 'Atrasado').length > 5 && (
            <Alert className="border-red-300 bg-red-50">
              <AlertDescription className="text-sm text-red-900">
                <strong>⚠️ Alerta de Inadimplência:</strong> {contasReceber.filter(c => c.status === 'Atrasado').length} títulos atrasados. Recomenda-se ativar régua de cobrança automática.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}