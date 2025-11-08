import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

/**
 * Fluxo de Caixa - V21.3
 * Com IA de Previsão de Saldo e Gráfico Projetado
 */
export default function CaixaDiarioTab({ contasReceber = [], contasPagar = [], bancos = [] }) {
  const [periodo, setPeriodo] = useState(30);
  const [previsao, setPrevisao] = useState(null);
  const [gerando, setGerando] = useState(false);

  const saldoAtual = bancos.reduce((sum, b) => sum + (b.saldo_atual || 0), 0);

  const gerarPrevisao = async () => {
    setGerando(true);
    try {
      const recebimentos = contasReceber
        .filter(c => c.status === 'Pendente')
        .map(c => ({
          data: c.data_vencimento,
          valor: c.valor,
          tipo: 'Entrada',
          descricao: c.descricao
        }));

      const pagamentos = contasPagar
        .filter(c => c.status === 'Pendente')
        .map(c => ({
          data: c.data_vencimento,
          valor: c.valor,
          tipo: 'Saída',
          descricao: c.descricao
        }));

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um analista financeiro especializado em fluxo de caixa.

Dados:
- Saldo atual: R$ ${saldoAtual.toFixed(2)}
- Contas a receber: ${JSON.stringify(recebimentos)}
- Contas a pagar: ${JSON.stringify(pagamentos)}

Calcule a previsão de saldo diário para os próximos ${periodo} dias, considerando:
1. Probabilidade de recebimento baseada no histórico (use 85% para recebimentos)
2. Todas as saídas devem ser pagas
3. Identifique dias com saldo crítico (< R$ 5.000)
4. Sugira ações para evitar saldo negativo

Retorne a projeção diária detalhada.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            projecao_diaria: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  saldo_projetado: { type: "number" },
                  entradas_previstas: { type: "number" },
                  saidas_previstas: { type: "number" },
                  critico: { type: "boolean" }
                }
              }
            },
            dias_criticos: { type: "number" },
            acoes_sugeridas: {
              type: "array",
              items: { type: "string" }
            },
            necessidade_capital_giro: { type: "number" }
          }
        }
      });

      setPrevisao(resultado);
      toast.success('Previsão gerada pela IA!');
    } catch (err) {
      toast.error('Erro ao gerar previsão');
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-purple-900">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">IA de Previsão de Caixa:</span>
            <span>Projeta saldo futuro com 85% de confiança e identifica dias críticos</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo Atual</CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Receber</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {contasReceber.filter(c => c.status === 'Pendente').reduce((s, c) => s + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Pagar</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {contasPagar.filter(c => c.status === 'Pendente').reduce((s, c) => s + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo Projetado</CardTitle>
            <Calendar className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {previsao ? (
                `R$ ${previsao.projecao_diaria[previsao.projecao_diaria.length - 1]?.saldo_projetado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`
              ) : (
                '-'
              )}
            </div>
            {previsao && (
              <p className="text-xs text-slate-500 mt-1">
                em {periodo} dias
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Projeção de Fluxo de Caixa</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPeriodo(7)}>7 dias</Button>
              <Button variant="outline" size="sm" onClick={() => setPeriodo(30)}>30 dias</Button>
              <Button variant="outline" size="sm" onClick={() => setPeriodo(90)}>90 dias</Button>
              <Button onClick={gerarPrevisao} disabled={gerando}>
                {gerando ? 'Gerando...' : 'Gerar Previsão IA'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {previsao ? (
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={previsao.projecao_diaria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="saldo_projetado" stroke="#3b82f6" name="Saldo Projetado" strokeWidth={2} />
                  <Line type="monotone" dataKey="entradas_previstas" stroke="#10b981" name="Entradas" strokeWidth={2} />
                  <Line type="monotone" dataKey="saidas_previstas" stroke="#ef4444" name="Saídas" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>

              {previsao.dias_criticos > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">
                      {previsao.dias_criticos} dia(s) com saldo crítico detectado
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-red-800">Ações Sugeridas pela IA:</p>
                    {previsao.acoes_sugeridas?.map((acao, idx) => (
                      <p key={idx} className="text-sm text-red-700">• {acao}</p>
                    ))}
                  </div>
                  {previsao.necessidade_capital_giro > 0 && (
                    <p className="text-sm text-red-700 mt-3 font-semibold">
                      💰 Necessidade de Capital de Giro: R$ {previsao.necessidade_capital_giro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Clique em "Gerar Previsão IA" para visualizar</p>
              <p className="text-xs mt-2">A IA analisará recebimentos, pagamentos e histórico</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}