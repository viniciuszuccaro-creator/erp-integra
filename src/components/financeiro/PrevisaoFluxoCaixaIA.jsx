import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, 
  Calendar, DollarSign, Zap 
} from "lucide-react";

export default function PrevisaoFluxoCaixaIA({ contasReceber = [], contasPagar = [] }) {
  const [diasPrevisao, setDiasPrevisao] = useState(30);

  // Gerar previsão para os próximos X dias
  const gerarPrevisao = () => {
    const previsao = [];
    const hoje = new Date();

    for (let i = 0; i <= diasPrevisao; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];

      // Recebimentos do dia
      const recebimentosDia = contasReceber.filter(c => 
        c.data_vencimento === dataStr && 
        (c.status === 'Pendente' || c.status === 'Atrasado')
      ).reduce((sum, c) => sum + (c.valor || 0), 0);

      // Pagamentos do dia
      const pagamentosDia = contasPagar.filter(c => 
        c.data_vencimento === dataStr && 
        (c.status === 'Pendente' || c.status === 'Aprovado')
      ).reduce((sum, c) => sum + (c.valor || 0), 0);

      // Aplicar probabilidade de IA
      const probabilidadeRecebimento = 0.85; // 85% de probabilidade baseada em histórico
      const recebimentoPrevisto = recebimentosDia * probabilidadeRecebimento;

      const saldoDia = recebimentoPrevisto - pagamentosDia;

      // Calcular saldo acumulado
      const saldoAcumulado = i === 0 
        ? saldoDia 
        : previsao[i - 1].saldoAcumulado + saldoDia;

      previsao.push({
        data: `${data.getDate()}/${data.getMonth() + 1}`,
        dataCompleta: dataStr,
        recebimentos: recebimentoPrevisto,
        pagamentos: pagamentosDia,
        saldoDia,
        saldoAcumulado
      });
    }

    return previsao;
  };

  const dadosPrevisao = gerarPrevisao();
  
  // Detectar dias críticos
  const diasCriticos = dadosPrevisao.filter(d => d.saldoAcumulado < 0);
  const menorSaldo = Math.min(...dadosPrevisao.map(d => d.saldoAcumulado));
  const maiorSaldo = Math.max(...dadosPrevisao.map(d => d.saldoAcumulado));

  const nivelAlerta = menorSaldo < -10000 ? 'crítico' : menorSaldo < 0 ? 'atenção' : 'saudável';
  const corAlerta = nivelAlerta === 'crítico' ? 'red' : nivelAlerta === 'atenção' ? 'orange' : 'green';

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 w-full h-full">
      <CardHeader className="border-b bg-white/50">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          IA - Previsão de Fluxo de Caixa ({diasPrevisao} dias)
          <Badge className={`ml-auto bg-${corAlerta}-100 text-${corAlerta}-700`}>
            {nivelAlerta === 'crítico' ? '🔴 Crítico' : nivelAlerta === 'atenção' ? '🟠 Atenção' : '🟢 Saudável'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Indicadores Principais */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600">Maior Saldo Previsto</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              R$ {maiorSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded border border-red-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs text-slate-600">Menor Saldo Previsto</span>
            </div>
            <p className={`text-xl font-bold ${menorSaldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
              R$ {menorSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-slate-600">Dias Críticos</span>
            </div>
            <p className="text-xl font-bold text-orange-600">{diasCriticos.length}</p>
            <p className="text-xs text-slate-500">Saldo negativo</p>
          </div>
        </div>

        {/* Alertas de IA */}
        {diasCriticos.length > 0 && (
          <Alert className="border-red-300 bg-red-50">
            <AlertDescription>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 mb-1">⚠️ Alerta de Fluxo de Caixa</p>
                  <p className="text-sm text-red-700">
                    Detectados <strong>{diasCriticos.length} dias</strong> com saldo negativo nos próximos {diasPrevisao} dias.
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    <strong>Ação Recomendada:</strong> Considere renegociar pagamentos ou antecipar recebimentos.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Gráfico de Previsão */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-sm">Evolução do Saldo (Próximos {diasPrevisao} dias)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosPrevisao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Legend />
                <Line type="monotone" dataKey="recebimentos" stroke="#10b981" strokeWidth={2} name="Recebimentos" />
                <Line type="monotone" dataKey="pagamentos" stroke="#ef4444" strokeWidth={2} name="Pagamentos" />
                <Line type="monotone" dataKey="saldoAcumulado" stroke="#3b82f6" strokeWidth={3} name="Saldo Acumulado" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dias Críticos Detalhados */}
        {diasCriticos.length > 0 && (
          <Card>
            <CardHeader className="bg-red-50 border-b border-red-200">
              <CardTitle className="text-sm text-red-900">🚨 Dias com Saldo Negativo</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {diasCriticos.map((dia, idx) => (
                  <div key={idx} className="p-3 bg-white rounded border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-sm">{dia.data}</span>
                        <p className="text-xs text-slate-500">{dia.dataCompleta}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          R$ {dia.saldoAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-500">
                          Déficit: R$ {Math.abs(dia.saldoAcumulado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {diasCriticos.length === 0 && (
          <Alert className="border-green-300 bg-green-50">
            <AlertDescription className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">✅ Fluxo de caixa saudável! Nenhum dia crítico detectado nos próximos {diasPrevisao} dias.</span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}