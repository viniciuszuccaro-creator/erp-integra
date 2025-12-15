import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle, DollarSign, Building2, Shield, Plus, Edit2, CheckCircle2,
  AlertCircle, TrendingDown, Calendar, FileText, Eye, Send, Printer,
  ShoppingCart, Package, Link2, BarChart3
} from "lucide-react";
import { ImprimirBoleto } from "@/components/lib/ImprimirBoleto";
import StatusBadge from "../StatusBadge";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { ProtectedAction } from "@/components/ProtectedAction";
import FiltroEmpresaContexto from "@/components/FiltroEmpresaContexto";
import ContaPagarForm from "./ContaPagarForm";
import { useWindow } from "@/components/lib/useWindow";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";

export default function ContasPagarTab({ contas }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();
  const { formasPagamento } = useFormasPagamento();
  const { filtrarPorContexto, estaNoGrupo, empresaAtual, filtroEmpresa, setFiltroEmpresa } = useContextoVisual();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [marketplaceFilter, setMarketplaceFilter] = useState("todos");
  
  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [dialogBaixaMultiplaOpen, setDialogBaixaMultiplaOpen] = useState(false);
  const [contasSelecionadas, setContasSelecionadas] = useState([]);
  const [contaAtual, setContaAtual] = useState(null);
  
  const [dadosBaixa, setDadosBaixa] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_pago: 0,
    forma_pagamento: "PIX",
    juros: 0,
    multa: 0,
    desconto: 0,
    observacoes: ""
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
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

  // Mutation para enviar títulos para o Caixa
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
            valor_titulo: titulo.valor,
            categoria: titulo.categoria,
            marketplace_origem: titulo.marketplace_origem
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
      
      // Registrar movimento de caixa (Saída)
      if (conta) {
        await base44.entities.CaixaMovimento.create({
          group_id: conta.group_id,
          empresa_id: conta.empresa_id,
          data_movimento: new Date().toISOString(),
          tipo_movimento: "Saída",
          origem: "Pagamento Conta a Pagar",
          forma_pagamento: dados.forma_pagamento,
          valor: dados.valor_pago,
          descricao: `Pagamento: ${conta.descricao} - Fornecedor: ${conta.fornecedor}${conta.categoria ? ` • Categoria: ${conta.categoria}` : ''}${conta.marketplace_origem && conta.marketplace_origem !== 'Nenhum' ? ` • Marketplace: ${conta.marketplace_origem}` : ''}`,
          conta_pagar_id: id,
          usuario_operador_nome: user?.full_name
        });
      }

      return titulo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título pago!" });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao pagar título: ${error.message}`,
        variant: "destructive",
      });
    }
  });

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
      setDialogBaixaMultiplaOpen(false);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) pago(s)!` });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao baixar múltiplos títulos: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const aprovarPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      return await base44.entities.ContaPagar.update(contaId, {
        status_pagamento: "Aprovado",
        aprovado_por: user?.full_name || "Usuário Admin",
        aprovado_por_id: user?.id,
        data_aprovacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: "✅ Pagamento aprovado!" });
    },
  });

  const aprovarMultiplosMutation = useMutation({
    mutationFn: async (contaIds) => {
      const promises = contaIds.map(id => 
        base44.entities.ContaPagar.update(id, {
          status_pagamento: "Aprovado",
          aprovado_por: user?.full_name || "Usuário Admin",
          aprovado_por_id: user?.id,
          data_aprovacao: new Date().toISOString()
        })
      );
      return await Promise.all(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: `✅ ${results.length} pagamento(s) aprovado(s)!` });
      setContasSelecionadas([]);
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
      toast({
        title: "⚠️ Selecione pelo menos um título",
        variant: "destructive"
      });
      return;
    }
    setDadosBaixa({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: 0,
      forma_pagamento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaMultiplaOpen(true);
  };

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
  };

  const handleSubmitBaixaMultipla = (e) => {
    e.preventDefault();
    baixarMultiplaMutation.mutate(dadosBaixa);
  };

  const toggleSelecao = (contaId) => {
    setContasSelecionadas(prev =>
      prev.includes(contaId)
        ? prev.filter(id => id !== contaId)
        : [...prev, contaId]
    );
  };

  // Filtros avançados
  let contasFiltradas = filtrarPorContexto(contas, 'empresa_id');

  contasFiltradas = contasFiltradas
    .filter(c => statusFilter === "todos" || c.status === statusFilter)
    .filter(c => categoriaFilter === "todas" || c.categoria === categoriaFilter)
    .filter(c => marketplaceFilter === "todos" || (c.marketplace_origem || 'Nenhum') === marketplaceFilter)
    .filter(c =>
      c.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalSelecionado = contas
    .filter(c => contasSelecionadas.includes(c.id))
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const totais = {
    total: contasFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0),
    pendente: contasFiltradas.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0),
    aprovado: contasFiltradas.filter(c => c.status_pagamento === 'Aprovado' || c.status === 'Aprovado').reduce((sum, c) => sum + (c.valor || 0), 0),
    pago: contasFiltradas.filter(c => c.status === 'Pago').reduce((sum, c) => sum + (c.valor || 0), 0),
  };

  const categoriasUnicas = [...new Set(contas.map(c => c.categoria).filter(Boolean))];
  const marketplacesUnicos = [...new Set(contas.map(c => c.marketplace_origem || 'Nenhum'))].filter(m => m !== 'Nenhum');

  const analiseCategorias = categoriasUnicas.map(categoria => ({
    categoria,
    quantidade: contasFiltradas.filter(c => c.categoria === categoria).length,
    valor: contasFiltradas.filter(c => c.categoria === categoria).reduce((sum, c) => sum + (c.valor || 0), 0)
  })).sort((a, b) => b.valor - a.valor);

  const analiseMarketplaces = marketplacesUnicos.map(marketplace => ({
    marketplace,
    quantidade: contasFiltradas.filter(c => c.marketplace_origem === marketplace).length,
    valor: contasFiltradas.filter(c => c.marketplace_origem === marketplace).reduce((sum, c) => sum + (c.valor || 0), 0)
  })).sort((a, b) => b.valor - a.valor);

  // Auto-calcular valor ajustado ao mudar juros/multa/desconto
  useEffect(() => {
    if (contaAtual && dialogBaixaOpen) {
      const valorAjustado = (contaAtual.valor || 0) + (dadosBaixa.juros || 0) + (dadosBaixa.multa || 0) - (dadosBaixa.desconto || 0);
      setDadosBaixa(prev => ({ ...prev, valor_pago: valorAjustado }));
    }
  }, [dadosBaixa.juros, dadosBaixa.multa, dadosBaixa.desconto, contaAtual, dialogBaixaOpen]);

  return (
    <div className="space-y-6 w-full h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ {totais.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{contasFiltradas.length} contas filtradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {totais.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ {totais.aprovado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Aprovadas p/ pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totais.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Já quitadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{categoriasUnicas.length}</div>
            <p className="text-xs text-muted-foreground">{marketplacesUnicos.length} marketplaces</p>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Categoria e Marketplace */}
      {(analiseCategorias.length > 0 || analiseMarketplaces.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analiseCategorias.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-blue-600" />
                  Análise por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {analiseCategorias.slice(0, 5).map(item => (
                    <div key={item.categoria} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{item.categoria}</Badge>
                        <span className="text-xs text-slate-600">{item.quantidade} títulos</span>
                      </div>
                      <span className="font-semibold text-sm">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analiseMarketplaces.length > 0 && (
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Taxas de Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {analiseMarketplaces.map(item => (
                    <div key={item.marketplace} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700 text-xs">{item.marketplace}</Badge>
                        <span className="text-xs text-slate-600">{item.quantidade} taxas</span>
                      </div>
                      <span className="font-semibold text-sm">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Alerta de Seleção com Ações */}
      {contasSelecionadas.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
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
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar para Caixa
              </Button>
              <ProtectedAction permission="financeiro_pagar_aprovar_multiplos">
                <Button
                  onClick={() => aprovarMultiplosMutation.mutate(contasSelecionadas)}
                  disabled={aprovarMultiplosMutation.isPending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Aprovar Múltiplos
                </Button>
              </ProtectedAction>
              <ProtectedAction permission="financeiro_pagar_baixar_multiplos">
                <Button
                  onClick={handleBaixarMultipla}
                  disabled={baixarMultiplaMutation.isPending}
                  size="sm"
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

      {/* Filtros */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <FiltroEmpresaContexto 
              filtroEmpresa={filtroEmpresa}
              setFiltroEmpresa={setFiltroEmpresa}
            />
            
            <Input
              placeholder="🔍 Buscar fornecedor, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {categoriasUnicas.length > 0 && (
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Categorias</SelectItem>
                  {categoriasUnicas.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {marketplacesUnicos.length > 0 && (
              <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Marketplace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Marketplaces</SelectItem>
                  {marketplacesUnicos.map(marketplace => (
                    <SelectItem key={marketplace} value={marketplace}>{marketplace}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="ml-auto">
              <ProtectedAction permission="financeiro_pagar_criar">
                <Button 
                  className="bg-red-600 hover:bg-red-700" 
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
                  Adicionar Conta
                </Button>
              </ProtectedAction>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="border-0 shadow-md w-full">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            Contas a Pagar
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contasFiltradas.map((conta) => {
                  const empresa = empresas.find(e => e.id === conta.empresa_id);
                  const vencida = conta.status === "Pendente" && new Date(conta.data_vencimento) < new Date();
                  const ordemCompraVinculada = ordensCompra.find(oc => oc.id === conta.ordem_compra_id);

                  return (
                    <TableRow key={conta.id} className={vencida ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}>
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
                      </TableCell>
                      <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{conta.descricao}</div>
                        {ordemCompraVinculada && (
                          <Badge variant="outline" className="text-xs mt-1">
                            <Link2 className="w-3 h-3 mr-1" />
                            OC {ordemCompraVinculada.numero_oc}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-purple-600" />
                          <span className="text-xs">{empresa?.nome_fantasia || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {conta.categoria && (
                          <Badge variant="outline" className="text-xs">
                            {conta.categoria}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</p>
                          {vencida && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              ⚠️ Vencida
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={conta.status} size="sm" />
                        {conta.status_pagamento === "Aprovado" && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">
                            <Shield className="w-3 h-3 mr-1" />
                            Aprovado
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {conta.marketplace_origem && conta.marketplace_origem !== 'Nenhum' ? (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {conta.marketplace_origem}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center flex-wrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const empresaData = empresas.find(e => e.id === conta.empresa_id);
                              ImprimirBoleto({ conta, empresa: empresaData, tipo: 'pagar' });
                            }}
                            title="Imprimir Comprovante"
                            className="text-slate-600 h-8 w-8"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>

                          <ProtectedAction permission="financeiro_pagar_editar">
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
                              title="Editar Conta"
                              className="h-8 w-8"
                            >
                              <Edit2 className="w-4 h-4 text-gray-500" />
                            </Button>
                          </ProtectedAction>
                          
                          {conta.status === "Pendente" && (
                            <ProtectedAction permission="financeiro_pagar_aprovar">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => aprovarPagamentoMutation.mutate(conta.id)}
                                disabled={aprovarPagamentoMutation.isPending}
                                title="Aprovar Pagamento"
                                className="h-8 w-8"
                              >
                                <Shield className="w-4 h-4 text-blue-600" />
                              </Button>
                            </ProtectedAction>
                          )}
                          
                          {(conta.status === "Aprovado" || conta.status_pagamento === "Aprovado") && (
                            <ProtectedAction permission="financeiro_pagar_baixar">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleBaixar(conta)}
                                title="Registrar Pagamento"
                                className="h-8 w-8"
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
              <p className="text-xs mt-2">Ajuste os filtros ou adicione uma nova conta</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Baixa Individual */}
      <Dialog open={dialogBaixaOpen} onOpenChange={setDialogBaixaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Registrar Pagamento
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBaixa} className="space-y-4">
            <div>
              <Label>Fornecedor</Label>
              <Input value={contaAtual?.fornecedor || ''} disabled />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Valor Original</Label>
                <Input value={`R$ ${contaAtual?.valor?.toFixed(2) || 0}`} disabled className="font-semibold" />
              </div>
              <div>
                <Label className="text-red-600">Valor Total a Pagar (Ajustado)</Label>
                <Input
                  value={`R$ ${((contaAtual?.valor || 0) + (dadosBaixa.juros || 0) + (dadosBaixa.multa || 0) - (dadosBaixa.desconto || 0)).toFixed(2)}`}
                  disabled
                  className="font-bold text-red-600 border-red-300 bg-red-50"
                />
              </div>
              <div>
                <Label>Valor Pago *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.valor_pago}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, valor_pago: parseFloat(e.target.value) })}
                  required
                  className="font-semibold"
                />
              </div>
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
                <Label>Juros (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.juros}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="text-red-600"
                />
              </div>
              <div>
                <Label>Multa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.multa}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="text-red-600"
                />
              </div>
              <div>
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.desconto}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="text-green-600"
                />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={dadosBaixa.observacoes}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, observacoes: e.target.value })}
                placeholder="Observações sobre o pagamento..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogBaixaOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={baixarTituloMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {baixarTituloMutation.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Baixa Múltipla */}
      <Dialog open={dialogBaixaMultiplaOpen} onOpenChange={setDialogBaixaMultiplaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Registrar Pagamento Múltiplo ({contasSelecionadas.length})
            </DialogTitle>
          </DialogHeader>
          <Alert className="border-blue-300 bg-blue-50">
            <AlertDescription className="text-sm text-blue-900">
              <strong>Pagamento em Massa:</strong> Serão pagos <strong>{contasSelecionadas.length} títulos</strong> com valor total de <strong>R$ {totalSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>. Configure a forma de pagamento, juros, multas e descontos para aplicar a todos.
            </AlertDescription>
          </Alert>
          <form onSubmit={handleSubmitBaixaMultipla} className="space-y-4">
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
                <Label>Juros (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.juros}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="text-red-600"
                />
              </div>
              <div>
                <Label>Multa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.multa}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="text-red-600"
                />
              </div>
              <div>
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.desconto}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  className="text-green-600"
                />
              </div>
            </div>
            <Alert className="border-red-300 bg-red-50">
              <AlertDescription className="text-sm">
                <p className="font-semibold text-red-900">💸 Total a Pagar (com ajustes):</p>
                <p className="text-lg font-bold text-red-700">
                  R$ {(totalSelecionado + (dadosBaixa.juros || 0) + (dadosBaixa.multa || 0) - (dadosBaixa.desconto || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </AlertDescription>
            </Alert>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={dadosBaixa.observacoes}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, observacoes: e.target.value })}
                placeholder="Observações sobre o pagamento em massa..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogBaixaMultiplaOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={baixarMultiplaMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {baixarMultiplaMutation.isPending ? 'Registrando...' : `Confirmar Pagamento de ${contasSelecionadas.length} Títulos`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}