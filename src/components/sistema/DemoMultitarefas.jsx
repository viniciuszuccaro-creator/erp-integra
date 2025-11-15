import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  FileText,
  Sparkles,
  Layers
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';

/**
 * V21.1.2 - DEMO do Sistema de Multitarefas
 * Demonstra como abrir múltiplas janelas simultaneamente
 */
export default function DemoMultitarefas() {
  const { 
    openProductWindow, 
    openPedidoWindow, 
    openClienteWindow,
    openTabelaPrecoWindow,
    openNFeWindow,
    openFornecedorWindow
  } = useWindow();

  const demos = [
    {
      title: 'Abrir Produto',
      icon: Package,
      color: 'blue',
      action: openProductWindow,
      description: 'Cadastro de produto com IA'
    },
    {
      title: 'Abrir Pedido',
      icon: ShoppingCart,
      color: 'green',
      action: openPedidoWindow,
      description: '9 abas multi-instância'
    },
    {
      title: 'Abrir Cliente',
      icon: Users,
      color: 'purple',
      action: openClienteWindow,
      description: 'Cadastro completo de cliente'
    },
    {
      title: 'Abrir Tabela Preço',
      icon: DollarSign,
      color: 'yellow',
      action: openTabelaPrecoWindow,
      description: 'Gerenciamento de preços'
    },
    {
      title: 'Abrir NF-e',
      icon: FileText,
      color: 'red',
      action: openNFeWindow,
      description: 'Emissão de nota fiscal'
    }
  ];

  const handleAbrirTudo = () => {
    demos.forEach((demo, idx) => {
      setTimeout(() => {
        demo.action();
      }, idx * 200); // Escalonado para efeito visual
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-600" />
            Sistema de Multitarefas V21.1.2
          </h1>
          <p className="text-slate-600">
            Abra múltiplas janelas simultaneamente - Fixe, minimize, maximize e arraste
          </p>
        </div>

        <Alert className="border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <AlertDescription>
            <p className="font-semibold text-blue-900 mb-2">
              🚀 Nova Capacidade - Multitarefa Absoluta
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✔ Abra quantas janelas quiser simultaneamente</li>
              <li>✔ Cada modal em <strong>max-w-[90vw]</strong></li>
              <li>✔ <strong>Fixar</strong> - trava a janela na frente</li>
              <li>✔ <strong>Minimizar</strong> - envia para barra inferior direita</li>
              <li>✔ <strong>Maximizar</strong> - expande para tela cheia</li>
              <li>✔ <strong>Arrastar</strong> - mova livremente pela tela</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>🎯 Demonstração</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {demos.map((demo) => {
                const Icon = demo.icon;
                return (
                  <Card 
                    key={demo.title}
                    className={`hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-${demo.color}-400`}
                    onClick={() => demo.action()}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className={`w-12 h-12 mx-auto rounded-full bg-${demo.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${demo.color}-600`} />
                      </div>
                      <p className="font-semibold text-slate-900">{demo.title}</p>
                      <p className="text-xs text-slate-500">{demo.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAbrirTudo}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Layers className="w-5 h-5 mr-2" />
                Abrir TODAS as Janelas (Demo Completo)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">✅ Como Usar no Código</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm font-mono">
              <pre>{`import { useWindow } from '@/components/lib/useWindow';

function MeuComponente() {
  const { openProductWindow, openPedidoWindow } = useWindow();

  return (
    <Button onClick={() => openProductWindow()}>
      Abrir Produto
    </Button>
  );
}`}</pre>
            </div>

            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertDescription className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">💡 Próximo Passo:</p>
                <p>Integrar os formulários reais (ProdutoForm, PedidoFormCompleto, etc.) nas janelas.</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}