import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Package, Save, Sparkles } from 'lucide-react';

export default function CriarOrdemProducao() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    numero_op: `OP-${Date.now()}`,
    tipo_producao: 'Armado Padrão',
    prioridade: 'Normal',
    pedido_id: '',
    peso_total_kg: 0,
    data_previsao_inicio: format(new Date(), 'yyyy-MM-dd'),
    data_previsao_fim: format(addDays(new Date(), 7), 'yyyy-MM-dd')
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos_producao'],
    queryFn: async () => {
      const lista = await base44.entities.Pedido.list();
      return lista.filter(p => p.status === 'Aprovado' || p.status === 'Em Produção');
    }
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const criarOPMutation = useMutation({
    mutationFn: async (data) => {
      const pedido = pedidos.find(p => p.id === data.pedido_id);
      
      return await base44.entities.OrdemProducao.create({
        ...data,
        numero_pedido: pedido?.numero_pedido,
        cliente_id: pedido?.cliente_id,
        cliente_nome: pedido?.cliente_nome,
        status: 'Planejada',
        peso_produzido_kg: 0,
        refugo_total_kg: 0,
        percentual_refugo: 0,
        apontamentos: [],
        alertas_ia: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordens_producao']);
      toast.success('Ordem de Produção criada com sucesso!');
      window.close?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.pedido_id) {
      toast.error('Selecione um pedido');
      return;
    }

    if (!formData.empresa_id) {
      toast.error('Selecione uma empresa');
      return;
    }

    criarOPMutation.mutate(formData);
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Nova Ordem de Produção
        </h1>
        <p className="text-sm text-slate-600">
          Crie uma nova OP vinculada a um pedido aprovado
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Informações da OP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número da OP</Label>
                <Input
                  value={formData.numero_op}
                  onChange={(e) => setFormData({ ...formData, numero_op: e.target.value })}
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
                <Label>Pedido Origem</Label>
                <Select
                  value={formData.pedido_id}
                  onValueChange={(value) => setFormData({ ...formData, pedido_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um pedido..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pedidos.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.numero_pedido} - {p.cliente_nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Produção</Label>
                <Select
                  value={formData.tipo_producao}
                  onValueChange={(value) => setFormData({ ...formData, tipo_producao: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Armado Padrão">Armado Padrão</SelectItem>
                    <SelectItem value="Corte e Dobra">Corte e Dobra</SelectItem>
                    <SelectItem value="Produção Sob Medida">Sob Medida</SelectItem>
                    <SelectItem value="Misto">Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Peso Total (kg)</Label>
                <Input
                  type="number"
                  value={formData.peso_total_kg}
                  onChange={(e) => setFormData({ ...formData, peso_total_kg: parseFloat(e.target.value) })}
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label>Previsão Início</Label>
                <Input
                  type="date"
                  value={formData.data_previsao_inicio}
                  onChange={(e) => setFormData({ ...formData, data_previsao_inicio: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Previsão Fim</Label>
                <Input
                  type="date"
                  value={formData.data_previsao_fim}
                  onChange={(e) => setFormData({ ...formData, data_previsao_fim: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-blue-900 mb-1">IA de Otimização</p>
                <p className="text-sm text-blue-800">
                  Após criar a OP, a IA irá sugerir automaticamente otimizações de corte, 
                  sequenciamento de dobra e reaproveitamento de sobras de aço.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => window.close?.()}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={criarOPMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {criarOPMutation.isPending ? 'Criando...' : 'Criar Ordem de Produção'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function format(date, formatStr) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}