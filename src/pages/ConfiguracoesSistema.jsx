import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Settings, Zap, Sparkles } from "lucide-react";
import GerenciamentoAcessos from "@/components/sistema/GerenciamentoAcessos";
import LogsAuditoria from "@/components/auditoria/LogsAuditoria";
import ControleEstoqueCompleto from "@/components/estoque/ControleEstoqueCompleto";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConfiguracoesSistema() {
  const [activeTab, setActiveTab] = useState("ia");
  const { empresaAtual, estaNoGrupo } = useContextoVisual();

  const { data: configsIA = [] } = useQuery({
    queryKey: ['configs-ia'],
    queryFn: () => base44.entities.IAConfig.list(),
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurações do Sistema</h1>
        <p className="text-slate-600">Gerenciamento de acessos, auditoria, integrações e controles</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger
            value="ia"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Configuração IA
          </TabsTrigger>

          <TabsTrigger value="config-global" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Configurações Globais
          </TabsTrigger>
          
          <TabsTrigger value="auditoria" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="estoque-avancado" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Estoque Avançado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ia">
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle>Configuração de Inteligência Artificial</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Configure modelos e limites de IA por módulo
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {configsIA.length > 0 ? (
                <div className="space-y-3">
                  {configsIA.map((config) => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{config.modulo} - {config.funcionalidade}</p>
                        <p className="text-sm text-slate-600">
                          Modelo: {config.modelo_base} | Limite: {config.limite_tokens} tokens
                        </p>
                      </div>
                      <Badge className={config.ativo ? 'bg-green-600' : 'bg-slate-600'}>
                        {config.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Sparkles className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma configuração de IA cadastrada</p>
                  <p className="text-sm mt-2">As configurações são criadas automaticamente ao usar funcionalidades IA</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config-global">
          <ConfigGlobal
            empresaId={empresaAtual?.id}
            grupoId={estaNoGrupo ? empresaAtual?.grupo_id : null}
          />
        </TabsContent>

        <TabsContent value="acessos">
          <GerenciamentoAcessos />
        </TabsContent>

        <TabsContent value="auditoria">
          <LogsAuditoria />
        </TabsContent>

        <TabsContent value="estoque-avancado">
          <ControleEstoqueCompleto empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}