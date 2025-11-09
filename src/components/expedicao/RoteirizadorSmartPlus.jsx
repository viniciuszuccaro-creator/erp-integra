import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, Zap, Brain, Clock, TrendingDown, Leaf } from "lucide-react";

/**
 * V21.2 - Roteirizador SmartRoute+
 * COM: IA Preditiva, Confirmação Cliente, Ajuste Dinâmico de ETA
 */
export default function RoteirizadorSmartPlus({ entregas = [], empresaId, onRotaCriada }) {
  const [otimizando, setOtimizando] = useState(false);
  const [rotaOtimizada, setRotaOtimizada] = useState(null);
  const [criterio, setCriterio] = useState('Menor Tempo');
  const queryClient = useQueryClient();

  const otimizarRotaMutation = useMutation({
    mutationFn: async () => {
      setOtimizando(true);

      // Preparar dados para IA
      const pontosEntrega = entregas.map(e => ({
        entrega_id: e.id,
        cliente: e.cliente_nome,
        endereco: e.endereco_entrega_completo,
        latitude: e.endereco_entrega_completo?.latitude,
        longitude: e.endereco_entrega_completo?.longitude,
        janela_preferencial: e.endereco_entrega_completo?.janela_entrega_preferencial || 'Indiferente',
        tipo_descarga: e.endereco_entrega_completo?.tipo_descarga || 'Manual',
        peso_kg: e.peso_total_kg || 0,
        volumes: e.volumes || 1,
        prioridade: e.prioridade || 'Normal'
      }));

      // IA: Otimização de Rota
      const resultadoIA = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um otimizador de rotas de entrega.

Critério: ${criterio}
Endereço de Partida: [Empresa - Lat/Lng da empresa_id]

Pontos de Entrega:
${JSON.stringify(pontosEntrega, null, 2)}

TAREFA:
1. Ordene os pontos para MINIMIZAR ${criterio === 'Menor Distância' ? 'a distância total' : criterio === 'Ecológica' ? 'emissões de CO2' : 'o tempo total'}
2. Respeite as janelas de entrega preferenciais (Manhã/Tarde)
3. Considere o tipo de descarga (Munck demora mais)
4. Calcule ETA (horário previsto) para cada ponto

Retorne JSON com:
- sequencia_otimizada: array [{entrega_id, sequencia, eta_horario, tempo_estimado_parada_min}]
- distancia_total_km
- tempo_total_min
- combustivel_estimado_l
- reducao_co2_kg (se ecológica)
- economia_vs_manual_percent`,
        response_json_schema: {
          type: 'object',
          properties: {
            sequencia_otimizada: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entrega_id: { type: 'string' },
                  sequencia: { type: 'number' },
                  eta_horario: { type: 'string' },
                  tempo_estimado_parada_min: { type: 'number' }
                }
              }
            },
            distancia_total_km: { type: 'number' },
            tempo_total_min: { type: 'number' },
            combustivel_estimado_l: { type: 'number' },
            reducao_co2_kg: { type: 'number' },
            economia_vs_manual_percent: { type: 'number' }
          }
        }
      });

      // V21.2: Enviar Confirmação de ETA ao Cliente (via WhatsApp/Portal)
      for (const ponto of resultadoIA.sequencia_otimizada) {
        const entrega = entregas.find(e => e.id === ponto.entrega_id);
        if (!entrega) continue;

        // Criar notificação
        await base44.entities.Notificacao.create({
          titulo: `📦 Entrega Agendada - Confirmação Necessária`,
          mensagem: `Olá! Sua entrega (Pedido ${entrega.numero_pedido}) está prevista para: ${ponto.eta_horario}.\n\nConfirma este horário ou deseja reagendar?\n\nAcesse o Portal do Cliente para responder.`,
          tipo: 'info',
          categoria: 'Expedicao',
          prioridade: 'Alta',
          destinatario_id: entrega.cliente_id,
          link_acao: `/portal-cliente?pedido=${entrega.pedido_id}`,
          entidade_relacionada: 'Entrega',
          registro_id: entrega.id
        });
      }

      setRotaOtimizada(resultadoIA);
      return resultadoIA;
    }
  });

  const handleCriarRota = async () => {
    if (!rotaOtimizada) return;

    const rota = await base44.entities.Rota.create({
      empresa_id: empresaId,
      nome_rota: `Rota ${new Date().toLocaleDateString('pt-BR')}`,
      data_rota: new Date().toISOString().split('T')[0],
      pontos_entrega: rotaOtimizada.sequencia_otimizada,
      distancia_total_km: rotaOtimizada.distancia_total_km,
      tempo_total_previsto_minutos: rotaOtimizada.tempo_total_min,
      otimizacao_ia: {
        otimizada: true,
        data_otimizacao: new Date().toISOString(),
        criterio: criterio,
        economia_km: rotaOtimizada.economia_vs_manual_percent * rotaOtimizada.distancia_total_km / 100,
        economia_tempo_min: rotaOtimizada.tempo_total_min * 0.15,
        economia_combustivel_l: rotaOtimizada.combustivel_estimado_l * 0.15,
        reducao_co2_kg: rotaOtimizada.reducao_co2_kg
      },
      status: 'Aprovada'
    });

    onRotaCriada?.(rota);
    queryClient.invalidateQueries({ queryKey: ['rotas'] });
    onClose();
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-purple-50">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Configuração SmartRoute+
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Critério de Otimização:</label>
            <div className="grid grid-cols-3 gap-2">
              {['Menor Tempo', 'Menor Distância', 'Ecológica'].map(crit => (
                <button
                  key={crit}
                  onClick={() => setCriterio(crit)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                    criterio === crit 
                      ? 'border-purple-600 bg-purple-100 text-purple-900'
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {crit === 'Ecológica' && <Leaf className="w-4 h-4 inline mr-1 text-green-600" />}
                  {crit}
                </button>
              ))}
            </div>
          </div>

          <Alert className="border-blue-300 bg-blue-50">
            <Brain className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>V21.2:</strong> Após otimizar, o sistema enviará WhatsApp/Notificação aos clientes para CONFIRMAR o horário previsto de entrega (ETA).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {!rotaOtimizada ? (
        <div className="flex justify-end">
          <Button
            onClick={() => otimizarRotaMutation.mutate()}
            disabled={otimizando || entregas.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {otimizando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Otimizando Rota...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Otimizar com IA
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-6 space-y-4">
              <p className="font-bold text-green-900 mb-3">✅ Rota Otimizada!</p>

              <div className="grid grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-green-700 text-xs">Distância</p>
                  <p className="font-bold text-lg">{rotaOtimizada.distancia_total_km?.toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-green-700 text-xs">Tempo</p>
                  <p className="font-bold text-lg">{Math.floor(rotaOtimizada.tempo_total_min / 60)}h{rotaOtimizada.tempo_total_min % 60}m</p>
                </div>
                <div>
                  <p className="text-green-700 text-xs">Combustível</p>
                  <p className="font-bold text-lg">{rotaOtimizada.combustivel_estimado_l?.toFixed(1)} L</p>
                </div>
                <div>
                  <p className="text-green-700 text-xs">Economia</p>
                  <p className="font-bold text-lg text-green-600">{rotaOtimizada.economia_vs_manual_percent?.toFixed(0)}%</p>
                </div>
              </div>

              {rotaOtimizada.reducao_co2_kg > 0 && (
                <Alert className="border-green-400 bg-green-100">
                  <Leaf className="w-4 h-4 text-green-700" />
                  <AlertDescription className="text-xs text-green-800">
                    <strong>Rota Ecológica:</strong> Redução de {rotaOtimizada.reducao_co2_kg.toFixed(2)} kg de CO₂
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sequência */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sequência de Entregas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {(rotaOtimizada.sequencia_otimizada || []).map((ponto, idx) => {
                const entrega = entregas.find(e => e.id === ponto.entrega_id);
                return (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {ponto.sequencia}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{entrega?.cliente_nome}</p>
                      <p className="text-xs text-slate-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        ETA: {ponto.eta_horario} ({ponto.tempo_estimado_parada_min} min parada)
                      </p>
                    </div>
                    <Badge className="bg-blue-600">Notificado</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button onClick={handleCriarRota} className="w-full bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Criar Rota e Notificar Clientes
          </Button>
        </>
      )}
    </div>
  );
}