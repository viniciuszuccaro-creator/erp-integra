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
import { Zap, ShoppingCart, Users, Package, DollarSign, FileText, Truck, Calendar } from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';

/**
 * V21.0 - AÇÕES RÁPIDAS COM MULTITAREFA
 * ✅ Abre janelas em vez de navegar
 * ✅ Multi-instância habilitada
 */
export default function AcoesRapidasGlobal() {
  const { openProductWindow, openPedidoWindow, openClienteWindow, openTabelaPrecoWindow, openFornecedorWindow, openNFeWindow } = useWindow();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-slate-600 hidden lg:inline">Ações Rápidas</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>🚀 V21.0 - Multitarefa Ativa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => openPedidoWindow()}>
          <ShoppingCart className="w-4 h-4 mr-2 text-purple-600" />
          <div>
            <p className="font-semibold">Novo Pedido</p>
            <p className="text-xs text-slate-500">Abre em janela multitarefa</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openClienteWindow()}>
          <Users className="w-4 h-4 mr-2 text-green-600" />
          <div>
            <p className="font-semibold">Novo Cliente</p>
            <p className="text-xs text-slate-500">Cadastro completo</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openProductWindow()}>
          <Package className="w-4 h-4 mr-2 text-blue-600" />
          <div>
            <p className="font-semibold">Novo Produto</p>
            <p className="text-xs text-slate-500">Com IA e conversões</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openTabelaPrecoWindow()}>
          <DollarSign className="w-4 h-4 mr-2 text-yellow-600" />
          <div>
            <p className="font-semibold">Nova Tabela de Preço</p>
            <p className="text-xs text-slate-500">Motor de cálculo V21.0</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => openFornecedorWindow()}>
          <Truck className="w-4 h-4 mr-2 text-orange-600" />
          Novo Fornecedor
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => openNFeWindow()}>
          <FileText className="w-4 h-4 mr-2 text-indigo-600" />
          Emitir NF-e
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Calendar className="w-4 h-4 mr-2 text-slate-600" />
          Novo Evento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}