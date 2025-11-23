import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Truck, Sparkles, Navigation, CheckCircle } from 'lucide-react';

export default function CriarRomaneioForm({ entregasPendentes }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    numero_romaneio: '',
    motorista_id: '',
    veiculo_id: '',
    data_romaneio: new Date().toISOString().split('T')[0]
  });
  const [entregasSelecionadas, setEntregasSelecionadas] = useState([]);
  const [rotaOtimizada, setRotaOtimizada] = useState(null);
  const [otimizando, setOtimizando] = useState(false);

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => base44.entities.Motorista.list()
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list()
  });

  const toggleEntrega = (pedido) => {
    if (entregasSelecionadas.find(e => e.id === pedido.id)) {
      setEntregasSelecionadas(entregasSelecionadas.filter(e => e.id !== pedido.id));
    } else {
      setEntregasSelecionadas([...entregasSelecionadas, pedido]);
    }
  };

  const otimizarRotaIA = async () => {
    if (entregasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma entrega');
      return;
    }

    setOtimizando(true);
    
    try {
      const enderecos = entregasSelecionadas.map(e => ({
        cliente: e.cliente_nome,
        endereco: e.endereco_entrega_principal,
        prioridade: e.prioridade,
        janela_entrega: {
          horario_inicio: e.endereco_entrega_principal?.horario_inicio,
          horario_fim: e.endereco_entrega_principal?.horario_fim
        }
      }));

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Otimize a rota de entrega considerando: distância, trânsito, janelas de entrega, prioridade de clientes e custo de frete. Endereços: ${JSON.stringify(enderecos)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            distancia_total_km: { type: 'number' },
            tempo_total_minutos: { type: 'number' },
            custo_total_frete: { type: 'number' },
            sequencia_otimizada: { type: 'array', items: { type: 'string' } },
            consideracoes_ia: { type: 'string' }
          }
        }
      });

      setRotaOtimizada({ ...resultado, gerado_por_ia: true });
      toast.success('Rota otimizada pela IA!');
    } catch (error) {
      toast.error('Erro ao otimizar rota');
    } finally {
      setOtimizando(false);
    }
  };

  const criarRomaneioMutation = useMutation({
    mutationFn: async (dados) => {
      const motorista = motoristas.find(m => m.id === dados.motorista_id);
      const veiculo = veiculos.find(v => v.id === dados.veiculo_id);

      const entregas = entregasSelecionadas.map((pedido, idx) => ({
        entrega_id: `ENT-${Date.now()}-${idx}`,
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        endereco: pedido.endereco_entrega_principal,
        janela_entrega: {
          horario_inicio: pedido.endereco_entrega_principal?.horario_inicio,
          horario_fim: pedido.endereco_entrega_principal?.horario_fim
        },
        peso_kg: pedido.peso_total_kg || 0,
        volumes: 1,
        ordem_sequencia: idx + 1,
        status_entrega: 'Pendente'
      }));

      return await base44.entities.RomaneioEntrega.create({
        ...dados,
        motorista_nome: motorista.nome_completo,
        veiculo_placa: veiculo.placa,
        entregas,
        rota_otimizada: rotaOtimizada,
        status: 'Planejado'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['romaneios_entrega']);
      toast.success('Romaneio criado com sucesso!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entregasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma entrega');
      return;
    }
    criarRomaneioMutation.mutate(formData);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Novo Romaneio com IA</h2>
        <p className="text-sm text-slate-600">ETAPA 6 - Roteirização Inteligente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações do Romaneio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Número do Romaneio</Label>
                <Input
                  value={formData.numero_romaneio}
                  onChange={(e) => setFormData({...formData, numero_romaneio: e.target.value})}
                  placeholder="ROM-001"
                  required
                />
              </div>

              <div>
                <Label>Motorista</Label>
                <select
                  value={formData.motorista_id}
                  onChange={(e) => setFormData({...formData, motorista_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione...</option>
                  {motoristas.map(m => (
                    <option key={m.id} value={m.id}>{m.nome_completo}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Veículo</Label>
                <select
                  value={formData.veiculo_id}
                  onChange={(e) => setFormData({...formData, veiculo_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione...</option>
                  {veiculos.map(v => (
                    <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Selecionar Entregas ({entregasSelecionadas.length} selecionadas)
              </CardTitle>
              <Button
                type="button"
                onClick={otimizarRotaIA}
                disabled={entregasSelecionadas.length === 0 || otimizando}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {otimizando ? 'Otimizando...' : 'Otimizar Rota com IA'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {entregasPendentes?.map(pedido => (
              <div
                key={pedido.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  entregasSelecionadas.find(e => e.id === pedido.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => toggleEntrega(pedido)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={!!entregasSelecionadas.find(e => e.id === pedido.id)}
                    onCheckedChange={() => toggleEntrega(pedido)}
                  />
                  
                  <div className="flex-1">
                    <p className="font-medium text-sm">{pedido.cliente_nome}</p>
                    <p className="text-xs text-slate-600">
                      Pedido: {pedido.numero_pedido} • 
                      {pedido.endereco_entrega_principal?.cidade} - {pedido.endereco_entrega_principal?.estado}
                    </p>
                  </div>

                  <Badge variant={pedido.prioridade === 'Urgente' ? 'destructive' : 'secondary'}>
                    {pedido.prioridade}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rota Otimizada */}
        {rotaOtimizada && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-green-900">
                <Navigation className="w-4 h-4" />
                Rota Otimizada pela IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600 mb-1">Distância Total</p>
                  <p className="text-lg font-bold">{rotaOtimizada.distancia_total_km?.toFixed(1)} km</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600 mb-1">Tempo Estimado</p>
                  <p className="text-lg font-bold">{rotaOtimizada.tempo_total_minutos} min</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600 mb-1">Custo Frete</p>
                  <p className="text-lg font-bold text-green-600">
                    R$ {rotaOtimizada.custo_total_frete?.toFixed(2)}
                  </p>
                </div>
              </div>

              {rotaOtimizada.consideracoes_ia && (
                <div className="p-3 bg-white rounded text-sm">
                  <p className="font-medium text-green-900 mb-1">Considerações da IA:</p>
                  <p className="text-slate-700">{rotaOtimizada.consideracoes_ia}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Truck className="w-4 h-4 mr-2" />
            Criar Romaneio
          </Button>
        </div>
      </form>
    </div>
  );
}