import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Printer, FileText, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PedidoFormCompleto from "./PedidoFormCompleto";
import { BuscadorUniversal, useBuscaUniversal } from "@/components/lib/BuscadorUniversal";

export default function PedidosTab({ pedidos, clientes, isLoading, empresas }) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { searchTerm, setSearchTerm, filtrarLista } = useBuscaUniversal();
  
  const pedidosFiltrados = filtrarLista(pedidos);

  const statusColors = {
    'Rascunho': 'bg-slate-100 text-slate-700',
    'Aguardando Aprovação': 'bg-yellow-100 text-yellow-700',
    'Aprovado': 'bg-green-100 text-green-700',
    'Em Produção': 'bg-blue-100 text-blue-700',
    'Pronto para Faturar': 'bg-purple-100 text-purple-700',
    'Faturado': 'bg-emerald-100 text-emerald-700',
    'Cancelado': 'bg-red-100 text-red-700'
  };

  const handleNovoPedido = () => {
    setPedidoSelecionado(null);
    setDialogAberto(true);
  };

  const handleEditarPedido = (pedido) => {
    setPedidoSelecionado(pedido);
    setDialogAberto(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <BuscadorUniversal
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalResultados={pedidosFiltrados.length}
          placeholder="🔍 Buscar pedidos: número, cliente, produto, cidade, vendedor..."
          showAlert={false}
        />
        <Button onClick={handleNovoPedido} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosFiltrados.map((pedido) => (
                <TableRow key={pedido.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono font-medium">{pedido.numero_pedido}</TableCell>
                  <TableCell>{pedido.cliente_nome}</TableCell>
                  <TableCell className="text-sm">
                    {pedido.data_pedido ? new Date(pedido.data_pedido).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[pedido.status] || 'bg-slate-100'}>
                      {pedido.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditarPedido(pedido)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum pedido {searchTerm ? 'encontrado' : 'cadastrado'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {pedidoSelecionado ? 'Editar Pedido' : 'Novo Pedido'}
            </DialogTitle>
          </DialogHeader>
          <PedidoFormCompleto
            pedido={pedidoSelecionado}
            onClose={() => setDialogAberto(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['pedidos'] });
              setDialogAberto(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}