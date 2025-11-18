import { useWindowManager } from './WindowManagerPersistent';

/**
 * 🪟 UNIVERSAL WINDOW HOOK - V21.1
 * 
 * Hook universal para abrir QUALQUER componente em janela multitarefa
 * Garante w-full responsivo e controles completos
 */
export function useUniversalWindow() {
  const { openWindow, hasWindowOfType } = useWindowManager();

  /**
   * Abre qualquer componente em janela multitarefa
   */
  const openInWindow = (config) => {
    const {
      module,
      title,
      component,
      props = {},
      size = 'large',
      metadata = {},
      empresaId = null,
      unique = true, // Se true, não abre duplicado
    } = config;

    // Verificar se já existe janela aberta deste tipo
    if (unique && hasWindowOfType(module, metadata)) {
      return null; // Não abre duplicado
    }

    // Configuração de tamanhos padrão
    const sizes = {
      small: { width: '500px', height: '600px' },
      medium: { width: '800px', height: '700px' },
      large: { width: '90vw', height: '85vh' },
      fullscreen: { width: '100vw', height: '100vh' },
    };

    const dimensions = sizes[size] || sizes.large;

    return openWindow({
      title,
      component,
      props: {
        ...props,
        empresaId,
      },
      size,
      dimensions,
      module,
      empresaId,
      metadata,
      canResize: true,
      canMinimize: true,
      canMaximize: true,
    });
  };

  /**
   * Atalhos para aberturas comuns
   */
  const openPedido = (pedidoId = null, empresaId = null) => {
    return openInWindow({
      module: 'comercial/pedido',
      title: pedidoId ? `Pedido #${pedidoId}` : 'Novo Pedido',
      component: 'comercial/pedido',
      props: { pedidoId },
      metadata: { pedidoId },
      empresaId,
      size: 'large',
    });
  };

  const openCliente = (clienteId = null, empresaId = null) => {
    return openInWindow({
      module: 'cadastros/cliente',
      title: clienteId ? 'Editar Cliente' : 'Novo Cliente',
      component: 'cadastros/cliente',
      props: { clienteId },
      metadata: { clienteId },
      empresaId,
      size: 'large',
    });
  };

  const openProduto = (produtoId = null, empresaId = null) => {
    return openInWindow({
      module: 'cadastros/produto',
      title: produtoId ? 'Editar Produto' : 'Novo Produto',
      component: 'cadastros/produto',
      props: { produtoId },
      metadata: { produtoId },
      empresaId,
      size: 'large',
    });
  };

  const openEntrega = (entregaId = null, empresaId = null) => {
    return openInWindow({
      module: 'expedicao/entrega',
      title: entregaId ? 'Editar Entrega' : 'Nova Entrega',
      component: 'expedicao/entrega',
      props: { entregaId },
      metadata: { entregaId },
      empresaId,
      size: 'large',
    });
  };

  const openOrdemProducao = (opId = null, empresaId = null) => {
    return openInWindow({
      module: 'producao/ordem',
      title: `Ordem de Produção #${opId}`,
      component: 'producao/ordem',
      props: { opId },
      metadata: { opId },
      empresaId,
      size: 'large',
    });
  };

  const openNotaFiscal = (notaId = null, empresaId = null) => {
    return openInWindow({
      module: 'fiscal/nota',
      title: notaId ? `NF-e #${notaId}` : 'Nova NF-e',
      component: 'fiscal/nota',
      props: { notaId },
      metadata: { notaId },
      empresaId,
      size: 'large',
    });
  };

  const openContaReceber = (contaId = null, empresaId = null) => {
    return openInWindow({
      module: 'financeiro/conta-receber',
      title: contaId ? 'Editar Conta a Receber' : 'Nova Conta a Receber',
      component: 'financeiro/conta-receber',
      props: { contaId },
      metadata: { contaId },
      empresaId,
      size: 'medium',
    });
  };

  const openContaPagar = (contaId = null, empresaId = null) => {
    return openInWindow({
      module: 'financeiro/conta-pagar',
      title: contaId ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar',
      component: 'financeiro/conta-pagar',
      props: { contaId },
      metadata: { contaId },
      empresaId,
      size: 'medium',
    });
  };

  return {
    openInWindow,
    openPedido,
    openCliente,
    openProduto,
    openEntrega,
    openOrdemProducao,
    openNotaFiscal,
    openContaReceber,
    openContaPagar,
  };
}

export default useUniversalWindow;