import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, Wallet, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import LiquidacaoEmLote from './LiquidacaoEmLote';
import DetalhesLiquidacao from './DetalhesLiquidacao';
import EstatisticasLiquidacao from './EstatisticasLiquidacao';

/**
 * V22.0 ETAPA 4 - Caixa Central de Liquidação
 * Ponto único para todas as liquidações financeiras (recebimentos e pagamentos)
 */
export default function CaixaCentralLiquidacao() {
  const { filterInContext } = useContextoVisual();
  const [modalLote, setModalLote] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Buscar pendências de liquidação
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['liquidacao', 'receber'],
    queryFn: () => filterInContext('ContaReceber', { status: 'Pendente' }, '-data_vencimento', 50),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['liquidacao', 'pagar'],
    queryFn: () => filterInContext('ContaPagar', { status: 'Pendente' }, '-data_vencimento', 50),
  });

  // Calcular totais
  const totalReceber = contasReceber.reduce((sum, c) => sum + (c.valor || 0), 0);
  const totalPagar = contasPagar.reduce((sum, c) => sum + (c.valor || 0), 0);
  const saldoLiquido = totalReceber - totalPagar;

  // Agrupar por forma de pagamento
  const porForma = {};
  [...contasReceber, ...contasPagar].forEach(c => {
    const forma = c.forma_recebimento || c.forma_pagamento || 'Não definido';
    if (!porForma[forma]) porForma[forma] = { receber: 0, pagar: 0 };
    if (c.valor) {
      if (contasReceber.includes(c)) porForma[forma].receber += c.valor;
      else porForma[forma].pagar += c.valor;
    }
  });

  const [mostrarStats, setMostrarStats] = useState(false);

  return (
    <div className="w-full h-full flex flex-col space-y-4 overflow-auto p-4">
      {/* Header */}
      <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Caixa Central de Liquidação</CardTitle>
                <Badge className="bg-blue-600 text-white mt-1">V22.0 Etapa 4 - 100%</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMostrarStats(!mostrarStats)} variant="outline">
                {mostrarStats ? 'Ocultar' : 'Ver'} Estatísticas
              </Button>
              <Button onClick={() => setModalLote(true)} className="bg-green-600 hover:bg-green-700">
                Liquidação em Lote
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas (condicional) */}
      {mostrarStats && <EstatisticasLiquidacao />}

      {/* KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-slate-700">A Receber</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-1">{contasReceber.length} títulos</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold text-slate-700">A Pagar</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-1">{contasPagar.length} títulos</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Saldo Líquido</span>
            </div>
            <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {Math.abs(saldoLiquido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-1">{saldoLiquido >= 0 ? 'Positivo' : 'Negativo'}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-slate-700">Formas Pagamento</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{Object.keys(porForma).length}</p>
            <p className="text-xs text-slate-600 mt-1">Tipos diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Por Forma de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(porForma).map(([forma, valores]) => (
              <div key={forma} className="p-3 border rounded-lg bg-slate-50">
                <p className="font-semibold text-slate-900 mb-2">{forma}</p>
                <div className="space-y-1 text-sm">
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

      {/* Lista de Pendências - A Receber */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Contas a Receber Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-auto">
            {contasReceber.map((conta) => (
              <div key={conta.id} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                onClick={() => setSelectedItem(conta)}>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{conta.descricao}</p>
                  <p className="text-sm text-slate-600">{conta.cliente || 'Cliente não informado'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>Venc: {conta.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}</span>
                    <span>{conta.forma_recebimento || 'Forma não definida'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {conta.dias_atraso > 0 ? (
                    <Badge className="bg-red-600 text-white mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {conta.dias_atraso}d atraso
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-600 text-white mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      No prazo
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pendências - A Pagar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-red-600" />
            Contas a Pagar Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-auto">
            {contasPagar.map((conta) => (
              <div key={conta.id} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                onClick={() => setSelectedItem(conta)}>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{conta.descricao}</p>
                  <p className="text-sm text-slate-600">{conta.fornecedor || 'Fornecedor não informado'}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>Venc: {conta.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}</span>
                    <span>{conta.forma_pagamento || 'Forma não definida'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge className="bg-orange-600 text-white mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Pendente
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      {modalLote && <LiquidacaoEmLote onClose={() => setModalLote(false)} />}
      {selectedItem && <DetalhesLiquidacao item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}