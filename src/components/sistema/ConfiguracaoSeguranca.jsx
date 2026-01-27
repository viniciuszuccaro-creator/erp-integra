import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  Key,
  Clock,
  Smartphone,
  Lock,
  Save,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Configuração de Segurança e Sessões
 */
export default function ConfiguracaoSeguranca({ empresaId, grupoId }) {
  const [salvando, setSalvando] = useState(false);
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['config-seguranca', empresaId || grupoId],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSeguranca.filter({
        ...(empresaId ? { empresa_id: empresaId } : { group_id: grupoId })
      });
      
      if (configs.length > 0) {
        return configs[0];
      }
      
      // Config padrão
      return {
        empresa_id: empresaId,
        group_id: grupoId,
        jwt_ativo: true,
        jwt_algoritmo: 'HS256',
        jwt_validade_access_minutos: 15,
        jwt_validade_refresh_dias: 30,
        jwt_rotacao_refresh: true,
        jwt_familia_tokens: true,
        jwt_revogar_familia_em_suspeita: true,
        sessao_unica: false,
        sessoes_simultaneas_max: 3,
        encerrar_sessoes_antigas_auto: true,
        timeout_inatividade_minutos: 60,
        timeout_absoluto_horas: 24,
        exigir_mfa: false,
        mfa_metodos_disponiveis: ['Email', 'WhatsApp'],
        mfa_validade_codigo_minutos: 5,
        mfa_exigir_novo_ip: true,
        mfa_exigir_novo_dispositivo: true,
        tentativas_login_max: 5,
        bloqueio_tempo_minutos: 30,
        bloqueio_ip_suspeito: true,
        detectar_anomalias_ia: false,
        registrar_dispositivos: true,
        notificar_novo_dispositivo: true,
        notificar_novo_ip: true,
        politica_senha: {
          tamanho_minimo: 8,
          exigir_maiusculas: true,
          exigir_minusculas: true,
          exigir_numeros: true,
          exigir_especiais: false,
          trocar_senha_dias: 90,
          historico_senhas: 3
        }
      };
    },
  });

  const [formData, setFormData] = useState(config || {});

  React.useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const salvarMutation = useMutation({
    mutationFn: async (data) => {
      const stamped = { ...data, empresa_id: empresaId || null, group_id: grupoId || null };
      if (config?.id) {
        return await base44.entities.ConfiguracaoSeguranca.update(config.id, stamped);
      } else {
        return await base44.entities.ConfiguracaoSeguranca.create(stamped);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-seguranca', empresaId || grupoId] });
      toast.success('✅ Configuração salva com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast.error('❌ Erro ao salvar configuração');
    }
  });

  const handleSalvar = () => {
    setSalvando(true);
    salvarMutation.mutate(formData);
    setTimeout(() => setSalvando(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert className={formData.jwt_ativo ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}>
        <Shield className={`w-5 h-5 ${formData.jwt_ativo ? 'text-green-600' : 'text-orange-600'}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${formData.jwt_ativo ? 'text-green-900' : 'text-orange-900'}`}>
                {formData.jwt_ativo ? '✅ JWT e Controle de Sessões Ativo' : '⚠️ Autenticação JWT Desativada'}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                {formData.jwt_ativo 
                  ? `Access: ${formData.jwt_validade_access_minutos}min • Refresh: ${formData.jwt_validade_refresh_dias}dias • Max: ${formData.sessoes_simultaneas_max} sessões`
                  : 'Ative JWT para maior segurança'
                }
              </p>
            </div>
            <div className="flex gap-2">
              {formData.exigir_mfa && (
                <Badge className="bg-purple-600">MFA Ativo</Badge>
              )}
              {formData.detectar_anomalias_ia && (
                <Badge className="bg-blue-600">IA Segurança</Badge>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="jwt" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jwt">
            <Key className="w-4 h-4 mr-2" />
            JWT
          </TabsTrigger>
          <TabsTrigger value="sessoes">
            <Clock className="w-4 h-4 mr-2" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="mfa">
            <Smartphone className="w-4 h-4 mr-2" />
            MFA
          </TabsTrigger>
          <TabsTrigger value="senhas">
            <Lock className="w-4 h-4 mr-2" />
            Senhas
          </TabsTrigger>
        </TabsList>

        {/* ABA: JWT */}
        <TabsContent value="jwt" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Configurações JWT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">JWT Ativo</Label>
                  <p className="text-sm text-slate-600">Usar JWT para autenticação</p>
                </div>
                <Switch
                  checked={formData.jwt_ativo}
                  onCheckedChange={(checked) => setFormData({...formData, jwt_ativo: checked})}
                />
              </div>

              {formData.jwt_ativo && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Algoritmo</Label>
                      <Select
                        value={formData.jwt_algoritmo}
                        onValueChange={(value) => setFormData({...formData, jwt_algoritmo: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HS256">HS256 (HMAC SHA-256)</SelectItem>
                          <SelectItem value="HS384">HS384 (HMAC SHA-384)</SelectItem>
                          <SelectItem value="HS512">HS512 (HMAC SHA-512)</SelectItem>
                          <SelectItem value="RS256">RS256 (RSA SHA-256)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Validade Access Token (min)</Label>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        value={formData.jwt_validade_access_minutos}
                        onChange={(e) => setFormData({...formData, jwt_validade_access_minutos: parseInt(e.target.value)})}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Recomendado: 15-30 minutos
                      </p>
                    </div>

                    <div>
                      <Label>Validade Refresh Token (dias)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="90"
                        value={formData.jwt_validade_refresh_dias}
                        onChange={(e) => setFormData({...formData, jwt_validade_refresh_dias: parseInt(e.target.value)})}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Recomendado: 7-30 dias
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Rotação de Refresh Tokens</Label>
                        <p className="text-sm text-slate-600">Gera novo token a cada uso (segurança)</p>
                      </div>
                      <Switch
                        checked={formData.jwt_rotacao_refresh}
                        onCheckedChange={(checked) => setFormData({...formData, jwt_rotacao_refresh: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Família de Tokens</Label>
                        <p className="text-sm text-slate-600">Detecta roubo de tokens</p>
                      </div>
                      <Switch
                        checked={formData.jwt_familia_tokens}
                        onCheckedChange={(checked) => setFormData({...formData, jwt_familia_tokens: checked})}
                      />
                    </div>

                    {formData.jwt_familia_tokens && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Revogar Família em Suspeita</Label>
                          <p className="text-sm text-slate-600">Revoga todos tokens se detectar uso duplo</p>
                        </div>
                        <Switch
                          checked={formData.jwt_revogar_familia_em_suspeita}
                          onCheckedChange={(checked) => setFormData({...formData, jwt_revogar_familia_em_suspeita: checked})}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: SESSÕES */}
        <TabsContent value="sessoes" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Controle de Sessões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Sessão Única</Label>
                  <p className="text-sm text-slate-600">Permite apenas 1 dispositivo conectado</p>
                </div>
                <Switch
                  checked={formData.sessao_unica}
                  onCheckedChange={(checked) => setFormData({...formData, sessao_unica: checked})}
                />
              </div>

              {!formData.sessao_unica && (
                <div>
                  <Label>Sessões Simultâneas Máximas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.sessoes_simultaneas_max}
                    onChange={(e) => setFormData({...formData, sessoes_simultaneas_max: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Quantidade máxima de dispositivos conectados simultaneamente
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Timeout Inatividade (min)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="480"
                    value={formData.timeout_inatividade_minutos}
                    onChange={(e) => setFormData({...formData, timeout_inatividade_minutos: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Desconecta após este tempo sem atividade
                  </p>
                </div>

                <div>
                  <Label>Timeout Absoluto (horas)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={formData.timeout_absoluto_horas}
                    onChange={(e) => setFormData({...formData, timeout_absoluto_horas: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Tempo máximo de uma sessão
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Encerrar Sessões Antigas Automaticamente</Label>
                  <p className="text-sm text-slate-600">Ao atingir o limite, encerra as mais antigas</p>
                </div>
                <Switch
                  checked={formData.encerrar_sessoes_antigas_auto}
                  onCheckedChange={(checked) => setFormData({...formData, encerrar_sessoes_antigas_auto: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: MFA */}
        <TabsContent value="mfa" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Autenticação de Dois Fatores (MFA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Exigir MFA</Label>
                  <p className="text-sm text-slate-600">Obrigar autenticação de dois fatores</p>
                </div>
                <Switch
                  checked={formData.exigir_mfa}
                  onCheckedChange={(checked) => setFormData({...formData, exigir_mfa: checked})}
                />
              </div>

              {formData.exigir_mfa && (
                <>
                  <div>
                    <Label className="mb-2 block">Métodos Disponíveis</Label>
                    <div className="space-y-2">
                      {['Email', 'WhatsApp', 'SMS', 'Authenticator'].map((metodo) => (
                        <div key={metodo} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(formData.mfa_metodos_disponiveis || []).includes(metodo)}
                            onChange={(e) => {
                              const metodos = formData.mfa_metodos_disponiveis || [];
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  mfa_metodos_disponiveis: [...metodos, metodo]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  mfa_metodos_disponiveis: metodos.filter(m => m !== metodo)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <Label className="font-normal cursor-pointer">{metodo}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Validade do Código MFA (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.mfa_validade_codigo_minutos}
                      onChange={(e) => setFormData({...formData, mfa_validade_codigo_minutos: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Exigir MFA em:</p>
                    
                    <div className="flex items-center justify-between">
                      <Label className="font-normal">Novo IP Address</Label>
                      <Switch
                        checked={formData.mfa_exigir_novo_ip}
                        onCheckedChange={(checked) => setFormData({...formData, mfa_exigir_novo_ip: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="font-normal">Novo Dispositivo</Label>
                      <Switch
                        checked={formData.mfa_exigir_novo_dispositivo}
                        onCheckedChange={(checked) => setFormData({...formData, mfa_exigir_novo_dispositivo: checked})}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="font-normal">Horário Incomum</Label>
                      <Switch
                        checked={formData.mfa_exigir_horario_incomum}
                        onCheckedChange={(checked) => setFormData({...formData, mfa_exigir_horario_incomum: checked})}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: SENHAS */}
        <TabsContent value="senhas" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-600" />
                Política de Senhas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tamanho Mínimo</Label>
                  <Input
                    type="number"
                    min="4"
                    max="32"
                    value={formData.politica_senha?.tamanho_minimo || 8}
                    onChange={(e) => setFormData({
                      ...formData,
                      politica_senha: {...(formData.politica_senha || {}), tamanho_minimo: parseInt(e.target.value)}
                    })}
                  />
                </div>

                <div>
                  <Label>Trocar Senha a Cada (dias)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    value={formData.politica_senha?.trocar_senha_dias || 90}
                    onChange={(e) => setFormData({
                      ...formData,
                      politica_senha: {...(formData.politica_senha || {}), trocar_senha_dias: parseInt(e.target.value)}
                    })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    0 = nunca expira
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700">Requisitos:</p>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Exigir Maiúsculas</Label>
                  <Switch
                    checked={formData.politica_senha?.exigir_maiusculas}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      politica_senha: {...(formData.politica_senha || {}), exigir_maiusculas: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Exigir Minúsculas</Label>
                  <Switch
                    checked={formData.politica_senha?.exigir_minusculas}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      politica_senha: {...(formData.politica_senha || {}), exigir_minusculas: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Exigir Números</Label>
                  <Switch
                    checked={formData.politica_senha?.exigir_numeros}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      politica_senha: {...(formData.politica_senha || {}), exigir_numeros: checked}
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="font-normal">Exigir Caracteres Especiais</Label>
                  <Switch
                    checked={formData.politica_senha?.exigir_especiais}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      politica_senha: {...(formData.politica_senha || {}), exigir_especiais: checked}
                    })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label>Histórico de Senhas</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.politica_senha?.historico_senhas || 3}
                  onChange={(e) => setFormData({
                    ...formData,
                    politica_senha: {...(formData.politica_senha || {}), historico_senhas: parseInt(e.target.value)}
                  })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Impede reusar as últimas N senhas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tentativas de Login */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Proteção contra Brute Force
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tentativas Máximas</Label>
                  <Input
                    type="number"
                    min="3"
                    max="10"
                    value={formData.tentativas_login_max}
                    onChange={(e) => setFormData({...formData, tentativas_login_max: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <Label>Tempo de Bloqueio (min)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="1440"
                    value={formData.bloqueio_tempo_minutos}
                    onChange={(e) => setFormData({...formData, bloqueio_tempo_minutos: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Bloquear IPs Suspeitos</Label>
                  <p className="text-sm text-slate-600">Bloqueia IPs com muitas tentativas falhas</p>
                </div>
                <Switch
                  checked={formData.bloqueio_ip_suspeito}
                  onCheckedChange={(checked) => setFormData({...formData, bloqueio_ip_suspeito: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSalvar}
          disabled={salvando || salvarMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {salvando || salvarMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </>
          )}
        </Button>
      </div>

      {/* Estatísticas */}
      {config?.estatisticas && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-purple-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Sessões Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {config.estatisticas.total_sessoes_ativas || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Tentativas Falhas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {config.estatisticas.total_tentativas_falhas || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Bloqueios</p>
                <p className="text-2xl font-bold text-red-600">
                  {config.estatisticas.total_bloqueios || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">MFA Validados</p>
                <p className="text-2xl font-bold text-purple-600">
                  {config.estatisticas.total_mfa_validados || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}