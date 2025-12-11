import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusOrigemPedido100 from "@/components/sistema/StatusOrigemPedido100";
import StatusFechamento100V21_6 from "@/components/sistema/STATUS_FECHAMENTO_100_V21_6";
import CertificadoProducaoV21_6 from "@/components/sistema/CERTIFICADO_PRODUCAO_V21_6";
import ChecklistFinalV21_6 from "@/components/sistema/CHECKLIST_FINAL_V21_6";
import Sistema100CompletoFinal from "@/components/sistema/SISTEMA_100_COMPLETO_FINAL";
import { Shield, FileText, Settings, Zap, Sparkles, Wrench, Rocket } from "lucide-react";

import LogsAuditoria from "@/components/auditoria/LogsAuditoria";
import ControleEstoqueCompleto from "@/components/estoque/ControleEstoqueCompleto";
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import DiagnosticoBackend from "@/components/sistema/DiagnosticoBackend";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useWindow } from "@/components/lib/useWindow";
import DashboardFechamentoPedidos from "@/components/comercial/DashboardFechamentoPedidos";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConfiguracoesSistema() {
  const [activeTab, setActiveTab] = useState("ia");
  const { empresaAtual, estaNoGrupo } = useContextoVisual();
  const { openWindow } = useWindow();

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
            value="status-origem"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            ✅ Status Origem V21.6
          </TabsTrigger>

          <TabsTrigger
            value="status-fechamento"
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Rocket className="w-4 h-4 mr-2" />
            🚀 Status Fechamento V21.6
          </TabsTrigger>

          <TabsTrigger
            value="diagnostico"
            className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
          >
            <Wrench className="w-4 h-4 mr-2" />
            🔧 Diagnóstico
          </TabsTrigger>

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

        <TabsContent value="status-origem">
          <div className="space-y-6">
            <CertificadoProducaoV21_6 />
            <StatusOrigemPedido100 />
          </div>
        </TabsContent>

        <TabsContent value="status-fechamento">
          <div className="space-y-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-900">🚀 Dashboard Completo de Fechamento</p>
                  <p className="text-sm text-blue-700">
                    Visualize métricas detalhadas, performance e histórico
                  </p>
                </div>
                <Button
                  onClick={() => openWindow(
                    DashboardFechamentoPedidos,
                    { windowMode: true, empresaId: empresaAtual?.id },
                    {
                      title: '📊 Dashboard Fechamento Automático',
                      width: 1200,
                      height: 700
                    }
                  )}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Abrir Dashboard
                </Button>
              </CardContent>
            </Card>

            <ChecklistFinalV21_6 />
            
            <Sistema100CompletoFinal windowMode={false} empresaId={empresaAtual?.id} />
            
            <StatusFechamento100V21_6 windowMode={false} empresaId={empresaAtual?.id} />
          </div>
        </TabsContent>

        <TabsContent value="diagnostico">
          <div className="space-y-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900">🔧 Diagnóstico do Sistema</CardTitle>
                <p className="text-sm text-yellow-700">
                  Teste se as funcionalidades backend estão ativas (necessário para busca de CNPJ/CPF)
                </p>
              </CardHeader>
            </Card>
            <DiagnosticoBackend />
          </div>
        </TabsContent>

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