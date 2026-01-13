import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Box, 
  PackageOpen, 
  AlertTriangle, 
  TrendingUp, 
  PackageCheck, 
  PackageMinus, 
  Building2, 
  ArrowLeftRight, 
  Clock, 
  BarChart3,
  Package,
  TrendingDown,
  ShoppingCart,
  FileText,
  Sparkles
} from "lucide-react";
import ProdutosTab from "../components/estoque/ProdutosTab";
import MovimentacoesTab from "../components/estoque/MovimentacoesTab";
import SolicitacoesTab from "../components/estoque/SolicitacoesTab";
import RecebimentoTab from "../components/estoque/RecebimentoTab";
import RequisicoesAlmoxarifadoTab from "../components/estoque/RequisicoesAlmoxarifadoTab";
import ControleLotesValidade from "../components/estoque/ControleLotesValidade";
import RelatoriosEstoque from "../components/estoque/RelatoriosEstoque";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import FiltroEmpresaContexto from "@/components/FiltroEmpresaContexto";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import usePermissions from "@/components/lib/usePermissions";
import IAReposicao from "../components/estoque/IAReposicao";
import { useWindow } from "@/components/lib/useWindow";
import TransferenciaEntreEmpresasForm from "../components/estoque/TransferenciaEntreEmpresasForm";

