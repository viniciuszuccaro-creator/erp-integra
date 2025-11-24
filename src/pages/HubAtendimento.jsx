import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageCircle,
  User,
  Bot,
  Send,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Paperclip,
  MoreVertical,
  Archive,
  UserPlus,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  FileText,
  Timer,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ChatbotDashboard from "@/components/chatbot/ChatbotDashboard";
import ConfiguracaoCanais from "@/components/chatbot/ConfiguracaoCanais";
import GerenciadorTemplates from "@/components/chatbot/GerenciadorTemplates";
import AnalyticsAtendimento from "@/components/chatbot/AnalyticsAtendimento";
import HistoricoClienteChat from "@/components/chatbot/HistoricoClienteChat";
import RoteamentoInteligente from "@/components/chatbot/RoteamentoInteligente";
import MonitorSLA from "@/components/chatbot/MonitorSLA";
import ChatbotFilaEspera from "@/components/chatbot/ChatbotFilaEspera";
import RespostasRapidas from "@/components/chatbot/RespostasRapidas";
import TagsCategorizacao from "@/components/chatbot/TagsCategorizacao";
import SugestoesIA from "@/components/chatbot/SugestoesIA";
import ExportarConversas from "@/components/chatbot/ExportarConversas";

/**
 * V21.5 - HUB DE ATENDIMENTO OMNICANAL
 * 
 * Central unificada de atendimento para todos os canais:
 * ✅ Visualização em tempo real de todas as conversas
 * ✅ Categorização por status (Em Progresso, Aguardando, Não Atribuída)
 * ✅ Interface de chat para atendentes
 * ✅ Histórico completo de cada conversa
 * ✅ Métricas e analytics
 * ✅ Atribuição de conversas
 * ✅ Multi-canal (WhatsApp, Instagram, Telegram, Email, WebChat, Portal)
 * ✅ Integração com ERP (criar pedidos, consultar dados, etc)
 * ✅ Controle de acesso por perfil
 */
