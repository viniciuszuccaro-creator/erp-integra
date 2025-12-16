import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Plus, Edit, Trash2, CheckCircle2, XCircle, TrendingUp, FileText, DollarSign } from "lucide-react";
import { toast } from "sonner";
import TipoDespesaForm from "./TipoDespesaForm";

export default function GestorTiposDespesa() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tipoEdit, setTipoEdit] = useState(null);
  const queryClient = useQueryClient();

  const { data: tipos = [] } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: () => base44.entities.TipoDespesa.list(),
  });

  const createTipo = useMutation({
    mutationFn: (data) => base44.entities.TipoDespesa.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Tipo de despesa criado com sucesso!");
      setShowForm(false);
      setTipoEdit(null);
    },
  });

  const updateTipo = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TipoDespesa.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Tipo de despesa atualizado!");
      setShowForm(false);
      setTipoEdit(null);
    },
  });

  const deleteTipo = useMutation({
    mutationFn: (id) => base44.entities.TipoDespesa.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Tipo de despesa excluído!");
    },
  });

  const toggleAtivo = useMutation({
    mutationFn: (tipo) => base44.entities.TipoDespesa.update(tipo.id, { ativo: !tipo.ativo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-despesa'] });
      toast.success("Status alterado!");
    },
  });

  const handleSubmit = (data) => {
    if (tipoEdit) {
      updateTipo.mutate({ id: tipoEdit.id, data });
    } else {
      createTipo.mutate(data);
    }
  };

  const tiposFiltrados = tipos.filter(t =>
    t.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTipos = tipos.length;
  const tiposAtivos = tipos.filter(t => t.ativa !== false).length;
  const tiposRecorrentes = tipos.filter(t => t.pode_ser_recorrente).length;

  return (
    <div className="w-full h-full space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tipos de Despesa</h2>
            <p className="text-sm text-slate-500">Configurações mestras para categorização financeira</p>
          </div>
        </div>
        <Button onClick={() => { setTipoEdit(null); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Tipos</CardTitle>
            <FileText className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalTipos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tipos Ativos</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tiposAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tipos Recorrentes</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{tiposRecorrentes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Listagem de Tipos de Despesa</CardTitle>
            <Input
              placeholder="Buscar tipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conta Contábil</TableHead>
                <TableHead>Centro Resultado</TableHead>
                <TableHead>Aprovação</TableHead>
                <TableHead>Recorrente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposFiltrados.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-mono text-xs">{tipo.codigo || '-'}</TableCell>
                  <TableCell className="font-medium">{tipo.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tipo.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {tipo.conta_contabil_padrao_nome || '-'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {tipo.centro_resultado_padrao_nome || '-'}
                  </TableCell>
                  <TableCell>
                    {tipo.exige_aprovacao ? (
                      <Badge className="bg-amber-100 text-amber-800">
                        Sim {tipo.limite_aprovacao_automatica > 0 ? `(< R$ ${tipo.limite_aprovacao_automatica})` : ''}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Não</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tipo.pode_ser_recorrente ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300" />
                    )}
                  </TableCell>
                  <TableCell>
                    {tipo.ativo !== false ? (
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleAtivo.mutate(tipo)}
                        title={tipo.ativo !== false ? 'Desativar' : 'Ativar'}
                      >
                        {tipo.ativo !== false ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTipoEdit(tipo);
                          setShowForm(true);
                        }}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`Excluir tipo "${tipo.nome}"?`)) {
                            deleteTipo.mutate(tipo.id);
                          }
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}