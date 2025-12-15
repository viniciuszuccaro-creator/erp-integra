import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Sparkles, Calendar, AlertTriangle, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function PrevisaoFluxoCaixaIA() {
  const [periodoPrevisao, setPeriodoPrevisao] = useState(90); // 90 dias

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: caixaMovimentos = [] } = useQuery({
    queryKey: ['caixa-movimentos'],
    queryFn: () => base44.entities.CaixaMovimento.list(),
  });

  // Calcular saldo atual do caixa
  const calcularSaldoAtual = () => {
    const entradas = caixaMovimentos
      .filter(m => m.tipo_movimento === 'Entrada' && !m.cancelado)
      .reduce((sum, m) => sum + (m.valor || 0), 0);
    
    const saidas = caixaMovimentos
      .filter(m => m.tipo_movimento === 'Saída' && !m.cancelado)
      .reduce((sum, m) => sum + (m.valor || 0), 0);
    
    return entradas - saidas;
  };

  // Prever fluxo de caixa
  const preverFluxoCaixa = () => {
    const hoje = new Date();
    const previsao = [];
    let saldoAcumulado = calcularSaldoAtual();

    for (let dia = 0; dia <= periodoPrevisao; dia += 7) {
      const dataRef = new Date(hoje.getTime() + dia * 24 * 60 * 60 * 1000);
      const proximaSemana = new Date(dataRef.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Recebimentos previstos
      const receberNaSemana = contasReceber
        .filter(c => c.status === 'Pendente')
        .filter(c => {
          const venc = new Date(c.data_vencimento);
          return venc >= dataRef && venc < proximaSemana;
        });

      const totalReceber = receberNaSemana.reduce((sum, c) => sum + (c.valor || 0), 0);
      
      // Calcular probabilidade de recebimento baseado no score do cliente
      const receberProbavel = receberNaSemana.reduce((sum, c) => {
        const cliente = clientes.find(cl => cl.id === c.cliente_id);
        const probabilidade = (cliente?.score_pagamento || 50) / 100;
        return sum + (c.valor * probabilidade);
      }, 0);

      // Pagamentos previstos
      const pagarNaSemana = contasPagar
        .filter(c => c.status === 'Pendente' || c.status === 'Aprovado')
        .filter(c => {
          const venc = new Date(c.data_vencimento);
          return venc >= dataRef && venc < proximaSemana;
        });

      const totalPagar = pagarNaSemana.reduce((sum, c) => sum + (c.valor || 0), 0);

      // Saldo previsto
      saldoAcumulado += receberProbavel - totalPagar;

      previsao.push({
        semana: `Semana ${Math.floor(dia / 7) + 1}`,
        data: dataRef.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        entradas_otimista: totalReceber,
        entradas_provavel: receberProbavel,
        entradas_pessimista: totalReceber * 0.5,
        saidas: totalPagar,
        saldo_otimista: calcularSaldoAtual() + (totalReceber - totalPagar) * Math.floor(dia / 7 + 1),
        saldo_provavel: saldoAcumulado,
        saldo_pessimista: calcularSaldoAtual() + (totalReceber * 0.5 - totalPagar) * Math.floor(dia / 7 + 1)
      });
    }

    return previsao;
  };

  // Gerar alertas da IA
  const gerarAlertasIA = (previsao) => {
    const alertas = [];
    
    const saldosNegativos = previsao.filter(p => p.saldo_provavel < 0);
    if (saldosNegativos.length > 0) {
      alertas.push({
        tipo: 'critico',
        titulo: 'Risco de Saldo Negativo',
        descricao: `Previsão indica saldo negativo em ${saldosNegativos.length} semana(s). Considere adiar pagamentos ou antecipar recebimentos.`,
        prioridade: 'alta'
      });
    }

    const saldoBaixo = previsao.filter(p => p.saldo_provavel > 0 && p.saldo_provavel < 10000);
    if (saldoBaixo.length > 0) {
      alertas.push({
        tipo: 'atencao',
        titulo: 'Saldo Baixo Previsto',
        descricao: `${saldoBaixo.length} semana(s) com saldo abaixo de R$ 10.000. Mantenha reserva de emergência.`,
        prioridade: 'media'
      });
    }

    const maiorSaida = previsao.reduce((max, p) => p.saidas > max.saidas ? p : max, previsao[0]);
    if (maiorSaida && maiorSaida.saidas > 50000) {
      alertas.push({
        tipo: 'info',
        titulo: 'Pico de Pagamentos',
        descricao: `${maiorSaida.semana} terá pagamentos de R$ ${maiorSaida.saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Planeje antecipadamente.`,
        prioridade: 'baixa'
      });
    }

    return alertas;
  };

  const previsaoFluxo = preverFluxoCaixa();
  const alertasIA = gerarAlertasIA(previsaoFluxo);
  const saldoAtual = calcularSaldoAtual();

  return (
    <div className="space-y-6 w-full h-full overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Previsão de Fluxo de Caixa (IA)
          </h2>
          <p className="text-sm text-slate-600">Análise preditiva com cenários otimista, provável e pessimista</p>
        </div>
        <Select value={String(periodoPrevisao)} onValueChange={(v) => setPeriodoPrevisao(parseInt(v))}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Próximos 30 dias</SelectItem>
            <SelectItem value="60">Próximos 60 dias</SelectItem>
            <SelectItem value="90">Próximos 90 dias</SelectItem>
            <SelectItem value="180">Próximos 180 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Saldo Atual */}
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">💰 Saldo Atual em Caixa</p>
              <p className={`text-4xl font-bold ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-16 h-16 text-blue-300" />
          </div>
        </CardContent>
      </Card>

      {/* Alertas da IA */}
      {alertasIA.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alertas da IA
          </h3>
          {alertasIA.map((alerta, idx) => (
            <Alert key={idx} className={
              alerta.prioridade === 'alta' ? 'border-red-300 bg-red-50' :
              alerta.prioridade === 'media' ? 'border-yellow-300 bg-yellow-50' :
              'border-blue-300 bg-blue-50'
            }>
              <AlertDescription>
                <p className="font-semibold text-sm">{alerta.titulo}</p>
                <p className="text-xs mt-1">{alerta.descricao}</p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Gráfico de Evolução de Saldo */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Evolução do Saldo (Cenários de Previsão)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={previsaoFluxo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Area type="monotone" dataKey="saldo_otimista" name="Otimista" stroke="#10b981" fill="#10b98120" />
              <Area type="monotone" dataKey="saldo_provavel" name="Provável (IA)" stroke="#3b82f6" fill="#3b82f640" />
              <Area type="monotone" dataKey="saldo_pessimista" name="Pessimista" stroke="#ef4444" fill="#ef444420" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Entradas vs Saídas */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-green-50 to-red-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Entradas vs Saídas Previstas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={previsaoFluxo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Bar dataKey="entradas_provavel" name="Entradas (Provável)" fill="#10b981" />
              <Bar dataKey="saidas" name="Saídas" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumo por Cenário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="bg-green-50 pb-3">
            <CardTitle className="text-sm text-green-700">📈 Cenário Otimista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              R$ {(previsaoFluxo[previsaoFluxo.length - 1]?.saldo_otimista || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-1">Saldo final previsto (100% recebimento)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-blue-50 pb-3">
            <CardTitle className="text-sm text-blue-700">🎯 Cenário Provável (IA)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              R$ {(previsaoFluxo[previsaoFluxo.length - 1]?.saldo_provavel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-1">Baseado em score dos clientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-red-50 pb-3">
            <CardTitle className="text-sm text-red-700">📉 Cenário Pessimista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              R$ {(previsaoFluxo[previsaoFluxo.length - 1]?.saldo_pessimista || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-1">Saldo final previsto (50% recebimento)</p>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações Estratégicas */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Recomendações Estratégicas da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Alert className="border-blue-300 bg-blue-50">
              <AlertDescription>
                <p className="font-semibold text-sm">💡 Estratégia Recomendada</p>
                <p className="text-xs mt-1">
                  {previsaoFluxo[previsaoFluxo.length - 1]?.saldo_provavel >= 0 
                    ? "Fluxo de caixa saudável previsto. Considere investir excedentes em aplicações de curto prazo."
                    : "Risco de fluxo negativo. Ações recomendadas: 1) Negociar prazos com fornecedores 2) Antecipar recebimentos 3) Ativar linha de crédito preventiva"
                  }
                </p>
              </AlertDescription>
            </Alert>

            <Alert className="border-green-300 bg-green-50">
              <AlertDescription>
                <p className="font-semibold text-sm">✅ Oportunidades Identificadas</p>
                <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                  <li>Antecipar {contasReceber.filter(c => c.status === 'Pendente').length} títulos pode melhorar em R$ {(contasReceber.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0) * 0.02).toLocaleString('pt-BR', { minimumFractionDigits: 0 })} (desconto 2%)</li>
                  <li>Negociar prazo de {contasPagar.filter(c => c.status === 'Pendente').length} contas a pagar pode liberar caixa temporariamente</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}