
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
  Lock,
  Shield,
  Briefcase,
  UserCircle,
  Clock,
  UserCheck,
  Award,
  Target,
  Receipt,
  TrendingUp,
  Eye,
  Maximize2, // Added for new banner and product section
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import ColaboradorForm from "../components/rh/ColaboradorForm";
import TransportadoraForm from "../components/cadastros/TransportadoraForm";
import CentroCustoForm from "../components/cadastros/CentroCustoForm";
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
import EmpresaForm from "../components/cadastros/EmpresaForm";
import ServicoForm from "../components/cadastros/ServicoForm";
import WebhookForm from "../components/cadastros/WebhookForm";
import ChatbotIntentsForm from "../components/cadastros/ChatbotIntentsForm";
import UsuarioForm from "../components/cadastros/UsuarioForm";
import PerfilAcessoForm from "../components/cadastros/PerfilAcessoForm";
import RotaPadraoForm from "../components/cadastros/RotaPadraoForm";
import LocalEstoqueForm from "../components/cadastros/LocalEstoqueForm";
import CadastroFiscalForm from "../components/cadastros/CadastroFiscalForm";
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
import BotaoNovaJanela from "@/components/cadastros/BotaoNovaJanela";
import { useWindow } from "@/components/lib/useWindow";

/**
 * CADASTROS GERAIS V20.1 - HUB CENTRAL COM AUDITORIA COMPLETA
 * Blocos 1/6, 2/6, 3/6, 4/6 e 5/6 totalmente sincronizados
 */
