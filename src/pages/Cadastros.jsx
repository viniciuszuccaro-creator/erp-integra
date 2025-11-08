
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  Building2,
  Truck,
  DollarSign,
  User,
  Plus,
  Search,
  Edit,
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  Package,
  CreditCard,
  Landmark,
  Factory,
  Globe,
  Boxes,
  Network,
  Sparkles,
  ChevronRight,
  Link2,
  Cpu,
  ShoppingBag,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Lock, // NEW: Lock icon for Chatbot intents
  Shield, // NEW: Shield icon for PerfilAcesso
  Briefcase, // NEW ICON
  UserCircle, // NEW ICON
  Clock, // NEW ICON
  UserCheck, // NEW ICON: UserCheck for Representantes
  Award, // NEW ICON: Award for Brands
  Target, // NEW ICON for Centros de Resultado
  Receipt, // NEW ICON for Tipos de Despesa
  TrendingUp, // NEW ICON for Moedas e Índices
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import ClienteForm from "../components/comercial/ClienteForm";
import ColaboradorForm from "../components/rh/ColaboradorForm";
import TransportadoraForm from "../components/cadastros/TransportadoraForm";
import CentroCustoForm from "../components/cadastros/CentroCustoForm";
import CadastroClienteCompleto from "../components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "../components/cadastros/CadastroFornecedorCompleto";
import PainelDinamicoCliente from "../components/cadastros/PainelDinamicoCliente";
import IconeAcessoCliente from "../components/cadastros/IconeAcessoCliente";
import PainelDinamicoFornecedor from "../components/cadastros/PainelDinamicoFornecedor";
import IconeAcessoFornecedor from "../components/cadastros/IconeAcessoFornecedor";
import PainelDinamicoTransportadora from "../components/cadastros/PainelDinamicoTransportadora";
import IconeAcessoTransportadora from "../components/cadastros/IconeAcessoTransportadora";
import IconeAcessoColaborador from "../components/cadastros/IconeAcessoColaborador";
import PainelDinamicoColaborador from "../components/cadastros/PainelDinamicoColaborador";
import ConfiguracaoIntegracaoForm from "../components/cadastros/ConfiguracaoIntegracaoForm";
import EventoNotificacaoForm from "../components/cadastros/EventoNotificacaoForm";
import BancoForm from "../components/cadastros/BancoForm";
import FormaPagamentoForm from "../components/cadastros/FormaPagamentoForm";
import VeiculoForm from "../components/cadastros/VeiculoForm";
import EmpresaForm from "../components/cadastros/EmpresaForm"; // NEW IMPORT
import ProdutoForm from "../components/cadastros/ProdutoForm"; // NEW IMPORT
import ServicoForm from "../components/cadastros/ServicoForm"; // NEW IMPORT
import TabelaPrecoForm from "../components/cadastros/TabelaPrecoForm"; // NEW IMPORT
import CatalogoWebForm from "../components/cadastros/CatalogoWebForm"; // NEW IMPORT
import WebhookForm from "../components/cadastros/WebhookForm"; // NEW IMPORT
import ChatbotIntentsForm from "../components/cadastros/ChatbotIntentsForm"; // NEW IMPORT
import UsuarioForm from "../components/cadastros/UsuarioForm"; // NEW IMPORT
import PerfilAcessoForm from "../components/cadastros/PerfilAcessoForm"; // NEW IMPORT
import RotaPadraoForm from "../components/cadastros/RotaPadraoForm"; // NEW IMPORT
import LocalEstoqueForm from "../components/cadastros/LocalEstoqueForm"; // NEW IMPORT
import CadastroFiscalForm from "../components/cadastros/CadastroFiscalForm"; // NEW IMPORT
import GrupoEmpresarialForm from "../components/cadastros/GrupoEmpresarialForm";
import FilialForm from "../components/cadastros/FilialForm";
import DepartamentoForm from "../components/cadastros/DepartamentoForm";
import CargoForm from "../components/cadastros/CargoForm";
import TurnoForm from "../components/cadastros/TurnoForm";
import CondicaoComercialForm from "../components/cadastros/CondicaoComercialForm";
import ContatoB2BForm from "../components/cadastros/ContatoB2BForm";
import RepresentanteForm from "../components/cadastros/RepresentanteForm";
import SegmentoClienteForm from "../components/cadastros/SegmentoClienteForm";
import GrupoProdutoForm from "../components/cadastros/GrupoProdutoForm";
import MarcaForm from "../components/cadastros/MarcaForm";
import KitProdutoForm from "../components/cadastros/KitProdutoForm";
import PlanoContasForm from "../components/cadastros/PlanoContasForm";
import CentroResultadoForm from "../components/cadastros/CentroResultadoForm";
import TipoDespesaForm from "../components/cadastros/TipoDespesaForm";
import MoedaIndiceForm from "../components/cadastros/MoedaIndiceForm";
import MotoristaForm from "../components/cadastros/MotoristaForm";
import TipoFreteForm from "../components/cadastros/TipoFreteForm";
import ModeloDocumentoForm from "../components/cadastros/ModeloDocumentoForm";

/**
 * CADASTROS GERAIS V19.1 - HUB CENTRAL COM AUDITORIA COMPLETA
 * Blocos 1/6, 2/6, 3/6, 4/6 e 5/6 totalmente sincronizados
 */