export default function HubAtendimento() {
  const [abaAtiva, setAbaAtiva] = useState("atendimento");
  const [filtroStatus, setFiltroStatus] = useState("Em Progresso");
  const [filtroCanal, setFiltroCanal] = useState("Todos");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagemAtendente, setMensagemAtendente] = useState("");
  const [exibirPainelLateral, setExibirPainelLateral] = useState(true);
  const [painelLateralConteudo, setPainelLateralConteudo] = useState('info'); // info, historico, respostas
  
  const queryClient = useQueryClient();
  const { hasPermission, user } = usePermissions();
  const { empresaAtual } = useContextoVisual();

  // Verificar permissão
  const podeAtenderTransbordo = hasPermission('chatbot', 'pode_atender_transbordo');

  // Buscar conversas
  const { data: conversas = [], isLoading } = useQuery({
    queryKey: ['conversas-omnicanal', filtroStatus, filtroCanal, empresaAtual?.id],
    queryFn: async () => {
      let filtros = {};
      
      if (filtroStatus !== "Todas") {
        filtros.status = filtroStatus;
      }
      
      if (filtroCanal !== "Todos") {
        filtros.canal = filtroCanal;
      }

      if (empresaAtual?.id) {
        filtros.empresa_id = empresaAtual.id;
      }

      // Apenas conversas atribuídas ao usuário ou não atribuídas
      if (!hasPermission('chatbot', 'ver_todas_conversas')) {
        filtros.$or = [
          { atendente_id: user.id },
          { atendente_id: { $exists: false } }
        ];
      }

      return await base44.entities.ConversaOmnicanal.filter(
        filtros,
        '-data_ultima_mensagem',
        50
      );
    },
    refetchInterval: 5000 // Atualizar a cada 5 segundos
  });

  // Buscar mensagens da conversa selecionada
  const { data: mensagens = [] } = useQuery({
    queryKey: ['mensagens-conversa', conversaSelecionada?.id],
    queryFn: async () => {
      if (!conversaSelecionada) return [];
      return await base44.entities.MensagemOmnicanal.filter(
        { conversa_id: conversaSelecionada.id },
        'data_envio',
        200
      );
    },
    enabled: !!conversaSelecionada,
    refetchInterval: 3000
  });

  // Buscar métricas
  const { data: metricas } = useQuery({
    queryKey: ['metricas-atendimento', empresaAtual?.id],
    queryFn: async () => {
      const todasConversas = await base44.entities.ConversaOmnicanal.filter({
        empresa_id: empresaAtual?.id
      });

      return {
        total: todasConversas.length,
        emProgresso: todasConversas.filter(c => c.status === 'Em Progresso').length,
        aguardando: todasConversas.filter(c => c.status === 'Aguardando').length,
        naoAtribuidas: todasConversas.filter(c => c.status === 'Não Atribuída').length,
        resolvidasHoje: todasConversas.filter(c => {
          if (!c.data_finalizacao) return false;
          const hoje = new Date().toDateString();
          return new Date(c.data_finalizacao).toDateString() === hoje;
        }).length,
        tempoMedioResposta: 2.5, // TODO: calcular real
        taxaResolucaoBot: 78 // TODO: calcular real
      };
    },
    refetchInterval: 10000
  });

  // Enviar mensagem do atendente
  const enviarMensagemMutation = useMutation({
    mutationFn: async ({ mensagem, arquivo }) => {
      if (!conversaSelecionada) return;

      let arquivoUrl = null;
      if (arquivo) {
        const result = await base44.integrations.Core.UploadFile({ file: arquivo });
        arquivoUrl = result.file_url;
      }

      // Criar mensagem
      const novaMensagem = await base44.entities.MensagemOmnicanal.create({
        conversa_id: conversaSelecionada.id,
        sessao_id: conversaSelecionada.sessao_id,
        canal: conversaSelecionada.canal,
        tipo_remetente: 'Atendente',
        remetente_id: user.id,
        remetente_nome: user.full_name,
        mensagem,
        tipo_conteudo: arquivo ? 'documento' : 'texto',
        midia_url: arquivoUrl,
        data_envio: new Date().toISOString(),
        resposta_automatica: false
      });

      // Atualizar conversa
      await base44.entities.ConversaOmnicanal.update(conversaSelecionada.id, {
        data_ultima_mensagem: new Date().toISOString(),
        total_mensagens: (conversaSelecionada.total_mensagens || 0) + 1,
        mensagens_humano: (conversaSelecionada.mensagens_humano || 0) + 1,
        tipo_atendimento: 'Humano'
      });

      return novaMensagem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens-conversa'] });
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
      setMensagemAtendente("");
      toast.success("Mensagem enviada!");
    }
  });

  // Assumir conversa
  const assumirConversaMutation = useMutation({
    mutationFn: async (conversaId) => {
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        atendente_id: user.id,
        atendente_nome: user.full_name,
        status: 'Em Progresso',
        tipo_atendimento: 'Humano',
        transferido_em: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
      toast.success("Conversa assumida!");
    }
  });

  // Resolver conversa
  const resolverConversaMutation = useMutation({
    mutationFn: async (conversaId) => {
      await base44.entities.ConversaOmnicanal.update(conversaId, {
        status: 'Resolvida',
        resolvido: true,
        data_finalizacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
      setConversaSelecionada(null);
      toast.success("Conversa resolvida!");
    }
  });

  if (!podeAtenderTransbordo) {
    return (
      <div className="p-6">
        <Alert className="border-red-300 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-900">
            Você não tem permissão para acessar o Hub de Atendimento.
            Entre em contato com o administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const conversasFiltradas = conversas.filter(c => {
    if (buscaTexto) {
      const texto = buscaTexto.toLowerCase();
      return (
        c.cliente_nome?.toLowerCase().includes(texto) ||
        c.sessao_id?.toLowerCase().includes(texto) ||
        c.assuntos_detectados?.some(a => a.toLowerCase().includes(texto))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-600" />
              Hub de Atendimento Omnicanal
            </h1>
            <p className="text-slate-600 mt-1">
              Central unificada de atendimento • Todos os canais em um só lugar • V21.5
            </p>
          </div>
          
          {/* Navegação entre abas */}
          <div className="flex gap-2">
            <Button
              variant={abaAtiva === "atendimento" ? "default" : "outline"}
              onClick={() => setAbaAtiva("atendimento")}
              className={abaAtiva === "atendimento" ? "bg-blue-600" : ""}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Atendimento
            </Button>
            <Button
              variant={abaAtiva === "analytics" ? "default" : "outline"}
              onClick={() => setAbaAtiva("analytics")}
              className={abaAtiva === "analytics" ? "bg-blue-600" : ""}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={abaAtiva === "templates" ? "default" : "outline"}
              onClick={() => setAbaAtiva("templates")}
              className={abaAtiva === "templates" ? "bg-blue-600" : ""}
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button
              variant={abaAtiva === "config" ? "default" : "outline"}
              onClick={() => setAbaAtiva("config")}
              className={abaAtiva === "config" ? "bg-blue-600" : ""}
            >
              <Settings className="w-4 h-4 mr-2" />
              Canais
            </Button>
            <Button
              variant={abaAtiva === "sla" ? "default" : "outline"}
              onClick={() => setAbaAtiva("sla")}
              className={abaAtiva === "sla" ? "bg-blue-600" : ""}
            >
              <Timer className="w-4 h-4 mr-2" />
              SLA
            </Button>
            <Button
              variant={abaAtiva === "fila" ? "default" : "outline"}
              onClick={() => setAbaAtiva("fila")}
              className={abaAtiva === "fila" ? "bg-blue-600" : ""}
            >
              <Clock className="w-4 h-4 mr-2" />
              Fila
            </Button>
          </div>
        </div>

        {/* Renderizar aba ativa */}
        {abaAtiva === "analytics" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatbotDashboard />
            </div>
            <div>
              <ExportarConversas />
            </div>
          </div>
        )}
        {abaAtiva === "templates" && <GerenciadorTemplates />}
        {abaAtiva === "config" && <ConfiguracaoCanais />}
        {abaAtiva === "sla" && <MonitorSLA />}
        {abaAtiva === "fila" && <ChatbotFilaEspera />}
        
        {/* Aba de Atendimento */}
        {abaAtiva === "atendimento" && (
          <>
            {/* Métricas */}
            {metricas && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                  <Activity className="w-4 h-4" />
                  Total
                </div>
                <p className="text-2xl font-bold">{metricas.total}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
                  <MessageCircle className="w-4 h-4" />
                  Em Progresso
                </div>
                <p className="text-2xl font-bold text-blue-600">{metricas.emProgresso}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-600 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Aguardando
                </div>
                <p className="text-2xl font-bold text-orange-600">{metricas.aguardando}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Não Atribuídas
                </div>
                <p className="text-2xl font-bold text-red-600">{metricas.naoAtribuidas}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                  <CheckCircle className="w-4 h-4" />
                  Resolvidas Hoje
                </div>
                <p className="text-2xl font-bold text-green-600">{metricas.resolvidasHoje}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-600 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Tempo Médio
                </div>
                <p className="text-2xl font-bold text-purple-600">{metricas.tempoMedioResposta}min</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-indigo-600 text-sm mb-1">
                  <Bot className="w-4 h-4" />
                  Resolução Bot
                </div>
                <p className="text-2xl font-bold text-indigo-600">{metricas.taxaResolucaoBot}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Buscar por cliente, sessão ou assunto..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="w-full"
                />
              </div>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="Todas">Todas</option>
                <option value="Em Progresso">Em Progresso</option>
                <option value="Aguardando">Aguardando</option>
                <option value="Não Atribuída">Não Atribuída</option>
                <option value="Resolvida">Resolvidas</option>
              </select>

              <select
                value={filtroCanal}
                onChange={(e) => setFiltroCanal(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="Todos">Todos os canais</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="Telegram">Telegram</option>
                <option value="Email">Email</option>
                <option value="WebChat">WebChat</option>
                <option value="Portal">Portal</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Layout Principal */}
        <div className={`grid gap-6 ${exibirPainelLateral && conversaSelecionada ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {/* Lista de Conversas */}
          <Card className="lg:col-span-1">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Conversas Ativas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-slate-500">Carregando...</div>
                ) : conversasFiltradas.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">Nenhuma conversa encontrada</div>
                ) : (
                  conversasFiltradas.map((conversa) => (
                    <motion.button
                      key={conversa.id}
                      onClick={() => setConversaSelecionada(conversa)}
                      whileHover={{ scale: 1.02 }}
                      className={`w-full text-left p-4 border-b hover:bg-slate-50 transition-colors ${
                        conversaSelecionada?.id === conversa.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm truncate">
                              {conversa.cliente_nome || 'Cliente Anônimo'}
                            </p>
                            <Badge className={`text-xs ${
                              conversa.canal === 'WhatsApp' ? 'bg-green-600' :
                              conversa.canal === 'Instagram' ? 'bg-pink-600' :
                              conversa.canal === 'Telegram' ? 'bg-blue-600' :
                              'bg-slate-600'
                            }`}>
                              {conversa.canal}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-slate-600 truncate mb-2">
                            {conversa.intent_principal || 'Sem assunto'}
                          </p>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {conversa.status}
                            </Badge>
                            {conversa.tipo_atendimento && (
                              <Badge variant="outline" className="text-xs">
                                {conversa.tipo_atendimento === 'Bot' ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                                {conversa.tipo_atendimento}
                              </Badge>
                            )}
                            {conversa.prioridade === 'Urgente' && (
                              <Badge className="bg-red-600 text-xs">Urgente</Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 flex-shrink-0">
                          {new Date(conversa.data_ultima_mensagem).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className={`${exibirPainelLateral && conversaSelecionada ? 'lg:col-span-2' : 'lg:col-span-2'} flex flex-col h-[700px]`}>
            {conversaSelecionada ? (
              <>
                {/* Header da Conversa */}
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {conversaSelecionada.cliente_nome || 'Cliente Anônimo'}
                        <Badge className="ml-2 bg-blue-600">
                          {conversaSelecionada.canal}
                        </Badge>
                        {conversaSelecionada.prioridade === 'Urgente' && (
                          <Badge className="bg-red-600">Urgente</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-xs text-slate-600">
                          Sessão: {conversaSelecionada.sessao_id.substring(0, 16)}...
                        </p>
                        {conversaSelecionada.intent_principal && (
                          <Badge variant="outline" className="text-xs">
                            {conversaSelecionada.intent_principal}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Tags da conversa */}
                      {conversaSelecionada.tags && conversaSelecionada.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {conversaSelecionada.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {conversaSelecionada.atendente_id !== user.id && (
                        <Button
                          size="sm"
                          onClick={() => assumirConversaMutation.mutate(conversaSelecionada.id)}
                          disabled={assumirConversaMutation.isPending}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Assumir
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolverConversaMutation.mutate(conversaSelecionada.id)}
                        disabled={resolverConversaMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolver
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExibirPainelLateral(!exibirPainelLateral)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Mensagens */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                  {mensagens.map((msg) => {
                    const isCliente = msg.tipo_remetente === 'Cliente';
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCliente ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          isCliente
                            ? 'bg-white border'
                            : msg.tipo_remetente === 'Bot'
                            ? 'bg-purple-100 border border-purple-200'
                            : 'bg-blue-600 text-white'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {msg.tipo_remetente === 'Bot' ? (
                              <Bot className="w-4 h-4 text-purple-600" />
                            ) : isCliente ? (
                              <User className="w-4 h-4 text-slate-600" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span className="text-xs font-semibold">
                              {msg.remetente_nome}
                            </span>
                          </div>
                          
                          <p className="text-sm whitespace-pre-wrap">{msg.mensagem}</p>
                          
                          {msg.midia_url && (
                            <a
                              href={msg.midia_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 flex items-center gap-2 text-xs underline"
                            >
                              <Paperclip className="w-3 h-3" />
                              Arquivo
                            </a>
                          )}

                          <p className="text-xs opacity-60 mt-1">
                            {new Date(msg.data_envio).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>

                {/* Input de Mensagem */}
                <div className="border-t p-4 bg-slate-50">
                  <div className="flex gap-2">
                    <Input
                      value={mensagemAtendente}
                      onChange={(e) => setMensagemAtendente(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (mensagemAtendente.trim()) {
                            enviarMensagemMutation.mutate({ mensagem: mensagemAtendente });
                          }
                        }
                      }}
                      placeholder="Digite sua mensagem... (Enter para enviar)"
                      disabled={enviarMensagemMutation.isPending}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPainelLateralConteudo('respostas')}
                      title="Respostas Rápidas"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (mensagemAtendente.trim()) {
                          enviarMensagemMutation.mutate({ mensagem: mensagemAtendente });
                        }
                      }}
                      disabled={!mensagemAtendente.trim() || enviarMensagemMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Selecione uma conversa para iniciar o atendimento</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Painel Lateral Contextual */}
          {exibirPainelLateral && conversaSelecionada && (
            <Card className="lg:col-span-1">
              <CardHeader className="border-b">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={painelLateralConteudo === 'info' ? 'default' : 'outline'}
                    onClick={() => setPainelLateralConteudo('info')}
                    className="flex-1"
                  >
                    Info
                  </Button>
                  <Button
                    size="sm"
                    variant={painelLateralConteudo === 'respostas' ? 'default' : 'outline'}
                    onClick={() => setPainelLateralConteudo('respostas')}
                    className="flex-1"
                  >
                    Respostas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[600px] overflow-y-auto">
                {painelLateralConteudo === 'info' && (
                  <div className="space-y-4">
                    {/* Informações do Cliente */}
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 mb-2">Dados do Cliente</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600">Email:</span>
                          <p className="font-medium">{conversaSelecionada.cliente_email || '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Telefone:</span>
                          <p className="font-medium">{conversaSelecionada.cliente_telefone || '-'}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Canal Origem:</span>
                          <p className="font-medium">{conversaSelecionada.canal_id_externo || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Métricas da Conversa */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-sm text-slate-900 mb-2">Métricas</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total Mensagens:</span>
                          <span className="font-bold">{conversaSelecionada.total_mensagens || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Bot:</span>
                          <span className="font-bold text-purple-600">{conversaSelecionada.mensagens_bot || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Cliente:</span>
                          <span className="font-bold text-blue-600">{conversaSelecionada.mensagens_cliente || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Sentimento:</span>
                          <Badge className={`${
                            conversaSelecionada.sentimento_geral === 'Positivo' ? 'bg-green-600' :
                            conversaSelecionada.sentimento_geral === 'Negativo' ? 'bg-red-600' :
                            'bg-slate-600'
                          }`}>
                            {conversaSelecionada.sentimento_geral || 'Neutro'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="border-t pt-4">
                      <TagsCategorizacao conversa={conversaSelecionada} />
                    </div>

                    {/* Sugestões da IA */}
                    <div className="border-t pt-4">
                      <SugestoesIA conversa={conversaSelecionada} mensagens={mensagens} />
                    </div>

                    {/* Histórico Cliente */}
                    {conversaSelecionada.cliente_id && (
                      <div className="border-t pt-4">
                        <HistoricoClienteChat clienteId={conversaSelecionada.cliente_id} />
                      </div>
                    )}
                  </div>
                )}

                {painelLateralConteudo === 'respostas' && (
                  <RespostasRapidas
                    onSelecionarResposta={(texto) => {
                      setMensagemAtendente(texto);
                      setPainelLateralConteudo('info');
                    }}
                    contextoConversa={{
                      pedido: conversaSelecionada.pedido_gerado_id || 'PED-XXX',
                      status: 'Em Processamento',
                      data_entrega: 'DD/MM/AAAA',
                      endereco: 'Endereço do cliente',
                      link: '#',
                      linha_digitavel: 'XXXXX.XXXXX',
                      vencimento: 'DD/MM/AAAA',
                      quantidade: '3',
                      valor_total: 'R$ 5.000,00',
                      valor: 'R$ 5.000,00',
                      prazo: '5',
                      forma_pagamento: 'Boleto'
                    }}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}