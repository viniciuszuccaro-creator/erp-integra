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
  Zap,
  Send,
  Wallet,
  Printer,
  ShoppingCart,
  Store,
  Smartphone,
  Globe
} from "lucide-react";
import { ImprimirBoleto } from "@/components/lib/ImprimirBoleto";
import GerarCobrancaModal from "./GerarCobrancaModal";
import SimularPagamentoModal from "./SimularPagamentoModal";
import GerarLinkPagamentoModal from "./GerarLinkPagamentoModal";
import ContaReceberForm from "./ContaReceberForm";
import { useWindow } from "@/components/lib/useWindow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";

/**
 * 💰 CONTAS A RECEBER V22 - MULTICANAL COMPLETO
 * 
 * ✅ Lançamentos Automáticos de:
 * - Pedidos (E-commerce, Marketplace, Portal, Chatbot, WhatsApp, PDV)
 * - Contratos (parcelas mensais)
 * - Empréstimos de Funcionários
 * 
 * ✅ Baixa em Massa com:
 * - Juros/Multas/Descontos configuráveis
 * - Registro automático em CaixaMovimento
 * - Histórico do Cliente
 * 
 * ✅ Integração Gateway de Pagamento:
 * - Boleto, PIX, Cartão via FormaPagamento > GatewayPagamento
 * - Link de pagamento omnichannel
 * 
 * ✅ Envio para Caixa PDV:
 * - Liquidação de recebíveis no caixa
 * - Integração total com CaixaOrdemLiquidacao
 */
