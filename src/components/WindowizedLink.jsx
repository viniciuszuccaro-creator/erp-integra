import React from 'react';
import { useAutoWindow } from './lib/useAutoWindow';

/**
 * 🪟 WINDOWIZED LINK
 * Link que abre qualquer página como janela multitarefa
 * Substitui navegação tradicional por abertura de janelas
 * 
 * Uso: <WindowizedLink to="/comercial" title="Comercial">Abrir Comercial</WindowizedLink>
 */

// Mapeamento dinâmico de rotas para componentes
const routeComponents = {
  '/': () => import('../pages/Dashboard'),
  '/comercial': () => import('../pages/Comercial'),
  '/financeiro': () => import('../pages/Financeiro'),
  '/estoque': () => import('../pages/Estoque'),
  '/producao': () => import('../pages/Producao'),
  '/expedicao': () => import('../pages/Expedicao'),
  '/compras': () => import('../pages/Compras'),
  '/rh': () => import('../pages/RH'),
  '/fiscal': () => import('../pages/Fiscal'),
  '/crm': () => import('../pages/CRM'),
  '/cadastros': () => import('../pages/Cadastros'),
  '/integracoes': () => import('../pages/Integracoes'),
  '/empresas': () => import('../pages/Empresas'),
  '/dashboard-corporativo': () => import('../pages/DashboardCorporativo'),
  '/relatorios': () => import('../pages/Relatorios'),
  '/contratos': () => import('../pages/Contratos'),
  '/agenda': () => import('../pages/Agenda'),
  '/acessos': () => import('../pages/Acessos'),
  '/configuracoes-usuario': () => import('../pages/ConfiguracoesUsuario'),
  '/configuracoes-sistema': () => import('../pages/ConfiguracoesSistema')
};

export function WindowizedLink({ to, title, size = 'fullscreen', children, className, module, preventDuplicate = true, ...props }) {
  const openAsWindow = useAutoWindow();

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const loader = routeComponents[to];
    if (!loader) {
      console.warn(`Rota não mapeada: ${to}`);
      return;
    }

    try {
      const componentModule = await loader();
      const Component = componentModule.default;

      openAsWindow(Component, {
        title: title || to.replace('/', '').toUpperCase(),
        size,
        module: module || to.replace('/', ''),
        preventDuplicate,
        metadata: { route: to }
      });
    } catch (error) {
      console.error(`Erro ao carregar componente para ${to}:`, error);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

export default WindowizedLink;