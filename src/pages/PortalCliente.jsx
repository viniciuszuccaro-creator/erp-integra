import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, ShoppingCart, FileText, Upload, DollarSign, LogOut, Package, Calendar, Download, LayoutDashboard, CheckCircle2, AlertTriangle, User, LogIn, ShoppingBag, Truck, MapPin, Navigation, MessageCircle, MessageSquare, Send, Target } from "lucide-react";
import DashboardClienteInterativo from "@/components/portal/DashboardClienteInterativo";
import ChatVendedor from "@/components/portal/ChatVendedor";
import ChamadosCliente from "@/components/portal/ChamadosCliente";
import UploadProjetos from "@/components/portal/UploadProjetos";
import AprovacaoComAssinatura from "@/components/portal/AprovacaoComAssinatura";
import PedidosCliente from "@/components/portal/PedidosCliente";
import DocumentosCliente from "@/components/portal/DocumentosCliente";
import SolicitarOrcamento from "@/components/portal/SolicitarOrcamento";
import MinhasOportunidades from "@/components/portal/MinhasOportunidades";
import ChatbotPortal from "@/components/portal/ChatbotPortal";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/components/lib/UserContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AnimatePresence } from "framer-motion";

/**
 * PORTAL DO CLIENTE V21.5 - ROBUSTO E INTERATIVO
 * ✅ Acompanhamento de pedidos em tempo real
 * ✅ Rastreamento logístico com GPS e QR Code
 * ✅ Visualização e download de NFes e Boletos
 * ✅ Solicitação de orçamentos
 * ✅ Acompanhamento de oportunidades/funil
 * ✅ Chatbot com IA integrada
 * ✅ Totalmente responsivo (web e mobile)
 * ✅ Dashboard interativo com métricas
 * ✅ Chat com vendedor
 * ✅ Aprovação com assinatura eletrônica
 */
