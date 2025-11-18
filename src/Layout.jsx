import React, { useEffect, useState } from "react";
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
  Link2,
  Calendar,
  BarChart3,
  Factory,
  BookOpen,
  Search,
  Rocket,
  CheckCircle,
  Trash2
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
import NotificationCenter from "@/components/NotificationCenter";
import EmpresaSwitcher from "@/components/EmpresaSwitcher";
import { UserProvider, useUser } from "@/components/lib/UserContext";
import { WindowManagerProvider } from "@/components/lib/WindowManagerPersistent";
import WindowRenderer from "@/components/lib/WindowRenderer";
import MinimizedWindowsBar from "@/components/lib/MinimizedWindowsBar";
import AcoesRapidasGlobal from "@/components/AcoesRapidasGlobal";
import PesquisaUniversal from "@/components/PesquisaUniversal";
import MiniMapaNavegacao from "@/components/MiniMapaNavegacao";
import ForcarAtualizacao from "@/components/ForcarAtualizacao";
import DebugWidthIndicator from "@/components/DebugWidthIndicator";
import ForceFullWidthWrapper from "@/components/ForceFullWidthWrapper";
import { NavigationInterceptor } from "@/components/lib/NavigationInterceptor";

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
  { title: "Integrações", url: createPageUrl("Integracoes"), icon: Link2, group: "sistema" },
  { title: "Configurações do Sistema", url: createPageUrl("ConfiguracoesSistema"), icon: Settings, group: "sistema" },
  { title: "📚 Documentação", url: createPageUrl("Documentacao"), icon: BookOpen, group: "sistema" },
  { title: "🔒 Segurança e Governança", url: createPageUrl("Seguranca"), icon: Shield, group: "sistema", adminOnly: true },
  { title: "🧪 Teste Golden Thread", url: createPageUrl("TesteGoldenThread"), icon: Rocket, group: "sistema", adminOnly: true },
  { title: "✅ Validador Fase 1", url: createPageUrl("ValidadorFase1"), icon: CheckCircle, group: "sistema", adminOnly: true },
  { title: "🗑️ Limpar Dados Teste", url: createPageUrl("LimparDados"), icon: Trash2, group: "sistema", adminOnly: true },
  { title: "🌐 Portal do Cliente", url: createPageUrl("PortalCliente"), icon: Users, group: "publico", public: true },
];

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { user } = useUser();
  const [pesquisaOpen, setPesquisaOpen] = useState(false);
  const [modoEscuro, setModoEscuro] = useState(false);

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

  const isMobilePage = currentPageName === "ProducaoMobile";

  if (isMobilePage) {
    return <div className="min-h-screen">{children}</div>;
  }

  const itemsFiltrados = navigationItems.filter(item => {
    if (item.adminOnly && user?.role !== 'admin') {
      return false;
    }
    return true;
  });

  const groupedItems = {
    principal: itemsFiltrados.filter(item => item.group === "principal"),
    cadastros: itemsFiltrados.filter(item => item.group === "cadastros"),
    operacional: itemsFiltrados.filter(item => item.group === "operacional"),
    administrativo: itemsFiltrados.filter(item => item.group === "administrativo"),
    sistema: itemsFiltrados.filter(item => item.group === "sistema"),
    publico: itemsFiltrados.filter(item => item.group === "publico"),
  };

  return (
    <ForceFullWidthWrapper>
      <WindowManagerProvider>
        <NavigationInterceptor>
          <SidebarProvider style={{width: '100%', maxWidth: '100%'}}>
            {modoEscuro && <div dangerouslySetInnerHTML={{ __html: darkModeStyles }} />}

            <DebugWidthIndicator />
            <ForcarAtualizacao />
        <div className="min-h-screen flex w-full max-w-full bg-gradient-to-br from-slate-50 to-blue-50" style={{width: '100vw', maxWidth: '100vw', overflow: 'hidden'}}>
          <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm flex-shrink-0" style={{width: 'auto', minWidth: '250px'}}>
            <SidebarHeader className="border-b border-slate-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-900">ERP Zuccaro</h2>
                  <p className="text-xs text-slate-500">V21.1.2 • Multitarefa</p>
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
                                <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
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

          <main className="flex-1 flex flex-col w-full max-w-full" style={{width: '100%', maxWidth: '100%', flex: '1 1 auto'}}>
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-10 w-full" style={{width: '100%'}}>
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

            <div className="flex-1 overflow-auto relative w-full max-w-full" style={{width: '100%', maxWidth: '100%'}}>
              {children}
            </div>

            {/* RENDERIZADOR DE JANELAS MULTITAREFA - FORA DO SCROLL */}
            <WindowRenderer />

            {/* BARRA DE JANELAS MINIMIZADAS */}
            <MinimizedWindowsBar />
          </main>

          <PesquisaUniversal 
            open={pesquisaOpen} 
            onOpenChange={setPesquisaOpen} 
          />
        </div>
          </SidebarProvider>
        </NavigationInterceptor>
        </WindowManagerProvider>
        </ForceFullWidthWrapper>
        );
        }

export default function Layout({ children, currentPageName }) {
  return (
    <UserProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </UserProvider>
  );
}