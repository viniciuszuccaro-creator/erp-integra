import React, { useEffect } from 'react';
import { useAbrirJanela } from './withWindow';
import { createPageUrl } from '@/utils';

/**
 * 🌐 INTERCEPTOR DE NAVEGAÇÃO UNIVERSAL
 * 
 * Intercepta TODOS os cliques em links e abre como janelas
 * Mantém navegação funcionando mas em sistema multitarefa
 */

// Registro de páginas do sistema
const PAGE_REGISTRY = {
  '/': { component: null, title: 'Dashboard' },
  '/comercial': { component: null, title: 'Comercial' },
  '/financeiro': { component: null, title: 'Financeiro' },
  '/estoque': { component: null, title: 'Estoque' },
  '/compras': { component: null, title: 'Compras' },
  '/expedicao': { component: null, title: 'Expedição' },
  '/producao': { component: null, title: 'Produção' },
  '/rh': { component: null, title: 'RH' },
  '/fiscal': { component: null, title: 'Fiscal' },
  '/crm': { component: null, title: 'CRM' },
  '/agenda': { component: null, title: 'Agenda' },
  '/relatorios': { component: null, title: 'Relatórios' },
  '/cadastros': { component: null, title: 'Cadastros' },
  '/contratos': { component: null, title: 'Contratos' },
  '/empresas': { component: null, title: 'Empresas' },
  '/integracoes': { component: null, title: 'Integrações' },
  '/acessos': { component: null, title: 'Acessos' },
  '/configuracoes': { component: null, title: 'Configurações' },
};

export function NavigationInterceptor({ children }) {
  const { abrirJanela } = useAbrirJanela();

  useEffect(() => {
    const handleClick = (e) => {
      // Verifica se é um link
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      
      // Ignora links externos e âncoras
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
        return;
      }

      // Verifica se tem data-open-window (forçar abrir como janela)
      if (link.hasAttribute('data-open-window')) {
        e.preventDefault();
        e.stopPropagation();

        const title = link.getAttribute('data-window-title') || link.textContent;
        const pageName = href.replace('/', '');
        
        // Importa dinamicamente a página e abre como janela
        import(`../../pages/${pageName.charAt(0).toUpperCase() + pageName.slice(1)}.js`)
          .then(module => {
            abrirJanela(title, module.default);
          })
          .catch(err => {
            console.warn('Página não encontrada:', pageName);
          });
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [abrirJanela]);

  return <>{children}</>;
}

/**
 * 🔗 COMPONENTE LINK UNIVERSAL
 * 
 * Link que sempre abre como janela multitarefa
 * 
 * USO:
 * <WindowLink to="comercial" title="Comercial">Abrir Comercial</WindowLink>
 */
export function WindowLink({ to, title, children, width = '90vw', height = '85vh', ...props }) {
  const { abrirJanela } = useAbrirJanela();

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const pageName = to.charAt(0).toUpperCase() + to.slice(1);
      const module = await import(`../../pages/${pageName}.js`);
      
      abrirJanela(title || pageName, module.default, { width, height });
    } catch (err) {
      console.error('Erro ao abrir janela:', err);
    }
  };

  return (
    <a 
      href={`/${to}`}
      onClick={handleClick}
      data-open-window
      data-window-title={title}
      {...props}
    >
      {children}
    </a>
  );
}

export default NavigationInterceptor;