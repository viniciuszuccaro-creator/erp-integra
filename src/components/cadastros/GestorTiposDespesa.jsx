import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Plus, Edit, Trash2, CheckCircle2, XCircle, TrendingUp, FileText, DollarSign, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";
import TipoDespesaForm from "./TipoDespesaForm";
import { useWindow } from "@/components/lib/useWindow";
import GestorDespesasUnificado from "../financeiro/GestorDespesasUnificado";

/**
 * GESTOR DE TIPOS DE DESPESA V21.9 - MELHORADO
 * 
 * Gerencia tipos de despesa que são a FONTE MESTRE para classificação financeira
 * Define vínculos com Plano de Contas e Centros de Resultado
 * Controla quais tipos podem ser recorrentes
 * Integrado com GestorDespesasUnificado
 */
export default function GestorTiposDespesa() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tipoEdit, setTipoEdit] = useState(null);
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();

  const { data: tipos = [] } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: () => base44.entities.TipoDespesa.list(),
  });

  const { data: despesasRecorrentes = [] } = useQuery({
    queryKey: ['configuracoes-despesas-recorrentes'],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.list(),
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
  const tiposAtivos = tipos.filter(t => t.ativo !== false).length;
  const tiposRecorrentes = tipos.filter(t => t.pode_ser_recorrente).length;
  const tiposComAprovacao = tipos.filter(t => t.exige_aprovacao).length;

  return (
    <div className="w-full h-full space-y-4 p-6 overflow-auto">
      {/* Link para Gestor Unificado */}
      <div className="bg-gradient-to-r from-rose-50 via-purple-50 to-blue-50 border-2 border-rose-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-rose-600" />
            <div>
              <p className="font-bold text-rose-900">💡 Novo: Gestão Unificada de Despesas</p>
              <p className="text-sm text-rose-700">Tipos + Recorrentes + Análises IA em um único lugar</p>
            </div>
          </div>
          <Button
            onClick={() => openWindow(
              GestorDespesasUnificado,
              { windowMode: true },
              { title: '🎯 Gestão Unificada de Despesas', width: 1600, height: 900 }
            )}
            className="bg-gradient-to-r from-rose-600 via-purple-600 to-blue-600 hover:from-rose-700 hover:via-purple-700 hover:to-blue-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Abrir Gestor Completo
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg">
            <Receipt className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tipos de Despesa</h2>
            <p className="text-sm text-slate-500">Configurações mestras para classificação financeira e vínculos contábeis</p>
          </div>
        </div>
        <Button 
          onClick={() => openWindow(
            TipoDespesaForm,
            {
              windowMode: true,
              onSubmit: handleSubmit
            },
            {
              title: '💳 Novo Tipo de Despesa',
              width: 850,
              height: 650
            }
          )} 
          className="bg-rose-600 hover:bg-rose-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-slate-600">Podem ser Recorrentes</CardTitle>
            <Calendar className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{tiposRecorrentes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Com Aprovação</CardTitle>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{tiposComAprovacao}</div>
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
                <TableHead>Uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposFiltrados.map((tipo) => {
                const usoRecorrente = despesasRecorrentes.filter(dr => dr.tipo_despesa_id === tipo.id).length;
                return (
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
                        <Badge className="bg-amber-100 text-amber-800 text-xs">
                          Sim {tipo.limite_aprovacao_automatica > 0 ? `(< R$ ${tipo.limite_aprovacao_automatica})` : ''}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Não</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {tipo.pode_ser_recorrente ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300" />
                      )}
                    </TableCell>
                    <TableCell>
                      {usoRecorrente > 0 ? (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          {usoRecorrente} config{usoRecorrente > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
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
                          {tipo.ativo !== false ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openWindow(
                            TipoDespesaForm,
                            {
                              tipoDespesa: tipo,
                              windowMode: true,
                              onSubmit: handleSubmit
                            },
                            {
                              title: `💳 Editar: ${tipo.nome}`,
                              width: 850,
                              height: 650
                            }
                          )}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (usoRecorrente > 0) {
                              toast.error(`Não é possível excluir. Este tipo está sendo usado em ${usoRecorrente} configuração(ões) recorrente(s).`);
                              return;
                            }
                            if (confirm(`Excluir tipo "${tipo.nome}"?`)) {
                              deleteTipo.mutate(tipo.id);
                            }
                          }}
                          title="Excluir"
                          disabled={usoRecorrente > 0}
                        >
                          <Trash2 className={`w-4 h-4 ${usoRecorrente > 0 ? 'text-slate-300' : 'text-red-500'}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {tiposFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum tipo de despesa encontrado</p>
              <p className="text-xs mt-2">Crie tipos para classificar suas despesas e configurar recorrências</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              {tipoEdit ? 'Editar Tipo de Despesa' : 'Novo Tipo de Despesa'}
            </DialogTitle>
          </DialogHeader>
          <TipoDespesaForm
            tipoDespesa={tipoEdit}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}