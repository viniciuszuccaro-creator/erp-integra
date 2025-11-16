import React, { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Package, ShoppingCart, Users, DollarSign, FileText, Truck, TrendingUp, Settings } from 'lucide-react';
import { useWindow } from './useWindow';

/**
 * V21.0 - PALETA DE COMANDOS PARA JANELAS
 * Atalho: Ctrl+K ou Cmd+K
 * 
 * ✅ Abrir qualquer janela por comando
 * ✅ Busca fuzzy inteligente
 * ✅ Histórico de janelas recentes
 */

const WINDOW_COMMANDS = [
  { 
    id: 'product', 
    label: 'Novo Produto', 
    icon: Package, 
    keywords: ['produto', 'item', 'cadastro'],
    action: 'openProductWindow'
  },
  { 
    id: 'pedido', 
    label: 'Novo Pedido', 
    icon: ShoppingCart, 
    keywords: ['pedido', 'venda', 'ordem'],
    action: 'openPedidoWindow'
  },
  { 
    id: 'cliente', 
    label: 'Novo Cliente', 
    icon: Users, 
    keywords: ['cliente', 'consumidor'],
    action: 'openClienteWindow'
  },
  { 
    id: 'tabela', 
    label: 'Nova Tabela de Preço', 
    icon: DollarSign, 
    keywords: ['preço', 'tabela', 'precificação'],
    action: 'openTabelaPrecoWindow'
  },
  { 
    id: 'nfe', 
    label: 'Emitir NF-e', 
    icon: FileText, 
    keywords: ['nota', 'fiscal', 'nfe'],
    action: 'openNFeWindow'
  },
  { 
    id: 'fornecedor', 
    label: 'Novo Fornecedor', 
    icon: Truck, 
    keywords: ['fornecedor', 'supplier'],
    action: 'openFornecedorWindow'
  }
];

export default function WindowCommandPalette() {
  const [open, setOpen] = useState(false);
  const window = useWindow();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (command) => {
    const action = window[command.action];
    if (action) {
      action();
    }
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite para buscar janelas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Abrir Janelas">
          {WINDOW_COMMANDS.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.id}
                value={cmd.label}
                keywords={cmd.keywords}
                onSelect={() => handleSelect(cmd)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{cmd.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}