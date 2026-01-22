import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, ShoppingCart, FileText, Upload, Package } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import HeaderComprasCompacto from "@/components/compras/compras-launchpad/HeaderComprasCompacto";
import KPIsCompras from "@/components/compras/compras-launchpad/KPIsCompras";
import ModulosGridCompras from "@/components/compras/compras-launchpad/ModulosGridCompras";

const FornecedoresTab = React.lazy(() => import("../components/compras/FornecedoresTab"));
const OrdensCompraTab = React.lazy(() => import("../components/compras/OrdensCompraTab"));
const SolicitacoesCompraTab = React.lazy(() => import("../components/compras/SolicitacoesCompraTab"));
const CotacoesTab = React.lazy(() => import("../components/compras/CotacoesTab"));
const ImportacaoNFeRecebimento = React.lazy(() => import("../components/compras/ImportacaoNFeRecebimento"));

export default function Compras() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filtrarPorContexto } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list('-created_date'),
  });

  const { data: ordensCompra = [] } = useQuery({
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

  const fornecedoresAtivos = fornecedoresFiltrados.filter(f => f.status === 'Ativo').length;
  const solicitacoesPendentes = solicitacoesFiltradas.filter(s => s.status === 'Pendente').length;

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Fornecedores',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'cyan',
      component: FornecedoresTab,
      windowTitle: '👥 Fornecedores',
      width: 1500,
      height: 850,
      props: { fornecedores: fornecedoresFiltrados, isLoading: false }
    },
    {
      title: 'Recebimento NF-e',
      description: 'Importação automática',
      icon: Upload,
      color: 'blue',
      component: ImportacaoNFeRecebimento,
      windowTitle: '📥 Recebimento NF-e',
      width: 1400,
      height: 800,
    },
    {
      title: 'Solicitações',
      description: 'Requisições internas',
      icon: FileText,
      color: 'orange',
      component: SolicitacoesCompraTab,
      windowTitle: '📋 Solicitações de Compra',
      width: 1400,
      height: 800,
      props: { solicitacoes: solicitacoesFiltradas },
      badge: solicitacoesPendentes > 0 ? `${solicitacoesPendentes} pendentes` : null
    },
    {
      title: 'Cotações',
      description: 'Comparativo de preços',
      icon: FileText,
      color: 'indigo',
      component: CotacoesTab,
      windowTitle: '💰 Cotações',
      width: 1400,
      height: 800,
    },
    {
      title: 'Ordens de Compra',
      description: 'Pedidos a fornecedores',
      icon: ShoppingCart,
      color: 'purple',
      component: OrdensCompraTab,
      windowTitle: '🛒 Ordens de Compra',
      width: 1500,
      height: 850,
      props: { ordensCompra: ordensCompraFiltradas, fornecedores: fornecedoresFiltrados, empresas, isLoading: false }
    },
  ];

  const handleModuleClick = (module) => {
    React.startTransition(() => {
      openWindow(
        module.component,
        { 
          ...(module.props || {}),
          windowMode: true 
        },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `compras-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-cyan-50">
        <HeaderComprasCompacto />
        
        <KPIsCompras
          totalFornecedores={fornecedoresFiltrados.length}
          fornecedoresAtivos={fornecedoresAtivos}
          totalOrdens={ordensCompraFiltradas.length}
          totalCompras={totalCompras}
        />

        <ModulosGridCompras 
          modules={modules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </ErrorBoundary>
  );
}