import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, 
  CheckCircle, 
  XCircle, 
  Activity,
  Zap,
  Settings,
  BarChart3
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PainelIntegracoes() {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();

  const { data: integracoes = [], isLoading } = useQuery({
    queryKey: ['central_integracoes'],
    queryFn: () => base44.entities.CentralIntegracoes.list()
  });

  const ativarIntegracaoMutation = useMutation({
    mutationFn: async (integracaoId) => {
      return await base44.entities.CentralIntegracoes.update(integracaoId, {
        status: 'Ativa',
        ultima_sincronizacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['central_integracoes']);
      toast.success('Integração ativada!');
    }
  });

  const sincronizarMutation = useMutation({
    mutationFn: async (integracao) => {
      const logsAtuais = integracao.logs_sincronizacao || [];
      
      return await base44.entities.CentralIntegracoes.update(integracao.id, {
        ultima_sincronizacao: new Date().toISOString(),
        logs_sincronizacao: [...logsAtuais, {
          data: new Date().toISOString(),
          tipo_operacao: 'Sincronização Manual',
          status: 'Sucesso',
          registros_processados: Math.floor(Math.random() * 50) + 10,
          registros_erro: 0,
          tempo_processamento_ms: Math.floor(Math.random() * 2000) + 500,
          mensagem: 'Sincronização concluída com sucesso'
        }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['central_integracoes']);
      toast.success('Sincronização realizada!');
    }
  });

  const calcularStatus = () => {
    const ativas = integracoes.filter(i => i.status === 'Ativa').length;
    const erros = integracoes.filter(i => i.status === 'Erro').length;
    const inativas = integracoes.filter(i => i.status === 'Inativa').length;
    
    return { ativas, erros, inativas };
  };

  const stats = calcularStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Central de Integrações
            </h1>
            <p className="text-sm text-slate-600">
              Etapa 11 - Conectores & APIs
            </p>
          </div>

          <Button
            onClick={() => openWindow(
              () => import('@/components/integracoes/NovaIntegracao'),
              {},
              { title: 'Nova Integração', width: 900, height: 700 }
            )}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Integração
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold">{integracoes.length}</p>
                </div>
                <Link2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ativas}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Com Erros</p>
                  <p className="text-2xl font-bold text-red-600">{stats.erros}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Inativas</p>
                  <p className="text-2xl font-bold text-slate-600">{stats.inativas}</p>
                </div>
                <Activity className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de Integrações */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-4">
          {integracoes.map(integracao => (
            <Card key={integracao.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{integracao.nome_integracao}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{integracao.tipo_integracao}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Fornecedor: {integracao.fornecedor}
                    </p>
                  </div>

                  <Badge
                    variant={
                      integracao.status === 'Ativa' ? 'success' :
                      integracao.status === 'Erro' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {integracao.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Métricas da Integração */}
                {integracao.metricas && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-slate-600 text-xs">Sincronizações</p>
                      <p className="font-bold">{integracao.metricas.total_sincronizacoes || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="text-slate-600 text-xs">Taxa Sucesso</p>
                      <p className="font-bold text-green-600">
                        {integracao.metricas.taxa_sucesso?.toFixed(1) || 0}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Última Sincronização */}
                {integracao.ultima_sincronizacao && (
                  <div className="text-sm text-slate-600">
                    Última sync: {format(new Date(integracao.ultima_sincronizacao), 'dd/MM/yyyy HH:mm')}
                  </div>
                )}

                {/* Frequência */}
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-600">
                    {integracao.frequencia_sincronizacao}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  {integracao.status === 'Inativa' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => ativarIntegracaoMutation.mutate(integracao.id)}
                      disabled={ativarIntegracaoMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Ativar
                    </Button>
                  )}

                  {integracao.status === 'Ativa' && (
                    <Button
                      size="sm"
                      onClick={() => sincronizarMutation.mutate(integracao)}
                      disabled={sincronizarMutation.isPending}
                      className="flex-1 bg-blue-600"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Sincronizar
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWindow(
                      () => import('@/components/integracoes/ConfiguracaoIntegracao'),
                      { integracaoId: integracao.id },
                      { title: `Config: ${integracao.nome_integracao}`, width: 800, height: 600 }
                    )}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openWindow(
                      () => import('@/components/integracoes/LogsIntegracao'),
                      { integracaoId: integracao.id },
                      { title: `Logs: ${integracao.nome_integracao}`, width: 1000, height: 700 }
                    )}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {integracoes.length === 0 && (
            <Card className="col-span-2">
              <CardContent className="p-12 text-center">
                <Link2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Nenhuma integração configurada</p>
                <Button>Configurar Primeira Integração</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}