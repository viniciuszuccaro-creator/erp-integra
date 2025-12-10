import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingDown,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWindow } from "@/components/lib/useWindow";
import AnalisePedidoAprovacao from "./AnalisePedidoAprovacao";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * 🔐 CENTRAL DE APROVAÇÕES V21.5
 * Gerenciamento unificado de aprovações (descontos, crédito, duplicatas)
 */
function CentralAprovacoesManager({ windowMode = false, initialTab = "descontos" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [aprovacaoDialogOpen, setAprovacaoDialogOpen] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [comentariosAprovacao, setComentariosAprovacao] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { openWindow } = useWindow();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date'),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const aprovarPedidoMutation = useMutation({
    mutationFn: async ({ pedidoId, dados }) => {
      const pedidosCompletos = await base44.entities.Pedido.filter({ id: pedidoId });
      const pedido = pedidosCompletos[0];
      
      const itensRevendaAtualizados = [];
      const itensArmadoAtualizados = [];
      const itensCorteAtualizados = [];

      if (dados.itensAtualizados) {
        dados.itensAtualizados.forEach(item => {
          if (item.tipo === "Revenda") itensRevendaAtualizados.push(item);
          else if (item.tipo === "Armado Padrão") itensArmadoAtualizados.push(item);
          else if (item.tipo === "Corte e Dobra") itensCorteAtualizados.push(item);
        });
      }

      const itensRevenda = itensRevendaAtualizados.length > 0 ? itensRevendaAtualizados : (pedido.itens_revenda || []);
      
      // BAIXAR ESTOQUE AUTOMATICAMENTE
      if (itensRevenda.length > 0) {
        for (const item of itensRevenda) {
          if (item.produto_id) {
            const produtos = await base44.entities.Produto.filter({ 
              id: item.produto_id,
              empresa_id: pedido.empresa_id 
            });
            
            const produto = produtos[0];
            if (produto && (produto.estoque_atual || 0) >= (item.quantidade || 0)) {
              const novoEstoque = (produto.estoque_atual || 0) - (item.quantidade || 0);
              
              await base44.entities.MovimentacaoEstoque.create({
                empresa_id: pedido.empresa_id,
                tipo_movimento: "saida",
                origem_movimento: "pedido",
                origem_documento_id: pedidoId,
                produto_id: item.produto_id,
                produto_descricao: item.descricao || item.produto_descricao,
                codigo_produto: item.codigo_sku,
                quantidade: item.quantidade,
                unidade_medida: item.unidade,
                estoque_anterior: produto.estoque_atual || 0,
                estoque_atual: novoEstoque,
                data_movimentacao: new Date().toISOString(),
                documento: pedido.numero_pedido,
                motivo: `Baixa automática - Aprovação de desconto`,
                responsavel: user?.full_name || "Sistema",
                aprovado: true
              });
              
              await base44.entities.Produto.update(item.produto_id, {
                estoque_atual: novoEstoque
              });
            }
          }
        }
      }

      await base44.entities.Pedido.update(pedidoId, {
        status_aprovacao: "aprovado",
        status: "Aprovado",
        usuario_aprovador_id: user?.id,
        data_aprovacao: new Date().toISOString(),
        desconto_aprovado_percentual: dados.descontoGeralPercentual || 0,
        desconto_geral_pedido_percentual: dados.descontoGeralPercentual || 0,
        desconto_geral_pedido_valor: dados.descontoGeralValor || 0,
        valor_total: dados.valorFinal || 0,
        margem_aplicada_vendedor: dados.margemMedia || 0,
        comentarios_aprovacao: dados.comentarios || "",
        ...(itensRevendaAtualizados.length > 0 && { itens_revenda: itensRevendaAtualizados }),
        ...(itensArmadoAtualizados.length > 0 && { itens_armado_padrao: itensArmadoAtualizados }),
        ...(itensCorteAtualizados.length > 0 && { itens_corte_dobra: itensCorteAtualizados }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      toast({ title: "✅ Desconto aprovado e estoque baixado!" });
      setAprovacaoDialogOpen(false);
      setPedidoSelecionado(null);
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao aprovar", description: error.message, variant: "destructive" });
    }
  });

  const negarPedidoMutation = useMutation({
    mutationFn: async ({ pedidoId, comentarios }) => {
      await base44.entities.Pedido.update(pedidoId, {
        status_aprovacao: "negado",
        usuario_aprovador_id: user?.id,
        data_aprovacao: new Date().toISOString(),
        comentarios_aprovacao: comentarios
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toast({ title: "❌ Desconto negado" });
      setAprovacaoDialogOpen(false);
      setPedidoSelecionado(null);
    }
  });

  const pedidosPendentes = pedidos.filter(p => p.status_aprovacao === "pendente");
  const pedidosAprovados = pedidos.filter(p => p.status_aprovacao === "aprovado");
  const pedidosNegados = pedidos.filter(p => p.status_aprovacao === "negado");

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-orange-600" />
            Central de Aprovações
          </h2>
          <p className="text-slate-600 text-sm">Gerencie todas as solicitações de aprovação</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="descontos">Descontos</TabsTrigger>
          <TabsTrigger value="limite">Limite de Crédito</TabsTrigger>
          <TabsTrigger value="duplicatas">Duplicatas Vencidas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="descontos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {pedidosPendentes.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {pedidosAprovados.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Negados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {pedidosNegados.length}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Pedidos Pendentes de Aprovação de Desconto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Desconto Solicitado</TableHead>
                    <TableHead>Margem Após Desconto</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosPendentes.map(pedido => {
                    const margemAposDesconto = pedido.margem_aplicada_vendedor || 0;
                    const corMargem = margemAposDesconto < 5 ? "text-red-600" : margemAposDesconto < 10 ? "text-yellow-600" : "text-green-600";
                    
                    return (
                      <TableRow key={pedido.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                        <TableCell>{pedido.cliente_nome}</TableCell>
                        <TableCell className="font-bold">
                          R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-orange-100 text-orange-700">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            {pedido.desconto_solicitado_percentual || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${corMargem}`}>
                            {margemAposDesconto.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {pedido.vendedor || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(pedido.created_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              openWindow(
                                AnalisePedidoAprovacao,
                                {
                                  pedido,
                                  onAprovar: (dados) => {
                                    aprovarPedidoMutation.mutate({
                                      pedidoId: pedido.id,
                                      dados
                                    });
                                  },
                                  onNegar: (comentarios) => {
                                    if (!comentarios.trim()) {
                                      toast({ title: "⚠️ Informe o motivo da negação", variant: "destructive" });
                                      return;
                                    }
                                    negarPedidoMutation.mutate({
                                      pedidoId: pedido.id,
                                      comentarios
                                    });
                                  },
                                  windowMode: true
                                },
                                {
                                  title: `🔐 Análise: ${pedido.numero_pedido}`,
                                  width: 1400,
                                  height: 800
                                }
                              );
                            }}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            Analisar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {pedidosPendentes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum pedido pendente de aprovação de desconto</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md mt-6">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Histórico de Aprovações de Desconto</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aprovador</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...pedidosAprovados, ...pedidosNegados].slice(0, 20).map(pedido => (
                    <TableRow key={pedido.id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                      <TableCell>{pedido.cliente_nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pedido.desconto_aprovado_percentual || pedido.desconto_solicitado_percentual || 0}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pedido.status_aprovacao === "aprovado" ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            <XCircle className="w-3 h-3 mr-1" />
                            Negado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {pedido.usuario_aprovador_id || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pedido.data_aprovacao ? new Date(pedido.data_aprovacao).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {[...pedidosAprovados, ...pedidosNegados].length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma aprovação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="limite">
          <Card className="border-0 shadow-md mt-4">
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Aprovações de Limite de Crédito
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-slate-600">
              <p>Funcionalidade em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duplicatas">
          <Card className="border-0 shadow-md mt-4">
            <CardHeader className="bg-red-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Aprovações de Duplicatas Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-slate-600">
              <p>Funcionalidade em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CentralAprovacoesManager;