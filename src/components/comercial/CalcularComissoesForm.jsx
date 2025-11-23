import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function CalcularComissoesForm({ onSubmit, onCancel, pedidos = [] }) {
  const [periodo, setPeriodo] = useState('mes');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCalcularComissoes = async () => {
    try {
      const hoje = new Date();
      let dataInicioCalculo = new Date();
      let dataFimCalculo = hoje;

      if (periodo === 'mes') {
        dataInicioCalculo = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      } else if (periodo === 'trimestre') {
        const trimestre = Math.floor(hoje.getMonth() / 3);
        dataInicioCalculo = new Date(hoje.getFullYear(), trimestre * 3, 1);
      } else if (periodo === 'ano') {
        dataInicioCalculo = new Date(hoje.getFullYear(), 0, 1);
      } else if (periodo === 'personalizado' && dataInicio && dataFim) {
        dataInicioCalculo = new Date(dataInicio);
        dataFimCalculo = new Date(dataFim);
      }

      const pedidosPeriodo = pedidos.filter(p => {
        if (p.status !== 'Aprovado' && p.status !== 'Faturado' && p.status !== 'Entregue') return false;
        const dataPedido = new Date(p.data_pedido);
        return dataPedido >= dataInicioCalculo && dataPedido <= dataFimCalculo;
      });

      if (pedidosPeriodo.length === 0) {
        toast({ title: '⚠️ Nenhum pedido encontrado no período selecionado', variant: 'destructive' });
        return;
      }

      const comissoesPorVendedor = {};
      pedidosPeriodo.forEach(pedido => {
        const vendedor = pedido.vendedor || 'Sem Vendedor';
        if (!comissoesPorVendedor[vendedor]) {
          comissoesPorVendedor[vendedor] = {
            vendedor,
            vendedor_id: pedido.vendedor_id,
            pedidos: [],
            total_vendas: 0
          };
        }
        comissoesPorVendedor[vendedor].pedidos.push(pedido);
        comissoesPorVendedor[vendedor].total_vendas += pedido.valor_total || 0;
      });

      let contador = 0;
      for (const vendedor in comissoesPorVendedor) {
        const dados = comissoesPorVendedor[vendedor];
        const percentual = 5;
        const valorComissao = dados.total_vendas * (percentual / 100);

        await base44.entities.Comissao.create({
          vendedor: dados.vendedor,
          vendedor_id: dados.vendedor_id,
          pedido_id: dados.pedidos[0]?.id,
          numero_pedido: `Período: ${periodo}`,
          cliente: `${dados.pedidos.length} vendas`,
          data_venda: new Date().toISOString().split('T')[0],
          valor_venda: dados.total_vendas,
          percentual_comissao: percentual,
          valor_comissao: valorComissao,
          status: 'Pendente',
          observacoes: `Comissão calculada automaticamente para ${dados.pedidos.length} vendas no período.`
        });
        contador++;
      }

      toast({ title: `✅ ${contador} comissões calculadas com sucesso!` });
      queryClient.invalidateQueries({ queryKey: ['comissoes'] });
      onSubmit();
    } catch (error) {
      toast({ title: '❌ Erro ao calcular comissões', description: error.message, variant: 'destructive' });
    }
  };

  const pedidosDisponiveis = pedidos?.filter(p => 
    p.status === 'Aprovado' || p.status === 'Faturado' || p.status === 'Entregue'
  ) || [];

  const vendedoresUnicos = [...new Set(pedidosDisponiveis.map(p => p.vendedor).filter(Boolean))];
  const totalVendasDisponiveis = pedidosDisponiveis.reduce((sum, p) => sum + (p.valor_total || 0), 0);

  return (
    <div className="p-6 space-y-6 w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Calculator className="w-7 h-7 text-purple-600" />
        Calcular Comissões
      </h2>
      
      <div className="flex-1 space-y-4 overflow-y-auto">
        <div>
          <Label htmlFor="periodo">Período</Label>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger id="periodo">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mês Atual</SelectItem>
              <SelectItem value="trimestre">Trimestre Atual</SelectItem>
              <SelectItem value="ano">Ano Atual</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {periodo === 'personalizado' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        )}

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pedidos Disponíveis:</span>
              <span className="font-bold text-lg text-blue-600">{pedidosDisponiveis.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Vendedores Únicos:</span>
              <span className="font-bold text-lg text-purple-600">{vendedoresUnicos.length}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-slate-600">Total em Vendas:</span>
              <span className="font-bold text-lg text-green-600">
                R$ {totalVendasDisponiveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Comissões Estimadas (5%):</span>
              <span className="font-bold text-lg text-orange-600">
                R$ {(totalVendasDisponiveis * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 text-blue-900">O sistema irá:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Buscar todos os pedidos aprovados/faturados no período</li>
              <li>• Agrupar por vendedor</li>
              <li>• Calcular comissão de 5% sobre o total</li>
              <li>• Criar registros pendentes de aprovação</li>
            </ul>
          </CardContent>
        </Card>

        {vendedoresUnicos.length > 0 && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 text-purple-900">Vendedores que receberão comissões:</h4>
              <div className="flex flex-wrap gap-2">
                {vendedoresUnicos.map((v, idx) => (
                  <Badge key={idx} className="bg-purple-100 text-purple-700 px-3 py-1">
                    {v}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleCalcularComissoes} className="bg-purple-600 hover:bg-purple-700">
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Comissões Agora
        </Button>
      </div>
    </div>
  );
}