import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';

export default function CentralIntegracoesHub() {
  const { openWindow } = useWindow();

  const { data: integracoes = [], isLoading } = useQuery({
    queryKey: ['central_integracoes'],
    queryFn: () => base44.entities.CentralIntegracoes.list()
  });

  const calcularEstatisticas = () => {
    const ativas = integracoes.filter(i => i.status === 'Ativa').length;
    const comErro = integracoes.filter(i => i.status === 'Erro').length;
    const taxaSucessoMedia = integracoes.reduce((acc, i) => 
      acc + (i.metricas?.taxa_sucesso || 0), 0
    ) / (integracoes.length || 1);

    return { total: integracoes.length, ativas, comErro, taxaSucessoMedia: Math.round(taxaSucessoMedia) };
  };

  const stats = calcularEstatisticas();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold mb-2">Central de Integrações</h1>
        <p className="text-sm text-slate-600">
          ETAPA 11 - Integração & Automação • APIs • Webhooks
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Integrações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-sm text-slate-600">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">{stats.comErro}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taxa Sucesso Média</p>
                <p className="text-2xl font-bold text-blue-600">{stats.taxaSucessoMedia}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Integrações */}
      <div className="grid grid-cols-2 gap-4">
        {integracoes.map(integracao => (
          <Card key={integracao.id} className={
            integracao.status === 'Erro' ? 'border-red-200 bg-red-50/30' : ''
          }>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    integracao.status === 'Ativa' ? 'bg-green-100' :
                    integracao.status === 'Erro' ? 'bg-red-100' :
                    'bg-slate-100'
                  }`}>
                    <Link2 className={`w-5 h-5 ${
                      integracao.status === 'Ativa' ? 'text-green-600' :
                      integracao.status === 'Erro' ? 'text-red-600' :
                      'text-slate-600'
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{integracao.nome_integracao}</CardTitle>
                    <p className="text-xs text-slate-600">{integracao.tipo_integracao}</p>
                  </div>
                </div>

                <Badge variant={
                  integracao.status === 'Ativa' ? 'success' :
                  integracao.status === 'Erro' ? 'destructive' :
                  'secondary'
                }>
                  {integracao.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Fornecedor */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Fornecedor:</span>
                <span className="font-medium">{integracao.fornecedor}</span>
              </div>

              {/* Frequência */}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Frequência:</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {integracao.frequencia_sincronizacao}
                </Badge>
              </div>

              {/* Última Sincronização */}
              {integracao.ultima_sincronizacao && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Última Sync:</span>
                  <span className="text-xs">{integracao.ultima_sincronizacao}</span>
                </div>
              )}

              {/* Métricas */}
              {integracao.metricas && (
                <div className="p-3 bg-slate-50 rounded space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Total Sincronizações:</span>
                    <span className="font-medium">{integracao.metricas.total_sincronizacoes}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Taxa de Sucesso:</span>
                    <span className={`font-medium ${
                      integracao.metricas.taxa_sucesso > 90 ? 'text-green-600' :
                      integracao.metricas.taxa_sucesso > 70 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {integracao.metricas.taxa_sucesso}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Tempo Médio:</span>
                    <span className="font-medium">{integracao.metricas.tempo_medio_resposta_ms}ms</span>
                  </div>
                </div>
              )}

              {/* Último Erro */}
              {integracao.metricas?.ultimo_erro && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-900">
                  {integracao.metricas.ultimo_erro}
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Sincronizar
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Ver Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {integracoes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Link2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">Nenhuma integração configurada</p>
            <Button>Adicionar Integração</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}