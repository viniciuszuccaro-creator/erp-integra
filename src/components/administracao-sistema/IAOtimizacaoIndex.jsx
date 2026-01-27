import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import IAPanel from "@/components/administracao-sistema/configuracoes-gerais/IAPanel";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import { Brain, Zap, Settings } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery } from "@tanstack/react-query";

export default function IAOtimizacaoIndex({ initialTab }) {
  const { empresaAtual } = useContextoVisual();
  const { user } = useUser();
  const [tab, setTab] = React.useState(initialTab || 'ia');

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        acao: 'Visualização',
        modulo: 'Sistema',
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
          <TabsTrigger value="governanca"><Settings className="w-4 h-4 mr-2" /> Governança IA</TabsTrigger>
        </TabsList>

        <TabsContent value="ia" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <IAPanel />

              <Card>
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
              <div className="text-center py-10 text-slate-500">
                <Zap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Nenhuma configuração de otimização cadastrada ainda.</p>
                <p className="text-sm">Utilize os módulos de IA para configurar otimizações.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governanca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              {/* Conteúdos de governança de IA (auditoria, compliance) já existentes são referenciados nas demais telas */}
              <p className="text-sm text-slate-600">Governança de IA: políticas, auditoria e conformidade.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}