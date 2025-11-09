import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Layers,
  Zap
} from "lucide-react";
import GerarCobrancaModal from "./GerarCobrancaModal";

/**
 * V21.3 - Contas a Receber com Filtro de Etapas
 * COM: Badge Etapa, Bloqueio Dinâmico, Índice Previsão IA
 */
export default function ContasReceberTab({ empresaId }) {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEtapa, setFiltroEtapa] = useState('todas');
  const [busca, setBusca] = useState('');
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const queryClient = useQueryClient();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-receber', empresaId],
    queryFn: () => base44.entities.ContaReceber.filter({ 
      empresa_id: empresaId 
    }, '-data_vencimento', 200)
  });

  const { data: etapas = [] } = useQuery({
    queryKey: ['pedido-etapas-todas'],
    queryFn: () => base44.entities.PedidoEtapa.list('-created_date', 500)
  });

  // V21.3: Filtros
  const contasFiltradas = contas.filter(conta => {
    const statusMatch = filtroStatus === 'todos' || conta.status === filtroStatus;
    const etapaMatch = filtroEtapa === 'todas' || conta.etapa_id === filtroEtapa;
    const buscaMatch = !busca || 
      conta.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      conta.cliente?.toLowerCase().includes(busca.toLowerCase());
    
    return statusMatch && etapaMatch && buscaMatch;
  });

  const calcularTotais = () => {
    const pendentes = contasFiltradas.filter(c => c.status === 'Pendente');
    const atrasadas = contasFiltradas.filter(c => c.status === 'Atrasado');
    const recebidas = contasFiltradas.filter(c => c.status === 'Recebido');

    return {
      totalPendente: pendentes.reduce((sum, c) => sum + (c.valor || 0), 0),
      totalAtrasado: atrasadas.reduce((sum, c) => sum + (c.valor || 0), 0),
      totalRecebido: recebidas.reduce((sum, c) => sum + (c.valor || 0), 0),
      qtdPendente: pendentes.length,
      qtdAtrasado: atrasadas.length
    };
  };

  const totais = calcularTotais();

  // Etapas únicas para filtro
  const etapasUnicas = [...new Set(contas.map(c => c.etapa_id).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header com KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <Badge className="bg-blue-600">{totais.qtdPendente}</Badge>
            </div>
            <p className="text-xs text-blue-700 mb-1">A Receber</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totais.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <Badge className="bg-red-600">{totais.qtdAtrasado}</Badge>
            </div>
            <p className="text-xs text-red-700 mb-1">Atrasado</p>
            <p className="text-2xl font-bold text-red-600">
              R$ {totais.totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-600">Mês</Badge>
            </div>
            <p className="text-xs text-green-700 mb-1">Recebido</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {totais.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-600">V21.3</Badge>
            </div>
            <p className="text-xs text-purple-700 mb-1">Por Etapas</p>
            <p className="text-2xl font-bold text-purple-600">
              {contas.filter(c => c.etapa_id).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar cliente, descrição..."
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="p-2 border rounded-lg bg-white"
            >
              <option value="todos">Todos Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Recebido">Recebido</option>
            </select>

            {/* V21.3: NOVO - Filtro por Etapa */}
            <select
              value={filtroEtapa}
              onChange={(e) => setFiltroEtapa(e.target.value)}
              className="p-2 border rounded-lg bg-white min-w-[200px]"
            >
              <option value="todas">Todas Etapas</option>
              {etapasUnicas.map(etapaId => {
                const etapa = etapas.find(e => e.id === etapaId);
                return (
                  <option key={etapaId} value={etapaId}>
                    {etapa?.nome_etapa || etapa?.nome || `Etapa ${etapaId.substring(0, 8)}`}
                  </option>
                );
              })}
            </select>

            <Button size="sm" variant="outline">
              <Filter className="w-4 h-4 mr-1" />
              Filtros Avançados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <div className="space-y-2">
        {contasFiltradas.map((conta) => {
          const etapa = etapas.find(e => e.id === conta.etapa_id);
          const diasAtraso = conta.dias_atraso || 0;
          const previsaoPagamento = conta.indice_previsao_pagamento || 50;

          return (
            <Card 
              key={conta.id} 
              className={`border-2 hover:shadow-lg transition-all ${
                conta.status === 'Atrasado' ? 'border-red-300 bg-red-50' :
                conta.status === 'Recebido' ? 'border-green-300 bg-green-50' :
                'border-slate-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-lg">{conta.cliente}</p>
                      
                      {/* V21.3: NOVO - Badge Etapa */}
                      {etapa && (
                        <Badge className="bg-purple-600">
                          <Layers className="w-3 h-3 mr-1" />
                          {etapa.nome_etapa || etapa.nome}
                        </Badge>
                      )}

                      <Badge className={
                        conta.status === 'Recebido' ? 'bg-green-600' :
                        conta.status === 'Atrasado' ? 'bg-red-600' :
                        'bg-orange-600'
                      }>
                        {conta.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 mb-2">{conta.descricao}</p>

                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Emissão</p>
                        <p className="font-semibold">
                          {new Date(conta.data_emissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Vencimento</p>
                        <p className={`font-semibold ${diasAtraso > 0 ? 'text-red-600' : ''}`}>
                          {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                          {diasAtraso > 0 && <span className="ml-1">({diasAtraso}d)</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Forma</p>
                        <p className="font-semibold">{conta.forma_cobranca || 'Não definida'}</p>
                      </div>
                      
                      {/* V21.3: NOVO - Índice Previsão IA */}
                      <div>
                        <p className="text-slate-500">Previsão IA</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className={`w-3 h-3 ${
                            previsaoPagamento >= 70 ? 'text-green-600' :
                            previsaoPagamento >= 40 ? 'text-orange-600' :
                            'text-red-600'
                          }`} />
                          <p className={`font-bold ${
                            previsaoPagamento >= 70 ? 'text-green-600' :
                            previsaoPagamento >= 40 ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {previsaoPagamento}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Régua de Cobrança */}
                    {conta.regua_cobranca && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-bold text-blue-900 mb-1">📢 Régua de Cobrança:</p>
                        <div className="flex gap-2 text-xs">
                          {conta.regua_cobranca.acao_1_enviada && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              ✓ Ação 1: {new Date(conta.regua_cobranca.acao_1_data).toLocaleDateString('pt-BR')}
                            </Badge>
                          )}
                          {conta.regua_cobranca.acao_2_enviada && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-800">
                              ✓ Ação 2: {new Date(conta.regua_cobranca.acao_2_data).toLocaleDateString('pt-BR')}
                            </Badge>
                          )}
                          {conta.regua_cobranca.acao_3_enviada && (
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              ✓ Ação 3: Bloqueio
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Valor e Ações */}
                  <div className="text-right space-y-2">
                    <p className="text-3xl font-bold text-green-700">
                      R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    {conta.status !== 'Recebido' && (
                      <Button
                        size="sm"
                        onClick={() => setContaSelecionada(conta)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Gerar Cobrança
                      </Button>
                    )}

                    {conta.status === 'Pendente' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await base44.entities.ContaReceber.update(conta.id, {
                            status: 'Recebido',
                            data_recebimento: new Date().toISOString(),
                            valor_recebido: conta.valor
                          });
                          queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Baixar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {contasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-slate-400">
              <DollarSign className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p>Nenhuma conta a receber encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal Cobrança */}
      {contaSelecionada && (
        <GerarCobrancaModal
          isOpen={!!contaSelecionada}
          onClose={() => setContaSelecionada(null)}
          conta={contaSelecionada}
        />
      )}
    </div>
  );
}