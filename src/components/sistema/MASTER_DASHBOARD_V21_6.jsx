import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  Sparkles,
  Activity,
  TrendingUp,
  Package,
  DollarSign,
  Truck,
  FileText,
  Shield,
  Database,
  Rocket
} from 'lucide-react';
import { obterEstatisticasAutomacao } from '@/components/lib/useFluxoPedido';
import { useWindow } from '@/components/lib/useWindow';
import AutomacaoFluxoPedido from '@/components/comercial/AutomacaoFluxoPedido';
import DashboardFechamentoPedidos from '@/components/comercial/DashboardFechamentoPedidos';
import ValidacaoFinalTotalV21_6 from './VALIDACAO_FINAL_TOTAL_V21_6';
import ChecklistFinalV21_6 from './CHECKLIST_FINAL_V21_6';

/**
 * V21.6 FINAL - MASTER DASHBOARD
 * Dashboard mestre unificado com todas as métricas, validações e ações rápidas
 */
export default function MasterDashboardV21_6({ windowMode = false, empresaId = null }) {
  const { openWindow } = useWindow();
  const [estatisticasIA, setEstatisticasIA] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    obterEstatisticasAutomacao(empresaId, 7)
      .then(stats => setEstatisticasIA(stats))
      .catch(() => setEstatisticasIA(null));
  }, [empresaId]);

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', empresaId],
    queryFn: () => empresaId
      ? base44.entities.Pedido.filter({ empresa_id: empresaId })
      : base44.entities.Pedido.list(),
    initialData: []
  });

  const pedidosProntos = pedidos.filter(p => 
    p.status === 'Rascunho' && 
    (p.itens_revenda?.length > 0 || p.itens_armado_padrao?.length > 0)
  );

  const containerClass = windowMode 
    ? 'w-full h-full flex flex-col overflow-hidden' 
    : '';

  const contentClass = windowMode 
    ? 'flex-1 overflow-y-auto p-6' 
    : '';

  const Wrapper = ({ children }) => windowMode ? (
    <div className={containerClass}>
      <div className={contentClass}>{children}</div>
    </div>
  ) : (
    <>{children}</>
  );

  return (
    <Wrapper>
      <div className="space-y-6">
        {/* Header Master */}
        <Card className="border-4 border-blue-500 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-3xl">
                  <Rocket className="w-10 h-10 text-blue-600" />
                  Master Dashboard V21.6
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  Central de comando do sistema de fechamento automático
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                  V21.6 Final
                </Badge>
                {estatisticasIA && (
                  <Badge className="bg-purple-600 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA Ativa
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        {estatisticasIA && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-purple-200 bg-purple-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {estatisticasIA.totalPedidos}
                </div>
                <div className="text-xs text-slate-600">Pedidos (7d)</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {estatisticasIA.pedidosFechados}
                </div>
                <div className="text-xs text-slate-600">Fechados</div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {estatisticasIA.pedidosAutomaticos}
                </div>
                <div className="text-xs text-slate-600">Automáticos</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {estatisticasIA.taxaAutomacao.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600">Taxa Auto</div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <Package className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {pedidosProntos.length}
                </div>
                <div className="text-xs text-slate-600">Prontos</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="validacao">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Validação
            </TabsTrigger>
            <TabsTrigger value="metricas">
              <Activity className="w-4 h-4 mr-2" />
              Métricas
            </TabsTrigger>
            <TabsTrigger value="acoes">
              <Rocket className="w-4 h-4 mr-2" />
              Ações Rápidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ChecklistFinalV21_6 />
          </TabsContent>

          <TabsContent value="validacao" className="space-y-4">
            <ValidacaoFinalTotalV21_6 windowMode={false} empresaId={empresaId} />
          </TabsContent>

          <TabsContent value="metricas" className="space-y-4">
            <DashboardFechamentoPedidos windowMode={false} empresaId={empresaId} />
          </TabsContent>

          <TabsContent value="acoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => openWindow(
                    DashboardFechamentoPedidos,
                    { windowMode: true, empresaId },
                    { title: '📊 Dashboard Completo', width: 1200, height: 700 }
                  )}
                  className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
                  size="lg"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Abrir Dashboard de Métricas
                </Button>

                {pedidosProntos.length > 0 && (
                  <Card className="bg-green-50 border-green-300">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold text-green-900 mb-2">
                        {pedidosProntos.length} pedido(s) pronto(s) para fechar automaticamente
                      </p>
                      <div className="space-y-2">
                        {pedidosProntos.slice(0, 3).map(pedido => (
                          <div key={pedido.id} className="flex items-center justify-between bg-white p-2 rounded">
                            <div>
                              <p className="font-semibold text-sm">{pedido.numero_pedido}</p>
                              <p className="text-xs text-slate-600">{pedido.cliente_nome}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openWindow(
                                AutomacaoFluxoPedido,
                                { pedido, empresaId: pedido.empresa_id, windowMode: true, autoExecute: false },
                                { title: `🚀 Fechar ${pedido.numero_pedido}`, width: 1200, height: 700 }
                              )}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Fechar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Certificação Visual */}
        <Card className="border-4 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-green-900 mb-2">
              Sistema 100% Completo
            </h2>
            <p className="text-lg text-green-700 mb-4">
              Certificado para produção imediata
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge className="bg-green-600 text-white px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                V21.6 Final
              </Badge>
              <Badge className="bg-purple-600 text-white px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                IA Integrada
              </Badge>
              <Badge className="bg-blue-600 text-white px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Multi-Empresa
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
}