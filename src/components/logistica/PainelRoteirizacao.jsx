import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Painel de Roteirização Inteligente
 * Otimiza rotas com IA + Google Maps
 */

export default function PainelRoteirizacao() {
  const { filterInContext, empresaAtual } = useContextoVisual();
  const [entregasSelecionadas, setEntregasSelecionadas] = useState([]);
  const [pontoPartida, setPontoPartida] = useState('');
  const [rotaOtimizada, setRotaOtimizada] = useState(null);
  const queryClient = useQueryClient();

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ['entregas', 'pendentes', empresaAtual?.id],
    queryFn: () => filterInContext('Entrega', {
      status: { $in: ['Aguardando Separação', 'Pronto para Expedir', 'Saiu para Entrega'] }
    }, '-data_previsao', 100),
    enabled: !!empresaAtual
  });

  const otimizarMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('otimizarRotaIA', {
        entregas_ids: entregasSelecionadas,
        ponto_partida: pontoPartida || 'Depósito central'
      });
      return res.data;
    },
    onSuccess: (data) => {
      setRotaOtimizada(data.rota_otimizada);
      toast.success('Rota otimizada com sucesso!');
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
    }
  });

  const criarRotaMutation = useMutation({
    mutationFn: async () => {
      const rota = {
        numero_rota: `RT-${Date.now()}`,
        data_rota: new Date().toISOString().split('T')[0],
        entregas_ids: rotaOtimizada.sequencia_otimizada,
        distancia_total_km: rotaOtimizada.distancia_total_km,
        tempo_estimado_min: rotaOtimizada.tempo_total_min,
        status: 'Planejada',
        observacoes: rotaOtimizada.justificativa
      };

      const res = await base44.entities.Rota.create(rota);

      // Atualizar entregas com rota_id
      for (const entrega_id of rotaOtimizada.sequencia_otimizada) {
        await base44.entities.Entrega.update(entrega_id, { rota_id: res.id });
      }

      return res;
    },
    onSuccess: () => {
      toast.success('Rota criada com sucesso!');
      queryClient.invalidateQueries(['entregas']);
      setEntregasSelecionadas([]);
      setRotaOtimizada(null);
    }
  });

  const toggleEntrega = (id) => {
    setEntregasSelecionadas(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full h-full space-y-4 p-4 overflow-auto">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Roteirização Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ponto de Partida */}
          <div>
            <label className="text-sm font-medium">Ponto de Partida</label>
            <Input
              placeholder="Ex: Rua ABC, 123 - São Paulo/SP"
              value={pontoPartida}
              onChange={(e) => setPontoPartida(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Seleção de Entregas */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Entregas Disponíveis</span>
              <Badge>{entregasSelecionadas.length} selecionadas</Badge>
            </div>

            <div className="max-h-64 overflow-auto space-y-2 border rounded-lg p-3">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin mx-auto" />}
              {entregas.map(entrega => (
                <div
                  key={entrega.id}
                  className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                  onClick={() => toggleEntrega(entrega.id)}
                >
                  <Checkbox checked={entregasSelecionadas.includes(entrega.id)} />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{entrega.cliente_nome}</p>
                    <p className="text-slate-600 text-xs">
                      {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                    </p>
                    <Badge className={
                      entrega.prioridade === 'Urgente' ? 'bg-red-600' :
                      entrega.prioridade === 'Alta' ? 'bg-orange-600' : 'bg-blue-600'
                    }>
                      {entrega.prioridade}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão Otimizar */}
          <Button
            onClick={() => otimizarMutation.mutate()}
            disabled={entregasSelecionadas.length < 2 || otimizarMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {otimizarMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Otimizando...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Otimizar Rota com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultado da Otimização */}
      {rotaOtimizada && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Rota Otimizada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Distância Total</span>
                <p className="text-xl font-bold">{rotaOtimizada.distancia_total_km?.toFixed(1)} km</p>
              </div>
              <div>
                <span className="text-slate-600">Tempo Estimado</span>
                <p className="text-xl font-bold">{Math.round(rotaOtimizada.tempo_total_min)} min</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Sequência Otimizada:</span>
              <ol className="mt-2 space-y-1 text-sm">
                {rotaOtimizada.sequencia_otimizada?.map((id, idx) => {
                  const entrega = entregas.find(e => e.id === id);
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <Badge className="bg-blue-600">{idx + 1}</Badge>
                      <span>{entrega?.cliente_nome || id}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="bg-white p-3 rounded border text-sm">
              <p className="font-medium mb-1">Justificativa da IA:</p>
              <p className="text-slate-600">{rotaOtimizada.justificativa}</p>
            </div>

            {rotaOtimizada.alertas?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 p-3 rounded">
                <p className="font-medium text-yellow-800 text-sm mb-1">⚠️ Alertas:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {rotaOtimizada.alertas.map((alerta, i) => (
                    <li key={i}>• {alerta}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => criarRotaMutation.mutate()}
              disabled={criarRotaMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {criarRotaMutation.isPending ? 'Criando...' : '✅ Criar Rota'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}