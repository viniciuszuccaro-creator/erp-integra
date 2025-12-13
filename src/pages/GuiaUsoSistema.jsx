import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle2,
  ShoppingCart,
  FileText,
  Truck,
  DollarSign,
  Users,
  Package,
  ArrowRight,
  Play,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GuiaFluxoCompletoV21_6 from '@/components/sistema/GuiaFluxoCompletoV21_6';

/**
 * Guia de Uso Completo do Sistema
 * V21.7: Tutorial passo a passo
 */
export default function GuiaUsoSistema() {
  const navigate = useNavigate();
  const [etapaExpandida, setEtapaExpandida] = useState(null);

  const etapas = [
    {
      numero: 1,
      titulo: 'Criar Cliente',
      descricao: 'Cadastre o cliente no sistema',
      modulo: 'Cadastros',
      icon: Users,
      cor: 'blue',
      passos: [
        'Acesse Cadastros Gerais > Clientes',
        'Clique em "Novo Cliente"',
        'Preencha nome, CPF/CNPJ, contatos',
        'Adicione endereços de entrega',
        'Salve o cadastro'
      ],
      link: createPageUrl('Cadastros')
    },
    {
      numero: 2,
      titulo: 'Criar Produtos',
      descricao: 'Cadastre produtos no catálogo',
      modulo: 'Estoque',
      icon: Package,
      cor: 'indigo',
      passos: [
        'Acesse Estoque > Produtos',
        'Clique em "Novo Produto"',
        'Preencha descrição, código, unidades',
        'Configure preços e estoque',
        'Defina grupo/marca/setor',
        'Salve o produto'
      ],
      link: createPageUrl('Estoque')
    },
    {
      numero: 3,
      titulo: 'Criar Pedido',
      descricao: 'Registre um pedido de venda',
      modulo: 'Comercial',
      icon: ShoppingCart,
      cor: 'purple',
      passos: [
        'Acesse Comercial > Pedidos',
        'Clique em "Novo Pedido"',
        'Selecione o cliente',
        'Adicione itens (revenda ou produção)',
        'Configure forma de pagamento',
        'Revise e salve o pedido'
      ],
      link: createPageUrl('Comercial')
    },
    {
      numero: 4,
      titulo: 'Emitir NF-e',
      descricao: 'Emita nota fiscal eletrônica',
      modulo: 'Fiscal',
      icon: FileText,
      cor: 'green',
      passos: [
        'Acesse Comercial > NF-e',
        'Selecione pedido aprovado',
        'Clique em "Gerar NF-e"',
        'Revise dados fiscais',
        'Envie para SEFAZ',
        'Aguarde autorização'
      ],
      link: createPageUrl('Fiscal')
    },
    {
      numero: 5,
      titulo: 'Criar Entrega',
      descricao: 'Agende a entrega do pedido',
      modulo: 'Expedição',
      icon: Truck,
      cor: 'orange',
      passos: [
        'Acesse Expedição > Entregas',
        'Clique em "Nova Entrega"',
        'Vincule ao pedido/NF-e',
        'Selecione transportadora',
        'Defina data e endereço',
        'Gere romaneio/etiqueta'
      ],
      link: createPageUrl('Expedicao')
    },
    {
      numero: 6,
      titulo: 'Gerenciar Financeiro',
      descricao: 'Controle contas a receber/pagar',
      modulo: 'Financeiro',
      icon: DollarSign,
      cor: 'emerald',
      passos: [
        'Acesse Financeiro',
        'Verifique contas pendentes',
        'Gere boletos/PIX',
        'Registre pagamentos',
        'Faça conciliação bancária',
        'Acompanhe fluxo de caixa'
      ],
      link: createPageUrl('Financeiro')
    }
  ];

  const cores = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', gradient: 'from-blue-500 to-blue-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', gradient: 'from-indigo-500 to-indigo-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', gradient: 'from-purple-500 to-purple-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', gradient: 'from-green-500 to-green-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', gradient: 'from-orange-500 to-orange-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', gradient: 'from-emerald-500 to-emerald-600' }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Guia Completo do Sistema</h1>
                  <p className="text-blue-100">
                    Aprenda o fluxo completo: Venda → NF-e → Expedição → Entrega → Financeiro
                  </p>
                </div>
              </div>
              <Badge className="bg-white text-blue-600 px-4 py-2 text-lg">
                V21.7
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Fluxo Visual */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Fluxo Completo do Processo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {etapas.map((etapa, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex-1 min-w-32 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${cores[etapa.cor].gradient} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                      <etapa.icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{etapa.titulo}</p>
                  </div>
                  {idx < etapas.length - 1 && (
                    <ChevronRight className="w-6 h-6 text-slate-400 hidden lg:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Etapas Detalhadas */}
        <div className="space-y-4">
          {etapas.map((etapa) => {
            const cor = cores[etapa.cor];
            const expandida = etapaExpandida === etapa.numero;

            return (
              <Card 
                key={etapa.numero} 
                className={`border-2 ${cor.border} hover:shadow-lg transition-all cursor-pointer`}
                onClick={() => setEtapaExpandida(expandida ? null : etapa.numero)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${cor.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                        <etapa.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Badge className={`${cor.bg} ${cor.text}`}>
                            Etapa {etapa.numero}
                          </Badge>
                          <h3 className="text-lg font-bold text-slate-900">
                            {etapa.titulo}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600">{etapa.descricao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(etapa.link);
                        }}
                        className={`bg-gradient-to-r ${cor.gradient}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Ir para Módulo
                      </Button>
                      <ChevronRight className={`w-6 h-6 ${cor.text} transition-transform ${expandida ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Passos Detalhados */}
                  {expandida && (
                    <div className={`mt-6 p-6 ${cor.bg} rounded-lg border-2 ${cor.border}`}>
                      <h4 className="font-bold text-slate-900 mb-4">Passos Detalhados:</h4>
                      <div className="space-y-3">
                        {etapa.passos.map((passo, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-6 h-6 bg-gradient-to-br ${cor.gradient} rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}>
                              {idx + 1}
                            </div>
                            <p className="text-sm text-slate-700 flex-1 pt-0.5">{passo}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guia Técnico Detalhado */}
        <Card className="border-2 border-purple-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Documentação Técnica Completa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <GuiaFluxoCompletoV21_6 />
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Sistema Pronto!</h2>
            <p className="text-lg opacity-95 mb-6">
              Agora você está pronto para usar todo o potencial do ERP Zuccaro
            </p>
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-green-50"
              onClick={() => navigate(createPageUrl('Dashboard'))}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Começar a Usar o Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}