import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';
import { usePermissions } from '@/components/lib/usePermissions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function OrdemProducaoDetalhes({ opId }) {
  const queryClient = useQueryClient();
  const { hasGranularPermission } = usePermissions();

  const { data: op, isLoading } = useQuery({
    queryKey: ['ordem_producao', opId],
    queryFn: async () => {
      const ops = await base44.entities.OrdemProducao.list();
      return ops.find(o => o.id === opId);
    }
  });

  const mudarStatusMutation = useMutation({
    mutationFn: async (novoStatus) => {
      return await base44.entities.OrdemProducao.update(opId, { status: novoStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordem_producao']);
      queryClient.invalidateQueries(['ordens_producao']);
      toast.success('Status atualizado');
    }
  });

  const registrarApontamentoMutation = useMutation({
    mutationFn: async (apontamento) => {
      const apontamentosAtuais = op.apontamentos || [];
      return await base44.entities.OrdemProducao.update(opId, {
        apontamentos: [...apontamentosAtuais, apontamento],
        peso_produzido_kg: (op.peso_produzido_kg || 0) + (apontamento.quantidade_produzida || 0)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordem_producao']);
      toast.success('Apontamento registrado');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!op) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <p className="text-slate-600">Ordem de Produção não encontrada</p>
      </div>
    );
  }

  const progresso = op.peso_total_kg > 0 ? 
    Math.round((op.peso_produzido_kg / op.peso_total_kg) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Fixo */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">OP {op.numero_op}</h1>
            <p className="text-blue-100">Cliente: {op.cliente_nome}</p>
            <p className="text-sm text-blue-200">Pedido: {op.numero_pedido}</p>
          </div>

          <div className="text-right">
            <Badge className="bg-white text-blue-900 mb-2">{op.status}</Badge>
            <p className="text-sm text-blue-100">Prioridade: {op.prioridade}</p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <p className="text-right text-sm mt-1 text-blue-100">{progresso}% Concluído</p>
      </div>

      {/* Conteúdo com Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="engenharia" className="w-full">
          <TabsList>
            <TabsTrigger value="engenharia">Engenharia</TabsTrigger>
            <TabsTrigger value="materiaprima">Matéria-Prima</TabsTrigger>
            <TabsTrigger value="apontamentos">Apontamentos</TabsTrigger>
            <TabsTrigger value="ia">IA & Otimizações</TabsTrigger>
          </TabsList>

          {/* Tab Engenharia */}
          <TabsContent value="engenharia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes de Engenharia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {op.detalhes_engenharia?.map((peca, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{peca.descricao_peca}</h3>
                          <p className="text-sm text-slate-600">
                            {peca.tipo_aco} Ø{peca.diametro}mm • {peca.quantidade} peças
                          </p>
                        </div>
                        <Badge>{peca.peso_kg} kg</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Comprimento:</span>
                          <span className="ml-2 font-medium">{peca.comprimento_mm} mm</span>
                        </div>
                        
                        {peca.mapa_corte_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={peca.mapa_corte_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-2" />
                              Mapa de Corte
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Histórico da Peça */}
                      {peca.historico_peca?.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-slate-700 mb-2">Histórico:</p>
                          <div className="space-y-1">
                            {peca.historico_peca.slice(-3).map((h, hidx) => (
                              <div key={hidx} className="text-xs text-slate-600 flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {h.acao} - {h.usuario_nome} - {format(new Date(h.data), 'dd/MM HH:mm')}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {(!op.detalhes_engenharia || op.detalhes_engenharia.length === 0) && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhum detalhe de engenharia cadastrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Matéria-Prima */}
          <TabsContent value="materiaprima" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Prevista */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">MP Prevista</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {op.materia_prima_prevista?.map((mp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{mp.produto_descricao}</p>
                        <p className="text-xs text-slate-600">Lote: {mp.lote || 'N/A'}</p>
                      </div>
                      <Badge variant="secondary">
                        {mp.quantidade} {mp.unidade}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Consumida */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">MP Consumida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {op.materia_prima_consumida?.map((mp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{mp.produto_descricao || mp.produto_id}</p>
                        <p className="text-xs text-slate-600">
                          {format(new Date(mp.data_consumo), 'dd/MM HH:mm')}
                        </p>
                      </div>
                      <Badge className="bg-green-600">
                        {mp.quantidade} {mp.unidade}
                      </Badge>
                    </div>
                  ))}

                  {(!op.materia_prima_consumida || op.materia_prima_consumida.length === 0) && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhum consumo registrado
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Apontamentos */}
          <TabsContent value="apontamentos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Apontamentos de Produção</CardTitle>
                {hasGranularPermission('producao', 'apontar') && (
                  <Button
                    onClick={() => {
                      const novoApontamento = {
                        data: new Date().toISOString(),
                        usuario_id: 'current_user',
                        usuario_nome: 'Operador',
                        etapa: op.status,
                        quantidade_produzida: 100,
                        tempo_producao_minutos: 60,
                        maquina_id: 'MAQ001'
                      };
                      registrarApontamentoMutation.mutate(novoApontamento);
                    }}
                    size="sm"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Novo Apontamento
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {op.apontamentos?.map((apt, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{apt.etapa}</p>
                          <p className="text-sm text-slate-600">
                            {apt.usuario_nome} • {format(new Date(apt.data), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge>{apt.quantidade_produzida} kg</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-sm mt-3">
                        <div>
                          <span className="text-slate-600">Tempo:</span>
                          <span className="ml-2 font-medium">{apt.tempo_producao_minutos} min</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Máquina:</span>
                          <span className="ml-2 font-medium">{apt.maquina_id}</span>
                        </div>
                        {apt.refugo_kg > 0 && (
                          <div>
                            <span className="text-slate-600">Refugo:</span>
                            <span className="ml-2 font-medium text-red-600">{apt.refugo_kg} kg</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!op.apontamentos || op.apontamentos.length === 0) && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhum apontamento registrado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab IA & Otimizações */}
          <TabsContent value="ia" className="space-y-4">
            {/* Alertas IA */}
            {op.alertas_ia?.filter(a => !a.resolvido).length > 0 && (
              <Card className="border-orange-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="w-5 h-5" />
                    Alertas da IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {op.alertas_ia.filter(a => !a.resolvido).map((alerta, idx) => (
                    <div key={idx} className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-orange-900">{alerta.tipo}</p>
                          <Badge 
                            variant={
                              alerta.severidade === 'Crítica' ? 'destructive' :
                              alerta.severidade === 'Alta' ? 'default' :
                              'secondary'
                            }
                            className="mt-1"
                          >
                            {alerta.severidade}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-600">
                          {format(new Date(alerta.data), 'dd/MM HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-orange-800">{alerta.mensagem}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Otimizações IA */}
            {op.otimizacoes_ia && (
              <Card className="border-blue-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Zap className="w-5 h-5" />
                    Otimizações Sugeridas pela IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {op.otimizacoes_ia.mapa_corte_otimizado && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-900 mb-2">Mapa de Corte Otimizado</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={op.otimizacoes_ia.mapa_corte_otimizado} target="_blank">
                          <FileText className="w-4 h-4 mr-2" />
                          Visualizar Mapa
                        </a>
                      </Button>
                    </div>
                  )}

                  {op.otimizacoes_ia.economia_estimada > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-green-900 mb-2">Economia Estimada</p>
                      <p className="text-2xl font-bold text-green-700">
                        R$ {op.otimizacoes_ia.economia_estimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}

                  {op.otimizacoes_ia.reorganizacao_sugerida && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="font-medium text-purple-900 mb-2">Reorganização Sugerida</p>
                      <p className="text-sm text-purple-800">
                        {op.otimizacoes_ia.reorganizacao_sugerida}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer com Ações */}
      {hasGranularPermission('producao', 'editar') && (
        <div className="flex-shrink-0 border-t bg-slate-50 p-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => mudarStatusMutation.mutate('Em Corte')}
            disabled={op.status === 'Em Corte'}
          >
            Iniciar Corte
          </Button>

          <Button
            variant="outline"
            onClick={() => mudarStatusMutation.mutate('Em Dobra')}
            disabled={op.status === 'Em Dobra'}
          >
            Iniciar Dobra
          </Button>

          <Button
            variant="outline"
            onClick={() => mudarStatusMutation.mutate('Inspeção')}
            disabled={op.status === 'Inspeção'}
          >
            Enviar para Inspeção
          </Button>

          <Button
            className="ml-auto bg-green-600 hover:bg-green-700"
            onClick={() => mudarStatusMutation.mutate('Concluída')}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Concluir OP
          </Button>
        </div>
      )}
    </div>
  );
}