export default function Cadastros() {
  const [buscaGlobal, setBuscaGlobal] = useState(""); // Renamed from searchTerm
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tipoDialog, setTipoDialog] = useState(null);
  
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
  // States removed: produtoFormOpen, servicoFormOpen, tabelaPrecoFormOpen, tabelaSelecionadaEditar, multiTabelasOpen, tabelasSelecionadasMulti, catalogoWebFormOpen, empresaFormOpen
  // as they are handled by universal dialog or new window system.

  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false); // Unused in final, removed from outline
  const [perfilAcessoFormOpen, setPerfilAcessoFormOpen] = useState(false); // Unused in final, removed from outline
  const [rotaPadraoFormOpen, setRotaPadraoFormOpen] = useState(false);
  const [localEstoqueFormOpen, setLocalEstoqueFormOpen] = useState(false);
  const [cadastroFiscalFormOpen, setCadastroFiscalFormOpen] = useState(false);
  const [bitolasPanelOpen, setBitolasPanelOpen] = useState(false);

  const [grupoEmpresarialFormOpen, setGrupoEmpresarialFormOpen] = useState(false); // Unused in final, removed from outline
  const [filialFormOpen, setFilialFormOpen] = useState(false);
  const [departamentoFormOpen, setDepartamentoFormOpen] = useState(false); // Unused in final, removed from outline
  const [cargoFormOpen, setCargoFormOpen] = useState(false); // Unused in final, removed from outline
  const [turnoFormOpen, setTurnoFormOpen] = useState(false); // Unused in final, removed from outline

  // NEW: Estados para Bloco 2
  const [condicaoComercialFormOpen, setCondicaoComercialFormOpen] = useState(false); // Unused in final, removed from outline
  const [contatoB2BFormOpen, setContatoB2BFormOpen] = useState(false); // Unused in final, removed from outline
  const [representanteFormOpen, setRepresentanteFormOpen] = useState(false); // Unused in final, removed from outline
  const [segmentoClienteFormOpen, setSegmentoClienteFormOpen] = useState(false); // Unused in final, removed from outline

  const [grupoProdutoFormOpen, setGrupoProdutoFormOpen] = useState(false); // Unused in final, removed from outline
  const [marcaFormOpen, setMarcaFormOpen] = useState(false); // Unused in final, removed from outline
  const [kitProdutoFormOpen, setKitProdutoFormOpen] = useState(false); // Unused in final, removed from outline

  const [planoContasFormOpen, setPlanoContasFormOpen] = useState(false); // Unused in final, removed from outline
  const [centroResultadoFormOpen, setCentroResultadoFormOpen] = useState(false); // Unused in final, removed from outline
  const [tipoDespesaFormOpen, setTipoDespesaFormOpen] = useState(false); // Unused in final, removed from outline
  const [moedaIndiceFormOpen, setMoedaIndiceFormOpen] = useState(false); // Unused in final, removed from outline

  const [motoristaFormOpen, setMotoristaFormOpen] = useState(false); // Unused in final, removed from outline
  const [tipoFreteFormOpen, setTipoFreteFormOpen] = useState(false); // Unused in final, removed from outline
  const [modeloDocumentoFormOpen, setModeloDocumentoFormOpen] = useState(false); // Unused in final, removed from outline


  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { openProductWindow, openClienteWindow, openFornecedorWindow, openTabelaPrecoWindow } = useWindow(); // Added useWindow hook

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

  // Removed tabelasPrecoItens query

  // Removed catalogoWeb query

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: perfisAcesso = [] } = useQuery({
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

  // MUTATIONS UNIVERSAIS - TODAS AS ENTIDADES
  const createMutation = useMutation({
    mutationFn: async ({ entity, data }) => {
      return await base44.entities[entity].create(data);
    },
    onSuccess: (_, variables) => {
      const queryMap = {
        'Colaborador': 'colaboradores',
        'Transportadora': 'transportadoras',
        'CentroCusto': 'centrosCusto',
        'Banco': 'bancos',
        'FormaPagamento': 'formas-pagamento',
        'Veiculo': 'veiculos',
        'EventoNotificacao': 'eventos-notificacao',
        // Removed Produto, TabelaPreco, CatalogoWeb
        'Servico': 'servicos',
        'Empresa': 'empresas',
        'GrupoEmpresarial': 'grupos',
        'Departamento': 'departamentos',
        'Cargo': 'cargos',
        'Turno': 'turnos',
        'User': 'usuarios',
        'PerfilAcesso': 'perfis-acesso',
        'RotaPadrao': 'rotas-padrao',
        'LocalEstoque': 'locais-estoque',
        'CadastroFiscal': 'cadastros-fiscais',
        'CondicaoComercial': 'condicoes-comerciais',
        'ContatoB2B': 'contatos-b2b',
        'Representante': 'representantes',
        'SegmentoCliente': 'segmentos-cliente',
        'GrupoProduto': 'grupos-produto',
        'Marca': 'marcas',
        'KitProduto': 'kits-produto',
        'PlanoDeContas': 'plano-contas',
        'CentroResultado': 'centros-resultado',
        'TipoDespesa': 'tipos-despesa',
        'MoedaIndice': 'moedas-indices',
        'Motorista': 'motoristas',
        'TipoFrete': 'tipos-frete',
        'ModeloDocumento': 'modelos-documento'
      };
      // Use variables.entity directly if it's the exact key, otherwise map
      const invalidateKey = queryMap[variables.entity] || variables.entity.toLowerCase() + 's';
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
      // Removed specific invalidate for TabelaPreco
      handleCloseDialog();
      // Specific toasts can be handled in individual dialog onSubmits if needed,
      // but this provides a generic success for all.
      toast({ title: `✅ ${variables.entity} criado com sucesso!` });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ entity, id, data }) => {
      return await base44.entities[entity].update(id, data);
    },
    onSuccess: (_, variables) => {
      const queryMap = {
        'Colaborador': 'colaboradores',
        'Transportadora': 'transportadoras',
        'CentroCusto': 'centrosCusto',
        'Banco': 'bancos',
        'FormaPagamento': 'formas-pagamento',
        'Veiculo': 'veiculos',
        'EventoNotificacao': 'eventos-notificacao',
        // Removed Produto, TabelaPreco, CatalogoWeb
        'Servico': 'servicos',
        'Empresa': 'empresas',
        'GrupoEmpresarial': 'grupos',
        'Departamento': 'departamentos',
        'Cargo': 'cargos',
        'Turno': 'turnos',
        'User': 'usuarios',
        'PerfilAcesso': 'perfis-acesso',
        'RotaPadrao': 'rotas-padrao',
        'LocalEstoque': 'locais-estoque',
        'CadastroFiscal': 'cadastros-fiscais',
        'CondicaoComercial': 'condicoes-comerciais',
        'ContatoB2B': 'contatos-b2b',
        'Representante': 'representantes',
        'SegmentoCliente': 'segmentos-cliente',
        'GrupoProduto': 'grupos-produto',
        'Marca': 'marcas',
        'KitProduto': 'kits-produto',
        'PlanoDeContas': 'plano-contas',
        'CentroResultado': 'centros-resultado',
        'TipoDespesa': 'tipos-despesa',
        'MoedaIndice': 'moedas-indices',
        'Motorista': 'motoristas',
        'TipoFrete': 'tipos-frete',
        'ModeloDocumento': 'modelos-documento'
      };
      const invalidateKey = queryMap[variables.entity] || variables.entity.toLowerCase() + 's';
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
      // Removed specific invalidate for TabelaPreco
      handleCloseDialog();
      toast({ title: `✅ ${variables.entity} atualizado com sucesso!` });
    }
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setTipoDialog(null);
  };

  const handleEdit = (item, tipo, entityName) => {
    setEditingItem({ ...item, _entityName: entityName });
    setTipoDialog(tipo);
    setIsDialogOpen(true);
  };

  const handleOpenNew = (tipo, entityName) => {
    setEditingItem({ _entityName: entityName, _isNew: true });
    setTipoDialog(tipo);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data) => {
    // Se o salvamento já foi feito internamente pelo formulário (ex: TabelaPreco com itens)
    if (data?._salvamentoCompleto) {
      setIsDialogOpen(false);
      setEditingItem(null);
      setTipoDialog(null);
      return;
    }

    const entityName = editingItem?._entityName;

    if (!entityName) {
      console.error("Unknown entity for submission with tipoDialog:", tipoDialog, "and editingItem:", editingItem);
      toast({ title: "❌ Erro ao salvar", description: "Tipo de entidade desconhecido.", variant: "destructive" });
      return;
    }
    
    if (editingItem?.id) {
      updateMutation.mutate({ entity: entityName, id: editingItem.id, data });
    } else {
      createMutation.mutate({ entity: entityName, data });
    }
  };

  // Removed handleEditarCliente, handleNovoCliente, handleEditarFornecedor, handleNovoFornecedor

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700 border-green-300',
    'Inativo': 'bg-gray-100 text-gray-700 border-gray-300',
    'Prospect': 'bg-blue-100 text-blue-700 border-blue-300',
    'Bloqueado': 'bg-red-100 text-red-700 border-red-300',
    'Ativa': 'bg-green-100 text-green-700 border-green-300'
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

  const totalItensGrupo1 = empresas.length + grupos.length + usuarios.length + perfisAcesso.length + departamentos.length + cargos.length + turnos.length + centrosCusto.length;
  const totalItensGrupo2 = clientes.length + fornecedores.length + colaboradores.length + transportadoras.length + contatosB2B.length + representantes.length + condicoesComerciais.length + segmentosCliente.length;
  const totalItensGrupo3 = produtos.length + servicos.length + tabelasPreco.length + gruposProduto.length + marcas.length + kits.length; // Removed catalogoWeb.length
  const totalItensGrupo4 = bancos.length + formasPagamento.length + planoContas.length + centrosResultado.length + tiposDespesa.length + moedasIndices.length;
  const totalItensGrupo5 = veiculos.length + motoristas.length + tiposFrete.length + modelosDocumento.length;

  // Global search filtering (only implemented for products as explicitly shown in outline)
  const produtosFiltrados = produtos.filter(p =>
    p.codigo?.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(buscaGlobal.toLowerCase()) ||
    p.grupo?.toLowerCase().includes(buscaGlobal.toLowerCase())
  );


  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* V21.0: Banner Multitarefa */}
      <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <Maximize2 className="w-5 h-5 text-purple-600" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-purple-900">🚀 V21.0 - Sistema Multitarefa Ativado!</p>
              <p className="text-sm text-purple-700 mt-1">
                Clique em qualquer cadastro para abrir em janela independente. Use <kbd className="px-2 py-1 bg-white rounded border">Ctrl+K</kbd> para comandos rápidos.
              </p>
            </div>
            <div className="flex gap-2">
              <BotaoNovaJanela tipo="produto" label="Produto" variant="outline" size="sm" />
              <BotaoNovaJanela tipo="cliente" label="Cliente" variant="outline" size="sm" />
              <BotaoNovaJanela tipo="tabela-preco" label="Tabela" variant="outline" size="sm" />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Hub de Cadastros Gerais</h1>
          <p className="text-slate-600">Central de dados mestres do sistema - V21.0</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar em todos os cadastros..."
            value={buscaGlobal}
            onChange={(e) => setBuscaGlobal(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" onClick={() => setBuscaGlobal('')}>
            Limpar
          </Button>
        </div>
      </div>

      {/* ACCORDION COM 6 GRUPOS */}
      <Accordion type="multiple" defaultValue={["grupo-1", "produtos"]} className="space-y-4">
        
        {/* 🏢 GRUPO 1: EMPRESA E ESTRUTURA - SINCRONIZADO V20.1 */}
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
            {/* 1.1 Empresas - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Empresas ({empresas.length})
                </h4>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenNew('empresas', 'Empresa')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Empresa
                </Button>
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Regime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.map((empresa) => (
                      <TableRow key={empresa.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{empresa.razao_social}</TableCell>
                        <TableCell className="text-sm">{empresa.cnpj}</TableCell>
                        <TableCell className="text-sm">{empresa.regime_tributario}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[empresa.status]}>{empresa.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(empresa, 'empresas', 'Empresa')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 1.2 Grupos Empresariais - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-600" />
                  Grupos Empresariais ({grupos.length})
                </h4>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleOpenNew('grupos', 'GrupoEmpresarial')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
              
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Nome do Grupo</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Empresas</TableHead>
                      <TableHead>Score IA</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grupos.map((grupo) => (
                      <TableRow key={grupo.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{grupo.nome_do_grupo}</TableCell>
                        <TableCell className="text-sm">{grupo.cnpj_opcional || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{(grupo.empresas_ids || []).length} empresas</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700">{grupo.score_integracao_erp || 0}%</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(grupo, 'grupos', 'GrupoEmpresarial')}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {grupos.length === 0 && (
                <Card className="border-dashed border-2 mt-4">
                  <CardContent className="p-6 text-center text-slate-500">
                    <Network className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum grupo empresarial cadastrado</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 1.3 Grid de Gestão Organizacional - TABELAS COMPLETAS */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Usuários */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Usuários ({usuarios.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('usuarios', 'User')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Convidar Usuário
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((u) => (
                        <TableRow key={u.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{u.full_name}</TableCell>
                          <TableCell className="text-xs">{u.email}</TableCell>
                          <TableCell>
                            <Badge className="text-xs">{u.role === 'admin' ? 'Admin' : 'Usuário'}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(u, 'usuarios', 'User')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Perfis de Acesso */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    Perfis de Acesso ({perfisAcesso.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('perfis', 'PerfilAcesso')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Perfil
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perfisAcesso.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{p.nome}</TableCell>
                          <TableCell className="text-xs">{p.nivel_acesso}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(p, 'perfis', 'PerfilAcesso')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Departamentos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Departamentos ({departamentos.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('departamentos', 'Departamento')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Departamento
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departamentos.map((d) => (
                        <TableRow key={d.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{d.nome}</TableCell>
                          <TableCell className="text-xs">{d.codigo}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(d, 'departamentos', 'Departamento')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Cargos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-pink-600" />
                    Cargos ({cargos.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('cargos', 'Cargo')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Cargo
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cargos.map((c) => (
                        <TableRow key={c.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{c.nome_cargo}</TableCell>
                          <TableCell className="text-xs">{c.nivel_hierarquico}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(c, 'cargos', 'Cargo')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Turnos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    Turnos ({turnos.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('turnos', 'Turno')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Turno
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Turno</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {turnos.map((t) => (
                        <TableRow key={t.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{t.nome_turno}</TableCell>
                          <TableCell className="text-xs">{t.horario_inicio} - {t.horario_fim}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(t, 'turnos', 'Turno')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Centros de Custo */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    Centros de Custo ({centrosCusto.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('centroscusto', 'CentroCusto')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Centro de Custo
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {centrosCusto.map((cc) => (
                        <TableRow key={cc.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{cc.codigo}</TableCell>
                          <TableCell className="text-sm">{cc.descricao}</TableCell>
                          <TableCell className="text-xs">{cc.tipo}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(cc, 'centroscusto', 'CentroCusto')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 👥 GRUPO 2: PESSOAS E PARCEIROS - SINCRONIZADO V20.1 */}
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
            {/* Clientes - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Clientes ({clientes.length})
                </h4>
                <Button onClick={() => openClienteWindow(null)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{cliente.nome}</TableCell>
                        <TableCell className="text-xs">{cliente.cpf || cliente.cnpj || '-'}</TableCell>
                        <TableCell className="text-xs">{cliente.endereco_principal?.cidade || '-'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[cliente.status]}>{cliente.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setClienteParaPainel(cliente); setPainelClienteAberto(true); }}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openClienteWindow(cliente)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Fornecedores - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                  Fornecedores ({fornecedores.length})
                </h4>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => openFornecedorWindow(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fornecedor
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fornecedores.map((f) => (
                      <TableRow key={f.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{f.nome}</TableCell>
                        <TableCell className="text-xs">{f.cnpj || '-'}</TableCell>
                        <TableCell className="text-xs">{f.categoria}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setFornecedorParaPainel(f); setPainelFornecedorAberto(true); }}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openFornecedorWindow(f)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Colaboradores - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-pink-600" />
                  Colaboradores ({colaboradores.length})
                </h4>
                <Button 
                  size="sm" 
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => handleOpenNew('colaboradores', 'Colaborador')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Colaborador
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colaboradores.map((c) => (
                      <TableRow key={c.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{c.nome_completo}</TableCell>
                        <TableCell className="text-xs">{c.cargo}</TableCell>
                        <TableCell className="text-xs">{c.departamento}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setColaboradorParaPainel(c); setPainelColaboradorAberto(true); }}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(c, 'colaboradores', 'Colaborador')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Transportadoras - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  Transportadoras ({transportadoras.length})
                </h4>
                <Button 
                  size="sm" 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleOpenNew('transportadoras', 'Transportadora')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transportadora
                </Button>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportadoras.map((t) => (
                      <TableRow key={t.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{t.razao_social}</TableCell>
                        <TableCell className="text-xs">{t.cnpj}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setTransportadoraParaPainel(t); setPainelTransportadoraAberto(true); }}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(t, 'transportadoras', 'Transportadora')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Outros cadastros do Grupo 2 - TABELAS COMPLETAS */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Contatos B2B */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    Contatos B2B ({contatosB2B.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('contatos', 'ContatoB2B')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Contato
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contatosB2B.map((c) => (
                        <TableRow key={c.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{c.nome_contato}</TableCell>
                          <TableCell className="text-xs">{c.email}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(c, 'contatos', 'ContatoB2B')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Representantes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    Representantes ({representantes.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('representantes', 'Representante')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Representante
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {representantes.map((r) => (
                        <TableRow key={r.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{r.nome}</TableCell>
                          <TableCell className="text-xs">{r.comissao_percentual}%</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(r, 'representantes', 'Representante')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Condições Comerciais */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Condições Comerciais ({condicoesComerciais.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('condicoes', 'CondicaoComercial')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Condição
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Condição</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {condicoesComerciais.map((cc) => (
                        <TableRow key={cc.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{cc.nome_condicao}</TableCell>
                          <TableCell className="text-xs">{cc.prazo_pagamento_dias} dias</TableCell>
                          <TableCell className="text-xs">{cc.percentual_desconto}%</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(cc, 'condicoes', 'CondicaoComercial')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Segmentos de Cliente */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-600" />
                    Segmentos de Cliente ({segmentosCliente.length})
                  </h4>
                  <Button size="sm" variant="outline" onClick={() => handleOpenNew('segmentos', 'SegmentoCliente')}>
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Segmento
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Segmento</TableHead>
                        <TableHead>Clientes</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {segmentosCliente.map((s) => (
                        <TableRow key={s.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{s.nome_segmento}</TableCell>
                          <TableCell className="text-xs">{s.quantidade_clientes || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(s, 'segmentos', 'SegmentoCliente')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Alertas IA - KYC/KYB e Churn */}
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

        {/* 🧱 GRUPO 3: PRODUTOS E SERVIÇOS - V21.1.2-R2 APRIMORADO (REPLACED WITH OUTLINE CONTENT) */}
        <AccordionItem value="produtos" className="border-0 shadow-md rounded-lg overflow-hidden">
          <AccordionTrigger className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:bg-purple-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">🧱 Produtos e Serviços V21.0</h3>
                <p className="text-xs text-slate-600">Cadastro Master com Multitarefa</p>
              </div>
              <Badge className="ml-auto">
                {totalItensGrupo3} itens
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 py-4 bg-white space-y-6">
            {/* Botões V21.0 */}
            <div className="flex gap-2 flex-wrap">
              <BotaoNovaJanela tipo="produto" label="➕ Novo Produto" />
              <BotaoNovaJanela tipo="tabela-preco" label="💰 Nova Tabela" />
              <Button variant="outline" size="sm">
                📥 Importar Produtos
              </Button>
            </div>

            {/* Tabela de produtos */}
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-base">📦 Produtos Cadastrados ({produtosFiltrados.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Ações V21.0</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtosFiltrados.slice(0, 10).map(produto => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-mono text-xs">{produto.codigo}</TableCell>
                        <TableCell className="font-semibold">{produto.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{produto.grupo}</Badge>
                        </TableCell>
                        <TableCell>{produto.estoque_atual || 0}</TableCell>
                        <TableCell>R$ {(produto.preco_venda || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openProductWindow(produto)}
                          >
                            <Maximize2 className="w-3 h-3 mr-1" />
                            Abrir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Tabelas de Preço */}
            <Card>
              <CardHeader className="bg-yellow-50 border-b">
                <CardTitle className="text-base">💰 Tabelas de Preço ({tabelasPreco.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {tabelasPreco.slice(0, 5).map(tabela => (
                    <div key={tabela.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-semibold">{tabela.nome}</p>
                        <p className="text-xs text-slate-600">{tabela.tipo} • {tabela.ativo ? '✅ Ativa' : '⏸️ Inativa'}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openTabelaPrecoWindow(tabela)}
                      >
                        <Maximize2 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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

        {/* 💰 GRUPO 4: FINANCEIRO E FISCAL - SINCRONIZADO V20.1 */}
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
                ✅ <strong>Hub Financeiro V20.0:</strong> Todos os cadastros mestres contábeis e fiscais centralizados. IAs de Open Banking, DIFAL e Classificação ativas.
              </AlertDescription>
            </Alert>

            {/* ROW 1: Bancos e Formas de Pagamento - TABELAS COMPLETAS */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bancos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-blue-600" />
                    Contas Bancárias ({bancos.length})
                  </h4>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleOpenNew('bancos', 'Banco')}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Conta
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Banco</TableHead>
                        <TableHead>Agência/Conta</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bancos.map((b) => (
                        <TableRow key={b.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{b.nome_banco}</TableCell>
                          <TableCell className="text-xs">{b.agencia} / {b.conta}-{b.conta_digito}</TableCell>
                          <TableCell className="text-sm font-bold text-green-600">
                            R$ {(b.saldo_atual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(b, 'bancos', 'Banco')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Formas Pagamento */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Formas Pagamento ({formasPagamento.length})
                  </h4>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleOpenNew('formas-pagamento', 'FormaPagamento')}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Forma
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formasPagamento.map((f) => (
                        <TableRow key={f.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{f.descricao}</TableCell>
                          <TableCell className="text-xs">{f.tipo}</TableCell>
                          <TableCell>
                            <Badge className={f.ativa ? 'bg-green-100 text-green-700 text-xs' : 'bg-slate-100 text-slate-700 text-xs'}>
                              {f.ativa ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(f, 'formas-pagamento', 'FormaPagamento')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* ROW 2: Cadastros Contábeis e Fiscais - TABELAS COMPLETAS */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Plano de Contas */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Plano de Contas ({planoContas.length})
                  </h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpenNew('plano-contas', 'PlanoDeContas')}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Conta
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planoContas.map((pc) => (
                        <TableRow key={pc.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-xs">{pc.codigo_conta}</TableCell>
                          <TableCell className="text-sm">{pc.descricao_conta}</TableCell>
                          <TableCell className="text-xs">{pc.tipo}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(pc, 'plano-contas', 'PlanoDeContas')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Centros de Resultado */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Centros Resultado ({centrosResultado.length})
                  </h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpenNew('centros-resultado', 'CentroResultado')}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Centro
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {centrosResultado.map((cr) => (
                        <TableRow key={cr.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-xs">{cr.codigo}</TableCell>
                          <TableCell className="text-sm">{cr.descricao}</TableCell>
                          <TableCell className="text-xs">{cr.tipo}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(cr, 'centros-resultado', 'CentroResultado')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Tipos de Despesa */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-red-600" />
                    Tipos Despesa ({tiposDespesa.length})
                  </h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpenNew('tipos-despesa', 'TipoDespesa')}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Novo Tipo
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tiposDespesa.map((td) => (
                        <TableRow key={td.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{td.nome}</TableCell>
                          <TableCell className="text-xs">{td.categoria}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(td, 'tipos-despesa', 'TipoDespesa')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Moedas e Índices */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-600" />
                    Moedas/Índices ({moedasIndices.length})
                  </h4>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpenNew('moedas', 'MoedaIndice')}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Nova Moeda
                  </Button>
                </div>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {moedasIndices.map((mi) => (
                        <TableRow key={mi.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-xs">{mi.codigo}</TableCell>
                          <TableCell className="text-sm">{mi.nome}</TableCell>
                          <TableCell className="text-sm font-semibold">
                            {mi.simbolo} {(mi.valor_atual || 0).toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(mi, 'moedas', 'MoedaIndice')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
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

        {/* 🚚 GRUPO 5: OPERAÇÃO E LOGÍSTICA - SINCRONIZADO V20.1 */}
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
                ✅ <strong>Bloco 5 V20.0:</strong> Transportadoras movidas para Bloco 2. IAs de Manutenção, Alocação e Roteirização ativas.
              </AlertDescription>
            </Alert>

            {/* Veículos - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-600" />
                  Veículos / Frota ({veiculos.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => handleOpenNew('veiculos', 'Veiculo')}>
                  <Plus className="w-3 h-3 mr-2" />
                  Cadastrar Veículo
                </Button>
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {veiculos.map((v) => (
                      <TableRow key={v.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-sm">{v.placa}</TableCell>
                        <TableCell className="text-xs">{v.modelo}</TableCell>
                        <TableCell className="text-xs">{v.capacidade_kg} kg</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(v, 'veiculos', 'Veiculo')}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Motoristas - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Motoristas ({motoristas.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => handleOpenNew('motoristas', 'Motorista')}>
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Motorista
                </Button>
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50">
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNH</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {motoristas.map((m) => (
                        <TableRow key={m.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-sm">{m.nome_completo}</TableCell>
                          <TableCell className="text-xs">{m.cnh_categoria} - {m.cnh_numero}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(m, 'motoristas', 'Motorista')}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

            {/* Tipos Frete - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  Tipos Frete ({tiposFrete.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => handleOpenNew('tipos-frete', 'TipoFrete')}>
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Tipo
                </Button>
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {tiposFrete.map((tf) => (
                      <TableRow key={tf.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{tf.descricao}</TableCell>
                        <TableCell className="text-xs">{tf.modalidade}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(tf, 'tipos-frete', 'TipoFrete')}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Modelos Documento - TABELA COMPLETA */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  Modelos PDF ({modelosDocumento.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => handleOpenNew('modelos', 'ModeloDocumento')}>
                  <Plus className="w-3 h-3 mr-2" />
                  Novo Modelo
                </Button>
              </div>
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-50">
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelosDocumento.map((md) => (
                      <TableRow key={md.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-sm">{md.nome_modelo}</TableCell>
                        <TableCell className="text-xs">{md.tipo_documento}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(md, 'modelos', 'ModeloDocumento')}>
                            <Edit className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Locais Estoque & Rota Padrão - Cards with buttons */}
            <div className="grid lg:grid-cols-2 gap-6">
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

        {/* 🤖 GRUPO 6: INTEGRAÇÕES, IA E PORTAL - CORRIGIDO V20.1 */}
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

            {/* ROW 3: Motor do Chatbot (Intents) - NOVO V20.0 */}
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

            {/* ROW 4: Webhooks - ATIVADO V20.0 */}
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
                  className="w-full bg-orange-600 hover:bg-orange-600"
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

      {/* DIALOGS UNIVERSAIS */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { 
        if (!open) handleCloseDialog();
      }}>
        <DialogContent className="max-w-[90vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? 'Editar' : 'Novo'} {' '}
              {tipoDialog === 'colaboradores' && 'Colaborador'}
              {tipoDialog === 'transportadoras' && 'Transportadora'}
              {tipoDialog === 'centroscusto' && 'Centro de Custo'}
              {tipoDialog === 'bancos' && 'Banco'}
              {tipoDialog === 'formas-pagamento' && 'Forma de Pagamento'}
              {tipoDialog === 'veiculos' && 'Veículo'}
              {tipoDialog === 'empresas' && 'Empresa'}
              {tipoDialog === 'grupos' && 'Grupo Empresarial'}
              {tipoDialog === 'departamentos' && 'Departamento'}
              {tipoDialog === 'cargos' && 'Cargo'}
              {tipoDialog === 'turnos' && 'Turno'}
              {tipoDialog === 'usuarios' && 'Usuário'}
              {tipoDialog === 'perfis' && 'Perfil de Acesso'}
              {tipoDialog === 'condicoes' && 'Condição Comercial'}
              {tipoDialog === 'contatos' && 'Contato B2B'}
              {tipoDialog === 'representantes' && 'Representante'}
              {tipoDialog === 'segmentos' && 'Segmento de Cliente'}
              {tipoDialog === 'servicos' && 'Serviço'}
              {tipoDialog === 'grupos-produto' && 'Grupo de Produtos'}
              {tipoDialog === 'marcas' && 'Marca'}
              {tipoDialog === 'kits' && 'Kit de Produtos'}
              {tipoDialog === 'plano-contas' && 'Conta Contábil'}
              {tipoDialog === 'centros-resultado' && 'Centro de Resultado'}
              {tipoDialog === 'tipos-despesa' && 'Tipo de Despesa'}
              {tipoDialog === 'moedas' && 'Moeda/Índice'}
              {tipoDialog === 'motoristas' && 'Motorista'}
              {tipoDialog === 'tipos-frete' && 'Tipo de Frete'}
              {tipoDialog === 'modelos' && 'Modelo de Documento'}
            </DialogTitle>
          </DialogHeader>
          
          {tipoDialog === 'colaboradores' && <ColaboradorForm colaborador={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'transportadoras' && <TransportadoraForm transportadora={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'centroscusto' && <CentroCustoForm centroCusto={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'bancos' && <BancoForm banco={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'formas-pagamento' && <FormaPagamentoForm forma={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'veiculos' && <VeiculoForm veiculo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'empresas' && <EmpresaForm empresa={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'grupos' && <GrupoEmpresarialForm grupo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'departamentos' && <DepartamentoForm departamento={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'cargos' && <CargoForm cargo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'turnos' && <TurnoForm turno={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'usuarios' && <UsuarioForm usuario={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'perfis' && <PerfilAcessoForm perfil={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'condicoes' && <CondicaoComercialForm condicao={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'contatos' && <ContatoB2BForm contato={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'representantes' && <RepresentanteForm representante={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'segmentos' && <SegmentoClienteForm segmento={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {/* Removed ProdutoFormV22_Completo, TabelaPrecoFormCompleto, CatalogoWebForm from universal dialog rendering */}
          {tipoDialog === 'servicos' && <ServicoForm servico={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'grupos-produto' && <GrupoProdutoForm grupo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'marcas' && <MarcaForm marca={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'kits' && <KitProdutoForm kit={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'plano-contas' && <PlanoContasForm conta={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'centros-resultado' && <CentroResultadoForm centro={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'tipos-despesa' && <TipoDespesaForm tipo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'moedas' && <MoedaIndiceForm moeda={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'motoristas' && <MotoristaForm motorista={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'tipos-frete' && <TipoFreteForm tipo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {tipoDialog === 'modelos' && <ModeloDocumentoForm modelo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
        </DialogContent>
      </Dialog>

      {/* Removed Modal Cadastro Completo Cliente */}
      {/* Removed Modal Cadastro Completo Fornecedor */}

      {/* Painel Dinâmico Cliente */}
      <PainelDinamicoCliente
        cliente={clienteParaPainel}
        isOpen={painelClienteAberto}
        onClose={() => { setPainelClienteAberto(false); setClienteParaPainel(null); }}
        onEdit={(c) => {
          setPainelClienteAberto(false);
          openClienteWindow(c);
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
          openFornecedorWindow(f);
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
          handleEdit(t, 'transportadoras', 'Transportadora');
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
          handleEdit(c, 'colaboradores', 'Colaborador');
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
            config={null}
            onSubmit={(data) => {
              console.log('Config salva:', data);
              toast({
                title: "✅ Sucesso!",
                description: "Configurações salvas!",
                duration: 3000,
              });
              setConfigIntegracaoOpen(false);
            }}
            isSubmitting={false}
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
            evento={null}
            onSubmit={(data) => createMutation.mutate({ entity: 'EventoNotificacao', data })}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* NOVOS DIALOGS V20.1 */}
      {/* These dialogs are now opened directly via state, not through the universal dialog */}
      {/* They are here for cases where a form is tied to a specific action like "Configurar Webhook" */}

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
      
      <Dialog open={filialFormOpen} onOpenChange={setFilialFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Filial</DialogTitle>
          </DialogHeader>
          <FilialForm
            filial={null}
            onSubmit={(data) => createMutation.mutate({ entity: 'Empresa', data: { ...data, tipo: 'Filial' }})}
            isSubmitting={createMutation.isPending}
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
              <AlertDescription className="sm">
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

      {/* Removed V21.1.2: Dialog Multi-Tabelas */}
    </div>
  );
}
