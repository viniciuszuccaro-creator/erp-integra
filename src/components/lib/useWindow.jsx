import { useWindowManager } from './WindowManager';

/**
 * V21.1.2 - Hook para abrir janelas facilmente
 * 
 * Uso:
 * const { openProductWindow, openPedidoWindow } = useWindow();
 * openProductWindow(produto);
 */
export function useWindow() {
  const { openWindow } = useWindowManager();

  const openProductWindow = (produto = null, onSave) => {
    return openWindow({
      title: produto ? `Editar Produto: ${produto.descricao}` : 'Novo Produto',
      subtitle: 'Cadastro de Produtos V21.1.2',
      icon: require('lucide-react').Package,
      badge: produto ? 'Edição' : 'Novo',
      content: (
        <div className="h-full overflow-auto p-6">
          {/* Aqui virá o ProdutoForm */}
          <p className="text-slate-500">Formulário de Produto será injetado aqui</p>
        </div>
      ),
      data: { produto, onSave }
    });
  };

  const openPedidoWindow = (pedido = null, onSave) => {
    return openWindow({
      title: pedido ? `Pedido ${pedido.numero_pedido}` : 'Novo Pedido',
      subtitle: '9 Abas - Multi-Instância V21.1.2',
      icon: require('lucide-react').ShoppingCart,
      badge: pedido ? 'Edição' : 'Novo',
      content: (
        <div className="h-full overflow-hidden">
          {/* PedidoFormCompleto será injetado */}
          <p className="text-slate-500 p-6">Formulário de Pedido será injetado aqui</p>
        </div>
      ),
      data: { pedido, onSave }
    });
  };

  const openClienteWindow = (cliente = null, onSave) => {
    return openWindow({
      title: cliente ? `Cliente: ${cliente.nome}` : 'Novo Cliente',
      subtitle: 'Cadastro Completo de Cliente',
      icon: require('lucide-react').Users,
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-500">Formulário de Cliente será injetado aqui</p>
        </div>
      ),
      data: { cliente, onSave }
    });
  };

  const openTabelaPrecoWindow = (tabela = null, onSave) => {
    return openWindow({
      title: tabela ? `Tabela: ${tabela.nome}` : 'Nova Tabela de Preço',
      subtitle: 'Gerenciamento de Preços V21.1.2',
      icon: require('lucide-react').DollarSign,
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-500">Formulário de Tabela de Preço será injetado aqui</p>
        </div>
      ),
      data: { tabela, onSave }
    });
  };

  const openNFeWindow = (nfe = null, pedido = null) => {
    return openWindow({
      title: 'Emitir NF-e',
      subtitle: nfe ? `NF-e ${nfe.numero}` : 'Nova Nota Fiscal',
      icon: require('lucide-react').FileText,
      badge: 'Fiscal',
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-500">Formulário de NF-e será injetado aqui</p>
        </div>
      ),
      data: { nfe, pedido }
    });
  };

  const openFornecedorWindow = (fornecedor = null, onSave) => {
    return openWindow({
      title: fornecedor ? `Fornecedor: ${fornecedor.nome}` : 'Novo Fornecedor',
      subtitle: 'Cadastro de Fornecedores',
      icon: require('lucide-react').Truck,
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-500">Formulário de Fornecedor será injetado aqui</p>
        </div>
      ),
      data: { fornecedor, onSave }
    });
  };

  return {
    openProductWindow,
    openPedidoWindow,
    openClienteWindow,
    openTabelaPrecoWindow,
    openNFeWindow,
    openFornecedorWindow,
    openWindow // Genérico
  };
}