import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Factory,
  Target,
  Zap,
  Eye,
  ArrowRight,
  MapPin,
  CreditCard,
  XCircle
} from "lucide-react";
import { useUser } from "@/components/lib/UserContext";

/**
 * V21.7 - Dashboard Operacional (Nível 1 - Tempo Real)
 * Foco em ações imediatas e fluxo de trabalho
 */
export default function DashboardOperacional() {
  const navigate = useNavigate();
  const { empresaAtual } = useUser();
  const [alertasPrioridade, setAlertasPrioridade] = useState([]);

  // Dados em tempo real
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-operacional', empresaAtual?.id],
    queryFn: () => base44.entities.Pedido.filter({ empresa_id: empresaAtual?.id }, '-data_pedido', 100),
    enabled: !!empresaAtual?.id,
    refetchInterval: 30000 // Atualiza a cada 30s
  });

  const { data: ops = [] } = useQuery({
    queryKey: ['ops-operacional', empresaAtual?.id],
    queryFn: () => base44.entities.OrdemProducao.filter({ empresa_id: empresaAtual?.id }, '-data_emissao', 50),
    enabled: !!empresaAtual?.id,
    refetchInterval: 30000
  });

  const { data: romaneios = [] } = useQuery({
    queryKey: ['romaneios-operacional', empresaAtual?.id],
    queryFn: () => base44.entities.Romaneio.filter({ empresa_id: empresaAtual?.id }, '-data_romaneio', 50),
    enabled: !!empresaAtual?.id,
    refetchInterval: 30000
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-operacional', empresaAtual?.id],
    queryFn: () => base44.entities.Entrega.filter({ empresa_id: empresaAtual?.id }, '-data_previsao', 100),
    enabled: !!empresaAtual?.id,
    refetchInterval: 30000
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-operacional', empresaAtual?.id],
    queryFn: () => base44.entities.ContaReceber.filter({ empresa_id: empresaAtual?.id }, '-data_vencimento', 100),
    enabled: !!empresaAtual?.id,
    refetchInterval: 30000
  });

  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades-operacional'],
    queryFn: () => base44.entities.Oportunidade.filter({ status: 'Aberto' }, '-created_date', 50),
    refetchInterval: 60000
  });

  // IA de Prioridade Operacional
  useEffect(() => {
    const calcularPrioridades = () => {
      const hoje = new Date();
      const alertas = [];

      // Pedidos com orçamento expirando
      pedidos
        .filter(p => p.tipo === 'Orçamento' && p.status === 'Aguardando Aprovação')
        .forEach(pedido => {
          if (pedido.data_validade) {
            const dataValidade = new Date(pedido.data_validade);
            const diasRestantes = Math.floor((dataValidade - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes <= 3 && diasRestantes >= 0) {
              alertas.push({
                tipo: 'orcamento_expirando',
                severidade: diasRestantes === 0 ? 'critico' : 'alto',
                pedido_id: pedido.id,
                numero_pedido: pedido.numero_pedido,
                valor: pedido.valor_total,
                dias_restantes: diasRestantes,
                mensagem: `Orçamento ${pedido.numero_pedido} expira em ${diasRestantes} dia(s) - R$ ${pedido.valor_total?.toFixed(0)}`
              });
            }
          }
        });

      // OPs em risco de atraso
      ops
        .filter(op => ['Liberada', 'Em Corte', 'Em Dobra'].includes(op.status))
        .forEach(op => {
          if (op.data_prevista_conclusao) {
            const dataPrevisao = new Date(op.data_prevista_conclusao);
            const diasRestantes = Math.floor((dataPrevisao - hoje) / (1000 * 60 * 60 * 24));
            
            if (diasRestantes <= 1) {
              alertas.push({
                tipo: 'op_atraso',
                severidade: diasRestantes < 0 ? 'critico' : 'alto',
                op_id: op.id,
                numero_op: op.numero_op,
                dias_atraso: Math.abs(diasRestantes),
                mensagem: `OP ${op.numero_op} ${diasRestantes < 0 ? `atrasada ${Math.abs(diasRestantes)} dia(s)` : 'vence hoje'}`
              });
            }
          }
        });

      // Entregas com ocorrência
      entregas
        .filter(e => e.status === 'Entrega Frustrada' || e.entrega_frustrada?.motivo)
        .forEach(entrega => {
          alertas.push({
            tipo: 'entrega_frustrada',
            severidade: 'alto',
            entrega_id: entrega.id,
            numero_pedido: entrega.numero_pedido,
            motivo: entrega.entrega_frustrada?.motivo || 'Não especificado',
            mensagem: `Entrega frustrada - ${entrega.cliente_nome}: ${entrega.entrega_frustrada?.motivo}`
          });
        });

      setAlertasPrioridade(alertas.sort((a, b) => {
        const ordem = { critico: 0, alto: 1, medio: 2 };
        return ordem[a.severidade] - ordem[b.severidade];
      }));
    };

    calcularPrioridades();
    const interval = setInterval(calcularPrioridades, 30000); // Recalcula a cada 30s
    return () => clearInterval(interval);
  }, [pedidos, ops, entregas]);

  // KPIs Comercial
  const pedidosAguardandoAprovacao = pedidos.filter(p => p.status === 'Aguardando Aprovação').length;
  const valorEmAprovacao = pedidos
    .filter(p => p.status === 'Aguardando Aprovação')
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const oportunidadesChatbot = oportunidades.filter(o => o.origem === 'Chatbot' || o.origem === 'WhatsApp').length;

  // KPIs Produção
  const opsEmAndamento = ops.filter(op => 
    ['Liberada', 'Em Corte', 'Em Dobra', 'Em Armação'].includes(op.status)
  ).length;
  const opsEmRisco = ops.filter(op => {
    if (!op.data_prevista_conclusao) return false;
    const diasRestantes = Math.floor((new Date(op.data_prevista_conclusao) - new Date()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 1 && !['Finalizada', 'Cancelada'].includes(op.status);
  }).length;

  // KPIs Logística
  const romaneiosEmRota = romaneios.filter(r => r.status === 'Em Rota').length;
  const entregasComOcorrencia = entregas.filter(e => 
    e.status === 'Entrega Frustrada' || 
    e.entrega_frustrada?.motivo ||
    (e.ocorrencias && e.ocorrencias.length > 0)
  ).length;

  // KPIs Financeiro
  const titulosRegua = contasReceber.filter(c => 
    c.regua_cobranca?.acao_1_enviada || 
    c.regua_cobranca?.acao_2_enviada
  ).length;
  const titulosBloqueados = contasReceber.filter(c => 
    c.status === 'Pendente' && c.observacoes?.includes('Bloqueado por ocorrência')
  ).length;

  const valorEmRisco = alertasPrioridade
    .filter(a => a.tipo === 'orcamento_expirando')
    .reduce((sum, a) => sum + (a.valor || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">⚡ Dashboard Operacional</h1>
        <p className="text-slate-600">Monitoramento em tempo real das operações</p>
      </div>

      {/* Alertas Críticos de IA */}
      {alertasPrioridade.length > 0 && (
        <Alert className="border-2 border-red-300 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-bold text-red-900 flex items-center gap-2">
                🚨 {alertasPrioridade.length} Ação(ões) Prioritária(s) Detectada(s) pela IA
              </p>
              {valorEmRisco > 0 && (
                <p className="text-sm text-red-800">
                  💰 <strong>R$ {valorEmRisco.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em risco</strong> (orçamentos expirando)
                </p>
              )}
              <div className="space-y-1 mt-3">
                {alertasPrioridade.slice(0, 3).map((alerta, idx) => (
                  <div key={idx} className="text-sm text-red-800 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      alerta.severidade === 'critico' ? 'bg-red-600 animate-pulse' : 'bg-orange-600'
                    }`} />
                    {alerta.mensagem}
                  </div>
                ))}
                {alertasPrioridade.length > 3 && (
                  <p className="text-xs text-red-600 mt-2">+{alertasPrioridade.length - 3} alertas adicionais</p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Faixa 1: Comercial do Dia */}
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Comercial do Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div 
              className="p-6 bg-orange-50 border-2 border-orange-300 rounded-lg cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(createPageUrl('Comercial') + '?filtro=aguardando_aprovacao')}
            >
              <div className="flex items-center justify-between mb-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-600 text-lg px-3 py-1">
                  {pedidosAguardandoAprovacao}
                </Badge>
              </div>
              <p className="text-sm text-orange-700 font-semibold mb-1">Aguardando Aprovação</p>
              <p className="text-2xl font-bold text-orange-900">
                R$ {valorEmAprovacao.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </p>
              {valorEmRisco > 0 && (
                <Alert className="mt-3 p-2 bg-red-100 border-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-xs text-red-800">
                    <strong>R$ {valorEmRisco.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} em risco</strong> (expirando)
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-lg px-3 py-1">
                  {oportunidadesChatbot}
                </Badge>
              </div>
              <p className="text-sm text-green-700 font-semibold mb-1">Leads Chatbot</p>
              <p className="text-xs text-green-600 mt-2">
                Oportunidades geradas automaticamente
              </p>
            </div>

            <div 
              className="p-6 bg-blue-50 border-2 border-blue-300 rounded-lg cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(createPageUrl('Comercial'))}
            >
              <div className="flex items-center justify-between mb-3">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <ArrowRight className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm text-blue-700 font-semibold">Ir para Comercial</p>
              <p className="text-xs text-blue-600 mt-2">Ver todos os pedidos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faixa 2: Produção */}
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-purple-600" />
            Produção
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div 
              className="p-6 bg-purple-50 border-2 border-purple-300 rounded-lg cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(createPageUrl('Producao'))}
            >
              <div className="flex items-center justify-between mb-3">
                <Package className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-600 text-lg px-3 py-1">
                  {opsEmAndamento}
                </Badge>
              </div>
              <p className="text-sm text-purple-700 font-semibold mb-1">OPs em Andamento</p>
              <p className="text-xs text-purple-600 mt-2">
                Clique para ver Kanban
              </p>
            </div>

            <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <Badge className="bg-red-600 text-lg px-3 py-1">
                  {opsEmRisco}
                </Badge>
              </div>
              <p className="text-sm text-red-700 font-semibold mb-1">OPs em Risco de Atraso</p>
              {opsEmRisco > 0 && (
                <Alert className="mt-3 p-2 bg-red-100 border-red-300">
                  <AlertDescription className="text-xs text-red-800">
                    ⚠️ Previsão IA MES: {opsEmRisco} OP(s) atrasarão
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-600 text-lg px-3 py-1">
                  {ops.filter(op => op.status === 'Finalizada').length}
                </Badge>
              </div>
              <p className="text-sm text-blue-700 font-semibold mb-1">OPs Concluídas (Hoje)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faixa 3: Logística */}
      <Card className="border-2 border-cyan-300">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-cyan-600" />
            Logística e Expedição
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-cyan-50 border-2 border-cyan-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <MapPin className="w-8 h-8 text-cyan-600" />
                <Badge className="bg-cyan-600 text-lg px-3 py-1">
                  {romaneiosEmRota}
                </Badge>
              </div>
              <p className="text-sm text-cyan-700 font-semibold mb-1">Romaneios em Rota</p>
              {romaneiosEmRota > 0 && (
                <p className="text-xs text-cyan-600 mt-2">
                  🚚 Rastreamento GPS ativo
                </p>
              )}
            </div>

            <div 
              className="p-6 bg-orange-50 border-2 border-orange-300 rounded-lg cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(createPageUrl('Expedicao') + '?filtro=ocorrencias')}
            >
              <div className="flex items-center justify-between mb-3">
                <XCircle className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-600 text-lg px-3 py-1">
                  {entregasComOcorrencia}
                </Badge>
              </div>
              <p className="text-sm text-orange-700 font-semibold mb-1">Entregas com Ocorrência</p>
              {entregasComOcorrencia > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  ⚠️ Requer ação imediata
                </p>
              )}
            </div>

            <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-lg px-3 py-1">
                  {entregas.filter(e => e.status === 'Entregue').length}
                </Badge>
              </div>
              <p className="text-sm text-green-700 font-semibold mb-1">Entregas Concluídas (Hoje)</p>
            </div>
          </div>

          {/* IA SmartRoute+ - ETA vs Real */}
          {romaneiosEmRota > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                IA SmartRoute+ - Análise de Atrasos
              </p>
              <div className="space-y-2">
                {romaneios
                  .filter(r => r.status === 'Em Rota')
                  .slice(0, 3)
                  .map((romaneio, idx) => {
                    const tempoReal = romaneio.tempo_real_minutos || 0;
                    const tempoPrevisto = romaneio.tempo_total_previsto_minutos || 0;
                    const atraso = Math.max(0, tempoReal - tempoPrevisto);
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-xs font-medium">{romaneio.numero_romaneio}</span>
                        {atraso > 0 ? (
                          <Badge className="bg-orange-600 text-xs">
                            +{atraso} min atraso
                          </Badge>
                        ) : (
                          <Badge className="bg-green-600 text-xs">No prazo</Badge>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Faixa 4: Financeiro Rápido */}
      <Card className="border-2 border-green-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Financeiro Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-8 h-8 text-purple-600" />
                <Badge className="bg-purple-600 text-lg px-3 py-1">
                  {titulosRegua}
                </Badge>
              </div>
              <p className="text-sm text-purple-700 font-semibold mb-1">Régua de Cobrança IA</p>
              <p className="text-xs text-purple-600 mt-2">
                🤖 Cobranças automáticas ativas
              </p>
            </div>

            <div 
              className="p-6 bg-red-50 border-2 border-red-300 rounded-lg cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate(createPageUrl('Financeiro') + '?filtro=bloqueados')}
            >
              <div className="flex items-center justify-between mb-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <Badge className="bg-red-600 text-lg px-3 py-1">
                  {titulosBloqueados}
                </Badge>
              </div>
              <p className="text-sm text-red-700 font-semibold mb-1">Títulos Bloqueados</p>
              <p className="text-xs text-red-600 mt-2">
                🚫 Por ocorrência logística
              </p>
            </div>

            <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <CreditCard className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-lg px-3 py-1">
                  {contasReceber.filter(c => c.status === 'Recebido').length}
                </Badge>
              </div>
              <p className="text-sm text-green-700 font-semibold mb-1">Recebidos (Hoje)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ações Prioritárias */}
      {alertasPrioridade.length > 0 && (
        <Card className="border-2 border-yellow-300">
          <CardHeader className="bg-yellow-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Ações Prioritárias (IA)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {alertasPrioridade.map((alerta, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${
                        alerta.severidade === 'critico' ? 'bg-red-600 animate-pulse' :
                        alerta.severidade === 'alto' ? 'bg-orange-600' :
                        'bg-yellow-600'
                      }`} />
                      <div>
                        <p className="font-semibold text-sm">{alerta.mensagem}</p>
                        <p className="text-xs text-slate-500">
                          {alerta.tipo === 'orcamento_expirando' && `Pedido: ${alerta.numero_pedido}`}
                          {alerta.tipo === 'op_atraso' && `OP: ${alerta.numero_op}`}
                          {alerta.tipo === 'entrega_frustrada' && `Cliente: ${alerta.numero_pedido}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (alerta.tipo === 'orcamento_expirando') {
                          navigate(createPageUrl('Comercial') + `?pedido=${alerta.pedido_id}`);
                        } else if (alerta.tipo === 'op_atraso') {
                          navigate(createPageUrl('Producao') + `?op=${alerta.op_id}`);
                        } else if (alerta.tipo === 'entrega_frustrada') {
                          navigate(createPageUrl('Expedicao') + `?entrega=${alerta.entrega_id}`);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}