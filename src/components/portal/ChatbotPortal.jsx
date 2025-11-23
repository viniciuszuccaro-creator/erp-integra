import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * V21.5 - Chatbot IA COMPLETO
 * ✅ IA contextual com dados do cliente
 * ✅ Respostas em tempo real
 * ✅ Interface moderna com bubbles
 * ✅ Auto-scroll e minimização
 * ✅ Conhecimento completo do sistema
 */
export default function ChatbotPortal({ onClose, isMinimized, onToggleMinimize }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente virtual inteligente. Posso ajudá-lo com pedidos, rastreamento, boletos, orçamentos e muito mais. Como posso ajudar?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const user = await base44.auth.me();
      
      // Contexto do cliente
      // Buscar informações do cliente para contexto
      const [pedidos, boletos] = await Promise.all([
        base44.entities.Pedido.filter({ cliente_email: user.email }, '-data_pedido', 5),
        base44.entities.ContaReceber.filter({ cliente: user.full_name }, '-data_vencimento', 5),
      ]);

      const pedidosContext = pedidos.length > 0 
        ? `Últimos pedidos: ${pedidos.map(p => `${p.numero_pedido} (${p.status})`).join(', ')}`
        : 'Nenhum pedido recente';

      const boletosContext = boletos.length > 0
        ? `Boletos: ${boletos.filter(b => b.status === 'Pendente').length} pendente(s)`
        : 'Nenhum boleto pendente';

      const context = `Você é um assistente virtual de atendimento ao cliente da empresa ERP Zuccaro. 
Cliente: ${user.full_name} (${user.email})
Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

CONTEXTO DO CLIENTE:
${pedidosContext}
${boletosContext}

INSTRUÇÕES:
- Responda de forma educada, profissional, objetiva e em português brasileiro
- Use emojis quando apropriado para tornar a conversa mais amigável
- Se o cliente perguntar sobre PEDIDOS: informe que pode consultar na aba "Meus Pedidos" e dê um resumo se houver pedidos recentes
- Se perguntar sobre RASTREAMENTO: informe que pode acompanhar em tempo real na aba "Rastreamento" com GPS e QR Code
- Se perguntar sobre DOCUMENTOS/NOTAS FISCAIS: informe que pode consultar e fazer download na aba "Docs & Boletos"
- Se perguntar sobre BOLETOS/PIX: informe que pode visualizar, copiar PIX e fazer download na aba "Docs & Boletos"
- Se perguntar sobre SOLICITAR ORÇAMENTO: informe que pode fazer isso na aba "Solicitar Orçamento" com upload de arquivos
- Se perguntar sobre OPORTUNIDADES: informe que pode acompanhar o funil de vendas na aba "Oportunidades"
- Se perguntar sobre SUPORTE: informe que pode abrir chamados na aba "Suporte"
- Se perguntar sobre CHAT COM VENDEDOR: informe que há um chat dedicado na aba "Chat Vendedor"
- Para dúvidas técnicas ou que você não sabe responder: sugira contato com a equipe comercial
- Seja sempre prestativo e proativo

IMPORTANTE: Responda de forma conversacional e natural, como um atendente humano faria.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}\n\n${message}`,
      });

      return result;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data,
          timestamp: new Date(),
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, estou com dificuldades para responder. Por favor, entre em contato com nossa equipe.',
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageMutation.mutate(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-4 right-4 w-full max-w-md h-[600px] z-50 shadow-2xl mx-4"
    >
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Assistente Virtual</CardTitle>
                <p className="text-xs text-blue-100">Online • Responde em segundos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-blue-700"
                onClick={onToggleMinimize}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-blue-700"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          <AnimatePresence>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-blue-600'
                      : 'bg-gradient-to-br from-purple-500 to-purple-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sendMessageMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t bg-white rounded-b-lg">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Powered by IA • Respostas em tempo real
          </p>
        </div>
      </Card>
    </motion.div>
  );
}