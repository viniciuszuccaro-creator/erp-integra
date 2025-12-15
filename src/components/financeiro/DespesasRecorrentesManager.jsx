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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Play, RefreshCw, Calendar, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";

export default function DespesasRecorrentesManager({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formasPagamento } = useFormasPagamento();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [formData, setFormData] = useState({
    descricao: "",
    tipo_despesa: "Outro",
    fornecedor: "",
    fornecedor_id: "",
    valor_fixo: 0,
    periodicidade: "Mensal",
    dia_vencimento: 10,
    forma_pagamento_padrao_id: "",
    categoria: "Outros",
    centro_custo_id: "",
    ativa: true,
    requer_aprovacao: false,
    dias_antecedencia_geracao: 5
  });

  const { data: despesas = [] } = useQuery({
    queryKey: ['despesas-recorrentes', empresaId],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.filter({ empresa_id: empresaId }),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centros-custo'],
    queryFn: () => base44.entities.CentroCusto.list(),
  });

  const criarDespesaMutation = useMutation({
    mutationFn: (data) => base44.entities.ConfiguracaoDespesaRecorrente.create({
      ...data,
      empresa_id: empresaId,
      data_inicio_vigencia: new Date().toISOString().split('T')[0],
      proxima_geracao: calcularProximaGeracao(data.dia_vencimento, data.dias_antecedencia_geracao)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "✅ Despesa recorrente configurada!" });
    }
  });

  const atualizarDespesaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ConfiguracaoDespesaRecorrente.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "✅ Despesa atualizada!" });
    }
  });

  const gerarAgoraMutation = useMutation({
    mutationFn: async (despesa) => {
      const fornecedorData = fornecedores.find(f => f.id === despesa.fornecedor_id);
      
      const conta = await base44.entities.ContaPagar.create({
        group_id: despesa.group_id,
        empresa_id: despesa.empresa_id,
        descricao: `${despesa.descricao} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        fornecedor: despesa.fornecedor || "Despesa Fixa",
        fornecedor_id: despesa.fornecedor_id,
        valor: despesa.valor_fixo,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: calcularDataVencimento(despesa.dia_vencimento),
        status: despesa.requer_aprovacao ? "Aguardando Aprovação" : "Pendente",
        categoria: despesa.categoria,
        centro_custo_id: despesa.centro_custo_id,
        forma_pagamento: despesa.forma_pagamento_padrao_nome,
        origem: "empresa",
        observacoes: `Gerado automaticamente de: ${despesa.descricao}`
      });

      // Atualizar despesa
      await base44.entities.ConfiguracaoDespesaRecorrente.update(despesa.id, {
        ultima_geracao: new Date().toISOString(),
        proxima_geracao: calcularProximaGeracao(despesa.dia_vencimento, despesa.dias_antecedencia_geracao, 1),
        contas_geradas_ids: [...(despesa.contas_geradas_ids || []), conta.id]
      });

      return conta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      toast({ title: "✅ Conta a pagar gerada!" });
    }
  });

  const calcularProximaGeracao = (diaVencimento, diasAntecedencia, mesesFrente = 0) => {
    const hoje = new Date();
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1 + mesesFrente, diaVencimento);
    proximoMes.setDate(proximoMes.getDate() - diasAntecedencia);
    return proximoMes.toISOString().split('T')[0];
  };

  const calcularDataVencimento = (dia) => {
    const hoje = new Date();
    const vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia);
    return vencimento.toISOString().split('T')[0];
  };

  const resetForm = () => {
    setFormData({
      descricao: "",
      tipo_despesa: "Outro",
      fornecedor: "",
      fornecedor_id: "",
      valor_fixo: 0,
      periodicidade: "Mensal",
      dia_vencimento: 10,
      forma_pagamento_padrao_id: "",
      categoria: "Outros",
      centro_custo_id: "",
      ativa: true,
      requer_aprovacao: false,
      dias_antecedencia_geracao: 5
    });
    setEditando(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const forma = formasPagamento.find(f => f.id === formData.forma_pagamento_padrao_id);
    const centro = centrosCusto.find(c => c.id === formData.centro_custo_id);
    
    const data = {
      ...formData,
      forma_pagamento_padrao_nome: forma?.descricao,
      centro_custo_nome: centro?.descricao
    };

    if (editando) {
      atualizarDespesaMutation.mutate({ id: editando.id, data });
    } else {
      criarDespesaMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6 w-full h-full">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-slate-600">Despesas Ativas</p>
                <p className="text-2xl font-bold">{despesas.filter(d => d.ativa).length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Geradas Este Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {despesas.filter(d => {
                    const ultima = d.ultima_geracao ? new Date(d.ultima_geracao) : null;
                    const hoje = new Date();
                    return ultima && ultima.getMonth() === hoje.getMonth() && ultima.getFullYear() === hoje.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa Recorrente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Despesas Recorrentes Configuradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Periodicidade</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Próxima Geração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.map((despesa) => (
                <TableRow key={despesa.id}>
                  <TableCell className="font-medium">{despesa.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{despesa.tipo_despesa}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {despesa.valor_fixo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-sm">{despesa.periodicidade}</TableCell>
                  <TableCell className="text-sm">Dia {despesa.dia_vencimento}</TableCell>
                  <TableCell className="text-sm">
                    {despesa.proxima_geracao ? new Date(despesa.proxima_geracao).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell>
                    {despesa.ativa ? (
                      <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inativa</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => gerarAgoraMutation.mutate(despesa)}
                        disabled={gerarAgoraMutation.isPending}
                        title="Gerar Conta Agora"
                      >
                        <Play className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditando(despesa);
                          setFormData(despesa);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar' : 'Nova'} Despesa Recorrente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Despesa *</Label>
                <Select value={formData.tipo_despesa} onValueChange={(v) => setFormData({ ...formData, tipo_despesa: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Salário">Salário</SelectItem>
                    <SelectItem value="Tarifa Bancária">Tarifa Bancária</SelectItem>
                    <SelectItem value="Taxa Cartão">Taxa Cartão</SelectItem>
                    <SelectItem value="Impostos">Impostos</SelectItem>
                    <SelectItem value="Energia">Energia</SelectItem>
                    <SelectItem value="Água">Água</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Software/SaaS">Software/SaaS</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                    <SelectItem value="Salários">Salários</SelectItem>
                    <SelectItem value="Impostos">Impostos</SelectItem>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Energia">Energia</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fornecedor</Label>
                <Select value={formData.fornecedor_id} onValueChange={(v) => {
                  const forn = fornecedores.find(f => f.id === v);
                  setFormData({ ...formData, fornecedor_id: v, fornecedor: forn?.nome });
                }}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {fornecedores.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Fixo *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_fixo}
                  onChange={(e) => setFormData({ ...formData, valor_fixo: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Periodicidade *</Label>
                <Select value={formData.periodicidade} onValueChange={(v) => setFormData({ ...formData, periodicidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Bimestral">Bimestral</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Semestral">Semestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dia Vencimento *</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_vencimento}
                  onChange={(e) => setFormData({ ...formData, dia_vencimento: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Antecedência (dias)</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.dias_antecedencia_geracao}
                  onChange={(e) => setFormData({ ...formData, dias_antecedencia_geracao: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Forma de Pagamento Padrão</Label>
              <Select value={formData.forma_pagamento_padrao_id} onValueChange={(v) => setFormData({ ...formData, forma_pagamento_padrao_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {formasPagamento.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.ativa}
                  onCheckedChange={(v) => setFormData({ ...formData, ativa: v })}
                />
                <Label>Ativa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.requer_aprovacao}
                  onCheckedChange={(v) => setFormData({ ...formData, requer_aprovacao: v })}
                />
                <Label>Requer Aprovação</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={criarDespesaMutation.isPending || atualizarDespesaMutation.isPending}>
                {editando ? 'Atualizar' : 'Criar'} Despesa
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}