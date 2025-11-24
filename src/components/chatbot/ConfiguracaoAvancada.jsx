import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Brain,
  Clock,
  MessageCircle,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.6 - CONFIGURAÇÃO AVANÇADA DO CHATBOT
 * 
 * ✅ Configuração de IA
 * ✅ Horários de atendimento
 * ✅ Mensagens automáticas
 * ✅ Regras de transbordo
 * ✅ SLA
 */
export default function ConfiguracaoAvancada() {
  const { empresaAtual } = useContextoVisual();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState({
    // IA
    ia_modelo: 'gpt-4',
    ia_temperatura: 0.7,
    ia_max_tokens: 500,
    ia_contexto_sistema: 'Você é um assistente virtual de um ERP industrial...',
    ia_usar_historico: true,
    ia_usar_base_conhecimento: true,
    ia_detectar_idioma: true,
    
    // Horários
    horario_atendimento: {
      segunda: { inicio: '08:00', fim: '18:00', ativo: true },
      terca: { inicio: '08:00', fim: '18:00', ativo: true },
      quarta: { inicio: '08:00', fim: '18:00', ativo: true },
      quinta: { inicio: '08:00', fim: '18:00', ativo: true },
      sexta: { inicio: '08:00', fim: '18:00', ativo: true },
      sabado: { inicio: '08:00', fim: '12:00', ativo: false },
      domingo: { inicio: '', fim: '', ativo: false }
    },
    
    // Mensagens
    mensagem_boas_vindas: 'Olá! 👋 Bem-vindo ao atendimento. Como posso ajudar?',
    mensagem_ausencia: 'Estamos fora do horário de atendimento. Retornaremos em breve!',
    mensagem_fila_espera: 'Você está na fila de atendimento. Aguarde um momento.',
    mensagem_transferencia: 'Transferindo você para um atendente humano...',
    mensagem_encerramento: 'Obrigado pelo contato! Até a próxima! 😊',
    
    // SLA
    sla_primeira_resposta: 5,
    sla_resolucao: 60,
    sla_espera_fila: 10,
    sla_alertar_gestores: true,
    sla_escalar_automaticamente: true,
    
    // Transbordo
    transbordo_sentimento_negativo: true,
    transbordo_confianca_baixa: true,
    transbordo_solicitacao_humano: true,
    transbordo_limite_confianca: 40,
    
    // Roteamento
    roteamento_tipo: 'round_robin',
    roteamento_priorizar_anterior: true,
    roteamento_limite_simultaneas: 5,
    
    // Timeout
    tempo_timeout_minutos: 30,
    tempo_inatividade_aviso: 20
  });

  // Buscar configuração existente
  const { data: configExistente } = useQuery({
    queryKey: ['config-chatbot-avancada', empresaAtual?.id],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoCanal.filter({
        empresa_id: empresaAtual?.id,
        canal: 'Portal'
      });
      return configs[0];
    },
    enabled: !!empresaAtual?.id
  });

  // Sincronizar config quando carregar
  useEffect(() => {
    if (configExistente) {
      setConfig(prev => ({
        ...prev,
        mensagem_boas_vindas: configExistente.mensagem_boas_vindas || prev.mensagem_boas_vindas,
        mensagem_ausencia: configExistente.mensagem_ausencia || prev.mensagem_ausencia,
        mensagem_fila_espera: configExistente.mensagem_fila_espera || prev.mensagem_fila_espera,
        mensagem_transferencia: configExistente.mensagem_transferencia || prev.mensagem_transferencia,
        mensagem_encerramento: configExistente.mensagem_encerramento || prev.mensagem_encerramento,
        tempo_timeout_minutos: configExistente.tempo_timeout_minutos || prev.tempo_timeout_minutos,
        tempo_inatividade_aviso: configExistente.tempo_inatividade_aviso_minutos || prev.tempo_inatividade_aviso,
        horario_atendimento: configExistente.horario_atendimento || prev.horario_atendimento,
        ...configExistente.ia_config,
        ...configExistente.sla_config,
        ...configExistente.roteamento
      }));
    }
  }, [configExistente]);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const dados = {
        mensagem_boas_vindas: config.mensagem_boas_vindas,
        mensagem_ausencia: config.mensagem_ausencia,
        mensagem_fila_espera: config.mensagem_fila_espera,
        mensagem_transferencia: config.mensagem_transferencia,
        mensagem_encerramento: config.mensagem_encerramento,
        tempo_timeout_minutos: config.tempo_timeout_minutos,
        tempo_inatividade_aviso_minutos: config.tempo_inatividade_aviso,
        horario_atendimento: config.horario_atendimento,
        ia_config: {
          modelo: config.ia_modelo,
          temperatura: config.ia_temperatura,
          max_tokens: config.ia_max_tokens,
          contexto_sistema: config.ia_contexto_sistema,
          usar_historico_cliente: config.ia_usar_historico,
          usar_base_conhecimento: config.ia_usar_base_conhecimento,
          detectar_idioma: config.ia_detectar_idioma
        },
        sla_config: {
          tempo_primeira_resposta_minutos: config.sla_primeira_resposta,
          tempo_resolucao_minutos: config.sla_resolucao,
          tempo_espera_fila_maximo_minutos: config.sla_espera_fila,
          alertar_gestores: config.sla_alertar_gestores,
          escalar_automaticamente: config.sla_escalar_automaticamente
        },
        roteamento: {
          tipo: config.roteamento_tipo,
          priorizar_atendente_anterior: config.roteamento_priorizar_anterior,
          limite_conversas_simultaneas: config.roteamento_limite_simultaneas
        },
        regras_transbordo: [
          {
            condicao: 'sentimento_negativo',
            ativo: config.transbordo_sentimento_negativo,
            prioridade: 'Alta'
          },
          {
            condicao: 'confianca_baixa',
            valor: String(config.transbordo_limite_confianca),
            ativo: config.transbordo_confianca_baixa
          },
          {
            condicao: 'solicitacao_humano',
            ativo: config.transbordo_solicitacao_humano
          }
        ]
      };

      if (configExistente?.id) {
        await base44.entities.ConfiguracaoCanal.update(configExistente.id, dados);
      } else {
        await base44.entities.ConfiguracaoCanal.create({
          canal: 'Portal',
          empresa_id: empresaAtual?.id,
          ativo: true,
          modo_atendimento: 'Bot com Transbordo',
          ...dados
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-chatbot-avancada'] });
      toast.success('Configurações salvas com sucesso!');
    }
  });

  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const diasLabels = {
    segunda: 'Segunda',
    terca: 'Terça',
    quarta: 'Quarta',
    quinta: 'Quinta',
    sexta: 'Sexta',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  return (
    <div className="w-full h-full overflow-auto p-4 lg:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              Configuração Avançada
            </h1>
            <p className="text-slate-600 mt-1">Personalize o comportamento do chatbot</p>
          </div>
          <Button
            onClick={() => salvarMutation.mutate()}
            disabled={salvarMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {salvarMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>

        <Tabs defaultValue="ia" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="ia">IA</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
            <TabsTrigger value="transbordo">Transbordo</TabsTrigger>
          </TabsList>

          {/* IA */}
          <TabsContent value="ia">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Configuração da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Modelo</label>
                    <select
                      value={config.ia_modelo}
                      onChange={(e) => setConfig({ ...config, ia_modelo: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3">Claude 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Temperatura ({config.ia_temperatura})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.ia_temperatura}
                      onChange={(e) => setConfig({ ...config, ia_temperatura: parseFloat(e.target.value) })}
                      className="w-full mt-3"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Tokens</label>
                    <Input
                      type="number"
                      value={config.ia_max_tokens}
                      onChange={(e) => setConfig({ ...config, ia_max_tokens: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Contexto do Sistema</label>
                  <Textarea
                    value={config.ia_contexto_sistema}
                    onChange={(e) => setConfig({ ...config, ia_contexto_sistema: e.target.value })}
                    placeholder="Instruções de comportamento para a IA..."
                    className="mt-1 h-24"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Usar histórico</span>
                    <Switch
                      checked={config.ia_usar_historico}
                      onCheckedChange={(c) => setConfig({ ...config, ia_usar_historico: c })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Base conhecimento</span>
                    <Switch
                      checked={config.ia_usar_base_conhecimento}
                      onCheckedChange={(c) => setConfig({ ...config, ia_usar_base_conhecimento: c })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Detectar idioma</span>
                    <Switch
                      checked={config.ia_detectar_idioma}
                      onCheckedChange={(c) => setConfig({ ...config, ia_detectar_idioma: c })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mensagens */}
          <TabsContent value="mensagens">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Mensagens Automáticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Boas-vindas</label>
                  <Textarea
                    value={config.mensagem_boas_vindas}
                    onChange={(e) => setConfig({ ...config, mensagem_boas_vindas: e.target.value })}
                    className="mt-1 h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fora do Horário</label>
                  <Textarea
                    value={config.mensagem_ausencia}
                    onChange={(e) => setConfig({ ...config, mensagem_ausencia: e.target.value })}
                    className="mt-1 h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Fila de Espera</label>
                  <Textarea
                    value={config.mensagem_fila_espera}
                    onChange={(e) => setConfig({ ...config, mensagem_fila_espera: e.target.value })}
                    className="mt-1 h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Transferência</label>
                  <Textarea
                    value={config.mensagem_transferencia}
                    onChange={(e) => setConfig({ ...config, mensagem_transferencia: e.target.value })}
                    className="mt-1 h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Encerramento</label>
                  <Textarea
                    value={config.mensagem_encerramento}
                    onChange={(e) => setConfig({ ...config, mensagem_encerramento: e.target.value })}
                    className="mt-1 h-20"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Horários */}
          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Horários de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {diasSemana.map(dia => (
                  <div key={dia} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-24">
                      <span className="text-sm font-medium">{diasLabels[dia]}</span>
                    </div>
                    <Switch
                      checked={config.horario_atendimento[dia]?.ativo}
                      onCheckedChange={(c) => setConfig({
                        ...config,
                        horario_atendimento: {
                          ...config.horario_atendimento,
                          [dia]: { ...config.horario_atendimento[dia], ativo: c }
                        }
                      })}
                    />
                    <Input
                      type="time"
                      value={config.horario_atendimento[dia]?.inicio || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        horario_atendimento: {
                          ...config.horario_atendimento,
                          [dia]: { ...config.horario_atendimento[dia], inicio: e.target.value }
                        }
                      })}
                      disabled={!config.horario_atendimento[dia]?.ativo}
                      className="w-32"
                    />
                    <span className="text-sm">até</span>
                    <Input
                      type="time"
                      value={config.horario_atendimento[dia]?.fim || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        horario_atendimento: {
                          ...config.horario_atendimento,
                          [dia]: { ...config.horario_atendimento[dia], fim: e.target.value }
                        }
                      })}
                      disabled={!config.horario_atendimento[dia]?.ativo}
                      className="w-32"
                    />
                  </div>
                ))}

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium">Timeout Inatividade (min)</label>
                    <Input
                      type="number"
                      value={config.tempo_timeout_minutos}
                      onChange={(e) => setConfig({ ...config, tempo_timeout_minutos: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Aviso Inatividade (min)</label>
                    <Input
                      type="number"
                      value={config.tempo_inatividade_aviso}
                      onChange={(e) => setConfig({ ...config, tempo_inatividade_aviso: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLA */}
          <TabsContent value="sla">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Configuração de SLA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Primeira Resposta (min)</label>
                    <Input
                      type="number"
                      value={config.sla_primeira_resposta}
                      onChange={(e) => setConfig({ ...config, sla_primeira_resposta: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Resolução (min)</label>
                    <Input
                      type="number"
                      value={config.sla_resolucao}
                      onChange={(e) => setConfig({ ...config, sla_resolucao: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Espera Fila (min)</label>
                    <Input
                      type="number"
                      value={config.sla_espera_fila}
                      onChange={(e) => setConfig({ ...config, sla_espera_fila: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Alertar gestores</span>
                    <Switch
                      checked={config.sla_alertar_gestores}
                      onCheckedChange={(c) => setConfig({ ...config, sla_alertar_gestores: c })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Escalar automaticamente</span>
                    <Switch
                      checked={config.sla_escalar_automaticamente}
                      onCheckedChange={(c) => setConfig({ ...config, sla_escalar_automaticamente: c })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transbordo */}
          <TabsContent value="transbordo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Regras de Transbordo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Sentimento Negativo</span>
                      <p className="text-xs text-slate-500">Transferir quando detectar frustração</p>
                    </div>
                    <Switch
                      checked={config.transbordo_sentimento_negativo}
                      onCheckedChange={(c) => setConfig({ ...config, transbordo_sentimento_negativo: c })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Confiança Baixa</span>
                      <p className="text-xs text-slate-500">Transferir quando IA não entender</p>
                    </div>
                    <Switch
                      checked={config.transbordo_confianca_baixa}
                      onCheckedChange={(c) => setConfig({ ...config, transbordo_confianca_baixa: c })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Solicitação do Cliente</span>
                      <p className="text-xs text-slate-500">Transferir quando pedir atendente</p>
                    </div>
                    <Switch
                      checked={config.transbordo_solicitacao_humano}
                      onCheckedChange={(c) => setConfig({ ...config, transbordo_solicitacao_humano: c })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Limite de Confiança (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={config.transbordo_limite_confianca}
                    onChange={(e) => setConfig({ ...config, transbordo_limite_confianca: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Abaixo de {config.transbordo_limite_confianca}% será transferido
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Tipo de Roteamento</label>
                  <select
                    value={config.roteamento_tipo}
                    onChange={(e) => setConfig({ ...config, roteamento_tipo: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  >
                    <option value="round_robin">Round Robin</option>
                    <option value="menor_carga">Menor Carga</option>
                    <option value="especialidade">Por Especialidade</option>
                    <option value="ia">IA Match</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm">Priorizar atendente anterior</span>
                    <Switch
                      checked={config.roteamento_priorizar_anterior}
                      onCheckedChange={(c) => setConfig({ ...config, roteamento_priorizar_anterior: c })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Limite Simultâneas</label>
                    <Input
                      type="number"
                      value={config.roteamento_limite_simultaneas}
                      onChange={(e) => setConfig({ ...config, roteamento_limite_simultaneas: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}