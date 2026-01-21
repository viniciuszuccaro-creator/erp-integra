import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, CreditCard, Wallet, TrendingUp, Calendar, List, Clock, FileText } from 'lucide-react';
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

      {/* KPIs Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-slate-700">A Receber</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{contasReceber.length} títulos</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-slate-700">A Pagar</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{contasPagar.length} títulos</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">Saldo Líquido</span>
            </div>
            <p className={`text-xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {Math.abs(saldoLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{saldoLiquido >= 0 ? 'Positivo' : 'Negativo'}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-slate-700">Formas Pagamento</span>
            </div>
            <p className="text-xl font-bold text-purple-600">{Object.keys(porForma).length}</p>
            <p className="text-xs text-slate-600 mt-0.5">Tipos diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Por Forma de Pagamento Compacto */}
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-base">Distribuição por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(porForma).map(([forma, valores]) => (
              <div key={forma} className="p-2 border rounded-lg bg-slate-50">
                <p className="font-semibold text-slate-900 mb-1 text-sm">{forma}</p>
                <div className="space-y-0.5 text-xs">
                  <p className="text-green-600">+ R$ {valores.receber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-red-600">- R$ {valores.pagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="font-semibold text-blue-600">
                    = R$ {(valores.receber - valores.pagar).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Contas a Receber Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-auto">
                {contasReceber.slice(0, 10).map((conta) => (
                  <div key={conta.id} className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                    onClick={() => setSelectedItem(conta)}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{conta.descricao}</p>
                      <p className="text-xs text-slate-600">{conta.cliente || 'Cliente não informado'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                Contas a Pagar Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-auto">
                {contasPagar.slice(0, 10).map((conta) => (
                  <div key={conta.id} className="p-2 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                    onClick={() => setSelectedItem(conta)}>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{conta.descricao}</p>
                      <p className="text-xs text-slate-600">{conta.fornecedor || 'Fornecedor não informado'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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