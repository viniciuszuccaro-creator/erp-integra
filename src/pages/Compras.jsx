import React, { useState, useEffect, Suspense, startTransition } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, Building2, FileText, TrendingUp, Upload } from "lucide-react";
const FornecedoresTab = React.lazy(() => import("../components/compras/FornecedoresTab"));
const OrdensCompraTab = React.lazy(() => import("../components/compras/OrdensCompraTab"));
const SolicitacoesCompraTab = React.lazy(() => import("../components/compras/SolicitacoesCompraTab"));
const CotacoesTab = React.lazy(() => import("../components/compras/CotacoesTab"));
const ImportacaoNFeRecebimento = React.lazy(() => import("../components/compras/ImportacaoNFeRecebimento"));
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";

export default function Compras() {
  const [activeTab, setActiveTab] = useState("fornecedores");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) { try { initial = localStorage.getItem('Compras_tab'); } catch {} }
    if (initial) startTransition(() => setActiveTab(initial));
  }, []);
  const handleTabChange = (value) => {
    startTransition(() => setActiveTab(value));
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Compras_tab', value); } catch {}
  };
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filtrarPorContexto } = useContextoVisual();

  const { data: fornecedores = [], isLoading: loadingFornecedores } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list('-created_date'),
  });

  const { data: ordensCompra = [], isLoading: loadingOrdens } = useQuery({
    queryKey: ['ordensCompra'],
    queryFn: () => base44.entities.OrdemCompra.list('-created_date'),
  });

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ['solicitacoes-compra'],
    queryFn: () => base44.entities.SolicitacaoCompra.list('-data_solicitacao'),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const fornecedoresFiltrados = filtrarPorContexto(fornecedores, 'empresa_dona_id');
  const ordensCompraFiltradas = filtrarPorContexto(ordensCompra, 'empresa_id');
  const solicitacoesFiltradas = filtrarPorContexto(solicitacoes, 'empresa_id');

  const totalCompras = ordensCompraFiltradas
    .filter(o => o.status !== 'Cancelada')
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);

  const fornecedoresAtivos = fornecedores.filter(f => f.status === 'Ativo').length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-screen w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Compras e Suprimentos</h1>
        <p className="text-slate-600">Gestão de fornecedores e ordens de compra</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Fornecedores</CardTitle>
            <Users className="w-5 h-5 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{fornecedoresFiltrados.length}</div>
            <p className="text-xs text-slate-500 mt-1">{fornecedoresFiltrados.filter(f => f.status === 'Ativo').length} ativos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ordens de Compra</CardTitle>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{ordensCompraFiltradas.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total em Compras</CardTitle>
            <Package className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              R$ {totalCompras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <ErrorBoundary>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="fornecedores" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="recebimento" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Recebimento NF-e
          </TabsTrigger>
          <TabsTrigger value="solicitacoes" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Solicitações ({solicitacoesFiltradas.filter(s => s.status === 'Pendente').length})
          </TabsTrigger>
          <TabsTrigger value="cotacoes" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Cotações
          </TabsTrigger>
          <TabsTrigger value="ordens" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ordens de Compra
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fornecedores">
          <Suspense fallback={<div>Carregando...</div>}>
            <FornecedoresTab fornecedores={fornecedoresFiltrados} isLoading={loadingFornecedores} />
          </Suspense>
        </TabsContent>

        <TabsContent value="recebimento">
          <Suspense fallback={<div>Carregando...</div>}>
            <ImportacaoNFeRecebimento />
          </Suspense>
        </TabsContent>

        <TabsContent value="solicitacoes">
          <Suspense fallback={<div>Carregando...</div>}>
            <SolicitacoesCompraTab solicitacoes={solicitacoesFiltradas} />
          </Suspense>
        </TabsContent>

        <TabsContent value="cotacoes">
          <Suspense fallback={<div>Carregando...</div>}>
            <CotacoesTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="ordens">
          <Suspense fallback={<div>Carregando...</div>}>
            <OrdensCompraTab ordensCompra={ordensCompraFiltradas} fornecedores={fornecedoresFiltrados} empresas={empresas} isLoading={loadingOrdens} />
          </Suspense>
        </TabsContent>
        </Tabs>
      </ErrorBoundary>
    </div>
  );
}