import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingDown,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield
} from "lucide-react";

/**
 * V21.3 - Contas a Pagar
 * COM: Aprovação de Pagamentos, Rateio Grupo
 */
export default function ContasPagarTab({ empresaId }) {
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const queryClient = useQueryClient();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas-pagar', empresaId],
    queryFn: () => base44.entities.ContaPagar.filter({ 
      empresa_id: empresaId 
    }, '-data_vencimento', 200)
  });

  const aprovarPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      return base44.entities.ContaPagar.update(contaId, {
        status_pagamento: 'Aprovado',
        aprovado_por: 'Usuário Atual',
        data_aprovacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
    }
  });

  const pagarContaMutation = useMutation({
    mutationFn: async (conta) => {
      return base44.entities.ContaPagar.update(conta.id, {
        status: 'Pago',
        data_pagamento: new Date().toISOString().split('T')[0],
        valor_pago: conta.valor
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
    }
  });

  const contasFiltradas = contas.filter(conta => {
    const statusMatch = filtroStatus === 'todos' || conta.status === filtroStatus;
    const buscaMatch = !busca || 
      conta.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      conta.fornecedor?.toLowerCase().includes(busca.toLowerCase());
    
    return statusMatch && buscaMatch;
  });

  const calcularTotais = () => {
    const pendentes = contasFiltradas.filter(c => c.status === 'Pendente');
    const atrasadas = contasFiltradas.filter(c => c.status === 'Atrasado');
    const aguardandoAprovacao = contasFiltradas.filter(c => c.status_pagamento === 'Aguardando Aprovação');
    const pagas = contasFiltradas.filter(c => c.status === 'Pago');

    return {
      totalPendente: pendentes.reduce((sum, c) => sum + (c.valor || 0), 0),
      totalAtrasado: atrasadas.reduce((sum, c) => sum + (c.valor || 0), 0),
      totalPago: pagas.reduce((sum, c) => sum + (c.valor || 0), 0),
      qtdAguardandoAprovacao: aguardandoAprovacao.length,
      qtdPendente: pendentes.length,
      qtdAtrasado: atrasadas.length
    };
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* Header com KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <Badge className="bg-orange-600">{totais.qtdPendente}</Badge>
            </div>
            <p className="text-xs text-orange-700 mb-1">A Pagar</p>
            <p className="text-2xl font-bold text-orange-600">
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

        <Card className="border-2 border-purple-300 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <Badge className="bg-purple-600">{totais.qtdAguardandoAprovacao}</Badge>
            </div>
            <p className="text-xs text-purple-700 mb-1">Aguardando Aprovação</p>
            <p className="text-xl font-bold text-purple-600">
              {totais.qtdAguardandoAprovacao}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Badge className="bg-green-600">Mês</Badge>
            </div>
            <p className="text-xs text-green-700 mb-1">Pago</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {totais.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  placeholder="Buscar fornecedor, descrição..."
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
              <option value="Aguardando Aprovação">Aguardando Aprovação</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Pago">Pago</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <div className="space-y-2">
        {contasFiltradas.map((conta) => {
          const requerAprovacao = conta.status_pagamento === 'Aguardando Aprovação';
          const podeAprovar = true; // Verificar permissão real

          return (
            <Card 
              key={conta.id} 
              className={`border-2 hover:shadow-lg transition-all ${
                conta.status === 'Atrasado' ? 'border-red-300 bg-red-50' :
                conta.status === 'Pago' ? 'border-green-300 bg-green-50' :
                requerAprovacao ? 'border-purple-300 bg-purple-50' :
                'border-slate-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-lg">{conta.fornecedor || conta.descricao}</p>
                      
                      <Badge className={
                        conta.status === 'Pago' ? 'bg-green-600' :
                        conta.status === 'Atrasado' ? 'bg-red-600' :
                        requerAprovacao ? 'bg-purple-600' :
                        'bg-orange-600'
                      }>
                        {conta.status_pagamento || conta.status}
                      </Badge>

                      {conta.e_replicado && (
                        <Badge className="bg-blue-600">Rateio Grupo</Badge>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mb-2">{conta.descricao}</p>

                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Emissão</p>
                        <p className="font-semibold">
                          {conta.data_emissao ? new Date(conta.data_emissao).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Vencimento</p>
                        <p className={`font-semibold ${conta.status === 'Atrasado' ? 'text-red-600' : ''}`}>
                          {conta.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Categoria</p>
                        <p className="font-semibold">{conta.categoria || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Centro Custo</p>
                        <p className="font-semibold">{conta.centro_custo || '-'}</p>
                      </div>
                    </div>

                    {conta.aprovado_por && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                        <p className="text-green-800">
                          ✓ Aprovado por {conta.aprovado_por} em {new Date(conta.data_aprovacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Valor e Ações */}
                  <div className="text-right space-y-2">
                    <p className="text-3xl font-bold text-red-700">
                      R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    {requerAprovacao && podeAprovar && (
                      <Button
                        size="sm"
                        onClick={() => aprovarPagamentoMutation.mutate(conta.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    )}

                    {conta.status_pagamento === 'Aprovado' && conta.status !== 'Pago' && (
                      <Button
                        size="sm"
                        onClick={() => pagarContaMutation.mutate(conta)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Pagar
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
              <TrendingDown className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p>Nenhuma conta a pagar encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}