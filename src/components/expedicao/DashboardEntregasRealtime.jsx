import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Truck, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  Package,
  CheckCircle,
  MapPin,
  Activity
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * ETAPA 6: DASHBOARD ENTREGAS TEMPO REAL V21.4
 * Consolidação e melhoria do módulo de expedição
 */

export default function DashboardEntregasRealtime({ empresaId, windowMode = false }) {
  const [metricas, setMetricas] = useState({
    entregasHoje: 0,
    entregasPrazo: 0,
    entregasAtrasadas: 0,
    taxaSucesso: 0,
    tempoMedioEntrega: 0,
    kmRodadoHoje: 0
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas'],
    queryFn: () => base44.entities.Entrega.list()
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas-inteligentes'],
    queryFn: () => base44.entities.RoteirizacaoInteligente.list()
  });

  useEffect(() => {
    if (entregas.length > 0) {
      const hoje = new Date().toISOString().split('T')[0];
      const entregasHoje = entregas.filter(e => e.data_entrega?.startsWith(hoje));
      
      const entregasConcluidas = entregas.filter(e => e.status === 'Entregue');
      const entregasPrazo = entregasConcluidas.filter(e => {
        if (!e.data_entrega || !e.data_previsao) return false;
        return new Date(e.data_entrega) <= new Date(e.data_previsao);
      }).length;

      const entregasAtrasadas = entregas.filter(e => {
        if (e.status === 'Entregue') return false;
        if (!e.data_previsao) return false;
        return new Date(e.data_previsao) < new Date();
      }).length;

      const taxaSucesso = entregasConcluidas.length > 0
        ? (entregasPrazo / entregasConcluidas.length) * 100
        : 0;

      const tempos = entregas
        .filter(e => e.tempo_total_minutos > 0)
        .map(e => e.tempo_total_minutos);
      const tempoMedio = tempos.length > 0
        ? tempos.reduce((a, b) => a + b, 0) / tempos.length
        : 0;

      const kmTotal = rotas
        .filter(r => r.data_rota === hoje)
        .reduce((sum, r) => sum + (r.otimizacao_ia?.distancia_total_km || 0), 0);

      setMetricas({
        entregasHoje: entregasHoje.length,
        entregasPrazo,
        entregasAtrasadas,
        taxaSucesso: taxaSucesso.toFixed(1),
        tempoMedioEntrega: tempoMedio.toFixed(0),
        kmRodadoHoje: kmTotal.toFixed(1)
      });
    }
  }, [entregas, rotas]);

  const dadosEntregasPorDia = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];
    const qtd = entregas.filter(e => e.data_entrega?.startsWith(dataStr)).length;
    dadosEntregasPorDia.push({
      dia: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
      entregas: qtd
    });
  }

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6"}>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Entregas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{metricas.entregasHoje}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">No Prazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{metricas.entregasPrazo}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{metricas.entregasAtrasadas}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold">{metricas.taxaSucesso}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">{metricas.tempoMedioEntrega}</span>
              <span className="text-sm text-slate-600">min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">KM Rodado Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span className="text-2xl font-bold">{metricas.kmRodadoHoje}</span>
              <span className="text-sm text-slate-600">km</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico tendência */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Entregas nos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosEntregasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="entregas" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Activity className="w-5 h-5" />
            Monitoramento em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metricas.entregasAtrasadas > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <Badge variant="destructive">Urgente</Badge>
                <span className="ml-2 font-medium">{metricas.entregasAtrasadas} entregas atrasadas</span>
              </div>
            )}
            
            {metricas.taxaSucesso < 90 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <Badge className="bg-yellow-600">Atenção</Badge>
                <span className="ml-2 font-medium">Taxa de sucesso abaixo da meta (90%)</span>
              </div>
            )}

            {metricas.entregasAtrasadas === 0 && metricas.taxaSucesso >= 90 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
                <CheckCircle className="w-5 h-5 inline text-green-600 mr-2" />
                <span className="font-medium text-green-800">Operação logística dentro dos padrões!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}