import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * V21.5 - FAQ e Ajuda do Portal
 * ✅ Perguntas frequentes
 * ✅ Busca inteligente
 * ✅ Accordion expansível
 * ✅ Contatos de suporte
 */
export default function FAQAjuda() {
  const [busca, setBusca] = useState('');
  const [expandido, setExpandido] = useState(null);

  const faqs = [
    {
      categoria: 'Pedidos',
      perguntas: [
        {
          pergunta: 'Como acompanhar meu pedido?',
          resposta: 'Acesse a aba "Meus Pedidos" para ver todos os seus pedidos com status em tempo real. Você pode clicar em "Ver Detalhes" para informações completas.',
        },
        {
          pergunta: 'Quanto tempo leva para meu pedido ser entregue?',
          resposta: 'O prazo de entrega é informado no momento da aprovação do pedido. Você pode acompanhar a previsão na aba "Rastreamento".',
        },
        {
          pergunta: 'Posso cancelar meu pedido?',
          resposta: 'Entre em contato com seu vendedor através do Chat ou telefone. Pedidos em produção podem ter restrições de cancelamento.',
        },
      ],
    },
    {
      categoria: 'Rastreamento',
      perguntas: [
        {
          pergunta: 'Como rastrear minha entrega?',
          resposta: 'Acesse a aba "Rastreamento" para ver suas entregas em tempo real com GPS. Você também pode usar o QR Code ou código de rastreamento.',
        },
        {
          pergunta: 'O que é o QR Code de rastreamento?',
          resposta: 'É um código único da sua entrega que pode ser usado para rastreamento rápido. Você pode compartilhá-lo com terceiros.',
        },
      ],
    },
    {
      categoria: 'Documentos e Pagamentos',
      perguntas: [
        {
          pergunta: 'Como baixar minha nota fiscal?',
          resposta: 'Na aba "Docs & Boletos", você encontra todas as NFes. Clique em "Download XML" ou "Ver DANFE" para obter os documentos.',
        },
        {
          pergunta: 'Como pagar meus boletos?',
          resposta: 'Na aba "Docs & Boletos" > "Boletos & PIX", você pode visualizar o boleto, copiar o código PIX ou acessar o link de pagamento online.',
        },
        {
          pergunta: 'Posso pagar com PIX?',
          resposta: 'Sim! Todos os boletos têm a opção de pagamento via PIX. Clique em "Copiar PIX" para obter o código copia-cola.',
        },
      ],
    },
    {
      categoria: 'Orçamentos',
      perguntas: [
        {
          pergunta: 'Como solicitar um orçamento?',
          resposta: 'Acesse "Solicitar Orçamento", preencha os dados do projeto e anexe arquivos (plantas, especificações). Nossa equipe responderá em até 24h.',
        },
        {
          pergunta: 'Posso enviar projetos em DWG?',
          resposta: 'Sim! Aceitamos PDF, DWG, DXF e imagens. Você pode enviar múltiplos arquivos na aba "Enviar Projeto".',
        },
        {
          pergunta: 'Como aprovar um orçamento?',
          resposta: 'Na aba "Aprovar Orçamentos", você pode assinar digitalmente e aprovar. Isso criará automaticamente um pedido.',
        },
      ],
    },
    {
      categoria: 'Suporte',
      perguntas: [
        {
          pergunta: 'Como abrir um chamado de suporte?',
          resposta: 'Na aba "Suporte", clique em "Novo Chamado", escolha a categoria e descreva o problema. Nossa equipe responderá rapidamente.',
        },
        {
          pergunta: 'Como falar com meu vendedor?',
          resposta: 'Use a aba "Chat Vendedor" para conversar em tempo real. Você também pode usar o "Assistente IA" para dúvidas rápidas.',
        },
        {
          pergunta: 'O que é o Assistente IA?',
          resposta: 'É um chatbot inteligente que conhece todo o sistema e seus dados. Ele pode responder perguntas sobre pedidos, boletos, rastreamento e mais.',
        },
      ],
    },
  ];

  const faqsFiltradas = faqs.map(categoria => ({
    ...categoria,
    perguntas: categoria.perguntas.filter(
      faq =>
        faq.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
        faq.resposta.toLowerCase().includes(busca.toLowerCase())
    ),
  })).filter(categoria => categoria.perguntas.length > 0);

  const toggleExpand = (categoriaIdx, perguntaIdx) => {
    const key = `${categoriaIdx}-${perguntaIdx}`;
    setExpandido(expandido === key ? null : key);
  };

  return (
    <div className="space-y-6 w-full h-full max-w-4xl mx-auto">
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg w-full">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Central de Ajuda</h2>
              <p className="text-slate-600">Encontre respostas rápidas para suas dúvidas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Busca */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar dúvidas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-12 h-14 text-lg"
        />
      </div>

      {/* FAQs por Categoria */}
      <div className="space-y-4 w-full">
        {faqsFiltradas.map((categoria, catIdx) => (
          <Card key={catIdx} className="shadow-lg w-full">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">{categoria.categoria}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 w-full">
              {categoria.perguntas.map((faq, faqIdx) => {
                const key = `${catIdx}-${faqIdx}`;
                const isExpanded = expandido === key;

                return (
                  <div key={faqIdx} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleExpand(catIdx, faqIdx)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="font-medium text-slate-900">{faq.pergunta}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-4 bg-blue-50 border-t">
                            <p className="text-slate-700">{faq.resposta}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contatos de Suporte */}
      <Card className="border-2 border-green-300 bg-green-50 shadow-lg w-full">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Ainda precisa de ajuda?</CardTitle>
        </CardHeader>
        <CardContent className="p-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50"
            >
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="font-semibold">Chat Vendedor</p>
                <p className="text-xs text-slate-600">Resposta em minutos</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:border-green-500 hover:bg-green-50"
            >
              <Phone className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold">WhatsApp</p>
                <p className="text-xs text-slate-600">(00) 0000-0000</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50"
            >
              <Mail className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-semibold">E-mail</p>
                <p className="text-xs text-slate-600">contato@empresa.com</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}