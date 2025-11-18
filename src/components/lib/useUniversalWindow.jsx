import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 HOOK UNIVERSAL DE JANELAS - ETAPA 1 CRÍTICA
 * 
 * Permite abrir QUALQUER componente/página em janela multitarefa
 * Todas as janelas são w-full, responsivas, redimensionáveis
 * Suporta múltiplas janelas abertas simultaneamente
 */
export function useUniversalWindow() {
  const { openWindow: openWindowBase } = useWindowManager();

  /**
   * Abre qualquer componente em janela multitarefa
   * @param {Object} config - Configuração da janela
   * @param {string} config.title - Título da janela
   * @param {React.Component} config.component - Componente a ser renderizado
   * @param {Object} config.props - Props do componente
   * @param {string} config.size - Tamanho: 'small' | 'medium' | 'large' | 'fullscreen'
   * @param {string} config.empresaId - ID da empresa (contexto)
   * @param {Object} config.customDimensions - Dimensões customizadas
   */
  const openUniversalWindow = ({
    title,
    component,
    props = {},
    size = 'large',
    empresaId = null,
    customDimensions = null,
    canResize = true,
    canMinimize = true,
    canMaximize = true
  }) => {
    // Dimensões padrão responsivas
    const sizePresets = {
      small: { width: '40vw', height: '50vh', minWidth: '400px', minHeight: '300px' },
      medium: { width: '60vw', height: '70vh', minWidth: '600px', minHeight: '400px' },
      large: { width: '85vw', height: '85vh', minWidth: '800px', minHeight: '500px' },
      fullscreen: { width: '100vw', height: '100vh', minWidth: '100vw', minHeight: '100vh' }
    };

    const dimensions = customDimensions || sizePresets[size] || sizePresets.large;

    return openWindowBase({
      title,
      content: component,
      contentProps: props,
      empresaId,
      dimensions,
      canResize,
      canMinimize,
      canMaximize,
      isMaximized: size === 'fullscreen'
    });
  };

  /**
   * Atalhos para tamanhos específicos
   */
  const openSmallWindow = (title, component, props = {}) =>
    openUniversalWindow({ title, component, props, size: 'small' });

  const openMediumWindow = (title, component, props = {}) =>
    openUniversalWindow({ title, component, props, size: 'medium' });

  const openLargeWindow = (title, component, props = {}) =>
    openUniversalWindow({ title, component, props, size: 'large' });

  const openFullscreenWindow = (title, component, props = {}) =>
    openUniversalWindow({ title, component, props, size: 'fullscreen' });

  /**
   * Abre uma página do sistema em janela
   */
  const openPageInWindow = (pageName, pageTitle = null) => {
    const pages = {
      Dashboard: () => import('@/pages/Dashboard'),
      Comercial: () => import('@/pages/Comercial'),
      Financeiro: () => import('@/pages/Financeiro'),
      Estoque: () => import('@/pages/Estoque'),
      Compras: () => import('@/pages/Compras'),
      Expedicao: () => import('@/pages/Expedicao'),
      RH: () => import('@/pages/RH'),
      Fiscal: () => import('@/pages/Fiscal'),
      CRM: () => import('@/pages/CRM'),
      Producao: () => import('@/pages/Producao'),
      Cadastros: () => import('@/pages/Cadastros'),
      Empresas: () => import('@/pages/Empresas'),
      Relatorios: () => import('@/pages/Relatorios'),
      Integracoes: () => import('@/pages/Integracoes'),
      Acessos: () => import('@/pages/Acessos'),
    };

    if (!pages[pageName]) {
      console.error(`Página ${pageName} não encontrada`);
      return;
    }

    pages[pageName]().then((module) => {
      openLargeWindow(pageTitle || pageName, module.default);
    });
  };

  /**
   * Abre um formulário de cadastro em janela
   */
  const openFormInWindow = (formType, data = null, onSave = null) => {
    const forms = {
      cliente: { component: () => import('@/components/cadastros/CadastroClienteCompleto'), title: 'Cliente' },
      fornecedor: { component: () => import('@/components/cadastros/CadastroFornecedorCompleto'), title: 'Fornecedor' },
      produto: { component: () => import('@/components/cadastros/ProdutoFormV22_Completo'), title: 'Produto' },
      colaborador: { component: () => import('@/components/rh/ColaboradorForm'), title: 'Colaborador' },
      pedido: { component: () => import('@/components/comercial/PedidoFormCompleto'), title: 'Pedido' },
    };

    const form = forms[formType];
    if (!form) {
      console.error(`Formulário ${formType} não encontrado`);
      return;
    }

    form.component().then((module) => {
      const title = data ? `Editar ${form.title}` : `Novo ${form.title}`;
      openLargeWindow(title, module.default, { data, onSave });
    });
  };

  return {
    openUniversalWindow,
    openSmallWindow,
    openMediumWindow,
    openLargeWindow,
    openFullscreenWindow,
    openPageInWindow,
    openFormInWindow
  };
}

export default useUniversalWindow;