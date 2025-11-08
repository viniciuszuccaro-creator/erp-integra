
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

import IntentEngine from './IntentEngine';

/**
 * Widget de Chatbot Omnicanal
 * IA transacional integrada com o ERP
 */
export default function ChatbotWidget({ clienteId, canal = 'Portal' }) {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [sessaoId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [processando, setProcessando] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (aberto && mensagens.length === 0) {
      setMensagens([{
        autor: 'Bot IA',
        tipo: 'bot',
        mensagem: 'Olá! Sou o assistente virtual. Como posso ajudar?',
        data: new Date().toISOString(),
        sugestoes: ['Ver meus pedidos', 'Consultar entrega', '2ª via de boleto', 'Solicitar orçamento']
      }]);
    }
  }, [aberto]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const enviarMensagemMutation = useMutation({
    mutationFn: async (mensagem) => {
      // 1. Salvar mensagem do usuário
      const novaMensagem = {
        autor: 'Cliente',
        tipo: 'usuario',
        mensagem,
        data: new Date().toISOString()
      };
      setMensagens(prev => [...prev, novaMensagem]);

      // 2. Processar com Intent Engine MELHORADO
      const resultado = await IntentEngine.detectarIntent(mensagem, clienteId, {
        canal,
        sessaoId
      });

      // 3. Executar ação baseada no intent
      let acaoResultado = null;
      if (resultado.confianca >= 70) {
        acaoResultado = await IntentEngine.executarAcao(
          resultado.intent,
          resultado.entidades_detectadas,
          clienteId
        );
      }

      // 4. Registrar interação
      await base44.entities.ChatbotInteracao.create({
        sessao_id: sessaoId,
        canal,
        cliente_id: clienteId,
        mensagem_usuario: mensagem,
        intent_detectado: resultado.intent,
        confianca_intent: resultado.confianca,
        resposta_bot: acaoResultado?.mensagem || resultado.resposta_sugerida,
        acao_executada: acaoResultado?.tipo || 'resposta_padrao',
        sentimento_detectado: resultado.sentimento,
        transferido_atendente: resultado.necessita_atendente,
        data_hora: new Date().toISOString(),
        resolvido: !resultado.necessita_atendente
      });

      // 5. Retornar resultado combinado
      return {
        ...resultado,
        acao: acaoResultado
      };
    },
    onSuccess: (resultado) => {
      const mensagemFinal = resultado.acao?.mensagem || resultado.resposta_sugerida;
      
      const respostaBot = {
        autor: 'Bot IA',
        tipo: 'bot',
        mensagem: mensagemFinal,
        data: new Date().toISOString(),
        sugestoes: resultado.acoes_sugeridas,
        necessita_atendente: resultado.necessita_atendente,
        dados_acao: resultado.acao?.dados
      };
      setMensagens(prev => [...prev, respostaBot]);
      setProcessando(false);
    }
  });

  const handleEnviar = () => {
    if (!mensagemAtual.trim()) return;
    
    setProcessando(true);
    enviarMensagemMutation.mutate(mensagemAtual);
    setMensagemAtual('');
  };

  const handleSugestaoClick = (sugestao) => {
    setMensagemAtual(sugestao);
    setTimeout(() => handleEnviar(), 100);
  };

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <div>
            <p className="font-semibold">Assistente Virtual</p>
            <p className="text-xs opacity-90">Powered by IA</p>
          </div>
        </div>
        <button
          onClick={() => setAberto(false)}
          className="hover:bg-white/20 rounded p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {mensagens.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              msg.tipo === 'usuario' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border'
            } rounded-lg p-3 shadow-sm`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.tipo === 'bot' ? (
                  <Bot className="w-4 h-4 text-blue-600" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="text-xs font-semibold opacity-80">{msg.autor}</span>
              </div>
              <p className="text-sm">{msg.mensagem}</p>
              
              {msg.sugestoes && msg.sugestoes.length > 0 && (
                <div className="mt-3 space-y-1">
                  {msg.sugestoes.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSugestaoClick(sug)}
                      className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {msg.necessita_atendente && (
                <Badge className="mt-2 bg-orange-600">
                  Transferindo para atendente...
                </Badge>
              )}
            </div>
          </div>
        ))}
        
        {processando && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-slate-600">Processando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={mensagemAtual}
            onChange={(e) => setMensagemAtual(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEnviar()}
            placeholder="Digite sua mensagem..."
            disabled={processando}
          />
          <Button
            onClick={handleEnviar}
            disabled={processando || !mensagemAtual.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
