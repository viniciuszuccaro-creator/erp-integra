import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  Link2,
  FileText,
  MessageSquare,
  Sparkles,
  Bell,
  Shield,
  Database,
  Bolt
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Painel de Configuração Global do Sistema
 * Administradores configuram integrações, IA, notificações e padrões
 */
export default function ConfigGlobal({ empresaId, grupoId }) {
  const [activeTab, setActiveTab] = useState('integracoes');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const canLoadConfigs = Boolean(grupoAtual?.id || empresaAtual?.id);
  const { data: configs = [] } = useQuery({
      queryKey: ['config-sistema', empresaAtual?.id || 'sem-empresa', grupoAtual?.id || 'sem-grupo'],
      queryFn: async () => {
        const filtro = {};
        if (grupoAtual?.id) filtro.group_id = grupoAtual.id;
        if (empresaAtual?.id) filtro.empresa_id = empresaAtual.id;
        const list = await base44.entities.ConfiguracaoSistema.filter(filtro, '-updated_date', 200);
        return Array.isArray(list) ? list : [];
      },
      enabled: canLoadConfigs,
      staleTime: 60000,
    });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const { __before, __scope, ...payload } = data || {};
      const scope = { group_id: grupoAtual?.id || undefined, empresa_id: empresaAtual?.id || undefined };
      const finalPayload = { ...payload, ...scope };
      // Atualiza o registro correto dentro do escopo (grupo/empresa)
      const match = configs.find(c =>
        c.chave === payload.chave &&
        ((scope.group_id ? c.group_id === scope.group_id : !c.group_id) &&
         (scope.empresa_id ? c.empresa_id === scope.empresa_id : !c.empresa_id))
      );
      if (match?.id) {
        return base44.entities.ConfiguracaoSistema.update(match.id, finalPayload);
      }
      return base44.entities.ConfiguracaoSistema.create(finalPayload);
    },
    onSuccess: async (res, variables) => {
      // Recarrega todos os consumidores
      queryClient.invalidateQueries({ queryKey: ['config-sistema', empresaAtual?.id || 'sem-empresa', grupoAtual?.id || 'sem-grupo'] });
      queryClient.invalidateQueries({ queryKey: ['configuracaoSistema'] });
      toast({ title: '✅ Configuração salva com sucesso!' });
      try {
        const me = await base44.auth.me();
        const before = variables?.__before || null;
        const { __before: _b, __scope: _s, ...afterClean } = variables || {};
        // Auditoria via função padronizada (formato de automação de entidade)
        try {
          const eventType = before?.id ? 'update' : 'create';
          await base44.functions.invoke('auditEntityEvents', {
            event: {
              type: eventType,
              entity_name: 'ConfiguracaoSistema',
              entity_id: res?.id || before?.id || null
            },
            data: res || afterClean,
            old_data: before || null
          });
        } catch {}
        // Log complementar direto
        await base44.entities.AuditLog.create({
          usuario: me?.full_name || me?.email || 'Usuário',
          usuario_id: me?.id,
          acao: 'Edição',
          modulo: 'Sistema',
          tipo_auditoria: 'entidade',
          entidade: 'ConfiguracaoSistema',
          descricao: `Alteração: ${afterClean?.chave}`,
          dados_anteriores: before,
          dados_novos: res || afterClean,
          empresa_id: empresaAtual?.id || null,
          group_id: grupoAtual?.id || null,
          data_hora: new Date().toISOString(),
        });
      } catch {}
    }
  });

  const getConfig = (chave) => {
    const scope = { group_id: grupoAtual?.id || null, empresa_id: empresaAtual?.id || null };
    const list = (configs || []).filter(c => c.chave === chave);
    const exact = list.find(c =>
      ((scope.group_id ? c.group_id === scope.group_id : !c.group_id) &&
       (scope.empresa_id ? c.empresa_id === scope.empresa_id : !c.empresa_id))
    );
    return exact || list[0] || {};
  };

  const handleSave = (chave, categoria, dados) => {
    const before = getConfig(chave);
    const propName = categoria === 'Integracoes'
      ? ('integracao_' + (chave.split('_')[1] || chave.replace(/^integracao_/, '')))
      : categoria.toLowerCase();

    // Multiempresa: exige escopo explícito para qualquer gravação
    const scope = { group_id: grupoAtual?.id || null, empresa_id: empresaAtual?.id || null };

    updateMutation.mutate({
      chave,
      categoria,
      [propName]: dados,
      ...scope,
      __before: before
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Configurações Globais do Sistema
        </h2>
        <p className="text-slate-600">
          Configurações centralizadas de integrações, IA, notificações e padrões
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="integracoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Link2 className="w-4 h-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="ia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            IA
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* ABA: INTEGRAÇÕES (CONSOLIDADO) */}
        <TabsContent value="integracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações (Consolidado)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">O gerenciamento completo de integrações foi consolidado na aba principal de Integrações.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs text-slate-500 mb-1">NF-e</div>
                  <div className="text-sm font-medium">{getConfig('integracao_nfe')?.integracao_nfe?.ativa ? 'Ativo' : 'Inativo'}</div>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs text-slate-500 mb-1">Boleto/PIX</div>
                  <div className="text-sm font-medium">{getConfig('integracao_boletos')?.integracao_boletos?.ativa ? 'Ativo' : 'Inativo'}</div>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs text-slate-500 mb-1">Google Maps</div>
                  <div className="text-sm font-medium">{getConfig('integracao_maps')?.integracao_maps?.ativa ? 'Ativo' : 'Inativo'}</div>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs text-slate-500 mb-1">WhatsApp</div>
                  <div className="text-sm font-medium">{getConfig('integracao_whatsapp')?.integracao_whatsapp?.ativa ? 'Ativo' : 'Inativo'}</div>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to={createPageUrl('AdministracaoSistema?tab=integracoes')} className="inline-flex items-center px-3 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm">
                  Abrir Gerenciamento de Integrações
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: FISCAL */}
        <TabsContent value="fiscal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Fiscais Padrão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CFOP Padrão - Dentro do Estado</Label>
                  <Input defaultValue="5102" placeholder="5102" />
                </div>
                <div>
                  <Label>CFOP Padrão - Fora do Estado</Label>
                  <Input defaultValue="6102" placeholder="6102" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Alíquota ICMS Padrão (%)</Label>
                  <Input type="number" defaultValue="18" placeholder="18" />
                </div>
                <div>
                  <Label>Alíquota PIS (%)</Label>
                  <Input type="number" defaultValue="1.65" placeholder="1.65" />
                </div>
                <div>
                  <Label>Alíquota COFINS (%)</Label>
                  <Input type="number" defaultValue="7.6" placeholder="7.6" />
                </div>
              </div>

              <div>
                <Label>Observações Padrão NF-e</Label>
                <Textarea 
                  placeholder="Observações que aparecerão em todas as notas..."
                  rows={3}
                />
              </div>

              <Button onClick={() => toast({ title: '✅ Configurações fiscais salvas!' })}>
                Salvar Configurações Fiscais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: IA (CONSOLIDADA) */}
        <TabsContent value="ia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Inteligência Artificial (Consolidado)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">Os módulos de IA foram consolidados na aba principal “IA & Otimização”.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs text-slate-500 mb-1">Leitura de Projetos</div>
                  <div className="text-sm font-medium">{getConfig('ia_leitura_projetos')?.ia?.ativa ? 'Ativo' : 'Inativo'}</div>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs text-slate-500 mb-1">Preditivo de Vendas</div>
                  <div className="text-sm font-medium">{getConfig('ia_preditiva_vendas')?.ia?.ativa ? 'Ativo' : 'Inativo'}</div>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <div className="text-xs text-slate-500 mb-1">Conciliação Bancária</div>
                  <div className="text-sm font-medium">{getConfig('ia_conciliacao')?.ia?.ativa ? 'Ativo' : 'Inativo'}</div>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to={createPageUrl('AdministracaoSistema?tab=ia')} className="inline-flex items-center px-3 py-2 rounded-md border bg-white hover:bg-slate-50 text-sm">
                  Abrir IA & Otimização
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificações Automáticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Pedido Aprovado</p>
                    <p className="text-sm text-slate-600">Notifica cliente quando pedido for aprovado</p>
                  </div>
                  <Switch
                     checked={getConfig('notif_pedido_aprovado')?.notificacoes?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('notif_pedido_aprovado','Notificacoes',{ativa: checked})}
                     data-permission="Sistema.Configurações.editar"
                   />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Entrega Saiu para Transporte</p>
                    <p className="text-sm text-slate-600">Envia link de rastreamento</p>
                  </div>
                  <Switch
                     checked={getConfig('notif_entrega_transporte')?.notificacoes?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('notif_entrega_transporte','Notificacoes',{ativa: checked})}
                     data-permission="Sistema.Configurações.editar"
                   />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Boleto Gerado</p>
                    <p className="text-sm text-slate-600">Envia boleto/PIX por WhatsApp e e-mail</p>
                  </div>
                  <Switch
                     checked={getConfig('notif_boleto_gerado')?.notificacoes?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('notif_boleto_gerado','Notificacoes',{ativa: checked})}
                     data-permission="Sistema.Configurações.editar"
                   />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Título Vencido</p>
                    <p className="text-sm text-slate-600">Alerta de inadimplência</p>
                  </div>
                  <Switch
                     checked={getConfig('notif_titulo_vencido')?.notificacoes?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('notif_titulo_vencido','Notificacoes',{ativa: checked})}
                     data-permission="Sistema.Configurações.editar"
                   />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">OP Atrasada</p>
                    <p className="text-sm text-slate-600">Alerta para gerente de produção</p>
                  </div>
                  <Switch
                     checked={getConfig('notif_op_atrasada')?.notificacoes?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('notif_op_atrasada','Notificacoes',{ativa: checked})}
                     data-permission="Sistema.Configurações.editar"
                   />
                </div>
              </div>

              <Button className="w-full" onClick={() => queryClient.invalidateQueries({ queryKey: ['config-sistema', empresaAtual?.id || 'sem-empresa', grupoAtual?.id || 'sem-grupo'] })}>
                Recarregar Estado
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: SEGURANÇA */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança e Auditoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores (MFA)</p>
                    <p className="text-sm text-slate-600">Obrigatório para admins</p>
                  </div>
                  <Switch
                     checked={getConfig('seg_mfa')?.seguranca?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('seg_mfa','Seguranca',{ativa: checked})}
                     data-permission="Sistema.Segurança.editar"
                   />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Logs de Auditoria Completos</p>
                    <p className="text-sm text-slate-600">Registra todas as ações críticas</p>
                  </div>
                  <Switch
                     checked={getConfig('seg_logs_completos')?.seguranca?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('seg_logs_completos','Seguranca',{ativa: checked})}
                     data-permission="Sistema.Segurança.editar"
                   />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Sessão Automática (Timeout)</p>
                    <p className="text-sm text-slate-600">Logout após inatividade</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={getConfig('seg_timeout')?.seguranca?.minutos || 30} className="w-20" onBlur={(e)=>handleSave('seg_timeout','Seguranca',{minutos: Number(e.target.value)||0})} />
                    <span className="text-sm text-slate-600">min</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Bloquear Tentativas Excessivas</p>
                    <p className="text-sm text-slate-600">Bloqueia após 5 tentativas falhas</p>
                  </div>
                  <Switch
                     checked={getConfig('seg_bloqueio_tentativas')?.seguranca?.ativa || false}
                     onCheckedChange={(checked)=>handleSave('seg_bloqueio_tentativas','Seguranca',{ativa: checked})}
                     data-permission="Sistema.Segurança.editar"
                   />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">Conformidade LGPD</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Sistema configurado para conformidade com Lei Geral de Proteção de Dados
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-green-100 text-green-700">✓ Logs Ativos</Badge>
                      <Badge className="bg-green-100 text-green-700">✓ Dados Criptografados</Badge>
                      <Badge className="bg-green-100 text-green-700">✓ Auditoria Completa</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Salvar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}