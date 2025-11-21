import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  Landmark,
  Search,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * 💰 CAIXA CENTRAL - LIQUIDAÇÃO V21.4 ETAPA 4
 * Central unificada de liquidação de títulos e pagamentos omnichannel
 * 
 * FUNCIONALIDADES:
 * - Liquidação de Contas a Receber
 * - Liquidação de Contas a Pagar
 * - Processamento de Pagamentos Omnichannel
 * - Consolidação de Ordens de Liquidação
 * - Gestão de caixa unificada
 * - Multiempresa com visão consolidada
 */
function CaixaCentralLiquidacao({ windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState("ordens-pendentes");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroOrigem, setFiltroOrigem] = useState("todos");
  const [busca, setBusca] = useState("");
  const [liquidacaoDialogOpen, setLiquidacaoDialogOpen] = useState(false);
  const [ordemSelecionada, setOrdemSelecionada] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // QUERIES
  const { data: ordensLiquidacao = [], isLoading: loadingOrdens } = useQuery({
    queryKey: ['caixa-ordens-liquidacao'],
    queryFn: () => base44.entities.CaixaOrdemLiquidacao.list('-created_date'),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list('-data_vencimento'),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento'),
  });

  const { data: pagamentosOmni = [] } = useQuery({
    queryKey: ['pagamentos-omnichannel'],
    queryFn: () => base44.entities.PagamentoOmnichannel.list('-created_date'),
  });

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // MUTATIONS
  const liquidarOrdemMutation = useMutation({
    mutationFn: async ({ ordemId, dados }) => {
      await base44.entities.CaixaOrdemLiquidacao.update(ordemId, {
        status: "Liquidado",
        usuario_liquidacao_id: user?.id,
        data_liquidacao: new Date().toISOString(),
        ...dados
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: "✅ Liquidação realizada com sucesso!" });
      setLiquidacaoDialogOpen(false);
      setOrdemSelecionada(null);
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao liquidar", description: error.message, variant: "destructive" });
    }
  });

  const cancelarOrdemMutation = useMutation({
    mutationFn: async (ordemId) => {
      await base44.entities.CaixaOrdemLiquidacao.update(ordemId, {
        status: "Cancelado"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: "✅ Ordem cancelada" });
    }
  });

  // FILTROS
  const ordensFiltradas = ordensLiquidacao.filter(ordem => {
    const matchTipo = filtroTipo === "todos" || ordem.tipo_operacao === filtroTipo;
    const matchOrigem = filtroOrigem === "todos" || ordem.origem === filtroOrigem;
    const matchBusca = !busca || 
      ordem.titulos_vinculados?.some(t => t.numero_titulo?.toLowerCase().includes(busca.toLowerCase())) ||
      ordem.titulos_vinculados?.some(t => t.cliente_fornecedor_nome?.toLowerCase().includes(busca.toLowerCase()));
    return matchTipo && matchOrigem && matchBusca;
  });

  const ordensPendentes = ordensFiltradas.filter(o => o.status === "Pendente");
  const ordensLiquidadas = ordensFiltradas.filter(o => o.status === "Liquidado");
  const ordensCanceladas = ordensFiltradas.filter(o => o.status === "Cancelado");

  // TOTAIS
  const totalPendente = ordensPendentes.reduce((sum, o) => sum + (o.valor_total || 0), 0);
  const totalLiquidado = ordensLiquidadas.reduce((sum, o) => sum + (o.valor_total || 0), 0);

  const handleLiquidar = (ordem) => {
    setOrdemSelecionada(ordem);
    setFormaPagamento(ordem.forma_pagamento_pretendida || "");
    setLiquidacaoDialogOpen(true);
  };

  const confirmarLiquidacao = () => {
    if (!formaPagamento) {
      toast({ title: "⚠️ Selecione a forma de pagamento", variant: "destructive" });
      return;
    }

    liquidarOrdemMutation.mutate({
      ordemId: ordemSelecionada.id,
      dados: {
        forma_pagamento_pretendida: formaPagamento,
        observacoes: observacoes
      }
    });
  };

  const containerClass = windowMode 
    ? "w-full h-full overflow-auto p-6" 
    : "space-y-6";

  return (
    <div className={containerClass}>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-600" />
            Caixa Central - Liquidação
          </h2>
          <p className="text-slate-600 text-sm">Central unificada de liquidação de títulos e pagamentos</p>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {ordensPendentes.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Liquidados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ordensLiquidadas.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              R$ {totalLiquidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {ordensCanceladas.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Total Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {(totalPendente + totalLiquidado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs mb-2 block">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Número título, cliente/fornecedor..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-48">
              <Label className="text-xs mb-2 block">Tipo Operação</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Recebimento">Recebimento</SelectItem>
                  <SelectItem value="Pagamento">Pagamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Label className="text-xs mb-2 block">Origem</Label>
              <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Contas a Receber">Contas a Receber</SelectItem>
                  <SelectItem value="Contas a Pagar">Contas a Pagar</SelectItem>
                  <SelectItem value="Venda Direta">Venda Direta</SelectItem>
                  <SelectItem value="Omnichannel">Omnichannel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="ordens-pendentes" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Pendentes ({ordensPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="ordens-liquidadas" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Liquidadas ({ordensLiquidadas.length})
          </TabsTrigger>
          <TabsTrigger value="ordens-canceladas" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <XCircle className="w-4 h-4 mr-2" />
            Canceladas ({ordensCanceladas.length})
          </TabsTrigger>
        </TabsList>

        {/* ABA: ORDENS PENDENTES */}
        <TabsContent value="ordens-pendentes" className="mt-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Títulos Vinculados</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Forma Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordensPendentes.map(ordem => (
                    <TableRow key={ordem.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm">
                        {new Date(ordem.created_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge className={ordem.tipo_operacao === "Recebimento" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {ordem.tipo_operacao === "Recebimento" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {ordem.tipo_operacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ordem.origem}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {ordem.titulos_vinculados?.map((titulo, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-semibold">{titulo.numero_titulo}</span>
                              <span className="text-slate-500"> • {titulo.cliente_fornecedor_nome}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-base">
                        R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700">
                          {ordem.forma_pagamento_pretendida}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleLiquidar(ordem)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Liquidar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelarOrdemMutation.mutate(ordem.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {ordensPendentes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma ordem pendente de liquidação</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: ORDENS LIQUIDADAS */}
        <TabsContent value="ordens-liquidadas" className="mt-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data Liquidação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Títulos</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordensLiquidadas.map(ordem => (
                    <TableRow key={ordem.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm">
                        {ordem.data_liquidacao ? new Date(ordem.data_liquidacao).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={ordem.tipo_operacao === "Recebimento" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {ordem.tipo_operacao}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{ordem.origem}</Badge>
                      </TableCell>
                      <TableCell>
                        {ordem.titulos_vinculados?.length || 0} título(s)
                      </TableCell>
                      <TableCell className="font-bold">
                        R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {ordem.usuario_liquidacao_id || 'Sistema'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {ordensLiquidadas.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma ordem liquidada ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: ORDENS CANCELADAS */}
        <TabsContent value="ordens-canceladas" className="mt-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordensCanceladas.map(ordem => (
                    <TableRow key={ordem.id} className="hover:bg-slate-50 opacity-60">
                      <TableCell className="text-sm">
                        {new Date(ordem.created_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ordem.tipo_operacao}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{ordem.origem}</Badge>
                      </TableCell>
                      <TableCell className="font-bold line-through">
                        R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {ordensCanceladas.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <XCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma ordem cancelada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG DE LIQUIDAÇÃO */}
      <Dialog open={liquidacaoDialogOpen} onOpenChange={setLiquidacaoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Confirmar Liquidação
            </DialogTitle>
          </DialogHeader>

          {ordemSelecionada && (
            <div className="space-y-4">
              {/* INFO DA ORDEM */}
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-600">Tipo</Label>
                      <p className="font-semibold">{ordemSelecionada.tipo_operacao}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Origem</Label>
                      <p className="font-semibold">{ordemSelecionada.origem}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Valor Total</Label>
                      <p className="text-xl font-bold text-emerald-600">
                        R$ {(ordemSelecionada.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Títulos Vinculados</Label>
                      <p className="font-semibold">{ordemSelecionada.titulos_vinculados?.length || 0}</p>
                    </div>
                  </div>

                  {ordemSelecionada.titulos_vinculados?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-xs text-slate-600 mb-2 block">Títulos:</Label>
                      <div className="space-y-1">
                        {ordemSelecionada.titulos_vinculados.map((titulo, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{titulo.numero_titulo} - {titulo.cliente_fornecedor_nome}</span>
                            <span className="font-semibold">
                              R$ {(titulo.valor_titulo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* FORMULÁRIO DE LIQUIDAÇÃO */}
              <div className="space-y-4">
                <div>
                  <Label>Forma de Pagamento *</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">💵 Dinheiro</SelectItem>
                      <SelectItem value="Cartão Crédito">💳 Cartão Crédito</SelectItem>
                      <SelectItem value="Cartão Débito">💳 Cartão Débito</SelectItem>
                      <SelectItem value="PIX">⚡ PIX</SelectItem>
                      <SelectItem value="Boleto">📄 Boleto</SelectItem>
                      <SelectItem value="Transferência">🏦 Transferência</SelectItem>
                      <SelectItem value="Cheque">📝 Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações sobre a liquidação..."
                    rows={3}
                  />
                </div>
              </div>

              {/* AÇÕES */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLiquidacaoDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={confirmarLiquidacao}
                  disabled={liquidarOrdemMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {liquidarOrdemMutation.isPending ? "Liquidando..." : "Confirmar Liquidação"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CaixaCentralLiquidacao;