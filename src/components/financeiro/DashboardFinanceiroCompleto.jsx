import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Upload, Link2, Shield, FileText, Sparkles } from "lucide-react";
import AnalisadorRecebimentosIA from "./AnalisadorRecebimentosIA";
import AnalisadorPagamentosIA from "./AnalisadorPagamentosIA";
import PrevisaoFluxoCaixaIA from "./PrevisaoFluxoCaixaIA";
import ConciliadorAutomaticoFinanceiro from "./ConciliadorAutomaticoFinanceiro";
import DetectorAnomaliasFiscais from "./DetectorAnomaliasFiscais";
import ImportadorContasEmMassa from "./ImportadorContasEmMassa";
import RelatorioFinanceiroAvancado from "./RelatorioFinanceiroAvancado";

export default function DashboardFinanceiroCompleto({ windowMode = false }) {
  const [activeTab, setActiveTab] = useState("analise-receber");

  return (
    <div className={`bg-gradient-to-br from-slate-50 to-blue-50 ${windowMode ? 'w-full h-full' : 'min-h-screen p-6'}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <div className={windowMode ? 'p-4' : ''}>
          <TabsList className="grid w-full grid-cols-7 mb-4">
            <TabsTrigger value="analise-receber" className="text-xs">
              <TrendingUp className="w-4 h-4 mr-1" />
              Análise Receber
            </TabsTrigger>
            <TabsTrigger value="analise-pagar" className="text-xs">
              <TrendingUp className="w-4 h-4 mr-1" />
              Análise Pagar
            </TabsTrigger>
            <TabsTrigger value="previsao" className="text-xs">
              <Sparkles className="w-4 h-4 mr-1" />
              Previsão IA
            </TabsTrigger>
            <TabsTrigger value="conciliador" className="text-xs">
              <Link2 className="w-4 h-4 mr-1" />
              Conciliador
            </TabsTrigger>
            <TabsTrigger value="anomalias" className="text-xs">
              <Shield className="w-4 h-4 mr-1" />
              Anomalias
            </TabsTrigger>
            <TabsTrigger value="importar" className="text-xs">
              <Upload className="w-4 h-4 mr-1" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs">
              <FileText className="w-4 h-4 mr-1" />
              Relatórios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="analise-receber" className="m-0">
          <AnalisadorRecebimentosIA />
        </TabsContent>

        <TabsContent value="analise-pagar" className="m-0">
          <AnalisadorPagamentosIA />
        </TabsContent>

        <TabsContent value="previsao" className="m-0">
          <PrevisaoFluxoCaixaIA />
        </TabsContent>

        <TabsContent value="conciliador" className="m-0">
          <ConciliadorAutomaticoFinanceiro />
        </TabsContent>

        <TabsContent value="anomalias" className="m-0">
          <DetectorAnomaliasFiscais />
        </TabsContent>

        <TabsContent value="importar" className="m-0">
          <ImportadorContasEmMassa />
        </TabsContent>

        <TabsContent value="relatorios" className="m-0">
          <RelatorioFinanceiroAvancado />
        </TabsContent>
      </Tabs>
    </div>
  );
}