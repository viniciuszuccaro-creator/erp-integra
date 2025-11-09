import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Eye, Edit2, FileText, Truck, Package, Building2, Globe, ShoppingCart, MessageCircle, Smartphone, Printer } from "lucide-react";
import { toast } from "sonner";
import PedidoFormCompleto from "./PedidoFormCompleto";
import GerarNFeModal from "./GerarNFeModal";
import GerarOPModal from "./GerarOPModal";
import PainelEntregasPedido from "./PainelEntregasPedido";
import useContextoVisual from "@/components/lib/useContextoVisual";
import SearchInput from "@/components/ui/SearchInput";
import MotorRecomendacao from './MotorRecomendacao';
import NotificacoesAutomaticas from '../sistema/NotificacoesAutomaticas';
import ExportButton from '../ExportButton';
import { exportarPedidosExcel } from '../lib/exportacaoExcel';
import { ImprimirPedido } from '@/components/lib/impressao';

export default function PedidosTab({ pedidos, clientes, isLoading, empresas = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [origemFilter, setOrigemFilter] = useState("todos");
  const [escopoFilter, setEscopoFilter] = useState("esta-empresa");
  const [pedidoDialogOpen, setPedidoDialogOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [nfeModal, setNfeModal] = useState(null);
  const [opModal, setOpModal] = useState(null);
  const [entregasModal, setEntregasModal] = useState(null);
  
  const queryClient = useQueryClient();
  const { empresaAtual, empresasDoGrupo, estaNoGrupo } = useContextoVisual();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Pedido.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setPedidoDialogOpen(false);
      setEditingPedido(null);
      toast.success("✅ Pedido criado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Pedido.update(id, data),
    onSuccess: async (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setPedidoDialogOpen(false);
      setEditingPedido(null);
      toast.success("✅ Pedido atualizado!");

      const pedidoAtualizado = await base44.entities.Pedido.get(variables.id);
      
      if (variables.data.status === 'Aprovado' && pedidoAtualizado.status === 'Aprovado') {
        await NotificacoesAutomaticas.notificarPedidoAprovado(pedidoAtualizado);
      }
    },
  });

  const handleEdit = (pedido) => {
    setEditingPedido(pedido);
    setPedidoDialogOpen(true);
  };

  const handleImprimirPedido = (pedido) => {
    ImprimirPedido({ 
      pedido, 
      empresa: empresas.find(e => e.id === pedido.empresa_id) 
    });
  };

  const filtrarPorEscopo = (pedido) => {
    if (!estaNoGrupo) return true;

    if (escopoFilter === 'esta-empresa') {
      return pedido.empresa_id === empresaAtual?.id;
    } else if (escopoFilter === 'empresas-gerencio') {
      const empresasIds = empresasDoGrupo.map(e => e.id);
      return empresasIds.includes(pedido.empresa_id);
    } else if (escopoFilter === 'grupo-completo') {
      return true;
    }
    return true;
  };

  const pedidosFiltrados = pedidos
    .filter(p => 
      (p.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
       p.numero_pedido?.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "todos" || p.status === statusFilter) &&
      (origemFilter === "todos" || p.origem_pedido === origemFilter) &&
      filtrarPorEscopo(p)
    );

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '-';
  };

  const getStatusColor = (status) => {
    const cores = {
      'Rascunho': 'bg-slate-100 text-slate-800 border border-slate-300',
      'Aguardando Aprovação': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'Aprovado': 'bg-green-100 text-green-800 border border-green-300',
      'Em Produção': 'bg-blue-100 text-blue-800 border border-blue-300',
      'Pronto para Faturar': 'bg-cyan-100 text-cyan-800 border border-cyan-300',
      'Faturado': 'bg-purple-100 text-purple-800 border border-purple-300',
      'Em Expedição': 'bg-orange-100 text-orange-800 border border-orange-300',
      'Em Trânsito': 'bg-indigo-100 text-indigo-800 border border-indigo-300',
      'Entregue': 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      'Cancelado': 'bg-red-100 text-red-800 border border-red-300',
      'Orçamento': 'bg-amber-100 text-amber-800 border border-amber-300'
    };
    return cores[status] || 'bg-slate-100 text-slate-800 border border-slate-300';
  };

  const StatusBadge = ({ status }) => (
    <Badge className={getStatusColor(status)}>
      {status}
    </Badge>
  );

  const getOrigemIcon = (origem) => {
    const icones = {
      'Manual': ShoppingCart,
      'Portal': Globe,
      'Site': Globe,
      'Chatbot': MessageCircle,
      'WhatsApp': MessageCircle,
      'Marketplace': Smartphone,
      'API': Smartphone
    };
    return icones[origem] || ShoppingCart;
  };

  const getOrigemColor = (origem) => {
    const cores = {
      'Manual': 'bg-slate-100 text-slate-700',
      'Portal': 'bg-blue-100 text-blue-700',
      'Site': 'bg-purple-100 text-purple-700',
      'Chatbot': 'bg-green-100 text-green-700',
      'WhatsApp': 'bg-green-100 text-green-700',
      'Marketplace': 'bg-orange-100 text-orange-700',
      'API': 'bg-indigo-100 text-indigo-700'
    };
    return cores[origem] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <div className="flex gap-3">
          <ExportButton
            data={pedidosFiltrados}
            filename="pedidos"
            columns={[
              { key: 'numero_pedido', header: 'Número' },
              { key: 'cliente_nome', header: 'Cliente' },
              { key: 'data_pedido', header: 'Data' },
              { key: 'valor_total', header: 'Valor Total' },
              { key: 'status', header: 'Status' }
            ]}
          />
          <Button 
            onClick={() => {
              setEditingPedido(null);
              setPedidoDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {estaNoGrupo && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Building2 className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900">Filtro de Escopo</p>
                <p className="text-xs text-purple-700">Escolha quais pedidos visualizar</p>
              </div>
              <Select value={escopoFilter} onValueChange={setEscopoFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="esta-empresa">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Apenas Esta Empresa
                    </span>
                  </SelectItem>
                  <SelectItem value="empresas-gerencio">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Empresas que Gerencio ({empresasDoGrupo.length})
                    </span>
                  </SelectItem>
                  <SelectItem value="grupo-completo">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Grupo Completo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por número ou cliente..."
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="Rascunho">Rascunho</SelectItem>
            <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
            <SelectItem value="Aprovado">Aprovado</SelectItem>
            <SelectItem value="Em Produção">Em Produção</SelectItem>
            <SelectItem value="Pronto para Faturar">Pronto para Faturar</SelectItem>
            <SelectItem value="Faturado">Faturado</SelectItem>
            <SelectItem value="Em Expedição">Em Expedição</SelectItem>
            <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
            <SelectItem value="Entregue">Entregue</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={origemFilter} onValueChange={setOrigemFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as Origens</SelectItem>
            <SelectItem value="Manual">Manual (ERP)</SelectItem>
            <SelectItem value="Portal">Portal Cliente</SelectItem>
            <SelectItem value="Site">Site/Base</SelectItem>
            <SelectItem value="Chatbot">Chatbot</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Marketplace">Marketplace</SelectItem>
            <SelectItem value="API">API Externa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Lista de Pedidos ({pedidosFiltrados.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Origem</TableHead>
                  {estaNoGrupo && <TableHead>Empresa</TableHead>}
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosFiltrados.map((pedido) => {
                  const OrigemIcon = getOrigemIcon(pedido.origem_pedido);
                  
                  return (
                    <TableRow key={pedido.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{pedido.numero_pedido}</TableCell>
                      <TableCell>{pedido.cliente_nome}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getOrigemColor(pedido.origem_pedido)}>
                          <OrigemIcon className="w-3 h-3 mr-1" />
                          {pedido.origem_pedido || 'Manual'}
                        </Badge>
                      </TableCell>
                      {estaNoGrupo && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-purple-600" />
                            <span className="text-xs">{pedido._empresa_label || obterNomeEmpresa(pedido.empresa_id)}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="font-semibold text-green-600">
                        R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={pedido.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(pedido)}
                            title="Editar Pedido"
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleImprimirPedido(pedido)}
                            title="Imprimir Pedido"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setNfeModal(pedido)}
                            title="Gerar NF-e"
                          >
                            <FileText className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setOpModal(pedido)}
                            title="Gerar OP"
                          >
                            <Package className="w-4 h-4 text-orange-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setEntregasModal(pedido)}
                            title="Ver Entregas"
                          >
                            <Truck className="w-4 h-4 text-purple-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum pedido encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={pedidoDialogOpen} onOpenChange={setPedidoDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[95vh] p-0 overflow-hidden">
          <PedidoFormCompleto
            pedido={editingPedido}
            clientes={clientes}
            onSubmit={(data) => {
              if (editingPedido) {
                updateMutation.mutate({ id: editingPedido.id, data });
              } else {
                createMutation.mutate(data);
              }
            }}
            onCancel={() => {
              setPedidoDialogOpen(false);
              setEditingPedido(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {nfeModal && (
        <GerarNFeModal
          pedido={nfeModal}
          isOpen={!!nfeModal}
          onClose={() => setNfeModal(null)}
        />
      )}

      {opModal && (
        <GerarOPModal
          pedido={opModal}
          isOpen={!!opModal}
          onClose={() => setOpModal(null)}
        />
      )}

      {entregasModal && (
        <PainelEntregasPedido
          pedido={entregasModal}
          isOpen={!!entregasModal}
          onClose={() => setEntregasModal(null)}
        />
      )}
    </div>
  );
}