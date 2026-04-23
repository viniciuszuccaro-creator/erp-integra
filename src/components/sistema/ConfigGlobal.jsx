import React, { useState, useCallback } from 'react';
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
import { FileText, Bell, Shield, RefreshCw, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
// Shield mantido para uso em atalho de Integrações
import { Textarea } from '@/components/ui/textarea';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToggleConfig } from '@/components/lib/useToggleConfig';

/**
 * ConfigGlobal — Painel de configuração global.
 * Consolidado: Remove abas Integrações e IA (existem em telas dedicadas).
 * Mantém: Fiscal, Notificações, Segurança.
 * Toggles corrigidos com optimistic UI + confirmação backend.
 */
export default function ConfigGlobal({ empresaId, grupoId }) {
  const [activeTab, setActiveTab] = useState('fiscal');
  const [savingField, setSavingField] = useState({});
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const eId = empresaId || empresaAtual?.id;
  const gId = grupoId || grupoAtual?.id;
  const canLoad = Boolean(gId || eId);

  const queryClient = useQueryClient();
  const queryKey = ['config-global', eId ?? 'sem', gId ?? 'sem'];
  const { saving, handleToggle, getToggleValue, syncWithQueryData } = useToggleConfig(eId, gId, queryKey);

  const { data: configs = [], refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const api = base44.asServiceRole?.entities?.ConfiguracaoSistema
        ?? base44.entities.ConfiguracaoSistema;
      const orConds = [];
      if (gId) orConds.push({ group_id: gId });
      if (eId) orConds.push({ empresa_id: eId });
      const filter = orConds.length > 1 ? { $or: orConds } : (orConds[0] || {});
      try {
        const rows = await api.filter(filter, '-updated_date', 500);
        return Array.isArray(rows) ? rows : [];
      } catch (_) {
        return [];
      }
    },
    enabled: canLoad,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // syncWithQueryData é NO-OP v6 — não precisa mais ser chamado aqui

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

  const handleSaveField = useCallback(async (chave, categoria, dados) => {
    if (savingField[chave]) return;
    setSavingField(prev => ({ ...prev, [chave]: true }));
    try {
      const scope = { ...(gId && { group_id: gId }), ...(eId && { empresa_id: eId }) };
      await base44.functions.invoke('upsertConfig', {
        chave,
        data: { chave, categoria, ...dados },
        scope
      });
      queryClient.removeQueries({ queryKey, exact: true });
      await queryClient.refetchQueries({ queryKey, exact: true });
      toast.success('✅ Configuração salva!');
    } catch (err) {
      toast.error('Erro: ' + String(err?.message || err));
    } finally {
      setSavingField(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [savingField, queryClient, queryKey, gId, eId]);

  const ToggleRow = ({ chave, categoria, label, desc }) => {
    const val = getToggleValue(configs, chave);
    const isSaving = !!saving[chave];
    return (
      <div className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${isSaving ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}>
        <div className="flex-1 min-w-0 mr-3">
          <p className="font-medium text-sm">{label}</p>
          {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isSaving && <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />}
          <Badge className={val ? 'bg-green-100 text-green-700 border-green-200 text-[10px]' : 'bg-slate-100 text-slate-500 text-[10px]'}>
            {isSaving ? 'Salvando…' : val ? 'Ativo' : 'Inativo'}
          </Badge>
          <Switch
            checked={val}
            disabled={isSaving || isFetching}
            onCheckedChange={(checked) => handleToggle(chave, categoria, checked)}
          />
        </div>
      </div>
    );
  };

  if (!canLoad) {
    return (
      <div className="p-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
        ⚠️ Selecione uma empresa ou grupo para carregar as configurações.
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Header com contexto e refresh */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Parâmetros Globais</h2>
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
          {isFetching ? 'Atualizando…' : 'Atualizar'}
        </Button>
      </div>

      {/* Atalhos para telas dedicadas — REMOVIDOS: Integrações já estão em aba separada em AdminTabs */}
      {/* Mantém referência rápida via link, mas não duplica abas */}

      {/* Abas consolidadas: apenas Fiscal, Notificações e Segurança */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <div className="overflow-x-auto">
           <TabsList className="inline-flex flex-nowrap min-w-max bg-white border shadow-sm">
             <TabsTrigger value="fiscal"><FileText className="w-4 h-4 mr-1.5" />Fiscal</TabsTrigger>
             <TabsTrigger value="notificacoes"><Bell className="w-4 h-4 mr-1.5" />Notificações</TabsTrigger>
           </TabsList>
         </div>

        {/* FISCAL */}
        <TabsContent value="fiscal" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" />Configurações Fiscais Padrão</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              {/* Status fiscal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
                {[
                  { chave: 'integracao_nfe', label: 'NF-e' },
                  { chave: 'integracao_boletos', label: 'Boleto/PIX' },
                  { chave: 'integracao_maps', label: 'Google Maps' },
                  { chave: 'integracao_whatsapp', label: 'WhatsApp' },
                ].map(({ chave, label }) => {
                  const rec = getConfig(chave);
                  const sub = rec?.[chave];
                  const ativo = !!(sub?.ativa || sub?.api_key);
                  return (
                    <div key={chave} className="p-3 border rounded-lg bg-white">
                      <div className="text-xs text-slate-500 mb-1">{label}</div>
                      <div className="flex items-center gap-1">
                        {ativo
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                        <Badge className={ativo ? 'bg-green-100 text-green-700 border-green-200 text-[10px]' : 'bg-slate-100 text-slate-500 text-[10px]'}>
                          {ativo ? 'Ativo' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" />Notificações Automáticas</CardTitle></CardHeader>
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


      </Tabs>
    </div>
  );
}