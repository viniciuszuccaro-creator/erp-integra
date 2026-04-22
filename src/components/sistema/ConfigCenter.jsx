import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Sparkles, Cloud, Key, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ConfigCenter — usa ConfiguracaoSistema (via upsertConfig) para toggles,
 * evitando o erro 422 de empresa_id obrigatório no GovernancaEmpresa.
 */
export default function ConfigCenter({ empresaId: empresaIdProp }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const eId = empresaIdProp || empresaAtual?.id;
  const gId = grupoAtual?.id;
  const canLoad = Boolean(eId || gId);

  const [saving, setSaving] = useState({});
  const [optimistic, setOptimistic] = useState({});
  const idCacheRef = useRef({});

  useEffect(() => {
    setOptimistic({});
    idCacheRef.current = {};
  }, [eId, gId]);

  // Carrega configs via getEntityRecord (asServiceRole, bypassa wrapper)
  const { data: configs = [], refetch, isFetching } = useQuery({
    queryKey: ['config-center-v2', eId ?? 'sem', gId ?? 'sem'],
    queryFn: async () => {
      const orConds = [];
      if (gId) orConds.push({ group_id: gId });
      if (eId) orConds.push({ empresa_id: eId });
      const filter = orConds.length > 1 ? { $or: orConds } : (orConds[0] || {});
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter,
        limit: 200,
        _bust: Date.now(),
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: canLoad,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  // IA configs para listagem
  const { data: configsIA = [] } = useQuery({
    queryKey: ['configs-ia-geral'],
    queryFn: () => base44.entities.IAConfig.list(),
  });

  const getConfig = (chave) => {
    const list = (configs || []).filter(c => c.chave === chave);
    if (!list.length) return null;
    if (eId && gId) { const x = list.find(c => c.empresa_id === eId && c.group_id === gId); if (x) return x; }
    if (eId) { const x = list.find(c => c.empresa_id === eId); if (x) return x; }
    if (gId) { const x = list.find(c => c.group_id === gId); if (x) return x; }
    return list[0];
  };

  const getToggle = (chave) => {
    if (chave in optimistic) return optimistic[chave];
    const rec = getConfig(chave);
    return typeof rec?.ativa === 'boolean' ? rec.ativa : false;
  };

  const getScope = () => {
    const s = {};
    if (gId) s.group_id = gId;
    if (eId) s.empresa_id = eId;
    return s;
  };

  const handleToggle = async (chave, categoria, newValue) => {
    if (saving[chave]) return;
    setOptimistic(prev => ({ ...prev, [chave]: newValue }));
    setSaving(prev => ({ ...prev, [chave]: true }));
    try {
      const cachedId = idCacheRef.current[chave];
      const payload = cachedId
        ? { id: cachedId, chave, data: { chave, categoria, ativa: newValue }, scope: getScope() }
        : { chave, data: { chave, categoria, ativa: newValue }, scope: getScope() };
      const res = await base44.functions.invoke('upsertConfig', payload);
      const retId = res?.data?.id || res?.data?.record?.id;
      if (retId) idCacheRef.current[chave] = retId;

      await new Promise(r => setTimeout(r, 600));
      await queryClient.invalidateQueries({ queryKey: ['config-center-v2'] });
      const result = await refetch();
      const freshRecs = Array.isArray(result?.data) ? result.data : [];
      const saved = freshRecs.find(c => c.chave === chave && eId && c.empresa_id === eId)
        || freshRecs.find(c => c.chave === chave && gId && c.group_id === gId)
        || freshRecs.find(c => c.chave === chave);
      const confirmed = saved && typeof saved.ativa === 'boolean' ? saved.ativa : newValue;
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
      toast({ title: `✅ ${confirmed ? 'Ativado' : 'Desativado'} com sucesso!` });
    } catch (err) {
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
      toast({ title: '❌ Erro ao salvar', description: String(err?.message || err), variant: 'destructive' });
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  };

  const ToggleRow = ({ chave, categoria, label, desc }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        {desc && <p className="text-sm text-slate-600">{desc}</p>}
      </div>
      <Switch
        checked={getToggle(chave)}
        disabled={!!saving[chave] || isFetching}
        onCheckedChange={(v) => handleToggle(chave, categoria, v)}
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

  const modulosIA = configsIA.reduce((acc, c) => {
    if (!acc[c.modulo]) acc[c.modulo] = [];
    acc[c.modulo].push(c);
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
          <p className="text-sm text-slate-600 mt-1">Gerencie todas as configurações do sistema em um só lugar</p>
        </CardHeader>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => { queryClient.invalidateQueries({ queryKey: ['config-center-v2'] }); refetch(); }}>
          🔄 Atualizar
        </Button>
      </div>

      <Tabs defaultValue="seguranca" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="seguranca"><Key className="w-4 h-4 mr-2" />Segurança</TabsTrigger>
          <TabsTrigger value="ia"><Sparkles className="w-4 h-4 mr-2" />Inteligência Artificial</TabsTrigger>
          <TabsTrigger value="backup"><Cloud className="w-4 h-4 mr-2" />Backup & Logs</TabsTrigger>
        </TabsList>

        {/* Tab Segurança */}
        <TabsContent value="seguranca">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ToggleRow chave="cc_auditoria_automatica" categoria="Seguranca" label="Auditoria Automática" desc="Registra todas as ações dos usuários automaticamente" />
              <ToggleRow chave="cc_ia_seguranca_ativa" categoria="Seguranca" label="IA de Segurança" desc="Detecta anomalias e comportamentos suspeitos" />
              <ToggleRow chave="cc_exigir_mfa" categoria="Seguranca" label="Autenticação de Dois Fatores (MFA)" desc="Exige verificação adicional no login" />
              <ToggleRow chave="cc_bloquear_ips_suspeitos" categoria="Seguranca" label="Bloquear IPs Suspeitos" desc="Bloqueia automaticamente IPs com comportamento anômalo" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab IA */}
        <TabsContent value="ia">
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />Módulos de IA Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <ToggleRow chave="cc_ia_preditiva_vendas" categoria="Sistema" label="IA Preditiva de Vendas" desc="Previsão de demanda e churn de clientes" />
              <ToggleRow chave="cc_ia_conciliacao" categoria="Sistema" label="IA Conciliação Bancária" desc="Conciliação automática de extratos" />
              <ToggleRow chave="cc_ia_producao" categoria="Sistema" label="IA Produção" desc="Otimização de ordens de produção" />
              <ToggleRow chave="cc_ia_leitura_projetos" categoria="Sistema" label="IA Leitura de Projetos" desc="Análise automática de projetos de engenharia" />

              {Object.keys(modulosIA).length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Configurações por Módulo (IAConfig)</p>
                  {Object.entries(modulosIA).map(([modulo, cfgs]) => (
                    <div key={modulo} className="p-4 border rounded-lg">
                      <p className="font-semibold mb-2 text-sm">{modulo}</p>
                      <div className="space-y-1">
                        {cfgs.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                            <div>
                              <p className="font-medium">{c.funcionalidade}</p>
                              <p className="text-xs text-slate-600">Modelo: {c.modelo_base} | Limite: {c.limite_tokens} tokens</p>
                            </div>
                            <Badge className={c.ativo ? 'bg-green-600' : 'bg-slate-600'}>{c.ativo ? 'Ativo' : 'Inativo'}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
            <CardContent className="p-6 space-y-4">
              <ToggleRow chave="cc_backup_automatico" categoria="Sistema" label="Backup Automático Diário" desc="Backup incremental de todas as entidades" />
              <ToggleRow chave="cc_criptografia_dados" categoria="Seguranca" label="Criptografia de Dados Sensíveis" desc="Criptografa CPF, CNPJ e salários (AES-256)" />

              {getConfig('cc_backup_automatico')?.updated_date && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Backup configurado com sucesso
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Última atualização: {new Date(getConfig('cc_backup_automatico').updated_date).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}