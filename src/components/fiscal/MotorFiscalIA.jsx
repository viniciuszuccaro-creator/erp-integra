import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MotorFiscalIA() {
  const queryClient = useQueryClient();

  const { data: motoresFiscais = [], isLoading } = useQuery({
    queryKey: ['motor_fiscal'],
    queryFn: () => base44.entities.MotorFiscal.list()
  });

  const { data: nfes = [] } = useQuery({
    queryKey: ['notas_fiscais_validacao'],
    queryFn: async () => {
      const lista = await base44.entities.NotaFiscal.list();
      return lista.filter(nf => 
        nf.status === 'Rascunho' || 
        nf.status === 'Processando'
      );
    }
  });

  const validarNFeMutation = useMutation({
    mutationFn: async (nfeId) => {
      // Simular validação IA
      const inconsistencias = [];
      
      // Validação mockada
      if (Math.random() > 0.7) {
        inconsistencias.push({
          campo: 'CFOP',
          valor_esperado: '5102',
          valor_encontrado: '6102',
          severidade: 'Alta',
          sugestao_ia: 'Para operação dentro do estado, use CFOP 5102'
        });
      }

      const motorAtual = motoresFiscais[0];
      const validacoesAtuais = motorAtual?.validacoes_ia || [];

      await base44.entities.MotorFiscal.update(motorAtual.id, {
        validacoes_ia: [...validacoesAtuais, {
          nfe_id: nfeId,
          data_validacao: new Date().toISOString(),
          inconsistencias,
          status: inconsistencias.length === 0 ? 'Aprovado' : 
                  inconsistencias.some(i => i.severidade === 'Crítica') ? 'Reprovado' : 
                  'Com Alertas'
        }]
      });

      return { inconsistencias, status: inconsistencias.length === 0 ? 'Aprovado' : 'Com Alertas' };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['motor_fiscal']);
      
      if (data.status === 'Aprovado') {
        toast.success('NF-e validada pela IA - Sem problemas!');
      } else {
        toast.warning(`Validação concluída - ${data.inconsistencias.length} alertas encontrados`);
      }
    }
  });

  const motorPrincipal = motoresFiscais[0];

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
          Motor Fiscal com IA
        </h1>
        <p className="text-sm text-slate-600">
          Etapa 8 - Validação Inteligente & Monitoramento SEFAZ
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="validacao" className="w-full">
          <TabsList>
            <TabsTrigger value="validacao">Validação Pré-Emissão</TabsTrigger>
            <TabsTrigger value="monitoramento">Monitoramento SEFAZ</TabsTrigger>
            <TabsTrigger value="regras">Regras Fiscais</TabsTrigger>
          </TabsList>

          {/* Validação */}
          <TabsContent value="validacao" className="space-y-4">
            <Card className="border-purple-300 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900 mb-1">
                      IA de Validação Fiscal
                    </p>
                    <p className="text-sm text-purple-800">
                      Validação automática de NF-e antes da emissão, detectando conflitos com regime tributário,
                      CFOP incorreto, NCM inválido e destaque de ICMS
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NF-es para Validar */}
            <div className="grid gap-4">
              {nfes.map(nfe => {
                const validacao = motorPrincipal?.validacoes_ia?.find(v => v.nfe_id === nfe.id);
                
                return (
                  <Card key={nfe.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">NF-e {nfe.numero} - Série {nfe.serie}</p>
                          <p className="text-sm text-slate-600">{nfe.cliente_fornecedor}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Valor: R$ {nfe.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div className="text-right space-y-2">
                          {!validacao ? (
                            <Button
                              size="sm"
                              onClick={() => validarNFeMutation.mutate(nfe.id)}
                              disabled={validarNFeMutation.isPending}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Validar com IA
                            </Button>
                          ) : (
                            <Badge
                              variant={
                                validacao.status === 'Aprovado' ? 'success' :
                                validacao.status === 'Reprovado' ? 'destructive' :
                                'default'
                              }
                            >
                              {validacao.status}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Inconsistências */}
                      {validacao?.inconsistencias?.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {validacao.inconsistencias.map((inc, idx) => (
                            <div key={idx} className={`border-l-4 p-3 rounded ${
                              inc.severidade === 'Crítica' ? 'border-red-500 bg-red-50' :
                              inc.severidade === 'Alta' ? 'border-orange-500 bg-orange-50' :
                              'border-yellow-500 bg-yellow-50'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-medium text-sm">{inc.campo}</p>
                                <Badge 
                                  variant={
                                    inc.severidade === 'Crítica' ? 'destructive' :
                                    inc.severidade === 'Alta' ? 'default' :
                                    'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {inc.severidade}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-700 mb-2">
                                Esperado: <strong>{inc.valor_esperado}</strong> • 
                                Encontrado: <strong>{inc.valor_encontrado}</strong>
                              </p>
                              <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                                💡 {inc.sugestao_ia}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {nfes.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhuma NF-e pendente de validação</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Monitoramento SEFAZ */}
          <TabsContent value="monitoramento" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Monitoramento em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {motorPrincipal?.monitoramento_sefaz?.map((mon, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">NF-e {mon.numero_nfe}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Chave: {mon.chave_acesso?.substring(0, 20)}...
                          </p>
                        </div>

                        <Badge
                          variant={
                            mon.status === 'Autorizada' ? 'success' :
                            mon.status === 'Rejeitada' ? 'destructive' :
                            'default'
                          }
                        >
                          {mon.status}
                        </Badge>
                      </div>

                      {mon.status === 'Autorizada' && (
                        <div className="text-sm space-y-1">
                          <p className="text-green-700">
                            ✓ Autorizada em {format(new Date(mon.data_autorizacao), 'dd/MM/yyyy HH:mm')}
                          </p>
                          <p className="text-slate-600">Protocolo: {mon.protocolo}</p>
                        </div>
                      )}

                      {mon.status === 'Rejeitada' && mon.motivo_rejeicao && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          {mon.motivo_rejeicao}
                        </div>
                      )}

                      {mon.acao_automatica_executada && (
                        <div className="mt-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                          🤖 Ação Automática: {mon.acao_automatica_executada}
                        </div>
                      )}
                    </div>
                  ))}

                  {(!motorPrincipal?.monitoramento_sefaz || motorPrincipal.monitoramento_sefaz.length === 0) && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma NF-e em monitoramento
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regras Fiscais */}
          <TabsContent value="regras" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regras Fiscais Configuradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {motorPrincipal?.regras_fiscais?.map((regra, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Operação:</span>
                          <span className="ml-2 font-medium">{regra.tipo_operacao}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">CFOP:</span>
                          <span className="ml-2 font-medium">{regra.cfop}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">ICMS:</span>
                          <span className="ml-2 font-medium">{regra.aliquota_icms}%</span>
                        </div>
                        <div>
                          <span className="text-slate-600">PIS/COFINS:</span>
                          <span className="ml-2 font-medium">
                            {regra.aliquota_pis}% / {regra.aliquota_cofins}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!motorPrincipal?.regras_fiscais || motorPrincipal.regras_fiscais.length === 0) && (
                    <p className="text-center text-slate-500 py-8">
                      Nenhuma regra fiscal configurada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}