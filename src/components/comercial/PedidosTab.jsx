import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BadgeOrigemPedido from "./BadgeOrigemPedido";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  Printer,
  Download
} from "lucide-react";
import { ImprimirPedido } from "@/components/lib/impressao";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "../StatusBadge";
import SearchInput from "../ui/SearchInput";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWindow } from "@/components/lib/useWindow";
import CentralAprovacoesManager from "./CentralAprovacoesManager";
import AutomacaoFluxoPedido from "./AutomacaoFluxoPedido";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function PedidosTab({ pedidos: pedidosProp, clientes: clientesProp, isLoading: isLoadingProp, empresas: empresasProp, onCreatePedido, onEditPedido, empresaId = null }) {
  const { empresaAtual } = useContextoVisual();

  const { data: pedidos = pedidosProp || [] } = useQuery({
    queryKey: ['pedidos', empresaAtual?.id],
    queryFn: async () => {
      if (!empresaAtual?.id) return pedidosProp || [];
      return await base44.entities.Pedido.list('-created_date', 1000);
    },
    initialData: pedidosProp || [],
    staleTime: 30000,
    enabled: !!empresaAtual?.id || pedidosProp?.length > 0
  });

  const { data: clientes = clientesProp || [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id],
    queryFn: async () => {
      if (!empresaAtual?.id) return clientesProp || [];
      return await base44.entities.Cliente.list('-created_date', 1000);
    },
    initialData: clientesProp || [],
    staleTime: 30000,
    enabled: !!empresaAtual?.id || clientesProp?.length > 0
  });

  const { data: empresas = empresasProp || [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
    initialData: empresasProp || [],
    staleTime: 60000,
    enabled: true
  });

  const isLoading = !pedidosProp && !pedidos.length;
  // V21.6: Multi-empresa
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openWindow, closeWindow } = useWindow();

  // Seleção em massa + exportação
  const [selectedPedidos, setSelectedPedidos] = useState([]);
  const togglePedido = (id) => setSelectedPedidos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllPedidos = (checked, lista) => setSelectedPedidos(checked ? lista.map(p => p.id) : []);
  const exportarPedidosCSV = (lista) => {
    const headers = ['numero_pedido','cliente_nome','empresa_id','data_pedido','valor_total','status','status_aprovacao'];
    const csv = [
      headers.join(','),
      ...lista.map(p => headers.map(h => JSON.stringify(p[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Pedido.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({ title: "✅ Pedido excluído!" });
    },
  });

  const filteredPedidos = pedidos.filter(p => {
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      p.numero_pedido?.toLowerCase().includes(searchLower) ||
      p.cliente_nome?.toLowerCase().includes(searchLower) ||
      p.vendedor?.toLowerCase().includes(searchLower) ||
      p.tipo_pedido?.toLowerCase().includes(searchLower) ||
      p.origem_pedido?.toLowerCase().includes(searchLower) ||
      p.status?.toLowerCase().includes(searchLower) ||
      p.observacoes_publicas?.toLowerCase().includes(searchLower) ||
      p.observacoes_internas?.toLowerCase().includes(searchLower) ||
      p.indicador_nome?.toLowerCase().includes(searchLower) ||
      p.obra_destino_nome?.toLowerCase().includes(searchLower);
    const matchEmpresa = !empresaId || p.empresa_id === empresaId;
    return matchStatus && matchSearch && matchEmpresa;
  });

  // ETAPA 4: Estatísticas de aprovação
  const pedidosPendentesAprovacao = pedidos.filter(p => p.status_aprovacao === "pendente");
  const pedidosAprovados = pedidos.filter(p => p.status_aprovacao === "aprovado");
  const pedidosNegados = pedidos.filter(p => p.status_aprovacao === "negado");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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
              placeholder="Buscar por número, cliente, vendedor, tipo, origem, status..."
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
          {selectedPedidos.length > 0 && (
            <Alert className="m-4 border-blue-300 bg-blue-50">
              <AlertDescription className="flex items-center justify-between">
                <div className="text-blue-900 font-semibold">{selectedPedidos.length} pedido(s) selecionado(s)</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportarPedidosCSV(filteredPedidos.filter(p => selectedPedidos.includes(p.id)))}>
                    <Download className="w-4 h-4 mr-2" /> Exportar CSV
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedPedidos([])}>Limpar Seleção</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nº Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aprovação</TableHead>
                  <TableHead className="min-w-[320px]">Ações Rápidas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPedidos.map((pedido) => (
                  <TableRow key={pedido.id} className="hover:bg-slate-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedPedidos.includes(pedido.id)}
                        onCheckedChange={() => togglePedido(pedido.id)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                    <TableCell>{pedido.cliente_nome}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <BadgeOrigemPedido origemPedido={pedido.origem_pedido} showLock={true} />
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        pedido.status === 'Entregue' ? 'bg-green-600 text-white' :
                        pedido.status === 'Em Trânsito' ? 'bg-purple-600 text-white' :
                        pedido.status === 'Em Expedição' ? 'bg-orange-600 text-white' :
                        pedido.status === 'Faturado' ? 'bg-blue-600 text-white' :
                        pedido.status === 'Pronto para Faturar' ? 'bg-indigo-600 text-white' :
                        pedido.status === 'Aprovado' ? 'bg-green-500 text-white' :
                        pedido.status === 'Aguardando Aprovação' ? 'bg-yellow-500 text-white' :
                        pedido.status === 'Cancelado' ? 'bg-red-600 text-white' :
                        'bg-slate-500 text-white'
                      }>
                        {pedido.status === 'Entregue' ? '🎉 Entregue' :
                         pedido.status === 'Em Trânsito' ? '🛣️ Em Trânsito' :
                         pedido.status === 'Em Expedição' ? '🚚 Em Expedição' :
                         pedido.status === 'Faturado' ? '📄 Faturado' :
                         pedido.status === 'Pronto para Faturar' ? '📦 Pronto p/ Faturar' :
                         pedido.status === 'Aprovado' ? '✅ Aprovado' :
                         pedido.status === 'Aguardando Aprovação' ? '⏳ Aguardando' :
                         pedido.status === 'Cancelado' ? '❌ Cancelado' :
                         '📝 ' + pedido.status}
                      </Badge>
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
                            onClick={() => {
                              const windowId = openWindow(
                                AutomacaoFluxoPedido,
                                { 
                                  pedido,
                                  empresaId: pedido.empresa_id,
                                  windowMode: true,
                                  onComplete: (resultados) => {
                                    queryClient.invalidateQueries({ queryKey: ['pedidos'] });
                                    queryClient.invalidateQueries({ queryKey: ['produtos'] });
                                    queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
                                    queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
                                    queryClient.invalidateQueries({ queryKey: ['entregas'] });
                                    toast({ title: "✅ Pedido fechado com sucesso!" });
                                    
                                    // Fechar janela após sucesso
                                    setTimeout(() => {
                                      if (windowId) closeWindow(windowId);
                                    }, 2500);
                                  }
                                },
                                {
                                  title: `🚀 Automação - Pedido ${pedido.numero_pedido}`,
                                  width: 1200,
                                  height: 700
                                }
                              );
                            }}
                            title="Fechar Pedido Automaticamente (Estoque + Financeiro + Logística)"
                            className="h-8 px-2 bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 font-semibold shadow-lg"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            <span className="text-xs">🚀 Fechar Pedido</span>
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