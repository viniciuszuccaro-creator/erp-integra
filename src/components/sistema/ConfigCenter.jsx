
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Settings, 
  Sparkles, // Changed from Brain to Sparkles
  Cloud, 
  Key,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Central de Configurações Unificada
 * Gerencia todas as configurações do sistema
 */
export default function ConfigCenter({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configsIA = [] } = useQuery({
    queryKey: ['configs-ia-geral'],
    queryFn: () => base44.entities.IAConfig.list(),
  });

  const { data: governanca } = useQuery({
    queryKey: ['governanca-config', empresaId],
    queryFn: async () => {
      const configs = await base44.entities.GovernancaEmpresa.filter({
        empresa_id: empresaId
      });
      return configs[0];
    },
    enabled: !!empresaId
  });

  const [configForm, setConfigForm] = useState({
    auditoria_automatica: true,
    backup_automatico: true,
    ia_seguranca_ativa: false,
    exigir_mfa: false
  });

  useEffect(() => {
    if (governanca) {
      setConfigForm({
        auditoria_automatica: governanca.auditoria_automatica,
        backup_automatico: governanca.backup_automatico,
        ia_seguranca_ativa: governanca.ia_seguranca_ativa,
        exigir_mfa: governanca.exigir_mfa
      });
    }
  }, [governanca]);

  const salvarConfigMutation = useMutation({
    mutationFn: async (dados) => {
      if (governanca) {
        return await base44.entities.GovernancaEmpresa.update(governanca.id, dados);
      } else {
        return await base44.entities.GovernancaEmpresa.create({
          empresa_id: empresaId,
          nivel_conformidade: 'Básico',
          ...dados
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governanca-config'] });
      toast({
        title: '✅ Configurações salvas!',
        description: 'As alterações foram aplicadas com sucesso.'
      });
    }
  });

  const modulosIA = configsIA.reduce((acc, config) => {
    if (!acc[config.modulo]) {
      acc[config.modulo] = [];
    }
    acc[config.modulo].push(config);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Central de Configurações
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Gerencie todas as configurações do sistema em um só lugar
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="seguranca" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="seguranca">
            <Key className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="ia">
            <Sparkles className="w-4 h-4 mr-2" /> {/* Changed from Brain to Sparkles */}
            Inteligência Artificial
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Cloud className="w-4 h-4 mr-2" />
            Backup & Logs
          </TabsTrigger>
        </TabsList>

        {/* Tab Segurança */}
        <TabsContent value="seguranca">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">Auditoria Automática</p>
                  <p className="text-sm text-slate-600">
                    Registra todas as ações dos usuários automaticamente
                  </p>
                </div>
                <Switch
                  checked={configForm.auditoria_automatica}
                  onCheckedChange={(v) => setConfigForm({...configForm, auditoria_automatica: v})}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">IA de Segurança</p>
                  <p className="text-sm text-slate-600">
                    Detecta anomalias e comportamentos suspeitos
                  </p>
                </div>
                <Switch
                  checked={configForm.ia_seguranca_ativa}
                  onCheckedChange={(v) => setConfigForm({...configForm, ia_seguranca_ativa: v})}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">Autenticação de Dois Fatores (MFA)</p>
                  <p className="text-sm text-slate-600">
                    Exige verificação adicional no login
                  </p>
                </div>
                <Switch
                  checked={configForm.exigir_mfa}
                  onCheckedChange={(v) => setConfigForm({...configForm, exigir_mfa: v})}
                />
              </div>

              <Button
                onClick={() => salvarConfigMutation.mutate(configForm)}
                disabled={salvarConfigMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {salvarConfigMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab IA */}
        <TabsContent value="ia">
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> {/* Changed from Brain to Sparkles */}
                Módulos de IA Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {Object.keys(modulosIA).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(modulosIA).map(([modulo, configs]) => (
                    <div key={modulo} className="p-4 border rounded-lg">
                      <p className="font-semibold mb-3">{modulo}</p>
                      <div className="space-y-2">
                        {configs.map((config) => (
                          <div key={config.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                            <div>
                              <p className="font-medium">{config.funcionalidade}</p>
                              <p className="text-xs text-slate-600">
                                Modelo: {config.modelo_base} | Limite: {config.limite_tokens} tokens
                              </p>
                            </div>
                            <Badge className={config.ativo ? 'bg-green-600' : 'bg-slate-600'}>
                              {config.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Sparkles className="w-16 h-16 mx-auto mb-3 opacity-30" /> {/* Changed from Brain to Sparkles */}
                  <p>Nenhum módulo de IA configurado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Backup */}
        <TabsContent value="backup">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Backup e Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">Backup Automático Diário</p>
                  <p className="text-sm text-slate-600">
                    Backup incremental de todas as entidades
                  </p>
                </div>
                <Switch
                  checked={configForm.backup_automatico}
                  onCheckedChange={(v) => setConfigForm({...configForm, backup_automatico: v})}
                />
              </div>

              {governanca?.ultimo_backup && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Último backup realizado com sucesso
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {new Date(governanca.ultimo_backup).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-xs text-slate-600">Retenção de Logs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {governanca?.retencao_logs_dias || 365} dias
                  </p>
                </div>
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-xs text-slate-600">Retenção de Documentos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {governanca?.retencao_documentos_anos || 5} anos
                  </p>
                </div>
              </div>

              <Button
                onClick={() => salvarConfigMutation.mutate(configForm)}
                disabled={salvarConfigMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
