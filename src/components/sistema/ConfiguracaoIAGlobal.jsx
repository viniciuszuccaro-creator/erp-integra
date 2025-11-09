import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Save, 
  Zap, 
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

/**
 * V21.4 - Configuração Global de IA
 * Gerencia TODAS as 10+ IAs do sistema
 */
export default function ConfiguracaoIAGlobal({ empresaId, grupoId }) {
  const queryClient = useQueryClient();

  const { data: configsIA = [] } = useQuery({
    queryKey: ['ia-configs-all', empresaId],
    queryFn: () => base44.entities.IAConfig.filter({
      $or: [
        { empresa_id: empresaId },
        { grupo_id: grupoId, empresa_id: null }
      ]
    }),
    enabled: !!empresaId
  });

  const atualizarConfigMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.IAConfig.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ia-configs-all'] });
      toast.success('Configuração atualizada!');
    }
  });

  const modulosIA = [
    {
      modulo: 'Comercial',
      funcionalidades: [
        { chave: 'leitura_projeto', nome: 'Leitura IA de Projetos (PDF/DWG)', default_ativo: true },
        { chave: 'upsell', nome: 'Upsell Inteligente', default_ativo: true },
        { chave: 'precificacao_dinamica', nome: 'Precificação Dinâmica', default_ativo: false }
      ]
    },
    {
      modulo: 'Producao',
      funcionalidades: [
        { chave: 'mes_priorizacao', nome: 'MES - Priorização Inteligente', default_ativo: true },
        { chave: 'refugo_diagnostico', nome: 'Diagnóstico de Refugo', default_ativo: true },
        { chave: 'otimizacao_corte', nome: 'Otimização de Corte', default_ativo: true },
        { chave: 'previsao_producao', nome: 'Previsão de Demanda Produção', default_ativo: false }
      ]
    },
    {
      modulo: 'Financeiro',
      funcionalidades: [
        { chave: 'regua_cobranca', nome: 'Régua de Cobrança Automatizada', default_ativo: true },
        { chave: 'previsao_pagamento', nome: 'Previsão de Pagamento', default_ativo: true },
        { chave: 'conciliacao_pln', nome: 'Conciliação Bancária PLN', default_ativo: true },
        { chave: 'credito_dinamico', nome: 'Bloqueio de Crédito Dinâmico', default_ativo: true }
      ]
    },
    {
      modulo: 'Estoque',
      funcionalidades: [
        { chave: 'reposicao_preditiva', nome: 'Reposição Preditiva', default_ativo: true },
        { chave: 'cross_cd', nome: 'Cross-CD (Transferências)', default_ativo: true },
        { chave: 'auditoria_local', nome: 'Auditoria de Localização', default_ativo: true },
        { chave: 'rastreabilidade', nome: 'Rastreabilidade Total', default_ativo: false }
      ]
    },
    {
      modulo: 'Logistica',
      funcionalidades: [
        { chave: 'roteirizacao_smart', nome: 'SmartRoute+ Otimização', default_ativo: true },
        { chave: 'eta_dinamico', nome: 'ETA Dinâmico (Tempo Real)', default_ativo: true }
      ]
    },
    {
      modulo: 'Fiscal',
      funcionalidades: [
        { chave: 'difal_update', nome: 'DIFAL Auto-Update', default_ativo: true },
        { chave: 'validacao_pre_emissao', nome: 'Validação Pré-Emissão NF-e', default_ativo: true }
      ]
    }
  ];

  const toggleIA = async (modulo, funcionalidade, configExistente) => {
    if (configExistente) {
      await atualizarConfigMutation.mutateAsync({
        id: configExistente.id,
        data: { ativo: !configExistente.ativo }
      });
    } else {
      await base44.entities.IAConfig.create({
        grupo_id: grupoId,
        empresa_id: empresaId,
        chave: `${modulo.toLowerCase()}_${funcionalidade}`,
        modulo: modulo,
        funcionalidade: funcionalidade,
        ativo: true,
        modo_treinamento: false,
        modelo_base: 'GPT-4o',
        provedor: 'OpenAI',
        confianca_minima: 75,
        temperatura: 0.7,
        timeout_segundos: 60
      });
      queryClient.invalidateQueries({ queryKey: ['ia-configs-all'] });
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-purple-300 bg-purple-50">
        <Brain className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          <strong>Central de IA:</strong> Configure quais inteligências artificiais estão ativas. 
          Cada IA executa automaticamente em background ou sob demanda.
        </AlertDescription>
      </Alert>

      {modulosIA.map((moduloGrupo) => (
        <Card key={moduloGrupo.modulo} className="border-2 border-slate-200">
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              {moduloGrupo.modulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {moduloGrupo.funcionalidades.map((func) => {
                const configExistente = configsIA.find(c => 
                  c.modulo === moduloGrupo.modulo && 
                  c.funcionalidade === func.chave
                );

                const ativo = configExistente?.ativo || false;
                const totalExec = configExistente?.total_execucoes || 0;
                const taxaSucesso = configExistente?.taxa_sucesso_percentual || 0;

                return (
                  <div 
                    key={func.chave} 
                    className={`p-4 rounded-lg border-2 transition-all ${
                      ativo 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={ativo}
                            onCheckedChange={() => toggleIA(moduloGrupo.modulo, func.chave, configExistente)}
                          />
                          <div>
                            <p className="font-semibold">{func.nome}</p>
                            {configExistente && (
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {totalExec} execuções
                                </Badge>
                                <Badge className={
                                  taxaSucesso >= 90 ? 'bg-green-600' :
                                  taxaSucesso >= 70 ? 'bg-yellow-600' :
                                  'bg-red-600'
                                }>
                                  {taxaSucesso.toFixed(0)}% sucesso
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        {ativo ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-slate-300" />
                        )}
                      </div>
                    </div>

                    {configExistente?.ultima_execucao && (
                      <p className="text-xs text-slate-500 mt-2">
                        Última execução: {new Date(configExistente.ultima_execucao).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Configurações Avançadas */}
      <Card className="border-2 border-orange-300">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            Configurações Avançadas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Confiança Mínima (%)</Label>
              <Input type="number" defaultValue={75} min={0} max={100} />
              <p className="text-xs text-slate-500 mt-1">
                Porcentagem mínima para aceitar resultado da IA
              </p>
            </div>

            <div>
              <Label>Timeout (segundos)</Label>
              <Input type="number" defaultValue={60} min={10} max={300} />
              <p className="text-xs text-slate-500 mt-1">
                Tempo máximo de espera por resposta
              </p>
            </div>

            <div>
              <Label>Modelo Base</Label>
              <Input defaultValue="GPT-4o" disabled />
              <p className="text-xs text-slate-500 mt-1">
                Modelo de linguagem utilizado
              </p>
            </div>

            <div>
              <Label>Temperatura</Label>
              <Input type="number" defaultValue={0.7} min={0} max={1} step={0.1} />
              <p className="text-xs text-slate-500 mt-1">
                Criatividade da IA (0 = conservador, 1 = criativo)
              </p>
            </div>
          </div>

          <Alert className="border-yellow-300 bg-yellow-50">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-900">
              <strong>Atenção:</strong> Alterações nas configurações avançadas afetam todas as IAs. 
              Recomendamos manter os valores padrão.
            </AlertDescription>
          </Alert>

          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações Globais
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}