export default function PortalCliente() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cliente, setCliente] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  const { data: fetchedCliente, isLoading: isClienteLoading } = useQuery({
    queryKey: ['cliente-portal', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const clientes = await base44.entities.Cliente.filter({
        portal_usuario_id: user.id
      });
      const clientData = clientes[0] || null;
      setCliente(clientData);
      return clientData;
    },
    enabled: !!user?.id,
    retry: false
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidosCliente', cliente?.id],
    queryFn: async () => {
      const pedidosData = await base44.entities.Pedido.filter({ 
        cliente_id: cliente.id,
        pode_ver_no_portal: true
      }, '-data_pedido', 20);
      return pedidosData;
    },
    enabled: !!cliente?.id
  });

  const atualizarVisualizacaoPedido = async (pedidoId) => {
    if (!cliente?.id) return; 

    const pedido = await base44.entities.Pedido.filter({ id: pedidoId }).then(r => r[0]);
    if (!pedido) return;

    await base44.entities.Pedido.update(pedidoId, {
      ultimo_acesso_portal_at: new Date().toISOString(),
      visualizacoes_portal: (pedido.visualizacoes_portal || 0) + 1
    });
    
    queryClient.invalidateQueries(['pedidosCliente', cliente.id]);

    const currentCliente = await base44.entities.Cliente.filter({ id: cliente.id }).then(r => r[0]);
    await base44.entities.Cliente.update(cliente.id, {
      'uso_portal.ultimo_acesso': new Date().toISOString(),
      'uso_portal.total_acessos': (currentCliente?.uso_portal?.total_acessos || 0) + 1,
      'uso_canais.total_portal': (currentCliente?.uso_canais?.total_portal || 0) + 1
    });

    queryClient.invalidateQueries(['cliente-portal', user.id]);
  };

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceberCliente', cliente?.id],
    queryFn: () => base44.entities.ContaReceber.filter({ cliente_id: cliente.id }, '-data_vencimento'),
    enabled: !!cliente?.id
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos-site', cliente?.id],
    queryFn: () => base44.entities.OrcamentoCliente.filter({
      cliente_id: cliente?.id,
      status: 'Pendente'
    }, '-created_date', 10),
    enabled: !!cliente?.id
  });

  const { data: entregasEmAndamento = [] } = useQuery({
    queryKey: ['entregasEmAndamento', cliente?.id],
    queryFn: () => base44.entities.Entrega.filter({
      cliente_id: cliente.id
    }, '-data_entrega'),
    enabled: !!cliente?.id
  });

  const { data: chamadosAbertos = [] } = useQuery({
    queryKey: ['chamadosAbertos', cliente?.id],
    queryFn: () => base44.entities.Chamado.filter({
      cliente_id: cliente.id
    }, '-created_date'),
    enabled: !!cliente?.id
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notasFiscais', cliente?.id],
    queryFn: () => base44.entities.NotaFiscal.filter({
      cliente_fornecedor_id: cliente.id
    }, '-data_emissao'),
    enabled: !!cliente?.id
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-4">Portal do Cliente</h2>
            <p className="text-slate-600 mb-6">
              Faça login para acessar seus pedidos, orçamentos e documentos
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isClienteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando portal...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Cliente Não Encontrado</h2>
            <p className="text-slate-600 mb-2">Não encontramos um cadastro de cliente vinculado à sua conta.</p>
            <p className="text-sm text-slate-500 mb-4">
              Usuário: {user.full_name} ({user.email})
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => base44.auth.logout()} variant="outline" className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const getStatusColor = (status) => {
    const cores = {
      'Rascunho': 'bg-slate-100 text-slate-700',
      'Aprovado': 'bg-blue-100 text-blue-700',
      'Em Produção': 'bg-purple-100 text-purple-700',
      'Faturado': 'bg-cyan-100 text-cyan-700',
      'Em Trânsito': 'bg-orange-100 text-orange-700',
      'Entregue': 'bg-green-100 text-green-700',
      'Cancelado': 'bg-red-100 text-red-700',
      'Pendente': 'bg-yellow-100 text-yellow-700',
      'Aberto': 'bg-blue-100 text-blue-700',
      'Em Atendimento': 'bg-orange-100 text-orange-700',
      'Concluído': 'bg-green-100 text-green-700',
    };
    return cores[status] || 'bg-slate-100 text-slate-700';
  };

  const renderPedidoProducao = (pedido) => {
    const temRevenda = (pedido.itens_revenda?.length || 0) > 0;
    const temArmado = (pedido.itens_armado_padrao?.length || 0) > 0;
    const temCorte = (pedido.itens_corte_dobra?.length || 0) > 0;

    return (
      <div className="space-y-6">
        {temRevenda && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="bg-blue-100 border-b border-blue-200">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Package className="w-4 h-4" />
                Itens de Revenda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white">
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedido.itens_revenda.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell className="text-center">{item.quantidade} {item.unidade}</TableCell>
                      <TableCell className="text-right">R$ {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {temArmado && (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="bg-purple-100 border-b border-purple-200">
              <CardTitle className="text-sm font-semibold">Armação Padrão</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pedido.itens_armado_padrao.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">{item.elemento} - {item.tipo_peca}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p><strong>Bitola Principal:</strong> {item.bitola_principal}</p>
                    <p><strong>Quantidade:</strong> {item.quantidade_barras_principais} barras</p>
                    <p><strong>Estribo:</strong> {item.estribo_bitola} @ {item.estribo_distancia}cm</p>
                    <p><strong>Peso Total:</strong> {item.peso_teorico_total?.toFixed(2)} kg</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {temCorte && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="bg-green-100 border-b border-green-200">
              <CardTitle className="text-sm font-semibold">Corte e Dobra</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {pedido.itens_corte_dobra.map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">{item.elemento} - {item.descricao_automatica}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p><strong>Bitola:</strong> {item.bitola}</p>
                    <p><strong>Comprimento:</strong> {item.comprimento_barra}cm</p>
                    <p><strong>Quantidade:</strong> {item.quantidade_pecas} peças</p>
                    <p><strong>Peso:</strong> {item.peso_teorico_total?.toFixed(2)} kg</p>
                  </div>
                  {item.desenho_url && (
                    <img src={item.desenho_url} alt="Desenho" className="mt-2 w-full max-w-xs rounded border" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header do Portal */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Portal do Cliente</h1>
              <p className="text-sm text-slate-600">{cliente?.nome_fantasia || cliente?.razao_social || user?.full_name}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                onClick={() => setChatOpen(!chatOpen)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Assistente IA</span>
                <span className="sm:hidden">IA</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-9 bg-white shadow-sm overflow-x-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="meus-pedidos" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden lg:inline">Meus Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="documentos-novos" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Documentos</span>
            </TabsTrigger>
            <TabsTrigger value="solicitar-orcamento" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span className="hidden lg:inline">Solicitar</span>
            </TabsTrigger>
            <TabsTrigger value="minhas-oportunidades" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden lg:inline">Oportunidades</span>
            </TabsTrigger>
            <TabsTrigger value="orcamentos" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline">Orçamentos</span>
              {orcamentos.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-orange-600 text-white text-xs">{orcamentos.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden lg:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="projetos" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">Enviar</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Chat</span>
              <div className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Interativo */}
          <TabsContent value="dashboard">
            <DashboardClienteInterativo />
          </TabsContent>

          {/* Nova Aba: Meus Pedidos (Componente Novo) */}
          <TabsContent value="meus-pedidos">
            <PedidosCliente />
          </TabsContent>

          {/* Nova Aba: Documentos (Componente Novo) */}
          <TabsContent value="documentos-novos">
            <DocumentosCliente />
          </TabsContent>

          {/* Nova Aba: Solicitar Orçamento */}
          <TabsContent value="solicitar-orcamento">
            <SolicitarOrcamento />
          </TabsContent>

          {/* Nova Aba: Minhas Oportunidades */}
          <TabsContent value="minhas-oportunidades">
            <MinhasOportunidades />
          </TabsContent>

          {/* Aprovação com Assinatura */}
          <TabsContent value="orcamentos">
            <AprovacaoComAssinatura clienteId={cliente?.id} />
          </TabsContent>

          {/* Histórico de Pedidos */}
          <TabsContent value="pedidos">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Histórico de Pedidos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {pedidos.map(pedido => {
                    const hasProductionDetails = (pedido.itens_revenda?.length || 0) > 0 || (pedido.itens_armado_padrao?.length || 0) > 0 || (pedido.itens_corte_dobra?.length || 0) > 0;
                    
                    return (
                      <Card key={pedido.id} className="border-2 border-blue-200">
                        <CardHeader className="bg-blue-50 border-b">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                              <p className="font-bold text-lg">Pedido #{pedido.numero_pedido}</p>
                              <p className="text-sm text-slate-600">
                                {format(new Date(pedido.data_pedido), 'dd/MM/yyyy')}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <Badge className={getStatusColor(pedido.status)}>
                                {pedido.status}
                              </Badge>
                              <p className="text-lg font-bold text-green-600 mt-2">
                                R$ {pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          {hasProductionDetails ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mb-4"
                              onClick={() => atualizarVisualizacaoPedido(pedido.id)}
                            >
                              Ver Detalhes da Produção →
                            </Button>
                          ) : (
                            <p className="text-sm text-slate-500 mb-4">Detalhes de produção não disponíveis.</p>
                          )}

                          {hasProductionDetails && renderPedidoProducao(pedido)}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {pedidos.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Nenhum pedido encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projetos">
            <UploadProjetos clienteId={cliente?.id} />
          </TabsContent>

          {/* Chat com Vendedor */}
          <TabsContent value="chat">
            <ChatVendedor clienteId={cliente?.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chatbot IA Flutuante */}
      <AnimatePresence>
        {chatOpen && (
          <ChatbotPortal
            onClose={() => setChatOpen(false)}
            isMinimized={chatMinimized}
            onToggleMinimize={() => setChatMinimized(!chatMinimized)}
          />
        )}
      </AnimatePresence>

      {/* Botão Flutuante do Chat (quando minimizado) */}
      {chatMinimized && (
        <Button
          onClick={() => setChatMinimized(false)}
          className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}