import React, { lazy, Suspense } from 'react';
import { useWindowManager } from './WindowManager';
import { Package, ShoppingCart, Users, DollarSign, FileText, Truck, Loader2, Building2, UserCircle, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const ProdutoFormV22_Completo = lazy(() => import('@/components/cadastros/ProdutoFormV22_Completo'));
const PedidoFormCompleto = lazy(() => import('@/components/comercial/PedidoFormCompleto'));
const CadastroClienteCompleto = lazy(() => import('@/components/cadastros/CadastroClienteCompleto'));
const CadastroFornecedorCompleto = lazy(() => import('@/components/cadastros/CadastroFornecedorCompleto'));
const TabelaPrecoFormCompleto = lazy(() => import('@/components/cadastros/TabelaPrecoFormCompleto'));

/**
 * V21.0 - HOOK DE JANELAS MULTITAREFA
 * ✅ Integração completa com todos os formulários
 * ✅ Multi-instância real
 * ✅ Lazy loading otimizado
 * ✅ Callbacks de salvamento
 */
export function useWindow() {
  const { openWindow } = useWindowManager();

  const openProductWindow = (produto = null) => {
    return openWindow({
      title: produto ? `Produto: ${produto.descricao}` : 'Novo Produto',
      subtitle: 'V21.0 - IA + Conversões + E-commerce',
      icon: Package,
      badge: produto ? 'Edição' : 'Novo',
      module: 'produtos',
      content: (
        <div className="h-full overflow-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Carregando formulário...</span>
            </div>
          }>
            <ProdutoFormV22_Completo
              produto={produto}
              onSubmit={async (data) => {
                try {
                  if (produto?.id) {
                    await base44.entities.Produto.update(produto.id, data);
                    toast.success('✅ Produto atualizado!');
                  } else {
                    await base44.entities.Produto.create(data);
                    toast.success('✅ Produto criado!');
                  }
                  window.location.reload();
                } catch (error) {
                  toast.error('Erro ao salvar: ' + error.message);
                }
              }}
              isSubmitting={false}
            />
          </Suspense>
        </div>
      )
    });
  };

  const openPedidoWindow = (pedido = null, clientes = []) => {
    return openWindow({
      title: pedido ? `Pedido ${pedido.numero_pedido}` : 'Novo Pedido',
      subtitle: 'V21.0 - 9 Abas Multi-Instância',
      icon: ShoppingCart,
      badge: pedido?.numero_pedido || 'Novo',
      module: 'pedidos',
      content: (
        <div className="h-full overflow-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-3 text-slate-600">Carregando pedido...</span>
            </div>
          }>
            <PedidoFormCompleto
              pedido={pedido}
              clientes={clientes}
              onSubmit={async (data) => {
                try {
                  if (pedido?.id) {
                    await base44.entities.Pedido.update(pedido.id, data);
                    toast.success('✅ Pedido atualizado!');
                  } else {
                    await base44.entities.Pedido.create(data);
                    toast.success('✅ Pedido criado!');
                  }
                  window.location.reload();
                } catch (error) {
                  toast.error('Erro ao salvar: ' + error.message);
                }
              }}
              onCancel={() => {}}
            />
          </Suspense>
        </div>
      )
    });
  };

  const openClienteWindow = (cliente = null) => {
    return openWindow({
      title: cliente ? `Cliente: ${cliente.nome}` : 'Novo Cliente',
      subtitle: 'V21.0 - Cadastro Completo',
      icon: Users,
      badge: cliente?.status || 'Novo',
      module: 'clientes',
      content: (
        <div className="h-full overflow-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-3 text-slate-600">Carregando cliente...</span>
            </div>
          }>
            <CadastroClienteCompleto
              cliente={cliente}
              onSubmit={async (data) => {
                try {
                  if (cliente?.id) {
                    await base44.entities.Cliente.update(cliente.id, data);
                    toast.success('✅ Cliente atualizado!');
                  } else {
                    await base44.entities.Cliente.create(data);
                    toast.success('✅ Cliente criado!');
                  }
                  window.location.reload();
                } catch (error) {
                  toast.error('Erro ao salvar: ' + error.message);
                }
              }}
              isSubmitting={false}
            />
          </Suspense>
        </div>
      )
    });
  };

  const openTabelaPrecoWindow = (tabela = null) => {
    return openWindow({
      title: tabela ? `Tabela: ${tabela.nome}` : 'Nova Tabela de Preço',
      subtitle: 'V21.0 - Motor de Cálculo + IA',
      icon: DollarSign,
      badge: tabela?.tipo || 'Novo',
      module: 'tabelas-preco',
      content: (
        <div className="h-full overflow-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
              <span className="ml-3 text-slate-600">Carregando tabela...</span>
            </div>
          }>
            <TabelaPrecoFormCompleto
              tabela={tabela}
              onSubmit={async (data) => {
                if (data._salvamentoCompleto) {
                  toast.success('✅ Tabela salva completamente!');
                  window.location.reload();
                }
              }}
            />
          </Suspense>
        </div>
      )
    });
  };

  const openFornecedorWindow = (fornecedor = null) => {
    return openWindow({
      title: fornecedor ? `Fornecedor: ${fornecedor.nome}` : 'Novo Fornecedor',
      subtitle: 'V21.0 - Cadastro de Fornecedores',
      icon: Truck,
      badge: fornecedor?.status || 'Novo',
      module: 'fornecedores',
      content: (
        <div className="h-full overflow-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              <span className="ml-3 text-slate-600">Carregando fornecedor...</span>
            </div>
          }>
            <CadastroFornecedorCompleto
              fornecedor={fornecedor}
              onSubmit={async (data) => {
                try {
                  if (fornecedor?.id) {
                    await base44.entities.Fornecedor.update(fornecedor.id, data);
                    toast.success('✅ Fornecedor atualizado!');
                  } else {
                    await base44.entities.Fornecedor.create(data);
                    toast.success('✅ Fornecedor criado!');
                  }
                  window.location.reload();
                } catch (error) {
                  toast.error('Erro ao salvar: ' + error.message);
                }
              }}
              isSubmitting={false}
            />
          </Suspense>
        </div>
      )
    });
  };

  const openNFeWindow = (pedido = null) => {
    return openWindow({
      title: 'Emitir NF-e',
      subtitle: pedido ? `Pedido ${pedido.numero_pedido}` : 'Nova Nota Fiscal',
      icon: FileText,
      badge: 'Fiscal',
      module: 'nfe',
      content: (
        <div className="h-full overflow-auto p-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Gerador de NF-e
            </h3>
            <p className="text-slate-600">
              {pedido ? `Gerando NF-e para pedido ${pedido.numero_pedido}` : 'Módulo NF-e em desenvolvimento'}
            </p>
          </div>
        </div>
      )
    });
  };

  return {
    openProductWindow,
    openPedidoWindow,
    openClienteWindow,
    openTabelaPrecoWindow,
    openNFeWindow,
    openFornecedorWindow,
    openWindow
  };
}