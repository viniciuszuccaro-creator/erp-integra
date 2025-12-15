import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox.jsx";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, DollarSign, Building2, Shield, Plus, Edit2, CheckCircle2, AlertCircle, Send, Printer, Copy, RefreshCw, ShoppingBag, Edit } from "lucide-react";
import { ImprimirBoleto } from "@/components/lib/ImprimirBoleto";
import StatusBadge from "../StatusBadge";
import usePermissions from "@/components/lib/usePermissions";
import { ProtectedAction } from "@/components/ProtectedAction";
import ContaPagarForm from "./ContaPagarForm";
import { useWindow } from "@/components/lib/useWindow";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import DuplicarMesAnterior from "./DuplicarMesAnterior";
import DespesasRecorrentesManager from "./DespesasRecorrentesManager";

/**
 * 💸 CONTAS A PAGAR V22 - DESPESAS RECORRENTES + DUPLICAÇÃO
 * 
 * ✅ Lançamentos Automáticos de:
 * - Ordens de Compra
 * - Despesas Recorrentes (Aluguel, Energia, Tarifas, etc)
 * - Marketplaces (Taxas ML, Shopee, etc)
 * 
 * ✅ Duplicação Mês Anterior:
 * - Copiar contas do mês anterior
 * - Filtrar por categorias
 * - Ajuste automático de vencimentos
 * 
 * ✅ Baixa em Massa com:
 * - Juros/Multas/Descontos configuráveis
 * - Registro automático em CaixaMovimento
 * 
 * ✅ Integração total com Caixa PDV
 */
