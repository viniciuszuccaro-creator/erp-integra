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
import EmpresaForm from "../components/cadastros/EmpresaForm";
import ProdutoForm from "../components/cadastros/ProdutoForm";
import ServicoForm from "../components/cadastros/ServicoForm";
import TabelaPrecoFormCompleto from "../components/cadastros/TabelaPrecoFormCompleto";
import CatalogoWebForm from "../components/cadastros/CatalogoWebForm";
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
import MultiTabelasEditor from "../components/cadastros/MultiTabelasEditor";
import ProdutoFormV22_Completo from "../components/cadastros/ProdutoFormV22_Completo";
import BotoesImportacaoProduto from "../components/cadastros/BotoesImportacaoProduto";
import SetorAtividadeForm from "../components/cadastros/SetorAtividadeForm";

/**
 * CADASTROS GERAIS V21.0 - HUB CENTRAL COM DUPLA CLASSIFICAÇÃO
 * Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar – nunca apagar
 */
export default function Cadastros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tipoDialog, setTipoDialog] = useState(null);
  
  const [cadastroCompletoAberto, setCadastroCompletoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [cadastroFornecedorAberto, setCadastroFornecedorAberto] = useState(false);
  const [painelClienteAberto, setPainelClienteAberto] = useState(false);
  const [clienteParaPainel, setClienteParaPainel] = useState(null);
  const [painelFornecedorAberto, setPainelFornecedorAberto] = useState(false);
  const [fornecedorParaPainel, setFornecedorParaPainel] = useState(null);
  const [painelTransportadoraAberto, setPainelTransportadoraAberto] = useState(false);
  const [transportadoraParaPainel, setTransportadoraParaPainel] = useState(null);
  const [painelColaboradorAberto, setPainelColaboradorAberto] = useState(false);
  const [colaboradorParaPainel, setColaboradorParaPainel] = useState(null);
  const [configIntegracaoOpen, setConfigIntegracaoOpen] = useState(false);
  const [eventoNotificacaoOpen, setEventoNotificacaoOpen] = useState(false);
  const [webhookFormOpen, setWebhookFormOpen] = useState(false);
  const [chatbotIntentOpen, setChatbotIntentOpen] = useState(false);
  const [produtoFormOpen, setProdutoFormOpen] = useState(false);
  const [servicoFormOpen, setServicoFormOpen] = useState(false);
  const [tabelaPrecoFormOpen, setTabelaPrecoFormOpen] = useState(false);
  const [tabelaSelecionadaEditar, setTabelaSelecionadaEditar] = useState(null);
  const [multiTabelasOpen, setMultiTabelasOpen] = useState(false);
  const [tabelasSelecionadasMulti, setTabelasSelecionadasMulti] = useState([]);
  const [catalogoWebFormOpen, setCatalogoWebFormOpen] = useState(false);
  const [empresaFormOpen, setEmpresaFormOpen] = useState(false);
  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false);
  const [perfilAcessoFormOpen, setPerfilAcessoFormOpen] = useState(false);
  const [rotaPadraoFormOpen, setRotaPadraoFormOpen] = useState(false);
  const [localEstoqueFormOpen, setLocalEstoqueFormOpen] = useState(false);
  const [cadastroFiscalFormOpen, setCadastroFiscalFormOpen] = useState(false);
  const [bitolasPanelOpen, setBitolasPanelOpen] = useState(false);
  const [grupoEmpresarialFormOpen, setGrupoEmpresarialFormOpen] = useState(false);
  const [filialFormOpen, setFilialFormOpen] = useState(false);
  const [departamentoFormOpen, setDepartamentoFormOpen] = useState(false);
  const [cargoFormOpen, setCargoFormOpen] = useState(false);
  const [turnoFormOpen, setTurnoFormOpen] = useState(false);
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
  const [setorAtividadeFormOpen, setSetorAtividadeFormOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const { data: tabelasPrecoItens = [] } = useQuery({
    queryKey: ['tabelas-preco-itens'],
    queryFn: () => base44.entities.TabelaPrecoItem.list(),
  });

  const { data: catalogoWeb = [] } = useQuery({
    queryKey: ['catalogo-web'],
    queryFn: () => base44.entities.CatalogoWeb.list(),
  });

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

  const { data: setoresAtividade = [] } = useQuery({
    queryKey: ['setores-atividade'],
    queryFn: () => base44.entities.SetorAtividade.list(),
  });

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
        'Produto': 'produtos',
        'Servico': 'servicos',
        'TabelaPreco': 'tabelas-preco',
        'CatalogoWeb': 'catalogo-web',
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
        'ModeloDocumento': 'modelos-documento',
        'SetorAtividade': 'setores-atividade'
      };
      const invalidateKey = queryMap[variables.entity] || variables.entity.toLowerCase() + 's';
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
      if (variables.entity === 'TabelaPreco') {
        queryClient.invalidateQueries({ queryKey: ['tabelas-preco-itens'] });
      }
      handleCloseDialog();
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
        'Produto': 'produtos',
        'Servico': 'servicos',
        'TabelaPreco': 'tabelas-preco',
        'CatalogoWeb': 'catalogo-web',
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
        'ModeloDocumento': 'modelos-documento',
        'SetorAtividade': 'setores-atividade'
      };
      const invalidateKey = queryMap[variables.entity] || variables.entity.toLowerCase() + 's';
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
      if (variables.entity === 'TabelaPreco') {
        queryClient.invalidateQueries({ queryKey: ['tabelas-preco-itens'] });
      }
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
    'Bloqueado': 'bg-red-100 text-red-700 border-red-300',
    'Ativa': 'bg-green-100 text-green-700 border-green-300'
  };

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
  const totalItensGrupo3 = produtos.length + servicos.length + tabelasPreco.length + catalogoWeb.length + gruposProduto.length + marcas.length + kits.length + setoresAtividade.length;
  const totalItensGrupo4 = bancos.length + formasPagamento.length + planoContas.length + centrosResultado.length + tiposDespesa.length + moedasIndices.length;
  const totalItensGrupo5 = veiculos.length + motoristas.length + tiposFrete.length + modelosDocumento.length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🚀 Cadastros Gerais V21.0
          </h1>
          <p className="text-slate-600">Hub Central - Fonte Única de Verdade • Dupla Classificação • IA Ativa</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            28 IAs Ativas
          </Badge>
          <Badge className="bg-green-600 text-white px-4 py-2">
            V21.0 - Regra-Mãe
          </Badge>
        </div>
      </div>

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

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="🔍 Buscar em todos os cadastros... (clientes, produtos, fornecedores, etc)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base shadow-md border-slate-300"
        />
      </div>

      <Accordion type="multiple" defaultValue={["grupo-1", "grupo-3"]} className="space-y-4">
        
        {/* CONTINUE WITH REST OF FILE FROM SNAPSHOT... */}
      </Accordion>

      {/* All dialogs... */}
    </div>
  );
}