import React, { useState, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChecklistFinalV21_6 from "@/components/sistema/CHECKLIST_FINAL_V21_6";
import Sistema100CompletoFinal from "@/components/sistema/SISTEMA_100_COMPLETO_FINAL";
import ValidacaoFinalTotalV21_6 from "@/components/sistema/VALIDACAO_FINAL_TOTAL_V21_6";
import MasterDashboardV21_6 from "@/components/sistema/MASTER_DASHBOARD_V21_6";
import { Shield, Settings, Wrench } from "lucide-react";

import ControleEstoqueCompleto from "@/components/estoque/ControleEstoqueCompleto";

import DiagnosticoBackend from "@/components/sistema/DiagnosticoBackend";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useWindow } from "@/components/lib/useWindow";
import DashboardFechamentoPedidos from "@/components/comercial/DashboardFechamentoPedidos";


import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/lib/ErrorBoundary";

export default function ConfiguracoesSistema() {
  const [activeTab, setActiveTab] = useState("diagnostico");
  const { empresaAtual, estaNoGrupo } = useContextoVisual();
  const { openWindow } = useWindow();



  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurações do Sistema</h1>
        <p className="text-slate-600">Gerenciamento de acessos, auditoria, integrações e controles</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Configurações centralizadas em Cadastros Gerais</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-blue-700">
            Integrações, IA e Configurações Globais agora estão no módulo Cadastros Gerais ▸ Bloco 6 ▸ Integrações & IA.
          </p>
          <Button className="w-fit bg-blue-600 hover:bg-blue-700" onClick={() => (window.location.href = createPageUrl('Cadastros'))}>
            Ir para Cadastros Gerais
          </Button>
        </CardContent>
      </Card>

      <ErrorBoundary>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger
            value="diagnostico"
            className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
          >
            <Wrench className="w-4 h-4 mr-2" />
            🔧 Diagnóstico
          </TabsTrigger>




          
          <TabsTrigger value="estoque-avancado" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Estoque Avançado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostico">
          <Suspense fallback={<div className="p-4 text-slate-500">Carregando…</div>}>
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
          </Suspense>
        </TabsContent>





        

        <TabsContent value="estoque-avancado">
          <ControleEstoqueCompleto empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>
      </ErrorBoundary>
    </div>
  );
}