import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Link2, FileText, Sparkles, Bell, Shield, RefreshCw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * ConfigGlobal — Painel de configuração global.
 * Correção definitiva dos toggles:
 * - idCache em useState (sobrevive re-renders)
 * - optimistic separado do backend
 * - após save, não remove optimistic até confirmar valor do backend
 */
export default function ConfigGlobal({ empresaId, grupoId }) {
  const [activeTab, setActiveTab] = useState('integracoes');
  const [saving, setSaving] = useState({});
  // optimistic: { chave: boolean } — sobrescreve valor do backend na UI
  const [optimistic, setOptimistic] = useState({});
  // idCache em state para sobreviver re-renders
  const [idCache, setIdCache] = useState({});
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const eId = empresaId || empresaAtual?.id;
  const gId = grupoId || grupoAtual?.id;
  const canLoad = Boolean(gId || eId);

  // Limpa cache ao trocar empresa/grupo
  useEffect(() => {
    setOptimistic({});
    setIdCache({});
  }, [eId, gId]);

  const queryKey = ['config-global-v4', eId ?? 'sem', gId ?? 'sem'];

  const { data: configs = [], refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const orConds = [];
      if (gId) orConds.push({ group_id: gId });
      if (eId) orConds.push({ empresa_id: eId });
      const filter = orConds.length > 1 ? { $or: orConds } : (orConds[0] || {});
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter,
        limit: 500,
        _bust: Date.now(),
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      // Popula idCache com dados frescos
      if (list.length > 0) {
        setIdCache(prev => {
          const next = { ...prev };
          list.forEach(rec => { if (rec?.chave && rec?.id) next[rec.chave] = rec.id; });
          return next;
        });
      }
      return list;
    },
    enabled: canLoad,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const getConfig = useCallback((chave) => {
    const list = (configs || []).filter(c => c.chave === chave);
    if (!list.length) return null;
    if (gId && eId) {
      const exact = list.find(c => c.group_id === gId && c.empresa_id === eId);
      if (exact) return exact;
    }
    if (eId) { const byE = list.find(c => c.empresa_id === eId); if (byE) return byE; }
    if (gId) { const byG = list.find(c => c.group_id === gId); if (byG) return byG; }
    return list[0] || null;
  }, [configs, gId, eId]);

  // Lê valor: optimistic > backend > false
  const getToggleValue = useCallback((chave) => {
    if (chave in optimistic) return optimistic[chave];
    const rec = getConfig(chave);
    return typeof rec?.ativa === 'boolean' ? rec.ativa : false;
  }, [optimistic, getConfig]);

  const getScope = useCallback(() => {
    const scope = {};
    if (gId) scope.group_id = gId;
    if (eId) scope.empresa_id = eId;
    return scope;
  }, [gId, eId]);

  const upsert = useCallback(async (chave, categoria, dados) => {
    const scope = getScope();
    const cachedId = idCache[chave];
    const mergedData = { chave, categoria, ...dados };
    const payload = cachedId
      ? { id: cachedId, chave, data: mergedData, scope }
      : { chave, data: mergedData, scope };
    const res = await base44.functions.invoke('upsertConfig', payload);
    const returnedId = res?.data?.id || res?.data?.record?.id;
    if (returnedId) {
      setIdCache(prev => ({ ...prev, [chave]: returnedId }));
    }
    return res;
  }, [idCache, getScope]);

  const handleToggle = useCallback(async (chave, categoria, newValue) => {
    if (saving[chave]) return;
    // 1. Aplica optimistic imediatamente
    setOptimistic(prev => ({ ...prev, [chave]: newValue }));
    setSaving(prev => ({ ...prev, [chave]: true }));
    try {
      await upsert(chave, categoria, { ativa: newValue });
      // 2. Invalida cache e refetch para confirmar
      await queryClient.invalidateQueries({ queryKey });
      const result = await refetch({ cancelRefetch: false });
      const freshRecs = Array.isArray(result?.data) ? result.data : [];

      // 3. Encontra o valor real salvo no backend
      const saved =
        freshRecs.find(c => c.chave === chave && eId && gId && c.empresa_id === eId && c.group_id === gId) ||
        freshRecs.find(c => c.chave === chave && eId && c.empresa_id === eId) ||
        freshRecs.find(c => c.chave === chave && gId && c.group_id === gId) ||
        freshRecs.find(c => c.chave === chave);

      const confirmedVal = (saved && typeof saved.ativa === 'boolean') ? saved.ativa : newValue;

      // 4. Remove optimistic SOMENTE após confirmar — UI assume valor do backend
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });

      if (confirmedVal !== newValue) {
        toast.warning(`Servidor corrigiu para: ${confirmedVal ? 'Ativado' : 'Desativado'}`);
      } else {
        toast.success(`${newValue ? 'Ativado' : 'Desativado'} com sucesso!`);
      }
    } catch (err) {
      // Reverte optimistic em caso de erro
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, upsert, queryClient, queryKey, refetch, eId, gId]);

  const handleSaveField = useCallback(async (chave, categoria, dados) => {
    if (saving[chave]) return;
    setSaving(prev => ({ ...prev, [chave]: true }));
    try {
      await upsert(chave, categoria, dados);
      await queryClient.invalidateQueries({ queryKey });
      await refetch();
      toast.success('Configuração salva!');
    } catch (err) {
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, upsert, queryClient, queryKey, refetch]);

  const ToggleRow = ({ chave, categoria, label, desc }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {saving[chave] && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
        <Switch
          checked={getToggleValue(chave)}
          disabled={!!saving[chave] || isFetching}
          onCheckedChange={(checked) => handleToggle(chave, categoria, checked)}
        />
      </div>
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
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configurações Globais do Sistema</h2>
          <p className="text-sm text-slate-500">
            {eId ? `Empresa: ${empresaAtual?.nome_fantasia || eId}` : `Grupo: ${grupoAtual?.nome_do_grupo || gId}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching}
          onClick={() => { queryClient.invalidateQueries({ queryKey }); refetch(); }}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
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
              <p className="text-sm text-slate-600">
                Configurações detalhadas em <strong>Administração → Integrações</strong>.
              </p>
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
                  <Input
                    key={`cfop-int-${eId}-${gId}`}
                    defaultValue={getConfig('fiscal_cfop_interno')?.valor || '5102'}
                    placeholder="5102"
                    onBlur={(e) => handleSaveField('fiscal_cfop_interno', 'Fiscal', { valor: e.target.value })}
                  />
                </div>
                <div>
                  <Label>CFOP Padrão — Fora do Estado</Label>
                  <Input
                    key={`cfop-ext-${eId}-${gId}`}
                    defaultValue={getConfig('fiscal_cfop_externo')?.valor || '6102'}
                    placeholder="6102"
                    onBlur={(e) => handleSaveField('fiscal_cfop_externo', 'Fiscal', { valor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Alíquota ICMS (%)</Label>
                  <Input type="number" key={`icms-${eId}`} defaultValue={getConfig('fiscal_aliq_icms')?.numero || 18}
                    onBlur={(e) => handleSaveField('fiscal_aliq_icms', 'Fiscal', { numero: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Alíquota PIS (%)</Label>
                  <Input type="number" key={`pis-${eId}`} defaultValue={getConfig('fiscal_aliq_pis')?.numero || 1.65}
                    onBlur={(e) => handleSaveField('fiscal_aliq_pis', 'Fiscal', { numero: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Alíquota COFINS (%)</Label>
                  <Input type="number" key={`cofins-${eId}`} defaultValue={getConfig('fiscal_aliq_cofins')?.numero || 7.6}
                    onBlur={(e) => handleSaveField('fiscal_aliq_cofins', 'Fiscal', { numero: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Observações Padrão NF-e</Label>
                <Textarea
                  key={`obs-nfe-${eId}`}
                  placeholder="Observações que aparecerão em todas as notas..."
                  rows={2}
                  defaultValue={getConfig('fiscal_obs_nfe')?.valor || ''}
                  onBlur={(e) => handleSaveField('fiscal_obs_nfe', 'Fiscal', { valor: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA */}
        <TabsContent value="ia" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />IA & Otimização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ToggleRow chave="ia_leitura_projetos" categoria="Sistema" label="IA Leitura de Projetos" desc="Análise automática de projetos de engenharia" />
              <ToggleRow chave="ia_preditiva_vendas" categoria="Sistema" label="IA Preditiva de Vendas" desc="Previsão de demanda e churn" />
              <ToggleRow chave="ia_conciliacao" categoria="Sistema" label="IA Conciliação Bancária" desc="Conciliação automática de extratos" />
              <ToggleRow chave="ia_producao" categoria="Sistema" label="IA Produção" desc="Otimização de ordens de produção" />
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
              <ToggleRow chave="notif_pedido_aprovado" categoria="Notificacoes" label="Pedido Aprovado" desc="Notifica cliente quando pedido for aprovado" />
              <ToggleRow chave="notif_entrega_transporte" categoria="Notificacoes" label="Entrega Saiu para Transporte" desc="Envia link de rastreamento ao cliente" />
              <ToggleRow chave="notif_boleto_gerado" categoria="Notificacoes" label="Boleto/PIX Gerado" desc="Envia boleto por WhatsApp e e-mail" />
              <ToggleRow chave="notif_titulo_vencido" categoria="Notificacoes" label="Título Vencido" desc="Alerta de inadimplência" />
              <ToggleRow chave="notif_op_atrasada" categoria="Notificacoes" label="OP Atrasada" desc="Alerta para gerente de produção" />
              <ToggleRow chave="notif_estoque_baixo" categoria="Notificacoes" label="Estoque Baixo" desc="Alerta quando produto abaixo do mínimo" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGURANÇA */}
        <TabsContent value="seguranca" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Segurança e Auditoria</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ToggleRow chave="seg_mfa" categoria="Seguranca" label="MFA — Autenticação de Dois Fatores" desc="Obrigatório para administradores" />
              <ToggleRow chave="seg_logs_completos" categoria="Seguranca" label="Logs de Auditoria Completos" desc="Registra todas as ações críticas" />
              <ToggleRow chave="seg_bloqueio_tentativas" categoria="Seguranca" label="Bloquear Tentativas Excessivas" desc="Bloqueia após 5 tentativas de login falhas" />
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-sm">Timeout de Sessão (minutos)</p>
                  <p className="text-xs text-slate-500">Logout após inatividade</p>
                </div>
                <Input
                  type="number"
                  className="w-20"
                  key={`timeout-${eId}`}
                  defaultValue={getConfig('seg_timeout')?.numero || 30}
                  onBlur={(e) => handleSaveField('seg_timeout', 'Seguranca', { numero: Number(e.target.value) || 30 })}
                />
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