import React, { useEffect, useState, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
        LayoutDashboard, 
        Users, 
        ShoppingCart, 
        Truck, 
        DollarSign, 
        Package,
        UserCircle,
        Menu,
        LogOut,
        Box,
        FileText,
        Settings,
        Shield,
        Calendar,
        BarChart3,
        Factory,
        BookOpen,
        Search,
        MessageCircle,
        CheckCircle2,
        Trophy,
        Zap
      } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import usePermissions from "@/components/lib/usePermissions";
import NotificationCenter from "@/components/NotificationCenter";
import EmpresaSwitcher from "@/components/EmpresaSwitcher";
import { UserProvider, useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import AcoesRapidasGlobal from "@/components/AcoesRapidasGlobal";
import PesquisaUniversal from "@/components/PesquisaUniversal";
import MiniMapaNavegacao from "@/components/MiniMapaNavegacao";
import { WindowProvider } from "@/components/lib/WindowManager";
import WindowRenderer from "@/components/lib/WindowRenderer";
import MinimizedWindowsBar from "@/components/lib/MinimizedWindowsBar";
import AtalhosTecladoInfo from "@/components/sistema/AtalhosTecladoInfo";
import ZIndexGuard from "@/components/lib/ZIndexFix";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import "@/components/lib/networkGuard";
import BootstrapGuard from "@/components/lib/BootstrapGuard";
import GlobalNetworkErrorHandler from "@/components/lib/GlobalNetworkErrorHandler";

const navigationItems = [
        { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, group: "principal" },
        { title: "Dashboard Corporativo", url: createPageUrl("DashboardCorporativo"), icon: BarChart3, group: "principal" },
        { title: "Relatórios e Análises", url: createPageUrl("Relatorios"), icon: BarChart3, group: "principal" },
        { title: "Agenda e Calendário", url: createPageUrl("Agenda"), icon: Calendar, group: "principal" },
        { title: "CRM - Relacionamento", url: createPageUrl("CRM"), icon: Users, group: "principal" },
  { title: "Cadastros Gerais", url: createPageUrl("Cadastros"), icon: Users, group: "cadastros" },
  { title: "Comercial e Vendas", url: createPageUrl("Comercial"), icon: ShoppingCart, group: "operacional" },
  { title: "Estoque e Almoxarifado", url: createPageUrl("Estoque"), icon: Box, group: "operacional" },
  { title: "Compras e Suprimentos", url: createPageUrl("Compras"), icon: Package, group: "operacional" },
  { title: "Expedição e Logística", url: createPageUrl("Expedicao"), icon: Truck, group: "operacional" },
  { title: "Produção e Manufatura", url: createPageUrl("Producao"), icon: Factory, group: "operacional" },
  { title: "📱 Apontamento Mobile", url: createPageUrl("ProducaoMobile"), icon: Factory, group: "operacional" },
  { title: "Financeiro e Contábil", url: createPageUrl("Financeiro"), icon: DollarSign, group: "administrativo" },
  { title: "Recursos Humanos", url: createPageUrl("RH"), icon: UserCircle, group: "administrativo" },
  { title: "Fiscal e Tributário", url: createPageUrl("Fiscal"), icon: FileText, group: "administrativo" },
  { title: "Gestão de Contratos", url: createPageUrl("Contratos"), icon: FileText, group: "administrativo" },
  { title: "Administração do Sistema", url: createPageUrl("AdministracaoSistema?tab=config"), icon: Settings, group: "sistema" },
  { title: "📚 Documentação", url: createPageUrl("Documentacao"), icon: BookOpen, group: "sistema" },
  
  
  
  
  { title: "💬 Hub de Atendimento", url: createPageUrl("HubAtendimento"), icon: MessageCircle, group: "principal" },
  { title: "🌐 Portal do Cliente", url: createPageUrl("PortalCliente"), icon: Users, group: "publico", public: true },

  ];

function LayoutContent({ children, currentPageName }) {
        const location = useLocation();
        const { user } = useUser();
        const { empresaAtual, filterInContext } = useContextoVisual();
        const { hasPermission } = usePermissions();
        const [pesquisaOpen, setPesquisaOpen] = useState(false);
        const [modoEscuro, setModoEscuro] = useState(false);
        const queryClient = useQueryClient();

        const prefetchForItem = (title) => {
                        try {
                          switch (title) {
                            case 'Dashboard':
                              queryClient.prefetchQuery({ queryKey: ['dash', 'kpis'], queryFn: () => base44.entities.AuditLog.filter({}, '-data_hora', 5) });
                              break;
                            case 'CRM - Relacionamento':
                              queryClient.prefetchQuery({ queryKey: ['crm', 'clientes'], queryFn: () => filterInContext('Cliente', {}, '-updated_date', 10) });
                              queryClient.prefetchQuery({ queryKey: ['crm', 'oportunidades'], queryFn: () => filterInContext('Oportunidade', {}, '-updated_date', 10) });
                              break;
                            case 'Comercial e Vendas':
                              queryClient.prefetchQuery({ queryKey: ['comercial', 'pedidos'], queryFn: () => filterInContext('Pedido', {}, '-updated_date', 10) });
                              break;
                            case 'Estoque e Almoxarifado':
                              queryClient.prefetchQuery({ queryKey: ['estoque', 'produtos'], queryFn: () => filterInContext('Produto', {}, '-updated_date', 10) });
                              break;
                            case 'Compras e Suprimentos':
                              queryClient.prefetchQuery({ queryKey: ['compras', 'ocs'], queryFn: () => filterInContext('OrdemCompra', {}, '-updated_date', 10) });
                              break;
                            case 'Financeiro e Contábil':
                              queryClient.prefetchQuery({ queryKey: ['fin', 'pagar'], queryFn: () => filterInContext('ContaPagar', {}, '-updated_date', 10) });
                              queryClient.prefetchQuery({ queryKey: ['fin', 'receber'], queryFn: () => filterInContext('ContaReceber', {}, '-updated_date', 10) });
                              break;
                            case 'Expedição e Logística':
                              queryClient.prefetchQuery({ queryKey: ['log', 'entregas'], queryFn: () => filterInContext('Entrega', {}, '-updated_date', 10) });
                              break;
                            default:
                              break;
                          }
                        } catch (_) {}
                      };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'k') {
        e.preventDefault();
        setPesquisaOpen(true);
      }

      if (ctrl && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.location.href = createPageUrl('Dashboard');
      }

      if (ctrl && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        window.location.href = createPageUrl('Comercial');
      }

      if (ctrl && e.key === 'm') {
        e.preventDefault();
        setModoEscuro(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (modoEscuro) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [modoEscuro]);

  // Registro global de erros de UI (não altera layout visual)
  useEffect(() => {
    const onError = (e) => {
      try {
        const msg = e?.message || e?.error?.message || 'Erro de UI';
        const stack = e?.error?.stack || null;
        base44.entities?.AuditLog?.create?.({
                        usuario: user?.full_name || user?.email || 'Usuário',
                        usuario_id: user?.id,
                        acao: 'Visualização',
                        modulo: 'Sistema',
                        tipo_auditoria: 'ui',
                        entidade: 'UI',
                        descricao: `Erro não tratado: ${msg}`,
                        dados_novos: { stack, source: e?.filename, lineno: e?.lineno, colno: e?.colno },
                        data_hora: new Date().toISOString(),
                      });
      } catch {}
    };
    const onUnhandled = (e) => {
      try {
        const msg = e?.reason?.message || String(e?.reason);
        base44.entities?.AuditLog?.create?.({
                        usuario: user?.full_name || user?.email || 'Usuário',
                        usuario_id: user?.id,
                        acao: 'Visualização',
                        modulo: 'Sistema',
                        tipo_auditoria: 'ui',
                        entidade: 'UI',
                        descricao: `Promise rejeitada: ${msg}`,
                        dados_novos: { reason: e?.reason },
                        data_hora: new Date().toISOString(),
                      });
      } catch {}
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, []);

  const darkModeStyles = modoEscuro ? `
    <style>
      :root.dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --card: 222.2 84% 4.9%;
        --card-foreground: 210 40% 98%;
        --primary: 217.2 91.2% 59.8%;
        --slate-50: #0f172a;
        --slate-100: #1e293b;
        --slate-200: #334155;
        --slate-600: #cbd5e1;
        --slate-700: #e2e8f0;
        --slate-900: #f1f5f9;
      }
      
      .dark body {
        background: linear-gradient(to bottom right, #0f172a, #1e293b);
        color: #f1f5f9;
      }
      
      .dark .bg-white {
        background-color: #1e293b !important;
        color: #f1f5f9 !important;
      }
      
      .dark .bg-slate-50 {
        background-color: #0f172a !important;
      }
      
      .dark .text-slate-900 {
        color: #f1f5f9 !important;
      }
      
      .dark .text-slate-600 {
        color: #cbd5e1 !important;
      }
      
      .dark .border-slate-200 {
        border-color: #334155 !important;
      }
      
      .dark .shadow-md {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
      }
    </style>
  ` : '';

  useEffect(() => {
    if (!user) return;
    const entityToModule = {
      Cliente: 'CRM',
      Oportunidade: 'CRM',
      Interacao: 'CRM',
      Pedido: 'Comercial',
      NotaFiscal: 'Fiscal',
      Entrega: 'Expedição',
      Romaneio: 'Expedição',
      Fornecedor: 'Compras',
      SolicitacaoCompra: 'Compras',
      OrdemCompra: 'Compras',
      Produto: 'Estoque',
      MovimentacaoEstoque: 'Estoque',
      ContaPagar: 'Financeiro',
      ContaReceber: 'Financeiro',
      Evento: 'Agenda',
      Comissao: 'Comercial',
    };
    const stampConfig = {
      Cliente: { nameField: 'vendedor_responsavel', idField: 'vendedor_responsavel_id' },
      Oportunidade: { nameField: 'responsavel', idField: 'responsavel_id' },
      Interacao: { nameField: 'responsavel', idField: 'responsavel_id' },
      Entrega: { nameField: 'usuario_responsavel', idField: 'usuario_responsavel_id' },
      MovimentacaoEstoque: { nameField: 'responsavel', idField: 'responsavel_id' },
      Pedido: { nameField: 'vendedor', idField: 'vendedor_id' },
    };

    const entities = Object.keys(entityToModule);
    const unsubs = entities.map((name) => {
      const api = base44.entities?.[name];
      if (!api?.subscribe) return null;
      return api.subscribe(async (evt) => {
        try {
          // 1) Auditoria universal
          await base44.entities.AuditLog.create({
                            usuario: user?.full_name || user?.email || 'Usuário',
                            usuario_id: user?.id,
                            empresa_id: empresaAtual?.id || null,
                            empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
                            acao: evt.type === 'create' ? 'Criação' : evt.type === 'update' ? 'Edição' : 'Exclusão',
                            modulo: entityToModule[name],
                            tipo_auditoria: 'entidade',
                            entidade: name,
                            registro_id: evt.id,
                            descricao: `${name} ${evt.type}`,
                            dados_novos: evt?.data || null,
                          });

          // 2) Carimbo de responsável + multiempresa no momento da criação, quando fizer sentido
          if (evt.type === 'create') {
            const cfg = stampConfig[name];
            const data = evt?.data || {};
            const patch = {};

            if (cfg) {
              const hasName = data?.[cfg.nameField];
              const hasId = data?.[cfg.idField];
              if (!hasName) patch[cfg.nameField] = user?.full_name || user?.email;
              if (!hasId) patch[cfg.idField] = user?.id;
            }
            if ('empresa_id' in data && !data?.empresa_id && empresaAtual?.id) {
              patch.empresa_id = empresaAtual.id;
            }

            if (Object.keys(patch).length > 0) {
              try {
                await base44.entities?.[name]?.update?.(evt.id, patch);
              } catch (_) { /* silencioso: se não puder atualizar, seguimos */ }
            }
          }
        } catch (e) { /* auditoria nunca deve quebrar a UI */ }
      });
    }).filter(Boolean);

    return () => { unsubs.forEach(u => { if (typeof u === 'function') u(); }); };
  }, [user?.id, empresaAtual?.id]);

  const isMobilePage = currentPageName === "ProducaoMobile";



  const titleToModule = {
    "CRM - Relacionamento": "CRM",
    "Comercial e Vendas": "Comercial",
    "Estoque e Almoxarifado": "Estoque",
    "Compras e Suprimentos": "Compras",
    "Financeiro e Contábil": "Financeiro",
    "Fiscal e Tributário": "Fiscal",
    "Recursos Humanos": "RH",
  };

  const itemsFiltrados = navigationItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    const mod = titleToModule[item.title];
    if (!mod) return true; // itens públicos ou informativos continuam visíveis
    return hasPermission(mod, null, 'ver');
  });

  const pageToModule = {
    CRM: 'CRM',
    Comercial: 'Comercial',
    Estoque: 'Estoque',
    Compras: 'Compras',
    Financeiro: 'Financeiro',
    Fiscal: 'Fiscal',
    RH: 'RH',
    Expedicao: 'Expedição',
  };

  const currentModule = pageToModule[currentPageName];
  useEffect(() => {
    if (!currentModule) return;
    const key = `audit_block_${currentModule}`;
    try {
      const allowed = hasPermission(currentModule, null, 'ver');
      if (!allowed && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        base44.entities.AuditLog.create({
                        usuario: user?.full_name || user?.email || 'Usuário',
                        usuario_id: user?.id,
                        empresa_id: empresaAtual?.id || null,
                        empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
                        acao: 'Bloqueio',
                        modulo: currentModule,
                        tipo_auditoria: 'seguranca',
                        entidade: 'Página',
                        descricao: `Acesso negado ao módulo ${currentModule} (${currentPageName})`,
                      });
      }
    } catch {}
  }, [currentModule, currentPageName, user?.id, empresaAtual?.id]);



  const groupedItems = {
    principal: itemsFiltrados.filter(item => item.group === "principal"),
    cadastros: itemsFiltrados.filter(item => item.group === "cadastros"),
    operacional: itemsFiltrados.filter(item => item.group === "operacional"),
    administrativo: itemsFiltrados.filter(item => item.group === "administrativo"),
    sistema: itemsFiltrados.filter(item => item.group === "sistema"),
    publico: itemsFiltrados.filter(item => item.group === "publico"),
  };

  if (isMobilePage) {
    return (
      <>
        {modoEscuro && <div dangerouslySetInnerHTML={{ __html: darkModeStyles }} />}
        <div className="min-h-screen">{children}</div>
      </>
    );
  }

  return (
    <SidebarProvider>
      {modoEscuro && <div dangerouslySetInnerHTML={{ __html: darkModeStyles }} />}
      
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">ERP Zuccaro</h2>
                <p className="text-xs text-slate-500">V21.5 • Sistema Completo</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            {Object.entries(groupedItems).map(([groupName, items]) => {
              if (items.length === 0) return null;
              
              const groupLabels = {
                principal: "Principal",
                cadastros: "Cadastros",
                operacional: "Operacional",
                administrativo: "Administrativo",
                sistema: "Sistema",
                publico: "Público"
              };

              return (
                <SidebarGroup key={groupName}>
                  <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-1">
                    {groupLabels[groupName]}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                              asChild 
                              className={`transition-all duration-200 rounded-lg mb-1 ${
                                isActive 
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200' 
                                  : 'hover:bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Link to={item.url} onMouseEnter={() => prefetchForItem(item.title)} className="flex items-center gap-3 px-4 py-3">
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                <span className="font-medium">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("ConfiguracoesUsuario")} className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors flex-1">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.full_name?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {user?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => base44.auth.logout()}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setModoEscuro(!modoEscuro)}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-slate-100 text-sm text-slate-600 transition-colors"
                title="Ctrl+M"
              >
                {modoEscuro ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="lg:hidden">
                  <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors">
                    <Menu className="w-5 h-5" />
                  </SidebarTrigger>
                </div>
                
                <div className="hidden lg:block flex-1 max-w-md">
                  <MiniMapaNavegacao />
                </div>
              </div>

              <div className="hidden sm:block">
                <EmpresaSwitcher />
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPesquisaOpen(true)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden md:flex items-center gap-2"
                  title="Pesquisa Universal (Ctrl+K)"
                >
                  <Search className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-500 hidden lg:inline">Ctrl+K</span>
                </button>

                <AtalhosTecladoInfo />

                <AcoesRapidasGlobal />

                <NotificationCenter />
                
                <Link to={createPageUrl("ConfiguracoesUsuario")}>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5 text-slate-600" />
                  </button>
                </Link>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              <Suspense fallback={<div className="p-6 text-slate-500">Carregando…</div>}>
                <BootstrapGuard>
                  <ProtectedSection module={currentModule || 'Sistema'} fallback={<div className="p-10 text-center text-slate-600">Acesso negado a este módulo.</div>}>
                    <GuardRails currentPageName={currentPageName}>
                      {children}
                    </GuardRails>
                  </ProtectedSection>
                </BootstrapGuard>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>

        <PesquisaUniversal 
          open={pesquisaOpen} 
          onOpenChange={setPesquisaOpen} 
        />

        {/* Sistema de Janelas Multitarefa V21.0 */}
        <WindowRenderer />
        <MinimizedWindowsBar />
        </div>
        </SidebarProvider>
        );
        }

import GuardRails from "@/components/lib/GuardRails";
import ProtectedSection from "@/components/security/ProtectedSection";

export default function Layout({ children, currentPageName }) {
  return (
    <UserProvider>
      <WindowProvider>
        <ZIndexGuard>
          <GlobalNetworkErrorHandler />
          <LayoutContent children={children} currentPageName={currentPageName} />
        </ZIndexGuard>
      </WindowProvider>
    </UserProvider>
  );
}