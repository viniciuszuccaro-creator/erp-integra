import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Link2, FileText, Sparkles, Bell, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * ConfigGlobal — Painel de configuração global do sistema.
 * Toggles persistem diretamente via upsert pelo entity SDK (asServiceRole via backend).
 * Estado optimista local para UX imediata; refetch após save confirma o real.
 */
export default function ConfigGlobal({ empresaId, grupoId }) {
  const [activeTab, setActiveTab] = useState('integracoes');
  const [saving, setSaving] = useState({});
  const [optimistic, setOptimistic] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const eId = empresaId || empresaAtual?.id;
  const gId = grupoId || grupoAtual?.id;
  const canLoad = Boolean(gId || eId);

  // Query direta via SDK asServiceRole (não passa pelo wrapper de layout)
  const { data: configs = [], refetch, isFetching } = useQuery({
    queryKey: ['config-global-v2', eId ?? 'sem', gId ?? 'sem'],
    queryFn: async () => {
      const filtro = {};
      if (gId) filtro.group_id = gId;
      if (eId) filtro.empresa_id = eId;
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter: filtro,
        limit: 300,
      });
      const list = res?.data;
      if (Array.isArray(list) && list.length > 0) return list;
      // fallback via entities direct
      const filtro2 = {};
      if (gId) filtro2.group_id = gId;
      if (eId) filtro2.empresa_id = eId;
      const raw = await base44.entities.ConfiguracaoSistema.filter(filtro2, '-updated_date', 300).catch(() => []);
      return Array.isArray(raw) ? raw : [];
    },
    enabled: canLoad,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  // Retorna o registro mais específico para a chave
  const getConfig = (chave) => {
    const list = (configs || []).filter(c => c.chave === chave);
    if (gId && eId) {
      const exact = list.find(c => c.group_id === gId && c.empresa_id === eId);
      if (exact) return exact;
    }
    if (gId) {
      const byG = list.find(c => c.group_id === gId && !c.empresa_id);
      if (byG) return byG;
    }
    if (eId) {
      const byE = list.find(c => c.empresa_id === eId);
      if (byE) return byE;
    }
    return list[0] || null;
  };

  // Lê o valor do toggle: optimistic tem prioridade
  const getToggleValue = (chave) => {
    if (chave in optimistic) return optimistic[chave];
    const rec = getConfig(chave);
    if (!rec) return false;
    return typeof rec.ativa === 'boolean' ? rec.ativa : false;
  };

  const getScope = () => {
    const scope = {};
    if (gId) scope.group_id = gId;
    if (eId) scope.empresa_id = eId;
    return scope;
  };

  // Salva via backend (bypass total do wrapper do layout)
  const upsert = async (chave, categoria, dados) => {
    const scope = getScope();
    await base44.functions.invoke('upsertConfig', {
      chave,
      data: { categoria, ...dados },
      scope,
    });
  };

  // Toggle: optimistic → upsert → refetch → limpa optimistic
  const handleToggle = async (chave, categoria, newValue) => {
    if (saving[chave]) return;
    setOptimistic(prev => ({ ...prev, [chave]: newValue }));
    setSaving(prev => ({ ...prev, [chave]: true }));
    try {
      await upsert(chave, categoria, { ativa: newValue });
      await queryClient.invalidateQueries({ queryKey: ['config-global-v2'] });
      const fresh = await refetch();
      const freshList = fresh?.data;
      if (Array.isArray(freshList)) {
        const freshRec = freshList.find(c => c.chave === chave);
        if (freshRec && typeof freshRec.ativa === 'boolean') {
          setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
        }
      }
      toast({ title: `✅ ${newValue ? 'Ativado' : 'Desativado'} com sucesso!` });
    } catch (err) {
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
      toast({ title: '❌ Erro ao salvar', description: String(err?.message || err), variant: 'destructive' });
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  };

  // Campo genérico (input/textarea)
  const handleSaveField = async (chave, categoria, dados) => {
    if (saving[chave]) return;
    setSaving(prev => ({ ...prev, [chave]: true }));
    try {
      await upsert(chave, categoria, dados);
      await queryClient.invalidateQueries({ queryKey: ['config-global-v2'] });
      await refetch();
      toast({ title: '✅ Configuração salva!' });
    } catch (err) {
      toast({ title: '❌ Erro ao salvar', description: String(err?.message || err), variant: 'destructive' });
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  };

  const ToggleRow = ({ chave, categoria, label, desc, permId }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <Switch
        checked={getToggleValue(chave)}
        disabled={!!saving[chave] || isFetching}
        onCheckedChange={(checked) => handleToggle(chave, categoria, checked)}
        data-permission={permId}
      />
    </div>
  );

  if (!canLoad) {
    return (
      <div className="p-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
        ⚠️ Selecione uma empresa ou grupo para carregar as configurações.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configurações Globais do Sistema</h2>
          <p className="text-sm text-slate-500">Integrações, IA, notificações e segurança</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { queryClient.invalidateQueries({ queryKey: ['config-global-v2'] }); refetch(); }}>
          🔄 Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex flex-nowrap min-w-max bg-white border shadow-sm">
            <TabsTrigger value="integracoes"><Link2 className="w-4 h-4 mr-1.5" />Integrações</TabsTrigger>
            <TabsTrigger value="fiscal"><FileText className="w-4 h-4 mr-1.5" />Fiscal</TabsTrigger>
            <TabsTrigger value="ia"><Sparkles className="w-4 h-4 mr-1.5" />IA</TabsTrigger>
            <TabsTrigger value="notificacoes"><Bell className="w-4 h-4 mr-1.5" />Notificações</TabsTrigger>
            <TabsTrigger value="seguranca"><Shield className="w-4 h-4 mr-1.5" />Segurança</TabsTrigger>
          </TabsList>
        </div>

        {/* INTEGRAÇÕES */}
        <TabsContent value="integracoes" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Status das Integrações</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">Configurações completas estão em <strong>Administração do Sistema → Integrações</strong>.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['integracao_nfe', 'integracao_boletos', 'integracao_maps', 'integracao_whatsapp'].map((chave) => {
                  const labels = { integracao_nfe: 'NF-e', integracao_boletos: 'Boleto/PIX', integracao_maps: 'Google Maps', integracao_whatsapp: 'WhatsApp' };
                  const rec = getConfig(chave);
                  const sub = rec?.[chave];
                  const ativo = !!(sub?.ativa || sub?.api_key);
                  return (
                    <div key={chave} className="p-3 border rounded-lg bg-white">
                      <div className="text-xs text-slate-500 mb-1">{labels[chave]}</div>
                      <Badge className={ativo ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500'}>
                        {ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Link to="/AdministracaoSistema?tab=integracoes">
                <Button variant="outline" size="sm">Gerenciar Integrações →</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FISCAL */}
        <TabsContent value="fiscal" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Configurações Fiscais Padrão</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CFOP Padrão — Dentro do Estado</Label>
                  <Input defaultValue={getConfig('fiscal_cfop_interno')?.valor || '5102'} placeholder="5102"
                    onBlur={(e) => handleSaveField('fiscal_cfop_interno', 'Fiscal', { valor: e.target.value })} />
                </div>
                <div>
                  <Label>CFOP Padrão — Fora do Estado</Label>
                  <Input defaultValue={getConfig('fiscal_cfop_externo')?.valor || '6102'} placeholder="6102"
                    onBlur={(e) => handleSaveField('fiscal_cfop_externo', 'Fiscal', { valor: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Alíquota ICMS (%)</Label>
                  <Input type="number" defaultValue={getConfig('fiscal_aliq_icms')?.numero || 18} placeholder="18"
                    onBlur={(e) => handleSaveField('fiscal_aliq_icms', 'Fiscal', { numero: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Alíquota PIS (%)</Label>
                  <Input type="number" defaultValue={getConfig('fiscal_aliq_pis')?.numero || 1.65} placeholder="1.65"
                    onBlur={(e) => handleSaveField('fiscal_aliq_pis', 'Fiscal', { numero: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Alíquota COFINS (%)</Label>
                  <Input type="number" defaultValue={getConfig('fiscal_aliq_cofins')?.numero || 7.6} placeholder="7.6"
                    onBlur={(e) => handleSaveField('fiscal_aliq_cofins', 'Fiscal', { numero: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Observações Padrão NF-e</Label>
                <Textarea placeholder="Observações que aparecerão em todas as notas..." rows={2}
                  defaultValue={getConfig('fiscal_obs_nfe')?.valor || ''}
                  onBlur={(e) => handleSaveField('fiscal_obs_nfe', 'Fiscal', { valor: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ia" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-600" />IA & Otimização</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">Módulos de IA configurados em <strong>Administração do Sistema → Tecnologia, IA & Parâmetros</strong>.</p>
              <div className="space-y-2">
                <ToggleRow chave="ia_leitura_projetos" categoria="Sistema" label="IA Leitura de Projetos" desc="Análise automática de projetos de engenharia" permId="Sistema.IA.editar" />
                <ToggleRow chave="ia_preditiva_vendas" categoria="Sistema" label="IA Preditiva de Vendas" desc="Previsão de demanda e churn" permId="Sistema.IA.editar" />
                <ToggleRow chave="ia_conciliacao" categoria="Sistema" label="IA Conciliação Bancária" desc="Conciliação automática de extratos" permId="Sistema.IA.editar" />
                <ToggleRow chave="ia_producao" categoria="Sistema" label="IA Produção" desc="Otimização de ordens de produção" permId="Sistema.IA.editar" />
              </div>
              <Link to={createPageUrl('AdministracaoSistema?tab=ia')}>
                <Button variant="outline" size="sm">Abrir IA & Otimização →</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Notificações Automáticas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <ToggleRow chave="notif_pedido_aprovado" categoria="Notificacoes" label="Pedido Aprovado" desc="Notifica cliente quando pedido for aprovado" permId="Sistema.Configurações.editar" />
              <ToggleRow chave="notif_entrega_transporte" categoria="Notificacoes" label="Entrega Saiu para Transporte" desc="Envia link de rastreamento ao cliente" permId="Sistema.Configurações.editar" />
              <ToggleRow chave="notif_boleto_gerado" categoria="Notificacoes" label="Boleto/PIX Gerado" desc="Envia boleto por WhatsApp e e-mail" permId="Sistema.Configurações.editar" />
              <ToggleRow chave="notif_titulo_vencido" categoria="Notificacoes" label="Título Vencido" desc="Alerta de inadimplência" permId="Sistema.Configurações.editar" />
              <ToggleRow chave="notif_op_atrasada" categoria="Notificacoes" label="OP Atrasada" desc="Alerta para gerente de produção" permId="Sistema.Configurações.editar" />
              <ToggleRow chave="notif_estoque_baixo" categoria="Notificacoes" label="Estoque Baixo" desc="Alerta quando produto abaixo do mínimo" permId="Sistema.Configurações.editar" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGURANÇA */}
        <TabsContent value="seguranca" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Segurança e Auditoria</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <ToggleRow chave="seg_mfa" categoria="Seguranca" label="MFA — Autenticação de Dois Fatores" desc="Obrigatório para administradores" permId="Sistema.Segurança.editar" />
                <ToggleRow chave="seg_logs_completos" categoria="Seguranca" label="Logs de Auditoria Completos" desc="Registra todas as ações críticas" permId="Sistema.Segurança.editar" />
                <ToggleRow chave="seg_bloqueio_tentativas" categoria="Seguranca" label="Bloquear Tentativas Excessivas" desc="Bloqueia após 5 tentativas de login falhas" permId="Sistema.Segurança.editar" />
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium text-sm">Timeout de Sessão (minutos)</p>
                    <p className="text-xs text-slate-500">Logout após inatividade</p>
                  </div>
                  <Input
                    type="number"
                    className="w-20"
                    defaultValue={getConfig('seg_timeout')?.numero || 30}
                    onBlur={(e) => handleSaveField('seg_timeout', 'Seguranca', { numero: Number(e.target.value) || 30 })}
                  />
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 text-sm">Conformidade LGPD</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-700">✓ Logs Ativos</Badge>
                    <Badge className="bg-green-100 text-green-700">✓ Dados Criptografados</Badge>
                    <Badge className="bg-green-100 text-green-700">✓ Auditoria Completa</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}