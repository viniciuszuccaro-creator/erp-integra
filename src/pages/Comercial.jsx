import React, { useState, useEffect, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const MonitoramentoCanaisRealtime = React.lazy(() => import("@/components/comercial/MonitoramentoCanaisRealtime"));
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, FileText, TrendingUp, DollarSign, AlertCircle, Printer, Search, Plus, ShieldCheck, Truck, Package, Eye, Edit } from "lucide-react";
const ClientesTab = React.lazy(() => import("../components/comercial/ClientesTab"));
const PedidosTab = React.lazy(() => import("../components/comercial/PedidosTab"));
import { useContextoVisual } from "@/components/lib/useContextoVisual";
const ComissoesTab = React.lazy(() => import("../components/comercial/ComissoesTab"));
const NotasFiscaisTab = React.lazy(() => import("../components/comercial/NotasFiscaisTab"));
const TabelasPrecoTab = React.lazy(() => import("../components/comercial/TabelasPrecoTab"));
import PainelDinamicoCliente from "../components/cadastros/PainelDinamicoCliente";
import usePermissions from "@/components/lib/usePermissions";
import CentralAprovacoesManager from "../components/comercial/CentralAprovacoesManager";
import PedidosEntregaTab from "../components/comercial/PedidosEntregaTab";
import PedidosRetiradaTab from "../components/comercial/PedidosRetiradaTab";
import VisualizadorUniversalEntidade from '../components/cadastros/VisualizadorUniversalEntidade';
import CadastroClienteCompleto from '../components/cadastros/CadastroClienteCompleto';

