
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Factory,
  Clock,
  Zap,
  AlertTriangle,
  Package,
  CheckCircle,
  Eye,
  Brain,
  TrendingUp
} from "lucide-react";
import ProducaoCardDetalhe from "./ProducaoCardDetalhe";
import OtimizadorCorteIA from "./OtimizadorCorteIA";
import { consumirMateriaPrimaOP } from "@/components/producao/ConexaoEstoqueProducao";

/**
 * V21.2 - Kanban de Produção com IA MES Preditiva
 * COM: Gêmeo Digital, Priorização IA, Alertas de Material
 */
export default function KanbanProducao({ empresaId }) {
  const [opSelecionada, setOpSelecionada] = useState(null);
  const [showOtimizador, setShowOtimizador] = useState(false);
  const [modoIA, setModoIA] = useState(true); // V21.2: Prioridade IA ativa
  const queryClient = useQueryClient();

  const { data: ops = [], isLoading } = useQuery({
    queryKey: ['ordens-producao', empresaId],
    queryFn: () => base44.entities.OrdemProducao.filter({
      empresa_id: empresaId
    }, '-prioridade_ia', 100),
    refetchInterval: 30000 // V21.2: Atualiza a cada 30s
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ opId, novoStatus }) => {
      // V21.4: GATILHO - Consumo de Estoque
      if (novoStatus === 'Em Corte' || novoStatus === 'Em Dobra') {
        const op = await base44.entities.OrdemProducao.get(opId);

        if (op && !op.estoque_baixado) {
          await consumirMateriaPrimaOP(opId);
        }
      }

      return base44.entities.OrdemProducao.update(opId, {
        status: novoStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens-producao'] }); // Changed to 'ordens-producao' from 'ops-kanban' as per original queryKey
    }
  });

  // V21.2: IA MES - Calcular Score de Prioridade
  const calcularScoreIA = (op) => {
    let score = 50; // Base

    // Urgência por data
    const diasRestantes = op.data_prevista_conclusao
      ? Math.floor((new Date(op.data_prevista_conclusao) - new Date()) / (1000 * 60 * 60 * 24))
      : 999;

    if (diasRestantes < 0) score += 40; // Atrasado
    else if (diasRestantes < 3) score += 30; // Urgente
    else if (diasRestantes < 7) score += 15;

    // Material disponível
    if (!op.bloqueio_material) score += 20;
    else score -= 30;

    // OEE histórico (se disponível)
    if (op.oee_calculado?.oee_total > 80) score += 10;

    return Math.min(100, Math.max(0, score));
  };

  // V21.2: Organizar por prioridade IA se ativo
  const opsOrganizadas = modoIA
    ? [...ops].sort((a, b) => calcularScoreIA(b) - calcularScoreIA(a))
    : ops;

  // Agrupar por status
  const colunas = [
    { status: 'Liberada', titulo: '🟢 Liberada', cor: 'bg-green-50 border-green-300' },
    { status: 'Aguardando Matéria-Prima', titulo: '🟡 Aguardando Material', cor: 'bg-yellow-50 border-yellow-300' },
    { status: 'Em Corte', titulo: '🔧 Em Corte', cor: 'bg-blue-50 border-blue-300' },
    { status: 'Em Dobra', titulo: '⚙️ Em Dobra', cor: 'bg-purple-50 border-purple-300' },
    { status: 'Em Armação', titulo: '🏗️ Em Armação', cor: 'bg-orange-50 border-orange-300' },
    { status: 'Pronta para Expedição', titulo: '✅ Pronta', cor: 'bg-teal-50 border-teal-300' }
  ];

  const handleMoverStatus = (op, novoStatus) => {
    // V21.2: Validação IA
    // const scoreAtual = calcularScoreIA(op); // This variable was declared but not used, keeping it commented for now as it's not part of the current change

    if (op.bloqueio_material && novoStatus !== 'Aguardando Matéria-Prima') {
      const confirmar = window.confirm(
        `⚠️ IA MES DETECTOU:\nMaterial indisponível!\n\n` +
        `Materiais faltantes: ${(op.materiais_faltantes || []).map(m => m.descricao).join(', ')}\n\n` +
        `Deseja prosseguir mesmo assim?`
      );

      if (!confirmar) return;
    }

    atualizarStatusMutation.mutate({ opId: op.id, novoStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <Card className="border-2 border-purple-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Kanban de Produção</h2>
              <Badge className="bg-purple-600">{ops.length} OPs Ativas</Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* V21.2: Toggle IA MES */}
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-300">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">IA MES:</span>
                <button
                  onClick={() => setModoIA(!modoIA)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                    modoIA
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {modoIA ? 'Ativa' : 'Manual'}
                </button>
              </div>

              <Button
                onClick={() => setShowOtimizador(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Otimizar Corte IA
              </Button>
            </div>
          </div>

          {modoIA && (
            <Alert className="border-purple-300 bg-purple-50 mt-4">
              <Brain className="w-4 h-4 text-purple-600" />
              <AlertDescription className="text-sm text-purple-800">
                <strong>IA MES Preditiva Ativa:</strong> OPs ranqueadas por urgência, disponibilidade de material e OEE histórico.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Kanban Grid */}
      <div className="grid grid-cols-6 gap-4">
        {colunas.map((coluna) => {
          const opsColuna = opsOrganizadas.filter(op => op.status === coluna.status);

          return (
            <Card key={coluna.status} className={`border-2 ${coluna.cor}`}>
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{coluna.titulo}</span>
                  <Badge variant="outline">{opsColuna.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2 min-h-[400px]">
                {opsColuna.map((op) => {
                  const scoreIA = calcularScoreIA(op);

                  return (
                    <Card
                      key={op.id}
                      className={`border hover:shadow-md transition-all cursor-pointer ${
                        op.bloqueio_material ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                      onClick={() => setOpSelecionada(op)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-xs">{op.numero_op}</p>
                            <p className="text-xs text-slate-600 line-clamp-1">
                              {op.cliente_nome}
                            </p>
                          </div>

                          {/* V21.2: Score IA */}
                          {modoIA && (
                            <div className={`text-xs font-bold px-2 py-1 rounded ${
                              scoreIA >= 80 ? 'bg-red-100 text-red-700' :
                              scoreIA >= 60 ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {scoreIA}
                            </div>
                          )}
                        </div>

                        {/* Progresso */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Progresso</span>
                            <span className="font-semibold">{op.percentual_conclusao || 0}%</span>
                          </div>
                          <Progress value={op.percentual_conclusao || 0} className="h-1" />
                        </div>

                        {/* Alertas */}
                        {op.bloqueio_material && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Material faltando</span>
                          </div>
                        )}

                        {op.alerta_refugo_alto && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>Refugo alto</span>
                          </div>
                        )}

                        {/* Peso */}
                        <div className="text-xs text-slate-600">
                          <Package className="w-3 h-3 inline mr-1" />
                          {op.peso_teorico_total_kg?.toFixed(2)} kg
                        </div>

                        {/* Ações Rápidas */}
                        <div className="flex gap-1 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpSelecionada(op);
                            }}
                            className="flex-1 text-xs"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* V21.2: Painel Lateral - Gêmeo Digital */}
      {opSelecionada && (
        <ProducaoCardDetalhe
          isOpen={!!opSelecionada}
          onClose={() => setOpSelecionada(null)}
          op={opSelecionada}
          onAtualizarStatus={(novoStatus) => handleMoverStatus(opSelecionada, novoStatus)}
        />
      )}

      {/* Otimizador de Corte */}
      {showOtimizador && (
        <OtimizadorCorteIA
          isOpen={showOtimizador}
          onClose={() => setShowOtimizador(false)}
          empresaId={empresaId}
        />
      )}
    </div>
  );
}
