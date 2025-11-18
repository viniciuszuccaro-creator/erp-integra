import React, { useEffect } from 'react';
import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 AUTO WINDOW WRAPPER
 * Converte automaticamente páginas em janelas multitarefa
 * Intercepta navegação e transforma em abertura de janelas
 */

const ROUTE_CONFIG = {
  '/': { title: 'Dashboard', module: 'dashboard', size: 'fullscreen' },
  '/comercial': { title: 'Comercial', module: 'comercial', size: 'fullscreen' },
  '/financeiro': { title: 'Financeiro', module: 'financeiro', size: 'fullscreen' },
  '/estoque': { title: 'Estoque', module: 'estoque', size: 'fullscreen' },
  '/producao': { title: 'Produção', module: 'producao', size: 'fullscreen' },
  '/expedicao': { title: 'Expedição', module: 'expedicao', size: 'fullscreen' },
  '/compras': { title: 'Compras', module: 'compras', size: 'fullscreen' },
  '/rh': { title: 'RH', module: 'rh', size: 'fullscreen' },
  '/fiscal': { title: 'Fiscal', module: 'fiscal', size: 'fullscreen' },
  '/crm': { title: 'CRM', module: 'crm', size: 'fullscreen' },
  '/cadastros': { title: 'Cadastros', module: 'cadastros', size: 'fullscreen' },
  '/integracoes': { title: 'Integrações', module: 'integracoes', size: 'fullscreen' },
  '/empresas': { title: 'Empresas', module: 'empresas', size: 'fullscreen' },
  '/dashboard-corporativo': { title: 'Dashboard Corporativo', module: 'dashboard-corporativo', size: 'fullscreen' },
  '/relatorios': { title: 'Relatórios', module: 'relatorios', size: 'fullscreen' },
  '/contratos': { title: 'Contratos', module: 'contratos', size: 'fullscreen' },
  '/agenda': { title: 'Agenda', module: 'agenda', size: 'fullscreen' },
  '/acessos': { title: 'Controle de Acesso', module: 'acessos', size: 'fullscreen' },
  '/configuracoes-usuario': { title: 'Configurações', module: 'configuracoes', size: 'large' },
  '/configuracoes-sistema': { title: 'Configurações Sistema', module: 'configuracoes-sistema', size: 'fullscreen' }
};

export default function AutoWindowWrapper({ pathname, children }) {
  const { openWindow, hasWindowOfType } = useWindowManager();

  useEffect(() => {
    const config = ROUTE_CONFIG[pathname];
    if (!config) return;

    // Prevenir duplicatas - verifica se janela do módulo já existe
    if (hasWindowOfType(config.module)) return;

    // Criar componente wrapper que renderiza children
    const PageComponent = () => <div className="w-full h-full">{children}</div>;

    // Abrir como janela
    openWindow({
      title: config.title,
      component: PageComponent,
      size: config.size,
      module: config.module,
      metadata: { route: pathname }
    });
  }, [pathname]);

  // Não renderiza nada diretamente - tudo vai via janelas
  return null;
}