export default function Estoque() {
  const [activeTab, setActiveTab] = useState("produtos");
  const [visaoConsolidada, setVisaoConsolidada] = useState(false);
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow } = useWindow();

  const {
    contexto,
    estaNoGrupo,
    empresaAtual,
    empresasDoGrupo,
    filtrarPorContexto
  } = useContextoVisual();

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes'],
    queryFn: () => base44.entities.MovimentacaoEstoque.list('-created_date', 100),
  });

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ['solicitacoes'],
    queryFn: () => base44.entities.SolicitacaoCompra.list('-created_date'),
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordensCompra'],
    queryFn: () => base44.entities.OrdemCompra.list('-created_date'),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: ops = [] } = useQuery({
    queryKey: ['ordens-producao'],
    queryFn: () => base44.entities.OrdemProducao.list(),
  });

  const produtosFiltrados = filtrarPorContexto(produtos, 'empresa_id');
  const movimentacoesFiltradas = filtrarPorContexto(movimentacoes, 'empresa_id');

  const produtosAtivos = produtosFiltrados.filter(p => p.status === 'Ativo').length;
  const produtosBaixoEstoque = produtosFiltrados.filter(p => 
    p.estoque_atual <= p.estoque_minimo && p.status === 'Ativo'
  ).length;
  const valorTotalEstoque = produtosFiltrados.reduce((sum, p) => 
    sum + ((p.estoque_atual || 0) * (p.custo_aquisicao || 0)), 0
  );
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'Pendente').length;

  const estoqueDisponivel = produtosFiltrados.reduce((sum, p) => {
    const disp = (p.estoque_atual || 0) - (p.estoque_reservado || 0);
    return sum + (disp * (p.custo_aquisicao || 0));
  }, 0);

  const totalReservado = produtosFiltrados.reduce((sum, p) => 
    sum + ((p.estoque_reservado || 0) * (p.custo_aquisicao || 0)), 0
  );

  const estoqueConsolidado = estaNoGrupo ? produtos.reduce((acc, produto) => {
    const key = produto.codigo || produto.descricao;
    if (!acc[key]) {
      acc[key] = {
        codigo: produto.codigo,
        descricao: produto.descricao,
        unidade: produto.unidade_medida,
        total: 0,
        porEmpresa: {}
      };
    }
    
    acc[key].total += produto.estoque_atual || 0;
    
    const nomeEmpresa = empresasDoGrupo.find(e => e.id === produto.empresa_id)?.nome_fantasia || 'Sem Empresa';
    if (!acc[key].porEmpresa[nomeEmpresa]) {
      acc[key].porEmpresa[nomeEmpresa] = 0;
    }
    acc[key].porEmpresa[nomeEmpresa] += produto.estoque_atual || 0;
    
    return acc;
  }, {}) : {};

  const listaConsolidada = Object.values(estoqueConsolidado);

  const recebimentos = movimentacoesFiltradas.filter(m => 
    m.tipo_movimento === 'entrada' && (m.origem_movimento === 'compra' || m.documento?.startsWith('REC-'))
  );

  const requisicoesAlmoxarifado = movimentacoesFiltradas.filter(m => 
    m.tipo_movimento === 'saida' && m.documento?.startsWith('REQ-ALM-')
  );

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Estoque e Almoxarifado</h1>
          <p className="text-slate-600">
            {estaNoGrupo 
              ? 'Visão consolidada de todos os estoques' 
              : `Gestão de estoque - ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || ''}`
            }
          </p>
        </div>
        {estaNoGrupo && (
          <Button
            onClick={() => openWindow(TransferenciaEntreEmpresasForm, {
              empresasDoGrupo,
              produtos,
              windowMode: true
            }, {
              title: '↔️ Transferência Entre Empresas',
              width: 900,
              height: 600
            })}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Transferir entre Empresas
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Produtos</CardTitle>
            <Box className="w-5 h-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{produtosAtivos}</div>
            <p className="text-xs text-slate-500 mt-1">ativos no sistema</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Estoque Baixo</CardTitle>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{produtosBaixoEstoque}</div>
            <p className="text-xs text-slate-500 mt-1">produtos abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Reservado</CardTitle>
            <PackageOpen className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              R$ {totalReservado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-700 mt-1">em pedidos/produção</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Disponível</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              R$ {estoqueDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-700 mt-1">para venda/produção</p>
          </CardContent>
        </Card>
      </div>

      {estaNoGrupo && (
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-slate-50">
            <div className="flex justify-between items-center">
              <CardTitle>Estoque Consolidado por Empresa</CardTitle>
              
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setVisaoConsolidada(!visaoConsolidada)}
              >
                {visaoConsolidada ? 'Ocultar' : 'Ver por Empresa'}
              </button>
            </div>
          </CardHeader>
          {visaoConsolidada && (
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Produto</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Total Grupo</TableHead>
                      {empresasDoGrupo.map(emp => (
                        <TableHead key={emp.id} className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Building2 className="w-3 h-3" />
                            {emp.nome_fantasia || emp.razao_social}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listaConsolidada.slice(0, 20).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.codigo && <span className="text-xs text-slate-500 mr-2">{item.codigo}</span>}
                          {item.descricao}
                        </TableCell>
                        <TableCell>{item.unidade}</TableCell>
                        <TableCell className="text-right font-bold text-blue-600">
                          {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        {empresasDoGrupo.map(emp => {
                          const nomeEmp = emp.nome_fantasia || emp.razao_social;
                          const qtd = item.porEmpresa[nomeEmp] || 0;
                          return (
                            <TableCell key={emp.id} className="text-right">
                              {qtd > 0 ? (
                                <span className="font-semibold">{qtd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {listaConsolidada.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Box className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum produto com estoque encontrado</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="produtos" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Box className="w-4 h-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="movimentacoes" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Movimentações
          </TabsTrigger>
          <TabsTrigger value="recebimento" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <PackageCheck className="w-4 h-4 mr-2" />
            Recebimento
          </TabsTrigger>
          <TabsTrigger value="requisicoes-almox" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <PackageMinus className="w-4 h-4 mr-2" />
            Requisições Almox.
          </TabsTrigger>
          <TabsTrigger value="solicitacoes" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <PackageOpen className="w-4 h-4 mr-2" />
            Solicitações Compra
          </TabsTrigger>
          <TabsTrigger value="lotes" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Lotes e Validade
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
          
          <TabsTrigger 
            value="ia-reposicao" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            IA Reposição
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <ProdutosTab produtos={produtosFiltrados} isLoading={false} />
        </TabsContent>

        

        <TabsContent value="movimentacoes">
          <MovimentacoesTab movimentacoes={movimentacoesFiltradas} produtos={produtosFiltrados} />
        </TabsContent>

        <TabsContent value="recebimento">
          <RecebimentoTab recebimentos={recebimentos} ordensCompra={ordensCompra} produtos={produtosFiltrados} />
        </TabsContent>

        <TabsContent value="requisicoes-almox">
          <RequisicoesAlmoxarifadoTab requisicoes={requisicoesAlmoxarifado} produtos={produtosFiltrados} />
        </TabsContent>

        <TabsContent value="solicitacoes">
          <SolicitacoesTab solicitacoes={solicitacoes} produtos={produtosFiltrados} />
        </TabsContent>
        
        <TabsContent value="lotes">
          <ControleLotesValidade empresaId={empresaAtual?.id} />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosEstoque produtos={produtosFiltrados} movimentacoes={movimentacoesFiltradas} />
        </TabsContent>

        
        <TabsContent value="ia-reposicao">
          <IAReposicao empresaId={empresaAtual?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}