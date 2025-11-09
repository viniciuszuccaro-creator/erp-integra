import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";

/**
 * V21.6 - Dashboard de Status das APIs
 * Exibe status em tempo real de todas as integrações
 */
export default function StatusAPIMonitor({ empresaId }) {
  const { data: integracoes = [] } = useQuery({
    queryKey: ['integracoes-status', empresaId],
    queryFn: () => base44.entities.ConfiguracaoIntegracaoMarketplace.filter({
      empresa_id: empresaId
    }),
    refetchInterval: 60000 // Atualizar a cada minuto
  });

  const { data: ultimaVerificacao } = useQuery({
    queryKey: ['ultima-verificacao-api', empresaId],
    queryFn: async () => {
      const logs = await base44.entities.AuditoriaGlobal.filter({
        empresa_id: empresaId,
        usuario_nome: 'IA Monitor API'
      }, '-data_hora', 1);
      
      return logs[0];
    },
    refetchInterval: 60000
  });

  const apisAtivas = integracoes.filter(i => i.ativo && i.status_conexao === 'ativo').length;
  const apisComErro = integracoes.filter(i => i.status_conexao === 'erro').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-blue-900">Monitor de APIs</h2>
                <p className="text-sm text-blue-700">Verificação automática a cada hora</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-600">Última verificação:</p>
              <p className="text-xs text-slate-500">
                {ultimaVerificacao 
                  ? new Date(ultimaVerificacao.data_hora).toLocaleString('pt-BR')
                  : 'Aguardando...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm text-green-700">APIs Ativas</p>
            <p className="text-3xl font-bold text-green-600">{apisAtivas}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <XCircle className="w-6 h-6 text-red-600 mb-2" />
            <p className="text-sm text-red-700">Com Erro</p>
            <p className="text-3xl font-bold text-red-600">{apisComErro}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300 bg-slate-50">
          <CardContent className="p-4">
            <Clock className="w-6 h-6 text-slate-600 mb-2" />
            <p className="text-sm text-slate-700">Total</p>
            <p className="text-3xl font-bold text-slate-600">{integracoes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de APIs */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle>Status das Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {integracoes.map(api => (
              <div
                key={api.id}
                className="p-4 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-lg">{api.marketplace}</p>
                      <Badge className={
                        api.status_conexao === 'ativo' && api.ativo ? 'bg-green-600' :
                        api.status_conexao === 'erro' ? 'bg-red-600' :
                        api.status_conexao === 'token_expirado' ? 'bg-orange-600' :
                        'bg-slate-600'
                      }>
                        {api.status_conexao === 'ativo' && api.ativo ? '✅ Online' :
                         api.status_conexao === 'erro' ? '❌ Erro' :
                         api.status_conexao === 'token_expirado' ? '⏰ Token Expirado' :
                         '⚙️ Não Configurado'}
                      </Badge>
                    </div>
                    
                    {api.mensagem_erro && (
                      <p className="text-sm text-red-600 mt-2">
                        {api.mensagem_erro}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500 mt-1">
                      Última sincronização: {api.ultima_sincronizacao 
                        ? new Date(api.ultima_sincronizacao).toLocaleString('pt-BR')
                        : 'Nunca'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {api.total_pedidos_importados || 0} pedidos
                    </p>
                    <p className="text-sm text-slate-600">
                      {api.total_produtos_sincronizados || 0} produtos
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {integracoes.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Zap className="w-12 h-12 mx-auto mb-3" />
                <p>Nenhuma integração configurada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}