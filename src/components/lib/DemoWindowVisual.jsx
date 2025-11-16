import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWindowManagerEnhanced } from './WindowManagerEnhanced';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  DollarSign,
  Factory,
  Truck,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import IAWindowAssistant from './IAWindowAssistant';

/**
 * V21.0 - MÓDULO 0 - DEMONSTRAÇÃO VISUAL COMPLETA
 */

export default function DemoWindowVisual() {
  const { openWindow, windows } = useWindowManagerEnhanced();

  const exemplos = [
    {
      titulo: '🛒 Pedido de Venda',
      icon: ShoppingCart,
      cor: 'blue',
      onClick: () => {
        openWindow({
          title: 'Pedido de Venda #1234',
          subtitle: 'Cliente: Metalúrgica ABC Ltda',
          icon: ShoppingCart,
          module: 'comercial',
          requiredPermission: 'comercial.visualizar',
          badge: 'Em Edição',
          content: (
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">✅ Exemplo de Pedido</h3>
                <p className="text-sm text-blue-800">Esta janela demonstra:</p>
                <ul className="text-xs text-blue-700 ml-4 mt-2 space-y-1">
                  <li>• Arraste o cabeçalho para mover</li>
                  <li>• Clique em Minimizar para enviar à barra</li>
                  <li>• Clique em Maximizar para tela cheia</li>
                  <li>• Fixar mantém no topo</li>
                  <li>• Clique no botão IA (canto superior direito)</li>
                </ul>
              </div>
              
              <IAWindowAssistant
                window={{ title: 'Pedido de Venda', module: 'comercial' }}
                context={{
                  cliente: 'Metalúrgica ABC',
                  valor_total: 15000,
                  margem_percentual: 18
                }}
              />

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-xs text-slate-600">Cliente</p>
                  <p className="font-semibold">Metalúrgica ABC Ltda</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-xs text-slate-600">Valor Total</p>
                  <p className="font-semibold text-green-700">R$ 15.000,00</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-xs text-slate-600">Margem</p>
                  <p className="font-semibold">18%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-xs text-slate-600">Status</p>
                  <Badge className="bg-yellow-600">Em Aprovação</Badge>
                </div>
              </div>
            </div>
          ),
          data: {
            pedido_id: '1234',
            cliente: 'Metalúrgica ABC',
            valor: 15000
          }
        });
        toast.success('✅ Janela de Pedido aberta!');
      }
    },
    {
      titulo: '📦 Cadastro de Produto',
      icon: Package,
      cor: 'green',
      onClick: () => {
        openWindow({
          title: 'Cadastro de Produto',
          subtitle: 'Vergalhão 8mm CA-50',
          icon: Package,
          module: 'cadastros',
          requiredPermission: 'cadastros.visualizar',
          badge: 'Bitola',
          content: (
            <div className="p-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                <h3 className="font-bold text-green-900 mb-2">📦 Exemplo de Produto</h3>
                <p className="text-sm text-green-800">
                  Demonstração de cadastro com IA, unidades múltiplas e conversões automáticas
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Descrição</label>
                  <p className="text-slate-900">Vergalhão 8mm 12m CA-50</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Peso kg/m</label>
                    <p className="text-slate-900">0.395 kg/m</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Unidade Principal</label>
                    <Badge>KG</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">NCM</label>
                    <p className="text-slate-900">7214.20.00</p>
                  </div>
                </div>
              </div>
            </div>
          )
        });
        toast.success('✅ Janela de Produto aberta!');
      }
    },
    {
      titulo: '📄 Nota Fiscal (NF-e)',
      icon: FileText,
      cor: 'purple',
      onClick: () => {
        openWindow({
          title: 'Nota Fiscal Eletrônica',
          subtitle: 'NF-e #000123 - Saída',
          icon: FileText,
          module: 'fiscal',
          requiredPermission: 'fiscal.visualizar',
          badge: 'Autorizada',
          content: (
            <div className="p-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">📄 Nota Fiscal</h3>
                <div className="space-y-2 text-sm text-purple-800">
                  <p>• Número: 000123</p>
                  <p>• Chave: 1234 5678 9012 3456 7890 1234 5678 9012 3456 7890 1234</p>
                  <p>• Valor: R$ 15.000,00</p>
                  <p>• ICMS: R$ 1.800,00</p>
                  <p>• Status: Autorizada pela SEFAZ</p>
                </div>
              </div>
            </div>
          )
        });
        toast.success('✅ Janela de NF-e aberta!');
      }
    },
    {
      titulo: '👥 Cliente',
      icon: Users,
      cor: 'indigo',
      onClick: () => {
        openWindow({
          title: 'Cadastro de Cliente',
          subtitle: 'Novo Cliente',
          icon: Users,
          module: 'cadastros',
          requiredPermission: 'cadastros.criar',
          badge: 'Novo',
          content: (
            <div className="p-6">
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="font-bold text-indigo-900 mb-2">👥 Cadastro de Cliente</h3>
                <p className="text-sm text-indigo-800">
                  Formulário completo com validação de CPF/CNPJ, busca automática de dados públicos e IA
                </p>
              </div>
            </div>
          )
        });
        toast.success('✅ Janela de Cliente aberta!');
      }
    },
    {
      titulo: '💰 Conta a Receber',
      icon: DollarSign,
      cor: 'emerald',
      onClick: () => {
        openWindow({
          title: 'Conta a Receber',
          subtitle: 'Boleto #567890',
          icon: DollarSign,
          module: 'financeiro',
          requiredPermission: 'financeiro.visualizar',
          badge: 'Pendente',
          content: (
            <div className="p-6">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-bold text-emerald-900 mb-2">💰 Financeiro</h3>
                <div className="space-y-2 text-sm text-emerald-800">
                  <p>• Cliente: Metalúrgica ABC</p>
                  <p>• Valor: R$ 15.000,00</p>
                  <p>• Vencimento: 30/12/2025</p>
                  <p>• Status: Aguardando Pagamento</p>
                </div>
              </div>
            </div>
          )
        });
        toast.success('✅ Janela de Conta a Receber aberta!');
      }
    },
    {
      titulo: '🏭 Ordem de Produção',
      icon: Factory,
      cor: 'orange',
      onClick: () => {
        openWindow({
          title: 'Ordem de Produção #OP-789',
          subtitle: 'Corte e Dobra - Pilares',
          icon: Factory,
          module: 'producao',
          requiredPermission: 'producao.visualizar',
          badge: 'Em Produção',
          content: (
            <div className="p-6">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-bold text-orange-900 mb-2">🏭 Ordem de Produção</h3>
                <div className="space-y-2 text-sm text-orange-800">
                  <p>• OP: #789</p>
                  <p>• Tipo: Corte e Dobra</p>
                  <p>• Peça: Pilar 6m - 50 unidades</p>
                  <p>• Bitola: 12.5mm</p>
                  <p>• Status: 45% concluído</p>
                </div>
              </div>
            </div>
          )
        });
        toast.success('✅ Janela de OP aberta!');
      }
    }
  ];

  const abrirTodasSimultaneas = () => {
    exemplos.forEach((ex, idx) => {
      setTimeout(() => ex.onClick(), idx * 300);
    });
    toast.success('🚀 Abrindo todas as janelas!');
  };

  const getCor = (cor) => {
    const cores = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
      emerald: 'from-emerald-500 to-emerald-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return cores[cor] || cores.blue;
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                🪟 Demonstração Visual - Janelas Multitarefa
              </h2>
              <p className="text-purple-700">
                Clique nos botões abaixo para abrir janelas reais do sistema
              </p>
            </div>
            <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
              {windows.length} janela{windows.length !== 1 ? 's' : ''} aberta{windows.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {exemplos.map((exemplo, idx) => (
              <Button
                key={idx}
                onClick={exemplo.onClick}
                className={`h-24 flex-col gap-2 bg-gradient-to-br ${getCor(exemplo.cor)} hover:opacity-90`}
              >
                <exemplo.icon className="w-8 h-8" />
                <span className="font-semibold">{exemplo.titulo}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-purple-200">
            <Button 
              onClick={abrirTodasSimultaneas} 
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 h-14"
            >
              <Zap className="w-5 h-5 mr-2" />
              Abrir TODAS as Janelas Simultaneamente (Demo Multitarefa)
            </Button>
          </div>

          <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-900">
              💡 <strong>Experimente:</strong> Abra várias janelas, arraste, minimize, maximize, fixe e veja a barra de janelas minimizadas aparecer no canto inferior direito!
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">⌨️ Atalhos de Teclado Globais</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded border">
              <code className="text-sm font-mono text-purple-700">Ctrl + N</code>
              <p className="text-xs text-slate-600 mt-1">Novo Pedido</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border">
              <code className="text-sm font-mono text-purple-700">Ctrl + P</code>
              <p className="text-xs text-slate-600 mt-1">Ir para Produtos</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border">
              <code className="text-sm font-mono text-purple-700">Ctrl + E</code>
              <p className="text-xs text-slate-600 mt-1">Ir para Estoque</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border">
              <code className="text-sm font-mono text-purple-700">Ctrl + F</code>
              <p className="text-xs text-slate-600 mt-1">Ir para Financeiro</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border">
              <code className="text-sm font-mono text-purple-700">Ctrl + Shift + N</code>
              <p className="text-xs text-slate-600 mt-1">Nova NF-e</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border">
              <code className="text-sm font-mono text-purple-700">Ctrl + K</code>
              <p className="text-xs text-slate-600 mt-1">Pesquisa Universal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}