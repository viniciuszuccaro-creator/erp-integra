import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, User, Clock, Send } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 4: Painel de Conversas do Chatbot
 * Para atendentes humanos monitorarem e intervirem
 */

export default function PainelConversas() {
  const { empresaAtual, filterInContext } = useContextoVisual();
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const { data: interacoes = [] } = useQuery({
    queryKey: ['chatbot', 'interacoes', empresaAtual?.id],
    queryFn: () => filterInContext('ChatbotInteracao', {}, '-data_hora', 100),
    enabled: !!empresaAtual,
    refetchInterval: 5000
  });

  // Agrupar por cliente
  const conversas = {};
  interacoes.forEach(i => {
    if (!conversas[i.cliente_id]) {
      conversas[i.cliente_id] = {
        cliente_id: i.cliente_id,
        cliente_nome: i.cliente_nome || 'Cliente',
        mensagens: [],
        ultima_mensagem: null
      };
    }
    conversas[i.cliente_id].mensagens.push(i);
    if (!conversas[i.cliente_id].ultima_mensagem || 
        new Date(i.data_hora) > new Date(conversas[i.cliente_id].ultima_mensagem.data_hora)) {
      conversas[i.cliente_id].ultima_mensagem = i;
    }
  });

  const listaConversas = Object.values(conversas).sort((a, b) => 
    new Date(b.ultima_mensagem.data_hora) - new Date(a.ultima_mensagem.data_hora)
  );

  const handleEnviar = async () => {
    if (!mensagem.trim() || !conversaSelecionada) return;

    await base44.entities.ChatbotInteracao.create({
      cliente_id: conversaSelecionada.cliente_id,
      empresa_id: empresaAtual?.id,
      mensagem_bot: mensagem,
      canal: 'Web',
      atendente_humano: true,
      data_hora: new Date().toISOString()
    });

    setMensagem('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {/* Lista de conversas */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversas Ativas ({listaConversas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y max-h-[600px] overflow-auto">
            {listaConversas.map(conv => (
              <button
                key={conv.cliente_id}
                onClick={() => setConversaSelecionada(conv)}
                className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                  conversaSelecionada?.cliente_id === conv.cliente_id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">{conv.cliente_nome}</p>
                  <Badge variant="outline" className="text-xs">
                    {conv.mensagens.length}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {conv.ultima_mensagem.mensagem_usuario || conv.ultima_mensagem.mensagem_bot}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(conv.ultima_mensagem.data_hora).toLocaleString('pt-BR')}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Área de conversa */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {conversaSelecionada ? (
              <>
                <User className="w-5 h-5 inline mr-2" />
                {conversaSelecionada.cliente_nome}
              </>
            ) : 'Selecione uma conversa'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversaSelecionada ? (
            <>
              <div className="space-y-3 mb-4 max-h-[400px] overflow-auto">
                {conversaSelecionada.mensagens
                  .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
                  .map((msg, idx) => (
                    <div key={idx}>
                      {msg.mensagem_usuario && (
                        <div className="flex justify-end mb-2">
                          <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                            <p className="text-sm">{msg.mensagem_usuario}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {new Date(msg.data_hora).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}
                      {msg.mensagem_bot && (
                        <div className="flex justify-start mb-2">
                          <div className="bg-slate-100 rounded-lg px-4 py-2 max-w-[80%]">
                            <p className="text-sm">{msg.mensagem_bot}</p>
                            {msg.intencao_detectada && (
                              <Badge className="mt-2 text-xs">
                                {msg.intencao_detectada}
                              </Badge>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(msg.data_hora).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleEnviar()}
                />
                <Button onClick={handleEnviar}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4" />
              <p>Selecione uma conversa para visualizar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}