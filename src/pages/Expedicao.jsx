import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Plus,
  FileText,
  Settings,
  Map,
  BarChart3,
  MessageSquare,
  ClipboardList,
  Eye,
  Edit,
  MessageCircle,
  Camera,
  Route,
  Building2,
  Phone,
  Mail,
  Pen
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import ComprovanteDigital from "../components/expedicao/ComprovanteDigital";
import { useWindow } from "@/components/lib/useWindow";
import RomaneioForm from "../components/expedicao/RomaneioForm";
import RoteirizacaoMapa from "../components/expedicao/RoteirizacaoMapa";
import DashboardLogistico from "../components/expedicao/DashboardLogistico";
import RelatoriosLogistica from "../components/expedicao/RelatoriosLogistica";
import AssinaturaDigitalEntrega from "../components/expedicao/AssinaturaDigitalEntrega";
import SeparacaoConferencia from "../components/expedicao/SeparacaoConferencia";
import SeletorEnderecoEntrega from "../components/expedicao/SeletorEnderecoEntrega";
import EnvioMensagemAutomatica from "../components/expedicao/EnvioMensagemAutomatica";
import ConfigWhatsApp from "../components/expedicao/ConfigWhatsApp";
import RastreamentoPublico from "../components/expedicao/RastreamentoPublico";
import ConfiguracaoExpedicao from "../components/expedicao/ConfiguracaoExpedicao";
import FormularioEntrega from "../components/expedicao/FormularioEntrega";
import IconeAcessoCliente from "@/components/cadastros/IconeAcessoCliente";
import IconeAcessoTransportadora from "@/components/cadastros/IconeAcessoTransportadora";
import { useRealtimeEntregas } from '@/components/lib/useRealtimeData';
import MapaTempoReal from '../components/expedicao/MapaTempoReal';

