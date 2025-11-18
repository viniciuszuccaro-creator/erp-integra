import React from 'react';
import { useWindow } from './lib/useWindow';

/**
 * 🚀 WINDOW LAUNCHER V21.0 - ETAPA 1
 * Componente auxiliar para facilitar abertura de janelas
 * Usa lazy loading para otimizar performance
 */

export default function WindowLauncher({ module, title, componentPath, props = {}, metadata = {}, children, size = 'large' }) {
  const { openWindow, openLargeWindow, openMediumWindow, openSmallWindow } = useWindow();

  // Mapeamento de componentes (lazy load)
  const componentMap = {
    // CADASTROS
    'CadastroClienteCompleto': () => import('./cadastros/CadastroClienteCompleto'),
    'CadastroFornecedorCompleto': () => import('./cadastros/CadastroFornecedorCompleto'),
    'ProdutoFormV22_Completo': () => import('./cadastros/ProdutoFormV22_Completo'),
    'TabelaPrecoFormCompleto': () => import('./cadastros/TabelaPrecoFormCompleto'),
    'TransportadoraForm': () => import('./cadastros/TransportadoraForm'),
    'ColaboradorForm': () => import('./rh/ColaboradorForm'),
    'EmpresaFormCompleto': () => import('./cadastros/EmpresaFormCompleto'),
    
    // COMERCIAL
    'PedidoFormCompleto': () => import('./comercial/PedidoFormCompleto'),
    'DetalhesCliente': () => import('./comercial/DetalhesCliente'),
    'WizardPedidoLateral': () => import('./comercial/WizardPedidoLateral'),
    
    // FINANCEIRO
    'GerarCobrancaModal': () => import('./financeiro/GerarCobrancaModal'),
    'RateioMultiempresa': () => import('./financeiro/RateioMultiempresa'),
    'PainelConciliacao': () => import('./financeiro/PainelConciliacao'),
    
    // EXPEDIÇÃO
    'RomaneioForm': () => import('./expedicao/RomaneioForm'),
    'FormularioEntrega': () => import('./expedicao/FormularioEntrega'),
    'MapaRastreamentoRealTime': () => import('./expedicao/MapaRastreamentoRealTime'),
    
    // PRODUÇÃO
    'FormularioCorteDobraCompleto': () => import('./producao/FormularioCorteDobraCompleto'),
    'FormularioArmadoCompleto': () => import('./producao/FormularioArmadoCompleto'),
    'KanbanProducao': () => import('./producao/KanbanProducao'),
    
    // FISCAL
    'GerarNFeModal': () => import('./comercial/GerarNFeModal'),
    'ImportarXMLNFe': () => import('./fiscal/ImportarXMLNFe'),
    
    // RELATÓRIOS
    'RelatorioPersonalizado': () => import('./relatorios/RelatorioPersonalizado'),
    'DREComparativo': () => import('./relatorios/DREComparativo'),
    
    // SISTEMA
    'GlobalAuditLog': () => import('./sistema/GlobalAuditLog'),
    'DashboardControleAcesso': () => import('./sistema/DashboardControleAcesso'),
  };

  const handleClick = async () => {
    // Carregar componente dinamicamente
    let ComponentToLoad;
    
    if (componentPath && componentMap[componentPath]) {
      const module = await componentMap[componentPath]();
      ComponentToLoad = module.default;
    } else {
      console.error(`Componente ${componentPath} não encontrado no mapa`);
      return;
    }

    // Escolher método de abertura baseado no tamanho
    const openMethod = size === 'large' ? openLargeWindow :
                      size === 'medium' ? openMediumWindow :
                      size === 'small' ? openSmallWindow :
                      openWindow;

    openMethod({
      title,
      component: ComponentToLoad,
      props,
      module,
      metadata
    });
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}