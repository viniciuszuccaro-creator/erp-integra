import React, { useEffect } from 'react';
import { useWindowManagerEnhanced } from './WindowManagerEnhanced';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  DollarSign,
  Truck,
  Factory
} from 'lucide-react';

/**
 * V21.0 - MÓDULO 0 - ATALHOS DE TECLADO GLOBAIS
 * ✅ Ctrl+N: Novo Pedido
 * ✅ Ctrl+P: Abrir Produtos
 * ✅ Ctrl+F: Abrir Financeiro
 * ✅ Ctrl+E: Abrir Estoque
 * ✅ Ctrl+Shift+N: Nova NF-e
 * ✅ Ctrl+?: Ajuda de atalhos
 */

export default function GlobalKeyboardShortcuts() {
  const { openWindow } = useWindowManagerEnhanced();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = async (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // Ctrl + N: Novo Pedido
      if (ctrl && !shift && e.key === 'n') {
        e.preventDefault();
        const PedidoFormCompleto = (await import('../comercial/PedidoFormCompleto')).default;
        openWindow({
          title: 'Novo Pedido de Venda',
          icon: ShoppingCart,
          module: 'comercial',
          requiredPermission: 'comercial.criar',
          badge: 'Novo',
          content: <PedidoFormCompleto onSubmit={() => toast.success('Pedido salvo!')} />
        });
        toast.info('🚀 Atalho: Ctrl+N - Novo Pedido');
      }

      // Ctrl + P: Produtos
      if (ctrl && !shift && e.key === 'p') {
        e.preventDefault();
        navigate(createPageUrl('Cadastros') + '?tab=produtos');
        toast.info('🚀 Atalho: Ctrl+P - Produtos');
      }

      // Ctrl + E: Estoque
      if (ctrl && !shift && e.key === 'e') {
        e.preventDefault();
        navigate(createPageUrl('Estoque'));
        toast.info('🚀 Atalho: Ctrl+E - Estoque');
      }

      // Ctrl + F: Financeiro
      if (ctrl && !shift && e.key === 'f') {
        e.preventDefault();
        navigate(createPageUrl('Financeiro'));
        toast.info('🚀 Atalho: Ctrl+F - Financeiro');
      }

      // Ctrl + Shift + N: Nova NF-e
      if (ctrl && shift && e.key === 'N') {
        e.preventDefault();
        openWindow({
          title: 'Nova Nota Fiscal',
          subtitle: 'NF-e de Saída',
          icon: FileText,
          module: 'fiscal',
          requiredPermission: 'fiscal.gerar_nfe',
          badge: 'NF-e',
          content: <div className="p-6">Formulário de NF-e aqui</div>
        });
        toast.info('🚀 Atalho: Ctrl+Shift+N - Nova NF-e');
      }

      // Ctrl + Shift + C: Novo Cliente
      if (ctrl && shift && e.key === 'C') {
        e.preventDefault();
        navigate(createPageUrl('Cadastros') + '?tab=clientes&new=true');
        toast.info('🚀 Atalho: Ctrl+Shift+C - Novo Cliente');
      }

      // Ctrl + ?: Ajuda de Atalhos
      if (ctrl && e.key === '/') {
        e.preventDefault();
        toast.info(`
          ⌨️ Atalhos Disponíveis:
          • Ctrl+N: Novo Pedido
          • Ctrl+P: Produtos
          • Ctrl+E: Estoque
          • Ctrl+F: Financeiro
          • Ctrl+Shift+N: Nova NF-e
          • Ctrl+Shift+C: Novo Cliente
          • Ctrl+K: Pesquisa Universal
        `, { duration: 8000 });
      }

      // Ctrl + W: Fechar janela ativa
      if (ctrl && e.key === 'w') {
        e.preventDefault();
        // Implementar lógica de fechar janela ativa quando tivermos activeWindowId
        toast.info('🚀 Atalho: Ctrl+W - Fechar janela ativa');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openWindow, navigate]);

  return null;
}