export default function ContasReceberTab({ contas, empresas = [] }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();
  const { formasPagamento } = useFormasPagamento();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [canalFilter, setCanalFilter] = useState("todos");
  const [marketplaceFilter, setMarketplaceFilter] = useState("todos");
  const [gerarCobrancaDialogOpen, setGerarCobrancaDialogOpen] = useState(false);
  const [simularPagamentoDialogOpen, setSimularPagamentoDialogOpen] = useState(false);
  const [gerarLinkDialogOpen, setGerarLinkDialogOpen] = useState(false);
  const [contaParaCobranca, setContaParaCobranca] = useState(null);
  const [contaParaSimulacao, setContaParaSimulacao] = useState(null);
  const [contaParaLink, setContaParaLink] = useState(null);

  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [contasSelecionadas, setContasSelecionadas] = useState([]);
  const [contaAtual, setContaAtual] = useState(null);

  const [dadosBaixa, setDadosBaixa] = useState({
    data_recebimento: new Date().toISOString().split('T')[0],
    valor_recebido: 0,
    forma_recebimento: "PIX",
    juros: 0,
    multa: 0,
    desconto: 0,
    observacoes: ""
  });

  const { data: empresasQuery = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const empresasData = empresas.length > 0 ? empresas : empresasQuery;

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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // V22: Mutation para enviar títulos para o Caixa
  const enviarParaCaixaMutation = useMutation({
    mutationFn: async (titulos) => {
      const ordens = await Promise.all(titulos.map(async (titulo) => {
        return await base44.entities.CaixaOrdemLiquidacao.create({
          empresa_id: titulo.empresa_id,
          tipo_operacao: 'Recebimento',
          origem: 'Contas a Receber',
          valor_total: titulo.valor,
          forma_pagamento_pretendida: 'PIX',
          status: 'Pendente',
          titulos_vinculados: [{
            titulo_id: titulo.id,
            tipo_titulo: 'ContaReceber',
            numero_titulo: titulo.numero_documento || titulo.descricao,
            cliente_fornecedor_nome: titulo.cliente,
            valor_titulo: titulo.valor
          }],
          data_ordem: new Date().toISOString(),
          usuario_operador_nome: user?.full_name
        });
      }));
      return ordens;
    },
    onSuccess: (ordens) => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: `✅ ${ordens.length} título(s) enviado(s) para o Caixa!` });
      setContasSelecionadas([]);
    }
  });

  // V22: Baixar título com registro de CaixaMovimento
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
      
      // V22: Registrar movimento de caixa (Entrada)
      await base44.entities.CaixaMovimento.create({
        group_id: conta.group_id,
        empresa_id: conta.empresa_id,
        data_movimento: new Date().toISOString(),
        tipo_movimento: "Entrada",
        origem: "Recebimento Conta a Receber",
        forma_pagamento: dados.forma_recebimento,
        valor: dados.valor_recebido,
        descricao: `Recebimento: ${conta.descricao} - Cliente: ${conta.cliente}`,
        conta_receber_id: id,
        usuario_operador_nome: user?.full_name
      });

      // Histórico do cliente
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
          usuario_responsavel: user?.full_name || "Sistema",
          data_evento: new Date().toISOString(),
          valor_relacionado: dados.valor_recebido,
          resolvido: true
        });
      }

      return titulo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título baixado com sucesso!" });
    }
  });

  // V22: Baixa múltipla com ajuste de valores
  const baixarMultiplaMutation = useMutation({
    mutationFn: async (dados) => {
      const baixaPromises = contasSelecionadas.map(async (contaId) => {
        const conta = contas.find(c => c.id === contaId);
        if (conta) {
          const valorAjustado = (conta.valor || 0) + (dados.juros || 0) + (dados.multa || 0) - (dados.desconto || 0);
          await baixarTituloMutation.mutateAsync({
            id: contaId,
            dados: {
              ...dados,
              valor_recebido: valorAjustado
            }
          });
        }
      });
      await Promise.all(baixaPromises);
    },
    onSuccess: () => {
      setContasSelecionadas([]);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) baixado(s)!` });
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
        usuario_nome: user?.full_name || "Sistema"
      });

      await base44.entities.ContaReceber.update(contaId, {
        data_envio_cobranca: new Date().toISOString()
      });

      return { sucesso: true };
    },
    onSuccess: () => {
      toast({ title: "✅ WhatsApp enviado (simulação)!" });
    }
  });

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
      toast({ title: "⚠️ Selecione pelo menos um título", variant: "destructive" });
      return;
    }
    setContaAtual(null);
    setDialogBaixaOpen(true);
  };

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    if (contaAtual) {
      baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
    } else {
      baixarMultiplaMutation.mutate(dadosBaixa);
    }
  };

  const toggleSelecao = (contaId) => {
    setContasSelecionadas(prev =>
      prev.includes(contaId) ? prev.filter(id => id !== contaId) : [...prev, contaId]
    );
  };

  const filteredContas = contas
    .filter(c => statusFilter === "todas" || c.status === statusFilter)
    .filter(c => canalFilter === "todos" || c.canal_origem === canalFilter)
    .filter(c => marketplaceFilter === "todos" || c.marketplace_origem === marketplaceFilter)
    .filter(c =>
      c.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase())
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
    'Pago': 'bg-green-100 text-green-800 border-green-300',
    'Atrasado': 'bg-red-100 text-red-800 border-red-300',
    'Vencido': 'bg-red-100 text-red-800 border-red-300',
    'Cancelado': 'bg-gray-100 text-gray-800 border-gray-300',
    'Parcial': 'bg-blue-100 text-blue-800 border-blue-300'
  };

  const totais = {
    total: filteredContas.reduce((sum, c) => sum + (c.valor || 0), 0),
    pendente: filteredContas.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0),
    pago: filteredContas.filter(c => c.status === 'Recebido').reduce((sum, c) => sum + (c.valor || 0), 0),
    vencido: filteredContas.filter(c => c.status === 'Atrasado').reduce((sum, c) => sum + (c.valor || 0), 0)
  };

  const canaisOrigem = [...new Set(contas.map(c => c.canal_origem).filter(Boolean))];
  const marketplaces = [...new Set(contas.map(c => c.marketplace_origem).filter(m => m && m !== 'Nenhum'))];

  return (
    <div className="space-y-6 w-full h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">{filteredContas.length} títulos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">A receber</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Já recebidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totais.vencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Em atraso</p>
          </CardContent>
        </Card>
      </div>

      {/* V22: Alerta de Seleção */}
      {contasSelecionadas.length > 0 && (
        <Alert className="border-emerald-300 bg-emerald-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-emerald-900">💰 {contasSelecionadas.length} título(s) selecionado(s)</p>
              <p className="text-xs text-emerald-700">Total: R$ {totalSelecionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const titulos = contas.filter(c => contasSelecionadas.includes(c.id));
                  enviarParaCaixaMutation.mutate(titulos);
                }}
                disabled={enviarParaCaixaMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar para Caixa
              </Button>
              <ProtectedAction permission="financeiro_receber_baixar_multiplos">
                <Button
                  onClick={handleBaixarMultipla}
                  disabled={baixarMultiplaMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Baixar Múltiplos
                </Button>
              </ProtectedAction>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* V22: Filtros Avançados Multicanal */}
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
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={canalFilter} onValueChange={setCanalFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Canal Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Canais</SelectItem>
                {canaisOrigem.map(canal => (
                  <SelectItem key={canal} value={canal}>{canal}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Marketplace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Marketplaces</SelectItem>
                {marketplaces.map(mp => (
                  <SelectItem key={mp} value={mp}>{mp}</SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              })} className="ml-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </ProtectedAction>
          </div>
        </CardContent>
      </Card>

      {/* V22: Tabela Multicanal */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Contas a Receber - Multicanal</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={contasSelecionadas.length === filteredContas.filter(c => c.status === "Pendente" || c.status === "Atrasado").length && filteredContas.filter(c => c.status === "Pendente" || c.status === "Atrasado").length > 0}
                      onCheckedChange={(checked) => {
                        const pendentes = filteredContas.filter(c => c.status === "Pendente" || c.status === "Atrasado");
                        setContasSelecionadas(checked ? pendentes.map(c => c.id) : []);
                      }}
                    />
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Cobrança</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContas.map((conta) => {
                  const empresa = empresasData.find(e => e.id === conta.empresa_id);
                  const pedido = pedidos.find(p => p.id === conta.pedido_id);
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
                      <TableCell>
                        {pedido ? (
                          <Badge variant="outline" className="text-xs">
                            {pedido.numero_pedido}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{conta.descricao}</TableCell>
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
                            <Badge variant="destructive" className="text-xs mt-1">
                              {diasAtraso} dia(s) atraso
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {conta.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[conta.status] || 'bg-gray-100'}>
                          {conta.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                          {conta.canal_origem === 'E-commerce' && <ShoppingCart className="w-3 h-3" />}
                          {conta.canal_origem === 'Portal do Cliente' && <Eye className="w-3 h-3" />}
                          {conta.canal_origem === 'WhatsApp' && <MessageSquare className="w-3 h-3" />}
                          {conta.canal_origem === 'Marketplace' && <Store className="w-3 h-3" />}
                          {conta.canal_origem === 'App Mobile' && <Smartphone className="w-3 h-3" />}
                          {conta.canal_origem || 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {conta.marketplace_origem && conta.marketplace_origem !== 'Nenhum' ? (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {conta.marketplace_origem}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const empresaData = empresasData.find(e => e.id === conta.empresa_id);
                              ImprimirBoleto({ conta, empresa: empresaData, tipo: 'receber' });
                            }}
                            className="justify-start h-7 px-2 text-slate-600"
                          >
                            <Printer className="w-3 h-3 mr-1" />
                            <span className="text-xs">Imprimir</span>
                          </Button>

                          {conta.status === "Pendente" && (
                            <>
                              {!conta.status_cobranca && temConfig && (
                                <>
                                  <ProtectedAction permission="financeiro_receber_gerar_cobranca">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setContaParaCobranca(conta);
                                        setGerarCobrancaDialogOpen(true);
                                      }}
                                      className="justify-start h-7 px-2 text-xs"
                                    >
                                      <CreditCard className="w-3 h-3 mr-1" />
                                      Gerar Cobrança
                                    </Button>
                                  </ProtectedAction>
                                  <ProtectedAction permission="financeiro_receber_gerar_cobranca">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setContaParaLink(conta);
                                        setGerarLinkDialogOpen(true);
                                      }}
                                      className="justify-start h-7 px-2 text-xs text-purple-600"
                                    >
                                      <Wallet className="w-3 h-3 mr-1" />
                                      Link Pgto
                                    </Button>
                                  </ProtectedAction>
                                </>
                              )}

                              {conta.boleto_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(conta.boleto_url, '_blank')}
                                  className="justify-start h-7 px-2"
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
                                  >
                                    <MessageSquare className="w-3 h-3 mr-1 text-green-600" />
                                    WhatsApp
                                  </Button>
                                </ProtectedAction>
                              )}

                              <ProtectedAction permission="financeiro_receber_baixar">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleBaixar(conta)}
                                  className="justify-start h-7 px-2 text-xs"
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
                            >
                              <Edit className="w-3 h-3 mr-1 text-blue-600" />
                              <span className="text-xs">Editar</span>
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

      {/* V22: Dialog Baixa Melhorado */}
      <Dialog open={dialogBaixaOpen} onOpenChange={setDialogBaixaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{contaAtual ? "Baixar Conta a Receber" : "Baixar Múltiplas Contas"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBaixa} className="space-y-4">
            {contaAtual && (
              <div>
                <Label>Cliente</Label>
                <Input value={contaAtual?.cliente || ''} disabled />
              </div>
            )}
            {!contaAtual && (
              <Alert className="border-blue-300 bg-blue-50">
                <AlertDescription className="text-xs text-blue-900">
                  Serão baixados <strong>{contasSelecionadas.length} títulos</strong>. Configure a forma de recebimento, juros, multas e descontos.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Original</Label>
                <Input value={`R$ ${contaAtual?.valor?.toFixed(2) || 0}`} disabled />
              </div>
              <div>
                <Label>Valor Total a Receber (Ajustado)</Label>
                <Input
                  value={`R$ ${((contaAtual?.valor || 0) + (dadosBaixa.juros || 0) + (dadosBaixa.multa || 0) - (dadosBaixa.desconto || 0)).toFixed(2)}`}
                  disabled
                  className="font-bold text-green-600"
                />
              </div>
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
                    {formasPagamento.map(forma => (
                      <SelectItem key={forma.id} value={forma.descricao}>
                        {forma.icone && `${forma.icone} `}{forma.descricao}
                      </SelectItem>
                    ))}
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
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Multa</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.multa}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosBaixa.desconto}
                  onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogBaixaOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={baixarTituloMutation.isPending || baixarMultiplaMutation.isPending} className="bg-green-600">
                {(baixarTituloMutation.isPending || baixarMultiplaMutation.isPending) ? 'Baixando...' : 'Confirmar Baixa'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {gerarCobrancaDialogOpen && (
        <GerarCobrancaModal
          isOpen={gerarCobrancaDialogOpen}
          onClose={() => { setGerarCobrancaDialogOpen(false); setContaParaCobranca(null); }}
          contaReceber={contaParaCobranca}
        />
      )}

      {gerarLinkDialogOpen && (
        <GerarLinkPagamentoModal
          isOpen={gerarLinkDialogOpen}
          onClose={() => { setGerarLinkDialogOpen(false); setContaParaLink(null); }}
          contaReceber={contaParaLink}
        />
      )}

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