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
import CentralAprovacoesManager from "./CentralAprovacoesManager";

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
      {/* ETAPA 4: ALERTA DE APROVAÇÕES PENDENTES */}
      {pedidosPendentesAprovacao.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-orange-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {pedidosPendentesAprovacao.length} pedido(s) aguardando aprovação
                </p>
                <p className="text-xs text-orange-700 mt-1">
                Pedidos com descontos ou outras pendências financeiras aguardam sua análise.
                </p>
                </div>
                <Button
                onClick={() => openWindow(CentralAprovacoesManager, { windowMode: true }, {
                title: '🔐 Central de Aprovações',
                width: 1200,
                height: 700
                })}
                className="bg-orange-600 hover:bg-orange-600/90"
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
              <SelectContent className="z-[99999]">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Rascunho">Rascunho</SelectItem>
                <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pronto para Faturar">Pronto para Faturar</SelectItem>
                <SelectItem value="Faturado">Faturado</SelectItem>
                <SelectItem value="Em Expedição">Em Expedição</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
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
                  <TableHead className="min-w-[180px]">Status (Clique p/ Mudar)</TableHead>
                  <TableHead>Aprovação</TableHead>
                  <TableHead className="min-w-[320px]">Ações Rápidas</TableHead>
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
                     <Select 
                       value={pedido.status} 
                       onValueChange={async (novoStatus) => {
                         try {
                           // V21.5: BAIXAR ESTOQUE AUTOMATICAMENTE AO APROVAR
                           if (novoStatus === 'Aprovado' && pedido.itens_revenda?.length > 0) {
                             for (const item of pedido.itens_revenda) {
                               if (item.produto_id) {
                                 const produtos = await base44.entities.Produto.filter({ 
                                   id: item.produto_id,
                                   empresa_id: pedido.empresa_id 
                                 });

                                 const produto = produtos[0];
                                 if (produto && (produto.estoque_atual || 0) >= (item.quantidade || 0)) {
                                   const novoEstoque = (produto.estoque_atual || 0) - (item.quantidade || 0);

                                   // Criar movimentação
                                   await base44.entities.MovimentacaoEstoque.create({
                                     empresa_id: pedido.empresa_id,
                                     tipo_movimento: "saida",
                                     origem_movimento: "pedido",
                                     origem_documento_id: pedido.id,
                                     produto_id: item.produto_id,
                                     produto_descricao: item.descricao || item.produto_descricao,
                                     codigo_produto: item.codigo_sku,
                                     quantidade: item.quantidade,
                                     unidade_medida: item.unidade,
                                     estoque_anterior: produto.estoque_atual || 0,
                                     estoque_atual: novoEstoque,
                                     data_movimentacao: new Date().toISOString(),
                                     documento: pedido.numero_pedido,
                                     motivo: `Baixa automática - Pedido aprovado`,
                                     responsavel: "Sistema Automático",
                                     aprovado: true
                                   });

                                   // Atualizar estoque do produto
                                   await base44.entities.Produto.update(item.produto_id, {
                                     estoque_atual: novoEstoque
                                   });
                                 }
                               }
                             }
                             toast({ title: `✅ Pedido aprovado e estoque baixado!` });
                           } else {
                             toast({ title: `✅ Status alterado para: ${novoStatus}` });
                           }

                           await base44.entities.Pedido.update(pedido.id, { status: novoStatus });
                           queryClient.invalidateQueries({ queryKey: ['pedidos'] });
                           queryClient.invalidateQueries({ queryKey: ['produtos'] });
                           queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
                         } catch (error) {
                           toast({ title: "❌ Erro ao alterar status", variant: "destructive" });
                         }
                       }}
                     >
                       <SelectTrigger className="w-[180px] h-8">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="z-[99999]">
                         <SelectItem value="Rascunho">📝 Rascunho</SelectItem>
                         <SelectItem value="Aguardando Aprovação">⏳ Aguardando Aprovação</SelectItem>
                         <SelectItem value="Aprovado">✅ Aprovado</SelectItem>
                         <SelectItem value="Pronto para Faturar">📦 Pronto para Faturar</SelectItem>
                         <SelectItem value="Faturado">📄 Faturado</SelectItem>
                         <SelectItem value="Em Expedição">🚚 Em Expedição</SelectItem>
                         <SelectItem value="Em Trânsito">🛣️ Em Trânsito</SelectItem>
                         <SelectItem value="Entregue">🎉 Entregue</SelectItem>
                         <SelectItem value="Cancelado">❌ Cancelado</SelectItem>
                       </SelectContent>
                     </Select>
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
                        {pedido.status === "Rascunho" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              try {
                                // V21.5: BAIXAR ESTOQUE AO APROVAR
                                if (pedido.itens_revenda?.length > 0) {
                                  for (const item of pedido.itens_revenda) {
                                    if (item.produto_id) {
                                      const produtos = await base44.entities.Produto.filter({ 
                                        id: item.produto_id,
                                        empresa_id: pedido.empresa_id 
                                      });
                                      
                                      const produto = produtos[0];
                                      if (produto && (produto.estoque_atual || 0) >= (item.quantidade || 0)) {
                                        const novoEstoque = (produto.estoque_atual || 0) - (item.quantidade || 0);
                                        
                                        // Criar movimentação
                                        await base44.entities.MovimentacaoEstoque.create({
                                          empresa_id: pedido.empresa_id,
                                          tipo_movimento: "saida",
                                          origem_movimento: "pedido",
                                          origem_documento_id: pedido.id,
                                          produto_id: item.produto_id,
                                          produto_descricao: item.descricao || item.produto_descricao,
                                          codigo_produto: item.codigo_sku,
                                          quantidade: item.quantidade,
                                          unidade_medida: item.unidade,
                                          estoque_anterior: produto.estoque_atual || 0,
                                          estoque_atual: novoEstoque,
                                          data_movimentacao: new Date().toISOString(),
                                          documento: pedido.numero_pedido,
                                          motivo: `Baixa automática - Aprovação rápida`,
                                          responsavel: "Sistema Automático",
                                          aprovado: true
                                        });
                                        
                                        // Atualizar estoque do produto
                                        await base44.entities.Produto.update(item.produto_id, {
                                          estoque_atual: novoEstoque
                                        });
                                      }
                                    }
                                  }
                                }
                                
                                await base44.entities.Pedido.update(pedido.id, { status: 'Aprovado' });
                                toast({ title: "✅ Pedido aprovado e estoque baixado!" });
                                queryClient.invalidateQueries({ queryKey: ['pedidos'] });
                                queryClient.invalidateQueries({ queryKey: ['produtos'] });
                                queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
                              } catch (error) {
                                toast({ title: "❌ Erro ao aprovar", variant: "destructive" });
                              }
                            }}
                            title="Aprovar Pedido e Baixar Estoque"
                            className="h-8 px-2 bg-green-50 text-green-700 hover:bg-green-100 font-semibold"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            <span className="text-xs">Aprovar</span>
                          </Button>
                        )}
                        
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
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  await base44.entities.Pedido.update(pedido.id, {
                                    status: 'Pronto para Faturar'
                                  });
                                  toast({ title: "✅ Pedido fechado para entrega!" });
                                  queryClient.invalidateQueries({ queryKey: ['pedidos'] });
                                } catch (error) {
                                  toast({ title: "❌ Erro ao fechar pedido", variant: "destructive" });
                                }
                              }}
                              title="Fechar Pedido e Enviar para Entrega"
                              className="h-8 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200"
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              <span className="text-xs">🚚 Fechar p/ Entrega</span>
                            </Button>
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
                          </>
                        )}

                        {pedido.status === "Pronto para Faturar" && (
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
                            onClick={() => openWindow(CentralAprovacoesManager, { windowMode: true, initialTab: "descontos" }, {
                              title: '🔐 Central de Aprovações',
                              width: 1200,
                              height: 700
                            })}
                            title="Analisar Aprovação"
                            className="h-8 px-2 text-orange-600 animate-pulse"
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            <span className="text-xs">Analisar</span>
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