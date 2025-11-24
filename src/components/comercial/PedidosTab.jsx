import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit2, 
  FileText, 
  Truck, 
  CheckCircle2, 
  Factory, 
  Eye, 
  Trash2,
  ShieldCheck,
  AlertCircle,
  Clock,
  XCircle,
  Printer
} from "lucide-react";
import { ImprimirPedido } from "@/components/lib/impressao";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "../StatusBadge";
import SearchInput from "../ui/SearchInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWindow } from "@/components/lib/useWindow";
import AprovacaoDescontosManager from "./AprovacaoDescontosManager";

export default function PedidosTab({ pedidos, clientes, isLoading, empresas, onCreatePedido, onEditPedido }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pedido.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({ title: "✅ Pedido excluído!" });
    },
  });

  const filteredPedidos = pedidos.filter(p => {
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    const matchSearch = p.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ETAPA 4: Estatísticas de aprovação
  const pedidosPendentesAprovacao = pedidos.filter(p => p.status_aprovacao === "pendente");
  const pedidosAprovados = pedidos.filter(p => p.status_aprovacao === "aprovado");
  const pedidosNegados = pedidos.filter(p => p.status_aprovacao === "negado");

  return (
    <div className="space-y-6">
      {/* ALERTA DE APROVAÇÕES PENDENTES */}
      {pedidosPendentesAprovacao.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-orange-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {pedidosPendentesAprovacao.length} pedido(s) aguardando aprovação de desconto
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Pedidos com descontos acima da margem mínima precisam de aprovação do gestor
              </p>
            </div>
            <Button
              onClick={() => openWindow(AprovacaoDescontosManager, { windowMode: true }, {
                title: '🔐 Aprovação de Descontos',
                width: 1200,
                height: 700
              })}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Gerenciar Aprovações
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ESTATÍSTICAS DE APROVAÇÃO */}
      {(pedidosAprovados.length > 0 || pedidosNegados.length > 0 || pedidosPendentesAprovacao.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Pendentes Aprovação</p>
                <p className="text-2xl font-bold text-orange-900">{pedidosPendentesAprovacao.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Descontos Aprovados</p>
                <p className="text-2xl font-bold text-green-900">{pedidosAprovados.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Descontos Negados</p>
                <p className="text-2xl font-bold text-red-900">{pedidosNegados.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onCreatePedido}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por número ou cliente..."
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
                <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Faturado">Faturado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Lista de Pedidos ({filteredPedidos.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aprovação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPedidos.map((pedido) => (
                  <TableRow key={pedido.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                    <TableCell>{pedido.cliente_nome}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={pedido.status} size="sm" />
                    </TableCell>
                    <TableCell>
                      {pedido.status_aprovacao === "pendente" && (
                        <Badge className="bg-orange-100 text-orange-700">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                      {pedido.status_aprovacao === "aprovado" && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Aprovado
                        </Badge>
                      )}
                      {pedido.status_aprovacao === "negado" && (
                        <Badge className="bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Negado
                        </Badge>
                      )}
                      {(!pedido.status_aprovacao || pedido.status_aprovacao === "não exigida") && (
                        <Badge variant="outline" className="text-xs">-</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEditPedido(pedido)}
                          title="Editar Pedido"
                          className="h-8 px-2"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          <span className="text-xs">Editar</span>
                        </Button>
                        
                        {pedido.status === "Aprovado" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({ title: "🚀 Gerando NF-e..." });
                            }}
                            title="Gerar NF-e"
                            className="h-8 px-2 text-green-600"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            <span className="text-xs">NF-e</span>
                          </Button>
                        )}

                        {pedido.status === "Faturado" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({ title: "📦 Criando entrega..." });
                            }}
                            title="Criar Entrega"
                            className="h-8 px-2 text-blue-600"
                          >
                            <Truck className="w-3 h-3 mr-1" />
                            <span className="text-xs">Entrega</span>
                          </Button>
                        )}

                        {(pedido.tipo_pedido === "Produção Sob Medida" || pedido.itens_corte_dobra?.length > 0 || pedido.itens_armado_padrao?.length > 0) && pedido.status !== "Cancelado" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({ title: "🏭 Criando OP..." });
                            }}
                            title="Gerar Ordem de Produção"
                            className="h-8 px-2 text-purple-600"
                          >
                            <Factory className="w-3 h-3 mr-1" />
                            <span className="text-xs">OP</span>
                          </Button>
                        )}

                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const empresa = empresas?.find(e => e.id === pedido.empresa_id);
                            ImprimirPedido({ pedido, empresa });
                          }}
                          title="Imprimir Pedido"
                          className="h-8 px-2 text-slate-600"
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          <span className="text-xs">Imprimir</span>
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEditPedido(pedido)}
                          title="Visualizar"
                          className="h-8 px-2"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          <span className="text-xs">Ver</span>
                        </Button>

                        {pedido.status_aprovacao === "pendente" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openWindow(AprovacaoDescontosManager, { windowMode: true }, {
                              title: '🔐 Aprovação de Descontos',
                              width: 1200,
                              height: 700
                            })}
                            title="Aprovar Desconto"
                            className="h-8 px-2 text-orange-600 animate-pulse"
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            <span className="text-xs">Aprovar</span>
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (confirm("Excluir pedido?")) {
                              deleteMutation.mutate(pedido.id);
                            }
                          }}
                          title="Excluir"
                          className="h-8 px-2 text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          <span className="text-xs">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPedidos.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum pedido encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}