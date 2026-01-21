import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, TrendingUp, Shield, DollarSign } from 'lucide-react';
import CaixaCentralLiquidacao from './CaixaCentralLiquidacao';
import ConciliacaoEmLote from './ConciliacaoEmLote';
import IADetectorAnomalias from './IADetectorAnomalias';
import ContasReceberTab from './ContasReceberTab';
import ContasPagarTab from './ContasPagarTab';
import CriteriosConciliacao from './CriteriosConciliacao';
import AuditoriaLiquidacoes from './AuditoriaLiquidacoes';
import ValidadorSegurancaFinanceira from './ValidadorSegurancaFinanceira';

/**
 * V22.0 ETAPA 4 - Dashboard Financeiro Unificado
 * Centraliza todas as operações financeiras em uma interface única
 */
export default function DashboardFinanceiroUnificado() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Financeiro Unificado</CardTitle>
                <Badge className="bg-white/20 text-white mt-1">V22.0 Etapa 4</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="caixa" className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-4 grid grid-cols-7 w-auto flex-shrink-0">
          <TabsTrigger value="caixa" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Caixa
          </TabsTrigger>
          <TabsTrigger value="receber" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Receber
          </TabsTrigger>
          <TabsTrigger value="pagar" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pagar
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Conciliação
          </TabsTrigger>
          <TabsTrigger value="ia" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            IA
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Auditoria
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 overflow-hidden">
          <TabsContent value="caixa" className="h-full m-0 p-0">
            <CaixaCentralLiquidacao />
          </TabsContent>
          <TabsContent value="receber" className="h-full m-0 p-0">
            <div className="h-full overflow-auto p-4">
              <ContasReceberTab contas={[]} />
            </div>
          </TabsContent>
          <TabsContent value="pagar" className="h-full m-0 p-0">
            <div className="h-full overflow-auto p-4">
              <ContasPagarTab contas={[]} />
            </div>
          </TabsContent>
          <TabsContent value="conciliacao" className="h-full m-0 p-0">
            <div className="w-full h-full flex flex-col space-y-4 overflow-auto p-4">
              <CriteriosConciliacao />
              <ConciliacaoEmLote />
            </div>
          </TabsContent>
          <TabsContent value="ia" className="h-full m-0 p-0">
            <div className="p-4 h-full overflow-auto">
              <IADetectorAnomalias />
            </div>
          </TabsContent>
          <TabsContent value="auditoria" className="h-full m-0 p-0">
            <AuditoriaLiquidacoes />
          </TabsContent>
          <TabsContent value="seguranca" className="h-full m-0 p-0">
            <ValidadorSegurancaFinanceira />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}