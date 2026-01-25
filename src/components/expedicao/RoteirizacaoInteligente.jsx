import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Map, Truck, Navigation, TrendingDown, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SeletorMotoristaEntrega from "@/components/logistica/SeletorMotoristaEntrega";

export default function RoteirizacaoInteligente({ windowMode = false }) {
  const queryClient = useQueryClient();
  const [dataRota, setDataRota] = useState(new Date().toISOString().split('T')[0]);
  const [entregasSelecionadas, setEntregasSelecionadas] = useState([]);
  const [pontoPartida, setPontoPartida] = useState('Depósito Central');

  const { data: entregas = [] } = useQuery({
    queryKey: ["entregas", "pendentes"],
    queryFn: () => base44.entities.Entrega.filter({
      status: { $in: ['Aguardando Separação', 'Pronto para Expedir'] }
    }, '-data_previsao', 100),
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ["colaboradores", "motoristas"],
    queryFn: () => base44.entities.Colaborador.filter({
      pode_dirigir: true,
      status: 'Ativo'
    }),
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ["veiculos"],
    queryFn: () => base44.entities.Veiculo.list(),
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ["rotas"],
    queryFn: () => base44.entities.Rota.list(),
  });

  const gerarRotaIAMutation = useMutation({
    mutationFn: async () => {
      if (entregasSelecionadas.length < 2) {
        throw new Error('Selecione pelo menos 2 entregas');
      }

      toast.info("🤖 IA otimizando rota...");

      // ETAPA 3: Usar função backend otimizada
      const result = await base44.functions.invoke('otimizarRotaIA', {
        entregas_ids: entregasSelecionadas,
        ponto_partida: pontoPartida
      });

      const rotaOtimizada = result.data.rota_otimizada;

      // Criar rota no sistema
      const novaRota = await base44.entities.Rota.create({
        numero_rota: `RT-${Date.now()}`,
        data_rota: dataRota,
        entregas_ids: rotaOtimizada.sequencia_otimizada,
        distancia_total_km: rotaOtimizada.distancia_total_km,
        tempo_estimado_min: rotaOtimizada.tempo_total_min,
        status: 'Planejada',
        observacoes: rotaOtimizada.justificativa
      });

      // Atualizar entregas com rota_id
      for (const entrega_id of rotaOtimizada.sequencia_otimizada) {
        await base44.entities.Entrega.update(entrega_id, { 
          rota_id: novaRota.id,
          status: 'Pronto para Expedir'
        });
      }

      return { rota: novaRota, otimizacao: rotaOtimizada };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["rotas"]);
      queryClient.invalidateQueries(["entregas"]);
      setEntregasSelecionadas([]);
      toast.success(`✅ Rota criada! ${data.otimizacao.distancia_total_km?.toFixed(1)} km em ${Math.round(data.otimizacao.tempo_total_min)} min`);
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
    }
  });

  const entregasPendentes = entregas.filter(e => 
    e.status === "Aguardando Separação" || e.status === "Pronto para Expedir"
  );

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  const toggleEntrega = (id) => {
    setEntregasSelecionadas(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6"}>
      {/* ETAPA 3: Header Aprimorado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Roteirização Inteligente (ETAPA 3)</h2>
          <p className="text-sm text-slate-600 mt-1">Otimização de rotas com IA + Google Maps</p>
        </div>

        <Button
          onClick={() => gerarRotaIAMutation.mutate()}
          disabled={gerarRotaIAMutation.isPending || entregasSelecionadas.length < 2}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {gerarRotaIAMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Otimizando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Gerar Rota com IA
            </>
          )}
        </Button>
      </div>

      {/* ETAPA 3: Seleção de Entregas */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Selecionar Entregas
            </span>
            <Badge className="bg-blue-600">{entregasSelecionadas.length} selecionadas</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Ponto de partida (ex: Rua ABC, 123 - São Paulo/SP)"
            value={pontoPartida}
            onChange={(e) => setPontoPartida(e.target.value)}
          />

          <div className="max-h-80 overflow-auto space-y-2 border rounded p-3">
            {entregas.map(entrega => (
              <div
                key={entrega.id}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                onClick={() => toggleEntrega(entrega.id)}
              >
                <Checkbox checked={entregasSelecionadas.includes(entrega.id)} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{entrega.cliente_nome}</p>
                  <p className="text-xs text-slate-600">
                    {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                  </p>
                </div>
                <Badge className={
                  entrega.prioridade === 'Urgente' ? 'bg-red-600' :
                  entrega.prioridade === 'Alta' ? 'bg-orange-600' : 'bg-blue-600'
                }>
                  {entrega.prioridade}
                </Badge>
              </div>
            ))}
            {entregas.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4">
                Nenhuma entrega pendente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rotas Ativas</p>
                <p className="text-2xl font-bold">{rotas.filter(r => r.status === "Em Execução").length}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Entregas Pendentes</p>
                <p className="text-2xl font-bold">{entregasPendentes.length}</p>
              </div>
              <Navigation className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Economia IA (KM)</p>
                <p className="text-2xl font-bold text-green-600">
                  {rotas.reduce((acc, r) => acc + (r.otimizacao_ia?.economia_vs_rota_manual?.km_economizados || 0), 0).toFixed(0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rotas Geradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Data</th>
                  <th className="text-left p-3 text-sm font-semibold">Motorista</th>
                  <th className="text-left p-3 text-sm font-semibold">Veículo</th>
                  <th className="text-right p-3 text-sm font-semibold">Entregas</th>
                  <th className="text-right p-3 text-sm font-semibold">Distância (KM)</th>
                  <th className="text-right p-3 text-sm font-semibold">Tempo (h)</th>
                  <th className="text-right p-3 text-sm font-semibold">Custo Est.</th>
                  <th className="text-left p-3 text-sm font-semibold">Status</th>
                  <th className="text-center p-3 text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rotas.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-6 text-slate-500">
                      Nenhuma rota gerada ainda
                    </td>
                  </tr>
                ) : (
                  rotas.map((rota) => (
                    <tr key={rota.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-sm">
                        {new Date(rota.data_rota).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-sm">{rota.motorista_nome}</td>
                      <td className="p-3 text-sm">{rota.veiculo_placa}</td>
                      <td className="p-3 text-sm text-right">{rota.entregas_vinculadas?.length || 0}</td>
                      <td className="p-3 text-sm text-right">
                        {rota.otimizacao_ia?.distancia_total_km?.toFixed(1) || '-'}
                      </td>
                      <td className="p-3 text-sm text-right">
                        {rota.otimizacao_ia?.tempo_total_estimado_minutos 
                          ? (rota.otimizacao_ia.tempo_total_estimado_minutos / 60).toFixed(1) 
                          : '-'}
                      </td>
                      <td className="p-3 text-sm text-right">
                        R$ {(rota.otimizacao_ia?.custo_estimado_frete || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <Badge 
                          className={
                            rota.status === "Concluída" ? "bg-green-100 text-green-800" :
                            rota.status === "Em Execução" ? "bg-blue-100 text-blue-800" :
                            "bg-slate-100 text-slate-800"
                          }
                        >
                          {rota.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button size="sm" variant="outline">
                          <Map className="w-3 h-3 mr-1" />
                          Mapa
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}