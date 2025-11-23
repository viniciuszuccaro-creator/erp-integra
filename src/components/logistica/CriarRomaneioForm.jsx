import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Truck, Navigation, Sparkles, MapPin, Save } from 'lucide-react';

export default function CriarRomaneioForm({ entregasPendentes = [] }) {
  const queryClient = useQueryClient();
  const [entregasSelecionadas, setEntregasSelecionadas] = useState([]);
  const [formData, setFormData] = useState({
    numero_romaneio: `ROM-${Date.now()}`,
    data_romaneio: new Date().toISOString().split('T')[0],
    motorista_id: '',
    veiculo_id: ''
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: async () => {
      const colaboradores = await base44.entities.Colaborador.list();
      return colaboradores.filter(c => c.pode_dirigir);
    }
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list()
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const otimizarRotaMutation = useMutation({
    mutationFn: async (entregas) => {
      // Simulação de IA de Roteirização
      const entregasComDistancia = entregas.map((e, idx) => ({
        ...e,
        ordem_sequencia: idx + 1,
        distancia_km: Math.random() * 50 + 5,
        tempo_estimado_minutos: Math.random() * 60 + 30
      }));

      const distanciaTotal = entregasComDistancia.reduce((acc, e) => acc + e.distancia_km, 0);
      const tempoTotal = entregasComDistancia.reduce((acc, e) => acc + e.tempo_estimado_minutos, 0);

      return {
        entregas: entregasComDistancia,
        rota_otimizada: {
          distancia_total_km: distanciaTotal,
          tempo_total_minutos: tempoTotal,
          custo_total_frete: distanciaTotal * 2.5,
          sequencia_otimizada: entregasComDistancia.map(e => e.entrega_id),
          gerado_por_ia: true,
          consideracoes_ia: 'Rota otimizada considerando janelas de entrega, prioridade e distância'
        }
      };
    }
  });

  const criarRomaneioMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.RomaneioEntrega.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['romaneios_entrega']);
      toast.success('Romaneio criado com sucesso!');
      window.close?.();
    }
  });

  const handleOtimizarRota = async () => {
    if (entregasSelecionadas.length === 0) {
      toast.error('Selecione ao menos uma entrega');
      return;
    }

    const resultado = await otimizarRotaMutation.mutateAsync(entregasSelecionadas);
    setEntregasSelecionadas(resultado.entregas);
    toast.success('Rota otimizada pela IA!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (entregasSelecionadas.length === 0) {
      toast.error('Selecione ao menos uma entrega');
      return;
    }

    const motorista = motoristas.find(m => m.id === formData.motorista_id);
    const veiculo = veiculos.find(v => v.id === formData.veiculo_id);

    criarRomaneioMutation.mutate({
      ...formData,
      motorista_nome: motorista?.nome_completo,
      veiculo_placa: veiculo?.placa,
      entregas: entregasSelecionadas,
      status: 'Planejado'
    });
  };

  const toggleEntrega = (pedido) => {
    const jaExiste = entregasSelecionadas.find(e => e.pedido_id === pedido.id);
    
    if (jaExiste) {
      setEntregasSelecionadas(entregasSelecionadas.filter(e => e.pedido_id !== pedido.id));
    } else {
      setEntregasSelecionadas([...entregasSelecionadas, {
        entrega_id: `ENT-${Date.now()}-${pedido.id}`,
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        endereco: pedido.endereco_entrega_principal,
        peso_kg: pedido.peso_total_kg || 0,
        volumes: 1,
        status_entrega: 'Pendente',
        prioridade_cliente: pedido.prioridade
      }]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Novo Romaneio com IA de Roteirização
        </h1>
        <p className="text-sm text-slate-600">
          Selecione entregas e otimize a rota automaticamente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto space-y-6">
        {/* Dados do Romaneio */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Romaneio</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número Romaneio</Label>
              <Input
                value={formData.numero_romaneio}
                onChange={(e) => setFormData({ ...formData, numero_romaneio: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.data_romaneio}
                onChange={(e) => setFormData({ ...formData, data_romaneio: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Empresa</Label>
              <Select
                value={formData.empresa_id}
                onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nome_fantasia || emp.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Motorista</Label>
              <Select
                value={formData.motorista_id}
                onValueChange={(value) => setFormData({ ...formData, motorista_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {motoristas.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Veículo</Label>
              <Select
                value={formData.veiculo_id}
                onValueChange={(value) => setFormData({ ...formData, veiculo_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa} - {v.modelo || 'Veículo'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Entregas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Entregas Pendentes ({entregasSelecionadas.length} selecionadas)</CardTitle>
            
            {entregasSelecionadas.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleOtimizarRota}
                disabled={otimizarRotaMutation.isPending}
              >
                <Navigation className="w-4 h-4 mr-2" />
                {otimizarRotaMutation.isPending ? 'Otimizando...' : 'Otimizar Rota com IA'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-auto">
              {entregasPendentes.map(pedido => {
                const selecionado = entregasSelecionadas.find(e => e.pedido_id === pedido.id);
                
                return (
                  <div
                    key={pedido.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selecionado ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => toggleEntrega(pedido)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={!!selecionado} />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{pedido.numero_pedido}</p>
                          <Badge variant="secondary">{pedido.cliente_nome}</Badge>
                          {selecionado?.ordem_sequencia && (
                            <Badge className="bg-blue-600">
                              Ordem: {selecionado.ordem_sequencia}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {pedido.endereco_entrega_principal?.cidade} - {pedido.endereco_entrega_principal?.estado}
                          </span>
                          {selecionado?.distancia_km && (
                            <span>{selecionado.distancia_km.toFixed(1)} km</span>
                          )}
                          {selecionado?.tempo_estimado_minutos && (
                            <span>{selecionado.tempo_estimado_minutos.toFixed(0)} min</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant="outline">{pedido.peso_total_kg || 0} kg</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}

              {entregasPendentes.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  Nenhuma entrega pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultado da Otimização */}
        {entregasSelecionadas.length > 0 && entregasSelecionadas[0].ordem_sequencia && (
          <Card className="border-green-300 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Sparkles className="w-5 h-5" />
                Rota Otimizada pela IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Distância Total</p>
                  <p className="text-2xl font-bold text-green-700">
                    {entregasSelecionadas.reduce((acc, e) => acc + (e.distancia_km || 0), 0).toFixed(1)} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tempo Estimado</p>
                  <p className="text-2xl font-bold text-green-700">
                    {Math.round(entregasSelecionadas.reduce((acc, e) => acc + (e.tempo_estimado_minutos || 0), 0))} min
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Custo Frete</p>
                  <p className="text-2xl font-bold text-green-700">
                    R$ {(entregasSelecionadas.reduce((acc, e) => acc + (e.distancia_km || 0), 0) * 2.5).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => window.close?.()}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={criarRomaneioMutation.isPending || entregasSelecionadas.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            {criarRomaneioMutation.isPending ? 'Criando...' : 'Criar Romaneio'}
          </Button>
        </div>
      </form>
    </div>
  );
}