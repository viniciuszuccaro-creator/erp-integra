import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePermissions } from "@/components/lib/usePermissions";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  TrendingUp,
  Zap,
  Shield,
  Download
} from "lucide-react";
import { toast } from "sonner";
import ExportButton from "@/components/ExportButton";

/**
 * V21.6 - Gerenciador Avançado de Canais de Origem
 * Ativação/desativação rápida + insights + controle de acesso
 */
export default function GerenciadorCanaisOrigem({ windowMode = false }) {
  const { user } = usePermissions();
  const queryClient = useQueryClient();

  const { data: parametros = [], isLoading } = useQuery({
    queryKey: ['parametros-origem-pedido'],
    queryFn: () => base44.entities.ParametroOrigemPedido.list(),
    initialData: [],
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-ultimos'],
    queryFn: () => base44.entities.Pedido.list('-created_date', 200),
    initialData: [],
  });

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }) => 
      base44.entities.ParametroOrigemPedido.update(id, { ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parametros-origem-pedido'] });
      toast.success('Status atualizado!');
    },
  });

  // Calcular métricas por canal
  const calcularMetricas = (param) => {
    const origemMap = {
      'ERP': 'Manual',
      'Site': 'Site',
      'E-commerce': 'E-commerce',
      'Chatbot': 'Chatbot',
      'WhatsApp': 'WhatsApp',
      'Portal Cliente': 'Portal',
      'Marketplace': 'Marketplace',
      'API': 'API',
      'App Mobile': 'App'
    };

    const origemEsperada = origemMap[param.canal] || param.canal;
    
    const pedidosCanal = pedidos.filter(p => {
      const origemPedido = origemMap[p.origem_pedido] || p.origem_pedido;
      return origemPedido === param.canal || p.origem_pedido === origemEsperada;
    });

    const totalPedidos = pedidosCanal.length;
    const valorTotal = pedidosCanal.reduce((sum, p) => sum + (p.valor_total || 0), 0);
    const ultimos7dias = pedidosCanal.filter(p => {
      const diasAtras = (new Date() - new Date(p.created_date)) / (1000 * 60 * 60 * 24);
      return diasAtras <= 7;
    }).length;

    return { totalPedidos, valorTotal, ultimos7dias };
  };

  const CORES_BADGE = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    pink: 'bg-pink-100 text-pink-700 border-pink-300',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-300'
  };

  const containerClass = windowMode 
    ? "w-full h-full overflow-auto p-6" 
    : "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canaisAtivos = parametros.filter(p => p.ativo);
  const canaisInativos = parametros.filter(p => !p.ativo);

  return (
    <div className={containerClass}>
      
      {/* Header KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total Canais</p>
                <p className="text-2xl font-bold text-blue-600">{parametros.length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Canais Ativos</p>
                <p className="text-2xl font-bold text-green-600">{canaisAtivos.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Automáticos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {parametros.filter(p => p.tipo_criacao === 'Automático' || p.tipo_criacao === 'Misto').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Pedidos (últimos 200)</p>
                <p className="text-2xl font-bold text-orange-600">{pedidos.length}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta se nenhum canal ativo */}
      {canaisAtivos.length === 0 && (
        <Alert className="mb-6 border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">
            ⚠️ Nenhum canal está ativo! Ative pelo menos um canal para começar a rastrear origens de pedidos.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Canais com Toggle Rápido */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Canais Configurados
          </h3>
          <ExportButton
            data={Object.values(metricas)}
            filename="canais-origem-status"
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Status
          </ExportButton>
        </div>

        <div className="space-y-2">
          {parametros.map((param) => {
            const metricas = calcularMetricas(param);
            const temAtividade = metricas.ultimos7dias > 0;

            return (
              <Card 
                key={param.id} 
                className={`transition-all ${param.ativo ? 'border-l-4' : 'opacity-60'}`}
                style={param.ativo ? { borderLeftColor: CORES_BADGE[param.cor_badge]?.replace('bg-', '#') } : {}}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    
                    {/* Info do Canal */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        param.ativo 
                          ? `bg-${param.cor_badge}-100` 
                          : 'bg-slate-100'
                      }`}>
                        {param.tipo_criacao === 'Automático' || param.tipo_criacao === 'Misto' ? (
                          <Zap className={`w-6 h-6 ${param.ativo ? `text-${param.cor_badge}-600` : 'text-slate-400'}`} />
                        ) : (
                          <Settings className={`w-6 h-6 ${param.ativo ? `text-${param.cor_badge}-600` : 'text-slate-400'}`} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{param.nome}</h4>
                          <Badge className={CORES_BADGE[param.cor_badge] || CORES_BADGE.blue}>
                            {param.canal}
                          </Badge>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {param.tipo_criacao}
                          </Badge>
                          
                          {param.bloquear_edicao_automatico && (
                            <Badge variant="outline" className="text-xs">
                              🔒 Auto-bloqueio
                            </Badge>
                          )}

                          {temAtividade && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <Activity className="w-3 h-3 mr-1" />
                              {metricas.ultimos7dias} pedidos (7d)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Métricas Rápidas */}
                    <div className="hidden md:flex gap-6 text-center">
                      <div>
                        <p className="text-xs text-slate-600">Total</p>
                        <p className="text-lg font-bold text-blue-600">{metricas.totalPedidos}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Valor</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {(metricas.valorTotal / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    {/* Toggle Ativo/Inativo */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-600">Status</p>
                        <p className={`text-sm font-semibold ${param.ativo ? 'text-green-600' : 'text-red-600'}`}>
                          {param.ativo ? 'Ativo' : 'Inativo'}
                        </p>
                      </div>
                      
                      <Switch
                        checked={param.ativo}
                        onCheckedChange={(checked) => {
                          if (user?.role !== 'admin') {
                            toast.error('Apenas administradores podem alterar status de canais');
                            return;
                          }
                          toggleAtivo.mutate({ id: param.id, ativo: checked });
                        }}
                        disabled={toggleAtivo.isPending}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Insights IA sobre Configuração */}
      <Card className="mt-6 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-5 h-5 text-purple-600" />
            🤖 Insights Inteligentes de Configuração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(() => {
            const insights = [];

            // Insight: Canais sem atividade
            const canaisSemAtividade = parametros.filter(p => {
              const metricas = calcularMetricas(p);
              return p.ativo && metricas.ultimos7dias === 0;
            });

            if (canaisSemAtividade.length > 0) {
              insights.push({
                tipo: 'warning',
                texto: `⚠️ ${canaisSemAtividade.length} canal(is) ativo(s) sem pedidos nos últimos 7 dias - considere desativar ou investigar`
              });
            }

            // Insight: Potencial de automação
            const canaisManuaisComVolume = parametros.filter(p => {
              const metricas = calcularMetricas(p);
              return p.tipo_criacao === 'Manual' && metricas.totalPedidos > 10;
            });

            if (canaisManuaisComVolume.length > 0) {
              insights.push({
                tipo: 'info',
                texto: `🤖 ${canaisManuaisComVolume.length} canal(is) manual(is) com alto volume - considere implementar automação (tipo Misto)`
              });
            }

            // Insight: Taxa de automação
            const canaisAutomaticos = parametros.filter(p => 
              p.tipo_criacao === 'Automático' || p.tipo_criacao === 'Misto'
            ).length;
            const taxaAutomacao = parametros.length > 0 
              ? (canaisAutomaticos / parametros.length) * 100 
              : 0;

            if (taxaAutomacao < 50) {
              insights.push({
                tipo: 'info',
                texto: `📊 Taxa de automação: ${taxaAutomacao.toFixed(0)}% - você pode aumentar convertendo canais manuais em automáticos`
              });
            } else {
              insights.push({
                tipo: 'success',
                texto: `✅ Taxa de automação: ${taxaAutomacao.toFixed(0)}% - excelente nível de automação!`
              });
            }

            // Insight: Canais bloqueados
            const canaisBloqueados = parametros.filter(p => p.bloquear_edicao_automatico).length;
            if (canaisBloqueados === parametros.length && parametros.length > 0) {
              insights.push({
                tipo: 'success',
                texto: `🔒 100% dos canais automáticos estão com bloqueio ativo - máxima segurança de rastreamento`
              });
            }

            return insights.map((insight, idx) => (
              <Alert 
                key={idx} 
                className={`${
                  insight.tipo === 'success' ? 'border-green-300 bg-green-50' :
                  insight.tipo === 'warning' ? 'border-orange-300 bg-orange-50' :
                  'border-blue-300 bg-blue-50'
                }`}
              >
                <AlertDescription className="text-sm">
                  {insight.texto}
                </AlertDescription>
              </Alert>
            ));
          })()}
        </CardContent>
      </Card>

      {/* Controle de Acesso */}
      {user?.role === 'admin' && (
        <Card className="mt-6 border-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-slate-600" />
              Controle de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription className="text-sm text-slate-600">
                👤 Apenas <strong>Administradores</strong> podem ativar/desativar canais e modificar configurações de origem.
                Vendedores podem apenas visualizar os canais configurados.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

    </div>
  );
}