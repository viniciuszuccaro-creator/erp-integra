import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, TrendingUp, Brain, Link2, 
  FileSpreadsheet, BarChart3, Sparkles 
} from "lucide-react";
import { useWindow } from "@/components/lib/useWindow";
import ContasReceberTab from "./ContasReceberTab";
import ContasPagarTab from "./ContasPagarTab";
import IAAnaliseInadimplencia from "./IAAnaliseInadimplencia";
import ConciliacaoAutomaticaIA from "./ConciliacaoAutomaticaIA";
import DashboardFinanceiroAvancado from "./DashboardFinanceiroAvancado";
import PrevisaoFluxoCaixaIA from "./PrevisaoFluxoCaixaIA";
import ImportacaoLoteFinanceiro from "./ImportacaoLoteFinanceiro";
import RenegociacaoInteligente from "./RenegociacaoInteligente";

export default function GestaoFinanceiraUnificada() {
  const { openWindow } = useWindow();
  const [abaAtiva, setAbaAtiva] = useState("receber");

  const { data: contasReceber = [], isLoading: loadingReceber } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [], isLoading: loadingPagar } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  if (loadingReceber || loadingPagar) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-blue-600" />
            Gestão Financeira Unificada
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Contas a Receber, Contas a Pagar, IA e Conciliação Automática
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => openWindow(ImportacaoLoteFinanceiro, {
              tipo: abaAtiva === 'receber' ? 'receber' : 'pagar',
              windowMode: true
            }, {
              title: `📊 Importação em Lote - ${abaAtiva === 'receber' ? 'Receber' : 'Pagar'}`,
              width: 800,
              height: 600
            })}
            variant="outline"
            size="sm"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Importar Lote
          </Button>
        </div>
      </div>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="receber" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Contas a Receber
          </TabsTrigger>
          <TabsTrigger value="pagar" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 rotate-180" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="ia-inadimplencia" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            IA Inadimplência
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Conciliação IA
          </TabsTrigger>
          <TabsTrigger value="previsao" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Previsão IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receber" className="mt-6">
          <ContasReceberTab contas={contasReceber} empresas={empresas} />
        </TabsContent>

        <TabsContent value="pagar" className="mt-6">
          <ContasPagarTab contas={contasPagar} />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardFinanceiroAvancado 
            contasReceber={contasReceber} 
            contasPagar={contasPagar} 
          />
        </TabsContent>

        <TabsContent value="ia-inadimplencia" className="mt-6">
          <IAAnaliseInadimplencia contasReceber={contasReceber} />
        </TabsContent>

        <TabsContent value="conciliacao" className="mt-6">
          <ConciliacaoAutomaticaIA 
            contasReceber={contasReceber} 
            contasPagar={contasPagar} 
          />
        </TabsContent>

        <TabsContent value="previsao" className="mt-6">
          <PrevisaoFluxoCaixaIA 
            contasReceber={contasReceber} 
            contasPagar={contasPagar} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}