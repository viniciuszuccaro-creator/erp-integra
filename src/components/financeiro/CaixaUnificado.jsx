import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Banknote
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { usePermissions } from '@/components/lib/usePermissions';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CaixaUnificado() {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { hasGranularPermission } = usePermissions();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Buscar movimentos do caixa
  const { data: movimentos = [], isLoading } = useQuery({
    queryKey: ['caixa_movimentos'],
    queryFn: () => base44.entities.CaixaMovimento.list('-data_movimento')
  });

  // Buscar cartões a compensar
  const { data: conciliacoes = [] } = useQuery({
    queryKey: ['conciliacoes_bancarias'],
    queryFn: () => base44.entities.ConciliacaoBancaria.list()
  });

  // Calcular cartões pendentes de compensação
  const cartoesPendentes = conciliacoes.flatMap(c => 
    c.cartoes_compensar?.filter(cartao => cartao.status === 'Aguardando Compensação') || []
  );

  // Calcular saldo atual
  const calcularSaldo = () => {
    const caixaAberto = movimentos.find(m => m.caixa_aberto && !m.data_fechamento_caixa);
    return caixaAberto?.saldo_posterior || 0;
  };

  const saldoAtual = calcularSaldo();

  // Filtrar movimentos
  const movimentosFiltrados = movimentos.filter(m => {
    const matchBusca = !busca || 
      m.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      m.numero_pedido?.includes(busca) ||
      m.cliente_nome?.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || m.tipo_movimento === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const abrirLiquidacao = (tipo) => {
    if (!hasGranularPermission('financeiro', tipo === 'receber' ? 'receber' : 'pagar')) {
      toast.error('Sem permissão para esta operação');
      return;
    }

    openWindow(
      () => import('@/components/financeiro/LiquidacaoAvancada'),
      { tipo },
      {
        title: tipo === 'receber' ? 'Liquidar Recebimento' : 'Liquidar Pagamento',
        width: 1200,
        height: 800
      }
    );
  };

  const abrirConciliacao = () => {
    if (!hasGranularPermission('financeiro', 'caixa_conciliar')) {
      toast.error('Sem permissão para conciliar');
      return;
    }

    openWindow(
      () => import('@/components/financeiro/ConciliacaoBancariaIA'),
      {},
      {
        title: 'Conciliação Bancária com IA',
        width: 1400,
        height: 900
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Centro Único de Liquidação - Caixa
            </h1>
            <p className="text-sm text-slate-600">
              Etapa 7 - Financeiro Unificado • Caixa • Conciliação • Cartões
            </p>
          </div>

          <div className="flex gap-2">
            {hasGranularPermission('financeiro', 'receber') && (
              <Button
                onClick={() => abrirLiquidacao('receber')}
                className="bg-green-600 hover:bg-green-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Liquidar Recebimento
              </Button>
            )}

            {hasGranularPermission('financeiro', 'pagar') && (
              <Button
                onClick={() => abrirLiquidacao('pagar')}
                className="bg-red-600 hover:bg-red-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Liquidar Pagamento
              </Button>
            )}
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Saldo Atual do Caixa</p>
                  <p className="text-3xl font-bold">
                    R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Banknote className="w-12 h-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Entradas Hoje</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {movimentos
                      .filter(m => 
                        m.tipo_movimento === 'Entrada' && 
                        format(new Date(m.data_movimento), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      )
                      .reduce((acc, m) => acc + m.valor, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Saídas Hoje</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {movimentos
                      .filter(m => 
                        m.tipo_movimento === 'Saída' && 
                        format(new Date(m.data_movimento), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      )
                      .reduce((acc, m) => acc + m.valor, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                    }
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Cartões a Compensar</p>
                  <p className="text-2xl font-bold text-orange-600">{cartoesPendentes.length}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    R$ {cartoesPendentes.reduce((acc, c) => acc + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="movimentos" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="movimentos">Movimentos do Caixa</TabsTrigger>
          <TabsTrigger value="cartoes">Cartões a Compensar ({cartoesPendentes.length})</TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliação Bancária</TabsTrigger>
        </TabsList>

        {/* Movimentos */}
        <TabsContent value="movimentos" className="flex-1 overflow-auto">
          {/* Filtros */}
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por pedido, cliente, CPF/CNPJ, descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="todos">Todos</option>
              <option value="Entrada">Entradas</option>
              <option value="Saída">Saídas</option>
            </select>
          </div>

          {/* Lista de Movimentos */}
          <div className="space-y-2">
            {movimentosFiltrados.map(movimento => (
              <Card key={movimento.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        movimento.tipo_movimento === 'Entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {movimento.tipo_movimento === 'Entrada' ? (
                          <TrendingUp className={`w-5 h-5 ${
                            movimento.tipo_movimento === 'Entrada' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <DollarSign className="w-5 h-5 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{movimento.descricao}</p>
                          {movimento.em_transito_cartao && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Em Trânsito
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          {movimento.numero_pedido && (
                            <span>Pedido: {movimento.numero_pedido}</span>
                          )}
                          {movimento.cliente_nome && (
                            <span>Cliente: {movimento.cliente_nome}</span>
                          )}
                          <span>
                            {format(new Date(movimento.data_movimento), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>

                        {/* Formas de Pagamento Múltiplas */}
                        {movimento.formas_pagamento_multiplas?.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {movimento.formas_pagamento_multiplas.map((forma, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {forma.forma}: R$ {forma.valor.toFixed(2)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        movimento.tipo_movimento === 'Entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimento.tipo_movimento === 'Entrada' ? '+' : '-'} 
                        R$ {movimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      
                      <Badge variant="secondary" className="text-xs mt-1">
                        {movimento.forma_pagamento}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {movimentosFiltrados.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Banknote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Nenhum movimento encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Cartões a Compensar */}
        <TabsContent value="cartoes" className="flex-1 overflow-auto">
          <div className="space-y-4">
            {cartoesPendentes.map((cartao, idx) => (
              <Card key={idx} className="border-orange-200 bg-orange-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cartao.bandeira}</p>
                          <Badge variant="outline">{cartao.adquirente}</Badge>
                        </div>
                        
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>NSU: {cartao.nsu}</span>
                          <span>Parcelas: {cartao.numero_parcelas || 1}x</span>
                          <span>Venda: {format(new Date(cartao.data_venda), 'dd/MM/yyyy')}</span>
                          <span>Previsão: {format(new Date(cartao.data_previsao_compensacao), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        R$ {cartao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-slate-600">
                        Líquido: R$ {cartao.valor_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-500">
                        Taxa MDR: {cartao.taxa_mdr}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {cartoesPendentes.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">
                    Todos os cartões compensados!
                  </p>
                  <p className="text-sm text-slate-500">
                    Não há cartões aguardando compensação bancária
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Conciliação */}
        <TabsContent value="conciliacao" className="flex-1">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <p className="text-slate-700 font-medium mb-4">
                Conciliação Bancária com IA
              </p>
              <p className="text-sm text-slate-600 mb-6">
                Importe extratos bancários e deixe a IA sugerir conciliações automáticas
              </p>
              {hasGranularPermission('financeiro', 'caixa_conciliar') && (
                <Button onClick={abrirConciliacao} className="bg-blue-600">
                  Abrir Conciliação Bancária
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}