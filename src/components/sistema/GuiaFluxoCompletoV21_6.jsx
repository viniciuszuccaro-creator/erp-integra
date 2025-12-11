import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart, 
  Zap, 
  Package, 
  FileText, 
  Truck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  DollarSign,
  LayoutDashboard
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

/**
 * V21.6 - GUIA COMPLETO DO FLUXO OPERACIONAL
 * Mostra o passo a passo de como usar o sistema
 */
export default function GuiaFluxoCompletoV21_6({ windowMode = false }) {
  const etapas = [
    {
      numero: 1,
      titulo: '📝 CRIAR A VENDA (PEDIDO)',
      local: 'Comercial → Aba "Pedidos"',
      pagina: 'Comercial',
      acoes: [
        'Clique em "Novo Pedido"',
        'Preencha: Cliente, Itens, Logística, Financeiro',
        'Salve como Rascunho',
        'Se houver desconto acima da margem → vai para "Aguardando Aprovação"'
      ],
      icon: ShoppingCart,
      cor: 'blue',
      statusResultante: 'Rascunho ou Aguardando Aprovação'
    },
    {
      numero: 2,
      titulo: '🚀 FECHAMENTO AUTOMÁTICO',
      local: 'Comercial → Aba "Pedidos" → Botão "🚀 Fechar Pedido"',
      pagina: 'Comercial',
      acoes: [
        'Localize o pedido em "Rascunho"',
        'Clique no botão "🚀 Fechar Pedido"',
        'O sistema automaticamente:',
        '  • Baixa o estoque',
        '  • Gera contas a receber (Financeiro)',
        '  • Cria registro de entrega (Expedição)',
        '  • Atualiza status para "Pronto para Faturar"'
      ],
      icon: Zap,
      cor: 'green',
      statusResultante: 'Pronto para Faturar',
      destaque: true
    },
    {
      numero: 3,
      titulo: '📄 FATURAMENTO (NF-e)',
      local: 'Fiscal → "Notas Fiscais"',
      pagina: 'Fiscal',
      acoes: [
        'Vá para o módulo "Fiscal"',
        'Clique em "Nova NF-e"',
        'Vincule o pedido "Pronto para Faturar"',
        'Emita a NF-e',
        'Status do pedido muda para "Faturado"'
      ],
      icon: FileText,
      cor: 'purple',
      statusResultante: 'Faturado'
    },
    {
      numero: 4,
      titulo: '📦 VERIFICAR EXPEDIÇÃO',
      local: 'Expedição → "Entregas"',
      pagina: 'Expedicao',
      acoes: [
        'A entrega já foi criada automaticamente (Etapa 2)',
        'Vá para "Expedição e Logística"',
        'Encontre a entrega na lista',
        'Status inicial: "Aguardando Separação"',
        'Atualize conforme avança: "Em Separação" → "Pronto para Expedir"'
      ],
      icon: Package,
      cor: 'orange',
      statusResultante: 'Entrega criada automaticamente'
    },
    {
      numero: 5,
      titulo: '🗺️ ROTEIRIZAÇÃO E ENTREGA',
      local: 'Expedição → "Romaneios" ou "Roteirização"',
      pagina: 'Expedicao',
      acoes: [
        'Agrupe entregas em um "Romaneio"',
        'Defina motorista e veículo',
        'Use "Roteirização Inteligente" (mapa)',
        'Imprima o romaneio',
        'Atualize status: "Saiu para Entrega" → "Em Trânsito" → "Entregue"'
      ],
      icon: Truck,
      cor: 'indigo',
      statusResultante: 'Entregue'
    },
    {
      numero: 6,
      titulo: '💰 FINANCEIRO (COBRANÇA)',
      local: 'Financeiro → "Contas a Receber"',
      pagina: 'Financeiro',
      acoes: [
        'As parcelas já foram criadas automaticamente (Etapa 2)',
        'Vá para "Financeiro"',
        'Aba "Contas a Receber"',
        'Veja as parcelas geradas',
        'Gere boletos/PIX se necessário',
        'Baixe conforme receber'
      ],
      icon: DollarSign,
      cor: 'green',
      statusResultante: 'Contas geradas e visiveis'
    }
  ];

  const containerClass = windowMode 
    ? 'w-full h-full flex flex-col overflow-hidden' 
    : '';

  const contentClass = windowMode 
    ? 'flex-1 overflow-y-auto p-6' 
    : '';

  const Wrapper = ({ children }) => windowMode ? (
    <div className={containerClass}>
      <div className={contentClass}>{children}</div>
    </div>
  ) : (
    <>{children}</>
  );

  return (
    <Wrapper>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-4 border-blue-500 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl">
              <LayoutDashboard className="w-10 h-10 text-blue-600" />
              Guia Completo do Fluxo Operacional
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Passo a passo de como usar o sistema do início ao fim • V21.6
            </p>
          </CardHeader>
        </Card>

        {/* Alerta Importante */}
        <Alert className="border-green-400 bg-green-50">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900">
              ✅ Base de dados limpa para testes!
            </p>
            <p className="text-sm text-green-700 mt-1">
              Todos os dados transacionais foram excluídos. Cadastros Gerais mantidos.
              Agora você pode fazer o teste completo do início ao fim.
            </p>
          </AlertDescription>
        </Alert>

        {/* Etapas */}
        {etapas.map((etapa, index) => {
          const Icon = etapa.icon;
          const isDestaque = etapa.destaque;
          
          const corBorder = {
            blue: 'border-blue-400',
            green: 'border-green-400',
            purple: 'border-purple-400',
            orange: 'border-orange-400',
            indigo: 'border-indigo-400'
          };

          const corBg = {
            blue: 'bg-blue-50',
            green: 'bg-green-50',
            purple: 'bg-purple-50',
            orange: 'bg-orange-50',
            indigo: 'bg-indigo-50'
          };

          const corTexto = {
            blue: 'text-blue-600',
            green: 'text-green-600',
            purple: 'text-purple-600',
            orange: 'text-orange-600',
            indigo: 'text-indigo-600'
          };

          const corBadge = {
            blue: 'bg-blue-600',
            green: 'bg-green-600',
            purple: 'bg-purple-600',
            orange: 'bg-orange-600',
            indigo: 'bg-indigo-600'
          };

          return (
            <Card 
              key={index} 
              className={`${corBorder[etapa.cor]} ${isDestaque ? 'border-4 shadow-2xl' : 'border-2'} ${corBg[etapa.cor]}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 ${corBadge[etapa.cor]} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${corBadge[etapa.cor]} text-white px-3 py-1 text-lg`}>
                          Etapa {etapa.numero}
                        </Badge>
                        {isDestaque && (
                          <Badge className="bg-yellow-500 text-white px-3 py-1 animate-pulse">
                            ⚡ AUTOMÁTICO
                          </Badge>
                        )}
                      </div>
                      <CardTitle className={`text-2xl ${corTexto[etapa.cor]}`}>
                        {etapa.titulo}
                      </CardTitle>
                      <div className="mt-3 flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${corTexto[etapa.cor]}`} />
                        <p className={`text-sm font-semibold ${corTexto[etapa.cor]}`}>
                          {etapa.local}
                        </p>
                      </div>
                      {etapa.pagina && (
                        <Link 
                          to={createPageUrl(etapa.pagina)}
                          className={`inline-flex items-center gap-1 mt-2 text-xs ${corTexto[etapa.cor]} hover:underline font-semibold`}
                        >
                          <ArrowRight className="w-3 h-3" />
                          Ir para {etapa.pagina === 'Expedicao' ? 'Expedição' : etapa.pagina}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 mb-2 font-semibold uppercase">O que fazer:</p>
                    <div className="space-y-2">
                      {etapa.acoes.map((acao, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${corTexto[etapa.cor]} mt-0.5 flex-shrink-0`} />
                          <p className="text-sm text-slate-700">{acao}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/70 rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1">Status Resultante:</p>
                    <p className={`font-bold ${corTexto[etapa.cor]}`}>
                      {etapa.statusResultante}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Resumo Visual */}
        <Card className="border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardHeader>
            <CardTitle className="text-lg">📊 Resumo do Fluxo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <Badge className="bg-blue-600 text-white px-3 py-2">
                1. Comercial
              </Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge className="bg-green-600 text-white px-3 py-2">
                2. 🚀 Automação
              </Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge className="bg-purple-600 text-white px-3 py-2">
                3. Fiscal (NF-e)
              </Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge className="bg-orange-600 text-white px-3 py-2">
                4. Expedição
              </Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge className="bg-indigo-600 text-white px-3 py-2">
                5. Rota/Entrega
              </Badge>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Badge className="bg-green-600 text-white px-3 py-2">
                6. Financeiro
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-400">
                <p className="font-bold text-yellow-900 mb-2">⚡ AUTOMAÇÃO MÁGICA</p>
                <p className="text-sm text-yellow-800">
                  A <strong>Etapa 2</strong> faz TUDO automaticamente:
                  baixa estoque, gera financeiro, cria entrega. 
                  <strong>Você só clica 1 botão!</strong>
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-400">
                <p className="font-bold text-blue-900 mb-2">📦 ONDE VER EXPEDIÇÃO?</p>
                <p className="text-sm text-blue-800">
                  Menu lateral → <strong>"Expedição e Logística"</strong>
                  <br />
                  Lá você verá todas as entregas criadas.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-400">
                <p className="font-bold text-purple-900 mb-2">🗺️ ONDE FAZER ROTA?</p>
                <p className="text-sm text-purple-800">
                  Menu lateral → <strong>"Expedição"</strong> → Aba "Romaneios"
                  <br />
                  Agrupe entregas e use roteirização.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dicas Extras */}
        <Card className="border-2 border-green-400 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              💡 Dicas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <p className="text-slate-700">
                <strong>Cadastre produtos com estoque</strong> antes de criar pedidos (Cadastros → Produtos)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <p className="text-slate-700">
                <strong>Cadastre clientes</strong> antes de fazer vendas (Cadastros → Clientes)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <p className="text-slate-700">
                O botão <strong>"🚀 Fechar Pedido"</strong> só aparece se o pedido estiver em "Rascunho"
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <p className="text-slate-700">
                A <strong>janela fecha automaticamente</strong> após 2,5s quando a automação termina
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <p className="text-slate-700">
                Você pode acompanhar <strong>métricas de automação</strong> em: Dashboard Corporativo ou Menu → "🚀 Fechamento Automático"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Links Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔗 Links Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Link to={createPageUrl('Cadastros')}>
                <button className="w-full p-3 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors text-left">
                  <p className="font-semibold text-sm text-slate-900">📋 Cadastros</p>
                  <p className="text-xs text-slate-600">Clientes, Produtos, etc</p>
                </button>
              </Link>
              
              <Link to={createPageUrl('Comercial')}>
                <button className="w-full p-3 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-300 transition-colors text-left">
                  <p className="font-semibold text-sm text-blue-900">🛒 Comercial</p>
                  <p className="text-xs text-blue-700">Criar Pedidos</p>
                </button>
              </Link>
              
              <Link to={createPageUrl('Fiscal')}>
                <button className="w-full p-3 bg-purple-100 hover:bg-purple-200 rounded-lg border border-purple-300 transition-colors text-left">
                  <p className="font-semibold text-sm text-purple-900">📄 Fiscal</p>
                  <p className="text-xs text-purple-700">Emitir NF-e</p>
                </button>
              </Link>
              
              <Link to={createPageUrl('Expedicao')}>
                <button className="w-full p-3 bg-orange-100 hover:bg-orange-200 rounded-lg border border-orange-300 transition-colors text-left">
                  <p className="font-semibold text-sm text-orange-900">🚚 Expedição</p>
                  <p className="text-xs text-orange-700">Ver Entregas e Rotas</p>
                </button>
              </Link>
              
              <Link to={createPageUrl('Financeiro')}>
                <button className="w-full p-3 bg-green-100 hover:bg-green-200 rounded-lg border border-green-300 transition-colors text-left">
                  <p className="font-semibold text-sm text-green-900">💰 Financeiro</p>
                  <p className="text-xs text-green-700">Ver Contas a Receber</p>
                </button>
              </Link>
              
              <Link to={createPageUrl('DashboardFechamentoPedidos')}>
                <button className="w-full p-3 bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 rounded-lg border-2 border-green-400 transition-colors text-left">
                  <p className="font-semibold text-sm text-green-900">🚀 Automação</p>
                  <p className="text-xs text-green-700">Dashboard Métricas</p>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Exemplo Prático */}
        <Card className="border-2 border-yellow-400 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              💡 Exemplo Prático Completo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="bg-white/80 p-3 rounded-lg border border-yellow-300">
              <p className="font-bold text-yellow-900 mb-2">Cenário: Venda de 100kg de Ferro CA-50 10mm</p>
              <div className="space-y-2 text-slate-700">
                <p><strong>1.</strong> Cadastre o produto "Ferro CA-50 10mm" com estoque de 500kg (Cadastros → Produtos)</p>
                <p><strong>2.</strong> Cadastre o cliente "João da Silva" (Cadastros → Clientes)</p>
                <p><strong>3.</strong> Vá em Comercial → Pedidos → "Novo Pedido"</p>
                <p><strong>4.</strong> Preencha: Cliente = João, Item = Ferro 10mm, Qtd = 100kg, Preço = R$ 10/kg</p>
                <p><strong>5.</strong> Salve. Status = "Rascunho"</p>
                <p><strong>6.</strong> Clique em "🚀 Fechar Pedido" na tabela</p>
                <p><strong>7.</strong> Sistema automático faz TUDO em 10s:</p>
                <p className="ml-4 text-green-700">✅ Estoque: 500kg → 400kg</p>
                <p className="ml-4 text-green-700">✅ Financeiro: Cria conta de R$ 1.000</p>
                <p className="ml-4 text-green-700">✅ Expedição: Cria entrega</p>
                <p className="ml-4 text-green-700">✅ Status: "Pronto para Faturar"</p>
                <p><strong>8.</strong> Vá em Fiscal → Emita NF-e</p>
                <p><strong>9.</strong> Vá em Expedição → Veja a entrega criada</p>
                <p><strong>10.</strong> Crie romaneio, roteirize e entregue!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
}