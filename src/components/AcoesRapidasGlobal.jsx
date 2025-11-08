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
import { Plus, ShoppingCart, Users, Package, DollarSign, FileText, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Ações Rápidas Globais - Botão + Novo
 * Acesso rápido às ações mais comuns do sistema
 */
export default function AcoesRapidasGlobal() {
  const navigate = useNavigate();

  const acoes = [
    {
      label: 'Novo Pedido',
      icon: ShoppingCart,
      action: () => navigate(createPageUrl('Comercial') + '?action=novo-pedido'),
      cor: 'text-blue-600'
    },
    {
      label: 'Novo Cliente',
      icon: Users,
      action: () => navigate(createPageUrl('Cadastros') + '?tab=clientes&action=novo'),
      cor: 'text-green-600'
    },
    {
      label: 'Nova OP',
      icon: Package,
      action: () => navigate(createPageUrl('Producao') + '?action=nova-op'),
      cor: 'text-orange-600'
    },
    {
      label: 'Novo Título a Pagar',
      icon: DollarSign,
      action: () => navigate(createPageUrl('Financeiro') + '?tab=contas-pagar&action=novo'),
      cor: 'text-red-600'
    },
    {
      label: 'Nova Entrega',
      icon: Truck,
      action: () => navigate(createPageUrl('Expedicao') + '?action=nova-entrega'),
      cor: 'text-purple-600'
    },
    {
      label: 'Nova NF-e',
      icon: FileText,
      action: () => navigate(createPageUrl('Fiscal') + '?action=nova-nfe'),
      cor: 'text-indigo-600'
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {acoes.map((acao, idx) => {
          const Icon = acao.icon;
          return (
            <DropdownMenuItem
              key={idx}
              onClick={acao.action}
              className="cursor-pointer"
            >
              <Icon className={`w-4 h-4 mr-2 ${acao.cor}`} />
              <span>{acao.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}