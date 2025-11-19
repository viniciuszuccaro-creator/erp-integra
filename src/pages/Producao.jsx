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
  Package,
  Clock,
  AlertTriangle,
  Search,
  CheckCircle,
  BarChart3,
  Building2,
  Eye,
  Play,
  Truck,
  Settings,
  FileText,
  AlertCircle,
  Pause,
  StopCircle,
  Edit,
  TrendingUp,
  Activity,
  LayoutGrid // Added from outline
} from "lucide-react";
import ApontamentoProducao from "@/components/producao/ApontamentoProducao";
import ControleRefugo from "@/components/producao/ControleRefugo";
import RelatoriosProducao from "@/components/producao/RelatoriosProducao";
import FormularioInspecao from "../components/qualidade/FormularioInspecao";
import RelatorioQualidade from "../components/qualidade/RelatorioQualidade";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { concluirOPCompleto } from "../components/lib/useFluxoPedido";
import { useWindow } from "@/components/lib/useWindow";

import ConfiguracaoProducao from "../components/producao/ConfiguracaoProducao";
import DocumentosProducao from "../components/producao/DocumentosProducao";
import KanbanProducao from "../components/producao/KanbanProducao"; // Existing import
import DashboardRefugoIA from "../components/producao/DashboardRefugoIA";
import DigitalTwin3D from "../components/producao/DigitalTwin3D";
import IADiagnosticoEquipamentos from "../components/producao/IADiagnosticoEquipamentos";

