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
import HeaderComercialCompacto from "@/components/comercial/comercial-launchpad/HeaderComercialCompacto";
import KPIsComercial from "@/components/comercial/comercial-launchpad/KPIsComercial";
import ModulosGridComercial from "@/components/comercial/comercial-launchpad/ModulosGridComercial";

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
  const { openWindow, closeWindow } = useWindow();
  const { filtrarPorContexto, getFiltroContexto, empresaAtual, grupoAtual } = useContextoVisual();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Cliente.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2
  });

  const pedidosQuery = useQuery({
    queryKey: ['pedidos', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Pedido.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2
  });

  const { data: pedidos = [] } = pedidosQuery;
  const { data: comissoes = [] } = useQuery({
    queryKey: ['comissoes', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.Comissao.filter(filtro, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar comissões:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notasFiscais', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.NotaFiscal.filter(filtro, '-created_date', 50);
      } catch (err) {
        console.error('Erro ao buscar notas fiscais:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await base44.entities.TabelaPreco.list('-updated_date', 50);
      } catch (err) {
        console.error('Erro ao buscar tabelas de preço:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      try {
        return await base44.entities.Empresa.list();
      } catch (err) {
        console.error('Erro ao buscar empresas:', err);
        return [];
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: pedidosExternos = [] } = useQuery({
    queryKey: ['pedidos-externos', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        return await base44.entities.PedidoExterno.filter(filtro, '-created_date', 30);
      } catch (err) {
        console.error('Erro ao buscar pedidos externos:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1
  });

  // Dados já vêm filtrados do servidor
  const clientesFiltrados = clientes;
  const pedidosFiltrados = pedidos;
  const notasFiscaisFiltradas = notasFiscais;

  const pedidosExternosPendentes = pedidosExternos.filter(p => p.status_importacao === 'A Validar').length;
  const totalVendas = pedidosFiltrados.filter(p => p.status !== 'Cancelado').reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const ticketMedio = pedidosFiltrados.length > 0 ? totalVendas / pedidosFiltrados.length : 0;
  const clientesAtivos = clientesFiltrados.filter(c => c.status === 'Ativo').length;
  const pedidosPendentesAprovacao = pedidosFiltrados.filter(p => p.status_aprovacao === "pendente").length;
  const pedidosEntrega = pedidosFiltrados.filter(p => (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') && ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)).length;
  const pedidosRetirada = pedidosFiltrados.filter(p => p.tipo_frete === 'Retirada' && ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Pronto para Retirada'].includes(p.status)).length;

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
            const created = await base44.entities.Pedido.create({
              ...formData,
              empresa_id: formData.empresa_id || empresaAtual?.id,
              group_id: formData.group_id || grupoAtual?.id,
              vendedor: formData.vendedor || user?.full_name,
              vendedor_id: formData.vendedor_id || user?.id
            });
            toast.success("✅ Pedido criado!");
            await pedidosQuery.refetch();
          } catch (error) {
            pedidoCriado = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: '🛒 Novo Pedido', width: 1400, height: 800 }
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
            await base44.entities.Pedido.update(formData.id, formData);
            toast.success("✅ Pedido atualizado!");
            await pedidosQuery.refetch();
            if (windowIdRef) closeWindow(windowIdRef);
          } catch (error) {
            atualizacaoEmAndamento = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: `📝 Editar: ${pedido.numero_pedido}`, width: 1400, height: 800 }
    );
  };

  if (loadingPermissions) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const modules = [
    {
      title: 'Clientes',
      description: 'Cadastro e gestão',
      icon: Users,
      color: 'blue',
      component: ClientesTab,
      windowTitle: '👥 Clientes',
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
      windowTitle: '🛒 Pedidos',
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
      windowTitle: '🚚 Logística de Entrega',
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
      windowTitle: '📦 Pedidos p/ Retirada',
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
      windowTitle: '💰 Comissões',
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
      windowTitle: '📄 Notas Fiscais',
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
      windowTitle: '⚠️ Central de Aprovações',
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
      windowTitle: '💵 Tabelas de Preço',
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
      windowTitle: '📊 Canais em Tempo Real',
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
      <div className="w-full h-full p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <HeaderComercialCompacto />
        
        <KPIsComercial
          totalClientes={clientesFiltrados.length}
          clientesAtivos={clientesAtivos}
          totalPedidos={pedidosFiltrados.length}
          totalVendas={totalVendas}
          ticketMedio={ticketMedio}
        />

        {pedidosExternosPendentes > 0 && (
          <Badge className="bg-orange-100 text-orange-700 px-3 py-1.5 w-full justify-center">
            <AlertCircle className="w-3 h-3 mr-2" />
            {pedidosExternosPendentes} pedido(s) externo(s) a validar
          </Badge>
        )}

        <ModulosGridComercial 
          modules={allowedModules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </ErrorBoundary>
    </ProtectedSection>
  );
}