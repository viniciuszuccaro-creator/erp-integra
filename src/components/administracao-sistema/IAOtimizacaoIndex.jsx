import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import IAPanel from "@/components/administracao-sistema/configuracoes-gerais/IAPanel";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import { Brain, Zap, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToggleConfig } from "@/components/lib/useToggleConfig";
import ToggleRow from "@/components/sistema/ToggleRow";

export default function IAOtimizacaoIndex({ initialTab }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { user } = useUser();
  const [tab, setTab] = React.useState(initialTab || 'ia');

  const eId = empresaAtual?.id;
  const gId = grupoAtual?.id;

  const iaQueryKey = ['config-ia-toggles', eId ?? 'sem', gId ?? 'sem'];

  const { data: configsToggle = [], isFetching: isFetchingToggle } = useQuery({
    queryKey: iaQueryKey,
    queryFn: async () => {
      const orConds = [];
      if (gId && eId) orConds.push({ group_id: gId, empresa_id: eId });
      if (eId) orConds.push({ empresa_id: eId });
      if (gId) orConds.push({ group_id: gId });
      try {
        const res = await base44.functions.invoke('getEntityRecord', {
          entityName: 'ConfiguracaoSistema',
          filter: orConds.length > 1 ? { $or: orConds } : (orConds[0] || {}),
          limit: 200,
          sortField: '-updated_date',
        });
        return Array.isArray(res?.data) ? res.data : [];
      } catch (_) { return []; }
    },
    enabled: !!(eId || gId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  const { saving, handleToggle, getToggleValue } = useToggleConfig(eId, gId, iaQueryKey);
  const queryClient = useQueryClient();

  // Subscription em tempo real: refetch quando ConfiguracaoSistema muda em outro contexto
  React.useEffect(() => {
    const unsub = base44.entities.ConfiguracaoSistema.subscribe((evt) => {
      if (evt.type === 'create' || evt.type === 'update') {
        const d = evt.data || {};
        const relevante = (eId && d.empresa_id === eId) || (gId && d.group_id === gId);
        if (relevante) queryClient.invalidateQueries({ queryKey: iaQueryKey, exact: true });
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [eId, gId]);

  // IAToggleRow agora usa o ToggleRow compartilhado com accentColor purple
  const IAToggleRow = ({ chave, label, desc }) => (
    <ToggleRow
      configs={configsToggle}
      chave={chave}
      categoria="Sistema"
      label={label}
      desc={desc}
      saving={saving}
      isFetching={isFetchingToggle}
      onToggle={handleToggle}
      getToggleValue={getToggleValue}
      accentColor="purple"
    />
  );

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        acao: 'Visualização',
        modulo: 'Sistema',
        tipo_auditoria: 'ui',
        entidade: 'IA e Otimização',
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
  };

  React.useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);

  const { data: configsIA = [] } = useQuery({
    queryKey: ['configs-ia'],
    queryFn: () => base44.entities.IAConfig.list('-created_date', 9999),
  });

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2 h-auto">
          <TabsTrigger value="ia"><Brain className="w-4 h-4 mr-2" /> IA e Modelos</TabsTrigger>
          <TabsTrigger value="otimizacao"><Zap className="w-4 h-4 mr-2" /> Otimização</TabsTrigger>
        </TabsList>

        <TabsContent value="ia" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4 grid grid-cols-1 2xl:grid-cols-2 gap-6 items-start">
              <div className="col-span-full space-y-2">
                <ContextoConfigBanner />
                <HerancaConfigNotice />
              </div>
              <div className="col-span-full">
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-sm text-cyan-800">
                  💡 <strong>APIs Externas, Webhooks e Chatbot Intents</strong> estão centralizados em <strong>Cadastros Gerais → Tecnologia, IA & Parâmetros</strong>.
                </div>
              </div>

              <div className="col-span-full 2xl:col-span-1 space-y-3">
                <IAPanel />
                {/* Toggles de IA por módulo — centralizados aqui (removidos do ConfigGlobal) */}
                <Card>
                  <CardHeader className="bg-purple-50 border-b pb-3 pt-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      Ativar/Desativar IA por Módulo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {(eId || gId) ? (
                      <>
                        <IAToggleRow chave="ia_leitura_projetos" label="IA Leitura de Projetos" desc="Análise automática de projetos de engenharia" />
                        <IAToggleRow chave="ia_preditiva_vendas" label="IA Preditiva de Vendas" desc="Previsão de demanda e detecção de churn" />
                        <IAToggleRow chave="ia_conciliacao" label="IA Conciliação Bancária" desc="Conciliação automática de extratos" />
                        <IAToggleRow chave="ia_producao" label="IA Produção" desc="Otimização de ordens de produção" />
                        <IAToggleRow chave="ia_recomendacao_produtos" label="IA Recomendação de Produtos" desc="Sugestões inteligentes no checkout" />
                        <IAToggleRow chave="ia_anomalia_financeira" label="IA Detector de Anomalias Financeiras" desc="Detecta pagamentos suspeitos e duplicados" />
                      </>
                    ) : (
                      <p className="text-xs text-amber-700 p-2 bg-amber-50 rounded border border-amber-200">
                        ⚠️ Selecione empresa ou grupo para configurar os toggles de IA.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="col-span-full 2xl:col-span-1">
                <CardHeader className="bg-purple-50 border-b">
                  <CardTitle className="text-base flex items-center gap-2"><Brain className="w-5 h-5 text-purple-600" /> Configurações por Módulo</CardTitle>
                </CardHeader>
                <CardContent className="p-4 max-h-80 overflow-y-auto">
                  {configsIA.length > 0 ? (
                    <div className="space-y-2">
                      {configsIA.map((cfg) => (
                        <div key={cfg.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-semibold text-sm">{cfg.modulo} • {cfg.funcionalidade}</p>
                            <p className="text-xs text-slate-500">Modelo: {cfg.modelo_base} • Limite: {cfg.limite_tokens} tokens</p>
                          </div>
                          <Badge className={cfg.ativo ? 'bg-green-600' : 'bg-slate-600'}>
                            {cfg.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-500">
                      <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Nenhuma configuração de IA cadastrada ainda.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="otimizacao" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center py-10 text-slate-500 border rounded-lg">
                  <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">Nenhuma otimização ativa no momento</p>
                  <p className="text-sm mt-1">Ative PriceBrain e ChurnDetection nos módulos e defina modelos na aba “IA e Modelos”.</p>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-700 font-medium">Como começar</p>
                  <ul className="mt-2 list-disc list-inside text-sm text-slate-600 space-y-1">
                    <li>Acesse IA e Modelos e selecione o modelo base</li>
                    <li>Habilite otimizações por módulo conforme a necessidade</li>
                    <li>Monitore resultados na Auditoria e Logs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}