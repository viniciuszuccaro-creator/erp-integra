import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ShoppingCart, FileText, TrendingUp, DollarSign, AlertCircle, Printer, Search, Plus } from "lucide-react";
import ClientesTab from "../components/comercial/ClientesTab";
import PedidosTab from "../components/comercial/PedidosTab";
import ComissoesTab from "../components/comercial/ComissoesTab";
import NotasFiscaisTab from "../components/comercial/NotasFiscaisTab";
import TabelasPrecoTab from "../components/comercial/TabelasPrecoTab"; // Keeping import as outline didn't specify removal
import PainelDinamicoCliente from "../components/cadastros/PainelDinamicoCliente";
import usePermissions from "@/components/lib/usePermissions";

import { useKeyboardShortcuts } from '@/components/lib/keyboardShortcuts';
import { Skeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import ExportButton from '@/components/ExportButton';
import { ImprimirPedido } from '@/components/lib/impressao';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import PedidoFormCompleto from "../components/comercial/PedidoFormCompleto";

/**
 * Módulo Comercial - V12.0 COMPLETO
 * Com atalhos, exportação e impressão
 */
export default function Comercial() {
  const [activeTab, setActiveTab] = useState("clientes");
  const [painelClienteAberto, setPainelClienteAberto] = useState(false);
  const [clienteParaPainel, setClienteParaPainel] = useState(null);

  // V21.1.2-R1: States for the PedidoFormCompleto dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);

  const { hasPermission, isLoading: loadingPermissions } = usePermissions();

  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list('-created_date'),
  });

  const pedidosQuery = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date'),
  });

  const { data: pedidos = [], isLoading: loadingPedidos } = pedidosQuery;

  const { data: comissoes = [] } = useQuery({
    queryKey: ['comissoes'],
    queryFn: () => base44.entities.Comissao.list(),
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notasFiscais'],
    queryFn: () => base44.entities.NotaFiscal.list('-created_date'),
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

  const pedidosExternosPendentes = pedidosExternos.filter(
    p => p.status_importacao === 'A Validar'
  ).length;

  const totalVendas = pedidos
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + (p.valor_total || 0), 0);

  const ticketMedio = pedidos.length > 0 ? totalVendas / pedidos.length : 0;

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

  // Handlers for PedidoFormCompleto
  const handleCreateNewPedido = () => {
    setEditingPedido(null); // For new order, no existing pedido
    setIsFormOpen(true);
  };

  const handleEditPedido = (pedido) => {
    setEditingPedido(pedido);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (formData.id) {
        // Update existing pedido
        await base44.entities.Pedido.update(formData.id, formData);
        toast.success("Pedido atualizado com sucesso!");
      } else {
        // Create new pedido
        await base44.entities.Pedido.create(formData);
        toast.success("Pedido criado com sucesso!");
      }
      setIsFormOpen(false);
      setEditingPedido(null);
      pedidosQuery.refetch(); // Refetch pedidos data after submission
    } catch (error) {
      toast.error("Erro ao salvar pedido: " + error.message);
      console.error("Erro ao salvar pedido:", error);
    }
  };


  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto min-h-[calc(100vh-4rem)] max-w-full" style={{ width: '100%', maxWidth: '100%' }}> {/* ETAPA 1: w-full + inline */}
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
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Clientes</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{clientes.length}</div>
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
            <div className="text-3xl font-bold text-purple-600">{pedidos.length}</div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
        </TabsList>

        <TabsContent value="clientes">
          <ClientesTab 
            clientes={clientes} 
            isLoading={loadingClientes} 
            onViewCliente={(cliente) => {
              setClienteParaPainel(cliente);
              setPainelClienteAberto(true);
            }}
          />
        </TabsContent>

        <TabsContent value="pedidos">
          <PedidosTab 
            pedidos={pedidos} 
            clientes={clientes} 
            isLoading={loadingPedidos} 
            empresas={empresas} // Added empresas prop for printing or other order details
            onCreatePedido={handleCreateNewPedido} // Added prop to open new order form
            onEditPedido={handleEditPedido} // Added prop to open edit order form
          />
        </TabsContent>

        {/* Removed TabelasPrecoTab TabsContent */}

        <TabsContent value="comissoes">
          <ComissoesTab comissoes={comissoes} pedidos={pedidos} />
        </TabsContent>

        <TabsContent value="notas">
          <NotasFiscaisTab notasFiscais={notasFiscais} pedidos={pedidos} clientes={clientes} />
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
      </Tabs>

      <PainelDinamicoCliente
        cliente={clienteParaPainel}
        isOpen={painelClienteAberto}
        onClose={() => {
          setPainelClienteAberto(false);
          setClienteParaPainel(null);
        }}
      />

      {/* V21.1.2-R1: MODAL COM TAMANHO FIXO GRANDE - MULTI-INSTÂNCIA */}
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) {
          setIsFormOpen(false);
          setEditingPedido(null);
        }
      }}>
        <DialogContent className="max-w-[90vw] max-h-[95vh] overflow-hidden flex flex-col p-0">
          <PedidoFormCompleto
            pedido={editingPedido}
            clientes={clientes}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingPedido(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}