import { useKeyboardShortcuts } from '@/components/lib/keyboardShortcuts';
import { Skeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import ExportButton from '@/components/ExportButton';
import { ImprimirPedido } from '@/components/lib/impressao';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import PedidoFormCompleto from "../components/comercial/PedidoFormCompleto";
import NotaFiscalFormCompleto from "../components/comercial/NotaFiscalFormCompleto";
import { useWindow } from "@/components/lib/useWindow";
import { useUser } from "@/components/lib/UserContext";

/**
 * Módulo Comercial - V12.0 COMPLETO
 * Com atalhos, exportação e impressão
 */
export default function Comercial() {
  const [activeTab, setActiveTab] = useState("clientes");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) {
      try { initial = localStorage.getItem('Comercial_tab'); } catch {}
    }
    if (initial) setActiveTab(initial);
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Comercial_tab', value); } catch {}
  };
  const [painelClienteAberto, setPainelClienteAberto] = useState(false);
  const [clienteParaPainel, setClienteParaPainel] = useState(null);

  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow, closeWindow } = useWindow();
  const { filtrarPorContexto, getFiltroContexto, empresaAtual, grupoAtual } = useContextoVisual();
  const { user } = useUser();

  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => base44.entities.Cliente.filter(getFiltroContexto('empresa_id'), '-created_date'),
      });

  const pedidosQuery = useQuery({
        queryKey: ['pedidos'],
        queryFn: () => base44.entities.Pedido.filter(getFiltroContexto('empresa_id'), '-created_date'),
      });

  const { data: pedidos = [], isLoading: loadingPedidos } = pedidosQuery;

  const { data: comissoes = [] } = useQuery({
    queryKey: ['comissoes'],
    queryFn: () => base44.entities.Comissao.list(),
  });

  const queryClient = useQueryClient();
  
  const { data: notasFiscais = [] } = useQuery({
        queryKey: ['notasFiscais'],
        queryFn: () => base44.entities.NotaFiscal.filter(getFiltroContexto('empresa_id'), '-created_date'),
      });

  // Keeping this query as per outline, even if not displayed
  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list('-updated_date'),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  // NOVO: Query para pedidos externos
  const { data: pedidosExternos = [] } = useQuery({
    queryKey: ['pedidos-externos'],
    queryFn: () => base44.entities.PedidoExterno.list('-created_date'),
  });

  const clientesFiltrados = filtrarPorContexto(clientes, 'empresa_id');
  const pedidosFiltrados = filtrarPorContexto(pedidos, 'empresa_id');
  const notasFiscaisFiltradas = filtrarPorContexto(notasFiscais, 'empresa_id');

  const pedidosExternosPendentes = pedidosExternos.filter(
    p => p.status_importacao === 'A Validar'
  ).length;

  const totalVendas = pedidosFiltrados
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);

  const ticketMedio = pedidosFiltrados.length > 0 ? totalVendas / pedidosFiltrados.length : 0;

  // NOVO: Atalhos de teclado (adjusted for component extraction)
  useKeyboardShortcuts({
    'ctrl+s': (e) => {
      e.preventDefault();
      // Salvar será tratado no formulário, não diretamente no componente pai
      toast.info('Use Ctrl+S dentro do formulário');
    },
    // ctrl+n (new order) and ctrl+p (print order) logic is now handled within PedidosTab
    // or expected to be registered by PedidosTab itself if it needs global shortcuts.
  });

  // V21.5: Handlers usando sistema de janelas - COM PROTEÇÃO ANTI-DUPLICAÇÃO
  const handleCreateNewPedido = () => {
    let pedidoCriado = false; // Flag para evitar duplicação
    
    openWindow(
      PedidoFormCompleto,
      { 
        clientes,
        windowMode: true,
        pedido: { status: 'Rascunho' }, // Criar como rascunho, aprovar depois com baixa
        onSubmit: async (formData) => {
          if (pedidoCriado) {
            console.warn('⚠️ Tentativa de criação duplicada bloqueada');
            return;
          }
          
          pedidoCriado = true;
          
          try {
            const created = await base44.entities.Pedido.create({
              ...formData,
              empresa_id: formData.empresa_id || empresaAtual?.id,
              group_id: formData.group_id || grupoAtual?.id,
              vendedor: formData.vendedor || user?.full_name,
              vendedor_id: formData.vendedor_id || user?.id,
            });
            await base44.entities.AuditLog.create({
              usuario: user?.full_name || user?.email || 'Usuário',
              usuario_id: user?.id,
              empresa_id: empresaAtual?.id,
              empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || '',
              acao: 'Criação',
              modulo: 'Comercial',
              entidade: 'Pedido',
              registro_id: created.id,
              descricao: `Pedido ${created.numero_pedido || ''} criado`,
            });
            toast.success("✅ Pedido criado com sucesso!");
            await pedidosQuery.refetch();
          } catch (error) {
            pedidoCriado = false; // Reset em caso de erro
            toast.error("Erro ao salvar pedido: " + error.message);
          }
        },
        onCancel: () => {}
      },
      {
        title: '🛒 Novo Pedido',
        width: 1400,
        height: 800
      }
    );
  };

  const handleEditPedido = (pedido) => {
    let atualizacaoEmAndamento = false;
    let windowIdRef = null;
    
    // V21.6: Guardar função openWindow para uso posterior
    window.__currentOpenWindow = openWindow;
    
    windowIdRef = openWindow(
      PedidoFormCompleto,
      { 
        pedido,
        clientes,
        windowMode: true,
        onSubmit: async (formData) => {
          if (atualizacaoEmAndamento) {
            console.warn('⚠️ Tentativa de atualização duplicada bloqueada');
            return;
          }
          
          atualizacaoEmAndamento = true;
          
          try {
            await base44.entities.Pedido.update(formData.id, formData);
            await base44.entities.AuditLog.create({
              usuario: user?.full_name || user?.email || 'Usuário',
              usuario_id: user?.id,
              empresa_id: empresaAtual?.id,
              empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || '',
              acao: 'Edição',
              modulo: 'Comercial',
              entidade: 'Pedido',
              registro_id: formData.id,
              descricao: `Pedido ${formData.numero_pedido || ''} atualizado`,
            });
            toast.success("✅ Pedido atualizado com sucesso!");
            await pedidosQuery.refetch();
            
            // Fechar a janela após salvar
            if (windowIdRef) {
              closeWindow(windowIdRef);
            }
            
            return formData; // Retornar dados atualizados
          } catch (error) {
            atualizacaoEmAndamento = false;
            toast.error("Erro ao salvar pedido: " + error.message);
            throw error;
          }
        },
        onCancel: () => {
          if (windowIdRef) {
            closeWindow(windowIdRef);
          }
        }
      },
      {
        title: `📝 Editar Pedido ${pedido.numero_pedido}`,
        width: 1400,
        height: 800
      }
    );
  };


  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Comercial e Vendas</h1>
          <p className="text-slate-600">Gestão de clientes, pedidos, preços e vendas</p>
        </div>
        
        {/* NOVO: Alerta de Pedidos Externos */}
        {pedidosExternosPendentes > 0 && (
          <Badge 
            className="bg-orange-100 text-orange-700 px-4 py-2 cursor-pointer hover:bg-orange-200"
            onClick={() => setActiveTab('externos')}
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {pedidosExternosPendentes} pedido(s) externo(s) a validar
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          onClick={() => openWindow(
            VisualizadorUniversalEntidade,
            {
              nomeEntidade: 'Cliente',
              tituloDisplay: 'Clientes',
              icone: Users,
              camposPrincipais: ['nome', 'razao_social', 'cnpj', 'cpf', 'status', 'email'],
              componenteEdicao: CadastroClienteCompleto,
              windowMode: true
            },
            { title: '👥 Todos os Clientes', width: 1400, height: 800, zIndex: 50000 }
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Clientes</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{clientesFiltrados.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {clientes.filter(c => c.status === 'Ativo').length} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pedidos</CardTitle>
            <ShoppingCart className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{pedidosFiltrados.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Vendas</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
            <FileText className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOVO V21.6: Monitoramento Realtime de Canais */}
      <Suspense fallback={<div className="h-28 rounded-md bg-slate-100 animate-pulse" />}>
        <MonitoramentoCanaisRealtime autoRefresh={true} />
      </Suspense>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-white border shadow-sm flex-wrap">
          <TabsTrigger 
            value="clientes" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger 
            value="pedidos" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger 
            value="entrega" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white relative"
          >
            <Truck className="w-4 h-4 mr-2" />
            Logística de Entrega
            {pedidosFiltrados.filter(p => 
              (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') && 
              ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)
            ).length > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white">
                {pedidosFiltrados.filter(p => 
                  (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') && 
                  ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)
                ).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="retirada" 
            className="data-[state=active]:bg-green-600 data-[state=active]:text-white relative"
          >
            <Package className="w-4 h-4 mr-2" />
            Pedidos p/ Retirada
            {pedidosFiltrados.filter(p => 
              p.tipo_frete === 'Retirada' && 
              ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Pronto para Retirada'].includes(p.status)
            ).length > 0 && (
              <Badge className="ml-2 bg-green-500 text-white">
                {pedidosFiltrados.filter(p => 
                  p.tipo_frete === 'Retirada' && 
                  ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Pronto para Retirada'].includes(p.status)
                ).length}
              </Badge>
            )}
          </TabsTrigger>
          {/* Removed Tabelas de Preço TabTrigger */}
          <TabsTrigger 
            value="comissoes" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Comissões
          </TabsTrigger>
          <TabsTrigger 
            value="notas" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Notas Fiscais
          </TabsTrigger>
          {/* NOVO: Tab Vendas Externas */}
          <TabsTrigger 
            value="externos" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white relative"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Vendas Externas
            {pedidosExternosPendentes > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">
                {pedidosExternosPendentes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="aprovacoes" 
            className="data-[state=active]:bg-orange-600 data-[state=active]:text-white relative"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Central de Aprovações
            {pedidos.filter(p => p.status_aprovacao === "pendente").length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white animate-pulse">
                {pedidos.filter(p => p.status_aprovacao === "pendente").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="tabelas-preco" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Tabelas de Preço
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes">
          <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
            <ClientesTab 
              clientes={clientes} 
              isLoading={loadingClientes} 
              onViewCliente={(cliente) => {
                setClienteParaPainel(cliente);
                setPainelClienteAberto(true);
              }}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="pedidos">
          <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
            <PedidosTab 
              pedidos={pedidosFiltrados} 
              clientes={clientesFiltrados} 
              isLoading={loadingPedidos} 
              empresas={empresas}
              onCreatePedido={handleCreateNewPedido}
              onEditPedido={handleEditPedido}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="entrega">
          <PedidosEntregaTab windowMode={false} />
        </TabsContent>

        <TabsContent value="retirada">
          <PedidosRetiradaTab windowMode={false} />
        </TabsContent>

        {/* Removed TabelasPrecoTab TabsContent */}

        <TabsContent value="comissoes">
          <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
            <ComissoesTab comissoes={comissoes} pedidos={pedidos} empresas={empresas} />
          </Suspense>
        </TabsContent>

        <TabsContent value="notas">
          <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
            <NotasFiscaisTab 
               notasFiscais={notasFiscaisFiltradas} 
               pedidos={pedidosFiltrados} 
               clientes={clientesFiltrados}
               onCreateNFe={() => openWindow(
                NotaFiscalFormCompleto,
                { 
                  windowMode: true,
                  onSubmit: async (formData) => {
                    try {
                      const nf = await base44.entities.NotaFiscal.create({
                        ...formData,
                        group_id: formData.group_id || grupoAtual?.id,
                        empresa_faturamento_id: formData.empresa_faturamento_id || empresaAtual?.id,
                      });
                      await base44.entities.AuditLog.create({
                        usuario: user?.full_name || user?.email || 'Usuário',
                        usuario_id: user?.id,
                        empresa_id: empresaAtual?.id,
                        empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || '',
                        acao: 'Criação',
                        modulo: 'Fiscal',
                        entidade: 'NotaFiscal',
                        registro_id: nf.id,
                        descricao: `NF ${nf.numero || ''}/${nf.serie || ''} criada`,
                      });
                      toast.success("✅ NF-e salva com sucesso!");
                      queryClient.invalidateQueries({ queryKey: ['notasFiscais'] });
                    } catch (error) {
                      toast.error("Erro ao salvar NF-e: " + error.message);
                    }
                  },
                  onCancel: () => {}
                },
                {
                  title: '📄 Nova NF-e',
                  width: 1200,
                  height: 750
                }
              )}
            />
          </Suspense>
        </TabsContent>

        {/* NOVO: Conteúdo Tab Vendas Externas */}
        <TabsContent value="externos">
          <Card>
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle>Pedidos de Marketplaces e Sistemas Externos</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                Valide e importe pedidos recebidos de Mercado Livre, Shopee, Amazon, Site e API.
              </p>
              {pedidosExternos.length > 0 ? (
                <div className="space-y-3">
                  {pedidosExternos.map(pe => (
                    <div key={pe.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{pe.numero_pedido_externo}</p>
                          <p className="text-sm text-slate-600">{pe.cliente_nome}</p>
                          <p className="text-xs text-slate-500">
                            {pe.origem} • R$ {pe.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {pe.status_importacao}
                          </Badge>
                          {pe.status_importacao === 'A Validar' && (
                            <Button size="sm">
                              Validar e Importar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum pedido externo pendente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* V21.5: Central de Aprovações Unificada */}
        <TabsContent value="aprovacoes">
          <CentralAprovacoesManager windowMode={false} />
        </TabsContent>

        <TabsContent value="tabelas-preco">
          <Suspense fallback={<div className="h-40 rounded-md bg-slate-100 animate-pulse" />}>
            <TabelasPrecoTab tabelasPreco={tabelasPreco} />
          </Suspense>
        </TabsContent>
      </Tabs>

      <PainelDinamicoCliente
        cliente={clienteParaPainel}
        isOpen={painelClienteAberto}
        onClose={() => {
          setPainelClienteAberto(false);
          setClienteParaPainel(null);
        }}
      />
    </div>
  );
}