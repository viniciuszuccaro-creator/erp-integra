import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, CheckCircle2, Clock, Zap, Factory } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/**
 * Kanban de Produção - V21.2
 * Com drag & drop e IAs de priorização
 */
export default function KanbanProducao({ ops = [], empresas = [], produtos = [] }) {
  const queryClient = useQueryClient();

  const colunas = [
    { id: 'Aguardando Matéria-Prima', label: 'Aguardando Material', icon: Package, color: 'orange' },
    { id: 'Liberada', label: 'Liberada', icon: CheckCircle2, color: 'green' },
    { id: 'Em Corte', label: 'Em Corte', icon: Factory, color: 'blue' },
    { id: 'Em Dobra', label: 'Em Dobra', icon: Factory, color: 'purple' },
    { id: 'Em Armação', label: 'Em Armação', icon: Factory, color: 'indigo' },
    { id: 'Em Conferência', label: 'Conferência', icon: CheckCircle2, color: 'teal' },
    { id: 'Pronta para Expedição', label: 'Pronta', icon: Zap, color: 'emerald' },
  ];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ opId, newStatus }) => {
      return base44.entities.OrdemProducao.update(opId, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordens-producao']);
      toast.success('Status atualizado!');
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const opId = result.draggableId;
    const newStatus = result.destination.droppableId;

    updateStatusMutation.mutate({ opId, newStatus });
  };

  const opsPorColuna = (statusColuna) => {
    return ops.filter(op => op.status === statusColuna)
      .sort((a, b) => (b.prioridade_ia || 50) - (a.prioridade_ia || 50));
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">IA MES Preditivo:</span>
            <span>Priorizando OPs por entrega mais próxima e material disponível</span>
          </div>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
          {colunas.map(coluna => {
            const opsColuna = opsPorColuna(coluna.id);
            const Icon = coluna.icon;

            return (
              <Droppable key={coluna.id} droppableId={coluna.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-slate-50 rounded-lg p-3 min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                      <Icon className={`w-4 h-4 text-${coluna.color}-600`} />
                      <h3 className="font-semibold text-sm text-slate-700">{coluna.label}</h3>
                      <Badge className={`bg-${coluna.color}-100 text-${coluna.color}-700 ml-auto`}>
                        {opsColuna.length}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {opsColuna.map((op, index) => (
                        <Draggable key={op.id} draggableId={op.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-all ${
                                snapshot.isDragging ? 'shadow-xl rotate-2' : ''
                              }`}
                            >
                              <Card className="hover:shadow-md transition-shadow cursor-move">
                                <CardContent className="p-3">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-sm">{op.numero_op}</span>
                                      {op.prioridade_ia >= 75 && (
                                        <Badge className="bg-red-100 text-red-700 text-xs">
                                          Urgente
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-600 truncate">{op.cliente_nome}</p>
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-slate-500">
                                        {op.peso_teorico_total_kg?.toFixed(0) || 0} kg
                                      </span>
                                      {op.bloqueio_material && (
                                        <AlertTriangle className="w-3 h-3 text-red-600" />
                                      )}
                                    </div>
                                    {op.data_prevista_conclusao && (
                                      <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(op.data_prevista_conclusao).toLocaleDateString('pt-BR')}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}