export default function Expedicao() {
  const [activeTab, setActiveTab] = useState("entregas");
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { openWindow } = useWindow();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState(null);
  const [viewingEntrega, setViewingEntrega] = useState(null);
  const [comprovanteModal, setComprovanteModal] = useState(null);
  const [romaneioDialogOpen, setRomaneioDialogOpen] = useState(false);
  const [assinaturaModal, setAssinaturaModal] = useState(null);
  const [separacaoDialogOpen, setSeparacaoDialogOpen] = useState(false);
  const [pedidoParaSeparacao, setPedidoParaSeparacao] = useState(null);
  const [seletorEnderecoOpen, setSeletorEnderecoOpen] = useState(false);
  const [clienteParaEndereco, setClienteParaEndereco] = useState(null);
  const [entregaSelecionada, setEntregaSelecionada] = useState(null); // Added for MapaTempoReal

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    estaNoGrupo,
    empresaAtual,
    empresasDoGrupo,
    filtrarPorContexto
  } = useContextoVisual();

  const [formData, setFormData] = useState({
    pedido_id: "",
    numero_pedido: "",
    cliente_nome: "",
    cliente_id: "",
    empresa_id: empresaAtual?.id || "",
    endereco_entrega_completo: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      latitude: null,
      longitude: null,
      referencia: "",
      link_google_maps: ""
    },
    contato_entrega: {
      nome: "",
      telefone: "",
      whatsapp: "",
      email: "",
      instrucoes_especiais: ""
    },
    data_previsao: "",
    janela_entrega_inicio: "",
    janela_entrega_fim: "",
    transportadora: "",
    motorista: "",
    motorista_telefone: "",
    veiculo: "",
    placa: "",
    codigo_rastreamento: "",
    link_rastreamento: "",
    volumes: 1,
    peso_total_kg: 0,
    valor_frete: 0,
    valor_mercadoria: 0,
    tipo_frete: "CIF",
    status: "Aguardando Separação",
    prioridade: "Normal",
    observacoes: "",
    salvar_endereco_no_cliente: false,
    salvar_contato_no_cliente: false
  });

  const { data: entregas = [], isLoading: loadingEntregas } = useQuery({
    queryKey: ['entregas'],
    queryFn: () => base44.entities.Entrega.list('-created_date'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: romaneios = [] } = useQuery({
    queryKey: ['romaneios'],
    queryFn: () => base44.entities.Romaneio.list('-created_date'),
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ['rotas'],
    queryFn: () => base44.entities.Rota.list('-created_date'),
  });

  // Filtrar por contexto
  const entregasFiltradas = filtrarPorContexto(entregas, 'empresa_id');
  const romaneiosFiltrados = filtrarPorContexto(romaneios, 'empresa_id');
  const rotasFiltradas = filtrarPorContexto(rotas, 'empresa_id');

  // Dados em tempo real
  const { data: entregasRealtime, hasChanges } = useRealtimeEntregas(empresaAtual?.id);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const qrCode = `ENT-${Date.now()}`;
      const novaEntrega = await base44.entities.Entrega.create({
        ...data,
        qr_code: qrCode,
        data_separacao: data.status !== "Aguardando Separação" ? new Date().toISOString() : null
      });

      // Salvar endereço/contato no cliente se marcado
      if (data.salvar_endereco_no_cliente && data.cliente_id) {
        const cliente = clientes.find(c => c.id === data.cliente_id);
        if (cliente) {
          const novosLocais = [...(cliente.locais_entrega || []), {
            apelido: "Endereço Entrega",
            ...data.endereco_entrega_completo,
            principal: false
          }];
          await base44.entities.Cliente.update(cliente.id, {
            locais_entrega: novosLocais
          });
        }
      }

      if (data.salvar_contato_no_cliente && data.cliente_id) {
        const cliente = clientes.find(c => c.id === data.cliente_id);
        if (cliente) {
          const novosContatos = [...(cliente.contatos || []), {
            tipo: "WhatsApp",
            valor: data.contato_entrega.whatsapp || data.contato_entrega.telefone,
            principal: false,
            observacao: `Contato de entrega - ${data.contato_entrega.nome}`
          }];
          await base44.entities.Cliente.update(cliente.id, {
            contatos: novosContatos
          });
        }
      }

      return novaEntrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "✅ Entrega criada com sucesso!" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Entrega.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      setIsDialogOpen(false);
      setEditingEntrega(null);
      resetForm();
      toast({ title: "✅ Entrega atualizada!" });
    },
  });

  const confirmarEntregaAssinaturaMutation = useMutation({
    mutationFn: async ({ entregaId, dadosAssinatura }) => {
      return await base44.entities.Entrega.update(entregaId, {
        status: "Entregue",
        data_entrega: new Date().toISOString(),
        comprovante_entrega: {
          assinatura_digital: dadosAssinatura.assinatura_base64,
          nome_recebedor: dadosAssinatura.nome_recebedor,
          documento_recebedor: dadosAssinatura.documento_recebedor,
          data_hora_recebimento: dadosAssinatura.data_hora_assinatura,
          latitude_entrega: dadosAssinatura.latitude || null,
          longitude_entrega: dadosAssinatura.longitude || null
        },
        historico_status: [
          ...(assinaturaModal.historico_status || []),
          {
            status: "Entregue",
            data_hora: new Date().toISOString(),
            usuario: "Sistema",
            observacao: `Entrega confirmada com assinatura digital. Recebido por: ${dadosAssinatura.nome_recebedor}`
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      setAssinaturaModal(null);
      toast({ title: "✅ Entrega confirmada com assinatura!" });
    },
    onError: (error) => {
      console.error("Erro ao confirmar entrega com assinatura:", error);
      toast({
        title: "❌ Erro ao confirmar entrega",
        description: "Não foi possível registrar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleMudarStatus = async (entrega, novoStatus) => {
    const historico = {
      status: novoStatus,
      data_hora: new Date().toISOString(),
      usuario: 'Sistema', // Ideally, this would be the logged-in user
      observacao: `Status alterado para ${novoStatus}`
    };

    const dataFields = {};
    if (novoStatus === "Em Separação" || novoStatus === "Pronto para Expedir") {
      dataFields.data_separacao = new Date().toISOString();
    }
    if (novoStatus === "Saiu para Entrega" || novoStatus === "Em Trânsito") {
      dataFields.data_saida = new Date().toISOString();
    }
    if (novoStatus === "Entregue" && !assinaturaModal) { // Only update data_entrega here if not using signature flow
      dataFields.data_entrega = new Date().toISOString();
    }

    await updateMutation.mutateAsync({
      id: entrega.id,
      data: {
        status: novoStatus,
        historico_status: [...(entrega.historico_status || []), historico],
        ...dataFields
      }
    });

    // Registrar no histórico do cliente
    await base44.entities.HistoricoCliente.create({
      group_id: entrega.group_id || empresaAtual?.group_id || "", // Assuming entrega has group_id or fallback to current company's group_id
      empresa_id: entrega.empresa_id,
      cliente_id: entrega.cliente_id,
      cliente_nome: entrega.cliente_nome,
      modulo_origem: "Expedicao",
      referencia_id: entrega.id,
      referencia_tipo: "Entrega",
      referencia_numero: entrega.numero_pedido || "",
      tipo_evento: "Alteracao",
      titulo_evento: `Status da entrega alterado para ${novoStatus}`,
      descricao_detalhada: `Pedido ${entrega.numero_pedido} - Status: ${novoStatus}`,
      usuario_responsavel: "Sistema", // TODO: Replace with actual logged-in user
      data_evento: new Date().toISOString(),
      status_relacionado: novoStatus
    });
  };

  const handleClienteChange = (clienteId) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      // Open the address selector dialog instead of directly setting address
      setClienteParaEndereco(cliente);
      setSeletorEnderecoOpen(true);

      const contatoPrincipal = cliente.contatos?.find(c => c.principal) || cliente.contatos?.[0];

      setFormData(prev => ({
        ...prev,
        cliente_id: clienteId,
        cliente_nome: cliente.nome || cliente.razao_social,
        contato_entrega: {
          nome: contatoPrincipal?.observacao || "",
          telefone: contatoPrincipal?.tipo === "Telefone" ? contatoPrincipal.valor : "",
          whatsapp: (contatoPrincipal?.tipo === "WhatsApp" || contatoPrincipal?.tipo === "Telefone") ? contatoPrincipal.valor : "", // Assuming WhatsApp can be phone too
          email: "",
          instrucoes_especiais: ""
        }
      }));
    }
  };

  const handlePedidoChange = (pedidoId) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      setFormData(prev => ({
        ...prev,
        pedido_id: pedidoId,
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        valor_mercadoria: pedido.valor_total,
        // Set pedido's main address as a default, but still allow selection via dialog if client ID exists
        endereco_entrega_completo: pedido.endereco_entrega_principal || prev.endereco_entrega_completo
      }));

      if (pedido.cliente_id) {
        // Trigger cliente change to allow address selection via dialog
        handleClienteChange(pedido.cliente_id);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      pedido_id: "",
      numero_pedido: "",
      cliente_nome: "",
      cliente_id: "",
      empresa_id: empresaAtual?.id || "",
      endereco_entrega_completo: {
        cep: "", logradouro: "", numero: "", complemento: "",
        bairro: "", cidade: "", estado: "",
        latitude: null, longitude: null, referencia: "", link_google_maps: ""
      },
      contato_entrega: {
        nome: "", telefone: "", whatsapp: "", email: "", instrucoes_especiais: ""
      },
      data_previsao: "",
      janela_entrega_inicio: "",
      janela_entrega_fim: "",
      transportadora: "",
      motorista: "",
      motorista_telefone: "",
      veiculo: "",
      placa: "",
      codigo_rastreamento: "",
      link_rastreamento: "",
      volumes: 1,
      peso_total_kg: 0,
      valor_frete: 0,
      valor_mercadoria: 0,
      tipo_frete: "CIF",
      status: "Aguardando Separação",
      prioridade: "Normal",
      observacoes: "",
      salvar_endereco_no_cliente: false,
      salvar_contato_no_cliente: false
    });
  };

  const handleSubmit = (data) => { // Modified to receive data directly from FormularioEntrega
    if (editingEntrega) {
      updateMutation.mutate({ id: editingEntrega.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entrega) => {
    setEditingEntrega(entrega);
    setFormData({
      ...entrega,
      empresa_id: entrega.empresa_id || empresaAtual?.id || "",
      // Ensure nested objects are handled correctly to prevent issues with React state updates
      endereco_entrega_completo: entrega.endereco_entrega_completo || {
        cep: "", logradouro: "", numero: "", complemento: "",
        bairro: "", cidade: "", estado: "",
        latitude: null, longitude: null, referencia: "", link_google_maps: ""
      },
      contato_entrega: entrega.contato_entrega || {
        nome: "", telefone: "", whatsapp: "", email: "", instrucoes_especiais: ""
      }
    });
    setIsDialogOpen(true);
  };

  const filteredEntregas = entregasFiltradas.filter(e => {
    const matchSearch = e.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       e.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       e.codigo_rastreamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       e.qr_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "todos" || e.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    total: entregasFiltradas.length,
    aguardando: entregasFiltradas.filter(e => e.status === "Aguardando Separação").length,
    separacao: entregasFiltradas.filter(e => e.status === "Em Separação").length,
    pronto: entregasFiltradas.filter(e => e.status === "Pronto para Expedir").length,
    transito: entregasFiltradas.filter(e => e.status === "Em Trânsito" || e.status === "Saiu para Entrega").length,
    entregue: entregasFiltradas.filter(e => e.status === "Entregue").length,
    frustrada: entregasFiltradas.filter(e => e.status === "Entrega Frustrada").length,
  };

  const statusColors = {
    'Aguardando Separação': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Em Separação': 'bg-blue-100 text-blue-700 border-blue-200',
    'Pronto para Expedir': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Saiu para Entrega': 'bg-orange-100 text-orange-700 border-orange-200',
    'Em Trânsito': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Entregue': 'bg-green-100 text-green-700 border-green-200',
    'Entrega Frustrada': 'bg-red-100 text-red-700 border-red-200',
    'Devolvido': 'bg-pink-100 text-pink-700 border-pink-200',
    'Cancelado': 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '-';
  };

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-600" />
              Expedição e Logística
            </h1>
            <p className="text-slate-600 mt-1">
              {estaNoGrupo
                ? 'Gestão consolidada de todas as entregas'
                : `Entregas - ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || ''}`
              }
            </p>
          </div>

          <div className="flex gap-3">
            {estaNoGrupo && (
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                <Building2 className="w-4 h-4 mr-2" />
                Visão Consolidada
              </Badge>
            )}

            <Button
              onClick={() => openWindow(RomaneioForm, {
                empresaId: empresaAtual?.id,
                windowMode: true
              }, {
                title: '📋 Gerar Romaneio',
                width: 1200,
                height: 700
              })}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Romaneio
            </Button>

            <Button 
              onClick={() => openWindow(FormularioEntrega, {
                formData,
                setFormData,
                onSubmit: handleSubmit,
                onCancel: () => {},
                clientes,
                pedidos,
                empresasDoGrupo,
                estaNoGrupo,
                isEditing: false,
                windowMode: true
              }, {
                title: '🚚 Nova Entrega',
                width: 1100,
                height: 650
              })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Entrega
            </Button>
          </div>
        </div>

        {/* NOVA: Tabs para organizar */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
            <TabsTrigger value="entregas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Truck className="w-4 h-4 mr-2" />
              Entregas
              {hasChanges && <div className="w-2 h-2 rounded-full bg-green-600 ml-2 animate-pulse" />}
            </TabsTrigger>
            <TabsTrigger value="separacao" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Separação
            </TabsTrigger>
            <TabsTrigger value="romaneios" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Romaneios ({romaneiosFiltrados.length})
            </TabsTrigger>
            <TabsTrigger value="rotas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Route className="w-4 h-4 mr-2" />
              Rotas ({rotasFiltradas.length})
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* ABA: ENTREGAS (conteúdo existente) */}
          <TabsContent value="entregas" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total</p>
                      <p className="text-2xl font-bold text-slate-900">{statusCounts.total}</p>
                    </div>
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">Aguardando</p>
                      <p className="text-2xl font-bold text-yellow-700">{statusCounts.aguardando}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Separando</p>
                      <p className="text-2xl font-bold text-blue-700">{statusCounts.separacao}</p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-600">Pronto</p>
                      <p className="text-2xl font-bold text-indigo-700">{statusCounts.pronto}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">Em Trânsito</p>
                      <p className="text-2xl font-bold text-orange-700">{statusCounts.transito}</p>
                    </div>
                    <Truck className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Entregue</p>
                      <p className="text-2xl font-bold text-green-700">{statusCounts.entregue}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Frustrada</p>
                      <p className="text-2xl font-bold text-red-700">{statusCounts.frustrada}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Buscar por pedido, cliente, rastreio ou QR Code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-64">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="Aguardando Separação">Aguardando Separação</SelectItem>
                      <SelectItem value="Em Separação">Em Separação</SelectItem>
                      <SelectItem value="Pronto para Expedir">Pronto para Expedir</SelectItem>
                      <SelectItem value="Saiu para Entrega">Saiu para Entrega</SelectItem>
                      <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                      <SelectItem value="Entregue">Entregue</SelectItem>
                      <SelectItem value="Entrega Frustrada">Frustrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Entregas Table */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Lista de Entregas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        {estaNoGrupo && <TableHead>Empresa</TableHead>}
                        <TableHead>Destino</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Transportadora</TableHead>
                        <TableHead>Previsão</TableHead>
                        <TableHead>Rastreio</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                      {filteredEntregas.map((entrega) => {
                        const cliente = clientes.find(c => c.id === entrega.cliente_id);
                        const transportadoraObj = entrega.transportadora_id 
                          ? { id: entrega.transportadora_id, nome: entrega.transportadora, razao_social: entrega.transportadora }
                          : null;

                        return (
                          <TableRow key={entrega.id} className="hover:bg-slate-50">
                            <TableCell className="font-medium">{entrega.numero_pedido || '-'}</TableCell>
                            <TableCell>
                              {cliente ? (
                                <IconeAcessoCliente cliente={cliente} variant="badge" />
                              ) : (
                                <span className="text-sm">{entrega.cliente_nome}</span>
                              )}
                            </TableCell>
                            {estaNoGrupo && (
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 mr-2" />
                                  <span className="text-sm">{obterNomeEmpresa(entrega.empresa_id)}</span>
                                </div>
                              </TableCell>
                            )}
                            <TableCell>
                              <div className="max-w-xs truncate text-sm">
                                {entrega.endereco_entrega_completo?.cidade || '-'}, {entrega.endereco_entrega_completo?.estado || '-'}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {entrega.contato_entrega?.whatsapp || entrega.contato_entrega?.telefone || '-'}
                            </TableCell>
                            <TableCell>
                              {transportadoraObj ? (
                                <IconeAcessoTransportadora transportadora={transportadoraObj} variant="badge" />
                              ) : (
                                <span className="text-sm text-slate-500">{entrega.transportadora || 'Frota Própria'}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {entrega.data_previsao ? new Date(entrega.data_previsao).toLocaleDateString('pt-BR') : '-'}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                {entrega.qr_code || entrega.codigo_rastreamento || '-'}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                entrega.prioridade === 'Urgente' ? 'border-red-500 text-red-700' :
                                entrega.prioridade === 'Alta' ? 'border-orange-500 text-orange-700' :
                                'border-slate-500 text-slate-700'
                              }>
                                {entrega.prioridade}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[entrega.status]}>
                                {entrega.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setViewingEntrega(entrega);
                                    setEntregaSelecionada(entrega); // Set for map
                                  }}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>

                                <Button
                                 variant="ghost"
                                 size="icon"
                                 onClick={() => openWindow(FormularioEntrega, {
                                   formData: entrega,
                                   setFormData,
                                   onSubmit: handleSubmit,
                                   onCancel: () => {},
                                   clientes,
                                   pedidos,
                                   empresasDoGrupo,
                                   estaNoGrupo,
                                   isEditing: true,
                                   windowMode: true
                                 }, {
                                   title: `✏️ Editar Entrega: ${entrega.numero_pedido}`,
                                   width: 1100,
                                   height: 650
                                 })}
                                 title="Editar"
                                >
                                 <Edit className="w-4 h-4" />
                                </Button>

                                {entrega.status === "Entregue" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setComprovanteModal(entrega)}
                                    title="Comprovante"
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Camera className="w-4 h-4" />
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

                {filteredEntregas.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhuma entrega encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Mapa Tempo Real (se houver entrega selecionada com romaneio) */}
            {entregaSelecionada?.romaneio_id && (
              <MapaTempoReal romaneioId={entregaSelecionada.romaneio_id} />
            )}
          </TabsContent>

          {/* NOVA ABA: Separação */}
          <TabsContent value="separacao" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Pedidos Aguardando Separação</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      {estaNoGrupo && <TableHead>Empresa</TableHead>}
                      <TableHead>Itens</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos
                      .filter(p => p.status === "Aprovado" || p.status === "Em Produção")
                      .slice(0, 20)
                      .map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.numero_pedido}</TableCell>
                          <TableCell>{p.cliente_nome}</TableCell>
                          {estaNoGrupo && (
                            <TableCell>
                              <Building2 className="w-4 h-4 inline mr-1" />
                              {obterNomeEmpresa(p.empresa_id)}
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant="outline">
                              {(p.itens_revenda?.length || 0) + (p.itens_producao?.length || 0)} itens
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(p.data_pedido).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                setPedidoParaSeparacao(p);
                                setSeparacaoDialogOpen(true);
                              }}
                            >
                              Separar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                {pedidos.filter(p => p.status === "Aprovado" || p.status === "Em Produção").length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhum pedido aguardando separação</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOVA ABA: ROMANEIOS */}
          <TabsContent value="romaneios" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Lista de Romaneios</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Número</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Motorista</TableHead>
                      <TableHead>Veículo</TableHead>
                      {estaNoGrupo && <TableHead>Empresa</TableHead>}
                      <TableHead>Entregas</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {romaneiosFiltrados.map(rom => (
                      <TableRow key={rom.id}>
                        <TableCell className="font-medium">{rom.numero_romaneio}</TableCell>
                        <TableCell>{new Date(rom.data_romaneio).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{rom.motorista}</TableCell>
                        <TableCell>{rom.veiculo} - {rom.placa}</TableCell>
                        {estaNoGrupo && (
                          <TableCell>
                            <Building2 className="w-4 h-4 inline mr-1" />
                            {obterNomeEmpresa(rom.empresa_id)}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline">{rom.quantidade_entregas || 0}</Badge>
                        </TableCell>
                        <TableCell>{rom.peso_total_kg?.toFixed(2) || 0} kg</TableCell>
                        <TableCell>
                          <Badge className={
                            rom.status === 'Concluído' ? 'bg-green-100 text-green-700' :
                            rom.status === 'Em Rota' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {rom.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {romaneiosFiltrados.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhum romaneio criado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOVA ABA: ROTAS */}
          <TabsContent value="rotas" className="space-y-6">
            <RoteirizacaoMapa
              entregas={entregasFiltradas.filter(e => e.status === "Pronto para Expedir")}
              empresaId={empresaAtual?.id}
            />

            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle>Rotas Criadas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Nome</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Motorista</TableHead>
                      {estaNoGrupo && <TableHead>Empresa</TableHead>}
                      <TableHead>Pontos</TableHead>
                      <TableHead>Distância</TableHead>
                      <TableHead>Tempo Est.</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rotasFiltradas.map(rota => (
                      <TableRow key={rota.id}>
                        <TableCell className="font-medium">{rota.nome_rota}</TableCell>
                        <TableCell>{new Date(rota.data_rota).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{rota.motorista || '-'}</TableCell>
                        {estaNoGrupo && (
                          <TableCell>
                            <Building2 className="w-4 h-4 inline mr-1" />
                            {obterNomeEmpresa(rota.empresa_id)}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline">{rota.pontos_entrega?.length || 0}</Badge>
                        </TableCell>
                        <TableCell>{rota.distancia_total_km?.toFixed(1) || 0} km</TableCell>
                        <TableCell>{Math.floor((rota.tempo_total_previsto_minutos || 0) / 60)}h {(rota.tempo_total_previsto_minutos || 0) % 60}min</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${rota.progresso_percentual || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{rota.progresso_percentual || 0}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            rota.status === 'Concluída' ? 'bg-green-100 text-green-700' :
                            rota.status === 'Em Andamento' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }>
                            {rota.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {rotasFiltradas.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Route className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma rota criada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOVA ABA: DASHBOARD */}
          <TabsContent value="dashboard">
            <DashboardLogistico entregas={entregasFiltradas} />
          </TabsContent>

          {/* Added: NEW TAB: RELATÓRIOS */}
          <TabsContent value="relatorios">
            <RelatoriosLogistica empresaId={empresaAtual?.id} />
          </TabsContent>

          {/* Added: NEW TAB: CONFIG WHATSAPP */}
          <TabsContent value="config">
            <ConfiguracaoExpedicao empresaId={empresaAtual?.id} />
          </TabsContent>
        </Tabs>

        {/* Dialog de Visualização com Timeline */}
        <Dialog open={!!viewingEntrega} onOpenChange={(open) => {
          setViewingEntrega(null);
          if (!open) { // Only clear selected entrega for map if dialog is closing
            setEntregaSelecionada(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Detalhes da Entrega - {viewingEntrega?.numero_pedido || 'Sem Pedido'}
              </DialogTitle>
            </DialogHeader>
            {viewingEntrega && (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Cliente</Label>
                      <p className="font-semibold">{viewingEntrega.cliente_nome}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Status</Label>
                      <Badge className={statusColors[viewingEntrega.status]}>
                        {viewingEntrega.status}
                      </Badge>
                    </div>
                  </div>

                  {estaNoGrupo && (
                    <div>
                      <Label className="text-slate-600">Empresa Responsável</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold">{obterNomeEmpresa(viewingEntrega.empresa_id)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-slate-600">Endereço de Entrega</Label>
                    <p className="text-sm">
                      {viewingEntrega.endereco_entrega_completo?.logradouro}, {viewingEntrega.endereco_entrega_completo?.numero}
                      {viewingEntrega.endereco_entrega_completo?.complemento && ` - ${viewingEntrega.endereco_entrega_completo?.complemento}`}
                      <br/>
                      {viewingEntrega.endereco_entrega_completo?.bairro} - {viewingEntrega.endereco_entrega_completo?.cidade}/{viewingEntrega.endereco_entrega_completo?.estado}
                      <br/>
                      CEP: {viewingEntrega.endereco_entrega_completo?.cep}
                    </p>
                  </div>

                  <div>
                    <Label className="text-slate-600">Contato para Entrega</Label>
                    <p className="text-sm">
                      <strong>{viewingEntrega.contato_entrega?.nome || '-'}</strong>
                      <br/>
                      📞 {viewingEntrega.contato_entrega?.whatsapp || viewingEntrega.contato_entrega?.telefone || '-'}
                      {viewingEntrega.contato_entrega?.instrucoes_especiais && (
                        <>
                          <br/>
                          <span className="italic text-slate-500">
                            Instruções: {viewingEntrega.contato_entrega.instrucoes_especiais}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-600">Transportadora</Label>
                      <p className="font-medium">{viewingEntrega.transportadora || 'Frota Própria'}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Motorista</Label>
                      <p className="font-medium">{viewingEntrega.motorista || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600">Volumes</Label>
                      <p className="font-medium">{viewingEntrega.volumes || 0}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Peso</Label>
                      <p className="font-medium">{viewingEntrega.peso_total_kg || 0} kg</p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Prioridade</Label>
                      <Badge variant="outline">{viewingEntrega.prioridade || 'Normal'}</Badge>
                    </div>
                  </div>

                  {viewingEntrega.observacoes && (
                    <div>
                      <Label className="text-slate-600">Observações</Label>
                      <p className="text-sm p-3 bg-slate-50 rounded">{viewingEntrega.observacoes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleMudarStatus(viewingEntrega, "Em Separação")}
                      disabled={viewingEntrega.status !== "Aguardando Separação" || updateMutation.isPending}
                      size="sm"
                      variant="outline"
                    >
                      Iniciar Separação
                    </Button>
                    <Button
                      onClick={() => handleMudarStatus(viewingEntrega, "Pronto para Expedir")}
                      disabled={viewingEntrega.status !== "Em Separação" || updateMutation.isPending}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Pronto para Expedir
                    </Button>
                    <Button
                      onClick={() => handleMudarStatus(viewingEntrega, "Saiu para Entrega")}
                      disabled={viewingEntrega.status !== "Pronto para Expedir" || updateMutation.isPending}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Saiu para Entrega
                    </Button>
                    {/* Changed: "Confirmar Entrega" now opens signature modal */}
                    <Button
                      onClick={() => setAssinaturaModal(viewingEntrega)}
                      disabled={!["Saiu para Entrega", "Em Trânsito"].includes(viewingEntrega.status) || confirmarEntregaAssinaturaMutation.isPending}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Confirmar Entrega
                    </Button>
                    <Button
                      onClick={() => handleMudarStatus(viewingEntrega, "Entrega Frustrada")}
                      disabled={["Entregue", "Cancelado", "Aguardando Separação"].includes(viewingEntrega.status) || updateMutation.isPending}
                      size="sm"
                      variant="destructive"
                    >
                      Marcar como Frustrada
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-3">
                  {viewingEntrega.historico_status?.length > 0 ? (
                    <div className="space-y-3">
                      {viewingEntrega.historico_status
                        .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
                        .map((h, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-semibold text-slate-900">{h.status}</p>
                              <span className="text-xs text-slate-500">
                                {new Date(h.data_hora).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            {h.observacao && <p className="text-sm text-slate-600 mt-1">{h.observacao}</p>}
                            <p className="text-xs text-slate-500 mt-1">Por: {h.usuario}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">Nenhum histórico disponível</p>
                  )}
                </TabsContent>

                <TabsContent value="notificacoes" className="space-y-3">
                  {viewingEntrega.notificacoes_enviadas?.length > 0 ? (
                    <div className="space-y-3">
                      {viewingEntrega.notificacoes_enviadas
                        .sort((a, b) => new Date(b.data_envio) - new Date(a.data_envio))
                        .map((n, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-blue-900">{n.tipo} via {n.canal}</p>
                              <p className="text-sm text-blue-700 mt-1">{n.mensagem}</p>
                              <p className="text-xs text-blue-600 mt-1">Para: {n.destinatario}</p>
                            </div>
                            <span className="text-xs text-blue-600">
                              {new Date(n.data_envio).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-8">Nenhuma notificação enviada</p>
                  )}
                </TabsContent>

                {/* NOVA ABA: WhatsApp */}
                <TabsContent value="whatsapp" className="space-y-3">
                  <EnvioMensagemAutomatica entrega={viewingEntrega} tipo="saida_entrega" />
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Comprovante */}
        {comprovanteModal && (
          <ComprovanteDigital
            entrega={comprovanteModal}
            isOpen={!!comprovanteModal}
            onClose={() => setComprovanteModal(null)}
          />
        )}



        {/* NOVO: Modal Assinatura Digital de Entrega */}
        {assinaturaModal && (
          <Dialog open={!!assinaturaModal} onOpenChange={() => setAssinaturaModal(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pen className="w-5 h-5 text-green-600" />
                  Confirmar Entrega - {assinaturaModal.cliente_nome}
                </DialogTitle>
              </DialogHeader>
              <AssinaturaDigitalEntrega
                onAssinaturaConcluida={(dados) => {
                  confirmarEntregaAssinaturaMutation.mutate({
                    entregaId: assinaturaModal.id,
                    dadosAssinatura: dados
                  });
                }}
                isLoading={confirmarEntregaAssinaturaMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* NOVO: Dialog Separação */}
        {pedidoParaSeparacao && (
          <Dialog open={separacaoDialogOpen} onOpenChange={setSeparacaoDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Separação e Conferência - Pedido {pedidoParaSeparacao.numero_pedido}</DialogTitle>
              </DialogHeader>
              <SeparacaoConferencia
                pedido={pedidoParaSeparacao}
                empresaId={empresaAtual?.id}
                onClose={() => setSeparacaoDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog Seletor de Endereço */}
        {clienteParaEndereco && (
          <Dialog open={seletorEnderecoOpen} onOpenChange={setSeletorEnderecoOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Selecionar Endereço de Entrega</DialogTitle>
              </DialogHeader>
              <SeletorEnderecoEntrega
                cliente={clienteParaEndereco}
                onEnderecoSelecionado={(endereco, salvou) => {
                  setFormData(prev => ({
                    ...prev,
                    endereco_entrega_completo: endereco
                  }));
                  setSeletorEnderecoOpen(false);
                  setClienteParaEndereco(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}