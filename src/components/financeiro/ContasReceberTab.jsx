import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import usePermissions from "@/components/lib/usePermissions";
import { ProtectedAction } from "@/components/ProtectedAction";
import {
  Search,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  CreditCard,
  FileText,
  MessageSquare,
  TrendingUp,
  Trash2,
  Eye,
  Download,
  Plus,
  Edit,
  QrCode,
  Building2,
  Zap
} from "lucide-react";
import GerarCobrancaModal from "./GerarCobrancaModal";
import SimularPagamentoModal from "./SimularPagamentoModal";
import ContaReceberForm from "./ContaReceberForm";
import { useWindow } from "@/components/lib/useWindow";

export default function ContasReceberTab({ contas }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas"); // Changed from "todos" to "todas"
  const [isDialogOpen, setIsDialogOpen] = useState(false); // For Create/Edit dialog
  const [editingConta, setEditingConta] = useState(null); // Used for Create/Edit dialog
  const [selectedConta, setSelectedConta] = useState(null); // Not explicitly used in outline, but could be for view mode
  const [gerarCobrancaDialogOpen, setGerarCobrancaDialogOpen] = useState(false);
  const [simularPagamentoDialogOpen, setSimularPagamentoDialogOpen] = useState(false);
  const [contaParaCobranca, setContaParaCobranca] = useState(null);
  const [contaParaSimulacao, setContaParaSimulacao] = useState(null);

  const [formData, setFormData] = useState({
    descricao: "",
    cliente: "",
    cliente_id: "",
    pedido_id: "",
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: "Pendente",
    forma_recebimento: "Boleto",
    numero_documento: "",
    centro_custo: "",
    observacoes: "",
    empresa_id: "" // Added back as it's required for a ContaReceber
  });

  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [contasSelecionadas, setContasSelecionadas] = useState([]);
  const [contaAtual, setContaAtual] = useState(null); // Used for Baixa dialog

  const [dadosBaixa, setDadosBaixa] = useState({
    data_recebimento: new Date().toISOString().split('T')[0],
    valor_recebido: 0,
    forma_recebimento: "PIX",
    juros: 0,
    multa: 0,
    desconto: 0,
    observacoes: ""
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: configsCobranca = [] } = useQuery({
    queryKey: ['configs-cobranca'],
    queryFn: () => base44.entities.ConfiguracaoCobrancaEmpresa.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContaReceber.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Conta a receber criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar conta: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContaReceber.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Sucesso!",
        description: "Conta a receber atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar conta: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContaReceber.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({
        title: "Sucesso!",
        description: "Conta a receber excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir conta: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const baixarTituloMutation = useMutation({
    mutationFn: async ({ id, dados }) => {
      const titulo = await base44.entities.ContaReceber.update(id, {
        status: "Recebido",
        data_recebimento: dados.data_recebimento,
        valor_recebido: dados.valor_recebido,
        forma_recebimento: dados.forma_recebimento,
        juros: dados.juros,
        multa: dados.multa,
        desconto: dados.desconto,
        observacoes: dados.observacoes
      });

      const conta = contas.find(c => c.id === id);
      if (conta?.cliente_id) {
        await base44.entities.HistoricoCliente.create({
          group_id: conta.group_id,
          empresa_id: conta.empresa_id,
          cliente_id: conta.cliente_id,
          cliente_nome: conta.cliente,
          modulo_origem: "Financeiro",
          referencia_id: id,
          referencia_tipo: "ContaReceber",
          tipo_evento: "Recebimento",
          titulo_evento: `Recebimento de R$ ${dados.valor_recebido.toFixed(2)}`,
          descricao_detalhada: `Título ${conta.descricao} recebido via ${dados.forma_recebimento}`,
          usuario_responsavel: "Sistema",
          data_evento: new Date().toISOString(),
          valor_relacionado: dados.valor_recebido,
          resolvido: true
        });
      }

      return titulo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título baixado com sucesso!" });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao baixar título: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const baixarMultiplaMutation = useMutation({
    mutationFn: async (dados) => {
      const baixaPromises = contasSelecionadas.map(async (contaId) => {
        const conta = contas.find(c => c.id === contaId);
        if (conta) {
          await baixarTituloMutation.mutateAsync({
            id: contaId,
            dados: {
              ...dados,
              valor_recebido: conta.valor // Use the individual conta's value for each baixa
            }
          });
        }
      });
      await Promise.all(baixaPromises);
    },
    onSuccess: () => {
      setContasSelecionadas([]);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) baixado(s)!` });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao baixar múltiplos títulos: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const gerarBoletoMutation = useMutation({
    mutationFn: async (contaId) => {
      const conta = contas.find(c => c.id === contaId);
      const config = configsCobranca.find(c => c.empresa_id === conta.empresa_id);

      if (!config || !config.ativo) {
        throw new Error("Empresa sem configuração de cobrança ativa");
      }

      if (!config.habilitar_boleto) {
        throw new Error("Boleto não habilitado para esta empresa");
      }

      // MODO SIMULAÇÃO
      const payload = {
        customer: conta.cliente,
        value: conta.valor,
        dueDate: conta.data_vencimento,
        description: conta.descricao,
        billingType: "BOLETO",
        fine: { value: config.multa_pos_vencimento_percent },
        interest: { value: config.juros_ao_dia_percent }
      };

      const retornoMock = {
        id: `bol_${Date.now()}`,
        status: "PENDING",
        invoiceUrl: `https://boleto.simulado.com/${conta.id}`,
        bankSlipUrl: `https://boleto.simulado.com/pdf/${conta.id}`,
        identificationField: "34191.09008 12345.678901 12345.678901 1 99990000012345",
        nossoNumero: String(Date.now()).substring(0, 10)
      };

      // Log
      await base44.entities.LogCobranca.create({
        group_id: conta.group_id,
        empresa_id: conta.empresa_id,
        conta_receber_id: contaId,
        tipo_operacao: "gerar_boleto",
        provedor: config.provedor_cobranca,
        data_hora: new Date().toISOString(),
        payload_enviado: payload,
        retorno_recebido: retornoMock,
        status_operacao: "simulado",
        mensagem: "Boleto gerado em modo simulação",
        id_cobranca_externa: retornoMock.id,
        linha_digitavel: retornoMock.identificationField,
        url_boleto: retornoMock.bankSlipUrl,
        usuario_nome: "Sistema"
      });

      // Atualizar conta
      await base44.entities.ContaReceber.update(contaId, {
        forma_cobranca: "Boleto",
        id_cobranca_externa: retornoMock.id,
        boleto_id_integracao: retornoMock.id,
        linha_digitavel: retornoMock.identificationField,
        codigo_barras: retornoMock.identificationField,
        url_boleto_pdf: retornoMock.bankSlipUrl,
        boleto_url: retornoMock.bankSlipUrl,
        boleto_linha_digitavel: retornoMock.identificationField,
        status_cobranca: "gerada_simulada",
        status_integracao: "gerado",
        provedor_pagamento: config.provedor_cobranca
      });

      return retornoMock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({ title: "✅ Boleto gerado (simulação)!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar boleto",
        description: error.message || "Ocorreu um erro ao gerar o boleto.",
        variant: "destructive"
      });
    }
  });

  const gerarPixMutation = useMutation({
    mutationFn: async (contaId) => {
      const conta = contas.find(c => c.id === contaId);
      const config = configsCobranca.find(c => c.empresa_id === conta.empresa_id);

      if (!config || !config.ativo) {
        throw new Error("Empresa sem configuração de cobrança ativa");
      }

      if (!config.habilitar_pix) {
        throw new Error("PIX não habilitado para esta empresa");
      }

      // MODO SIMULAÇÃO
      const payload = {
        customer: conta.cliente,
        value: conta.valor,
        dueDate: conta.data_vencimento,
        description: conta.descricao,
        billingType: "PIX",
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const pixCopiaCola = `00020126580014br.gov.bcb.pix0136${conta.id}52040000530398654${conta.valor.toFixed(2)}5802BR6009SAO PAULO`;
      const qrCodeBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const retornoMock = {
        id: `pix_${Date.now()}`,
        status: "PENDING",
        encodedImage: qrCodeBase64,
        payload: pixCopiaCola,
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      // Log
      await base44.entities.LogCobranca.create({
        group_id: conta.group_id,
        empresa_id: conta.empresa_id,
        conta_receber_id: contaId,
        tipo_operacao: "gerar_pix",
        provedor: config.provedor_cobranca,
        data_hora: new Date().toISOString(),
        payload_enviado: payload,
        retorno_recebido: retornoMock,
        status_operacao: "simulado",
        mensagem: "PIX gerado em modo simulação",
        id_cobranca_externa: retornoMock.id,
        pix_copia_cola: pixCopiaCola,
        pix_qrcode_base64: qrCodeBase64,
        usuario_nome: "Sistema"
      });

      // Atualizar conta
      await base44.entities.ContaReceber.update(contaId, {
        forma_cobranca: "PIX",
        id_cobranca_externa: retornoMock.id,
        pix_id_integracao: retornoMock.id,
        pix_qrcode: qrCodeBase64,
        pix_copia_cola: pixCopiaCola,
        status_cobranca: "gerada_simulada",
        status_integracao: "gerado",
        provedor_pagamento: config.provedor_cobranca
      });

      return retornoMock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({ title: "✅ PIX gerado (simulação)!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao gerar PIX",
        description: error.message || "Ocorreu um erro ao gerar o PIX.",
        variant: "destructive"
      });
    }
  });

  const enviarWhatsAppMutation = useMutation({
    mutationFn: async (contaId) => {
      const conta = contas.find(c => c.id === contaId);
      const config = configsCobranca.find(c => c.empresa_id === conta.empresa_id);

      const mensagem = (config?.modelo_whatsapp_boleto || "Seu boleto está disponível")
        .replace("{{cliente}}", conta.cliente)
        .replace("{{valor}}", `R$ ${conta.valor.toFixed(2)}`)
        .replace("{{vencimento}}", new Date(conta.data_vencimento).toLocaleDateString('pt-BR'))
        .replace("{{link}}", conta.url_boleto_pdf || "link-disponível");

      // Log
      await base44.entities.LogCobranca.create({
        group_id: conta.group_id,
        empresa_id: conta.empresa_id,
        conta_receber_id: contaId,
        tipo_operacao: "enviar_whatsapp",
        provedor: config?.provedor_cobranca || "Manual",
        data_hora: new Date().toISOString(),
        payload_enviado: { mensagem },
        retorno_recebido: { simulado: true },
        status_operacao: "simulado",
        mensagem: "WhatsApp enviado (simulação)",
        usuario_nome: "Sistema"
      });

      await base44.entities.ContaReceber.update(contaId, {
        data_envio_cobranca: new Date().toISOString()
      });

      return { sucesso: true };
    },
    onSuccess: () => {
      toast({ title: "✅ WhatsApp enviado (simulação)!" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar WhatsApp",
        description: error.message || "Ocorreu um erro ao enviar a mensagem.",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      descricao: "",
      cliente: "",
      cliente_id: "",
      pedido_id: "",
      valor: 0,
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: new Date().toISOString().split('T')[0],
      status: "Pendente",
      forma_recebimento: "Boleto",
      numero_documento: "",
      centro_custo: "",
      observacoes: "",
      empresa_id: ""
    });
    setEditingConta(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingConta) {
      updateMutation.mutate({ id: editingConta.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (conta) => {
    setEditingConta(conta);
    setFormData({ ...conta }); // Spread to avoid direct mutation issues
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleBaixar = (conta) => {
    setContaAtual(conta);
    setDadosBaixa({
      data_recebimento: new Date().toISOString().split('T')[0],
      valor_recebido: conta.valor,
      forma_recebimento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaOpen(true);
  };

  const handleBaixarMultipla = () => {
    if (contasSelecionadas.length === 0) {
      toast({
        title: "⚠️ Selecione pelo menos um título",
        variant: "destructive"
      });
      return;
    }
    // For multiple baixa, we just use the default dadosBaixa,
    // and the mutation will apply the specific `conta.valor`
    // If more granular control is needed, a dialog for multiple baixa would be necessary.
    baixarMultiplaMutation.mutate(dadosBaixa);
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

  const filteredContas = contas
    .filter(c => statusFilter === "todas" || c.status === statusFilter) // Changed from "todos"
    .filter(c =>
      c.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) // Added numero_documento
    );

  const totalSelecionado = contas
    .filter(c => contasSelecionadas.includes(c.id))
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const obterConfigEmpresa = (empresaId) => {
    return configsCobranca.find(c => c.empresa_id === empresaId);
  };

  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Recebido': 'bg-green-100 text-green-800 border-green-300',
    'Pago': 'bg-green-100 text-green-800 border-green-300', // Assuming 'Pago' is equivalent to 'Recebido' in some contexts
    'Atrasado': 'bg-red-100 text-red-800 border-red-300',
    'Vencido': 'bg-red-100 text-red-800 border-red-300', // Assuming 'Vencido' is equivalent to 'Atrasado' in some contexts
    'Cancelado': 'bg-gray-100 text-gray-800 border-gray-300',
    'Parcial': 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const totais = {
    total: filteredContas.reduce((sum, c) => sum + (c.valor || 0), 0),
    pendente: filteredContas.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0),
    pago: filteredContas.filter(c => c.status === 'Recebido').reduce((sum, c) => sum + (c.valor || 0), 0), // Using 'Recebido' for 'pago' total
    vencido: filteredContas.filter(c => c.status === 'Atrasado').reduce((sum, c) => sum + (c.valor || 0), 0) // Using 'Atrasado' for 'vencido' total
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total a Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Total de contas filtradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contas Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Contas ainda não recebidas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Pagas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Contas já recebidas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.vencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">
              Contas em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Buscar por cliente, descrição, nº documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {contasSelecionadas.length > 0 && (
              <Badge className="bg-blue-100 text-blue-700 px-4 py-2">
                {contasSelecionadas.length} selecionado(s) - R$ {totalSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
            )}

            {contasSelecionadas.length > 0 && (
              <ProtectedAction permission="financeiro_receber_baixar_multiplos">
                <Button
                  variant="outline"
                  onClick={handleBaixarMultipla}
                  disabled={baixarMultiplaMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Baixar Múltiplos
                </Button>
              </ProtectedAction>
            )}

            <ProtectedAction permission="financeiro_receber_criar">
              <Button onClick={() => openWindow(ContaReceberForm, {
                windowMode: true,
                onSubmit: async (data) => {
                  try {
                    await base44.entities.ContaReceber.create(data);
                    queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
                    toast({ title: "✅ Conta criada!" });
                  } catch (error) {
                    toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                  }
                }
              }, {
                title: '💰 Nova Conta a Receber',
                width: 900,
                height: 600
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </ProtectedAction>
            
            {/* BACKUP: Dialog removido, agora usa janelas */}
            <Dialog open={false}>
              <DialogContent className="hidden">
                <DialogHeader>
                  <DialogTitle>Removido - Usa Janelas</DialogTitle>
                </DialogHeader>
                <form className="hidden">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Input
                          id="descricao"
                          value={formData.descricao}
                          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="valor">Valor *</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          value={formData.valor}
                          onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cliente">Cliente *</Label>
                      <Select
                        value={formData.cliente_id}
                        onValueChange={(value) => {
                          const selectedCliente = clientes.find(c => c.id === value);
                          setFormData({
                            ...formData,
                            cliente_id: value,
                            cliente: selectedCliente ? selectedCliente.nome_fantasia || selectedCliente.razao_social : ""
                          });
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map(cli => (
                            <SelectItem key={cli.id} value={cli.id}>
                              {cli.nome_fantasia || cli.razao_social}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="empresa_id">Empresa *</Label>
                      <Select
                        value={formData.empresa_id}
                        onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresas.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.nome_fantasia}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="data_emissao">Data de Emissão *</Label>
                        <Input
                          id="data_emissao"
                          type="date"
                          value={formData.data_emissao}
                          onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                        <Input
                          id="data_vencimento"
                          type="date"
                          value={formData.data_vencimento}
                          onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Recebido">Recebido</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="forma_recebimento">Forma de Recebimento</Label>
                      <Select
                        value={formData.forma_recebimento}
                        onValueChange={(value) => setFormData({ ...formData, forma_recebimento: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Transferência">Transferência</SelectItem>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                          <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="numero_documento">Número do Documento</Label>
                      <Input
                        id="numero_documento"
                        value={formData.numero_documento}
                        onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingConta ? "Salvar Alterações" : "Criar Conta"}
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
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Contas a Receber</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={contasSelecionadas.length === filteredContas.filter(c => c.status === "Pendente" || c.status === "Atrasado").length}
                      onCheckedChange={(checked) => {
                        const pendentesOuAtrasadas = filteredContas.filter(c => c.status === "Pendente" || c.status === "Atrasado");
                        setContasSelecionadas(checked ? pendentesOuAtrasadas.map(c => c.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cobrança</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContas.map((conta) => {
                  const empresa = empresas.find(e => e.id === conta.empresa_id);
                  const config = obterConfigEmpresa(conta.empresa_id);
                  const temConfig = config && config.ativo;
                  const vencida = (conta.status === "Pendente" || conta.status === "Atrasado") && new Date(conta.data_vencimento) < new Date();
                  const diasAtraso = vencida
                    ? Math.floor((new Date() - new Date(conta.data_vencimento)) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <TableRow key={conta.id} className={vencida ? 'bg-red-50' : ''}>
                      <TableCell>
                        {(conta.status === "Pendente" || conta.status === "Atrasado") && (
                          <Checkbox
                            checked={contasSelecionadas.includes(conta.id)}
                            onCheckedChange={() => toggleSelecao(conta.id)}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{conta.cliente}</TableCell>
                      <TableCell className="max-w-xs truncate">{conta.descricao}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-purple-600" />
                          <span className="text-xs">{empresa?.nome_fantasia || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</p>
                          {vencida && (
                            <Badge variant="destructive" className="text-xs">
                              {diasAtraso} dia(s) atraso
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[conta.status] || 'bg-gray-100 text-gray-800 border-gray-300'}>
                          {conta.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conta.status_cobranca === "gerada_simulada" || conta.status_cobranca === "gerada" ? (
                          <Badge className="bg-green-100 text-green-700">
                            {conta.forma_cobranca}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Não Gerada</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          <ProtectedAction permission="financeiro_receber_visualizar">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(conta)} // Reusing handleEdit to show details
                              className="justify-start h-7 px-2"
                              title="Ver Detalhes"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              <span className="text-xs">Detalhes</span>
                            </Button>
                          </ProtectedAction>

                          {conta.status === "Pendente" && (
                            <>
                              {!conta.status_cobranca && temConfig && (
                                <ProtectedAction permission="financeiro_receber_gerar_cobranca">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setContaParaCobranca(conta);
                                      setGerarCobrancaDialogOpen(true);
                                    }}
                                    title="Gerar Cobrança"
                                    className="justify-start h-7 px-2 text-xs"
                                  >
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Gerar Cobrança
                                  </Button>
                                </ProtectedAction>
                              )}

                              {conta.boleto_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(conta.boleto_url, '_blank')}
                                  className="justify-start h-7 px-2"
                                  title="Ver Boleto"
                                >
                                  <FileText className="w-3 h-3 mr-1 text-orange-600" />
                                  <span className="text-xs">Ver Boleto</span>
                                </Button>
                              )}
                              {conta.pix_copia_cola && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(conta.pix_copia_cola);
                                    toast({ title: "📋 PIX copiado!" });
                                  }}
                                  className="justify-start h-7 px-2"
                                  title="Copiar PIX"
                                >
                                  <QrCode className="w-3 h-3 mr-1 text-green-600" />
                                  <span className="text-xs">Copiar PIX</span>
                                </Button>
                              )}

                              {(conta.boleto_url || conta.pix_copia_cola) && (
                                <ProtectedAction permission="financeiro_receber_enviar_cobranca_whatsapp">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => enviarWhatsAppMutation.mutate(conta.id)}
                                    disabled={enviarWhatsAppMutation.isPending}
                                    className="justify-start h-7 px-2 text-xs"
                                    title="Enviar por WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3 mr-1 text-green-600" />
                                    WhatsApp
                                  </Button>
                                </ProtectedAction>
                              )}

                              {conta.status_cobranca === "gerada_simulada" && (
                                <ProtectedAction permission="financeiro_receber_simular_pagamento">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setContaParaSimulacao(conta);
                                      setSimularPagamentoDialogOpen(true);
                                    }}
                                    title="Simular Pagamento"
                                    className="justify-start h-7 px-2 text-xs text-green-600 hover:text-green-700"
                                  >
                                    <Zap className="w-3 h-3 mr-1" />
                                    Simular Pgto
                                  </Button>
                                </ProtectedAction>
                              )}

                              {!temConfig && !conta.status_cobranca && (
                                <Badge variant="outline" className="text-xs text-orange-700">
                                  Sem config
                                </Badge>
                              )}
                              <ProtectedAction permission="financeiro_receber_baixar">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBaixar(conta)}
                                  className="justify-start h-7 px-2 text-xs"
                                  title="Baixar Título"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                                  Baixar
                                </Button>
                              </ProtectedAction>
                            </>
                          )}
                          <ProtectedAction permission="financeiro_receber_editar">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWindow(ContaReceberForm, {
                                conta,
                                windowMode: true,
                                onSubmit: async (data) => {
                                  try {
                                    await base44.entities.ContaReceber.update(conta.id, data);
                                    queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
                                    toast({ title: "✅ Conta atualizada!" });
                                  } catch (error) {
                                    toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                                  }
                                }
                              }, {
                                title: `✏️ Editar: ${conta.cliente}`,
                                width: 900,
                                height: 600
                              })}
                              className="justify-start h-7 px-2"
                              title="Editar Conta"
                            >
                              <Edit className="w-3 h-3 mr-1 text-blue-600" />
                              <span className="text-xs">Editar</span>
                            </Button>
                          </ProtectedAction>
                          <ProtectedAction permission="financeiro_receber_excluir">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(conta.id)}
                              className="justify-start h-7 px-2"
                              title="Excluir Conta"
                            >
                              <Trash2 className="w-3 h-3 mr-1 text-red-600" />
                              <span className="text-xs">Excluir</span>
                            </Button>
                          </ProtectedAction>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredContas.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma conta a receber encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Baixa */}
      <Dialog open={dialogBaixaOpen} onOpenChange={setDialogBaixaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixar Conta a Receber</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBaixa} className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input value={contaAtual?.cliente || ''} disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Original</Label>
                <Input value={`R$ ${contaAtual?.valor?.toFixed(2) || 0}`} disabled />
              </div>
              <div>
                <Label>Valor Recebido *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.valor_recebido}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, valor_recebido: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Recebimento *</Label>
                <Input
                  type="date"
                  value={dadosBaixa.data_recebimento}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, data_recebimento: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Forma de Recebimento *</Label>
                <Select
                  value={dadosBaixa.forma_recebimento}
                  onValueChange={(v) => setDadosBaixa({ ...dadosBaixa, forma_recebimento: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                    <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Juros</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.juros}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Multa</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.multa}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.desconto}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogBaixaOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={baixarTituloMutation.isPending} className="bg-green-600">
                {baixarTituloMutation.isPending ? 'Baixando...' : 'Confirmar Baixa'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Gerar Cobrança REMOVIDO - Migrado para uso via Window quando necessário */}

      {/* NEW: Modal Simular Pagamento */}
      {simularPagamentoDialogOpen && (
        <SimularPagamentoModal
          isOpen={simularPagamentoDialogOpen}
          onClose={() => { setSimularPagamentoDialogOpen(false); setContaParaSimulacao(null); }}
          contaReceber={contaParaSimulacao}
        />
      )}
    </div>
  );
}