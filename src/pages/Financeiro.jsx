import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Building2, BarChart3, Zap, AlertTriangle } from "lucide-react";
import ContasReceberTab from "../components/financeiro/ContasReceberTab";
import ContasPagarTab from "../components/financeiro/ContasPagarTab";
import CaixaDiarioTab from "../components/financeiro/CaixaDiarioTab";
import PainelConciliacao from "../components/financeiro/PainelConciliacao";
import RelatorioFinanceiro from "../components/financeiro/RelatorioFinanceiro";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * Módulo Financeiro - V21.3 Fase 3
 * Contas a Receber/Pagar, Fluxo de Caixa, Conciliação e IAs Preditivas
 */
export default function Financeiro() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("receber");
  const queryClient = useQueryClient();

  const { data: contasReceber = [], isLoading: loadingReceber } = useQuery({
    queryKey: ['contas-receber'],
    queryFn: () => base44.entities.ContaReceber.list('-data_vencimento'),
  });

  const { data: contasPagar = [], isLoading: loadingPagar } = useQuery({
    queryKey: ['contas-pagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento'),
  });

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list(),
  });

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-bancarios'],
    queryFn: () => base44.entities.ExtratoBancario.list('-data_movimento'),
  });

  // KPIs
  const totalReceber = contasReceber
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const totalPagar = contasPagar
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const receberVencido = contasReceber.filter(c => {
    if (c.status !== 'Pendente') return false;
    const vencimento = new Date(c.data_vencimento);
    return vencimento < new Date();
  });

  const pagarVencido = contasPagar.filter(c => {
    if (c.status !== 'Pendente') return false;
    const vencimento = new Date(c.data_vencimento);
    return vencimento < new Date();
  });

  const totalVencidoReceber = receberVencido.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalVencidoPagar = pagarVencido.reduce((sum, c) => sum + (c.valor || 0), 0);

  const saldoBancarioTotal = bancos.reduce((sum, b) => sum + (b.saldo_atual || 0), 0);

  const extratosPendentes = extratos.filter(e => !e.conciliado).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Financeiro e Contábil</h1>
          <p className="text-slate-600">Contas, fluxo de caixa, conciliação e análises financeiras</p>
        </div>
        
        <div className="flex gap-2">
          {extratosPendentes > 0 && (
            <Badge className="bg-orange-100 text-orange-700 px-4 py-2 cursor-pointer" onClick={() => setActiveTab('conciliacao')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              {extratosPendentes} lançamento(s) a conciliar
            </Badge>
          )}
          {(receberVencido.length > 0 || pagarVencido.length > 0) && (
            <Badge className="bg-red-100 text-red-700 px-4 py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Títulos vencidos
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Receber</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {contasReceber.filter(c => c.status === 'Pendente').length} título(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">A Pagar</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {contasPagar.filter(c => c.status === 'Pendente').length} título(s)
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Vencidos Receber</CardTitle>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              R$ {totalVencidoReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">{receberVencido.length} título(s)</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Vencidos Pagar</CardTitle>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              R$ {totalVencidoPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">{pagarVencido.length} título(s)</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Saldo Bancos</CardTitle>
            <Building2 className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              R$ {saldoBancarioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">{bancos.length} conta(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-purple-900">
            <Zap className="w-4 h-4" />
            <span className="font-semibold">IAs Financeiras Ativas:</span>
            <span>Forecast de Recebimento • Classificação de Despesas • Previsão de Caixa</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap">
          <TabsTrigger value="receber" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Contas a Receber
          </TabsTrigger>
          <TabsTrigger value="pagar" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <TrendingDown className="w-4 h-4 mr-2" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="caixa" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" />
            Conciliação Bancária
            {extratosPendentes > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">{extratosPendentes}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analises" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            DRE e Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receber">
          <ContasReceberTab 
            contasReceber={contasReceber} 
            isLoading={loadingReceber}
          />
        </TabsContent>

        <TabsContent value="pagar">
          <ContasPagarTab 
            contasPagar={contasPagar} 
            isLoading={loadingPagar}
          />
        </TabsContent>

        <TabsContent value="caixa">
          <CaixaDiarioTab 
            contasReceber={contasReceber}
            contasPagar={contasPagar}
            bancos={bancos}
          />
        </TabsContent>

        <TabsContent value="conciliacao">
          <PainelConciliacao 
            extratos={extratos}
            contasReceber={contasReceber}
            contasPagar={contasPagar}
          />
        </TabsContent>

        <TabsContent value="analises">
          <RelatorioFinanceiro 
            contasReceber={contasReceber}
            contasPagar={contasPagar}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}