export default function Producao() {
  const [activeTab, setActiveTab] = useState("kanban"); // ALTERADO: default agora é kanban
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [opSelecionada, setOpSelecionada] = useState(null);
  const [inspecaoDialogOpen, setInspecaoDialogOpen] = useState(false);
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);

  // NEW: States for the new apontamento tab
  const [opSelecionadaApontamento, setOpSelecionadaApontamento] = useState(null);

  // REMOVED: NOVO: Estado para visualização Kanban - now using a dedicated tab
  // const [visualizacao, setVisualizacao] = useState('lista'); // 'lista' ou 'kanban'

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    estaNoGrupo,
    empresaAtual,
    empresasDoGrupo,
    filtrarPorContexto
  } = useContextoVisual();

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

  // Renamed opsFiltradasContexto to ordensProducao as per outline's usage
  const ordensProducao = filtrarPorContexto(ops, 'empresa_id');

  // NOVO: Concluir OP com integração completa usando useFluxoPedido (now concluirOPCompleto)
  const handleConcluirOP = async (opId) => {
    try {
      await concluirOPCompleto.mutateAsync(opId); // Changed to use concluirOPCompleto
      toast({ title: "✅ OP enviada para expedição!" });
    } catch (error) {
      console.error("Erro ao enviar OP para expedição:", error);
      toast({
        title: "❌ Erro ao enviar OP para expedição",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const opsFiltradas2 = ordensProducao.filter(op => { // Updated to use ordensProducao
    const matchStatus = statusFilter === "todos" || op.status === statusFilter;
    const matchBusca = searchTerm === "" ||
      op.numero_op?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchBusca;
  });

  const totalOPs = ordensProducao.length; // Updated to use ordensProducao
  const opsLiberadas = ordensProducao.filter(op => op.status === "Liberada").length; // Updated to use ordensProducao
  const opsEmProducao = ordensProducao.filter(op => // Updated to use ordensProducao
    ["Em Corte", "Em Dobra", "Em Armação"].includes(op.status)
  ).length;
  const opsFinalizadas = ordensProducao.filter(op => op.status === "Finalizada").length; // Updated to use ordensProducao
  const pesoTotalProduzido = ordensProducao.reduce((sum, op) => sum + (op.peso_real_total_kg || 0), 0); // Updated to use ordensProducao

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '';
  };

  const [itemSelecionado3D, setItemSelecionado3D] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Factory className="w-8 h-8 text-blue-600" />
              Produção e Manufatura
            </h1>
            <p className="text-slate-600">
              {estaNoGrupo
                ? 'Visão consolidada de todas as produções'
                : `Gestão de produção - ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || ''}`
              }
            </p>
          </div>

          {/* REMOVED: NOVO: Toggle Visualização - now using a dedicated tab */}
          {/*
          <div className="flex gap-2">
            <Button
              variant={visualizacao === 'lista' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualizacao('lista')}
            >
              Lista
            </Button>
            <Button
              variant={visualizacao === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVisualizacao('kanban')}
            >
              Kanban
            </Button>
          </div>
          */}

          {estaNoGrupo && (
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              Visão Consolidada
            </Badge>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <p className="text-xs text-slate-600">Total OPs</p>
              <p className="text-2xl font-bold">{totalOPs}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-yellow-50">
            <CardContent className="p-4">
              <p className="text-xs text-yellow-700">Liberadas</p>
              <p className="text-2xl font-bold text-yellow-900">{opsLiberadas}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-blue-50">
            <CardContent className="p-4">
              <p className="text-xs text-blue-700">Em Produção</p>
              <p className="text-2xl font-bold text-blue-900">{opsEmProducao}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-green-50">
            <CardContent className="p-4">
              <p className="text-xs text-green-700">Finalizadas</p>
              <p className="text-2xl font-bold text-green-900">{opsFinalizadas}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-purple-50">
            <CardContent className="p-4">
              <p className="text-xs text-purple-700">Peso Produzido</p>
              <p className="text-2xl font-bold text-purple-900">{pesoTotalProduzido.toFixed(0)} kg</p>
            </CardContent>
          </Card>
        </div>

        {/* NEW: Tabs layout and styling updated */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
            {/* NOVA: Tab Kanban como primeira */}
            <TabsTrigger
              value="kanban"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Kanban Produção
            </TabsTrigger>
            <TabsTrigger value="ops" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Ordens de Produção
            </TabsTrigger>
            <TabsTrigger value="apontamento" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              Apontamentos
            </TabsTrigger>
            <TabsTrigger value="qualidade" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Controle Qualidade
            </TabsTrigger>
            <TabsTrigger value="refugo" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Controle de Refugo
            </TabsTrigger>
            {/* NEW: Documentos Tab Trigger */}
            <TabsTrigger value="documentos" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
            {/* NOVA: Tab IoT e Equipamentos */}
            <TabsTrigger
              value="iot-equipamentos"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              IoT & Equipamentos
            </TabsTrigger>
          </TabsList>

          {/* NOVA: Tab Kanban */}
          <TabsContent value="kanban">
            <KanbanProducao
              onViewOP={(op) => {
                setOpSelecionada(op);
                setDetalhesDialogOpen(true); // Changed to open details dialog, as 'ops' tab does not directly show single OP view anymore.
              }}
            />
          </TabsContent>

          <TabsContent value="ops" className="space-y-4">
            {/* Removed: NOVO: Visualização Kanban ou Lista - now managed by dedicated Kanban tab */}
            {/* The content for the "ops" tab is now exclusively the list view. */}
            <>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        placeholder="Buscar OP, pedido ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Todos Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Status</SelectItem>
                        <SelectItem value="Liberada">Liberada</SelectItem>
                        <SelectItem value="Em Corte">Em Corte</SelectItem>
                        <SelectItem value="Em Dobra">Em Dobra</SelectItem>
                        <SelectItem value="Em Armação">Em Armação</SelectItem>
                        <SelectItem value="Pronta para Expedição">Pronta</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                        <SelectItem value="Expedida">Expedida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead>OP</TableHead>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Cliente</TableHead>
                          {estaNoGrupo && <TableHead>Empresa</TableHead>}
                          <TableHead>Peso Teórico</TableHead>
                          <TableHead>Peso Real</TableHead>
                          <TableHead>Perda</TableHead>
                          <TableHead>Conclusão</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={estaNoGrupo ? 10 : 9} className="text-center py-4 text-slate-500">
                              Carregando ordens de produção...
                            </TableCell>
                          </TableRow>
                        ) : opsFiltradas2.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={estaNoGrupo ? 10 : 9} className="text-center py-12 text-slate-500">
                              <Factory className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                              <p>Nenhuma ordem de produção encontrada</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          opsFiltradas2.map(op => (
                            <TableRow key={op.id} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{op.numero_op}</TableCell>
                              <TableCell>{op.numero_pedido}</TableCell>
                              <TableCell>{op.cliente_nome}</TableCell>
                              {estaNoGrupo && (
                                <TableCell>
                                  <Building2 className="w-4 h-4 inline mr-1" />
                                  {op._empresa_label || obterNomeEmpresa(op.empresa_id)}
                                </TableCell>
                              )}
                              <TableCell>{op.peso_teorico_total_kg?.toFixed(2)} kg</TableCell>
                              <TableCell className="font-semibold">
                                {op.peso_real_total_kg?.toFixed(2) || 0} kg
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  parseFloat(op.perda_percentual_real || 0) > parseFloat(op.perda_percentual_configurada || 0)
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }>
                                  {op.perda_percentual_real?.toFixed(1) || 0}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${op.percentual_conclusao || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs">{op.percentual_conclusao || 0}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{op.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setOpSelecionada(op);
                                      setDetalhesDialogOpen(true);
                                    }}
                                    title="Ver Detalhes"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {op.status !== "Finalizada" && op.status !== "Expedida" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setOpSelecionada(op);
                                        // NEW: Instead of dialog, switch to the tab
                                        setOpSelecionadaApontamento(op);
                                        setActiveTab("apontamento");
                                      }}
                                      title="Apontar"
                                    >
                                      <Clock className="w-4 h-4 text-blue-600" />
                                    </Button>
                                  )}
                                  {op.percentual_conclusao === 100 && op.status !== "Expedida" && (
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     onClick={() => openWindow(FormularioInspecao, {
                                       op,
                                       windowMode: true,
                                       onConcluido: () => {
                                         queryClient.invalidateQueries({ queryKey: ['ordens-producao'] });
                                       }
                                     }, {
                                       title: `🔍 Inspeção: ${op.numero_op}`,
                                       width: 1000,
                                       height: 650
                                     })}
                                     title="Realizar Inspeção de Qualidade"
                                   >
                                     <CheckCircle className="w-4 h-4 text-purple-600" />
                                   </Button>
                                  )}
                                  {op.percentual_conclusao === 100 && op.status !== "Expedida" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleConcluirOP(op.id)} // NEW: Use handleConcluirOP
                                      disabled={concluirOPCompleto.isPending} // NEW: Use concluirOPCompleto's pending state
                                      title="Enviar para Expedição"
                                    >
                                      <Truck className="w-4 h-4 text-green-600" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          </TabsContent>

          {/* NEW: Updated TabsContent for apontamento */}
          <TabsContent value="apontamento">
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle>Apontamento de Produção</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label htmlFor="select-op-apontar">Selecione a OP para apontar</Label>
                  <Select
                    value={opSelecionadaApontamento?.id || ""} // Ensure controlled component
                    onValueChange={(opId) => {
                      const op = ordensProducao.find(o => o.id === opId);
                      setOpSelecionadaApontamento(op);
                    }}>
                    <SelectTrigger id="select-op-apontar" className="mt-2">
                      <SelectValue placeholder="Escolha uma OP..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ordensProducao
                        .filter(op => op.status !== "Finalizada" && op.status !== "Cancelada" && op.status !== "Expedida")
                        .map(op => (
                          <SelectItem key={op.id} value={op.id}>
                            {op.numero_op} - {op.cliente_nome} ({op.status})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {opSelecionadaApontamento ? (
                  <ApontamentoProducao
                    opId={opSelecionadaApontamento.id}
                    op={opSelecionadaApontamento}
                    onApontamentoSalvo={() => {
                      queryClient.invalidateQueries({ queryKey: ['ordens-producao'] });
                      setOpSelecionadaApontamento(null); // Clear selection after saving
                      setActiveTab("ops"); // Optionally return to ops tab
                    }}
                  />
                ) : (
                  <div className="p-12 text-center text-slate-500">
                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma OP selecionada para apontamento.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualidade">
            <RelatorioQualidade empresaId={empresaAtual?.id} />
          </TabsContent>

          {/* NOVO: Tab Dashboard Refugo IA */}
          <TabsContent value="refugo">
            <DashboardRefugoIA empresaId={empresaAtual?.id} />
            <div className="mt-6">
              <ControleRefugo ops={ordensProducao} />
            </div>
          </TabsContent>

          {/* NEW: Added TabsContent for documentos */}
          <TabsContent value="documentos">
            <DocumentosProducao />
          </TabsContent>

          <TabsContent value="relatorios">
            <RelatoriosProducao ops={ordensProducao} />
          </TabsContent>

          {/* NEW: Updated TabsContent for config to use ConfiguracaoProducao */}
          <TabsContent value="config">
            <ConfiguracaoProducao />
          </TabsContent>

          {/* NOVA: Tab IoT e Equipamentos */}
          <TabsContent value="iot-equipamentos">
            <div className="grid lg:grid-cols-2 gap-6">
              <IADiagnosticoEquipamentos />
              {itemSelecionado3D && (
                <DigitalTwin3D itemProducao={itemSelecionado3D} />
              )}
            </div>
          </TabsContent>

        </Tabs>



        {/* Dialog Detalhes */}
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