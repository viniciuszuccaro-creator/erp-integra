import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, AlertTriangle, Calendar, Clock, Truck } from "lucide-react";
import { toast } from "sonner";

/**
 * 🤖 IA DE PREVISÃO DE ENTREGA V21.5
 * Calcula data/hora prevista usando machine learning
 */
export default function IAPrevisaoEntrega({ pedido, historico = [], windowMode = false }) {
  const [previsao, setPrevisao] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const containerClass = windowMode ? "w-full h-full flex flex-col" : "";

  const calcularPrevisaoIA = async () => {
    setCarregando(true);
    
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um sistema de IA especializado em previsão de entregas logísticas.

Analise o seguinte pedido e histórico de entregas para prever:
1. Data e horário mais provável de entrega
2. Fatores de risco que podem atrasar
3. Recomendações para garantir pontualidade

Pedido Atual:
- Número: ${pedido.numero_pedido}
- Cliente: ${pedido.cliente_nome}
- Cidade: ${pedido.endereco_entrega_principal?.cidade || 'Não informada'}
- Estado: ${pedido.endereco_entrega_principal?.estado || 'Não informado'}
- Peso Total: ${pedido.peso_total_kg || 0} kg
- Valor: R$ ${(pedido.valor_total || 0).toFixed(2)}
- Prioridade: ${pedido.prioridade || 'Normal'}
- Tipo Frete: ${pedido.tipo_frete}
- Data Prevista Original: ${pedido.data_prevista_entrega || 'Não informada'}

Histórico de Entregas Anteriores (últimas 10):
${JSON.stringify(historico.slice(0, 10), null, 2)}

Considere:
- Distância aproximada até o destino
- Tráfego típico da região
- Complexidade do endereço
- Histórico de entregas na mesma cidade
- Dia da semana e horário
- Clima/estação do ano

Retorne previsão precisa.`,
        response_json_schema: {
          type: "object",
          properties: {
            data_prevista: { type: "string" },
            horario_previsto: { type: "string" },
            confianca_percentual: { type: "number" },
            fatores_risco: { 
              type: "array", 
              items: { type: "string" } 
            },
            recomendacoes: { 
              type: "array", 
              items: { type: "string" } 
            },
            prazo_dias: { type: "number" }
          }
        }
      });

      setPrevisao(resultado);
      toast.success("🤖 Previsão calculada com IA!");
      
    } catch (error) {
      toast.error("Erro ao calcular previsão: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card className={`border-0 shadow-lg ${containerClass}`}>
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          🤖 Previsão de Entrega com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {!previsao ? (
          <Button
            onClick={calcularPrevisaoIA}
            disabled={carregando}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            {carregando ? '🤖 Calculando com IA...' : '🚀 Calcular Previsão com IA'}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Previsão Principal */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Data Prevista</p>
                      <p className="text-xl font-bold text-blue-900">{previsao.data_prevista}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-700">Horário Previsto</p>
                      <p className="text-xl font-bold text-purple-900">{previsao.horario_previsto}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-700">Confiança da IA:</p>
                    <Badge className={
                      previsao.confianca_percentual >= 80 ? 'bg-green-600' :
                      previsao.confianca_percentual >= 60 ? 'bg-yellow-600' :
                      'bg-orange-600'
                    }>
                      {previsao.confianca_percentual}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fatores de Risco */}
            {previsao.fatores_risco?.length > 0 && (
              <Card className="border-orange-300 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-orange-900">
                    <AlertTriangle className="w-5 h-5" />
                    ⚠️ Fatores de Risco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {previsao.fatores_risco.map((risco, idx) => (
                      <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                        <span className="text-orange-600">•</span>
                        <span>{risco}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recomendações */}
            {previsao.recomendacoes?.length > 0 && (
              <Card className="border-green-300 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-900">
                    <TrendingUp className="w-5 h-5" />
                    💡 Recomendações da IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {previsao.recomendacoes.map((rec, idx) => (
                      <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Prazo em Dias */}
            <Card className="bg-slate-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-slate-600" />
                  <div>
                    <p className="text-sm text-slate-600">Prazo Total</p>
                    <p className="font-bold text-slate-900">
                      {previsao.prazo_dias} dia(s) útil(is)
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={calcularPrevisaoIA}
                >
                  Recalcular
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}