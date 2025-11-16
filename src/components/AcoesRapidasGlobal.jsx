
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ShoppingCart, Users, Package, DollarSign, FileText, Truck, Zap, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // This import is no longer used but was in the original file, removing it now
import { createPageUrl } from '@/utils'; // This import is no longer used but was in the original file, removing it now
import { useWindow } from "@/components/lib/useWindow";

/**
 * Ações Rápidas Globais - Botão + Novo
 * Acesso rápido às ações mais comuns do sistema
 */
export default function AcoesRapidasGlobal() {
  const { openProductWindow, openPedidoWindow, openClienteWindow, openTabelaPrecoWindow } = useWindow();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
          <Zap className="w-5 h-5 text-slate-600" />
          <span className="text-sm text-slate-600 hidden lg:inline">Ações Rápidas</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>🚀 V21.0 - Multitarefa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => openPedidoWindow()}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Novo Pedido (Janela)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openClienteWindow()}>
          <Users className="w-4 h-4 mr-2" />
          Novo Cliente (Janela)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openProductWindow()}>
          <Package className="w-4 h-4 mr-2" />
          Novo Produto (Janela)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openTabelaPrecoWindow()}>
          <DollarSign className="w-4 h-4 mr-2" />
          Nova Tabela de Preço (Janela)
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Calendar className="w-4 h-4 mr-2" />
          Novo Evento
        </DropdownMenuItem>

        <DropdownMenuItem>
          <FileText className="w-4 h-4 mr-2" />
          Novo Relatório
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
