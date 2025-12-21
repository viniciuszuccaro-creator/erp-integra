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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, DollarSign, Building2, Shield, Plus, Edit2, CheckCircle2, AlertCircle, TrendingDown, Calendar, FileText, Eye, Send, Printer, Download } from "lucide-react";
import { ImprimirBoleto } from "@/components/lib/ImprimirBoleto";
import StatusBadge from "../StatusBadge";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { ProtectedAction } from "@/components/ProtectedAction";
import FiltroEmpresaContexto from "@/components/FiltroEmpresaContexto";
import ContaPagarForm from "./ContaPagarForm";
import { useWindow } from "@/components/lib/useWindow";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import DuplicarMesAnterior from "./DuplicarMesAnterior";

export default function ContasPagarTab({ contas }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();
  const { formasPagamento, obterBancoPorTipo } = useFormasPagamento();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState(null);
  const [formData, setFormData] = useState({
    descricao: "",
    fornecedor: "",
    fornecedor_id: "",
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: "Pendente",
    forma_pagamento: "Boleto",
    categoria: "Fornecedores",
    centro_custo: "",
    observacoes: "",
    empresa_id: ""
  });
  
  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [dialogAprovacaoOpen, setDialogAprovacaoOpen] = useState(false);
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

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: () => base44.entities.TipoDespesa.list(),
  });

  const { data: configsRecorrentes = [] } = useQuery({
    queryKey: ['configs-recorrentes'],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.list(),
  });

  // ETAPA 4: Mutation para enviar títulos para o Caixa
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
          data_ordem: new Date().toISOString()
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
      const conta = contas.find(c => c.id === id);
      const valorTotal = (conta?.valor || 0) + (dados.juros || 0) + (dados.multa || 0) - (dados.desconto || 0);
      
      await base44.entities.CaixaMovimento.create({
        empresa_id: conta.empresa_id,
        group_id: conta.group_id,
        tipo_movimento: 'Saída',
        categoria: 'Pagamento Fornecedor',
        subcategoria: conta.categoria,
        descricao: `Pagamento: ${conta.descricao}`,
        valor: valorTotal,
        forma_pagamento: dados.forma_pagamento,
        data_movimento: dados.data_pagamento,
        conta_pagar_id: id,
        favorecido: conta.fornecedor,
        documento_numero: conta.numero_documento,
        centro_custo_id: conta.centro_custo_id,
        observacoes: dados.observacoes,
        usuario_responsavel: "Sistema"
      });

      return await base44.entities.ContaPagar.update(id, {
        status: "Pago",
        data_pagamento: dados.data_pagamento,
        valor_pago: valorTotal,
        forma_pagamento: dados.forma_pagamento,
        juros: dados.juros,
        multa: dados.multa,
        desconto: dados.desconto,
        observacoes: dados.observacoes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título pago e registrado no caixa!" });
    },
  });

  const aprovarPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      return await base44.entities.ContaPagar.update(contaId, {
        status_pagamento: "Aprovado",
        aprovado_por: "Usuário Admin",
        data_aprovacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      toast({ title: "✅ Pagamento aprovado!" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContaPagar.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Conta criada com sucesso!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContaPagar.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Conta atualizada!" });
    },
  });

  const resetForm = () => {
    setFormData({
      descricao: "",
      fornecedor: "",
      fornecedor_id: "",
      valor: 0,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: new Date().toISOString().split('T')[0],
      status: "Pendente",
      forma_pagamento: "Boleto",
      categoria: "Fornecedores",
      centro_custo: "",
      observacoes: "",
      empresa_id: ""
    });
    setEditingConta(null);
  };

  const handleEdit = (conta) => {
    setEditingConta(conta);
    setFormData({ 
      ...conta,
      data_emissao: conta.data_emissao ? new Date(conta.data_emissao).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      data_vencimento: conta.data_vencimento ? new Date(conta.data_vencimento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingConta) {
      updateMutation.mutate({ id: editingConta.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

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

  const baixarMultiplaMutation = useMutation({
    mutationFn: async (dados) => {
      const baixaPromises = contasSelecionadas.map(async (contaId) => {
        const conta = contas.find(c => c.id === contaId);
        if (conta) {
          await baixarTituloMutation.mutateAsync({
            id: contaId,
            dados: dados
          });
        }
      });
      await Promise.all(baixaPromises);
    },
    onSuccess: () => {
      setContasSelecionadas([]);
      setDialogBaixaOpen(false);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) pago(s)!` });
    },
  });

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    if (contaAtual) {
      baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
    } else {
      baixarMultiplaMutation.mutate(dadosBaixa);
    }
  };

  const handleBaixarMultipla = () => {
    if (contasSelecionadas.length === 0) {
      toast({
        title: "⚠️ Selecione pelo menos um título",
        variant: "destructive"
      });
      return;
    }
    setContaAtual(null);
    setDadosBaixa({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: 0,
      forma_pagamento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaOpen(true);
  };

  const toggleSelecao = (contaId) => {
    setContasSelecionadas(prev =>
      prev.includes(contaId)
        ? prev.filter(id => id !== contaId)
        : [...prev, contaId]
    );
  };

  const contasFiltradas = contas
    .filter(c => statusFilter === "todos" || c.status === statusFilter)
    .filter(c =>
      c.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalSelecionado = contas
    .filter(c => contasSelecionadas.includes(c.id))
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  return (
    <div className="space-y-4">
      {/* ETAPA 4: ALERTA DE ENVIO PARA CAIXA */}
      {contasSelecionadas.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-900">💸 {contasSelecionadas.length} título(s) selecionado(s)</p>
              <p className="text-xs text-red-700">Total: R$ {totalSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
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
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
           {/* Exportar CSV */}
           <ProtectedAction permission="financeiro_pagar_exportar">
             <Button
               variant="outline"
               onClick={() => {
                 const itens = (contasSelecionadas.length > 0)
                   ? contas.filter(c => contasSelecionadas.includes(c.id))
                   : contasFiltradas;
                 const headers = ['fornecedor','descricao','empresa_id','data_vencimento','valor','status'];
                 const csv = [
                   headers.join(','),
                   ...itens.map(c => headers.map(h => JSON.stringify(c[h] ?? '')).join(','))
                 ].join('\n');
                 const blob = new Blob([csv], { type: 'text/csv' });
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `contas_pagar_${new Date().toISOString().slice(0,10)}.csv`;
                 a.click();
                 URL.revokeObjectURL(url);
               }}
             >
               <Download className="w-4 h-4 mr-2" /> Exportar CSV
             </Button>
           </ProtectedAction>
            <Input
              placeholder="Buscar fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {contasSelecionadas.length > 0 && (
              <>
                <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                  {contasSelecionadas.length} selecionado(s) - R$ {totalSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
                <ProtectedAction permission="financeiro_pagar_baixar_multiplos">
                  <Button
                    variant="outline"
                    onClick={handleBaixarMultipla}
                    disabled={baixarMultiplaMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Pagar Múltiplos
                  </Button>
                </ProtectedAction>
              </>
            )}

            <DuplicarMesAnterior empresaId={empresas[0]?.id} />
            
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
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={contasSelecionadas.length === contasFiltradas.filter(c => c.status === "Pendente" || c.status === "Aprovado").length}
                      onCheckedChange={(checked) => {
                        const pendentes = contasFiltradas.filter(c => c.status === "Pendente" || c.status === "Aprovado");
                        setContasSelecionadas(checked ? pendentes.map(c => c.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
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
                  const vencida = conta.status === "Pendente" && new Date(conta.data_vencimento) < new Date();

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
                      </TableCell>
                      <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                      <TableCell className="max-w-xs truncate">{conta.descricao}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-purple-600" />
                          <span className="text-xs">{empresa?.nome_fantasia || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
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
                            className="text-slate-600"
                          >
                            <Printer className="w-4 h-4" />
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
                              title="Editar Conta"
                          >
                              <Edit2 className="w-4 h-4 text-gray-500" />
                          </Button>
                          {conta.status === "Pendente" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => aprovarPagamentoMutation.mutate(conta.id)}
                              disabled={aprovarPagamentoMutation.isPending}
                              title="Aprovar Pagamento"
                            >
                              <Shield className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          {conta.status === "Aprovado" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleBaixar(conta)}
                              title="Registrar Pagamento"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
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

      {/* Dialog Baixa */}
      <Dialog open={dialogBaixaOpen} onOpenChange={setDialogBaixaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {contaAtual ? 'Registrar Pagamento' : `Pagar Múltiplos Títulos (${contasSelecionadas.length})`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBaixa} className="space-y-4">
            {contaAtual ? (
              <div>
                <Label>Fornecedor</Label>
                <Input value={contaAtual?.fornecedor || ''} disabled />
              </div>
            ) : (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  <p className="font-semibold text-blue-900">Pagando {contasSelecionadas.length} título(s)</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Os valores de juros, multa e desconto serão aplicados individualmente a cada título
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {contaAtual && (
                <div>
                  <Label>Valor Original</Label>
                  <Input value={`R$ ${contaAtual?.valor?.toFixed(2) || 0}`} disabled />
                </div>
              )}
              <div className={contaAtual ? '' : 'col-span-2'}>
                <Label>Data Pagamento *</Label>
                <Input
                  type="date"
                  value={dadosBaixa.data_pagamento}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, data_pagamento: e.target.value })}
                  required
                />
              </div>
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Juros (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.juros}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Multa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.multa}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Desconto (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.desconto}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {contaAtual && (
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valor Total a Pagar (Ajustado):</span>
                  <span className="text-xl font-bold text-red-700">
                    R$ {(
                      (contaAtual?.valor || 0) + 
                      (dadosBaixa.juros || 0) + 
                      (dadosBaixa.multa || 0) - 
                      (dadosBaixa.desconto || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label>Observações</Label>
              <Input
                value={dadosBaixa.observacoes}
                onChange={(e) => setDadosBaixa({ ...dadosBaixa, observacoes: e.target.value })}
                placeholder="Observações sobre o pagamento..."
              />
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