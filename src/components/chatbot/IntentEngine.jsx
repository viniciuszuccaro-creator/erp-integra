import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * INTENT ENGINE V21.1 - CÉREBRO DO CHATBOT
 * Processa intents e executa ações automáticas
 */
export default function IntentEngine({ clienteId, isPublic = false }) {
  const [mensagens, setMensagens] = useState([]);
  const [inputMensagem, setInputMensagem] = useState('');
  const [processando, setProcessando] = useState(false);

  const { data: intents = [] } = useQuery({
    queryKey: ['chatbot-intents'],
    queryFn: async () => {
      // Simula carregamento de intents (preparado para quando criar a entidade)
      return [
        { nome_intent: 'status_pedido', keywords: ['pedido', 'status', 'onde está'], tipo: 'autenticada' },
        { nome_intent: '2_via_boleto', keywords: ['boleto', '2 via', 'segunda via'], tipo: 'autenticada' },
        { nome_intent: 'rastreamento', keywords: ['rastrear', 'entrega', 'localização'], tipo: 'autenticada' },
        { nome_intent: 'fazer_orcamento', keywords: ['orçamento', 'cotação', 'preço'], tipo: 'publica' }
      ];
    }
  });

  const detectarIntent = (texto) => {
    const textoLower = texto.toLowerCase();
    
    for (const intent of intents) {
      const match = intent.keywords?.some(kw => textoLower.includes(kw.toLowerCase()));
      if (match) {
        return intent;
      }
    }
    
    return null;
  };

  const executarIntent = async (intent, mensagemOriginal) => {
    setProcessando(true);

    try {
      // Simula processamento de intents
      if (intent.nome_intent === 'status_pedido' && clienteId) {
        const pedidos = await base44.entities.Pedido.filter({ cliente_id: clienteId }, '-data_pedido', 1);
        if (pedidos.length > 0) {
          const p = pedidos[0];
          return `📦 Seu último pedido #${p.numero_pedido} está com status: **${p.status}**. Valor: R$ ${p.valor_total?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
        }
        return 'Não encontrei pedidos recentes em seu nome.';
      }

      if (intent.nome_intent === '2_via_boleto' && clienteId) {
        const contas = await base44.entities.ContaReceber.filter({ 
          cliente_id: clienteId, 
          status: 'Pendente' 
        }, '-data_vencimento', 1);
        
        if (contas.length > 0 && contas[0].boleto_url) {
          return `💰 Aqui está a 2ª via do boleto: ${contas[0].boleto_url}`;
        }
        return 'Não encontrei boletos pendentes.';
      }

      if (intent.nome_intent === 'fazer_orcamento') {
        return '📝 Para fazer um orçamento, envie seu projeto (PDF/DWG) ou descreva o que precisa. Nossa IA irá analisar!';
      }

      return '🤖 Intent reconhecida, mas processamento completo disponível na próxima versão.';
    } catch (error) {
      return '❌ Erro ao processar sua solicitação.';
    } finally {
      setProcessando(false);
    }
  };

  const handleEnviarMensagem = async () => {
    if (!inputMensagem.trim()) return;

    const novaMensagem = {
      id: Date.now(),
      tipo: 'usuario',
      conteudo: inputMensagem,
      timestamp: new Date()
    };

    setMensagens([...mensagens, novaMensagem]);
    const textoEnviado = inputMensagem;
    setInputMensagem('');

    // Detecta intent
    const intent = detectarIntent(textoEnviado);
    
    if (intent) {
      const resposta = await executarIntent(intent, textoEnviado);
      
      setMensagens(prev => [...prev, {
        id: Date.now() + 1,
        tipo: 'bot',
        conteudo: resposta,
        timestamp: new Date(),
        intent: intent.nome_intent
      }]);
    } else {
      // Resposta genérica
      setMensagens(prev => [...prev, {
        id: Date.now() + 1,
        tipo: 'bot',
        conteudo: '🤖 Olá! Posso ajudar com: consultar pedidos, boletos, rastreamento ou orçamentos. Como posso ajudar?',
        timestamp: new Date()
      }]);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-bold">Chat Inteligente</h3>
          <Badge className="ml-auto bg-white text-blue-600">
            {intents.length} intents ativas
          </Badge>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensagens.map(msg => (
          <div key={msg.id} className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${
              msg.tipo === 'usuario' 
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                : 'bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm'
            } px-4 py-2`}>
              {msg.tipo === 'bot' && msg.intent && (
                <Badge className="mb-2 text-xs bg-purple-100 text-purple-700">
                  Intent: {msg.intent}
                </Badge>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {processando && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMensagem}
            onChange={(e) => setInputMensagem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
            placeholder="Digite sua mensagem..."
          />
          <Button onClick={handleEnviarMensagem} disabled={processando}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
}