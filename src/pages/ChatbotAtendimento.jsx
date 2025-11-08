import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, Clock, Send, Bot, AlertCircle, CheckCircle2 } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * Chatbot Atendimento - V21.1 Fase 1
 * Interface de transbordo humano do chatbot
 */
export default function ChatbotAtendimento() {
  const { user } = useUser();
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const queryClient = useQueryClient();

  // Simulando conversas de chatbot pendentes
  const { data: oportunidades = [] } = useQuery({
    queryKey: ['oportunidades-chatbot'],
    queryFn: async () => {
      const ops = await base44.entities.Oportunidade.list();
      return ops.filter(o => o.origem === 'Chatbot' && o.etapa === 'Prospecção');
    },
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const assumirAtendimento = useMutation({
    mutationFn: async (oportunidadeId) => {
      return base44.entities.Oportunidade.update(oportunidadeId, {
        responsavel: user?.full_name,
        responsavel_id: user?.id,
        etapa: 'Contato Inicial',
        data_ultima_interacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['oportunidades-chatbot']);
      toast.success('Atendimento assumido!');
    },
  });

  const enviarMensagem = useMutation({
    mutationFn: async () => {
      await base44.entities.Interacao.create({
        tipo: 'WhatsApp',
        titulo: 'Resposta do atendente',
        descricao: mensagem,
        data_interacao: new Date().toISOString(),
        cliente_id: conversaSelecionada.cliente_id,
        cliente_nome: conversaSelecionada.cliente_nome,
        oportunidade_id: conversaSelecionada.id,
        responsavel: user?.full_name,
        responsavel_id: user?.id,
        resultado: 'Positivo'
      });

      await base44.entities.Oportunidade.update(conversaSelecionada.id, {
        data_ultima_interacao: new Date().toISOString(),
        dias_sem_contato: 0
      });
    },
    onSuccess: () => {
      setMensagem('');
      toast.success('Mensagem enviada!');
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Chatbot - Atendimento Humano</h1>
        <p className="text-slate-600">Transbordo de conversas com alto nível de frustração ou solicitação de humano</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Aguardando Atendente</CardTitle>
            <Clock className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{oportunidades.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{clientes.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Bot IA Ativo</CardTitle>
            <Bot className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">✓</div>
            <p className="text-xs text-slate-500 mt-1">Engine PLN v2.0</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Fila de Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {oportunidades.map(op => (
              <div
                key={op.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  conversaSelecionada?.id === op.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
                onClick={() => setConversaSelecionada(op)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm text-slate-900">{op.cliente_nome}</h4>
                  {op.temperatura && (
                    <Badge className={
                      op.temperatura === 'Quente' ? 'bg-red-100 text-red-700' :
                      op.temperatura === 'Morno' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {op.temperatura}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-2 line-clamp-2">{op.titulo}</p>
                {op.score && (
                  <Badge variant="outline" className="text-xs">Score: {op.score}</Badge>
                )}
              </div>
            ))}

            {oportunidades.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nenhuma conversa aguardando</p>
                <p className="text-xs mt-2">O bot está atendendo automaticamente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {conversaSelecionada ? `Conversa com ${conversaSelecionada.cliente_nome}` : 'Selecione uma conversa'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversaSelecionada ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Contexto da Conversa</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{conversaSelecionada.descricao}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Origem:</span>
                      <p className="font-semibold">{conversaSelecionada.origem}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Valor Estimado:</span>
                      <p className="font-semibold">
                        R$ {(conversaSelecionada.valor_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Produtos de Interesse:</span>
                      <p className="font-semibold">{conversaSelecionada.produtos_interesse?.join(', ') || 'Não especificado'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Data de Abertura:</span>
                      <p className="font-semibold">
                        {conversaSelecionada.data_abertura ? new Date(conversaSelecionada.data_abertura).toLocaleDateString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto p-4 bg-slate-50 rounded-lg">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-sm text-slate-700">
                        Olá! Sou o assistente virtual. Como posso ajudar?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="flex-1 bg-blue-600 text-white p-3 rounded-lg shadow-sm max-w-[80%]">
                      <p className="text-sm">{conversaSelecionada.necessidades || 'Preciso de um orçamento'}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {conversaSelecionada.cliente_nome?.[0] || 'C'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && mensagem) {
                          enviarMensagem.mutate();
                        }
                      }}
                    />
                    <Button 
                      onClick={() => enviarMensagem.mutate()}
                      disabled={!mensagem || enviarMensagem.isPending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => assumirAtendimento.mutate(conversaSelecionada.id)}
                    disabled={assumirAtendimento.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {assumirAtendimento.isPending ? 'Assumindo...' : 'Assumir Atendimento'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Selecione uma conversa na fila</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}