export default function ContasPagarTab({ contas, empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();
  const { formasPagamento } = useFormasPagamento();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [contasSelecionadas, setContasSelecionadas] = useState([]);
  const [contaAtual, setContaAtual] = useState(null);
  const [showDespesasRecorrentes, setShowDespesasRecorrentes] = useState(false);
  
  const [dadosBaixa, setDadosBaixa] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_pago: 0,
    forma_pagamento: "PIX",
    juros: 0,
    multa: 0,
    desconto: 0,
    observacoes: ""
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra'],
    queryFn: () => base44.entities.OrdemCompra.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // V22: Mutation para enviar títulos para o Caixa
  const enviarParaCaixaMutation = useMutation({
    mutationFn: async (titulos) => {
      const ordens = await Promise.all(titulos.map(async (titulo) => {
        return await base44.entities.CaixaOrdemLiquidacao.create({
          empresa_id: titulo.empresa_id,
          tipo_operacao: 'Pagamento',
          origem: 'Contas a Pagar',
          valor_total: titulo.valor,
          forma_pagamento_pretendida: 'Transferência',
          status: 'Pendente',
          titulos_vinculados: [{
            titulo_id: titulo.id,
            tipo_titulo: 'ContaPagar',
            numero_titulo: titulo.numero_documento || titulo.descricao,
            cliente_fornecedor_nome: titulo.fornecedor,
            valor_titulo: titulo.valor
          }],
          data_ordem: new Date().toISOString(),
          usuario_operador_nome: user?.full_name
        });
      }));
      return ordens;
    },
    onSuccess: (ordens) => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: `✅ ${ordens.length} título(s) enviado(s) para o Caixa!` });
      setContasSelecionadas([]);
    }
  });

  // V22: Baixar título com registro de CaixaMovimento
  const baixarTituloMutation = useMutation({
    mutationFn: async ({ id, dados }) => {
      const titulo = await base44.entities.ContaPagar.update(id, {
        status: "Pago",
        data_pagamento: dados.data_pagamento,
        valor_pago: dados.valor_pago,
        forma_pagamento: dados.forma_pagamento,
        juros: dados.juros,
        multa: dados.multa,
        desconto: dados.desconto,
        observacoes: dados.observacoes
      });

      const conta = contas.find(c => c.id === id);
      
      // V22: Registrar movimento de caixa (Saída)
      await base44.entities.CaixaMovimento.create({
        group_id: conta.group_id,
        empresa_id: conta.empresa_id,
        data_movimento: new Date().toISOString(),
        tipo_movimento: "Saída",
        origem: "Pagamento Conta a Pagar",
        forma_pagamento: dados.forma_pagamento,
        valor: dados.valor_pago,
        descricao: `Pagamento: ${conta.descricao} - Fornecedor: ${conta.fornecedor}`,
        conta_pagar_id: id,
        usuario_operador_nome: user?.full_name
      });

      return titulo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título pago!" });
    },
  });

  // V22: Baixa múltipla com ajuste de valores
  const baixarMultiplaMutation = useMutation({
    mutationFn: async (dados) => {
      const baixaPromises = contasSelecionadas.map(async (contaId) => {
        const conta = contas.find(c => c.id === contaId);
        if (conta) {
          const valorAjustado = (conta.valor || 0) + (dados.juros || 0) + (dados.multa || 0) - (dados.desconto || 0);
          await baixarTituloMutation.mutateAsync({
            id: contaId,
            dados: {
              ...dados,
              valor_pago: valorAjustado
            }
          });
        }
      });
      await Promise.all(baixaPromises);
    },
    onSuccess: () => {
      setContasSelecionadas([]);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) pago(s)!` });
    }
  });

  const aprovarPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      return await base44.entities.ContaPagar.update(contaId, {
        status_pagamento: "Aprovado",
        aprovado_por: user?.full_name,
        aprovado_por_id: user?.id,
        data_aprovacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: "✅ Pagamento aprovado!" });
    },
  });

  const handleBaixar = (conta) => {
    setContaAtual(conta);
    setDadosBaixa({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: conta.valor,
      forma_pagamento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaOpen(true);
  };

  const handleBaixarMultipla = () => {
    if (contasSelecionadas.length === 0) {
      toast({ title: "⚠️ Selecione pelo menos um título", variant: "destructive" });
      return;
    }
    setContaAtual(null);
    setDialogBaixaOpen(true);
  };

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    if (contaAtual) {
      baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
    } else {
      baixarMultiplaMutation.mutate(dadosBaixa);
    }
  };

  const toggleSelecao = (contaId) => {
    setContasSelecionadas(prev =>
      prev.includes(contaId) ? prev.filter(id => id !== contaId) : [...prev, contaId]
    );
  };

  const contasFiltradas = contas
    .filter(c => statusFilter === "todos" || c.status === statusFilter)
    .filter(c => categoriaFilter === "todas" || c.categoria === categoriaFilter)
    .filter(c =>
      c.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalSelecionado = contas
    .filter(c => contasSelecionadas.includes(c.id))
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const categorias = [...new Set(contas.map(c => c.categoria).filter(Boolean))];

  const totais = {
    total: contasFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0),
    pendente: contasFiltradas.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0),
    pago: contasFiltradas.filter(c => c.status === 'Pago').reduce((sum, c) => sum + (c.valor || 0), 0),
    vencido: contasFiltradas.filter(c => c.status === 'Atrasado').reduce((sum, c) => sum + (c.valor || 0), 0)
  };

  return (
    <div className="space-y-6 w-full h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{contasFiltradas.length} títulos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">A pagar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Já pagas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totais.vencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Em atraso</p>
          </CardContent>
        </Card>
      </div>

      {/* V22: Alerta de Seleção */}
      {contasSelecionadas.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-900">💸 {contasSelecionadas.length} título(s) selecionado(s)</p>
              <p className="text-xs text-red-700">Total: R$ {totalSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const titulos = contas.filter(c => contasSelecionadas.includes(c.id));
                  enviarParaCaixaMutation.mutate(titulos);
                }}
                disabled={enviarParaCaixaMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar para Caixa
              </Button>
              <ProtectedAction permission="financeiro_pagar_baixar_multiplos">
                <Button
                  onClick={handleBaixarMultipla}
                  disabled={baixarMultiplaMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Baixar Múltiplos
                </Button>
              </ProtectedAction>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* V22: Filtros e Ações */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Buscar fornecedor, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Categorias</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowDespesasRecorrentes(!showDespesasRecorrentes)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {showDespesasRecorrentes ? 'Ocultar' : 'Despesas'} Recorrentes
            </Button>

            <DuplicarMesAnterior
              empresaId={empresaId}
              onComplete={() => queryClient.invalidateQueries({ queryKey: ['contasPagar'] })}
            />
            
            <ProtectedAction permission="financeiro_pagar_criar">
              <Button 
                className="bg-red-600 hover:bg-red-700 ml-auto" 
                onClick={() => openWindow(ContaPagarForm, {
                  windowMode: true,
                  onSubmit: async (data) => {
                    try {
                      await base44.entities.ContaPagar.create(data);
                      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
                      toast({ title: "✅ Conta criada!" });
                    } catch (error) {
                      toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                    }
                  }
                }, {
                  title: '💸 Nova Conta a Pagar',
                  width: 900,
                  height: 600
                })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </ProtectedAction>
          </div>
        </CardContent>
      </Card>

      {/* V22: Despesas Recorrentes */}
      {showDespesasRecorrentes && (
        <DespesasRecorrentesManager empresaId={empresaId} />
      )}

      {/* V22: Tabela */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={contasSelecionadas.length === contasFiltradas.filter(c => c.status === "Pendente" || c.status === "Aprovado").length && contasFiltradas.filter(c => c.status === "Pendente" || c.status === "Aprovado").length > 0}
                      onCheckedChange={(checked) => {
                        const pendentes = contasFiltradas.filter(c => c.status === "Pendente" || c.status === "Aprovado");
                        setContasSelecionadas(checked ? pendentes.map(c => c.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Ordem Compra</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasFiltradas.map((conta) => {
                  const empresa = empresas.find(e => e.id === conta.empresa_id);
                  const oc = ordensCompra.find(o => o.id === conta.ordem_compra_id);
                  const vencida = conta.status === "Pendente" && new Date(conta.data_vencimento) < new Date();
                  const diasAtraso = vencida
                    ? Math.floor((new Date() - new Date(conta.data_vencimento)) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <TableRow key={conta.id} className={vencida ? 'bg-red-50' : ''}>
                      <TableCell>
                        {(conta.status === "Pendente" || conta.status === "Aprovado") && (
                          <Checkbox
                            checked={contasSelecionadas.includes(conta.id)}
                            onCheckedChange={() => toggleSelecao(conta.id)}
                          />
                        )}
                        {conta.e_replicado && (
                          <Badge variant="outline" className="text-xs ml-1" title="Vindo de rateio do grupo">
                            📊
                          </Badge>
                        )}
                        {conta.marketplace_origem && conta.marketplace_origem !== 'Nenhum' && (
                          <Badge variant="outline" className="text-xs ml-1" title="Taxa de Marketplace">
                            🛒
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                      <TableCell>
                        {oc ? (
                          <Badge variant="outline" className="text-xs">
                            <ShoppingBag className="w-3 h-3 mr-1" />
                            {oc.numero_oc}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{conta.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{conta.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-purple-600" />
                          <span className="text-xs">{empresa?.nome_fantasia || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</p>
                          {vencida && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              {diasAtraso} dia(s) atraso
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={conta.status} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const empresaData = empresas.find(e => e.id === conta.empresa_id);
                              ImprimirBoleto({ conta, empresa: empresaData, tipo: 'pagar' });
                            }}
                            title="Imprimir Comprovante"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openWindow(ContaPagarForm, {
                              conta,
                              windowMode: true,
                              onSubmit: async (data) => {
                                try {
                                  await base44.entities.ContaPagar.update(conta.id, data);
                                  queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
                                  toast({ title: "✅ Conta atualizada!" });
                                } catch (error) {
                                  toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                                }
                              }
                            }, {
                              title: `✏️ Editar: ${conta.fornecedor}`,
                              width: 900,
                              height: 600
                            })}
                          >
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </Button>

                          {conta.status === "Pendente" && (
                            <ProtectedAction permission="financeiro_pagar_aprovar">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => aprovarPagamentoMutation.mutate(conta.id)}
                                disabled={aprovarPagamentoMutation.isPending}
                                title="Aprovar Pagamento"
                              >
                                <Shield className="w-4 h-4 text-blue-600" />
                              </Button>
                            </ProtectedAction>
                          )}
                          
                          {(conta.status === "Aprovado" || conta.status === "Pendente") && (
                            <ProtectedAction permission="financeiro_pagar_baixar">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBaixar(conta)}
                                title="Registrar Pagamento"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            </ProtectedAction>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {contasFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma conta a pagar encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* V22: Dialog Baixa Melhorado */}
      <Dialog open={dialogBaixaOpen} onOpenChange={setDialogBaixaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{contaAtual ? "Registrar Pagamento" : "Registrar Pagamento Múltiplo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBaixa} className="space-y-4">
            {contaAtual && (
              <div>
                <Label>Fornecedor</Label>
                <Input value={contaAtual?.fornecedor || ''} disabled />
              </div>
            )}
            {!contaAtual && (
              <Alert className="border-blue-300 bg-blue-50">
                <AlertDescription className="text-xs text-blue-900">
                  Serão baixados <strong>{contasSelecionadas.length} títulos</strong>. Configure a forma de pagamento, juros, multas e descontos.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Original</Label>
                <Input value={`R$ ${contaAtual?.valor?.toFixed(2) || 0}`} disabled />
              </div>
              <div>
                <Label>Valor Total a Pagar (Ajustado)</Label>
                <Input
                  value={`R$ ${((contaAtual?.valor || 0) + (dadosBaixa.juros || 0) + (dadosBaixa.multa || 0) - (dadosBaixa.desconto || 0)).toFixed(2)}`}
                  disabled
                  className="font-bold text-red-600"
                />
              </div>
            </div>
            <div>
              <Label>Valor Pago *</Label>
              <Input
                type="number"
                step="0.01"
                value={dadosBaixa.valor_pago}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, valor_pago: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Pagamento *</Label>
                <Input
                  type="date"
                  value={dadosBaixa.data_pagamento}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, data_pagamento: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Forma de Pagamento *</Label>
                <Select
                  value={dadosBaixa.forma_pagamento}
                  onValueChange={(v) => setDadosBaixa({ ...dadosBaixa, forma_pagamento: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map(forma => (
                      <SelectItem key={forma.id} value={forma.descricao}>
                        {forma.icone && `${forma.icone} `}{forma.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Juros</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.juros}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Multa</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.multa}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.desconto}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogBaixaOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={baixarTituloMutation.isPending || baixarMultiplaMutation.isPending} className="bg-green-600">
                {(baixarTituloMutation.isPending || baixarMultiplaMutation.isPending) ? 'Registrando...' : 'Confirmar Pagamento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}