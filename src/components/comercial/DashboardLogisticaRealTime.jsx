import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Zap,
  Bell
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * 📊 DASHBOARD LOGÍSTICA EM TEMPO REAL V21.5
 * Visão consolidada de toda operação logística
 * - Métricas em tempo real
 * - Alertas inteligentes
 * - Performance por região
 * - IA de otimização
 */
export default function DashboardLogisticaRealTime({ windowMode = false }) {
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date'),
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas'],
    queryFn: () => base44.entities.Entrega.list('-created_date'),
  });

  const { data: regioes = [] } = useQuery({
    queryKey: ['regioes'],
    queryFn: () => base44.entities.RegiaoAtendimento.list(),
  });

  // Métricas calculadas
  const metricas = useMemo(() => {
    const totalEntregas = pedidos.filter(p => 
      (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') &&
      ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)
    );

    const emTransito = pedidos.filter(p => p.status === 'Em Trânsito').length;
    const emExpedicao = pedidos.filter(p => p.status === 'Em Expedição').length;
    const entreguesHoje = pedidos.filter(p => {
      if (p.status !== 'Entregue') return false;
      const hoje = new Date().toDateString();
      return new Date(p.updated_date).toDateString() === hoje;
    }).length;

    const totalRetirada = pedidos.filter(p => 
      p.tipo_frete === 'Retirada' &&
      ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Pronto para Retirada'].includes(p.status)
    ).length;

    const prontosRetirada = pedidos.filter(p => p.status === 'Pronto para Retirada').length;

    // Cálculo de eficiência
    const entregasComAtraso = entregas.filter(e => {
      if (!e.data_previsao || !e.data_entrega) return false;
      return new Date(e.data_entrega) > new Date(e.data_previsao);
    }).length;

    const eficienciaEntrega = entregas.length > 0 
      ? ((entregas.length - entregasComAtraso) / entregas.length) * 100 
      : 100;

    // Agrupamento por região
    const porRegiao = {};
    totalEntregas.forEach(p => {
      const regiao = p.endereco_entrega_principal?.cidade || 'Sem Região';
      if (!porRegiao[regiao]) {
        porRegiao[regiao] = { total: 0, emTransito: 0, valorTotal: 0 };
      }
      porRegiao[regiao].total++;
      if (p.status === 'Em Trânsito') porRegiao[regiao].emTransito++;
      porRegiao[regiao].valorTotal += (p.valor_total || 0);
    });

    return {
      totalEntregas: totalEntregas.length,
      emTransito,
      emExpedicao,
      entreguesHoje,
      totalRetirada,
      prontosRetirada,
      eficienciaEntrega,
      porRegiao,
      alertasUrgentes: emTransito + prontosRetirada
    };
  }, [pedidos, entregas]);

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "space-y-6";

  return (
    <div className={containerClass}>
      {/* Header com IA */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-7 h-7 text-yellow-500" />
            Logística Inteligente
          </h2>
          <p className="text-slate-600 text-sm">Dashboard em tempo real com IA de otimização</p>
        </div>
        <Badge className="bg-green-500 text-white animate-pulse">
          🟢 Monitorando {metricas.totalEntregas + metricas.totalRetirada} pedidos
        </Badge>
      </div>

      {/* Alertas Urgentes */}
      {metricas.alertasUrgentes > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">
                  {metricas.alertasUrgentes} ação(ões) urgente(s) requerida(s)
                </p>
                <p className="text-sm text-orange-700">
                  {metricas.emTransito} em trânsito • {metricas.prontosRetirada} prontos para retirada
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm opacity-90">Entregas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metricas.totalEntregas}</div>
            <p className="text-xs opacity-80 mt-1">CIF/FOB em andamento</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm opacity-90">Em Trânsito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metricas.emTransito}</div>
            <p className="text-xs opacity-80 mt-1">Saíram para entrega</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm opacity-90">Entregues Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metricas.entreguesHoje}</div>
            <p className="text-xs opacity-80 mt-1">Confirmadas no dia</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm opacity-90">Para Retirada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metricas.totalRetirada}</div>
            <p className="text-xs opacity-80 mt-1">{metricas.prontosRetirada} prontos</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance e Eficiência */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Eficiência de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600">Taxa de Sucesso</span>
                  <span className="font-bold text-green-600">
                    {metricas.eficienciaEntrega.toFixed(1)}%
                  </span>
                </div>
                <Progress value={metricas.eficienciaEntrega} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-slate-500">Em Expedição</p>
                  <p className="text-2xl font-bold text-orange-600">{metricas.emExpedicao}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Em Rota</p>
                  <p className="text-2xl font-bold text-purple-600">{metricas.emTransito}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Performance por Região
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Object.entries(metricas.porRegiao)
                .sort((a, b) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([regiao, dados]) => (
                  <div key={regiao} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{regiao}</span>
                        <Badge variant="outline" className="text-xs">
                          {dados.total} pedido(s)
                        </Badge>
                      </div>
                      <Progress 
                        value={(dados.emTransito / dados.total) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className="ml-4 text-sm font-bold text-green-600">
                      R$ {dados.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sugestões da IA */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="w-5 h-5" />
            💡 Sugestões Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metricas.emExpedicao > 5 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <Navigation className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Otimizar Rotas de Entrega</p>
                <p className="text-xs text-slate-600">
                  {metricas.emExpedicao} pedidos em expedição podem ser agrupados em {Math.ceil(metricas.emExpedicao / 4)} rotas otimizadas.
                </p>
              </div>
            </div>
          )}

          {metricas.prontosRetirada > 3 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Enviar Notificações</p>
                <p className="text-xs text-slate-600">
                  {metricas.prontosRetirada} clientes podem ser notificados via WhatsApp que seus pedidos estão prontos.
                </p>
              </div>
            </div>
          )}

          {Object.keys(metricas.porRegiao).length > 1 && (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Agrupar por Região</p>
                <p className="text-xs text-slate-600">
                  Detectadas {Object.keys(metricas.porRegiao).length} regiões ativas. Agrupar entregas pode economizar até 30% em frete.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline de Entregas Hoje */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            Timeline - Entregas de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {entregas
              .filter(e => {
                const hoje = new Date().toDateString();
                return new Date(e.created_date).toDateString() === hoje;
              })
              .slice(0, 8)
              .map(entrega => (
                <div key={entrega.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    entrega.status === 'Entregue' ? 'bg-green-500' :
                    entrega.status === 'Em Trânsito' ? 'bg-purple-500 animate-pulse' :
                    'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{entrega.cliente_nome}</p>
                    <p className="text-xs text-slate-600">
                      {entrega.numero_pedido} • {entrega.endereco_entrega_completo?.cidade}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entrega.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {new Date(entrega.created_date).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}

            {entregas.filter(e => {
              const hoje = new Date().toDateString();
              return new Date(e.created_date).toDateString() === hoje;
            }).length === 0 && (
              <p className="text-center text-slate-500 py-6">
                Nenhuma entrega registrada hoje
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}