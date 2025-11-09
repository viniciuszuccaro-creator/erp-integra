import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, Activity, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * V21.4 - Gêmeo Digital da Produção (Visualização 2D Interativa)
 * Mostra o chão de fábrica em tempo real
 */

function MaquinaCard({ maquina, op }) {
  const corPorStatus = {
    'Operando': 'border-green-500 bg-green-50',
    'Parada': 'border-slate-400 bg-slate-100',
    'Setup': 'border-orange-500 bg-orange-50',
    'Manutenção': 'border-purple-500 bg-purple-50'
  };

  const iconeStatus = {
    'Operando': <CheckCircle className="w-5 h-5 text-green-600" />,
    'Parada': <AlertCircle className="w-5 h-5 text-slate-400" />,
    'Setup': <Zap className="w-5 h-5 text-orange-600" />,
    'Manutenção': <Activity className="w-5 h-5 text-purple-600" />
  };

  const percentualConclusao = op?.percentual_conclusao || 0;

  return (
    <Card className={`border-2 ${corPorStatus[maquina.status]} transition-all hover:scale-105 cursor-pointer`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {iconeStatus[maquina.status]}
            <div>
              <p className="font-bold text-sm">{maquina.nome}</p>
              <p className="text-xs text-slate-500">{maquina.tipo}</p>
            </div>
          </div>
          <Badge className={
            maquina.status === 'Operando' ? 'bg-green-600' :
            maquina.status === 'Setup' ? 'bg-orange-600' :
            maquina.status === 'Manutenção' ? 'bg-purple-600' :
            'bg-slate-400'
          }>
            {maquina.status}
          </Badge>
        </div>

        {op && (
          <div className="space-y-2">
            <div className="p-2 bg-white rounded border">
              <p className="text-xs text-slate-600">OP Atual:</p>
              <p className="font-semibold text-sm">{op.numero_op}</p>
              <p className="text-xs text-slate-500">{op.cliente_nome}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">Progresso</span>
                <span className="font-semibold">{percentualConclusao.toFixed(0)}%</span>
              </div>
              <Progress value={percentualConclusao} />
            </div>

            {op.operador_responsavel && (
              <p className="text-xs text-slate-600 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Operador: {op.operador_responsavel}
              </p>
            )}
          </div>
        )}

        {!op && (
          <div className="text-center py-3 text-slate-400 text-xs">
            Sem produção no momento
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GemeoDigital3D({ empresaId }) {
  const [paused, setPaused] = useState(false);

  const { data: ops = [], refetch } = useQuery({
    queryKey: ['ops-gemeo-digital', empresaId],
    queryFn: () => base44.entities.OrdemProducao.filter({
      empresa_id: empresaId,
      status: { $in: ['Em Corte', 'Em Dobra', 'Em Armação', 'Pausada', 'Liberada'] }
    }),
    enabled: !!empresaId && !paused,
    refetchInterval: 10000 // 10s
  });

  const maquinas = [
    { id: 1, nome: 'CNC-1', tipo: 'Corte', categoria: 'corte' },
    { id: 2, nome: 'CNC-2', tipo: 'Corte', categoria: 'corte' },
    { id: 3, nome: 'Dobradeira HD-1', tipo: 'Dobra', categoria: 'dobra' },
    { id: 4, nome: 'Dobradeira HD-2', tipo: 'Dobra', categoria: 'dobra' },
    { id: 5, nome: 'Mesa Armação 1', tipo: 'Armação', categoria: 'armacao' },
    { id: 6, nome: 'Mesa Armação 2', tipo: 'Armação', categoria: 'armacao' },
  ];

  // Associar OPs às máquinas
  const maquinasComStatus = maquinas.map(m => {
    const opNaMaquina = ops.find(op => {
      const etapaAtual = op.etapas_producao?.find(e => e.status === 'Em Andamento');
      if (!etapaAtual) return false;
      
      return etapaAtual.maquina_nome?.toLowerCase().includes(m.nome.toLowerCase()) ||
             etapaAtual.setor?.toLowerCase().includes(m.categoria);
    });

    return {
      ...m,
      status: opNaMaquina ? 'Operando' : 'Parada',
      op: opNaMaquina
    };
  });

  const maquinasOperando = maquinasComStatus.filter(m => m.status === 'Operando').length;
  const utilizacao = ((maquinasOperando / maquinas.length) * 100).toFixed(0);

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>🏭 Gêmeo Digital - Chão de Fábrica</CardTitle>
              <p className="text-sm text-slate-600">Visualização em tempo real das máquinas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600 text-white">
              {maquinasOperando}/{maquinas.length} operando
            </Badge>
            <Badge variant="outline">
              {utilizacao}% utilização
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Layout do Chão de Fábrica */}
        <div className="space-y-6">
          {/* Setor de Corte */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900">Setor de Corte</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maquinasComStatus.filter(m => m.categoria === 'corte').map(m => (
                <MaquinaCard key={m.id} maquina={m} op={m.op} />
              ))}
            </div>
          </div>

          {/* Setor de Dobra */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <Zap className="w-4 h-4 text-orange-600" />
              <h3 className="font-bold text-slate-900">Setor de Dobra</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maquinasComStatus.filter(m => m.categoria === 'dobra').map(m => (
                <MaquinaCard key={m.id} maquina={m} op={m.op} />
              ))}
            </div>
          </div>

          {/* Setor de Armação */}
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <Zap className="w-4 h-4 text-green-600" />
              <h3 className="font-bold text-slate-900">Setor de Armação</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maquinasComStatus.filter(m => m.categoria === 'armacao').map(m => (
                <MaquinaCard key={m.id} maquina={m} op={m.op} />
              ))}
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700">Operando</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <p className="font-bold text-green-900">Produzindo</p>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-700">Parada</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <p className="font-bold text-slate-900">Ociosa</p>
            </div>
          </div>

          <div className="p-3 bg-orange-100 rounded-lg">
            <p className="text-xs text-orange-700">Setup</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <p className="font-bold text-orange-900">Preparação</p>
            </div>
          </div>

          <div className="p-3 bg-purple-100 rounded-lg">
            <p className="text-xs text-purple-700">Manutenção</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <p className="font-bold text-purple-900">Em reparo</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}