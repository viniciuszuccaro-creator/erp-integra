import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, ShoppingCart, FileText, TrendingUp, ShieldCheck, Truck, Package, AlertCircle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import ProtectedSection from "@/components/security/ProtectedSection";
import { toast } from "sonner";
import PedidoFormCompleto from "../components/comercial/PedidoFormCompleto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ValidarPedidosExternos from "@/components/comercial/ValidarPedidosExternos";
import HeaderComercialCompacto from "@/components/comercial/comercial-launchpad/HeaderComercialCompacto";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleKPIs from "@/components/layout/ModuleKPIs";
import ModuleContent from "@/components/layout/ModuleContent";
import ModuleTabs from "@/components/layout/ModuleTabs";
import KPIsComercial from "@/components/comercial/comercial-launchpad/KPIsComercial";
import ModulosGridComercial from "@/components/comercial/comercial-launchpad/ModulosGridComercial";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useComercialDerivedData from "@/components/comercial/hooks/useComercialDerivedData";

const ClientesTab = React.lazy(() => import("../components/comercial/ClientesTab"));
const PedidosTab = React.lazy(() => import("../components/comercial/PedidosTab"));
const ComissoesTab = React.lazy(() => import("../components/comercial/ComissoesTab"));
const NotasFiscaisTab = React.lazy(() => import("../components/comercial/NotasFiscaisTab"));
const TabelasPrecoTab = React.lazy(() => import("../components/comercial/TabelasPrecoTab"));
const CentralAprovacoesManager = React.lazy(() => import("../components/comercial/CentralAprovacoesManager"));
const PedidosEntregaTab = React.lazy(() => import("../components/comercial/PedidosEntregaTab"));
const PedidosRetiradaTab = React.lazy(() => import("../components/comercial/PedidosRetiradaTab"));
const MonitoramentoCanaisRealtime = React.lazy(() => import("@/components/comercial/MonitoramentoCanaisRealtime"));

