import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { executarCicloAutomatico } from './AutomacaoCicloPedido';

/**
 * V21.7 - MONITOR DE AUTOMAÇÃO DE PEDIDOS
 * 
 * Monitora e executa automações em tempo real
 * Exibe pedidos que estão prontos para automação
 */
export default function MonitorAutomacaoPedidos() {
  const [autoRun, setAutoRun] = useState(false);
  const [processando, setProcessando] = useState(false);
  const queryClient = useQueryClient();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-updated_date'),
    refetchInterval: autoRun ? 10000 : false, // Atualiza a cada 10s se auto-run ativo
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes'],
    queryFn: () => base44.entities.MovimentacaoEstoque.list('-created_date', 50),
  });

  // 🎯 Pedidos prontos para automação
  const pedidosProntosParaAutomacao = pedidos.filter(p => 
    ['Rascunho', 'Aprovado', 'Faturado'].includes(p.status) &&
    p.status !== 'Cancelado' &&
    p.desconto_geral_pedido_percentual === 0 // Sem necessidade de aprovação
  );

  const pedidosAprovadosHoje = pedidos.filter(p => {
    const hoje = new Date().toISOString().split('T')[0];
    const dataAtualizacao = new Date(p.updated_date).toISOString().split('T')[0];
    return p.status === 'Pronto para Faturar' && dataAtualizacao === hoje;
  }).length;

  const movimentacoesAutomaticasHoje = movimentacoes.filter(m => {
    const hoje = new Date().toISOString().split('T')[0];
    const dataMovimentacao = new Date(m.data_movimentacao).toISOString().split('T')[0];
    return m.motivo?.includes('🤖') && dataMovimentacao === hoje;
  }).length;

  const taxaAutomacao = pedidos.length > 0 
    ? ((pedidos.filter(p => ['Pronto para Faturar', 'Em Expedição', 'Entregue'].includes(p.status)).length / pedidos.length) * 100)
    : 0;

  // 🤖 Executar automação em lote
  const executarAutomacaoEmLote = async () => {
    setProcessando(true);
    
    for (const pedido of pedidosProntosParaAutomacao.slice(0, 5)) {
      try {
        await executarCicloAutomatico(pedido.id);
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre pedidos
      } catch (error) {
        console.error(`Erro ao processar pedido ${pedido.id}:`, error);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
    toast.success('✅ Automação em lote concluída!');
    setProcessando(false);
  };

  // Auto-run se ativado
  useEffect(() => {
    if (autoRun && pedidosProntosParaAutomacao.length > 0 && !processando) {
      const timer = setTimeout(() => {
        executarAutomacaoEmLote();
      }, 15000); // Executa a cada 15 segundos

      return () => clearTimeout(timer);
    }
  }, [autoRun, pedidosProntosParaAutomacao.length, processando]);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">🤖 Monitor de Automação</CardTitle>
                <p className="text-sm text-slate-600">Sistema inteligente de ciclo automático</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setAutoRun(!autoRun)}
                variant={autoRun ? "default" : "outline"}
                className={autoRun ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {autoRun ? (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Auto-Run Ativo
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Ativar Auto-Run
                  </>
                )}
              </Button>

              {pedidosProntosParaAutomacao.length > 0 && (
                <Button
                  onClick={executarAutomacaoEmLote}
                  disabled={processando}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {processando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      🚀 Executar Agora ({pedidosProntosParaAutomacao.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Taxa de Automação</p>
                <p className="text-3xl font-bold text-green-600">{taxaAutomacao.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-30" />
            </div>
            <Progress value={taxaAutomacao} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Aprovados Hoje</p>
                <p className="text-3xl font-bold text-blue-600">{pedidosAprovadosHoje}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-blue-600 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Baixas Auto Hoje</p>
                <p className="text-3xl font-bold text-purple-600">{movimentacoesAutomaticasHoje}</p>
              </div>
              <Zap className="w-10 h-10 text-purple-600 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Na Fila</p>
                <p className="text-3xl font-bold text-orange-600">{pedidosProntosParaAutomacao.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fila de Automação */}
      {pedidosProntosParaAutomacao.length > 0 && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Clock className="w-5 h-5" />
              🔄 Fila de Automação ({pedidosProntosParaAutomacao.length} pedidos)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pedidosProntosParaAutomacao.slice(0, 10).map(pedido => (
              <div key={pedido.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{pedido.numero_pedido}</p>
                  <p className="text-sm text-slate-600">{pedido.cliente_nome}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={
                    pedido.status === 'Aprovado' ? 'bg-green-500' :
                    pedido.status === 'Faturado' ? 'bg-blue-500' :
                    'bg-slate-500'
                  }>
                    {pedido.status}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    🤖 Pronto
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status do Auto-Run */}
      {autoRun && (
        <Alert className="border-green-300 bg-green-50">
          <AlertDescription className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse" />
            <span className="text-green-900 font-semibold">
              🤖 Sistema em modo automático • Próxima execução em 15 segundos
            </span>
          </AlertDescription>
        </Alert>
      )}

      {pedidosProntosParaAutomacao.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold text-slate-700">
              ✅ Todos os pedidos estão atualizados!
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Nenhum pedido na fila de automação no momento
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}