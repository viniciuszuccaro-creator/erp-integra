import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWindowManagerEnhanced } from './WindowManagerEnhanced';
import { 
  ShoppingCart, 
  Package, 
  FileText, 
  Users, 
  DollarSign,
  Sparkles,
  Code
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.0 - MÓDULO 0 - EXEMPLOS PRÁTICOS DE USO
 * Demonstra como usar o Window Manager em diferentes contextos
 */

export default function ExemploUsoWindowManager() {
  const { openWindow } = useWindowManagerEnhanced();

  const abrirPedidoExemplo = () => {
    openWindow({
      title: 'Novo Pedido de Venda',
      subtitle: 'Cliente: Metalúrgica XYZ',
      icon: ShoppingCart,
      module: 'comercial',
      requiredPermission: 'comercial.criar',
      badge: 'Novo',
      content: (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Formulário de Pedido</h2>
          <p className="text-slate-600">Este seria o componente PedidoFormCompleto</p>
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              ✅ Janela aberta com sucesso!<br/>
              ✅ Permissões validadas<br/>
              ✅ Log de auditoria registrado<br/>
              ✅ IA disponível no botão superior direito
            </p>
          </div>
        </div>
      )
    });
    
    toast.success('Janela de Pedido aberta!');
  };

  const abrirCadastroCliente = () => {
    openWindow({
      title: 'Cadastro de Cliente',
      subtitle: 'Novo cliente',
      icon: Users,
      module: 'cadastros',
      requiredPermission: 'cadastros.criar',
      badge: 'Cadastro',
      content: (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Formulário de Cliente</h2>
          <p className="text-slate-600">Este seria o componente ClienteFormCompleto</p>
        </div>
      )
    });
  };

  const abrirMultiplasJanelas = () => {
    // Abre 3 janelas ao mesmo tempo
    ['Pedido #1234', 'Pedido #1235', 'Pedido #1236'].forEach((titulo, idx) => {
      setTimeout(() => {
        openWindow({
          title: titulo,
          subtitle: `Cliente ${idx + 1}`,
          icon: ShoppingCart,
          module: 'comercial',
          requiredPermission: 'comercial.visualizar',
          content: (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{titulo}</h2>
              <p className="text-slate-600">Conteúdo do pedido {idx + 1}</p>
            </div>
          )
        });
      }, idx * 200);
    });

    toast.success('3 janelas abertas simultaneamente!');
  };

  const abrirComIA = () => {
    openWindow({
      title: 'Teste com Assistente IA',
      subtitle: 'Exemplo de IA contextual',
      icon: Sparkles,
      module: 'comercial',
      content: (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Janela com IA Integrada</h2>
          <p className="text-slate-600 mb-4">
            Clique no botão "Ajuda com IA" no canto superior direito desta janela.
          </p>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-purple-800">
              💡 A IA irá analisar o contexto desta janela e fornecer:<br/>
              • Explicação do que está sendo feito<br/>
              • Próximos passos sugeridos<br/>
              • Alertas e validações<br/>
              • Sugestões de otimização
            </p>
          </div>
        </div>
      ),
      data: {
        valor_total: 15000,
        margem: 12,
        cliente: 'Teste Cliente'
      }
    });
  };

  const exemploCodigo = `
// Exemplo de uso em qualquer componente:

import { useWindowManagerEnhanced } from '@/components/lib/WindowManagerEnhanced';
import { ShoppingCart } from 'lucide-react';

function MeuComponente() {
  const { openWindow } = useWindowManagerEnhanced();

  const abrirPedido = () => {
    openWindow({
      title: 'Novo Pedido',
      icon: ShoppingCart,
      module: 'comercial',
      requiredPermission: 'comercial.criar',
      content: <PedidoFormCompleto />
    });
  };

  return <Button onClick={abrirPedido}>Criar Pedido</Button>;
}
  `.trim();

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card className="border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-6 h-6 text-purple-600" />
            Exemplos de Uso - Window Manager V21.0
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">
            Demonstrações práticas de como usar o sistema de janelas multitarefa em diferentes contextos.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={abrirPedidoExemplo} className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Abrir Pedido (Exemplo 1)
            </Button>

            <Button onClick={abrirCadastroCliente} className="bg-green-600 hover:bg-green-700">
              <Users className="w-4 h-4 mr-2" />
              Cadastro Cliente (Exemplo 2)
            </Button>

            <Button onClick={abrirMultiplasJanelas} className="bg-orange-600 hover:bg-orange-700">
              <Package className="w-4 h-4 mr-2" />
              Múltiplas Janelas (Exemplo 3)
            </Button>

            <Button onClick={abrirComIA} className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Com Assistente IA (Exemplo 4)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Código de Exemplo</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
            <code>{exemploCodigo}</code>
          </pre>
        </CardContent>
      </Card>

      <Card className="border-green-300 bg-green-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-900 mb-2">✅ Recursos Disponíveis:</h3>
          <ul className="space-y-1 text-sm text-green-800 ml-4">
            <li>• Janelas redimensionáveis e arrastáveis</li>
            <li>• Minimizar/Maximizar/Fechar</li>
            <li>• Fixar janelas (pin)</li>
            <li>• Múltiplas instâncias simultâneas</li>
            <li>• Verificação automática de permissões</li>
            <li>• Auditoria automática de ações</li>
            <li>• Assistente IA contextual</li>
            <li>• Atalhos de teclado globais</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}