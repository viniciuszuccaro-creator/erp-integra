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
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWindow } from '@/components/lib/useWindow';
import CadastroClienteCompleto from '@/components/cadastros/CadastroClienteCompleto';
import CadastroFornecedorCompleto from '@/components/cadastros/CadastroFornecedorCompleto';
import ProdutoFormV22_Completo from '@/components/cadastros/ProdutoFormV22_Completo';
import TabelaPrecoFormCompleto from '@/components/cadastros/TabelaPrecoFormCompleto';
import PedidoFormCompleto from '@/components/comercial/PedidoFormCompleto';
import ContaReceberForm from '@/components/financeiro/ContaReceberForm';
import ContaPagarForm from '@/components/financeiro/ContaPagarForm';
import FormularioEntrega from '@/components/expedicao/FormularioEntrega';
import OportunidadeForm from '@/components/crm/OportunidadeForm';
import { toast } from 'sonner';

/**
 * Ações Rápidas Globais - Botão + Novo
 * Acesso rápido às ações mais comuns do sistema
 * V21.0: Integrado com Sistema de Janelas Multitarefa
 */
export default function AcoesRapidasGlobal() {
  const navigate = useNavigate();
  const { openWindow } = useWindow();

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const acoes = [
    {
      label: 'Novo Pedido',
      icon: ShoppingCart,
      action: () => openWindow(
        PedidoFormCompleto,
        { 
          clientes,
          windowMode: true,
          onSubmit: async (formData) => {
            try {
              await base44.entities.Pedido.create(formData);
              toast.success("✅ Pedido criado com sucesso!");
            } catch (error) {
              toast.error("Erro ao salvar pedido");
            }
          },
          onCancel: () => {}
        },
        {
          title: '🛒 Novo Pedido',
          width: 1400,
          height: 800
        }
      ),
      cor: 'text-blue-600'
    },
    {
      label: 'Novo Cliente',
      icon: Users,
      action: () => openWindow(CadastroClienteCompleto, { windowMode: true }, {
        title: '🧑 Novo Cliente',
        width: 1100,
        height: 650
      }),
      cor: 'text-green-600'
    },
    {
      label: 'Novo Produto',
      icon: Package,
      action: () => openWindow(ProdutoFormV22_Completo, { windowMode: true }, {
        title: '📦 Novo Produto',
        width: 1200,
        height: 700
      }),
      cor: 'text-purple-600'
    },
    {
      label: 'Novo Fornecedor',
      icon: Truck,
      action: () => openWindow(CadastroFornecedorCompleto, { windowMode: true }, {
        title: '🏢 Novo Fornecedor',
        width: 1100,
        height: 650
      }),
      cor: 'text-cyan-600'
    },
    {
      label: 'Nova Tabela de Preço',
      icon: DollarSign,
      action: () => openWindow(TabelaPrecoFormCompleto, { windowMode: true }, {
        title: '💰 Nova Tabela',
        width: 1200,
        height: 700
      }),
      cor: 'text-emerald-600'
    },
    {
      label: 'Novo Título a Receber',
      icon: DollarSign,
      action: () => openWindow(ContaReceberForm, {
        windowMode: true,
        onSubmit: async (data) => {
          try {
            await base44.entities.ContaReceber.create(data);
            toast.success("✅ Conta criada!");
          } catch (error) {
            toast.error("Erro ao criar conta");
          }
        }
      }, {
        title: '💰 Nova Conta a Receber',
        width: 900,
        height: 600
      }),
      cor: 'text-green-600'
    },
    {
      label: 'Novo Título a Pagar',
      icon: DollarSign,
      action: () => openWindow(ContaPagarForm, {
        windowMode: true,
        onSubmit: async (data) => {
          try {
            await base44.entities.ContaPagar.create(data);
            toast.success("✅ Conta criada!");
          } catch (error) {
            toast.error("Erro ao criar conta");
          }
        }
      }, {
        title: '💸 Nova Conta a Pagar',
        width: 900,
        height: 600
      }),
      cor: 'text-red-600'
    },
    {
      label: 'Nova Oportunidade CRM',
      icon: Users,
      action: () => openWindow(OportunidadeForm, {
        windowMode: true,
        onSubmit: async (data) => {
          try {
            await base44.entities.Oportunidade.create({
              ...data,
              quantidade_interacoes: 0,
              dias_sem_contato: 0
            });
            toast.success("✅ Oportunidade criada!");
          } catch (error) {
            toast.error("Erro ao criar oportunidade");
          }
        }
      }, {
        title: '🎯 Nova Oportunidade',
        width: 1000,
        height: 650
      }),
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