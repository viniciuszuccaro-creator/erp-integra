import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Bot, 
  Send, 
  AlertTriangle, 
  CheckCircle2,
  FileText,
  CreditCard,
  Package,
  Phone,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

/**
 * Chatbot ERP-Cêntrico V16.1
 * Intent Engine + IA de Sentimento + Autenticação
 */
export default function ChatbotAtendimento() {
  const [mensagem, setMensagem] = useState('');
  const [sessaoAtual, setSessaoAtual] = useState(null);
  const [clienteAutenticado, setClienteAutenticado] = useState(null);
  const queryClient = useQueryClient();

  const { data: interacoes = [] } = useQuery({
    queryKey: ['chatbot-interacoes'],
    queryFn: () => base44.entities.ChatbotInteracao.list('-data_hora', 50),
  });

  const enviarMensagemMutation = useMutation({
    mutationFn: async (msg) => {
      const intent = await detectarIntent(msg);
      
      if (intent.requer_autenticacao && !clienteAutenticado) {
        return await base44.entities.ChatbotInteracao.create({
          sessao_id: sessaoAtual || Date.now().toString(),
          canal: 'Portal',
          mensagem_usuario: msg,
          intent_detectado: intent.nome,
          requer_autenticacao: true,
          autenticacao_solicitada: true,
          resposta_bot: '🔐 Para consultar informações financeiras, informe seu CPF/CNPJ:',
          data_hora: new Date().toISOString()
        });
      }

      const sentimento = await analisarSentimento(msg);
      
      if (sentimento.frustrado) {
        await escalarParaAtendente(msg, sentimento);
      }

      const resposta = await processarIntent(intent, msg);

      return await base44.entities.ChatbotInteracao.create({
        sessao_id: sessaoAtual || Date.now().toString(),
        canal: 'Portal',
        cliente_id: clienteAutenticado?.id,
        cliente_nome: clienteAutenticado?.nome,
        autenticado: !!clienteAutenticado,
        mensagem_usuario: msg,
        intent_detectado: intent.nome,
        confianca_intent: intent.confianca,
        resposta_bot: resposta,
        sentimento_detectado: sentimento.tipo,
        palavras_chave_sentimento: sentimento.palavras,
        transferido_atendente: sentimento.frustrado,
        data_hora: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbot-interacoes'] });
      setMensagem('');
    },
  });

  const detectarIntent = async (msg) => {
    const msgLower = msg.toLowerCase();
    
    if (msgLower.includes('boleto') || msgLower.includes('2 via') || msgLower.includes('segunda via')) {
      return { nome: '2_via_boleto', confianca: 95, requer_autenticacao: true };
    }
    
    if (msgLower.includes('rastrear') || msgLower.includes('entrega') || msgLower.includes('onde está')) {
      return { nome: 'rastrear_entrega', confianca: 90, requer_autenticacao: true };
    }
    
    if (msgLower.includes('orçamento') || msgLower.includes('orcamento') || msgLower.includes('preço')) {
      return { nome: 'fazer_orcamento_ia', confianca: 85, requer_autenticacao: false };
    }
    
    if (msgLower.includes('vendedor') || msgLower.includes('atendente') || msgLower.includes('pessoa')) {
      return { nome: 'falar_atendente', confianca: 100, requer_autenticacao: false };
    }
    
    return { nome: 'desconhecido', confianca: 0, requer_autenticacao: false };
  };

  const analisarSentimento = async (msg) => {
    const palavrasFrustracao = ['absurdo', 'ridículo', 'atrasado', 'errado', 'horrível', 'cancelar', 'péssimo'];
    const msgLower = msg.toLowerCase();
    const palavrasDetectadas = palavrasFrustracao.filter(p => msgLower.includes(p));
    
    if (palavrasDetectadas.length > 0) {
      return { tipo: 'Frustrado', frustrado: true, palavras: palavrasDetectadas };
    }
    
    return { tipo: 'Neutro', frustrado: false, palavras: [] };
  };

  const escalarParaAtendente = async (msg, sentimento) => {
    await base44.entities.Notificacao.create({
      titulo: '🚨 Cliente Frustrado - Transbordo Urgente',
      mensagem: `Cliente demonstrou frustração: "${msg}".\n\nPalavras: ${sentimento.palavras.join(', ')}`,
      tipo: 'urgente',
      categoria: 'Comercial',
      prioridade: 'Urgente',
      dados_adicionais: { tag: '#FALHA_ATENDIMENTO' }
    });
    toast.error('Cliente frustrado - Transferindo para atendente');
  };

  const processarIntent = async (intent, msg) => {
    switch (intent.nome) {
      case '2_via_boleto':
        if (clienteAutenticado) {
          const titulos = await base44.entities.ContaReceber.filter({
            cliente_id: clienteAutenticado.id,
            status: 'Pendente'
          });
          
          if (titulos.length > 0) {
            return `📄 ${titulos.length} título(s) em aberto:\n\n${titulos.map(t => 
              `R$ ${t.valor.toFixed(2)} - Venc: ${new Date(t.data_vencimento).toLocaleDateString('pt-BR')}`
            ).join('\n')}`;
          }
          return '✅ Sem títulos em aberto!';
        }
        break;
      
      case 'fazer_orcamento_ia':
        return '📋 Para orçamento:\n1. Envie projeto (PDF/DWG)\n2. Ou descreva o que precisa';
      
      default:
        return '🤔 Posso ajudar com:\n• 2ª via boleto\n• Rastrear entrega\n• Fazer orçamento\n• Falar com vendedor';
    }
  };

  const handleEnviar = () => {
    if (!mensagem.trim()) return;
    enviarMensagemMutation.mutate(mensagem);
  };

  const ultimasInteracoes = interacoes.slice(0, 10);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">🤖 Chatbot ERP-Cêntrico</h1>
            <p className="text-slate-600">Intent Engine + IA de Sentimento</p>
          </div>
          <Badge className="bg-indigo-600 text-white px-4 py-2">
            <Bot className="w-4 h-4 mr-2" />
            V16.1
          </Badge>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-900">
            🧠 <strong>IA de Sentimento:</strong> Detecta frustração e escala para atendente
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle>Teste o Chatbot</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 mb-4 h-96 overflow-y-auto">
              {ultimasInteracoes.reverse().map((inter) => (
                <div key={inter.id} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-lg max-w-md">
                      <p className="text-sm">{inter.mensagem_usuario}</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-lg max-w-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <Badge variant="outline" className="text-xs">
                          {inter.intent_detectado}
                        </Badge>
                        {inter.sentimento_detectado === 'Frustrado' && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Frustrado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-line">{inter.resposta_bot}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEnviar()}
                placeholder="Digite sua mensagem..."
              />
              <Button onClick={handleEnviar} disabled={!mensagem.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-sm">Intents Autenticadas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">2_via_boleto</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="text-sm">rastrear_entrega</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-sm">Intents Públicas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">fazer_orcamento_ia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">falar_vendedor</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}