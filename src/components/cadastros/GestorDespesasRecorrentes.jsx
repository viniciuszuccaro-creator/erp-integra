import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useWindow } from "@/components/lib/useWindow";
import { Repeat, Plus, Edit2, Trash2, Play, Pause, TrendingUp, Calendar } from "lucide-react";
import ConfiguracaoDespesaRecorrenteForm from "./ConfiguracaoDespesaRecorrenteForm";

/**
 * GESTOR DE DESPESAS RECORRENTES V21.8
 * 
 * Gerencia configurações de despesas que se repetem
 * (aluguel, salários, tarifas, etc)
 */
export default function GestorDespesasRecorrentes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: configuracoes = [] } = useQuery({
    queryKey: ['configuracoes-despesas-recorrentes'],
    queryFn: () => base44.entities.ConfiguracaoDespesaRecorrente.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const toggleAtivaMutation = useMutation({
    mutationFn: async ({ id, ativa }) => {
      await base44.entities.ConfiguracaoDespesaRecorrente.update(id, { ativa: !ativa });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
      toast({ title: "✅ Status alterado!" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ConfiguracaoDespesaRecorrente.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
      toast({ title: "✅ Configuração excluída!" });
    }
  });

  const configsFiltradas = configuracoes.filter(c =>
    c.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAtivas = configuracoes.filter(c => c.ativa).length;
  const totalValorMensal = configuracoes
    .filter(c => c.ativa && c.periodicidade === 'Mensal')
    .reduce((sum, c) => sum + (c.valor_base || 0), 0);
  const totalComRateio = configuracoes.filter(c => c.rateio_automatico).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{configuracoes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Configurações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totalAtivas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Com Rateio Multiempresa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{totalComRateio}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valor Mensal Recorrente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              R$ {totalValorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-600" />
              Despesas Recorrentes
            </CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={() => openWindow(ConfiguracaoDespesaRecorrenteForm, {
                  windowMode: true,
                  onSubmit: async (data) => {
                    try {
                      await base44.entities.ConfiguracaoDespesaRecorrente.create(data);
                      queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
                      toast({ title: "✅ Configuração criada!" });
                    } catch (error) {
                      toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                    }
                  }
                }, {
                  title: '🔄 Nova Despesa Recorrente',
                  width: 900,
                  height: 650
                })}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Configuração
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Tipo de Despesa</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Valor Base</TableHead>
                <TableHead>Periodicidade</TableHead>
                <TableHead>Rateio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configsFiltradas.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <div className="font-medium text-purple-600 text-sm">
                      {config.tipo_despesa_nome || 'Não vinculado'}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{config.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{config.categoria || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {empresas.find(e => e.id === config.empresa_id)?.nome_fantasia || 'N/A'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    R$ {config.valor_base?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{config.periodicidade}</Badge>
                  </TableCell>
                  <TableCell>
                    {config.rateio_automatico ? (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {config.empresas_rateio?.length || 0} empresas
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {config.ativa ? (
                      <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                    ) : (
                      <Badge variant="outline">Inativa</Badge>
                    )}
                    {config.gerar_automaticamente && (
                      <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs">Auto</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAtivaMutation.mutate({ id: config.id, ativa: config.ativa })}
                        title={config.ativa ? "Desativar" : "Ativar"}
                      >
                        {config.ativa ? (
                          <Pause className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Play className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openWindow(ConfiguracaoDespesaRecorrenteForm, {
                          config,
                          windowMode: true,
                          onSubmit: async (data) => {
                            try {
                              await base44.entities.ConfiguracaoDespesaRecorrente.update(config.id, data);
                              queryClient.invalidateQueries({ queryKey: ['configuracoes-despesas-recorrentes'] });
                              toast({ title: "✅ Configuração atualizada!" });
                            } catch (error) {
                              toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                            }
                          }
                        }, {
                          title: `✏️ Editar: ${config.descricao}`,
                          width: 900,
                          height: 650
                        })}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Deseja realmente excluir esta configuração?')) {
                            deleteMutation.mutate(config.id);
                          }
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {configsFiltradas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Repeat className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma configuração de despesa recorrente encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}