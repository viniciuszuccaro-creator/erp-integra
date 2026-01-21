import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Calendar, List, Clock, FileText, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import LiquidacaoEmLote from './LiquidacaoEmLote';
import DetalhesLiquidacao from './DetalhesLiquidacao';
import EstatisticasLiquidacao from './EstatisticasLiquidacao';
import MovimentosDiarios from './caixa-central/MovimentosDiarios';
import OrdensLiquidacaoPendentes from './caixa-central/OrdensLiquidacaoPendentes';
import LiquidarReceberPagar from './caixa-central/LiquidarReceberPagar';
import HistoricoLiquidacoes from './caixa-central/HistoricoLiquidacoes';
import ExtratoBancarioResumo from './caixa-central/ExtratoBancarioResumo';
import KPIsFinanceiros from './caixa-central/KPIsFinanceiros';
import DistribuicaoFormasPagamento from './caixa-central/DistribuicaoFormasPagamento';
import VisaoGeralPendencias from './caixa-central/VisaoGeralPendencias';
import CartoesACompensar from './CartoesACompensar';
import ConciliacaoBancariaTab from './ConciliacaoBancariaTab';

/**
 * V22.0 ETAPA 4 - Caixa Central de Liquidação
 * Ponto único para todas as liquidações financeiras (recebimentos e pagamentos)
 */
export default function CaixaCentralLiquidacao() {
  const { filterInContext } = useContextoVisual();
  const [modalLote, setModalLote] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [mostrarStats, setMostrarStats] = useState(false);

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['liquidacao', 'receber'],
    queryFn: () => filterInContext('ContaReceber', { status: 'Pendente' }, '-data_vencimento', 50),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['liquidacao', 'pagar'],
    queryFn: () => filterInContext('ContaPagar', { status: 'Pendente' }, '-data_vencimento', 50),
  });

  const totalReceber = contasReceber.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalPagar = contasPagar.reduce((sum, c) => sum + (c.valor || 0), 0);
  const saldoLiquido = totalReceber - totalPagar;

  const porForma = {};
  [...contasReceber, ...contasPagar].forEach(c => {
    const forma = c.forma_recebimento || c.forma_pagamento || 'Não definido';
    if (!porForma[forma]) porForma[forma] = { receber: 0, pagar: 0 };
    if (c.valor) {
      if (contasReceber.includes(c)) porForma[forma].receber += c.valor;
      else porForma[forma].pagar += c.valor;
    }
  });

  return (
    <div className="w-full h-full flex flex-col space-y-3 overflow-auto p-3">
      {/* Header Compacto */}
      <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Caixa Central V22.0</CardTitle>
                <p className="text-xs text-slate-600">Gerenciamento Centralizado de Liquidações</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMostrarStats(!mostrarStats)} variant="outline" size="sm">
                {mostrarStats ? 'Ocultar' : 'Ver'} Stats
              </Button>
              <Button onClick={() => setModalLote(true)} className="bg-green-600 hover:bg-green-700" size="sm">
                Lote
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {mostrarStats && <EstatisticasLiquidacao />}

      <KPIsFinanceiros 
        totalReceber={totalReceber}
        totalPagar={totalPagar}
        saldoLiquido={saldoLiquido}
        totalFormasPagamento={Object.keys(porForma).length}
        contasReceberCount={contasReceber.length}
        contasPagarCount={contasPagar.length}
      />

      <DistribuicaoFormasPagamento porForma={porForma} />

      {/* Tabs para Módulos */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1">
        <TabsList className="bg-white border shadow-sm w-full justify-start">
          <TabsTrigger value="visao-geral" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <List className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="movimentos" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Movimentos
          </TabsTrigger>
          <TabsTrigger value="liquidar" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Liquidar
          </TabsTrigger>
          <TabsTrigger value="ordens" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Ordens
          </TabsTrigger>
          <TabsTrigger value="cartoes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            💳 Cartões
          </TabsTrigger>
          <TabsTrigger value="extrato" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
            🏦 Extrato
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            🔄 Conciliação
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-3 mt-3">
          <VisaoGeralPendencias 
            contasReceber={contasReceber}
            contasPagar={contasPagar}
            onSelectItem={setSelectedItem}
          />
        </TabsContent>

        <TabsContent value="movimentos" className="mt-3">
          <MovimentosDiarios />
        </TabsContent>

        <TabsContent value="liquidar" className="mt-3">
          <LiquidarReceberPagar />
        </TabsContent>

        <TabsContent value="ordens" className="mt-3">
          <OrdensLiquidacaoPendentes />
        </TabsContent>

        <TabsContent value="cartoes" className="mt-3">
          <CartoesACompensar />
        </TabsContent>

        <TabsContent value="extrato" className="mt-3">
          <ExtratoBancarioResumo />
        </TabsContent>

        <TabsContent value="conciliacao" className="mt-3">
          <ConciliacaoBancariaTab />
        </TabsContent>

        <TabsContent value="historico" className="mt-3">
          <HistoricoLiquidacoes />
        </TabsContent>
      </Tabs>

      {modalLote && <LiquidacaoEmLote onClose={() => setModalLote(false)} />}
      {selectedItem && <DetalhesLiquidacao item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}