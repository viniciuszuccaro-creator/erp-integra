
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, ShoppingCart, FileText, Upload, DollarSign, LogOut, Package, Calendar, Download, LayoutDashboard, CheckCircle2, AlertTriangle, User, LogIn, ShoppingBag, Truck, MapPin, Navigation, MessageCircle, MessageSquare } from "lucide-react";
import DashboardCliente from "@/components/portal/DashboardCliente";
import ChatCliente from "@/components/portal/ChatCliente";
import ChamadosCliente from "@/components/portal/ChamadosCliente";
import UploadProjetos from "@/components/portal/UploadProjetos";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import DownloadsDocumentos from "@/components/portal/DownloadsDocumentos"; // Keep if still used, but changes indicate it might be replaced
import AprovacaoOrcamentos from "@/components/portal/AprovacaoOrcamentos";
import { useUser } from "@/components/lib/UserContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * Portal do Cliente - V12.0 COMPLETO
 * Com aprovação de orçamentos, rastreamento, chat e chamados
 */
export default function PortalCliente() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cliente, setCliente] = useState(null);
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

  // NOVA: Atualizar tracking de visualização
  const atualizarVisualizacaoPedido = async (pedidoId) => {
    // Only fetch if client is available
    if (!cliente?.id) return; 

    // Re-fetch pedido to get the latest `visualizacoes_portal`
    const pedido = await base44.entities.Pedido.findById(pedidoId);
    if (!pedido) return;

    await base44.entities.Pedido.update(pedidoId, {
      ultimo_acesso_portal_at: new Date().toISOString(),
      visualizacoes_portal: (pedido.visualizacoes_portal || 0) + 1
    });
    
    // Invalidate queries to reflect changes if necessary
    queryClient.invalidateQueries(['pedidosCliente', cliente.id]);

    // Update metrics of portal usage for the client
    const currentCliente = await base44.entities.Cliente.findById(cliente.id);
    await base44.entities.Cliente.update(cliente.id, {
      'uso_portal.ultimo_acesso': new Date().toISOString(),
      'uso_portal.total_acessos': (currentCliente?.uso_portal?.total_acessos || 0) + 1,
      'uso_canais.total_portal': (currentCliente?.uso_canais?.total_portal || 0) + 1
    });

    queryClient.invalidateQueries(['cliente-portal', user.id]); // Invalidate client query to reflect updated usage stats
  };

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceberCliente', cliente?.id],
    queryFn: () => base44.entities.ContaReceber.filter({ cliente_id: cliente.id }, '-data_vencimento'),
    enabled: !!cliente?.id
  });

  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos-site', cliente?.email],
    queryFn: () => base44.entities.OrcamentoSite.filter({
      cliente_email: cliente?.email
    }, '-created_date', 10),
    enabled: !!cliente?.email
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
      cliente_id: cliente.id
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
            <Alert className="border-blue-200 bg-blue-50 text-left mb-6">
              <AlertDescription>
                <p className="text-sm text-blue-900 font-semibold mb-2">Como resolver:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Entre em contato com nosso time comercial</li>
                  <li>Solicite a vinculação do seu cadastro</li>
                  <li>Aguarde a confirmação por e-mail</li>
                </ol>
              </AlertDescription>
            </Alert>
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
      'Concluído': 'bg-green-100 text-green-700', // Added for chamados
    };
    return cores[status] || 'bg-slate-100 text-slate-700';
  };

  const renderPedidoProducao = (pedido) => {
    // NOVA: Aba Produção espelhando o layout do orçamento impresso
    const temRevenda = (pedido.itens_revenda?.length || 0) > 0;
    const temArmado = (pedido.itens_armado_padrao?.length || 0) > 0;
    const temCorte = (pedido.itens_corte_dobra?.length || 0) > 0;

    return (
      <div className="space-y-6">
        {/* Seção 1: Itens de Revenda */}
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

        {/* Seção 2: Itens de Armado Padrão */}
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

        {/* Seção 3: Itens de Corte e Dobra */}
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

        {/* Resumo de Bitolas */}
        <Card className="border-slate-200">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-sm font-semibold">Resumo de Bitolas (kg)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Cálculo consolidado disponível após aprovação do pedido</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Portal do Cliente</h1>
              <p className="text-sm text-slate-600">{cliente.nome_fantasia || cliente.razao_social}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orcamentos">
              <FileText className="w-4 h-4 mr-2" />
              Orçamentos
              {orcamentos.length > 0 && (
                <Badge className="ml-2 bg-orange-600 text-white text-xs">{orcamentos.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pedidos">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="entregas">
              <Truck className="w-4 h-4 mr-2" />
              Rastreamento
            </TabsTrigger>
            <TabsTrigger value="financeiro">
              <DollarSign className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="documentos">
              <Download className="w-4 h-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="projetos">
              <Upload className="w-4 h-4 mr-2" />
              Enviar Projeto
            </TabsTrigger>
            <TabsTrigger value="chamados">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chamados
              {chamadosAbertos.length > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white text-xs">{chamadosAbertos.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardCliente />
          </TabsContent>

          <TabsContent value="orcamentos">
            <AprovacaoOrcamentos clienteId={cliente?.id} />
          </TabsContent>

          {/* PEDIDOS TAB - REFATORADO COM SEÇÕES */}
          <TabsContent value="pedidos">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Meus Pedidos e Produção</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {pedidos.map(pedido => {
                    const hasProductionDetails = (pedido.itens_revenda?.length || 0) > 0 || (pedido.itens_armado_padrao?.length || 0) > 0 || (pedido.itens_corte_dobra?.length || 0) > 0;
                    
                    return (
                      <Card key={pedido.id} className="border-2 border-blue-200">
                        <CardHeader className="bg-blue-50 border-b">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-lg">Pedido #{pedido.numero_pedido}</p>
                              <p className="text-sm text-slate-600">
                                {format(new Date(pedido.data_pedido), 'dd/MM/yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
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
                              asChild
                            >
                              {/* Using asChild with Link to navigate without re-rendering the whole page if needed,
                                  but for now, it just triggers the tracking and shows content below.
                                  Could be a collapsible section or a new page. */}
                              <div>Ver Detalhes da Produção →</div>
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

          <TabsContent value="entregas">
            <Card>
              <CardHeader>
                <CardTitle>Rastreamento de Entregas</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {entregasEmAndamento
                    .filter(e => e.status !== 'Entregue') // Filter out delivered ones as they will be in documents tab
                    .map(entrega => (
                      <Card key={entrega.id} className="border-2 border-green-300 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold">{entrega.numero_pedido}</p>
                              <p className="text-sm text-slate-600">{cliente.nome_fantasia || cliente.razao_social}</p>
                            </div>
                            <Badge className={getStatusColor(entrega.status)}>{entrega.status}</Badge>
                          </div>

                          {entrega.codigo_rastreamento && (
                            <div className="p-3 bg-white rounded border mb-3">
                              <p className="text-xs text-slate-600">Código de Rastreamento</p>
                              <p className="font-mono font-semibold">{entrega.codigo_rastreamento}</p>
                            </div>
                          )}

                          <div className="text-sm space-y-2">
                            <p>
                              <MapPin className="w-4 h-4 inline mr-2" />
                              {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}
                            </p>
                            <p className="text-slate-600">
                              {entrega.endereco_entrega_completo?.cidade} - {entrega.endereco_entrega_completo?.estado}
                            </p>
                          </div>

                          {entrega.link_rastreamento && (
                            <Button
                              className="w-full mt-3"
                              onClick={() => window.open(entrega.link_rastreamento, '_blank')}
                            >
                              <Navigation className="w-4 h-4 mr-2" />
                              Rastrear em Tempo Real
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                  {entregasEmAndamento.filter(e => e.status !== 'Entregue').length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Nenhuma entrega em andamento</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Títulos e Pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {contasReceber.map(conta => (
                    <div key={conta.id} className={`p-4 rounded-lg border ${
                      conta.status === 'Pendente' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <p className="font-semibold">{conta.descricao}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                            <Badge className={conta.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                              {conta.status}
                            </Badge>
                            <span className="text-slate-600">
                              Vencimento: {format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {conta.boleto_url && (
                              <Button size="sm" variant="outline" onClick={() => window.open(conta.boleto_url, '_blank')}>
                                Ver Boleto
                              </Button>
                            )}
                            {conta.pix_copia_cola && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                  navigator.clipboard.writeText(conta.pix_copia_cola);
                                  toast({ title: '✅ Código PIX copiado!' });
                                }}
                              >
                                Copiar PIX
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {contasReceber.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>Nenhum título em aberto</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DOCUMENTOS TAB - COM COMPROVANTES DE ENTREGA */}
          <TabsContent value="documentos">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Documentos e Comprovantes</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* NF-e */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Notas Fiscais
                  </h4>
                  <div className="space-y-2">
                    {notasFiscais.length > 0 ? (
                      notasFiscais.map(nf => (
                        <div key={nf.id} className="p-3 border rounded flex justify-between items-center bg-white">
                          <div>
                            <p className="font-medium">NF-e {nf.numero}/{nf.serie}</p>
                            <p className="text-xs text-slate-500">{format(new Date(nf.data_emissao), 'dd/MM/yyyy')}</p>
                          </div>
                          <div className="flex gap-2">
                            {nf.xml_nfe && (
                              <Button size="sm" variant="outline" onClick={() => window.open(nf.xml_nfe, '_blank')}>
                                XML
                              </Button>
                            )}
                            {nf.pdf_danfe && (
                              <Button size="sm" onClick={() => window.open(nf.pdf_danfe, '_blank')}>
                                PDF
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        Nenhuma nota fiscal disponível.
                      </div>
                    )}
                  </div>
                </div>

                {/* NOVO: Comprovantes de Entrega */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    Comprovantes de Entrega
                  </h4>
                  <div className="space-y-2">
                    {entregasEmAndamento
                      .filter(e => e.status === 'Entregue' && e.comprovante_entrega?.foto_comprovante)
                      .map(entrega => (
                        <div key={entrega.id} className="p-3 border rounded bg-green-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">Pedido #{entrega.numero_pedido}</p>
                              <p className="text-xs text-slate-600">
                                Entregue em: {format(new Date(entrega.comprovante_entrega.data_hora_recebimento), 'dd/MM/yyyy HH:mm')}
                              </p>
                              <p className="text-xs text-slate-600">
                                Recebido por: {entrega.comprovante_entrega.nome_recebedor}
                              </p>
                            </div>
                            <Badge className="bg-green-600 text-white">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Entregue
                            </Badge>
                          </div>
                          
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {entrega.comprovante_entrega.foto_comprovante && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(entrega.comprovante_entrega.foto_comprovante, '_blank')}
                              >
                                Ver Foto
                              </Button>
                            )}
                            {entrega.comprovante_entrega.assinatura_digital && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(entrega.comprovante_entrega.assinatura_digital, '_blank')}
                              >
                                Ver Assinatura
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    }
                    {entregasEmAndamento.filter(e => e.status === 'Entregue' && e.comprovante_entrega?.foto_comprovante).length === 0 && (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        Nenhum comprovante de entrega disponível.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projetos">
            <UploadProjetos clienteId={cliente?.id} />
          </TabsContent>

          <TabsContent value="chamados">
            <ChamadosCliente clienteId={cliente?.id} />
          </TabsContent>

          <TabsContent value="chat">
            <ChatCliente clienteId={cliente?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
