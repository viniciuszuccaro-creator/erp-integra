import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, DollarSign, Building2, Shield, Plus, Edit2, CheckCircle2, AlertCircle, TrendingDown, Calendar, FileText, Eye } from "lucide-react";
import StatusBadge from "../StatusBadge";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { ProtectedAction } from "@/components/ProtectedAction";
import FiltroEmpresaContexto from "@/components/FiltroEmpresaContexto";
import ContaPagarForm from "./ContaPagarForm";
import { useWindow } from "@/components/lib/useWindow";

export default function ContasPagarTab({ contas }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();

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

  const baixarTituloMutation = useMutation({
    mutationFn: async ({ id, dados }) => {
      return await base44.entities.ContaPagar.update(id, {
        status: "Pago",
        data_pagamento: dados.data_pagamento,
        valor_pago: dados.valor_pago,
        forma_pagamento: dados.forma_pagamento,
        juros: dados.juros,
        multa: dados.multa,
        desconto: dados.desconto,
        observacoes: dados.observacoes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título pago!" });
    },
  });

  const aprovarPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      return await base44.entities.ContaPagar.update(contaId, {
        status: "Aprovado",
        aprovador: "Usuário Admin",
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
      // Ensure date formats are compatible with input type="date"
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

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
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

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
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
            
            {/* BACKUP: Dialog removido */}
            <Dialog open={false}>
              <DialogContent className="hidden">
                <DialogHeader>
                  <DialogTitle>Removido</DialogTitle>
                </DialogHeader>
                <form className="hidden">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Descrição *</Label>
                      <Input
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Valor *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Fornecedor *</Label>
                    <Select
                      value={formData.fornecedor_id}
                      onValueChange={(value) => {
                        const forn = fornecedores.find(f => f.id === value);
                        setFormData({
                          ...formData,
                          fornecedor_id: value,
                          fornecedor: forn?.nome || ""
                        });
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o fornecedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {fornecedores.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Empresa *</Label>
                    <Select
                      value={formData.empresa_id}
                      onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.nome_fantasia}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data Emissão *</Label>
                      <Input
                        type="date"
                        value={formData.data_emissao}
                        onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Data Vencimento *</Label>
                      <Input
                        type="date"
                        value={formData.data_vencimento}
                        onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="bg-red-600">
                      {editingConta ? "Atualizar" : "Criar"} Conta
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
                  <TableHead className="w-12"></TableHead>
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
                        {conta.e_replicado && (
                          <Badge variant="outline" className="text-xs" title="Vindo de rateio do grupo">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBaixa} className="space-y-4">
            <div>
              <Label>Fornecedor</Label>
              <Input value={contaAtual?.fornecedor || ''} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Original</Label>
                <Input value={`R$ ${contaAtual?.valor?.toFixed(2) || 0}`} disabled />
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
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="TED">TED</SelectItem>
                    <SelectItem value="DOC">DOC</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogBaixaOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={baixarTituloMutation.isPending} className="bg-green-600">
                {baixarTituloMutation.isPending ? 'Registrando...' : 'Confirmar Pagamento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}