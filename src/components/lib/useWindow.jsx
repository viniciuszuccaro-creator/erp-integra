import React from 'react';
import { useWindowManager } from './WindowManager';
import { Package, ShoppingCart, Users, DollarSign, FileText, Truck } from 'lucide-react';
import ProdutoForm from '@/components/cadastros/ProdutoForm';

/**
 * V21.1.2 - Hook para abrir janelas facilmente
 * Conecta formulários reais ao sistema de multitarefas
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
          <ProdutoForm
            produto={produto}
            onSubmit={(data) => {
              if (onSave) onSave(data);
            }}
            isSubmitting={false}
          />
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
          {/* PedidoFormCompleto será integrado */}
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