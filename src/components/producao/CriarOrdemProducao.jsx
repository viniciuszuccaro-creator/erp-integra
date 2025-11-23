import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sparkles, Package } from 'lucide-react';

export default function CriarOrdemProducao() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    numero_op: '',
    pedido_id: '',
    tipo_producao: 'Armado Padrão',
    prioridade: 'Normal',
    peso_total_kg: 0,
    custo_previsto: 0,
    data_previsao_inicio: '',
    data_previsao_fim: ''
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos_disponiveis'],
    queryFn: async () => {
      const lista = await base44.entities.Pedido.list();
      return lista.filter(p => p.status === 'Aprovado' || p.status === 'Pronto para Faturar');
    }
  });

  const criarOPMutation = useMutation({
    mutationFn: async (dados) => {
      const pedido = pedidos.find(p => p.id === dados.pedido_id);
      
      return await base44.entities.OrdemProducao.create({
        ...dados,
        empresa_id: pedido.empresa_id,
        group_id: pedido.group_id,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        numero_pedido: pedido.numero_pedido,
        status: 'Planejada',
        peso_produzido_kg: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordens_producao']);
      toast.success('Ordem de Produção criada com sucesso!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    criarOPMutation.mutate(formData);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Nova Ordem de Produção</h2>
        <p className="text-sm text-slate-600">ETAPA 5 - Criar OP a partir de Pedido</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número da OP</Label>
                <Input
                  value={formData.numero_op}
                  onChange={(e) => setFormData({...formData, numero_op: e.target.value})}
                  placeholder="OP-001"
                  required
                />
              </div>

              <div>
                <Label>Pedido Origem</Label>
                <select
                  value={formData.pedido_id}
                  onChange={(e) => setFormData({...formData, pedido_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione...</option>
                  {pedidos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.numero_pedido} - {p.cliente_nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Tipo de Produção</Label>
                <select
                  value={formData.tipo_producao}
                  onChange={(e) => setFormData({...formData, tipo_producao: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option>Armado Padrão</option>
                  <option>Corte e Dobra</option>
                  <option>Produção Sob Medida</option>
                  <option>Misto</option>
                </select>
              </div>

              <div>
                <Label>Prioridade</Label>
                <select
                  value={formData.prioridade}
                  onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option>Baixa</option>
                  <option>Normal</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Planejamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Peso Total (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.peso_total_kg}
                  onChange={(e) => setFormData({...formData, peso_total_kg: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label>Custo Previsto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_previsto}
                  onChange={(e) => setFormData({...formData, custo_previsto: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label>Previsão Início</Label>
                <Input
                  type="date"
                  value={formData.data_previsao_inicio}
                  onChange={(e) => setFormData({...formData, data_previsao_inicio: e.target.value})}
                />
              </div>

              <div>
                <Label>Previsão Fim</Label>
                <Input
                  type="date"
                  value={formData.data_previsao_fim}
                  onChange={(e) => setFormData({...formData, data_previsao_fim: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Package className="w-4 h-4 mr-2" />
            Criar Ordem de Produção
          </Button>
        </div>
      </form>
    </div>
  );
}