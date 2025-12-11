import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Activity, TrendingUp, Clock } from 'lucide-react';

/**
 * V21.7 - WIDGET DE AUTOMAÇÃO EM TEMPO REAL
 * Exibe métricas de automação no Dashboard
 */
export default function WidgetAutomacaoRealtime() {
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-updated_date', 50),
    refetchInterval: 10000
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes'],
    queryFn: () => base44.entities.MovimentacaoEstoque.list('-created_date', 50),
    refetchInterval: 10000
  });

  const hoje = new Date().toISOString().split('T')[0];

  const automatizacoesHoje = movimentacoes.filter(m => {
    const dataMovimentacao = new Date(m.data_movimentacao).toISOString().split('T')[0];
    return m.motivo?.includes('🤖') && dataMovimentacao === hoje;
  }).length;

  const pedidosAutomatizadosHoje = pedidos.filter(p => {
    const dataAtualizacao = new Date(p.updated_date).toISOString().split('T')[0];
    return ['Pronto para Faturar', 'Em Expedição', 'Entregue'].includes(p.status) && 
           dataAtualizacao === hoje;
  }).length;

  const pedidosNaFila = pedidos.filter(p => 
    ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição'].includes(p.status)
  ).length;

  const taxaAutomacao = pedidos.length > 0 
    ? ((pedidos.filter(p => ['Entregue', 'Em Trânsito'].includes(p.status)).length / pedidos.length) * 100)
    : 0;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-600" />
          🤖 Automação em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/80 rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600">Hoje</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{automatizacoesHoje}</p>
            <p className="text-xs text-slate-500">automações</p>
          </div>

          <div className="bg-white/80 rounded-lg p-3 border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600">Processados</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{pedidosAutomatizadosHoje}</p>
            <p className="text-xs text-slate-500">pedidos</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Taxa de Automação</span>
            <span className="font-bold text-purple-600">{taxaAutomacao.toFixed(1)}%</span>
          </div>
          <Progress value={taxaAutomacao} className="h-2" />
        </div>

        {pedidosNaFila > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-orange-900">
                {pedidosNaFila} na fila
              </p>
              <p className="text-xs text-orange-700">Aguardando processamento</p>
            </div>
            <Badge className="bg-orange-600 text-white animate-pulse">
              ⚡ Ativo
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}