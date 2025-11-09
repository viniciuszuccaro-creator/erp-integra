import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Box, TrendingUp, Search, AlertTriangle } from "lucide-react";

/**
 * V21.4 - Saldos por Local (Gêmeo Digital)
 * Exibe estoque SEMPRE em KG + locais físicos
 */
export default function SaldosPorLocal({ empresaId }) {
  const [busca, setBusca] = useState('');
  const [localFiltro, setLocalFiltro] = useState('todos');

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-estoque', empresaId],
    queryFn: () => base44.entities.Produto.filter({ empresa_id: empresaId })
  });

  const { data: locais = [] } = useQuery({
    queryKey: ['locais-estoque', empresaId],
    queryFn: () => base44.entities.LocalEstoque.filter({ empresa_id: empresaId })
  });

  const produtosFiltrados = produtos.filter(p => {
    const buscaMatch = !busca || 
      p.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busca.toLowerCase());
    
    return buscaMatch;
  });

  const calcularTotais = () => {
    const totalEstoque = produtosFiltrados.reduce((sum, p) => sum + (p.estoque_atual || 0), 0);
    const totalDisponivel = produtosFiltrados.reduce((sum, p) => sum + (p.estoque_disponivel || 0), 0);
    const totalReservado = produtosFiltrados.reduce((sum, p) => sum + (p.estoque_reservado || 0), 0);
    const totalAbaixoMinimo = produtosFiltrados.filter(p => 
      (p.estoque_disponivel || 0) < (p.estoque_minimo || 0)
    ).length;

    return { totalEstoque, totalDisponivel, totalReservado, totalAbaixoMinimo };
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <Box className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-blue-700 mb-1">Estoque Total</p>
            <p className="text-2xl font-bold text-blue-600">
              {totais.totalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} KG
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
            <p className="text-xs text-green-700 mb-1">Disponível</p>
            <p className="text-2xl font-bold text-green-600">
              {totais.totalDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} KG
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <MapPin className="w-5 h-5 text-orange-600 mb-2" />
            <p className="text-xs text-orange-700 mb-1">Reservado</p>
            <p className="text-2xl font-bold text-orange-600">
              {totais.totalReservado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} KG
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-xs text-red-700 mb-1">Abaixo Mínimo</p>
            <p className="text-3xl font-bold text-red-600">
              {totais.totalAbaixoMinimo}
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
                placeholder="Buscar produto, código..."
                className="pl-10"
              />
            </div>

            <select
              value={localFiltro}
              onChange={(e) => setLocalFiltro(e.target.value)}
              className="p-2 border rounded-lg bg-white min-w-[200px]"
            >
              <option value="todos">Todos Locais</option>
              {locais.map(local => (
                <option key={local.id} value={local.id}>
                  {local.nome_local}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* V21.4: NOVO - Gêmeo Digital (Preview) */}
      {locais.length > 0 && (
        <Alert className="border-purple-300 bg-purple-50">
          <MapPin className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-800">
            <strong>🏗️ Gêmeo Digital de Estoque:</strong> {locais.length} local(is) mapeado(s). 
            Use o App Estoque para visualizar o mapa 3D do CD.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Produtos */}
      <div className="space-y-2">
        {produtosFiltrados.map(produto => {
          const abaixoMinimo = (produto.estoque_disponivel || 0) < (produto.estoque_minimo || 0);
          const disponibilidade = produto.estoque_atual > 0 
            ? ((produto.estoque_disponivel / produto.estoque_atual) * 100)
            : 0;

          return (
            <Card 
              key={produto.id}
              className={`border-2 hover:shadow-lg transition-all ${
                abaixoMinimo ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-lg">{produto.descricao}</p>
                      <Badge variant="outline">{produto.codigo}</Badge>
                      
                      {produto.eh_bitola && (
                        <Badge className="bg-blue-600">Bitola</Badge>
                      )}

                      {abaixoMinimo && (
                        <Badge className="bg-red-600">Abaixo Mínimo</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-6 gap-3 text-xs mt-3">
                      <div>
                        <p className="text-slate-500">Estoque Total</p>
                        <p className="font-bold text-blue-600">
                          {(produto.estoque_atual || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Disponível</p>
                        <p className="font-bold text-green-600">
                          {(produto.estoque_disponivel || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reservado</p>
                        <p className="font-bold text-orange-600">
                          {(produto.estoque_reservado || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Estoque Mín</p>
                        <p className="font-bold">
                          {(produto.estoque_minimo || 0).toFixed(2)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Localização</p>
                        <p className="font-bold">{produto.localizacao || 'Não definida'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Disponibilidade</p>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                disponibilidade > 70 ? 'bg-green-600' :
                                disponibilidade > 30 ? 'bg-orange-600' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${disponibilidade}%` }}
                            />
                          </div>
                          <span className="font-bold text-xs">
                            {disponibilidade.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* V22.0: Conversão de Unidades */}
                    {produto.eh_bitola && produto.peso_teorico_kg_m && (
                      <div className="mt-2 p-2 bg-slate-100 rounded text-xs">
                        <p className="text-slate-600">
                          <strong>Equivalentes:</strong> {' '}
                          {(produto.estoque_disponivel / produto.peso_teorico_kg_m).toFixed(2)} MT • {' '}
                          {produto.fatores_conversao?.metros_por_peca 
                            ? (produto.estoque_disponivel / produto.peso_teorico_kg_m / produto.fatores_conversao.metros_por_peca).toFixed(0) 
                            : 0} PÇ
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {produtosFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-slate-400">
              <Box className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p>Nenhum produto encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}