export default function Comercial() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const canSeeComercial = hasPermission('Comercial', null, 'ver');
  const { openWindow, closeWindow } = useWindow();
  const { filterInContext, getFiltroContexto, createInContext, updateInContext, empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const bloqueadoSemEmpresa = !estaNoGrupo && !empresaAtual;

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id, estaNoGrupo, grupoAtual?.id],
    queryFn: async () => {
      try {
        const data = await filterInContext('Cliente', {}, '-created_date', 100);
        if (!data || data.length === 0) {
          return await base44.entities.Cliente.filter(getFiltroContexto('empresa_id', true), '-created_date', 100);
        }
        return data;
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return await base44.entities.Cliente.list('-created_date', 100);
      }
    },
    staleTime: 30000,
    retry: 2,
    enabled: !bloqueadoSemEmpresa && canSeeComercial
  });

  const pedidosQuery = useQuery({
    queryKey: ['pedidos', empresaAtual?.id, estaNoGrupo, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const data = await filterInContext('Pedido', {}, '-created_date', 100);
        if (!data || data.length === 0) {
          return await base44.entities.Pedido.filter(getFiltroContexto('empresa_id', true), '-created_date', 100);
        }
        return data;
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2,
    enabled: !bloqueadoSemEmpresa && canSeeComercial
  });

  const { data: pedidos = [] } = pedidosQuery;
  const { data: comissoes = [] } = useQuery({
    queryKey: ['comissoes', empresaAtual?.id, estaNoGrupo, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const data = await filterInContext('Comissao', {}, '-created_date', 50);
        if (!data || data.length === 0) {
          return await base44.entities.Comissao.filter(getFiltroContexto('empresa_id', true), '-created_date', 50);
        }
        return data;
      } catch (err) {
        console.error('Erro ao buscar comissões:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: !bloqueadoSemEmpresa && canSeeComercial
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notasFiscais', empresaAtual?.id, estaNoGrupo, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const data = await filterInContext('NotaFiscal', {}, '-created_date', 50, 'empresa_faturamento_id');
        if (!data || data.length === 0) {
          return await base44.entities.NotaFiscal.filter(getFiltroContexto('empresa_faturamento_id', true), '-created_date', 50);
        }
        return data;
      } catch (err) {
        console.error('Erro ao buscar notas fiscais:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: !bloqueadoSemEmpresa && canSeeComercial
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco', empresaAtual?.id, estaNoGrupo, grupoAtual?.id],
    queryFn: async () => {
      try {
        const data = await filterInContext('TabelaPreco', {}, '-updated_date', 50);
        if (!data || data.length === 0) {
          return await base44.entities.TabelaPreco.filter(getFiltroContexto('empresa_id', true), '-updated_date', 50);
        }
        return data;
      } catch (err) {
        console.error('Erro ao buscar tabelas de preço:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: !bloqueadoSemEmpresa && canSeeComercial
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas', empresaAtual?.id, estaNoGrupo, grupoAtual?.id],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo)) return [];
      return await filterInContext('Empresa', {}, '-created_date', 9999);
    },
    staleTime: 60000,
    retry: 1,
    enabled: canSeeComercial && (empresaAtual?.id || estaNoGrupo)
  });

  const { data: pedidosExternos = [] } = useQuery({
    queryKey: ['pedidos-externos', empresaAtual?.id, estaNoGrupo, grupoAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const data = await filterInContext('PedidoExterno', {}, '-created_date', 30);
        if (!data || data.length === 0) {
          return await base44.entities.PedidoExterno?.filter ? await base44.entities.PedidoExterno.filter(getFiltroContexto('empresa_id', true), '-created_date', 30) : [];
        }
        return data;
      } catch (err) {
        console.error('Erro ao buscar pedidos externos:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
    enabled: !bloqueadoSemEmpresa && canSeeComercial
  });

  // Dados já vêm filtrados do servidor
  const clientesFiltrados = clientes;
  const pedidosFiltrados = pedidos;
  const notasFiscaisFiltradas = notasFiscais;

  const {
    pedidosExternosPendentes,
    totalVendas,
    ticketMedio,
    clientesAtivos,
    pedidosPendentesAprovacao,
    pedidosEntrega,
    pedidosRetirada,
  } = useComercialDerivedData({ pedidos: pedidosFiltrados, clientes: clientesFiltrados, pedidosExternos });

  const handleCreateNewPedido = () => {
    let pedidoCriado = false;
    openWindow(
      PedidoFormCompleto,
      {
        clientes,
        windowMode: true,
        pedido: { status: 'Rascunho' },
        onSubmit: async (formData) => {
          if (pedidoCriado) return;
          pedidoCriado = true;
          try {
            const created = await createInContext('Pedido', {
              ...formData,
              vendedor: formData.vendedor || user?.full_name,
              vendedor_id: formData.vendedor_id || user?.id
            });
            toast.success("Pedido criado!");
            await pedidosQuery.refetch();
          } catch (error) {
            pedidoCriado = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: ' Novo Pedido', width: 1400, height: 800 }
    );
  };

  const handleEditPedido = (pedido) => {
    let atualizacaoEmAndamento = false;
    let windowIdRef = openWindow(
      PedidoFormCompleto,
      {
        pedido,
        clientes,
        windowMode: true,
        onSubmit: async (formData) => {
          if (atualizacaoEmAndamento) return;
          atualizacaoEmAndamento = true;
          try {
            await updateInContext('Pedido', formData.id, formData);
            toast.success("Pedido atualizado!");
            await pedidosQuery.refetch();
            if (windowIdRef) closeWindow(windowIdRef);
          } catch (error) {
            atualizacaoEmAndamento = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: `Editar: ${pedido.numero_pedido}`, width: 1400, height: 800 }
    );
  };

  if (loadingPermissions) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (bloqueadoSemEmpresa) {
    return (
      <ProtectedSection module="Comercial" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados do módulo.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

  const modules = [
    {
      title: 'Clientes',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'blue',
      component: ClientesTab,
      windowTitle: ' Clientes',
      width: 1500,
      height: 850,
      props: { clientes, isLoading: false }
    },
    {
      title: 'Pedidos',
      description: 'Orçamentos e vendas',
      icon: ShoppingCart,
      color: 'purple',
      component: PedidosTab,
      windowTitle: ' Pedidos',
      width: 1500,
      height: 850,
      props: { pedidos: pedidosFiltrados, clientes: clientesFiltrados, isLoading: false, empresas, onCreatePedido: handleCreateNewPedido, onEditPedido: handleEditPedido }
    },
    {
      title: 'Logística Entrega',
      description: 'CIF e FOB',
      icon: Truck,
      color: 'blue',
      component: PedidosEntregaTab,
      windowTitle: ' Logística de Entrega',
      width: 1400,
      height: 800,
      badge: pedidosEntrega > 0 ? `${pedidosEntrega}` : null
    },
    {
      title: 'Pedidos Retirada',
      description: 'Cliente retira',
      icon: Package,
      color: 'green',
      component: PedidosRetiradaTab,
      windowTitle: ' Pedidos p/ Retirada',
      width: 1400,
      height: 800,
      badge: pedidosRetirada > 0 ? `${pedidosRetirada}` : null
    },
    {
      title: 'Comissões',
      description: 'Vendedores e indicadores',
      icon: TrendingUp,
      color: 'green',
      component: ComissoesTab,
      windowTitle: 'Comissões',
      width: 1400,
      height: 800,
      props: { comissoes, pedidos, empresas }
    },
    {
      title: 'Notas Fiscais',
      description: 'NF-e emitidas',
      icon: FileText,
      color: 'indigo',
      component: NotasFiscaisTab,
      windowTitle: ' Notas Fiscais',
      width: 1500,
      height: 850,
      props: { notasFiscais: notasFiscaisFiltradas, pedidos: pedidosFiltrados, clientes: clientesFiltrados }
    },
    {
      title: 'Aprovações',
      description: 'Descontos hierárquicos',
      icon: ShieldCheck,
      color: 'orange',
      component: CentralAprovacoesManager,
      windowTitle: 'Aviso: Central de Aprovações',
      width: 1400,
      height: 800,
      badge: pedidosPendentesAprovacao > 0 ? `${pedidosPendentesAprovacao} pendentes` : null
    },
    {
      title: 'Tabelas de Preço',
      description: 'Gestão de preços',
      icon: TrendingUp,
      color: 'indigo',
      component: TabelasPrecoTab,
      windowTitle: ' Tabelas de Preço',
      width: 1400,
      height: 800,
      props: { tabelasPreco }
    },
    {
      title: 'Canais Realtime',
      description: 'Monitoramento de origem',
      icon: TrendingUp,
      color: 'cyan',
      component: MonitoramentoCanaisRealtime,
      windowTitle: ' Canais em Tempo Real',
      width: 1300,
      height: 750,
      props: { autoRefresh: true }
    }
  ];

  const allowedModules = modules.filter(m => hasPermission('Comercial', (m.sectionKey || m.title), 'ver'));

   const handleModuleClick = (module) => {
    React.startTransition(() => {
      // Auditoria de abertura de seção
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        acao: 'Visualização',
        modulo: 'Comercial',
        tipo_auditoria: 'acesso',
        entidade: 'Seção',
        descricao: `Abrir seção: ${module.title}`,
        data_hora: new Date().toISOString(),
      });
      openWindow(
        module.component,
        { ...(module.props || {}), windowMode: true },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `comercial-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ProtectedSection module="Comercial" action="visualizar">
    <ErrorBoundary>
      <ModuleLayout
              title="Comercial e Vendas"
              subtitle="Vendas, clientes e canais"
              actions={<div className="flex items-center gap-2">
                <Button onClick={handleCreateNewPedido} className="bg-indigo-600 hover:bg-indigo-700">Novo Pedido</Button>
                <Button
                  variant="outline"
                  onClick={() => openWindow(ValidarPedidosExternos, { windowMode: true }, { title: 'Validar Pedidos Externos', width: 1300, height: 800 })}
                >Validar Pedido Externo</Button>
              </div>}
            >
              <ModuleKPIs>
                <KPIsComercial
                  totalClientes={clientesFiltrados.length}
                  clientesAtivos={clientesAtivos}
                  totalPedidos={pedidosFiltrados.length}
                  totalVendas={totalVendas}
                  ticketMedio={ticketMedio}
                />
                {pedidosExternosPendentes > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 px-3 py-2 text-sm font-medium">
                    <AlertCircle className="w-3 h-3 mr-2" />
                    {pedidosExternosPendentes} pedido(s) externo(s) a validar
                  </Badge>
                )}
              </ModuleKPIs>
              <ModuleContent>
                <ModuleTabs
                  listagem={<ModulosGridComercial modules={allowedModules} onModuleClick={handleModuleClick} />}
                />
              </ModuleContent>
            </ModuleLayout>
    </ErrorBoundary>
    </ProtectedSection>
  );
}