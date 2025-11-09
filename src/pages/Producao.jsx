
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import {
  Factory,
  CheckCircle,
  FileText,
  TrendingUp,
  Layers // Added for new Kanban tab icon
} from "lucide-react";
import FormularioInspecao from "../components/qualidade/FormularioInspecao"; // Re-imported for the Inspection Dialog
import { useContextoVisual } from "@/components/lib/useContextoVisual";

import KanbanProducao from "@/components/producao/KanbanProducao";

/**
 * V21.2 - Produção e Manufatura
 * COM: Kanban IA MES, Gêmeo Digital, Otimizador de Corte
 */
export default function Producao() {
  const [aba, setAba] = useState("kanban"); // Changed activeTab to aba, default to kanban
  const [opSelecionada, setOpSelecionada] = useState(null);
  const [inspecaoDialogOpen, setInspecaoDialogOpen] = useState(false);
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);

  // Removed states for searchTerm, statusFilter, opSelecionadaApontamento, itemSelecionado3D
  // as their corresponding UI elements or tabs are removed by the outline.

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    empresaAtual, // Retained from useContextoVisual
    empresasDoGrupo, // Retained for obterNomeEmpresa
    filtrarPorContexto // Retained for ordensProducao
  } = useContextoVisual();

  // Keep these queries as the data might still be used by Kanban or other internal logic
  const { data: ops = [], isLoading } = useQuery({
    queryKey: ['ordens-producao'],
    queryFn: () => base44.entities.OrdemProducao.list('-created_date'),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  // Retained for data processing, though specific UI elements (like a list table) are replaced
  const ordensProducao = filtrarPorContexto(ops, 'empresa_id');

  // Removed handleConcluirOP and related mutation as the "ops" tab is now a placeholder

  // Retained for potential use in dialogs if opSelecionada needs company name
  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-[95vw] mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Produção e Manufatura</h1>
                <p className="text-purple-100">v21.2 - IA MES Preditiva + Gêmeo Digital</p>
              </div>
              <Factory className="w-16 h-16" />
            </div>
          </CardHeader>
        </Card>

        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="bg-white p-1 shadow-md">
            <TabsTrigger value="kanban">
              <Layers className="w-4 h-4 mr-2" />
              Kanban IA MES
            </TabsTrigger>
            <TabsTrigger value="ops">
              <FileText className="w-4 h-4 mr-2" />
              Ordens de Produção
            </TabsTrigger>
            <TabsTrigger value="qualidade">
              <CheckCircle className="w-4 h-4 mr-2" />
              Controle de Qualidade
            </TabsTrigger>
            <TabsTrigger value="refugo">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard Refugo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            {/* Added empresaId as specified in the outline */}
            <KanbanProducao empresaId={empresaAtual?.id} />
          </TabsContent>

          <TabsContent value="ops">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <p>Lista de OPs - Implementar conforme necessário</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualidade">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <p>Controle de Qualidade - Implementar</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="refugo">
            <Card>
              <CardContent className="p-12 text-center text-slate-400">
                <p>Dashboard de Refugo - Implementar</p>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Removed other TabsContent for 'apontamento', 'documentos', 'relatorios', 'config', 'iot-equipamentos' */}
        </Tabs>

        {/* Dialog Inspeção - Kept as per "preserve all other features" */}
        <Dialog open={inspecaoDialogOpen} onOpenChange={setInspecaoDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Inspeção de Qualidade: {opSelecionada?.numero_op}</DialogTitle>
            </DialogHeader>
            {opSelecionada && (
              <FormularioInspecao
                op={opSelecionada}
                item={null}
                onConcluido={() => {
                  setInspecaoDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['ordens-producao'] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Detalhes - Kept as per "preserve all other features" */}
        <Dialog open={detalhesDialogOpen} onOpenChange={setDetalhesDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da OP: {opSelecionada?.numero_op}</DialogTitle>
            </DialogHeader>
            {opSelecionada && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-sm">Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600">Cliente:</span>
                      <span className="ml-2 font-medium">{opSelecionada.cliente_nome}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Pedido:</span>
                      <span className="ml-2 font-medium">{opSelecionada.numero_pedido}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Peso Teórico:</span>
                      <span className="ml-2 font-medium">{opSelecionada.peso_teorico_total_kg?.toFixed(2)} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Peso Real:</span>
                      <span className="ml-2 font-medium">{opSelecionada.peso_real_total_kg?.toFixed(2) || 0} kg</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Itens */}
                <Card>
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="text-sm">Itens de Produção ({opSelecionada.itens_producao?.length || 0})</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>Elemento</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Bitola</TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead>Peso</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(opSelecionada.itens_producao || []).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.elemento}</TableCell>
                            <TableCell>{item.tipo_peca}</TableCell>
                            <TableCell>{item.bitola_principal}</TableCell>
                            <TableCell>{item.quantidade_pecas}</TableCell>
                            <TableCell>{item.peso_teorico_total?.toFixed(2)} kg</TableCell>
                            <TableCell>
                              {item.apontado ? (
                                <Badge className="bg-green-100 text-green-700">Apontado</Badge>
                              ) : (
                                <Badge variant="outline">Pendente</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
