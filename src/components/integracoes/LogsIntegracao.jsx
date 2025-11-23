import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export default function LogsIntegracao({ integracaoId }) {
  const { data: integracao, isLoading } = useQuery({
    queryKey: ['integracao_logs', integracaoId],
    queryFn: async () => {
      const lista = await base44.entities.CentralIntegracoes.list();
      return lista.find(i => i.id === integracaoId);
    }
  });

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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Logs de Sincronização
        </h1>
        <p className="text-sm text-slate-600">{integracao?.nome_integracao}</p>
      </div>

      <div className="flex-1 overflow-auto space-y-4">
        {integracao?.logs_sincronizacao?.map((log, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {log.status === 'Sucesso' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : log.status === 'Erro' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-orange-600" />
                  )}

                  <div>
                    <p className="font-medium">{log.tipo_operacao}</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(log.data), 'dd/MM/yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant={
                      log.status === 'Sucesso' ? 'success' :
                      log.status === 'Erro' ? 'destructive' :
                      'default'
                    }
                  >
                    {log.status}
                  </Badge>
                  <p className="text-xs text-slate-600 mt-1">
                    {log.registros_processados} registros • {log.tempo_processamento_ms}ms
                  </p>
                </div>
              </div>

              {log.mensagem && (
                <p className="text-sm text-slate-600 mt-2 pl-8">
                  {log.mensagem}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {(!integracao?.logs_sincronizacao || integracao.logs_sincronizacao.length === 0) && (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum log de sincronização</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}