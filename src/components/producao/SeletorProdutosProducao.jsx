import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, Factory, Package, AlertTriangle, 
  CheckCircle2, Zap, Filter 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * V21.6 - SELETOR INTELIGENTE DE PRODUTOS PARA PRODUÇÃO
 * Usado em Ordens de Produção para selecionar matéria-prima
 * ✅ Filtra apenas produtos do tipo "Matéria-Prima Produção"
 * ✅ Mostra estoque disponível em tempo real
 * ✅ Alerta de estoque insuficiente
 * ✅ Busca inteligente por descrição, código, bitola
 * ✅ Filtros por tipo de aço, diâmetro
 */
export default function SeletorProdutosProducao({ onSelecionarProduto, quantidadeNecessaria }) {
  const [busca, setBusca] = useState('');
  const [filtroBitola, setFiltroBitola] = useState('todos');
  const [filtroTipoAco, setFiltroTipoAco] = useState('todos');

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos-producao-ativas'],
    queryFn: async () => {
      const all = await base44.entities.Produto.list();
      return all.filter(p => 
        p.tipo_item === 'Matéria-Prima Produção' && 
        p.status === 'Ativo'
      );
    }
  });

  const produtosFiltrados = produtos.filter(p => {
    const matchBusca = !busca || 
      p.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busca.toLowerCase());
    
    const matchBitola = filtroBitola === 'todos' || 
      (filtroBitola === 'bitolas' && p.eh_bitola) ||
      (filtroBitola === 'outros' && !p.eh_bitola);
    
    const matchTipoAco = filtroTipoAco === 'todos' || p.tipo_aco === filtroTipoAco;
    
    return matchBusca && matchBitola && matchTipoAco;
  });

  // Estatísticas
  const totalProdutos = produtos.length;
  const totalBitolas = produtos.filter(p => p.eh_bitola).length;
  const produtosComEstoque = produtos.filter(p => (p.estoque_disponivel || p.estoque_atual || 0) > 0).length;

  return (
    <div className="w-full h-full space-y-4">
      {/* Header com Estatísticas */}
      <Alert className="border-orange-300 bg-orange-50">
        <Factory className="w-5 h-5 text-orange-600" />
        <AlertDescription>
          <p className="font-semibold text-orange-900 mb-2">
            🏭 Produtos Disponíveis para Produção
          </p>
          <div className="flex gap-6 text-sm text-orange-800">
            <span>• Total: <strong>{totalProdutos}</strong></span>
            <span>• Bitolas: <strong>{totalBitolas}</strong></span>
            <span>• Com Estoque: <strong>{produtosComEstoque}</strong></span>
          </div>
        </AlertDescription>
      </Alert>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto, código ou bitola..."
            className="pl-10"
          />
        </div>

        <Select value={filtroBitola} onValueChange={setFiltroBitola}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Tipos</SelectItem>
            <SelectItem value="bitolas">Apenas Bitolas</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroTipoAco} onValueChange={setFiltroTipoAco}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos Aços</SelectItem>
            <SelectItem value="CA-25">CA-25</SelectItem>
            <SelectItem value="CA-50">CA-50</SelectItem>
            <SelectItem value="CA-60">CA-60</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Produtos */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">
            Produtos Encontrados ({produtosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto divide-y">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Carregando produtos...</p>
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold mb-2">Nenhum produto encontrado</p>
                <p className="text-sm text-slate-400">
                  Ajuste os filtros ou cadastre novos produtos
                </p>
              </div>
            ) : (
              produtosFiltrados.map((produto) => {
                const estoqueDisponivel = produto.estoque_disponivel || produto.estoque_atual || 0;
                const estoqueInsuficiente = quantidadeNecessaria && estoqueDisponivel < quantidadeNecessaria;
                
                return (
                  <div
                    key={produto.id}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelecionarProduto && onSelecionarProduto(produto)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-slate-900">{produto.descricao}</p>
                          {produto.eh_bitola && (
                            <Badge className="bg-blue-600 text-white">
                              <Zap className="w-3 h-3 mr-1" />
                              {produto.tipo_aco} {produto.bitola_diametro_mm}mm
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-4 text-xs text-slate-600">
                          <span>SKU: {produto.codigo}</span>
                          <span>NCM: {produto.ncm || 'N/A'}</span>
                          {produto.peso_teorico_kg_m > 0 && (
                            <span>Peso: {produto.peso_teorico_kg_m} kg/m</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          estoqueInsuficiente ? 'text-red-600' : 
                          estoqueDisponivel > 0 ? 'text-green-600' : 
                          'text-slate-400'
                        }`}>
                          {estoqueDisponivel} {produto.unidade_principal}
                        </p>
                        <p className="text-xs text-slate-500">
                          {estoqueInsuficiente ? '⚠️ Insuficiente' : 
                           estoqueDisponivel > 0 ? '✅ Disponível' : 
                           '❌ Sem estoque'}
                        </p>
                      </div>
                    </div>

                    {estoqueInsuficiente && (
                      <Alert className="border-red-300 bg-red-50 mt-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-xs text-red-800">
                          Necessário: {quantidadeNecessaria} {produto.unidade_principal} • 
                          Faltam: {(quantidadeNecessaria - estoqueDisponivel).toFixed(2)} {produto.unidade_principal}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}