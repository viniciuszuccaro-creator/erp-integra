import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Package,
  ChevronRight
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { usePermissions } from '@/components/lib/usePermissions';
import { toast } from 'sonner';

export default function KanbanProducaoCompleto() {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { hasGranularPermission } = usePermissions();
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');

  // Buscar OPs
  const { data: ops = [], isLoading } = useQuery({
    queryKey: ['ordens_producao', filtroEmpresa],
    queryFn: async () => {
      const lista = await base44.entities.OrdemProducao.list();
      if (filtroEmpresa === 'todas') return lista;
      return lista.filter(op => op.empresa_id === filtroEmpresa);
    }
  });

  // Mutation para mudar status
  const mudarStatusMutation = useMutation({
    mutationFn: async ({ opId, novoStatus }) => {
      return await base44.entities.OrdemProducao.update(opId, { status: novoStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordens_producao']);
      toast.success('Status atualizado');
    }
  });

  // Colunas do Kanban
  const colunas = [
    { id: 'Planejada', titulo: 'Planejada', cor: 'bg-slate-500' },
    { id: 'Aguardando Matéria-Prima', titulo: 'Aguardando MP', cor: 'bg-yellow-500' },
    { id: 'Em Corte', titulo: 'Em Corte', cor: 'bg-blue-500' },
    { id: 'Em Dobra', titulo: 'Em Dobra', cor: 'bg-indigo-500' },
    { id: 'Em Montagem', titulo: 'Em Montagem', cor: 'bg-purple-500' },
    { id: 'Inspeção', titulo: 'Inspeção', cor: 'bg-orange-500' },
    { id: 'Pronto para Expedição', titulo: 'Pronto', cor: 'bg-green-500' },
    { id: 'Concluída', titulo: 'Concluída', cor: 'bg-emerald-600' }
  ];

  const abrirDetalhesOP = (op) => {
    if (!hasGranularPermission('producao', 'visualizar')) {
      toast.error('Sem permissão para visualizar produção');
      return;
    }

    openWindow(
      () => import('@/components/producao/OrdemProducaoDetalhes'),
      { opId: op.id },
      {
        title: `OP ${op.numero_op} - ${op.cliente_nome}`,
        width: 1200,
        height: 800
      }
    );
  };

  const calcularProgresso = (op) => {
    if (!op.peso_total_kg || op.peso_total_kg === 0) return 0;
    return Math.round((op.peso_produzido_kg / op.peso_total_kg) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kanban de Produção</h1>
            <p className="text-sm text-slate-600">Etapa 5 - Produção & Engenharia Industrial</p>
          </div>
          
          {hasGranularPermission('producao', 'editar') && (
            <Button
              onClick={() => openWindow(
                () => import('@/components/producao/CriarOrdemProducao'),
                {},
                { title: 'Nova Ordem de Produção', width: 1000, height: 700 }
              )}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova OP
            </Button>
          )}
        </div>

        {/* Métricas Rápidas */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total OPs</p>
                  <p className="text-2xl font-bold">{ops.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Em Produção</p>
                  <p className="text-2xl font-bold">
                    {ops.filter(op => 
                      ['Em Corte', 'Em Dobra', 'Em Montagem'].includes(op.status)
                    ).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Atrasadas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {ops.filter(op => 
                      op.alertas_ia?.some(a => a.tipo === 'atraso' && !a.resolvido)
                    ).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Alertas IA</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {ops.reduce((acc, op) => 
                      acc + (op.alertas_ia?.filter(a => !a.resolvido).length || 0), 0
                    )}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content' }}>
          {colunas.map(coluna => {
            const opsColuna = ops.filter(op => op.status === coluna.id);
            
            return (
              <div key={coluna.id} className="flex-shrink-0 w-80 flex flex-col">
                {/* Header da Coluna */}
                <div className={`${coluna.cor} text-white rounded-t-lg p-3 flex items-center justify-between`}>
                  <span className="font-semibold">{coluna.titulo}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {opsColuna.length}
                  </Badge>
                </div>

                {/* Cards da Coluna */}
                <div className="flex-1 bg-slate-50 rounded-b-lg p-2 overflow-y-auto space-y-2">
                  {opsColuna.map(op => {
                    const progresso = calcularProgresso(op);
                    const temAlerta = op.alertas_ia?.some(a => !a.resolvido);
                    
                    return (
                      <Card 
                        key={op.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => abrirDetalhesOP(op)}
                      >
                        <CardHeader className="p-3 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-semibold">
                                OP {op.numero_op}
                              </CardTitle>
                              <p className="text-xs text-slate-600 mt-1">
                                {op.cliente_nome}
                              </p>
                            </div>
                            {temAlerta && (
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-3 pt-0 space-y-2">
                          {/* Progresso */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-600">Progresso</span>
                              <span className="font-medium">{progresso}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progresso}%` }}
                              />
                            </div>
                          </div>

                          {/* Peso */}
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Peso:</span>
                            <span className="font-medium">
                              {op.peso_produzido_kg?.toFixed(0) || 0} / {op.peso_total_kg?.toFixed(0) || 0} kg
                            </span>
                          </div>

                          {/* Prioridade */}
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={
                                op.prioridade === 'Urgente' ? 'destructive' :
                                op.prioridade === 'Alta' ? 'default' :
                                'secondary'
                              }
                              className="text-xs"
                            >
                              {op.prioridade}
                            </Badge>

                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>

                          {/* Alertas IA */}
                          {op.alertas_ia?.filter(a => !a.resolvido).slice(0, 1).map((alerta, idx) => (
                            <div key={idx} className="text-xs bg-orange-50 border border-orange-200 rounded p-2">
                              <p className="text-orange-800 font-medium">{alerta.tipo}</p>
                              <p className="text-orange-700">{alerta.mensagem}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {opsColuna.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8">
                      Nenhuma OP nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}