import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Zap, TrendingDown, Leaf, AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Roteirização com IA - V21.2 Fase 2
 * Otimização de distância, janelas de entrega e economia de combustível
 */
export default function RoteirizacaoMapa({ entregas = [], romaneios = [], veiculos = [], motoristas = [], onCriarRomaneio }) {
  const [entregasSelecionadas, setEntregasSelecionadas] = useState([]);
  const [otimizando, setOtimizando] = useState(false);
  const [rotaOtimizada, setRotaOtimizada] = useState(null);
  const queryClient = useQueryClient();

  const entregasPendentes = entregas.filter(e => e.status === 'Aguardando Separação' || e.status === 'Pronto para Expedir');

  const toggleEntrega = (entregaId) => {
    setEntregasSelecionadas(prev => 
      prev.includes(entregaId) 
        ? prev.filter(id => id !== entregaId)
        : [...prev, entregaId]
    );
  };

  const otimizarRota = async () => {
    if (entregasSelecionadas.length === 0) {
      toast.error('Selecione ao menos uma entrega');
      return;
    }

    setOtimizando(true);

    try {
      // IA de Roteirização
      const entregas_data = entregasSelecionadas.map(id => {
        const entrega = entregas.find(e => e.id === id);
        return {
          id: entrega.id,
          cliente: entrega.cliente_nome,
          endereco: entrega.endereco_entrega_completo,
          latitude: entrega.endereco_entrega_completo?.latitude,
          longitude: entrega.endereco_entrega_completo?.longitude,
          peso_kg: entrega.peso_total_kg || 0,
          janela_preferencial: entrega.endereco_entrega_completo?.janela_entrega_preferencial || 'Indiferente',
          tipo_descarga: entrega.endereco_entrega_completo?.tipo_descarga || 'Manual',
        };
      });

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um otimizador de rotas logísticas. 
        
Dadas as seguintes entregas:
${JSON.stringify(entregas_data, null, 2)}

Otimize a rota considerando:
1. Menor distância total
2. Respeitar janelas de entrega preferenciais
3. Agrupar entregas com mesmo tipo de descarga
4. Priorizar entregas com maior peso no início

Retorne a sequência ideal de entregas com:
- ordem de visita
- distância estimada total (km)
- tempo estimado total (minutos)
- economia de combustível estimada (litros)
- redução de CO2 (kg)`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            sequencia_otimizada: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ordem: { type: "number" },
                  entrega_id: { type: "string" },
                  cliente: { type: "string" },
                  tempo_estimado_parada_min: { type: "number" }
                }
              }
            },
            distancia_total_km: { type: "number" },
            tempo_total_min: { type: "number" },
            economia_combustivel_l: { type: "number" },
            reducao_co2_kg: { type: "number" },
            criterio_usado: { type: "string" }
          }
        }
      });

      setRotaOtimizada(resultado);
      toast.success('Rota otimizada com sucesso!');
    } catch (err) {
      toast.error('Erro ao otimizar rota');
    } finally {
      setOtimizando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-purple-900">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">IA de Roteirização Ativa:</span>
            <span>Otimiza distância, janelas de entrega e tipo de descarga</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Entregas Disponíveis ({entregasPendentes.length})</CardTitle>
              <Button 
                onClick={otimizarRota} 
                disabled={otimizando || entregasSelecionadas.length === 0}
              >
                {otimizando ? 'Otimizando...' : `Otimizar Rota (${entregasSelecionadas.length})`}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {entregasPendentes.map(entrega => {
              const selecionada = entregasSelecionadas.includes(entrega.id);
              return (
                <div
                  key={entrega.id}
                  onClick={() => toggleEntrega(entrega.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selecionada 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{entrega.cliente_nome}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {entrega.endereco_entrega_completo?.cidade || 'Sem endereço'} - {entrega.endereco_entrega_completo?.estado || ''}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {entrega.endereco_entrega_completo?.janela_entrega_preferencial && (
                          <Badge variant="outline" className="text-xs">
                            {entrega.endereco_entrega_completo.janela_entrega_preferencial}
                          </Badge>
                        )}
                        {entrega.peso_total_kg > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {entrega.peso_total_kg?.toFixed(0) || 0} kg
                          </Badge>
                        )}
                      </div>
                    </div>
                    {selecionada && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rota Otimizada</CardTitle>
          </CardHeader>
          <CardContent>
            {rotaOtimizada ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-semibold">Distância Total</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {rotaOtimizada.distancia_total_km?.toFixed(1) || 0} km
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xs text-green-600 font-semibold">Tempo Estimado</div>
                    <div className="text-2xl font-bold text-green-900">
                      {Math.floor((rotaOtimizada.tempo_total_min || 0) / 60)}h {(rotaOtimizada.tempo_total_min || 0) % 60}min
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Economia Combustível
                    </div>
                    <div className="text-2xl font-bold text-emerald-900">
                      {rotaOtimizada.economia_combustivel_l?.toFixed(1) || 0} L
                    </div>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <div className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      Redução CO₂
                    </div>
                    <div className="text-2xl font-bold text-teal-900">
                      {rotaOtimizada.reducao_co2_kg?.toFixed(1) || 0} kg
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  <h4 className="font-semibold text-sm text-slate-700">Sequência de Entregas:</h4>
                  {rotaOtimizada.sequencia_otimizada?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded border">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {item.ordem}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.cliente}</p>
                        <p className="text-xs text-slate-500">
                          ~{item.tempo_estimado_parada_min || 15} min de parada
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full" onClick={onCriarRomaneio}>
                  Criar Romaneio com Esta Rota
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Navigation className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Selecione entregas e clique em "Otimizar Rota"</p>
                <p className="text-xs mt-2">A IA calculará a melhor sequência</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}