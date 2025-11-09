
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, Building2, FileText, TrendingUp } from "lucide-react";
import FornecedoresTab from "../components/compras/FornecedoresTab";
import OrdensCompraTab from "../components/compras/OrdensCompraTab";
import SolicitacoesCompraTab from "../components/compras/SolicitacoesCompraTab";
import CotacoesTab from "../components/compras/CotacoesTab";
import usePermissions from "@/components/lib/usePermissions";

export default function Compras() {
  const [activeTab, setActiveTab] = useState("fornecedores");
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();

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

  const totalCompras = ordensCompra
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
    <div className="p-6 lg:p-8 space-y-6">
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
            <div className="text-3xl font-bold text-cyan-600">{fornecedores.length}</div>
            <p className="text-xs text-slate-500 mt-1">{fornecedoresAtivos} ativos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ordens de Compra</CardTitle>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{ordensCompra.length}</div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="fornecedores" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="solicitacoes" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Solicitações ({solicitacoes.filter(s => s.status === 'Pendente').length})
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
          <FornecedoresTab fornecedores={fornecedores} isLoading={loadingFornecedores} />
        </TabsContent>

        <TabsContent value="solicitacoes">
          <SolicitacoesCompraTab solicitacoes={solicitacoes} />
        </TabsContent>

        <TabsContent value="cotacoes">
          <CotacoesTab />
        </TabsContent>

        <TabsContent value="ordens">
          <OrdensCompraTab ordensCompra={ordensCompra} fornecedores={fornecedores} isLoading={loadingOrdens} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
