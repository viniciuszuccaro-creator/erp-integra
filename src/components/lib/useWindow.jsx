import React, { lazy, Suspense } from 'react';
import { useWindowManager } from './WindowManager';
import { Package, ShoppingCart, Users, DollarSign, FileText, Truck, Loader2 } from 'lucide-react';

// V21.1.2-R2: Lazy loading para evitar circular dependencies
const ProdutoForm = lazy(() => import('@/components/cadastros/ProdutoForm'));

/**
 * V21.1.2-R2 - Hook para abrir janelas facilmente
 * ✅ Lazy loading dos formulários
 * ✅ Suspense com loading state
 */
export function useWindow() {
  const { openWindow } = useWindowManager();

  const openProductWindow = (produto = null, onSave) => {
    return openWindow({
      title: produto ? `Editar: ${produto.descricao}` : 'Novo Produto',
      subtitle: 'Cadastro V21.1.2 - IA + Peso/Dimensões',
      icon: Package,
      badge: produto ? 'Edição' : 'Novo',
      content: (
        <div className="h-full overflow-auto p-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          }>
            <ProdutoForm
              produto={produto}
              onSubmit={(data) => {
                if (onSave) onSave(data);
              }}
              isSubmitting={false}
            />
          </Suspense>
        </div>
      ),
      data: { produto, onSave }
    });
  };

  const openPedidoWindow = (pedido = null, onSave) => {
    return openWindow({
      title: pedido ? `Pedido ${pedido.numero_pedido}` : 'Novo Pedido',
      subtitle: '9 Abas - Multi-Instância V21.1.2',
      icon: ShoppingCart,
      badge: pedido ? `#${pedido.numero_pedido}` : 'Novo',
      content: (
        <div className="h-full overflow-hidden">
          <div className="p-6">
            <p className="text-slate-600">🚧 PedidoFormCompleto será conectado aqui</p>
            <p className="text-xs text-slate-500 mt-2">
              Formulário completo de pedido com 9 abas já existe, apenas falta conectar ao WindowManager
            </p>
          </div>
        </div>
      ),
      data: { pedido, onSave }
    });
  };

  const openClienteWindow = (cliente = null, onSave) => {
    return openWindow({
      title: cliente ? `Cliente: ${cliente.nome}` : 'Novo Cliente',
      subtitle: 'Cadastro Completo de Cliente',
      icon: Users,
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-600">🚧 ClienteForm será conectado aqui</p>
        </div>
      ),
      data: { cliente, onSave }
    });
  };

  const openTabelaPrecoWindow = (tabela = null, onSave) => {
    return openWindow({
      title: tabela ? `Tabela: ${tabela.nome}` : 'Nova Tabela de Preço',
      subtitle: 'Gerenciamento de Preços V21.1.2',
      icon: DollarSign,
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-600">🚧 TabelaPrecoForm será conectado aqui</p>
        </div>
      ),
      data: { tabela, onSave }
    });
  };

  const openNFeWindow = (nfe = null, pedido = null) => {
    return openWindow({
      title: 'Emitir NF-e',
      subtitle: nfe ? `NF-e ${nfe.numero}` : 'Nova Nota Fiscal',
      icon: FileText,
      badge: 'Fiscal',
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-600">🚧 GerarNFeModal será conectado aqui</p>
        </div>
      ),
      data: { nfe, pedido }
    });
  };

  const openFornecedorWindow = (fornecedor = null, onSave) => {
    return openWindow({
      title: fornecedor ? `Fornecedor: ${fornecedor.nome}` : 'Novo Fornecedor',
      subtitle: 'Cadastro de Fornecedores',
      icon: Truck,
      content: (
        <div className="h-full overflow-auto p-6">
          <p className="text-slate-600">🚧 FornecedorForm será conectado aqui</p>
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