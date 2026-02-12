import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Truck,
  Factory,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Sparkles
} from 'lucide-react';
import { useRealtimeKPIs, useRealtimePedidos, useRealtimeEntregas } from '@/components/lib/useRealtimeData';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Dashboard em Tempo Real
 * V21.7: Auto-atualiza a cada 10s + Multiempresa + IA
 */
function DashboardTempoReal({ empresaId, windowMode = false }) {
  const [pulseActive, setPulseActive] = useState(false);
  const { empresaAtual, estaNoGrupo, grupoAtual, filtrarPorContexto } = useContextoVisual();
  
  // Usar empresa do contexto se não fornecida
  const empresaIdFinal = empresaId || empresaAtual?.id;
  const groupIdFinal = estaNoGrupo ? (grupoAtual?.id || null) : null;
  
  // Dados em tempo real
  const { data: kpis, isLoading, hasChanges, error: kpiError, refetch } = useRealtimeKPIs(empresaIdFinal, 45000, groupIdFinal);
  const { data: pedidosRecentes } = useRealtimePedidos(empresaIdFinal, 5, groupIdFinal);
  const { data: entregasAtivas } = useRealtimeEntregas(empresaIdFinal, groupIdFinal) || {};

  const semDadosKPI = (kpis?.pedidos?.hoje || 0) + (kpis?.financeiro?.vencendoHoje || 0) + (kpis?.producao?.opsEmAndamento || 0) + (kpis?.expedicao?.entregasHoje || 0) === 0;

  // Pulse visual quando atualizar
  useEffect(() => {
    if (hasChanges) {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 1000);
    }
  }, [hasChanges]);

  if (!kpis) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Carregando dados em tempo real...</p>
        </div>
      </div>
    );
  }

  const ultimaAtualizacao = kpis.ultimaAtualizacao 
    ? new Date(kpis.ultimaAtualizacao).toLocaleTimeString('pt-BR')
    : '-';

  const containerClass = windowMode 
    ? "w-full h-full flex flex-col overflow-auto" 
    : "w-full space-y-6 overflow-auto";

  return (
    <div className={`${containerClass} min-h-[500px]`}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6"}>
      {/* Header com Status */}
      <Alert className="border-green-300 bg-green-50">
        <Activity className={`w-5 h-5 text-green-600 ${pulseActive ? 'animate-pulse' : ''}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Dashboard em Tempo Real Ativo
              </p>
              <p className="text-sm text-green-700">
                {estaNoGrupo ? 'Visão Consolidada do Grupo' : empresaAtual?.nome_fantasia || empresaAtual?.razao_social || 'Empresa'} • Auto-atualização: {ultimaAtualizacao}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 px-3">
                <Target className="w-3 h-3 mr-1" />
                {estaNoGrupo ? 'GRUPO' : 'EMPRESA'}
              </Badge>
              <div className={`w-2 h-2 rounded-full ${pulseActive ? 'bg-green-600 animate-ping' : 'bg-green-600'}`} />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {kpiError && (
        <Alert className="border-red-300 bg-red-50">
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Erro ao carregar dados em tempo real (possível limite de requisições).</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Tentar novamente</Button>
          </AlertDescription>
        </Alert>
      )}
      {semDadosKPI && !kpiError && (
        <Alert className="border-amber-300 bg-amber-50">
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Nenhum dado recente por enquanto.</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Atualizar</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* COMERCIAL */}
        <motion.div className="h-full"
          initial={false}
          animate={hasChanges ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pedidos Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {kpis.pedidos.hoje}
              </div>
              <p className="text-sm text-blue-600 mt-1">
                R$ {kpis.pedidos.valorHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  {kpis.pedidos.aguardandoAprovacao} aguardando
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  {kpis.pedidos.emProducao} produzindo
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FINANCEIRO */}
        <motion.div className="h-full"
          initial={false}
          animate={hasChanges ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financeiro Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {kpis.financeiro.vencendoHoje}
              </div>
              <p className="text-sm text-green-600 mt-1">
                R$ {kpis.financeiro.valorHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="flex gap-2 mt-3">
                {kpis.financeiro.atrasados > 0 && (
                  <Badge className="bg-red-100 text-red-700 text-xs">
                    {kpis.financeiro.atrasados} atrasados
                  </Badge>
                )}
                {kpis.financeiro.recebidosHoje > 0 && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {kpis.financeiro.recebidosHoje} recebidos
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PRODUÇÃO */}
        <motion.div className="h-full"
          initial={false}
          animate={hasChanges ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Factory className="w-4 h-4" />
                Produção Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {kpis.producao.opsEmAndamento}
              </div>
              <p className="text-sm text-purple-600 mt-1">
                {kpis.producao.percentualMedio}% conclusão média
              </p>
              <div className="flex gap-2 mt-3">
                {kpis.producao.opsAtrasadas > 0 && (
                  <Badge className="bg-red-100 text-red-700 text-xs">
                    {kpis.producao.opsAtrasadas} atrasadas
                  </Badge>
                )}
                {kpis.producao.opsFinalizadasHoje > 0 && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {kpis.producao.opsFinalizadasHoje} finalizadas
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* EXPEDIÇÃO */}
        <motion.div className="h-full"
          initial={false}
          animate={hasChanges ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Entregas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {kpis.expedicao.entregasHoje}
              </div>
              <p className="text-sm text-orange-600 mt-1">
                {kpis.expedicao.realizadas} realizadas
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  {kpis.expedicao.pendentes} pendentes
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  {kpis.expedicao.emRota} em rota
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pedidos Recentes */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Pedidos Recentes
            <Badge className="ml-auto bg-blue-600">Tempo Real</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-[520px] md:max-h-[640px] overflow-auto">
          <div className="divide-y">
            <AnimatePresence>
              {pedidosRecentes?.map((pedido) => (
                <motion.div
                  key={pedido.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-900">
                          {pedido.numero_pedido}
                        </span>
                        <Badge className={
                          pedido.status === 'Aprovado' ? 'bg-green-100 text-green-700' :
                          pedido.status === 'Em Produção' ? 'bg-blue-100 text-blue-700' :
                          pedido.status === 'Aguardando Aprovação' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {pedido.status}
                        </Badge>
                        {pedido.prioridade === 'Urgente' && (
                          <Badge className="bg-red-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {pedido.cliente_nome}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-green-600">
                        R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(pedido.created_date).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {(!pedidosRecentes || pedidosRecentes.length === 0) && (
              <div className="text-center py-8 text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum pedido recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entregas Ativas */}
      {entregasAtivas && entregasAtivas.length > 0 && (
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="bg-orange-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Entregas em Andamento
              <Badge className="ml-auto bg-orange-600">
                {entregasAtivas.length} ativas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[520px] md:max-h-[640px] overflow-auto">
            <div className="divide-y">
              <AnimatePresence>
                {entregasAtivas.slice(0, 5).map((entrega) => (
                  <motion.div
                    key={entrega.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {entrega.numero_pedido}
                          </span>
                          <Badge className={
                            entrega.status === 'Saiu para Entrega' ? 'bg-blue-600' :
                            entrega.status === 'Em Trânsito' ? 'bg-orange-600' :
                            entrega.status === 'Pronto para Expedir' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {entrega.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {entrega.cliente_nome} • {entrega.endereco_entrega_completo?.cidade || '-'}
                        </p>
                        {entrega.motorista && (
                          <p className="text-xs text-slate-500 mt-1">
                            🚚 {entrega.motorista} • {entrega.placa}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {entrega.data_previsao && (
                          <p className="text-sm text-slate-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas em Tempo Real */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Alerta: Pedidos Aguardando */}
        {kpis.pedidos.aguardandoAprovacao > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">
                      {kpis.pedidos.aguardandoAprovacao} Pedido(s)
                    </p>
                    <p className="text-sm text-orange-700">Aguardando Aprovação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Alerta: Títulos Atrasados */}
        {kpis.financeiro.atrasados > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      {kpis.financeiro.atrasados} Título(s)
                    </p>
                    <p className="text-sm text-red-700">Vencidos/Atrasados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Alerta: OPs Atrasadas */}
        {kpis.producao.opsAtrasadas > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Factory className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-900">
                      {kpis.producao.opsAtrasadas} OP(s)
                    </p>
                    <p className="text-sm text-red-700">Atrasadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Barra de Progresso Global */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Operações em Andamento</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Produção */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Produção</span>
              <span className="text-sm font-semibold text-purple-600">
                {kpis.producao.percentualMedio}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${kpis.producao.percentualMedio}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {kpis.producao.opsEmAndamento} OPs em andamento
            </p>
          </div>

          {/* Entregas */}
          {kpis.expedicao.entregasHoje > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Entregas Hoje</span>
                <span className="text-sm font-semibold text-orange-600">
                  {Math.round((kpis.expedicao.realizadas / kpis.expedicao.entregasHoje) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <motion.div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(kpis.expedicao.realizadas / kpis.expedicao.entregasHoje) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {kpis.expedicao.realizadas} de {kpis.expedicao.entregasHoje} concluídas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IA: Insights Rápidos */}
      {kpis.pedidos.aguardandoAprovacao > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div className="flex-1">
                  <p className="font-bold text-purple-900">
                    IA: {kpis.pedidos.aguardandoAprovacao} pedidos aguardando aprovação
                  </p>
                  <p className="text-sm text-purple-700">
                    Ação sugerida: Revisar e aprovar pedidos urgentes para não atrasar produção
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timestamp */}
      <div className="text-center text-xs text-slate-500">
        <Activity className="w-3 h-3 inline mr-1" />
        Atualizado automaticamente a cada 10 segundos
      </div>
      </div>
    </div>
  );
}
export default React.memo(DashboardTempoReal);