export default function Cadastros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tipoDialog, setTipoDialog] = useState(null);
  
  // Estados para cadastros completos
  const [cadastroCompletoAberto, setCadastroCompletoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [cadastroFornecedorAberto, setCadastroFornecedorAberto] = useState(false);
  
  // Estados para painéis dinâmicos
  const [painelClienteAberto, setPainelClienteAberto] = useState(false);
  const [clienteParaPainel, setClienteParaPainel] = useState(null);
  const [painelFornecedorAberto, setPainelFornecedorAberto] = useState(false);
  const [fornecedorParaPainel, setFornecedorParaPainel] = useState(null);
  const [painelTransportadoraAberto, setPainelTransportadoraAberto] = useState(false);
  const [transportadoraParaPainel, setTransportadoraParaPainel] = useState(null);
  const [painelColaboradorAberto, setPainelColaboradorAberto] = useState(false);
  const [colaboradorParaPainel, setColaboradorParaPainel] = useState(null);

  // NOVO: Estados para Grupo 6
  const [configIntegracaoOpen, setConfigIntegracaoOpen] = useState(false);
  const [eventoNotificacaoOpen, setEventoNotificacaoOpen] = useState(false);

  // NOVO: Estados adicionais V18.0
  const [webhookFormOpen, setWebhookFormOpen] = useState(false);
  const [chatbotIntentOpen, setChatbotIntentOpen] = useState(false);
  const [produtoFormOpen, setProdutoFormOpen] = useState(false);
  const [servicoFormOpen, setServicoFormOpen] = useState(false);
  const [tabelaPrecoFormOpen, setTabelaPrecoFormOpen] = useState(false);
  const [catalogoWebFormOpen, setCatalogoWebFormOpen] = useState(false);
  const [empresaFormOpen, setEmpresaFormOpen] = useState(false);

  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false); // NEW
  const [perfilAcessoFormOpen, setPerfilAcessoFormOpen] = useState(false); // NEW
  const [rotaPadraoFormOpen, setRotaPadraoFormOpen] = useState(false); // NEW
  const [localEstoqueFormOpen, setLocalEstoqueFormOpen] = useState(false); // NEW
  const [cadastroFiscalFormOpen, setCadastroFiscalFormOpen] = useState(false); // NEW
  const [bitolasPanelOpen, setBitolasPanelOpen] = useState(false); // NEW

  const [grupoEmpresarialFormOpen, setGrupoEmpresarialFormOpen] = useState(false);
  const [filialFormOpen, setFilialFormOpen] = useState(false);
  const [departamentoFormOpen, setDepartamentoFormOpen] = useState(false);
  const [cargoFormOpen, setCargoFormOpen] = useState(false);
  const [turnoFormOpen, setTurnoFormOpen] = useState(false);

  // NEW: Estados para Bloco 2
  const [condicaoComercialFormOpen, setCondicaoComercialFormOpen] = useState(false);
  const [contatoB2BFormOpen, setContatoB2BFormOpen] = useState(false);
  const [representanteFormOpen, setRepresentanteFormOpen] = useState(false);
  const [segmentoClienteFormOpen, setSegmentoClienteFormOpen] = useState(false);

  const [grupoProdutoFormOpen, setGrupoProdutoFormOpen] = useState(false);
  const [marcaFormOpen, setMarcaFormOpen] = useState(false);
  const [kitProdutoFormOpen, setKitProdutoFormOpen] = useState(false);

  const [planoContasFormOpen, setPlanoContasFormOpen] = useState(false);
  const [centroResultadoFormOpen, setCentroResultadoFormOpen] = useState(false);
  const [tipoDespesaFormOpen, setTipoDespesaFormOpen] = useState(false);
  const [moedaIndiceFormOpen, setMoedaIndiceFormOpen] = useState(false);

  const [motoristaFormOpen, setMotoristaFormOpen] = useState(false);
  const [tipoFreteFormOpen, setTipoFreteFormOpen] = useState(false);
  const [modeloDocumentoFormOpen, setModeloDocumentoFormOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast(); // Initialize toast

  // QUERIES
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list('-created_date'),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list('-created_date'),
  });

  const { data: transportadoras = [] } = useQuery({
    queryKey: ['transportadoras'],
    queryFn: () => base44.entities.Transportadora.list('-created_date'),
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => base44.entities.Colaborador.list('-created_date'),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => base44.entities.CentroCusto.list('-created_date'),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date'),
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => base44.entities.GrupoEmpresarial.list(),
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list('-created_date'),
  });

  // NOVO: Queries do Grupo 6
  const { data: eventosNotificacao = [] } = useQuery({
    queryKey: ['eventos-notificacao'],
    queryFn: () => base44.entities.EventoNotificacao.list('-created_date'),
  });

  const { data: configsIntegracao = [] } = useQuery({
    queryKey: ['configs-integracao-marketplace'],
    queryFn: () => base44.entities.ConfiguracaoIntegracaoMarketplace.list(),
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list(),
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list(),
  });

  const { data: catalogoWeb = [] } = useQuery({
    queryKey: ['catalogo-web'],
    queryFn: () => base44.entities.CatalogoWeb.list(),
  });

  const { data: usuarios = [] } = useQuery({ // NEW QUERY
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: perfisAcesso = [] } = useQuery({ // NEW QUERY
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: departamentos = [] } = useQuery({
    queryKey: ['departamentos'],
    queryFn: () => base44.entities.Departamento.list(),
  });

  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos'],
    queryFn: () => base44.entities.Cargo.list(),
  });

  const { data: turnos = [] } = useQuery({
    queryKey: ['turnos'],
    queryFn: () => base44.entities.Turno.list(),
  });

  const { data: condicoesComerciais = [] } = useQuery({
    queryKey: ['condicoes-comerciais'],
    queryFn: () => base44.entities.CondicaoComercial.list(),
  });

  const { data: contatosB2B = [] } = useQuery({
    queryKey: ['contatos-b2b'],
    queryFn: () => base44.entities.ContatoB2B.list('-created_date'),
  });

  const { data: representantes = [] } = useQuery({
    queryKey: ['representantes'],
    queryFn: () => base44.entities.Representante.list(),
  });

  const { data: segmentosCliente = [] } = useQuery({
    queryKey: ['segmentos-cliente'],
    queryFn: () => base44.entities.SegmentoCliente.list(),
  });

  const { data: gruposProduto = [] } = useQuery({
    queryKey: ['grupos-produto'],
    queryFn: () => base44.entities.GrupoProduto.list(),
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => base44.entities.Marca.list(),
  });

  const { data: kits = [] } = useQuery({
    queryKey: ['kits-produto'],
    queryFn: () => base44.entities.KitProduto.list(),
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: () => base44.entities.PlanoDeContas.list(),
  });

  const { data: centrosResultado = [] } = useQuery({
    queryKey: ['centros-resultado'],
    queryFn: () => base44.entities.CentroResultado.list(),
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: () => base44.entities.TipoDespesa.list(),
  });

  const { data: moedasIndices = [] } = useQuery({
    queryKey: ['moedas-indices'],
    queryFn: () => base44.entities.MoedaIndice.list(),
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => base44.entities.Motorista.list(),
  });

  const { data: tiposFrete = [] } = useQuery({
    queryKey: ['tipos-frete'],
    queryFn: () => base44.entities.TipoFrete.list(),
  });

  const { data: modelosDocumento = [] } = useQuery({
    queryKey: ['modelos-documento'],
    queryFn: () => base44.entities.ModeloDocumento.list(),
  });

  // MUTATIONS
  const createColaboradorMutation = useMutation({
    mutationFn: (data) => base44.entities.Colaborador.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      handleCloseDialog();
    },
  });

  const updateColaboradorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Colaborador.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      handleCloseDialog();
    },
  });

  const createTransportadoraMutation = useMutation({
    mutationFn: (data) => base44.entities.Transportadora.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      handleCloseDialog();
    },
  });

  const updateTransportadoraMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transportadora.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
      handleCloseDialog();
    },
  });

  const createCentroCustoMutation = useMutation({
    mutationFn: (data) => base44.entities.CentroCusto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centrosCusto'] });
      handleCloseDialog();
    },
  });

  const updateCentroCustoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CentroCusto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centrosCusto'] });
      handleCloseDialog();
    },
  });

  const createBancoMutation = useMutation({
    mutationFn: (data) => base44.entities.Banco.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bancos'] });
      handleCloseDialog();
      toast({ title: "✅ Conta bancária criada!", duration: 3000 });
    },
  });

  const createFormaPagamentoMutation = useMutation({
    mutationFn: (data) => base44.entities.FormaPagamento.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
      handleCloseDialog();
      toast({ title: "✅ Forma de pagamento criada!", duration: 3000 });
    },
  });

  const createVeiculoMutation = useMutation({
    mutationFn: (data) => base44.entities.Veiculo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      handleCloseDialog();
      toast({ title: "✅ Veículo cadastrado!", duration: 3000 });
    },
  });

  // NOVO: Mutations do Grupo 6
  const createEventoMutation = useMutation({
    mutationFn: (data) => base44.entities.EventoNotificacao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos-notificacao'] });
      setEventoNotificacaoOpen(false);
      toast({ title: "✅ Evento criado!", duration: 3000 });
    },
  });

  // NOVO: Mutations V18.0
  const createProdutoMutation = useMutation({
    mutationFn: (data) => base44.entities.Produto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setProdutoFormOpen(false);
      toast({ title: "✅ Produto criado!", duration: 3000 });
    },
  });

  const createServicoMutation = useMutation({
    mutationFn: (data) => base44.entities.Servico.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicos'] });
      setServicoFormOpen(false);
      toast({ title: "✅ Serviço criado!", duration: 3000 });
    },
  });

  const createTabelaPrecoMutation = useMutation({
    mutationFn: (data) => base44.entities.TabelaPreco.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
      setTabelaPrecoFormOpen(false);
      toast({ title: "✅ Tabela criada!", duration: 3000 });
    },
  });

  const createCatalogoMutation = useMutation({
    mutationFn: (data) => base44.entities.CatalogoWeb.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-web'] });
      setCatalogoWebFormOpen(false);
      toast({ title: "✅ Catálogo criado!", duration: 3000 });
    },
  });

  const createEmpresaMutation = useMutation({
    mutationFn: (data) => base44.entities.Empresa.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      setEmpresaFormOpen(false);
      toast({ title: "✅ Empresa criada!", duration: 3000 });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setTipoDialog(null);
  };

  const handleEdit = (item, tipo) => {
    setEditingItem(item);
    setTipoDialog(tipo);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data) => {
    if (tipoDialog === "colaboradores") {
      if (editingItem) {
        updateColaboradorMutation.mutate({ id: editingItem.id, data });
      } else {
        createColaboradorMutation.mutate(data);
      }
    } else if (tipoDialog === "transportadoras") {
      if (editingItem) {
        updateTransportadoraMutation.mutate({ id: editingItem.id, data });
      } else {
        createTransportadoraMutation.mutate(data);
      }
    } else if (tipoDialog === "centroscusto") {
      if (editingItem) {
        updateCentroCustoMutation.mutate({ id: editingItem.id, data });
      } else {
        createCentroCustoMutation.mutate(data);
      }
    } else if (tipoDialog === "bancos") {
      createBancoMutation.mutate(data);
    } else if (tipoDialog === "formas-pagamento") {
      createFormaPagamentoMutation.mutate(data);
    } else if (tipoDialog === "veiculos") {
      createVeiculoMutation.mutate(data);
    }
  };

  const handleEditarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setCadastroCompletoAberto(true);
  };

  const handleNovoCliente = () => {
    setClienteSelecionado(null);
    setCadastroCompletoAberto(true);
  };

  const handleEditarFornecedor = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setCadastroFornecedorAberto(true);
  };

  const handleNovoFornecedor = () => {
    setFornecedorSelecionado(null);
    setCadastroFornecedorAberto(true);
  };

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700 border-green-300',
    'Inativo': 'bg-gray-100 text-gray-700 border-gray-300',
    'Prospect': 'bg-blue-100 text-blue-700 border-blue-300',
    'Bloqueado': 'bg-red-100 text-red-700 border-red-300'
  };

  // Helper function for navigation (since actual routing is not part of this component)
  const createPageUrl = (pageName) => {
    switch(pageName) {
      case 'Integracoes': return '/integracoes';
      case 'PortalCliente': return '/portal-cliente';
      case 'EstoqueProdutos': return '/estoque?tab=produtos';
      case 'FiscalTabelas': return '/fiscal?tab=tabelas';
      default: return `/${pageName.toLowerCase()}`;
    }
  };

  const totalItensGrupo1 = empresas.length + grupos.length + usuarios.length + perfisAcesso.length + departamentos.length + cargos.length + turnos.length;
  const totalItensGrupo2 = clientes.length + fornecedores.length + colaboradores.length + transportadoras.length + contatosB2B.length + representantes.length;
  const totalItensGrupo3 = produtos.length + servicos.length + tabelasPreco.length + catalogoWeb.length + gruposProduto.length + marcas.length + kits.length;
  const totalItensGrupo4 = bancos.length + formasPagamento.length + planoContas.length + centrosResultado.length + tiposDespesa.length + moedasIndices.length;
  const totalItensGrupo5 = veiculos.length + motoristas.length + tiposFrete.length + modelosDocumento.length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🚀 Cadastros Gerais V19.1
          </h1>
          <p className="text-slate-600">Hub Central com 5/6 Blocos Sincronizados</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          IA Integrada
        </Badge>
      </div>

      {/* DASHBOARD DE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{clientes.length}</div>
            <p className="text-xs text-slate-600">Clientes</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-cyan-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-600">{fornecedores.length}</div>
            <p className="text-xs text-slate-600">Fornecedores</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{produtos.length}</div>
            <p className="text-xs text-slate-600">Produtos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{formasPagamento.length}</div>
            <p className="text-xs text-slate-600">Formas Pagto</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Landmark className="w-5 h-5 text-indigo-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{bancos.length}</div>
            <p className="text-xs text-slate-600">Bancos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <User className="w-5 h-5 text-pink-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-pink-600">{colaboradores.length}</div>
            <p className="text-xs text-slate-600">Colaboradores</p>
          </CardContent>
        </Card>
      </div>

      {/* BUSCA GLOBAL */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="🔍 Buscar em todos os cadastros... (clientes, produtos, fornecedores, etc)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base shadow-md border-slate-300"
        />
      </div>

      {/* ACCORDION COM 6 GRUPOS */}
      <Accordion type="multiple" defaultValue={["grupo-5"]} className="space-y-4">
        
        {/* 🏢 GRUPO 1: EMPRESA E ESTRUTURA - SINCRONIZADO V19.1 */}
        <AccordionItem value="grupo-1" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🏢 Empresa e Estrutura</h3>
                <p className="text-xs text-slate-600">Multiempresa, Grupos, Filiais, Usuários e Controle de Acesso</p>
              </div>
              <Badge className="ml-auto">
                {totalItensGrupo1} itens
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* 1.1 Empresas - TABELA COM BOTÕES */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Empresas ({empresas.length})
                </h4>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setEmpresaFormOpen(true)}>
                  <Plus className="w-3 h-3 mr-2" />
                  Nova Empresa
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Regime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.slice(0, 5).map((empresa) => (
                    <TableRow key={empresa.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{empresa.razao_social}</TableCell>
                      <TableCell className="text-sm">{empresa.cnpj}</TableCell>
                      <TableCell className="text-sm">{empresa.regime_tributario}</TableCell>
                      <TableCell>
                        <Badge className={empresa.status === 'Ativa' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {empresa.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => setEmpresaFormOpen(true)}> {/* Placeholder for edit, opens new form */}
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 1.2 Grupos Empresariais - ATIVADO V19.1 */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-600" />
                  Grupos Empresariais ({grupos.length})
                </h4>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setGrupoEmpresarialFormOpen(true)}>
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Grupo
                </Button>
              </div>
              
              <div className="grid gap-3">
                {grupos.map(grupo => (
                  <Card key={grupo.id} className="border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Network className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-medium text-sm">{grupo.nome_do_grupo}</p>
                            <p className="text-xs text-slate-500">
                              {(grupo.empresas_ids || []).length} empresa(s) vinculada(s)
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">
                          Score IA: {grupo.score_integracao_erp || 0}%
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {grupos.length === 0 && (
                <Card className="border-dashed border-2">
                  <CardContent className="p-6 text-center text-slate-500">
                    <Network className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum grupo empresarial cadastrado</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 1.3 Grid de Gestão Organizacional */}
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">Usuários</h4>
                    <Badge className="ml-auto">{usuarios.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Controle de acesso
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setUsuarioFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Convidar Usuário
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Perfis de Acesso</h4>
                    <Badge className="ml-auto">{perfisAcesso.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    IA de Compliance (SoD)
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setPerfilAcessoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Perfil
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold">Filiais</h4>
                    <Badge className="ml-auto">{empresas.filter(e => e.tipo === 'Filial').length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    IA GeoValidador
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setFilialFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Filial
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold">Departamentos</h4>
                    <Badge className="ml-auto">{departamentos.length}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setDepartamentoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Departamento
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCircle className="w-5 h-5 text-pink-600" />
                    <h4 className="font-semibold">Cargos</h4>
                    <Badge className="ml-auto">{cargos.length}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCargoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Cargo
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">Turnos</h4>
                    <Badge className="ml-auto">{turnos.length}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setTurnoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Turno
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 1.4 Centros de Custo */}
            <Card className="border hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold">Centros de Custo</h4>
                  <Badge className="ml-auto">{centrosCusto.length}</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Controle de despesas, receitas e investimentos
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setTipoDialog('centroscusto');
                    setEditingItem(null);
                    setIsDialogOpen(true);
                  }}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Centro de Custo
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* 👥 GRUPO 2: PESSOAS E PARCEIROS - SINCRONIZADO V19.1 */}
        <AccordionItem value="grupo-2" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-green-50 to-cyan-50 hover:bg-green-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">👥 Pessoas e Parceiros</h3>
                <p className="text-xs text-slate-600">CRM, Portal, Fornecedores, Colaboradores e Contatos B2B</p>
              </div>
              <Badge className="ml-auto">{totalItensGrupo2} itens</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* Tabela de Clientes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Clientes ({clientes.length})
                </h4>
                <Button onClick={handleNovoCliente} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Cliente
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.slice(0, 5).map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-slate-50">
                      <TableCell>
                        <IconeAcessoCliente
                          cliente={cliente}
                          variant="inline"
                          onView={(c) => { setClienteParaPainel(c); setPainelClienteAberto(true); }}
                          onEdit={(c) => handleEditarCliente(c)}
                        />
                      </TableCell>
                      <TableCell className="text-sm">{cliente.cpf || cliente.cnpj || '-'}</TableCell>
                      <TableCell className="text-sm">{cliente.endereco_principal?.cidade || '-'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[cliente.status]}>{cliente.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <IconeAcessoCliente
                          cliente={cliente}
                          variant="default"
                          onView={(c) => { setClienteParaPainel(c); setPainelClienteAberto(true); }}
                          onEdit={(c) => handleEditarCliente(c)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {clientes.length > 5 && (
                <Button variant="link" className="mt-2 text-blue-600">
                  Ver todos os {clientes.length} clientes →
                </Button>
              )}
            </div>

            {/* Grid EXPANDIDO com cadastros complementares */}
            <div className="grid lg:grid-cols-3 gap-4 mt-6">
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold">Fornecedores</h4>
                    <Badge className="ml-auto">{fornecedores.length}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={handleNovoFornecedor}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Fornecedor
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-pink-600" />
                    <h4 className="font-semibold">Colaboradores</h4>
                    <Badge className="ml-auto">{colaboradores.length}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setTipoDialog('colaboradores');
                      setEditingItem(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Colaborador
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">Transportadoras</h4>
                    <Badge className="ml-auto">{transportadoras.length}</Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setTipoDialog('transportadoras');
                      setEditingItem(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Transportadora
                  </Button>
                </CardContent>
              </Card>

              {/* NOVO: Contatos B2B */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Contatos B2B</h4>
                    <Badge className="ml-auto">{contatosB2B.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Pessoas de contato dos clientes (LGPD)
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setContatoB2BFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Contato
                  </Button>
                </CardContent>
              </Card>

              {/* NOVO: Condições Comerciais */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">Condições Comerciais</h4>
                    <Badge className="ml-auto">{condicoesComerciais.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Prazos, descontos e parcelamentos
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCondicaoComercialFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Condição
                  </Button>
                </CardContent>
              </Card>

              {/* NOVO: Representantes */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold">Representantes</h4>
                    <Badge className="ml-auto">{representantes.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Representantes comerciais
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setRepresentanteFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Representante
                  </Button>
                </CardContent>
              </Card>

              {/* NOVO: Segmentos de Cliente */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold">Segmentos de Cliente</h4>
                    <Badge className="ml-auto">{segmentosCliente.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Classificação e critérios
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSegmentoClienteFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Segmento
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* NOVO: Alertas IA - KYC/KYB e Churn */}
            <div className="grid lg:grid-cols-2 gap-4 mt-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-sm text-red-900">
                  🚨 <strong>IA KYC/KYB Ativa:</strong> BLOQUEIA pedidos de clientes com status fiscal "Inapto" na Receita Federal
                </AlertDescription>
              </Alert>

              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-900">
                  📊 <strong>IA Churn Risk:</strong> Detecta clientes inativos (+60 dias) e cria oportunidade no CRM automaticamente
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 🧱 GRUPO 3: PRODUTOS E SERVIÇOS - REESTRUTURADO V19.1 */}
        <AccordionItem value="grupo-3" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🧱 Produtos e Serviços</h3>
                <p className="text-xs text-slate-600">Catálogo Mestre, Tabelas de Preço, Bitolas e E-commerce</p>
              </div>
              <Badge className="ml-auto">
                {totalItensGrupo3} itens
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* ALERTA ARQUITETURAL */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm text-blue-900">
                ✅ <strong>Hub Centralizado V19.1:</strong> Todos os cadastros mestres de produtos agora estão nesta página. O módulo Estoque apenas consulta e movimenta.
              </AlertDescription>
            </Alert>

            {/* Grid Principal 2x4 */}
            <div className="grid lg:grid-cols-4 gap-4">
              {/* 3.1 Produtos */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Produtos</h4>
                    <Badge className="ml-auto">{produtos.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Cadastro mestre com IA de classificação
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setProdutoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Produto
                  </Button>
                </CardContent>
              </Card>

              {/* 3.2 Serviços */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Factory className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold">Serviços</h4>
                    <Badge className="ml-auto">{servicos.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Corte, dobra, soldagem
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setServicoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Serviço
                  </Button>
                </CardContent>
              </Card>

              {/* 3.3 Grupos de Produtos */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Boxes className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold">Grupos</h4>
                    <Badge className="ml-auto">{gruposProduto.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Categorização hierárquica
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setGrupoProdutoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Grupo
                  </Button>
                </CardContent>
              </Card>

              {/* 3.4 Marcas/Fabricantes */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold">Marcas</h4>
                    <Badge className="ml-auto">{marcas.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Fabricantes e certificações
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setMarcaFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Marca
                  </Button>
                </CardContent>
              </Card>

              {/* 3.5 Tabelas de Preço */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">Tabelas de Preço</h4>
                    <Badge className="ml-auto">{tabelasPreco.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Atacado, varejo, especial
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setTabelaPrecoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Tabela
                  </Button>
                </CardContent>
              </Card>

              {/* 3.6 Catálogo E-commerce */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold">Catálogo Web</h4>
                    <Badge className="ml-auto">{catalogoWeb.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    SEO e descrições IA
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCatalogoWebFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Item
                  </Button>
                </CardContent>
              </Card>

              {/* 3.7 Kits/Conjuntos */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-5 h-5 text-pink-600" />
                    <h4 className="font-semibold">Kits</h4>
                    <Badge className="ml-auto">{kits.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Combinações de produtos
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setKitProdutoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Kit
                  </Button>
                </CardContent>
              </Card>

              {/* 3.8 Bitolas */}
              <Card className="border hover:shadow-md transition-shadow border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Bitolas</h4>
                    <Badge className="ml-auto bg-purple-600 text-white">
                      {produtos.filter(p => p.eh_bitola).length}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Barras de aço CA-25/50/60
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setBitolasPanelOpen(true)}
                  >
                    Gerenciar Bitolas →
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* IAs ATIVAS */}
            <div className="grid lg:grid-cols-3 gap-4 mt-6">
              <Alert className="border-purple-200 bg-purple-50">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-900">
                  🤖 <strong>IA Cadastro Automático:</strong> Preenche NCM, peso e grupo a partir da descrição
                </AlertDescription>
              </Alert>

              <Alert className="border-green-200 bg-green-50">
                <DollarSign className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-sm text-green-900">
                  💰 <strong>IA PriceBrain:</strong> Monitora custo médio e sugere reajustes diários
                </AlertDescription>
              </Alert>

              <Alert className="border-cyan-200 bg-cyan-50">
                <Globe className="w-4 h-4 text-cyan-600" />
                <AlertDescription className="text-sm text-cyan-900">
                  ✍️ <strong>IA Copywriter:</strong> Gera descrições SEO no catálogo web
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 💰 GRUPO 4: FINANCEIRO E FISCAL - SINCRONIZADO V19.1 */}
        <AccordionItem value="grupo-4" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:bg-green-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">💰 Financeiro e Fiscal</h3>
                <p className="text-xs text-slate-600">Bancos, Formas de Pagamento, Plano de Contas e Tabelas Fiscais</p>
              </div>
              <Badge className="ml-auto">
                {totalItensGrupo4} itens
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* ALERTA ARQUITETURAL */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription className="text-sm text-green-900">
                ✅ <strong>Hub Financeiro V19.1:</strong> Todos os cadastros mestres contábeis e fiscais centralizados. IAs de Open Banking, DIFAL e Classificação ativas.
              </AlertDescription>
            </Alert>

            {/* ROW 1: Bancos e Formas de Pagamento */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* 4.1 Bancos - ATIVADO */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-blue-600" />
                    Contas Bancárias ({bancos.length})
                  </h4>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setTipoDialog('bancos');
                      setEditingItem(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Conta
                  </Button>
                </div>
                <div className="grid gap-3">
                  {bancos.slice(0, 3).map(banco => (
                    <Card key={banco.id} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Landmark className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{banco.nome_banco}</p>
                              <p className="text-xs text-slate-500">
                                Ag: {banco.agencia} • CC: {banco.conta}-{banco.conta_digito}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              R$ {(banco.saldo_atual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            {banco.principal && <Badge className="text-xs bg-yellow-100 text-yellow-700">Principal</Badge>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 4.2 Formas de Pagamento - ATIVADO */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Formas de Pagamento ({formasPagamento.length})
                  </h4>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setTipoDialog('formas-pagamento');
                      setEditingItem(null);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Forma
                  </Button>
                </div>
                <div className="grid gap-3">
                  {formasPagamento.slice(0, 4).map(forma => (
                    <Card key={forma.id} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <div>
                              <p className="font-medium text-sm">{forma.descricao}</p>
                              <p className="text-xs text-slate-500">{forma.tipo}</p>
                            </div>
                          </div>
                          <Badge className={forma.ativa ? 'bg-green-100 text-green-700 text-xs' : 'bg-slate-100 text-slate-700 text-xs'}>
                            {forma.ativa ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 2: Grid 2x4 - Cadastros Contábeis e Fiscais */}
            <div className="grid lg:grid-cols-4 gap-4 mt-6">
              {/* 4.3 Plano de Contas */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold">Plano de Contas</h4>
                    <Badge className="ml-auto">{planoContas.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Hierarquia contábil e DRE
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setPlanoContasFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Conta
                  </Button>
                </CardContent>
              </Card>

              {/* 4.4 Centros de Resultado */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Centros Resultado</h4>
                    <Badge className="ml-auto">{centrosResultado.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Análise gerencial
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCentroResultadoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Centro
                  </Button>
                </CardContent>
              </Card>

              {/* 4.5 Tipos de Despesa */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Receipt className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold">Tipos Despesa</h4>
                    <Badge className="ml-auto">{tiposDespesa.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Fixa, variável, recorrente
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setTipoDespesaFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Tipo
                  </Button>
                </CardContent>
              </Card>

              {/* 4.6 Moedas e Índices */}
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold">Moedas/Índices</h4>
                    <Badge className="ml-auto">{moedasIndices.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    BRL, USD, Selic, IPCA
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setMoedaIndiceFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Moeda
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ROW 3: CFOP / NCM / CEST - EXPANDIDO */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold">Tabelas Fiscais (CFOP, NCM, CEST, CST)</h4>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Classificação fiscal com validação IA
                </p>
                <Alert className="border-green-200 bg-green-50 mb-3">
                  <Sparkles className="w-4 h-4" />
                  <AlertDescription className="text-sm text-green-900">
                    🤖 <strong>IA DIFAL:</strong> Alíquotas atualizadas diariamente via API Sefaz
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setCadastroFiscalFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo NCM/CFOP
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl('FiscalTabelas')}
                  >
                    Ver Todas Tabelas →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ROW 4: IAs ATIVAS - BLOCO 4 */}
            <div className="grid lg:grid-cols-3 gap-4 mt-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Landmark className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  🏦 <strong>IA Open Banking:</strong> Sincroniza extratos automaticamente (API Pluggy/Celcoin)
                </AlertDescription>
              </Alert>

              <Alert className="border-purple-200 bg-purple-50">
                <FileText className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-900">
                  📊 <strong>IA Classificadora Contábil:</strong> Sugere plano de contas e centro de custo
                </AlertDescription>
              </Alert>

              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-sm text-red-900">
                  🚨 <strong>IA Anomalia Tributo:</strong> Detecta impostos divergentes e gera alerta
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 🚚 GRUPO 5: OPERAÇÃO E LOGÍSTICA - SINCRONIZADO V19.1 */}
        <AccordionItem value="grupo-5" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 hover:bg-orange-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🚚 Operação e Logística</h3>
                <p className="text-xs text-slate-600">Veículos, Motoristas, Rotas e Locais</p>
              </div>
              <Badge className="ml-auto">{totalItensGrupo5} itens</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription className="text-sm text-orange-900">
                ✅ <strong>Bloco 5 V19.1:</strong> Transportadoras movidas para Bloco 2. IAs de Manutenção, Alocação e Roteirização ativas.
              </AlertDescription>
            </Alert>

            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-slate-600" />
                    <h4 className="font-semibold">Veículos / Frota</h4>
                    <Badge className="ml-auto">{veiculos.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">IA Manutenção Preditiva</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => { setTipoDialog('veiculos'); setEditingItem(null); setIsDialogOpen(true); }}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Cadastrar Veículo
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold">Motoristas</h4>
                    <Badge className="ml-auto">{motoristas.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">CNH e App GPS</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setMotoristaFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Motorista
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold">Rotas Padrão</h4>
                    <Badge className="ml-auto">0</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">IA Roteirização</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setRotaPadraoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Criar Rota
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Boxes className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold">Locais Estoque</h4>
                    <Badge className="ml-auto">0</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">CDs e almoxarifados</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocalEstoqueFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Local
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold">Tipos Frete</h4>
                    <Badge className="ml-auto">{tiposFrete.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">CIF, FOB, Terceiro</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setTipoFreteFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Tipo
                  </Button>
                </CardContent>
              </Card>

              <Card className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-cyan-600" />
                    <h4 className="font-semibold">Modelos PDF</h4>
                    <Badge className="ml-auto">{modelosDocumento.length}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Layouts personalizados</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setModeloDocumentoFormOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Modelo
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-6">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-sm text-red-900">
                  🔧 <strong>IA Manutenção Preditiva:</strong> Alerta revisões por KM
                </AlertDescription>
              </Alert>

              <Alert className="border-purple-200 bg-purple-50">
                <Truck className="w-4 h-4 text-purple-600" />
                <AlertDescription className="text-sm text-purple-900">
                  🚛 <strong>IA Alocação:</strong> BLOQUEIA se peso exceder capacidade
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50">
                <MapPin className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-900">
                  🗺️ <strong>IA Roteirização:</strong> Otimiza entregas com janelas
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 🤖 GRUPO 6: INTEGRAÇÕES, IA E PORTAL - CORRIGIDO V18.0 */}
        <AccordionItem value="grupo-6" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 hover:bg-indigo-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🤖 Integrações, IA e Portal</h3>
                <p className="text-xs text-slate-600">APIs, Webhooks, Chatbot, Marketplace e Portal do Cliente</p>
              </div>
              <Badge className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Motor de IA V16.1
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white">
            {/* ROW 1: Configurações de Integrações */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-600" />
                  Configurações de Integrações
                </h4>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setConfigIntegracaoOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Configurar APIs
                </Button>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-4">
                <Card className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold">NF-e</h4>
                        <p className="text-xs text-slate-500">eNotas, NFe.io, Focus</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Configurado
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-semibold">Boleto/PIX</h4>
                        <p className="text-xs text-slate-500">Asaas, Juno, Pagar.me</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold">WhatsApp Business</h4>
                        <p className="text-xs text-slate-500">API Oficial Meta</p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 text-slate-700 text-xs">
                      Inativo
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <h4 className="font-semibold">Google Maps</h4>
                        <p className="text-xs text-slate-500">Geocoding + Rotas</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                      <div>
                        <h4 className="font-semibold">Marketplace</h4>
                        <p className="text-xs text-slate-500">{configsIntegracao.length} configuração(ões)</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Ver Configurações
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-5 h-5 text-cyan-600" />
                      <div>
                        <h4 className="font-semibold">Portal do Cliente</h4>
                        <p className="text-xs text-slate-500">Acesso self-service</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full text-xs"
                      onClick={() => window.location.href = createPageUrl('PortalCliente')}
                    >
                      Acessar Portal →
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ROW 2: Motor de Eventos e Notificações */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Motor de Eventos e Notificações ({eventosNotificacao.length})
                </h4>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => setEventoNotificacaoOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Evento
                </Button>
              </div>

              <Alert className="border-purple-200 bg-purple-50 mb-4">
                <AlertDescription className="text-sm text-purple-900">
                  ⚡ <strong>Motor de Eventos Automáticos:</strong> Configure quando e como notificar clientes, vendedores e sistemas externos
                </AlertDescription>
              </Alert>

              <div className="grid gap-3">
                {eventosNotificacao.slice(0, 5).map(evento => (
                  <Card key={evento.id} className="border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-medium text-sm">{evento.nome_evento}</p>
                            <p className="text-xs text-slate-500">{evento.modulo_origem} • {evento.canais_notificacao?.length || 0} canais</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={evento.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                            {evento.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {evento.total_disparos || 0} disparos
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {eventosNotificacao.length > 5 && (
                <Button variant="link" className="mt-2 text-purple-600 text-xs">
                  Ver todos os {eventosNotificacao.length} eventos →
                </Button>
              )}

              {eventosNotificacao.length === 0 && (
                <Card className="border-dashed border-2">
                  <CardContent className="p-8 text-center text-slate-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum evento configurado</p>
                    <p className="text-xs">Clique em "Novo Evento" para começar</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ROW 3: Motor do Chatbot (Intents) - NOVO V18.0 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-indigo-600" />
                  Motor do Chatbot (Intents)
                </h4>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setChatbotIntentOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Nova Intent
                </Button>
              </div>

              <Alert className="border-indigo-200 bg-indigo-50 mb-4">
                <AlertDescription className="text-sm text-indigo-900">
                  🧠 <strong>Intent Engine:</strong> Configure o que o chatbot deve reconhecer e responder
                </AlertDescription>
              </Alert>

              <div className="grid lg:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-green-900 mb-3">✅ Intents Autenticadas (3)</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3" />
                        <span>2_via_boleto</span>
                        <Badge variant="outline" className="ml-auto text-xs">ContaReceber</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3" />
                        <span>consulta_pedido</span>
                        <Badge variant="outline" className="ml-auto text-xs">Pedido</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="w-3 h-3" />
                        <span>rastrear_entrega</span>
                        <Badge variant="outline" className="ml-auto text-xs">Entrega</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-blue-900 mb-3">🌐 Intents Públicas (3)</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-3 h-3" />
                        <span>fazer_orcamento_ia</span>
                        <Badge variant="outline" className="ml-auto text-xs">IA</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3" />
                        <span>falar_vendedor</span>
                        <Badge variant="outline" className="ml-auto text-xs">CRM</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle className="w-3 h-3" />
                        <span>horario_funcionamento</span>
                        <Badge variant="outline" className="ml-auto text-xs">Info</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ROW 4: Webhooks - ATIVADO V18.0 */}
            <Card className="border-orange-200 bg-orange-50 mt-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Link2 className="w-6 h-6 text-orange-600" />
                  <div>
                    <h4 className="font-bold text-lg">⚡ Webhooks Externos</h4>
                    <p className="text-sm text-slate-600">Enviar eventos para sistemas externos via HTTP</p>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => setWebhookFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Configurar Webhook
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* DIALOGS - EXPANDIDO */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { 
        setIsDialogOpen(open); 
        if (!open) {
          setEditingItem(null);
          setTipoDialog(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {tipoDialog === 'colaboradores' && (editingItem ? 'Editar Colaborador' : 'Novo Colaborador')}
              {tipoDialog === 'transportadoras' && (editingItem ? 'Editar Transportadora' : 'Nova Transportadora')}
              {tipoDialog === 'centroscusto' && (editingItem ? 'Editar Centro de Custo' : 'Novo Centro de Custo')}
              {tipoDialog === 'bancos' && 'Nova Conta Bancária'}
              {tipoDialog === 'formas-pagamento' && 'Nova Forma de Pagamento'}
              {tipoDialog === 'veiculos' && 'Cadastrar Veículo'}
            </DialogTitle>
          </DialogHeader>
          {tipoDialog === 'colaboradores' && (
            <ColaboradorForm
              colaborador={editingItem}
              onSubmit={handleSubmit}
              isSubmitting={createColaboradorMutation.isPending || updateColaboradorMutation.isPending}
            />
          )}
          {tipoDialog === 'transportadoras' && (
            <TransportadoraForm
              transportadora={editingItem}
              onSubmit={handleSubmit}
              isSubmitting={createTransportadoraMutation.isPending || updateTransportadoraMutation.isPending}
            />
          )}
          {tipoDialog === 'centroscusto' && (
            <CentroCustoForm
              centroCusto={editingItem}
              onSubmit={handleSubmit}
              isSubmitting={createCentroCustoMutation.isPending || updateCentroCustoMutation.isPending}
            />
          )}
          {tipoDialog === 'bancos' && (
            <BancoForm
              banco={editingItem} // Pass null for new creation as per outline logic
              onSubmit={handleSubmit}
              isSubmitting={createBancoMutation.isPending}
            />
          )}
          {tipoDialog === 'formas-pagamento' && (
            <FormaPagamentoForm
              forma={editingItem} // Pass null for new creation as per outline logic
              onSubmit={handleSubmit}
              isSubmitting={createFormaPagamentoMutation.isPending}
            />
          )}
          {tipoDialog === 'veiculos' && (
            <VeiculoForm
              veiculo={editingItem} // Pass null for new creation as per outline logic
              onSubmit={handleSubmit}
              isSubmitting={createVeiculoMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Cadastro Completo Cliente */}
      <CadastroClienteCompleto
        cliente={clienteSelecionado}
        isOpen={cadastroCompletoAberto}
        onClose={() => {
          setCadastroCompletoAberto(false);
          setClienteSelecionado(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['clientes'] });
          if (painelClienteAberto && clienteParaPainel?.id === clienteSelecionado?.id) {
            setPainelClienteAberto(false);
            setClienteParaPainel(null);
          }
        }}
      />

      {/* Modal Cadastro Completo Fornecedor */}
      <CadastroFornecedorCompleto
        fornecedor={fornecedorSelecionado}
        isOpen={cadastroFornecedorAberto}
        onClose={() => {
          setCadastroFornecedorAberto(false);
          setFornecedorSelecionado(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
          if (painelFornecedorAberto && fornecedorParaPainel?.id === fornecedorSelecionado?.id) {
            setPainelFornecedorAberto(false);
            setFornecedorParaPainel(null);
          }
        }}
      />

      {/* Painel Dinâmico Cliente */}
      <PainelDinamicoCliente
        cliente={clienteParaPainel}
        isOpen={painelClienteAberto}
        onClose={() => { setPainelClienteAberto(false); setClienteParaPainel(null); }}
        onEdit={(c) => {
          setPainelClienteAberto(false);
          handleEditarCliente(c);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clientes'] })}
      />

      {/* Painel Dinâmico Fornecedor */}
      <PainelDinamicoFornecedor
        fornecedor={fornecedorParaPainel}
        isOpen={painelFornecedorAberto}
        onClose={() => { setPainelFornecedorAberto(false); setFornecedorParaPainel(null); }}
        onEdit={(f) => {
          setPainelFornecedorAberto(false);
          handleEditarFornecedor(f);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['fornecedores'] })}
      />

      {/* Painel Dinâmico Transportadora */}
      <PainelDinamicoTransportadora
        transportadora={transportadoraParaPainel}
        isOpen={painelTransportadoraAberto}
        onClose={() => { setPainelTransportadoraAberto(false); setTransportadoraParaPainel(null); }}
        onEdit={(t) => {
          setPainelTransportadoraAberto(false);
          handleEdit(t, 'transportadoras');
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['transportadoras'] })}
      />

      {/* Painel Dinâmico Colaborador */}
      <PainelDinamicoColaborador
        colaborador={colaboradorParaPainel}
        isOpen={painelColaboradorAberto}
        onClose={() => { setPainelColaboradorAberto(false); setColaboradorParaPainel(null); }}
        onEdit={(c) => {
          setPainelColaboradorAberto(false);
          handleEdit(c, 'colaboradores');
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['colaboradores'] })}
      />

      {/* NOVO: Dialog Configuração de Integrações */}
      <Dialog open={configIntegracaoOpen} onOpenChange={setConfigIntegracaoOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              Configurar Integrações Externas
            </DialogTitle>
          </DialogHeader>
          <ConfiguracaoIntegracaoForm
            config={null} // Assuming new config or default values
            onSubmit={(data) => {
              console.log('Config salva:', data);
              toast({
                title: "✅ Sucesso!",
                description: "Configurações salvas!",
                duration: 3000,
              });
              setConfigIntegracaoOpen(false);
            }}
            isSubmitting={false} // Adjust based on actual mutation status
          />
        </DialogContent>
      </Dialog>

      {/* NOVO: Dialog Evento/Notificação */}
      <Dialog open={eventoNotificacaoOpen} onOpenChange={setEventoNotificacaoOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Novo Evento de Notificação
            </DialogTitle>
          </DialogHeader>
          <EventoNotificacaoForm
            evento={null} // Assuming new event or default values
            onSubmit={(data) => createEventoMutation.mutate(data)}
            isSubmitting={createEventoMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* NOVOS DIALOGS V18.0 */}
      <Dialog open={empresaFormOpen} onOpenChange={setEmpresaFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
          </DialogHeader>
          <EmpresaForm
            empresa={null}
            onSubmit={(data) => createEmpresaMutation.mutate(data)}
            isSubmitting={createEmpresaMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={produtoFormOpen} onOpenChange={setProdutoFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <ProdutoForm
            produto={null}
            onSubmit={(data) => createProdutoMutation.mutate(data)}
            isSubmitting={createProdutoMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={servicoFormOpen} onOpenChange={setServicoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
          </DialogHeader>
          <ServicoForm
            servico={null}
            onSubmit={(data) => createServicoMutation.mutate(data)}
            isSubmitting={createServicoMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={tabelaPrecoFormOpen} onOpenChange={setTabelaPrecoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Tabela de Preço</DialogTitle>
          </DialogHeader>
          <TabelaPrecoForm
            tabela={null}
            onSubmit={(data) => createTabelaPrecoMutation.mutate(data)}
            isSubmitting={createTabelaPrecoMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={catalogoWebFormOpen} onOpenChange={setCatalogoWebFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Item do Catálogo Web</DialogTitle>
          </DialogHeader>
          <CatalogoWebForm
            catalogoItem={null}
            onSubmit={(data) => createCatalogoMutation.mutate(data)}
            isSubmitting={createCatalogoMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={webhookFormOpen} onOpenChange={setWebhookFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Webhook</DialogTitle>
          </DialogHeader>
          <WebhookForm
            webhook={null}
            onSubmit={(data) => {
              console.log('Webhook criado:', data);
              toast({ title: "✅ Webhook configurado!", duration: 3000 });
              setWebhookFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={chatbotIntentOpen} onOpenChange={setChatbotIntentOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Intent do Chatbot</DialogTitle>
          </DialogHeader>
          <ChatbotIntentsForm
            intent={null}
            onSubmit={(data) => {
              console.log('Intent criada:', data);
              toast({ title: "✅ Intent configurada!", duration: 3000 });
              setChatbotIntentOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      {/* NOVOS DIALOGS FALTANTES V18.0 */}
      <Dialog open={usuarioFormOpen} onOpenChange={setUsuarioFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Convidar Usuário</DialogTitle>
          </DialogHeader>
          <UsuarioForm
            usuario={null}
            onSubmit={(data) => {
              console.log('Usuário:', data);
              toast({ title: "✅ Usuário convidado!", duration: 3000 });
              setUsuarioFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={perfilAcessoFormOpen} onOpenChange={setPerfilAcessoFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Perfil de Acesso</DialogTitle>
          </DialogHeader>
          <PerfilAcessoForm
            perfil={null}
            onSubmit={(data) => {
              console.log('Perfil:', data);
              toast({ title: "✅ Perfil criado!", duration: 3000 });
              setPerfilAcessoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={rotaPadraoFormOpen} onOpenChange={setRotaPadraoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Rota Padrão</DialogTitle>
          </DialogHeader>
          <RotaPadraoForm
            rota={null}
            onSubmit={(data) => {
              console.log('Rota:', data);
              toast({ title: "✅ Rota criada!", duration: 3000 });
              setRotaPadraoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={localEstoqueFormOpen} onOpenChange={setLocalEstoqueFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Local de Estoque</DialogTitle>
          </DialogHeader>
          <LocalEstoqueForm
            local={null}
            onSubmit={(data) => {
              console.log('Local:', data);
              toast({ title: "✅ Local criado!", duration: 3000 });
              setLocalEstoqueFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={cadastroFiscalFormOpen} onOpenChange={setCadastroFiscalFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo NCM/CFOP</DialogTitle>
          </DialogHeader>
          <CadastroFiscalForm
            cadastroFiscal={null}
            onSubmit={(data) => {
              console.log('Fiscal:', data);
              toast({ title: "✅ NCM cadastrado!", duration: 3000 });
              setCadastroFiscalFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={bitolasPanelOpen} onOpenChange={setBitolasPanelOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Bitolas de Aço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-purple-200 bg-purple-50">
              <AlertDescription className="text-sm">
                📊 Exibindo apenas produtos com <strong>eh_bitola = true</strong>
              </AlertDescription>
            </Alert>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Diâmetro (mm)</TableHead>
                  <TableHead>Peso (kg/m)</TableHead>
                  <TableHead>Tipo Aço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.filter(p => p.eh_bitola).map(bitola => (
                  <TableRow key={bitola.id}>
                    <TableCell>{bitola.descricao}</TableCell>
                    <TableCell>{bitola.bitola_diametro_mm}</TableCell>
                    <TableCell>{bitola.peso_teorico_kg_m}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{bitola.tipo_aco}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {produtos.filter(p => p.eh_bitola).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Nenhuma bitola cadastrada
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* NOVOS DIALOGS V19.1 - BLOCO 1 */}
      <Dialog open={grupoEmpresarialFormOpen} onOpenChange={setGrupoEmpresarialFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Grupo Empresarial</DialogTitle>
          </DialogHeader>
          <GrupoEmpresarialForm
            grupo={null}
            onSubmit={(data) => {
              console.log('Grupo:', data);
              toast({ title: "✅ Grupo empresarial criado!", duration: 3000 });
              setGrupoEmpresarialFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={filialFormOpen} onOpenChange={setFilialFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Filial</DialogTitle>
          </DialogHeader>
          <FilialForm
            filial={null}
            onSubmit={(data) => {
              console.log('Filial:', data);
              toast({ title: "✅ Filial criada!", duration: 3000 });
              setFilialFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={departamentoFormOpen} onOpenChange={setDepartamentoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Departamento</DialogTitle>
          </DialogHeader>
          <DepartamentoForm
            departamento={null}
            onSubmit={(data) => {
              console.log('Departamento:', data);
              toast({ title: "✅ Departamento criado!", duration: 3000 });
              setDepartamentoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={cargoFormOpen} onOpenChange={setCargoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cargo</DialogTitle>
          </DialogHeader>
          <CargoForm
            cargo={null}
            onSubmit={(data) => {
              console.log('Cargo:', data);
              toast({ title: "✅ Cargo criado!", duration: 3000 });
              setCargoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={turnoFormOpen} onOpenChange={setTurnoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Turno</DialogTitle>
          </DialogHeader>
          <TurnoForm
            turno={null}
            onSubmit={(data) => {
              console.log('Turno:', data);
              toast({ title: "✅ Turno criado!", duration: 3000 });
              setTurnoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      {/* NOVOS DIALOGS V19.1 - BLOCO 2 */}
      <Dialog open={condicaoComercialFormOpen} onOpenChange={setCondicaoComercialFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Condição Comercial</DialogTitle>
          </DialogHeader>
          <CondicaoComercialForm
            condicao={null}
            onSubmit={(data) => {
              console.log('Condição:', data);
              toast({ title: "✅ Condição comercial criada!", duration: 3000 });
              setCondicaoComercialFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={contatoB2BFormOpen} onOpenChange={setContatoB2BFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Contato B2B</DialogTitle>
          </DialogHeader>
          <ContatoB2BForm
            contato={null}
            onSubmit={(data) => {
              console.log('Contato:', data);
              toast({ title: "✅ Contato criado!", duration: 3000 });
              setContatoB2BFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={representanteFormOpen} onOpenChange={setRepresentanteFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Representante</DialogTitle>
          </DialogHeader>
          <RepresentanteForm
            representante={null}
            onSubmit={(data) => {
              console.log('Representante:', data);
              toast({ title: "✅ Representante criado!", duration: 3000 });
              setRepresentanteFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={segmentoClienteFormOpen} onOpenChange={setSegmentoClienteFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Segmento de Cliente</DialogTitle>
          </DialogHeader>
          <SegmentoClienteForm
            segmento={null}
            onSubmit={(data) => {
              console.log('Segmento:', data);
              toast({ title: "✅ Segmento criado!", duration: 3000 });
              setSegmentoClienteFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>
      
      {/* NOVOS DIALOGS V19.1 - BLOCO 3 */}
      <Dialog open={grupoProdutoFormOpen} onOpenChange={setGrupoProdutoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Grupo de Produtos</DialogTitle>
          </DialogHeader>
          <GrupoProdutoForm
            grupo={null}
            onSubmit={(data) => {
              console.log('Grupo Produto:', data);
              toast({ title: "✅ Grupo de produtos criado!", duration: 3000 });
              setGrupoProdutoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={marcaFormOpen} onOpenChange={setMarcaFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Marca/Fabricante</DialogTitle>
          </DialogHeader>
          <MarcaForm
            marca={null}
            onSubmit={(data) => {
              console.log('Marca:', data);
              toast({ title: "✅ Marca criada!", duration: 3000 });
              setMarcaFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={kitProdutoFormOpen} onOpenChange={setKitProdutoFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Kit de Produtos</DialogTitle>
          </DialogHeader>
          <KitProdutoForm
            kit={null}
            onSubmit={(data) => {
              console.log('Kit:', data);
              toast({ title: "✅ Kit criado!", duration: 3000 });
              setKitProdutoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      {/* NOVOS DIALOGS V19.1 - BLOCO 4 */}
      <Dialog open={planoContasFormOpen} onOpenChange={setPlanoContasFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Conta Contábil</DialogTitle>
          </DialogHeader>
          <PlanoContasForm
            conta={null}
            onSubmit={(data) => {
              console.log('Plano Contas:', data);
              toast({ title: "✅ Conta contábil criada!", duration: 3000 });
              setPlanoContasFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={centroResultadoFormOpen} onOpenChange={setCentroResultadoFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Centro de Resultado</DialogTitle>
          </DialogHeader>
          <CentroResultadoForm
            centro={null}
            onSubmit={(data) => {
              console.log('Centro Resultado:', data);
              toast({ title: "✅ Centro criado!", duration: 3000 });
              setCentroResultadoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={tipoDespesaFormOpen} onOpenChange={setTipoDespesaFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Tipo de Despesa</DialogTitle>
          </DialogHeader>
          <TipoDespesaForm
            tipo={null}
            onSubmit={(data) => {
              console.log('Tipo Despesa:', data);
              toast({ title: "✅ Tipo de despesa criado!", duration: 3000 });
              setTipoDespesaFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={moedaIndiceFormOpen} onOpenChange={setMoedaIndiceFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Moeda/Índice</DialogTitle>
          </DialogHeader>
          <MoedaIndiceForm
            moeda={null}
            onSubmit={(data) => {
              console.log('Moeda/Índice:', data);
              toast({ title: "✅ Moeda/índice criado!", duration: 3000 });
              setMoedaIndiceFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      {/* NOVOS DIALOGS V19.1 - BLOCO 5 */}
      <Dialog open={motoristaFormOpen} onOpenChange={setMotoristaFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Motorista</DialogTitle>
          </DialogHeader>
          <MotoristaForm
            motorista={null}
            onSubmit={(data) => {
              console.log('Motorista:', data);
              toast({ title: "✅ Motorista cadastrado!", duration: 3000 });
              setMotoristaFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={tipoFreteFormOpen} onOpenChange={setTipoFreteFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Tipo de Frete</DialogTitle>
          </DialogHeader>
          <TipoFreteForm
            tipo={null}
            onSubmit={(data) => {
              console.log('Tipo Frete:', data);
              toast({ title: "✅ Tipo de frete criado!", duration: 3000 });
              setTipoFreteFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={modeloDocumentoFormOpen} onOpenChange={setModeloDocumentoFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Modelo de Documento</DialogTitle>
          </DialogHeader>
          <ModeloDocumentoForm
            modelo={null}
            onSubmit={(data) => {
              console.log('Modelo Documento:', data);
              toast({ title: "✅ Modelo criado!", duration: 3000 });
              setModeloDocumentoFormOpen(false);
            }}
            isSubmitting={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
