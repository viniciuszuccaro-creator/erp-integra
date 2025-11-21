import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Building2, 
  ArrowDownCircle, 
  ArrowUpCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import CaixaCentral from "@/components/financeiro/CaixaCentral";
import ConciliacaoBancaria from "@/components/financeiro/ConciliacaoBancaria";
import AprovacaoDescontos from "@/components/comercial/AprovacaoDescontos";

/**
 * ETAPA 4 - Página Central do Financeiro
 * Integra Caixa, Conciliação, Aprovações e Dashboards
 */
export default function FinanceiroEtapa4() {
  const [tabAtiva, setTabAtiva] = useState("caixa");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-green-600" />
              Financeiro Avançado - ETAPA 4
            </h1>
            <p className="text-slate-600 mt-1">
              Fluxo Único de Liquidação • Caixa Central • Conciliação • Omnichannel
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Etapa 4 Ativa
            </Badge>
          </div>
        </div>

        {/* Dashboard Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownCircle className="w-8 h-8 text-green-600" />
                <Badge className="bg-green-600 text-white">Hoje</Badge>
              </div>
              <p className="text-2xl font-bold text-green-900">R$ 0,00</p>
              <p className="text-sm text-green-700">Recebimentos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpCircle className="w-8 h-8 text-red-600" />
                <Badge className="bg-red-600 text-white">Hoje</Badge>
              </div>
              <p className="text-2xl font-bold text-red-900">R$ 0,00</p>
              <p className="text-sm text-red-700">Pagamentos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <Badge className="bg-blue-600 text-white">Saldo</Badge>
              </div>
              <p className="text-2xl font-bold text-blue-900">R$ 0,00</p>
              <p className="text-sm text-blue-700">Caixa</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <Badge className="bg-orange-600 text-white">Ação</Badge>
              </div>
              <p className="text-2xl font-bold text-orange-900">0</p>
              <p className="text-sm text-orange-700">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Card>
          <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
            <CardHeader className="border-b">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="caixa" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Caixa Central
                </TabsTrigger>
                <TabsTrigger value="conciliacao" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Conciliação
                </TabsTrigger>
                <TabsTrigger value="aprovacoes" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Aprovações
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="caixa" className="mt-0">
                <CaixaCentral />
              </TabsContent>

              <TabsContent value="conciliacao" className="mt-0">
                <ConciliacaoBancaria />
              </TabsContent>

              <TabsContent value="aprovacoes" className="mt-0">
                <AprovacaoDescontos />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Rodapé Informativo */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-slate-900">ETAPA 4 - Fluxo Financeiro Omnichannel 100% Operacional</p>
                <p className="text-sm text-slate-600">
                  Caixa Central • Aprovações Hierárquicas • Conciliação Automática • Links de Pagamento • Multiempresa
                </p>
              </div>
              <Badge className="bg-green-600 text-white px-4 py-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}