import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import useQueryWithRateLimit from "@/components/lib/useQueryWithRateLimit";
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
  const { filtrarPorContexto, empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: fornecedores = [] } = useQueryWithRateLimit(
    ['fornecedores', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_dona_id: empresaAtual.id } : {};
      return await base44.entities.Fornecedor.filter(filtro, '-created_date', 100);
    },
    { initialData: [] }
  );

  const { data: totalFornecedores = 0 } = useQueryWithRateLimit(
    ['fornecedores-count-compras', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_dona_id: empresaAtual.id } : {};
      const response = await base44.functions.invoke('countEntities', {
        entityName: 'Fornecedor',
        filter: filtro
      });
      return response.data?.count || 0;
    },
    { initialData: 0 }
  );

  const { data: ordensCompra = [] } = useQueryWithRateLimit(
    ['ordensCompra', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      return await base44.entities.OrdemCompra.filter(filtro, '-created_date', 100);
    },
    { initialData: [] }
  );

  const { data: solicitacoes = [] } = useQueryWithRateLimit(
    ['solicitacoes-compra', empresaAtual?.id],
    async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
      return await base44.entities.SolicitacaoCompra.filter(filtro, '-data_solicitacao', 100);
    },
    { initialData: [] }
  );

  const { data: empresas = [] } = useQueryWithRateLimit(
    ['empresas'],
    async () => {
      return await base44.entities.Empresa.list();
    },
    { initialData: [] }
  );

  const fornecedoresFiltrados = fornecedores;
  const ordensCompraFiltradas = ordensCompra;
  const solicitacoesFiltradas = solicitacoes;

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
          totalFornecedores={totalFornecedores}
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