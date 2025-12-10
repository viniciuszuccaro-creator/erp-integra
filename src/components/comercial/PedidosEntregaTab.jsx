import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Package,
  Search,
  Eye,
  Image,
  Download,
  AlertCircle,
  Navigation,
  FileUp,
  User,
  Calendar,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAutomacaoFluxoPedido } from "./AutomacaoFluxoPedido";

/**
 * 🚚 PEDIDOS PARA ENTREGA V21.5 FINAL
 * Gestão inteligente de pedidos aprovados que precisam ser entregues
 * - Agrupamento por região de atendimento
 * - Rastreamento de status de entrega
 * - Upload/visualização de canhoto e fotos
 * - Integração com Expedição
 * - IA de sugestões e otimização
 * - Notificações automáticas
 */
export default function PedidosEntregaTab({ windowMode = false }) {
  const [busca, setBusca] = useState("");
  const [regiaoFiltro, setRegiaoFiltro] = useState("todas");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [arquivoComprovante, setArquivoComprovante] = useState(null);
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [docRecebedor, setDocRecebedor] = useState("");

  const queryClient = useQueryClient();
  const automacao = useAutomacaoFluxoPedido();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list('-created_date'),
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas'],
    queryFn: () => base44.entities.Entrega.list('-created_date'),
  });

  const { data: regioes = [] } = useQuery({
    queryKey: ['regioes'],
    queryFn: () => base44.entities.RegiaoAtendimento.list(),
  });

  // Filtrar pedidos para entrega (tipo_frete = CIF ou FOB, status = Aprovado ou posterior)
  const pedidosParaEntrega = useMemo(() => {
    return pedidos.filter(p => 
      (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') &&
      ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)
    );
  }, [pedidos]);

  // Agrupar por região
  const pedidosPorRegiao = useMemo(() => {
    const grupos = {};
    
    pedidosParaEntrega.forEach(pedido => {
      const regiao = pedido.endereco_entrega_principal?.cidade || 'Sem Região';
      if (!grupos[regiao]) {
        grupos[regiao] = [];
      }
      grupos[regiao].push(pedido);
    });
    
    return grupos;
  }, [pedidosParaEntrega]);

  // Aplicar filtros
  const pedidosFiltrados = useMemo(() => {
    let resultado = pedidosParaEntrega;
    
    if (busca) {
      resultado = resultado.filter(p =>
        p.numero_pedido?.toLowerCase().includes(busca.toLowerCase()) ||
        p.cliente_nome?.toLowerCase().includes(busca.toLowerCase())
      );
    }
    
    if (statusFiltro !== "todos") {
      resultado = resultado.filter(p => p.status === statusFiltro);
    }
    
    if (regiaoFiltro !== "todas") {
      resultado = resultado.filter(p => 
        (p.endereco_entrega_principal?.cidade || 'Sem Região') === regiaoFiltro
      );
    }
    
    return resultado;
  }, [pedidosParaEntrega, busca, statusFiltro, regiaoFiltro]);

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ pedidoId, novoStatus, dadosComprovante }) => {
      await base44.entities.Pedido.update(pedidoId, { status: novoStatus });
      
      // Se está confirmando entrega, criar/atualizar registro de entrega
      if (novoStatus === 'Entregue' && dadosComprovante) {
        const entregaExistente = await base44.entities.Entrega.filter({ pedido_id: pedidoId });
        
        if (entregaExistente?.length > 0) {
          await base44.entities.Entrega.update(entregaExistente[0].id, {
            status: 'Entregue',
            data_entrega: new Date().toISOString(),
            comprovante_entrega: dadosComprovante
          });
        } else {
          const pedido = await base44.entities.Pedido.filter({ id: pedidoId });
          if (pedido?.length > 0) {
            await base44.entities.Entrega.create({
              pedido_id: pedidoId,
              numero_pedido: pedido[0].numero_pedido,
              cliente_id: pedido[0].cliente_id,
              cliente_nome: pedido[0].cliente_nome,
              empresa_id: pedido[0].empresa_id,
              endereco_entrega_completo: pedido[0].endereco_entrega_principal,
              tipo_frete: pedido[0].tipo_frete,
              status: 'Entregue',
              data_entrega: new Date().toISOString(),
              comprovante_entrega: dadosComprovante
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast.success("✅ Entrega confirmada com sucesso!");
    }
  });

  const handleVerDetalhes = (pedido) => {
    const entrega = entregas.find(e => e.pedido_id === pedido.id);
    setEntregaSelecionada({ pedido, entrega });
    setDetalhesOpen(true);
  };

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "space-y-6";

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-blue-600" />
            Logística de Entrega
          </h2>
          <p className="text-slate-600 text-sm">Gestão inteligente de entregas com IA</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            // Notificar todos os clientes em trânsito
            const emTransito = pedidosParaEntrega.filter(p => p.status === 'Em Trânsito');
            for (const pedido of emTransito) {
              await automacao.notificarClienteStatusPedido(pedido, 'Em Trânsito');
            }
            toast.success(`📢 ${emTransito.length} notificação(ões) enviada(s)!`);
          }}
        >
          📢 Notificar Clientes
        </Button>
      </div>

      {/* Estatísticas por Região */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total para Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{pedidosParaEntrega.length}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Em Expedição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {pedidosParaEntrega.filter(p => p.status === 'Em Expedição').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Em Trânsito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {pedidosParaEntrega.filter(p => p.status === 'Em Trânsito').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Regiões Atendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {Object.keys(pedidosPorRegiao).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por pedido ou cliente..."
                className="pl-10"
              />
            </div>

            <Select value={regiaoFiltro} onValueChange={setRegiaoFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as regiões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Regiões</SelectItem>
                {Object.keys(pedidosPorRegiao).map(regiao => (
                  <SelectItem key={regiao} value={regiao}>
                    {regiao} ({pedidosPorRegiao[regiao].length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pronto para Faturar">Pronto para Faturar</SelectItem>
                <SelectItem value="Faturado">Faturado</SelectItem>
                <SelectItem value="Em Expedição">Em Expedição</SelectItem>
                <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agrupamento por Região */}
      <Tabs defaultValue={Object.keys(pedidosPorRegiao)[0] || "geral"} className="w-full">
        <TabsList className="bg-white border shadow-sm flex-wrap">
          <TabsTrigger value="geral">
            📋 Visão Geral ({pedidosFiltrados.length})
          </TabsTrigger>
          {Object.keys(pedidosPorRegiao).slice(0, 5).map(regiao => (
            <TabsTrigger key={regiao} value={regiao}>
              📍 {regiao} ({pedidosPorRegiao[regiao].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="geral" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Região</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Previsão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidosFiltrados.map(pedido => {
                    const regiao = pedido.endereco_entrega_principal?.cidade || 'Sem Região';
                    const entrega = entregas.find(e => e.pedido_id === pedido.id);
                    
                    return (
                      <TableRow key={pedido.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                        <TableCell>{pedido.cliente_nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <MapPin className="w-3 h-3 mr-1" />
                            {regiao}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">
                          R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {pedido.data_prevista_entrega ? 
                            new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            pedido.status === 'Entregue' ? 'bg-green-600' :
                            pedido.status === 'Em Trânsito' ? 'bg-purple-600' :
                            pedido.status === 'Em Expedição' ? 'bg-orange-600' :
                            pedido.status === 'Faturado' ? 'bg-blue-600' :
                            'bg-slate-600'
                          }>
                            {pedido.status === 'Entregue' ? '✅ Entregue' : pedido.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {pedido.status === 'Aprovado' || pedido.status === 'Pronto para Faturar' ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  atualizarStatusMutation.mutate({
                                    pedidoId: pedido.id,
                                    novoStatus: 'Em Expedição'
                                  });
                                }}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <Package className="w-4 h-4 mr-1" />
                                Expedir
                              </Button>
                            ) : pedido.status === 'Em Expedição' || pedido.status === 'Faturado' ? (
                              <Button
                                size="sm"
                                onClick={() => {
                                  atualizarStatusMutation.mutate({
                                    pedidoId: pedido.id,
                                    novoStatus: 'Em Trânsito'
                                  });
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Truck className="w-4 h-4 mr-1" />
                                Saiu
                              </Button>
                            ) : pedido.status === 'Em Trânsito' ? (
                              <Button
                                size="sm"
                                onClick={() => handleVerDetalhes(pedido)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Entregar
                              </Button>
                            ) : pedido.status === 'Entregue' ? (
                              <Badge className="bg-green-100 text-green-700">
                                ✅ Entregue
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerDetalhes(pedido)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {pedidosFiltrados.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum pedido para entrega encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tabs por Região */}
        {Object.keys(pedidosPorRegiao).slice(0, 5).map(regiao => (
          <TabsContent key={regiao} value={regiao} className="mt-4">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Região: {regiao}
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {pedidosPorRegiao[regiao].length} pedido(s) nesta região
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosPorRegiao[regiao].map(pedido => (
                      <TableRow key={pedido.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                        <TableCell>{pedido.cliente_nome}</TableCell>
                        <TableCell className="text-sm">
                          {pedido.endereco_entrega_principal?.logradouro}, {pedido.endereco_entrega_principal?.numero}
                          {pedido.endereco_entrega_principal?.mapa_url && (
                            <a 
                              href={pedido.endereco_entrega_principal.mapa_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:underline inline-flex items-center"
                            >
                              <Navigation className="w-3 h-3 mr-1" />
                              Maps
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            pedido.status === 'Entregue' ? 'bg-green-600' :
                            pedido.status === 'Em Trânsito' ? 'bg-purple-600' :
                            pedido.status === 'Em Expedição' ? 'bg-orange-600' :
                            'bg-blue-600'
                          }>
                            {pedido.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVerDetalhes(pedido)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Detalhes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog de Detalhes da Entrega */}
      <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              🚚 Detalhes da Entrega - {entregaSelecionada?.pedido?.numero_pedido}
            </DialogTitle>
          </DialogHeader>
          
          {entregaSelecionada && (
            <div className="space-y-4">
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Cliente</p>
                      <p className="font-semibold">{entregaSelecionada.pedido.cliente_nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Valor Total</p>
                      <p className="font-bold text-green-600">
                        R$ {(entregaSelecionada.pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Endereço</p>
                      <p className="text-sm">
                        {entregaSelecionada.pedido.endereco_entrega_principal?.logradouro}, 
                        {entregaSelecionada.pedido.endereco_entrega_principal?.numero}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status Atual</p>
                      <Badge className="mt-1">{entregaSelecionada.pedido.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confirmar Entrega com Comprovante */}
              {!uploadMode ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Fluxo Automático de Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2">
                      {entregaSelecionada.pedido.status === 'Faturado' && (
                        <Button
                          onClick={async () => {
                            await atualizarStatusMutation.mutateAsync({
                              pedidoId: entregaSelecionada.pedido.id,
                              novoStatus: 'Em Expedição'
                            });
                            await automacao.notificarClienteStatusPedido(entregaSelecionada.pedido, 'Em Expedição');
                            setDetalhesOpen(false);
                          }}
                          className="bg-orange-600 hover:bg-orange-700 w-full"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          📦 Marcar Em Expedição
                        </Button>
                      )}

                      {entregaSelecionada.pedido.status === 'Em Expedição' && (
                        <Button
                          onClick={async () => {
                            await atualizarStatusMutation.mutateAsync({
                              pedidoId: entregaSelecionada.pedido.id,
                              novoStatus: 'Em Trânsito'
                            });
                            await automacao.notificarClienteStatusPedido(entregaSelecionada.pedido, 'Em Trânsito');
                            setDetalhesOpen(false);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 w-full"
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          🚚 Saiu para Entrega
                        </Button>
                      )}

                      {entregaSelecionada.pedido.status === 'Em Trânsito' && (
                        <Button
                          onClick={() => setUploadMode(true)}
                          className="bg-green-600 hover:bg-green-700 w-full"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          ✅ Confirmar Entrega
                        </Button>
                      )}

                      {entregaSelecionada.pedido.status === 'Entregue' && (
                        <Badge className="bg-green-100 text-green-700 p-3 text-center w-full justify-center">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Pedido já foi entregue
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-green-300 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Confirmar Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Nome de Quem Recebeu *</Label>
                      <Input
                        value={nomeRecebedor}
                        onChange={(e) => setNomeRecebedor(e.target.value)}
                        placeholder="Nome completo do recebedor"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">CPF/RG do Recebedor</Label>
                      <Input
                        value={docRecebedor}
                        onChange={(e) => setDocRecebedor(e.target.value)}
                        placeholder="Documento"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Foto do Comprovante (opcional)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setArquivoComprovante(e.target.files[0])}
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Foto do canhoto assinado ou comprovante de entrega
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadMode(false);
                          setNomeRecebedor("");
                          setDocRecebedor("");
                          setArquivoComprovante(null);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        onClick={async () => {
                          if (!nomeRecebedor.trim()) {
                            toast.error("⚠️ Informe quem recebeu a entrega");
                            return;
                          }

                          let fotoUrl = null;
                          if (arquivoComprovante) {
                            const upload = await base44.integrations.Core.UploadFile({ 
                              file: arquivoComprovante 
                            });
                            fotoUrl = upload.file_url;
                          }

                          await atualizarStatusMutation.mutateAsync({
                            pedidoId: entregaSelecionada.pedido.id,
                            novoStatus: 'Entregue',
                            dadosComprovante: {
                              nome_recebedor: nomeRecebedor,
                              documento_recebedor: docRecebedor,
                              data_hora_recebimento: new Date().toISOString(),
                              foto_comprovante: fotoUrl
                            }
                          });
                          
                          await automacao.notificarClienteStatusPedido(entregaSelecionada.pedido, 'Entregue');
                          
                          setDetalhesOpen(false);
                          setUploadMode(false);
                          setNomeRecebedor("");
                          setDocRecebedor("");
                          setArquivoComprovante(null);
                        }}
                        disabled={atualizarStatusMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {atualizarStatusMutation.isPending ? 'Confirmando...' : 'Confirmar Entrega'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comprovante de Entrega */}
              {entregaSelecionada.entrega?.comprovante_entrega && (
                <Card className="border-green-300 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Comprovante de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-600">Recebedor</p>
                        <p className="font-semibold">{entregaSelecionada.entrega.comprovante_entrega.nome_recebedor}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Data/Hora</p>
                        <p className="font-semibold">
                          {new Date(entregaSelecionada.entrega.comprovante_entrega.data_hora_recebimento).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {entregaSelecionada.entrega.comprovante_entrega.foto_comprovante && (
                      <div className="mt-3">
                        <Button variant="outline" size="sm" asChild>
                          <a href={entregaSelecionada.entrega.comprovante_entrega.foto_comprovante} target="_blank" rel="noopener noreferrer">
                            <Image className="w-4 h-4 mr-2" />
                            Ver Foto do Comprovante
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}