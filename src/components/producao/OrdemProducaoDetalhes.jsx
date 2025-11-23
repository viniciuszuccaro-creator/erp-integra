import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Clipboard, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Sparkles,
  History
} from 'lucide-react';
import { usePermissions } from '@/components/lib/usePermissions';
import { toast } from 'sonner';

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

  const apontarProducaoMutation = useMutation({
    mutationFn: async (dados) => {
      const apontamentosAtuais = op.apontamentos || [];
      return await base44.entities.OrdemProducao.update(opId, {
        apontamentos: [...apontamentosAtuais, dados],
        peso_produzido_kg: (op.peso_produzido_kg || 0) + dados.quantidade_produzida
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ordem_producao']);
      toast.success('Apontamento registrado');
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const progresso = op.peso_total_kg ? Math.round((op.peso_produzido_kg / op.peso_total_kg) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">OP {op.numero_op}</h2>
            <p className="text-sm text-slate-600">
              Cliente: {op.cliente_nome} • Pedido: {op.numero_pedido}
            </p>
          </div>
          <Badge variant={op.prioridade === 'Urgente' ? 'destructive' : 'default'}>
            {op.prioridade}
          </Badge>
        </div>

        {/* Progresso Geral */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso da Produção</span>
              <span className="text-2xl font-bold text-blue-600">{progresso}%</span>
            </div>
            <Progress value={progresso} className="h-3" />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>{op.peso_produzido_kg?.toFixed(0) || 0} kg produzidos</span>
              <span>{op.peso_total_kg?.toFixed(0) || 0} kg total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="geral" className="flex-1">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="engenharia">Engenharia</TabsTrigger>
          <TabsTrigger value="materiaprima">Matéria-Prima</TabsTrigger>
          <TabsTrigger value="apontamentos">Apontamentos</TabsTrigger>
          <TabsTrigger value="ia">IA & Otimizações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tipo:</span>
                  <span className="font-medium">{op.tipo_producao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <Badge variant="outline">{op.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Previsão Início:</span>
                  <span>{op.data_previsao_inicio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Previsão Fim:</span>
                  <span>{op.data_previsao_fim}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Custos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Custo Previsto:</span>
                  <span className="font-medium">R$ {op.custo_previsto?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Custo Realizado:</span>
                  <span className="font-medium text-blue-600">
                    R$ {op.custo_realizado?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Variação:</span>
                  <span className={`font-medium ${
                    (op.custo_realizado || 0) > (op.custo_previsto || 0) ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {((op.custo_realizado || 0) - (op.custo_previsto || 0)).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Itens Vinculados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {op.itens_vinculados?.map((item, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-slate-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{item.descricao}</p>
                      <p className="text-xs text-slate-600">{item.tipo_item}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.quantidade} {item.unidade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engenharia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detalhamento de Peças
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {op.detalhes_engenharia?.map((peca, idx) => (
                  <Card key={idx} className="bg-slate-50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{peca.descricao_peca}</p>
                          <p className="text-xs text-slate-600">
                            {peca.tipo_aco} • Ø{peca.diametro} • {peca.comprimento_mm}mm
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {peca.quantidade} pçs • {peca.peso_kg?.toFixed(2)}kg
                        </Badge>
                      </div>
                      
                      {peca.mapa_corte_url && (
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Mapa de Corte
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materiaprima" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Matéria-Prima Prevista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {op.materia_prima_prevista?.map((mp, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{mp.produto_descricao}</span>
                      <span className="font-medium">{mp.quantidade} {mp.unidade}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Matéria-Prima Consumida</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {op.materia_prima_consumida?.map((mp, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div>
                        <p>{mp.quantidade} {mp.unidade}</p>
                        <p className="text-xs text-slate-600">Lote: {mp.lote}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="apontamentos" className="space-y-4">
          {hasGranularPermission('producao', 'apontar') && (
            <Button className="w-full bg-blue-600">
              <Clipboard className="w-4 h-4 mr-2" />
              Novo Apontamento
            </Button>
          )}

          <div className="space-y-2">
            {op.apontamentos?.map((apt, idx) => (
              <Card key={idx}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{apt.usuario_nome}</p>
                      <p className="text-xs text-slate-600">
                        {apt.etapa} • {apt.quantidade_produzida}kg • {apt.tempo_producao_minutos}min
                      </p>
                      {apt.refugo_kg > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Refugo: {apt.refugo_kg}kg
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{apt.data}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ia" className="space-y-4">
          {/* Alertas IA */}
          {op.alertas_ia?.filter(a => !a.resolvido).length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-orange-900">
                  <AlertTriangle className="w-4 h-4" />
                  Alertas da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {op.alertas_ia.filter(a => !a.resolvido).map((alerta, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-orange-200">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-sm">{alerta.tipo}</p>
                        <Badge variant={
                          alerta.severidade === 'Crítica' ? 'destructive' : 'default'
                        }>
                          {alerta.severidade}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700">{alerta.mensagem}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Otimizações IA */}
          {op.otimizacoes_ia && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
                  <Sparkles className="w-4 h-4" />
                  Otimizações Sugeridas pela IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {op.otimizacoes_ia.mapa_corte_otimizado && (
                  <div className="p-3 bg-white rounded">
                    <p className="text-sm font-medium mb-1">Mapa de Corte Otimizado</p>
                    <Button variant="outline" size="sm">Ver Mapa</Button>
                  </div>
                )}
                
                {op.otimizacoes_ia.economia_estimada && (
                  <div className="p-3 bg-white rounded">
                    <p className="text-sm font-medium">Economia Estimada</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {op.otimizacoes_ia.economia_estimada.toFixed(2)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}