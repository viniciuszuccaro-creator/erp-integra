import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock,
  Route,
  Zap,
  Download,
  Eye
} from "lucide-react";
import { toast } from "sonner";

/**
 * 🗺️ MAPA DE ROTEIRIZAÇÃO COM IA V21.5
 * Otimização inteligente de rotas de entrega
 */
export default function MapaRoteirizacaoIA({ pedidosSelecionados = [], windowMode = false }) {
  const [rotaOtimizada, setRotaOtimizada] = useState(null);
  const [otimizando, setOtimizando] = useState(false);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date'),
  });

  // Pedidos elegíveis para roteirização
  const pedidosRoteirizaveis = useMemo(() => {
    return pedidos.filter(p => 
      (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') &&
      ['Faturado', 'Em Expedição'].includes(p.status) &&
      p.endereco_entrega_principal?.latitude &&
      p.endereco_entrega_principal?.longitude
    );
  }, [pedidos]);

  const otimizarRotaComIA = async () => {
    setOtimizando(true);
    
    try {
      // 🤖 IA: Otimização de rota usando LLM
      const pontosEntrega = pedidosRoteirizaveis.map(p => ({
        pedido_id: p.id,
        numero_pedido: p.numero_pedido,
        cliente: p.cliente_nome,
        endereco: `${p.endereco_entrega_principal.logradouro}, ${p.endereco_entrega_principal.numero} - ${p.endereco_entrega_principal.cidade}`,
        latitude: p.endereco_entrega_principal.latitude,
        longitude: p.endereco_entrega_principal.longitude,
        prioridade: p.prioridade || 'Normal',
        peso_kg: p.peso_total_kg || 0,
        valor: p.valor_total || 0
      }));

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um sistema de otimização de rotas logísticas.

Analise os seguintes pontos de entrega e sugira a melhor sequência para minimizar:
1. Distância total percorrida
2. Tempo de viagem
3. Custos operacionais

Considere prioridades (Urgente > Alta > Normal > Baixa) e peso total dos pedidos.

Pontos de entrega:
${JSON.stringify(pontosEntrega, null, 2)}

Retorne a rota otimizada com:
- sequencia_pedidos: array de pedido_ids na ordem ideal
- distancia_total_estimada_km: número
- tempo_total_estimado_min: número
- motivo_otimizacao: string explicando a lógica
- alertas: array de strings com avisos (ex: sobrepeso, área de risco)`,
        response_json_schema: {
          type: "object",
          properties: {
            sequencia_pedidos: { type: "array", items: { type: "string" } },
            distancia_total_estimada_km: { type: "number" },
            tempo_total_estimado_min: { type: "number" },
            motivo_otimizacao: { type: "string" },
            alertas: { type: "array", items: { type: "string" } }
          }
        }
      });

      setRotaOtimizada(resultado);
      toast.success("🤖 Rota otimizada com IA!");
      
    } catch (error) {
      toast.error("Erro ao otimizar rota: " + error.message);
    } finally {
      setOtimizando(false);
    }
  };

  const gerarLinkGoogleMaps = () => {
    if (!rotaOtimizada?.sequencia_pedidos) return;
    
    const pedidosOrdenados = rotaOtimizada.sequencia_pedidos
      .map(id => pedidosRoteirizaveis.find(p => p.id === id))
      .filter(Boolean);

    const waypoints = pedidosOrdenados
      .map(p => `${p.endereco_entrega_principal.latitude},${p.endereco_entrega_principal.longitude}`)
      .join('|');

    const url = `https://www.google.com/maps/dir/?api=1&waypoints=${waypoints}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            🤖 Roteirização Inteligente com IA
          </CardTitle>
          <p className="text-sm opacity-90">
            {pedidosRoteirizaveis.length} pedido(s) elegível(is) para roteirização
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Botão de Otimização */}
          <Button
            onClick={otimizarRotaComIA}
            disabled={otimizando || pedidosRoteirizaveis.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            {otimizando ? '🤖 Otimizando com IA...' : '🚀 Otimizar Rota com IA'}
          </Button>

          {/* Resultado da Otimização */}
          {rotaOtimizada && (
            <div className="space-y-4">
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-700">Distância Total</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {rotaOtimizada.distancia_total_estimada_km} km
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-purple-700">Tempo Estimado</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {Math.floor(rotaOtimizada.tempo_total_estimado_min / 60)}h {rotaOtimizada.tempo_total_estimado_min % 60}m
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Motivo da Otimização */}
              <Card className="bg-green-50 border-green-300">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-green-900 mb-2">🤖 Lógica da IA:</p>
                  <p className="text-sm text-green-800">{rotaOtimizada.motivo_otimizacao}</p>
                </CardContent>
              </Card>

              {/* Alertas */}
              {rotaOtimizada.alertas?.length > 0 && (
                <Card className="bg-yellow-50 border-yellow-300">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Alertas:</p>
                    <ul className="space-y-1">
                      {rotaOtimizada.alertas.map((alerta, idx) => (
                        <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span>•</span>
                          <span>{alerta}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Sequência de Entregas */}
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-base">📍 Sequência Otimizada de Entregas</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {rotaOtimizada.sequencia_pedidos.map((pedidoId, index) => {
                      const pedido = pedidosRoteirizaveis.find(p => p.id === pedidoId);
                      if (!pedido) return null;
                      
                      return (
                        <div key={pedidoId} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              Pedido #{pedido.numero_pedido} - {pedido.cliente_nome}
                            </p>
                            <p className="text-sm text-slate-600">
                              📍 {pedido.endereco_entrega_principal.logradouro}, {pedido.endereco_entrega_principal.numero} - {pedido.endereco_entrega_principal.cidade}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {pedido.prioridade && pedido.prioridade !== 'Normal' && (
                                <Badge className="bg-red-100 text-red-700 text-xs">
                                  {pedido.prioridade}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {(pedido.peso_total_kg || 0)} kg
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={gerarLinkGoogleMaps}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Abrir no Google Maps
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const texto = rotaOtimizada.sequencia_pedidos
                      .map((id, idx) => {
                        const p = pedidosRoteirizaveis.find(p => p.id === id);
                        return `${idx + 1}. ${p?.numero_pedido} - ${p?.cliente_nome} - ${p?.endereco_entrega_principal?.logradouro}`;
                      })
                      .join('\n');
                    navigator.clipboard.writeText(texto);
                    toast.success("📋 Rota copiada!");
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Copiar Rota
                </Button>
              </div>
            </div>
          )}

          {pedidosRoteirizaveis.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum pedido com coordenadas disponível</p>
              <p className="text-sm mt-2">Adicione endereços com geolocalização aos pedidos</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}