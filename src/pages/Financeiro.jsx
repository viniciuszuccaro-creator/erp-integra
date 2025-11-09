import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, FileText, Link2, BarChart3 } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import ContasReceberTab from "@/components/financeiro/ContasReceberTab";
import ContasPagarTab from "@/components/financeiro/ContasPagarTab";
import DashboardFinanceiro from "@/components/financeiro/DashboardFinanceiro";
import FluxoCaixaProjetado from "@/components/financeiro/FluxoCaixaProjetado";
import PainelConciliacao from "@/components/financeiro/PainelConciliacao";

/**
 * V21.3 - Financeiro e Contábil COMPLETO
 * COM: Régua Cobrança IA, Conciliação PLN, Fluxo Projetado, Bloqueio Dinâmico
 */
export default function Financeiro() {
  const { empresaAtual } = useUser();
  const [aba, setAba] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Financeiro e Contábil</h1>
                <p className="text-green-100">v21.3 COMPLETO - Régua IA + Conciliação PLN + Bloqueio Dinâmico</p>
              </div>
              <DollarSign className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="receber">
              <TrendingUp className="w-4 h-4 mr-2" />
              Contas a Receber
            </TabsTrigger>
            <TabsTrigger value="pagar">
              <TrendingDown className="w-4 h-4 mr-2" />
              Contas a Pagar
            </TabsTrigger>
            <TabsTrigger value="fluxo">
              <FileText className="w-4 h-4 mr-2" />
              Fluxo Projetado
            </TabsTrigger>
            <TabsTrigger value="conciliacao">
              <Link2 className="w-4 h-4 mr-2" />
              Conciliação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardFinanceiro empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="receber">
            <ContasReceberTab empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="pagar">
            <ContasPagarTab empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="fluxo">
            <FluxoCaixaProjetado empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="conciliacao">
            <PainelConciliacao empresaId={empresaAtual?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}