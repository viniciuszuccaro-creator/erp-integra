import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";

/**
 * V21.4 - Movimentações de Estoque
 * COM: FIFO/LIFO, Rastreio Completo
 */
export default function MovimentacoesTab({ empresaId }) {
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes', empresaId],
    queryFn: () => base44.entities.MovimentacaoEstoque.filter(
      { empresa_id: empresaId }, 
      '-data_movimentacao', 
      200
    )
  });

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const buscaMatch = !busca || 
      mov.produto_descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      mov.documento?.toLowerCase().includes(busca.toLowerCase());
    
    const tipoMatch = tipoFiltro === 'todos' || mov.tipo_movimento === tipoFiltro;
    
    return buscaMatch && tipoMatch;
  });

  const calcularTotais = () => {
    const entradas = movimentacoesFiltradas.filter(m => m.tipo_movimento === 'entrada');
    const saidas = movimentacoesFiltradas.filter(m => m.tipo_movimento === 'saida');

    return {
      totalEntradas: entradas.reduce((sum, m) => sum + (m.quantidade || 0), 0),
      totalSaidas: saidas.reduce((sum, m) => sum + (m.quantidade || 0), 0),
      valorEntradas: entradas.reduce((sum, m) => sum + (m.valor_total || 0), 0),
      valorSaidas: saidas.reduce((sum, m) => sum + (m.valor_total || 0), 0)
    };
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Entradas (KG)</p>
            <p className="text-2xl font-bold text-green-600">
              {totais.totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <TrendingDown className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-xs text-red-700 mb-1">Saídas (KG)</p>
            <p className="text-2xl font-bold text-red-600">
              {totais.totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 mb-1">Valor Entradas</p>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totais.valorEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <p className="text-xs text-orange-700 mb-1">Valor Saídas</p>
            <p className="text-2xl font-bold text-orange-600">
              R$ {totais.valorSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-2 border-slate-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto, documento..."
                className="pl-10"
              />
            </div>

            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="p-2 border rounded-lg bg-white"
            >
              <option value="todos">Todos Tipos</option>
              <option value="entrada">Entradas</option>
              <option value="saida">Saídas</option>
              <option value="transferencia">Transferências</option>
              <option value="ajuste">Ajustes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Movimentações */}
      <div className="space-y-2">
        {movimentacoesFiltradas.map(mov => {
          const icon = 
            mov.tipo_movimento === 'entrada' ? TrendingUp :
            mov.tipo_movimento === 'saida' ? TrendingDown :
            ArrowRightLeft;

          const Icon = icon;

          return (
            <Card key={mov.id} className="border-2 border-slate-200 hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${
                        mov.tipo_movimento === 'entrada' ? 'text-green-600' :
                        mov.tipo_movimento === 'saida' ? 'text-red-600' :
                        'text-blue-600'
                      }`} />
                      <p className="font-bold">{mov.produto_descricao}</p>
                      <Badge className={
                        mov.tipo_movimento === 'entrada' ? 'bg-green-600' :
                        mov.tipo_movimento === 'saida' ? 'bg-red-600' :
                        'bg-blue-600'
                      }>
                        {mov.tipo_movimento}
                      </Badge>

                      {mov.origem_movimento && (
                        <Badge variant="outline">{mov.origem_movimento}</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Data</p>
                        <p className="font-semibold">
                          {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Quantidade</p>
                        <p className={`font-bold ${
                          mov.tipo_movimento === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mov.tipo_movimento === 'entrada' ? '+' : '-'}
                          {(mov.quantidade || 0).toFixed(2)} {mov.unidade_medida || 'KG'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Saldo Anterior</p>
                        <p className="font-semibold">
                          {(mov.estoque_anterior || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Saldo Atual</p>
                        <p className="font-semibold">
                          {(mov.estoque_atual || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Documento</p>
                        <p className="font-semibold">{mov.documento || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Responsável</p>
                        <p className="font-semibold">{mov.responsavel || 'Sistema'}</p>
                      </div>
                    </div>

                    {mov.motivo && (
                      <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                        {mov.motivo}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-700">
                      R$ {(mov.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500">
                      R$ {(mov.valor_unitario || 0).toFixed(2)}/KG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}