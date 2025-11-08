import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Phone, Mail, Calendar, TrendingUp, Flame, Snowflake, Wind } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Funil Visual - V21.1
 * Kanban de Oportunidades com IA Lead Scoring
 */
export default function FunilVisual({ oportunidades = [], isLoading, onSelectOportunidade, onConverterOportunidade }) {
  const queryClient = useQueryClient();

  const etapas = [
    { id: 'Prospecção', titulo: 'Prospecção', cor: 'bg-slate-100' },
    { id: 'Contato Inicial', titulo: 'Contato Inicial', cor: 'bg-blue-100' },
    { id: 'Qualificação', titulo: 'Qualificação', cor: 'bg-indigo-100' },
    { id: 'Proposta', titulo: 'Proposta', cor: 'bg-purple-100' },
    { id: 'Negociação', titulo: 'Negociação', cor: 'bg-orange-100' },
    { id: 'Fechamento', titulo: 'Fechamento', cor: 'bg-green-100' },
  ];

  const moverOportunidade = useMutation({
    mutationFn: async ({ oportunidadeId, novaEtapa }) => {
      return base44.entities.Oportunidade.update(oportunidadeId, {
        etapa: novaEtapa,
        data_ultima_interacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['oportunidades']);
      toast.success('Oportunidade movida!');
    },
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const oportunidadeId = result.draggableId;
    const novaEtapa = result.destination.droppableId;
    
    moverOportunidade.mutate({ oportunidadeId, novaEtapa });
  };

  const temperaturaIcon = (temperatura) => {
    switch (temperatura) {
      case 'Quente': return <Flame className="w-4 h-4 text-red-500" />;
      case 'Morno': return <Wind className="w-4 h-4 text-orange-500" />;
      case 'Frio': return <Snowflake className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando funil...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {etapas.map(etapa => {
          const opsEtapa = oportunidades.filter(o => o.etapa === etapa.id && o.status === 'Aberto');
          const valorTotal = opsEtapa.reduce((sum, o) => sum + (o.valor_estimado || 0), 0);

          return (
            <Card key={etapa.id} className={`${etapa.cor} border-0`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{etapa.titulo}</CardTitle>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">{opsEtapa.length}</Badge>
                  <span className="text-xs font-semibold text-slate-600">
                    R$ {valorTotal.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <Droppable droppableId={etapa.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-100/50' : ''
                      }`}
                    >
                      {opsEtapa.map((op, index) => (
                        <Draggable key={op.id} draggableId={op.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg shadow-sm p-3 border border-slate-200 cursor-move transition-shadow hover:shadow-md ${
                                snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-sm text-slate-900 line-clamp-2">
                                    {op.titulo}
                                  </h4>
                                  {op.temperatura && temperaturaIcon(op.temperatura)}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Users className="w-3 h-3" />
                                  <span className="truncate">{op.cliente_nome}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    R$ {(op.valor_estimado || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                  </Badge>
                                  {op.score && (
                                    <Badge variant="outline" className="text-xs">
                                      Score: {op.score}
                                    </Badge>
                                  )}
                                </div>

                                {op.probabilidade && (
                                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full"
                                      style={{ width: `${op.probabilidade}%` }}
                                    />
                                  </div>
                                )}

                                {op.data_proxima_acao && (
                                  <div className="flex items-center gap-1 text-xs text-orange-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(op.data_proxima_acao).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                )}

                                {op.dias_sem_contato > 7 && (
                                  <Badge className="bg-red-100 text-red-700 text-xs w-full">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {op.dias_sem_contato} dias sem contato
                                  </Badge>
                                )}

                                <div className="flex gap-1 pt-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 h-7 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectOportunidade(op);
                                    }}
                                  >
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Follow-up
                                  </Button>
                                  {etapa.id === 'Fechamento' && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="flex-1 h-7 text-xs text-green-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onConverterOportunidade(op);
                                      }}
                                    >
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Converter
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DragDropContext>
  );
}