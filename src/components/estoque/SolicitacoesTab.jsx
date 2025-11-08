
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function SolicitacoesTab({ solicitacoes, produtos }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    produto_id: "",
    produto_nome: "",
    quantidade: "",
    unidade_medida: "",
    data_necessidade: "",
    motivo: "",
    prioridade: "Normal",
    solicitante: "",
    centro_custo: "",
    status: "Pendente"
  });

  const queryClient = useQueryClient();

  const resetForm = () => {
    setNovaSolicitacao({
      produto_id: "",
      produto_nome: "",
      quantidade: "",
      unidade_medida: "",
      data_necessidade: "",
      motivo: "",
      prioridade: "Normal",
      solicitante: "",
      centro_custo: "",
      status: "Pendente"
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const novaSolicitacao = await base44.entities.SolicitacaoCompra.create(data);
      return novaSolicitacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const aprovarSolicitacaoMutation = useMutation({
    mutationFn: async ({ solicitacao, aprovador }) => {
      await base44.entities.SolicitacaoCompra.update(solicitacao.id, {
        status: 'Aprovada',
        aprovador: aprovador,
        data_aprovacao: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
    },
  });

  const rejeitarSolicitacaoMutation = useMutation({
    mutationFn: async ({ solicitacao, aprovador, motivo }) => {
      await base44.entities.SolicitacaoCompra.update(solicitacao.id, {
        status: 'Rejeitada',
        aprovador: aprovador
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
    },
  });

  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setNovaSolicitacao({
        ...novaSolicitacao,
        produto_id: produtoId,
        produto_nome: produto.descricao,
        unidade_medida: produto.unidade_medida
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await base44.auth.me();
    
    createMutation.mutate({
      ...novaSolicitacao,
      solicitante: user?.full_name || 'Sistema'
    });
  };

  const handleAprovar = async (solicitacao) => {
    const user = await base44.auth.me();
    aprovarSolicitacaoMutation.mutate({
      solicitacao,
      aprovador: user?.full_name || 'Sistema'
    });
  };

  const handleRejeitar = async (solicitacao) => {
    const user = await base44.auth.me();
    const motivo = prompt('Motivo da rejeição:');
    if (motivo) {
      rejeitarSolicitacaoMutation.mutate({
        solicitacao,
        aprovador: user?.full_name || 'Sistema',
        motivo
      });
    }
  };

  const filteredSolicitacoes = solicitacoes.filter(s =>
    s.produto_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.solicitante?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Em Análise': 'bg-blue-100 text-blue-700',
    'Aprovada': 'bg-green-100 text-green-700',
    'Rejeitada': 'bg-red-100 text-red-700',
    'Compra Gerada': 'bg-purple-100 text-purple-700',
    'Finalizada': 'bg-gray-100 text-gray-700'
  };

  const prioridadeColors = {
    'Baixa': 'bg-slate-100 text-slate-700',
    'Normal': 'bg-blue-100 text-blue-700', // Changed from Média
    'Alta': 'bg-orange-100 text-orange-700',
    'Urgente': 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto, solicitante ou nº"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Solicitação de Compra</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="produto">Produto *</Label>
                  <Select
                    value={novaSolicitacao.produto_id}
                    onValueChange={handleProdutoChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.filter(p => p.status === 'Ativo').map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.codigo ? `${produto.codigo} - ` : ''}{produto.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    step="0.01"
                    value={novaSolicitacao.quantidade}
                    onChange={(e) => setNovaSolicitacao({ ...novaSolicitacao, quantidade: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unidade_medida">Unidade</Label>
                  <Input
                    id="unidade_medida"
                    value={novaSolicitacao.unidade_medida}
                    readOnly
                    className="bg-slate-50"
                  />
                </div>

                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={novaSolicitacao.prioridade}
                    onValueChange={(value) => setNovaSolicitacao({ ...novaSolicitacao, prioridade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="data_necessidade">Data Necessidade</Label>
                  <Input
                    id="data_necessidade"
                    type="date"
                    value={novaSolicitacao.data_necessidade}
                    onChange={(e) => setNovaSolicitacao({ ...novaSolicitacao, data_necessidade: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="motivo">Motivo da Solicitação</Label>
                  <Textarea
                    id="motivo"
                    value={novaSolicitacao.motivo}
                    onChange={(e) => setNovaSolicitacao({ ...novaSolicitacao, motivo: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="centro_custo">Centro de Custo</Label>
                  <Input
                    id="centro_custo"
                    value={novaSolicitacao.centro_custo}
                    onChange={(e) => setNovaSolicitacao({ ...novaSolicitacao, centro_custo: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                  {createMutation.isPending ? 'Salvando...' : 'Enviar Solicitação'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitacoes.map((sol) => (
                <TableRow key={sol.id} className="hover:bg-slate-50">
                  <TableCell>
                    {new Date(sol.data_solicitacao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{sol.produto_nome}</TableCell>
                  <TableCell>
                    {sol.quantidade} {sol.unidade_medida || 'UN'}
                  </TableCell>
                  <TableCell>{sol.solicitante}</TableCell>
                  <TableCell>
                    <Badge className={prioridadeColors[sol.prioridade]}>
                      {sol.prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[sol.status]}>
                      {sol.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sol.status === 'Pendente' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAprovar(sol)}
                          disabled={aprovarSolicitacaoMutation.isPending}
                          className="text-green-600 hover:bg-green-50 text-xs"
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejeitar(sol)}
                          disabled={rejeitarSolicitacaoMutation.isPending}
                          className="text-red-600 hover:bg-red-50 text-xs"
                        >
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredSolicitacoes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma solicitação encontrada</p>
          </div>
        )}
      </Card>
    </div>
  );
}
