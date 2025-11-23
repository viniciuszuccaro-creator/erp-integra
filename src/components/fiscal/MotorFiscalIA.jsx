import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Shield,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function MotorFiscalIA() {
  const queryClient = useQueryClient();

  // Buscar configuração fiscal
  const { data: motorFiscal, isLoading } = useQuery({
    queryKey: ['motor_fiscal'],
    queryFn: async () => {
      const lista = await base44.entities.MotorFiscal.list();
      return lista[0];
    }
  });

  // Buscar validações recentes
  const validacoesRecentes = motorFiscal?.validacoes_ia?.slice(0, 10) || [];

  // Buscar monitoramento SEFAZ
  const monitoramentoSEFAZ = motorFiscal?.monitoramento_sefaz?.slice(0, 10) || [];

  const validarNFeMutation = useMutation({
    mutationFn: async (nfeId) => {
      // Usar IA para validar nota fiscal
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise a nota fiscal e verifique inconsistências fiscais e tributárias considerando regime ${motorFiscal.regime_tributario}`,
        response_json_schema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['Aprovado', 'Com Alertas', 'Reprovado'] },
            inconsistencias: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  campo: { type: 'string' },
                  valor_esperado: { type: 'string' },
                  valor_encontrado: { type: 'string' },
                  severidade: { type: 'string' },
                  sugestao_ia: { type: 'string' }
                }
              }
            }
          }
        }
      });

      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['motor_fiscal']);
      toast.success('Validação concluída pela IA');
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const calcularEstatisticas = () => {
    const total = validacoesRecentes.length;
    const aprovadas = validacoesRecentes.filter(v => v.status === 'Aprovado').length;
    const alertas = validacoesRecentes.filter(v => v.status === 'Com Alertas').length;
    const reprovadas = validacoesRecentes.filter(v => v.status === 'Reprovado').length;

    return { total, aprovadas, alertas, reprovadas };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6 overflow-auto">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Motor Fiscal Inteligente</h1>
            <p className="text-sm text-slate-600">
              ETAPA 8 - Validação Automática • IA • Monitoramento SEFAZ
            </p>
          </div>
          <Badge className="bg-blue-600">
            {motorFiscal?.regime_tributario}
          </Badge>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Validações</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Aprovadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.aprovadas}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Com Alertas</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.alertas}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Reprovadas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.reprovadas}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="validacoes" className="flex-1">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="validacoes">Validações IA</TabsTrigger>
          <TabsTrigger value="sefaz">Monitoramento SEFAZ</TabsTrigger>
          <TabsTrigger value="regras">Regras Fiscais</TabsTrigger>
        </TabsList>

        <TabsContent value="validacoes" className="space-y-4">
          {validacoesRecentes.map((validacao, idx) => (
            <Card key={idx} className={`border-l-4 ${
              validacao.status === 'Aprovado' ? 'border-l-green-500' :
              validacao.status === 'Com Alertas' ? 'border-l-orange-500' :
              'border-l-red-500'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">
                      {validacao.pedido_id ? `Pedido ${validacao.pedido_id}` : `NF-e ${validacao.nfe_id}`}
                    </CardTitle>
                    <p className="text-xs text-slate-600">{validacao.data_validacao}</p>
                  </div>
                  <Badge variant={
                    validacao.status === 'Aprovado' ? 'success' :
                    validacao.status === 'Com Alertas' ? 'warning' :
                    'destructive'
                  }>
                    {validacao.status}
                  </Badge>
                </div>
              </CardHeader>

              {validacao.inconsistencias?.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {validacao.inconsistencias.map((inc, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium">{inc.campo}</p>
                          <Badge variant="outline" className="text-xs">
                            {inc.severidade}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-slate-600">Esperado:</p>
                            <p className="font-medium">{inc.valor_esperado}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Encontrado:</p>
                            <p className="font-medium text-red-600">{inc.valor_encontrado}</p>
                          </div>
                        </div>

                        {inc.sugestao_ia && (
                          <div className="mt-2 p-2 bg-blue-50 rounded flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-900">{inc.sugestao_ia}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sefaz" className="space-y-4">
          {monitoramentoSEFAZ.map((nfe, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">NF-e {nfe.numero_nfe}</p>
                      <Badge variant={
                        nfe.status === 'Autorizada' ? 'success' :
                        nfe.status === 'Rejeitada' ? 'destructive' :
                        nfe.status === 'Cancelada' ? 'secondary' :
                        'default'
                      }>
                        {nfe.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 mb-1">
                      Chave: {nfe.chave_acesso}
                    </p>

                    {nfe.data_autorizacao && (
                      <p className="text-xs text-slate-600">
                        Autorizada em: {nfe.data_autorizacao}
                      </p>
                    )}

                    {nfe.motivo_rejeicao && (
                      <p className="text-xs text-red-600 mt-2">
                        Motivo: {nfe.motivo_rejeicao}
                      </p>
                    )}

                    {nfe.acao_automatica_executada && (
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <p className="text-xs text-blue-900">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          {nfe.acao_automatica_executada}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {nfe.protocolo && (
                      <p className="text-xs text-slate-600">
                        Protocolo: {nfe.protocolo}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="regras" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Regime Tributário Configurado</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-600 text-lg px-4 py-2">
                {motorFiscal?.regime_tributario}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Regras Fiscais ({motorFiscal?.regras_fiscais?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {motorFiscal?.regras_fiscais?.slice(0, 5).map((regra, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{regra.tipo_operacao}</span>
                      <Badge variant="outline">{regra.cfop}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>ICMS: {regra.aliquota_icms}%</div>
                      <div>PIS: {regra.aliquota_pis}%</div>
                      <div>COFINS: {regra.aliquota_cofins}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}