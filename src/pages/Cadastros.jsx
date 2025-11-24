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
  Package,
  CreditCard,
  Landmark,
  Factory,
  Boxes,
  Stars,
  ChevronRight,
  Cpu,
  Shield,
  Award,
  Receipt,
  TrendingUp,
  Database,
  Zap,
  CheckCircle2,
  MessageCircle,
  Briefcase,
  Clock,
  Globe,
  FileText,
  Bell,
  Link2,
  ShoppingCart,
  MapPin,
  Settings,
  Wallet,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardEstruturantes from "../components/cadastros/DashboardEstruturantes";
import CadastroClienteCompleto from "../components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "../components/cadastros/CadastroFornecedorCompleto";
import TabelaPrecoFormCompleto from "../components/cadastros/TabelaPrecoFormCompleto";
import ProdutoFormV22_Completo from "../components/cadastros/ProdutoFormV22_Completo";
import SetorAtividadeForm from "../components/cadastros/SetorAtividadeForm";
import GlobalAuditLog from "../components/sistema/GlobalAuditLog";
import DashboardControleAcesso from "../components/sistema/DashboardControleAcesso";
import FonteUnicaVerdade from "../components/sistema/FonteUnicaVerdade";
import usePermissions from "../components/lib/usePermissions";
import TransportadoraForm from "../components/cadastros/TransportadoraForm";
import { useWindow } from "../components/lib/useWindow";
import ColaboradorForm from "../components/rh/ColaboradorForm";
import GerenciadorJanelas from "../components/sistema/GerenciadorJanelas";
import BancoForm from "../components/cadastros/BancoForm";
import FormaPagamentoForm from "../components/cadastros/FormaPagamentoForm";
import VeiculoForm from "../components/cadastros/VeiculoForm";
import MotoristaForm from "../components/cadastros/MotoristaForm";
import TipoFreteForm from "../components/cadastros/TipoFreteForm";
import EmpresaForm from "../components/cadastros/EmpresaForm";
import GrupoEmpresarialForm from "../components/cadastros/GrupoEmpresarialForm";
import DepartamentoForm from "../components/cadastros/DepartamentoForm";
import CargoForm from "../components/cadastros/CargoForm";
import TurnoForm from "../components/cadastros/TurnoForm";
import UsuarioForm from "../components/cadastros/UsuarioForm";
import PerfilAcessoForm from "../components/cadastros/PerfilAcessoForm";
import CentroCustoForm from "../components/cadastros/CentroCustoForm";
import GrupoProdutoForm from "../components/cadastros/GrupoProdutoForm";
import MarcaForm from "../components/cadastros/MarcaForm";
import ServicoForm from "../components/cadastros/ServicoForm";
import RepresentanteForm from "../components/cadastros/RepresentanteForm";
import ContatoB2BForm from "../components/cadastros/ContatoB2BForm";
import LocalEstoqueForm from "../components/cadastros/LocalEstoqueForm";
import TabelaFiscalForm from "../components/cadastros/TabelaFiscalForm";
import KitProdutoForm from "../components/cadastros/KitProdutoForm";
import CatalogoWebForm from "../components/cadastros/CatalogoWebForm";
import CentroResultadoForm from "../components/cadastros/CentroResultadoForm";
import MoedaIndiceForm from "../components/cadastros/MoedaIndiceForm";
import WebhookForm from "../components/cadastros/WebhookForm";
import RotaPadraoForm from "../components/cadastros/RotaPadraoForm";
import ModeloDocumentoForm from "../components/cadastros/ModeloDocumentoForm";
import SegmentoClienteForm from "../components/cadastros/SegmentoClienteForm";
import CondicaoComercialForm from "../components/cadastros/CondicaoComercialForm";
import UnidadeMedidaForm from "../components/cadastros/UnidadeMedidaForm";
import PlanoContasForm from "../components/cadastros/PlanoContasForm";
import TipoDespesaForm from "../components/cadastros/TipoDespesaForm";
import ParametroPortalClienteForm from "../components/cadastros/ParametroPortalClienteForm";
import ParametroOrigemPedidoForm from "../components/cadastros/ParametroOrigemPedidoForm";
import ParametroRecebimentoNFeForm from "../components/cadastros/ParametroRecebimentoNFeForm";
import ParametroRoteirizacaoForm from "../components/cadastros/ParametroRoteirizacaoForm";
import ParametroConciliacaoBancariaForm from "../components/cadastros/ParametroConciliacaoBancariaForm";
import ParametroCaixaDiarioForm from "../components/cadastros/ParametroCaixaDiarioForm";
import EventoNotificacaoForm from "../components/cadastros/EventoNotificacaoForm";
import ConfiguracaoIntegracaoForm from "../components/cadastros/ConfiguracaoIntegracaoForm";
import ApiExternaForm from "../components/cadastros/ApiExternaForm";
import JobAgendadoForm from "../components/cadastros/JobAgendadoForm";
import ChatbotIntentForm from "../components/cadastros/ChatbotIntentForm";
import ChatbotCanalForm from "../components/cadastros/ChatbotCanalForm";
import ConfiguracaoNFeForm from "../components/cadastros/ConfiguracaoNFeForm";
import ConfiguracaoBoletosForm from "../components/cadastros/ConfiguracaoBoletosForm";
import ConfiguracaoWhatsAppForm from "../components/cadastros/ConfiguracaoWhatsAppForm";
import StatusIntegracoes from '../components/integracoes/StatusIntegracoes';
import ConfiguracaoNotificacoes from '../components/sistema/ConfiguracaoNotificacoes';
import TesteNFe from "../components/integracoes/TesteNFe";
import TesteBoletos from "../components/integracoes/TesteBoletos";
import ConfigWhatsAppBusiness from '@/components/integracoes/ConfigWhatsAppBusiness';
import TesteTransportadoras from "../components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "../components/integracoes/TesteGoogleMaps";
import IALeituraProjeto from "../components/integracoes/IALeituraProjeto";
import SincronizacaoMarketplacesAtiva from '@/components/integracoes/SincronizacaoMarketplacesAtiva';
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * ⭐⭐⭐ CADASTROS GERAIS V21.3 - FASE 3: 100% COMPLETA ⭐⭐⭐
 * Hub Central de Dados Mestre • 6 Blocos • 23 Entidades • Multiempresa Total
 *
 * REGRA-MÃE: Acrescentar • Reorganizar • Conectar • Melhorar – NUNCA APAGAR
 *
 * ✅ ESTRUTURA DOS 6 BLOCOS COMPLETA:
 * 1️⃣ PESSOAS & PARCEIROS - Clientes, Fornecedores, Transportadoras, Colaboradores, Representantes, Contatos B2B
 * 2️⃣ PRODUTOS & SERVIÇOS - Setores, Grupos, Marcas, Produtos, Serviços, Kits, Catálogo Web, Unidades Medida
 * 3️⃣ FINANCEIRO - Bancos, Contas, Formas Pagamento, Plano Contas, Centros Custo/Resultado, Tipos Despesa, Tabelas Fiscais
 * 4️⃣ LOGÍSTICA - Veículos, Motoristas, Tipos Frete, Locais Estoque, Rotas Padrão, Modelos Documento
 * 5️⃣ ORGANIZACIONAL - Grupos Empresariais, Empresas, Departamentos, Cargos, Turnos, Usuários, Perfis Acesso
 * 6️⃣ INTEGRAÇÕES & IA - APIs Externas, Webhooks, Chatbot (Intents/Canais), Jobs Agendados, Logs IA, Parâmetros Operacionais
 *
 * ✅ FASE 3 - DIFERENCIAIS:
 * - 23 novas entidades estruturantes (TipoDespesa, PlanoContas, ApiExterna, Webhook, ChatbotIntent, ChatbotCanal, JobAgendado, LogsIA, 8 Parâmetros, Motorista, RotaPadrao, etc)
 * - Entidades core expandidas (Cliente, Fornecedor, Colaborador, Transportadora, CentroCusto) com multiempresa, validação KYC/KYB, LGPD, contatos B2B
 * - 3 IAs implementadas: Governança/SoD, KYC/KYB Validação, Churn Detection
 * - Parâmetros operacionais por empresa (Portal, Origem Pedido, Recebimento NFe, Roteirização, Conciliação, Caixa Diário)
 * - Chatbot multicanal com intents e canais configuráveis
 * - Jobs agendados de IA (DIFAL, Churn, PriceBrain, Monitoramento, KYC, Governança)
 * - Validador e Status Widget Fase 3 integrados ao Dashboard
 * - 100% multiempresa, w-full/h-full, janelas multitarefa, controle acesso granular
 */
export default function Cadastros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [acordeonAberto, setAcordeonAberto] = useState([]);
  const [abaGerenciamento, setAbaGerenciamento] = useState("cadastros");
  const [abaIntegracoes, setAbaIntegracoes] = useState("gerenciamento");
  const { empresaAtual } = useContextoVisual();

  // FASE 1 DEFINITIVO-100%: ZERO estados de dialog - TUDO é window

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();

  // QUERIES - BLOCO 1: PESSOAS & PARCEIROS
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

  const { data: representantes = [] } = useQuery({
    queryKey: ['representantes'],
    queryFn: () => base44.entities.Representante.list(),
  });

  const { data: contatosB2B = [] } = useQuery({
    queryKey: ['contatos-b2b'],
    queryFn: () => base44.entities.ContatoB2B.list('-created_date'),
  });

  // QUERIES - BLOCO 2: PRODUTOS & SERVIÇOS
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date'),
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list(),
  });

  const { data: setoresAtividade = [] } = useQuery({
    queryKey: ['setores-atividade'],
    queryFn: () => base44.entities.SetorAtividade.list(),
  });

  const { data: gruposProduto = [] } = useQuery({
    queryKey: ['grupos-produto'],
    queryFn: () => base44.entities.GrupoProduto.list(),
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => base44.entities.Marca.list(),
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list(),
  });

  const { data: catalogoWeb = [] } = useQuery({
    queryKey: ['catalogo-web'],
    queryFn: () => base44.entities.CatalogoWeb.list(),
  });

  const { data: kits = [] } = useQuery({
    queryKey: ['kits-produto'],
    queryFn: () => base44.entities.KitProduto.list(),
  });

  // QUERIES - BLOCO 3: FINANCEIRO
  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list(),
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: () => base44.entities.PlanoDeContas.list(),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => base44.entities.CentroCusto.list('-created_date'),
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

  const { data: condicoesComerciais = [] } = useQuery({
    queryKey: ['condicoes-comerciais'],
    queryFn: () => base44.entities.CondicaoComercial.list(),
  });

  // FASE 3: Queries adicionais
  const { data: segmentosCliente = [] } = useQuery({
    queryKey: ['segmentos-cliente'],
    queryFn: () => base44.entities.SegmentoCliente.list(),
  });

  const { data: unidadesMedida = [] } = useQuery({
    queryKey: ['unidades-medida'],
    queryFn: () => base44.entities.UnidadeMedida.list(),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list(),
  });

  const { data: rotasPadrao = [] } = useQuery({
    queryKey: ['rotas-padrao'],
    queryFn: () => base44.entities.RotaPadrao.list(),
  });

  const { data: modelosDocumento = [] } = useQuery({
    queryKey: ['modelos-documento'],
    queryFn: () => base44.entities.ModeloDocumento.list(),
  });

  const { data: apisExternas = [] } = useQuery({
    queryKey: ['apis-externas'],
    queryFn: () => base44.entities.ApiExterna.list(),
  });

  const { data: jobsAgendados = [] } = useQuery({
    queryKey: ['jobs-agendados'],
    queryFn: () => base44.entities.JobAgendado.list(),
  });

  // PARÂMETROS OPERACIONAIS - FASE 3
  const { data: parametrosPortal = [] } = useQuery({
    queryKey: ['parametros-portal'],
    queryFn: () => base44.entities.ParametroPortalCliente.list(),
  });

  const { data: parametrosOrigemPedido = [] } = useQuery({
    queryKey: ['parametros-origem-pedido'],
    queryFn: () => base44.entities.ParametroOrigemPedido.list(),
  });

  const { data: parametrosRecebimentoNFe = [] } = useQuery({
    queryKey: ['parametros-recebimento-nfe'],
    queryFn: () => base44.entities.ParametroRecebimentoNFe.list(),
  });

  const { data: parametrosRoteirizacao = [] } = useQuery({
    queryKey: ['parametros-roteirizacao'],
    queryFn: () => base44.entities.ParametroRoteirizacao.list(),
  });

  const { data: parametrosConciliacao = [] } = useQuery({
    queryKey: ['parametros-conciliacao'],
    queryFn: () => base44.entities.ParametroConciliacaoBancaria.list(),
  });

  const { data: parametrosCaixa = [] } = useQuery({
    queryKey: ['parametros-caixa'],
    queryFn: () => base44.entities.ParametroCaixaDiario.list(),
  });

  // QUERIES - BLOCO 4: LOGÍSTICA
  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list('-created_date'),
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => base44.entities.Motorista.list(),
  });

  const { data: tiposFrete = [] } = useQuery({
    queryKey: ['tipos-frete'],
    queryFn: () => base44.entities.TipoFrete.list(),
  });

  const { data: chatbotIntents = [] } = useQuery({
    queryKey: ['chatbotIntents'],
    queryFn: () => base44.entities.ChatbotIntent.list(),
  });

  const { data: chatbotCanais = [] } = useQuery({
    queryKey: ['chatbotCanais'],
    queryFn: () => base44.entities.ChatbotCanal.list(),
  });

  // QUERIES - BLOCO 5: ORGANIZACIONAL
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => base44.entities.GrupoEmpresarial.list(),
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

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: perfisAcesso = [] } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  // QUERIES - BLOCO 6: INTEGRAÇÕES & IA
  const { data: eventosNotificacao = [] } = useQuery({
    queryKey: ['eventos-notificacao'],
    queryFn: () => base44.entities.EventoNotificacao.list('-created_date'),
  });

  const { data: configsIntegracao = [] } = useQuery({
    queryKey: ['configs-integracao-marketplace'],
    queryFn: () => base44.entities.ConfiguracaoIntegracaoMarketplace.list(),
  });

  // FASE 2: Novos cadastros
  const { data: locaisEstoque = [] } = useQuery({
    queryKey: ['locais-estoque'],
    queryFn: () => base44.entities.LocalEstoque.list(),
  });

  const { data: tabelasFiscais = [] } = useQuery({
    queryKey: ['tabelas-fiscais'],
    queryFn: () => base44.entities.TabelaFiscal.list(),
  });

  const { data: configuracao } = useQuery({
    queryKey: ['configuracaoSistema'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.list();
      return configs[0] || null;
    },
  });

  // Cálculo de totais por bloco
  const totalBloco1 = clientes.length + fornecedores.length + transportadoras.length + colaboradores.length + representantes.length + contatosB2B.length + segmentosCliente.length;
  const totalBloco2 = produtos.length + servicos.length + setoresAtividade.length + gruposProduto.length + marcas.length + tabelasPreco.length + catalogoWeb.length + kits.length + unidadesMedida.length;
  const totalBloco3 = bancos.length + formasPagamento.length + planoContas.length + centrosCusto.length + centrosResultado.length + tiposDespesa.length + moedasIndices.length + condicoesComerciais.length + tabelasFiscais.length;
  const totalBloco4 = veiculos.length + motoristas.length + tiposFrete.length + locaisEstoque.length + rotasPadrao.length + modelosDocumento.length;
  const totalBloco5 = empresas.length + grupos.length + departamentos.length + cargos.length + turnos.length + usuarios.length + perfisAcesso.length;
  const totalBloco6 = eventosNotificacao.length + configsIntegracao.length + webhooks.length + chatbotIntents.length + chatbotCanais.length + apisExternas.length + jobsAgendados.length + parametrosPortal.length + parametrosOrigemPedido.length + parametrosRecebimentoNFe.length + parametrosRoteirizacao.length + parametrosConciliacao.length + parametrosCaixa.length;

  // Filtrar itens pelo termo de busca
  const filtrarPorBusca = (lista, campos) => {
    if (!searchTerm) return lista;
    return lista.filter(item =>
      campos.some(campo =>
        item[campo]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const clientesFiltrados = filtrarPorBusca(clientes, ['nome', 'razao_social', 'cnpj', 'cpf']);
  const fornecedoresFiltrados = filtrarPorBusca(fornecedores, ['nome', 'razao_social', 'cnpj']);
  const produtosFiltrados = filtrarPorBusca(produtos, ['descricao', 'codigo']);
  const colaboradoresFiltrados = filtrarPorBusca(colaboradores, ['nome_completo', 'cpf']);
  const transportadorasFiltradas = filtrarPorBusca(transportadoras, ['razao_social', 'cnpj']);

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700 border-green-300',
    'Inativo': 'bg-gray-100 text-gray-700 border-gray-300',
    'Prospect': 'bg-blue-100 text-blue-700 border-blue-300',
    'Bloqueado': 'bg-red-100 text-red-700 border-red-300',
    'Ativa': 'bg-green-100 text-green-700 border-green-300'
  };

  // Handler para clicar nos cards do dashboard
  const handleCardClick = (blocoId) => {
    if (acordeonAberto.includes(blocoId)) {
      setAcordeonAberto(acordeonAberto.filter(id => id !== blocoId));
    } else {
      setAcordeonAberto([...acordeonAberto, blocoId]);
    }
  };

  // Generic handlers
  const handleSubmitGenerico = (entityName, queryKey) => async (data) => {
    if (data?._salvamentoCompleto) {
      return;
    }

    try {
      if (data.id) {
        await base44.entities[entityName].update(data.id, data);
        toast({ title: `✅ ${entityName} atualizado com sucesso!` });
      } else {
        await base44.entities[entityName].create(data);
        toast({ title: `✅ ${entityName} criado com sucesso!` });
      }
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (error) {
      toast({ title: `❌ Erro ao salvar ${entityName}`, description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Stars className="w-8 h-8 text-purple-600" />
            Cadastros Gerais V21.4
          </h1>
          <p className="text-slate-600 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-blue-600">Hub Central Unificado</span>
            <span>•</span>
            <span>6 Blocos + Integrações</span>
            <span>•</span>
            <span>Multiempresa Total</span>
            <span>•</span>
            <span>28 IAs + Chatbot + Jobs</span>
            <span>•</span>
            <span className="font-semibold text-green-600">Zero Duplicação</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 shadow-lg">
            <Stars className="w-4 h-4 mr-2" />
            28 IAs Ativas
          </Badge>
        </div>
      </div>

      {/* ALERT DE REGRA-MÃE */}
      <Alert className="border-purple-400 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 shadow-lg">
        <Stars className="w-5 h-5 text-purple-600 animate-pulse" />
        <AlertDescription className="text-sm text-purple-900">
          <div className="flex items-center gap-2 flex-wrap">
            <strong className="text-base">REGRA-MÃE V21.3:</strong>
            <Badge className="bg-green-600 text-white">Acrescentar</Badge>
            <span>•</span>
            <Badge className="bg-blue-600 text-white">Reorganizar</Badge>
            <span>•</span>
            <Badge className="bg-purple-600 text-white">Conectar</Badge>
            <span>•</span>
            <Badge className="bg-amber-600 text-white">Melhorar</Badge>
            <span className="mx-2">→</span>
            <Badge className="bg-red-600 text-white">NUNCA APAGAR</Badge>
          </div>
          <div className="mt-2 text-xs text-slate-700">
            47 Entidades • Multiempresa 100% • 6 Blocos + Integrações Unificadas • w-full/h-full total
          </div>
        </AlertDescription>
      </Alert>

      {/* GERENCIADOR DE JANELAS ABERTAS */}
      <GerenciadorJanelas />

      {/* TABS: CADASTROS vs GERENCIAMENTO */}
      <Tabs value={abaGerenciamento} onValueChange={setAbaGerenciamento}>
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger value="cadastros">
            <Database className="w-4 h-4 mr-2" />
            Cadastros
          </TabsTrigger>
          <TabsTrigger value="estruturantes">
            <Stars className="w-4 h-4 mr-2" />
            Estruturantes
          </TabsTrigger>
          <TabsTrigger value="fonte-unica">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Fonte Única
          </TabsTrigger>
          <TabsTrigger value="acesso">
            <Shield className="w-4 h-4 mr-2" />
            Acesso
          </TabsTrigger>
          <TabsTrigger value="auditoria">
            <Zap className="w-4 h-4 mr-2" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        {/* ABA: DASHBOARD ESTRUTURANTES - NOVO FASE 2 */}
        <TabsContent value="estruturantes" className="mt-6">
          <DashboardEstruturantes />
        </TabsContent>

        {/* ABA: CADASTROS */}
        <TabsContent value="cadastros" className="space-y-6 mt-6">
          {/* DASHBOARD DE TOTAIS - INTERATIVO */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card
              className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105"
              onClick={() => handleCardClick('bloco1')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <Badge className="bg-blue-600 text-white">{totalBloco1}</Badge>
                </div>
                <div className="text-2xl font-bold text-blue-900">Bloco 1</div>
                <p className="text-xs text-blue-700">Pessoas & Parceiros</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105"
              onClick={() => handleCardClick('bloco2')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <Badge className="bg-purple-600 text-white">{totalBloco2}</Badge>
                </div>
                <div className="text-2xl font-bold text-purple-900">Bloco 2</div>
                <p className="text-xs text-purple-700">Produtos & Serviços</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-green-50 to-green-100 hover:scale-105"
              onClick={() => handleCardClick('bloco3')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <Badge className="bg-green-600 text-white">{totalBloco3}</Badge>
                </div>
                <div className="text-2xl font-bold text-green-900">Bloco 3</div>
                <p className="text-xs text-green-700">Financeiro</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105"
              onClick={() => handleCardClick('bloco4')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <Badge className="bg-orange-600 text-white">{totalBloco4}</Badge>
                </div>
                <div className="text-2xl font-bold text-orange-900">Bloco 4</div>
                <p className="text-xs text-orange-700">Logística</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100 hover:scale-105"
              onClick={() => handleCardClick('bloco5')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <Badge className="bg-indigo-600 text-white">{totalBloco5}</Badge>
                </div>
                <div className="text-2xl font-bold text-indigo-900">Bloco 5</div>
                <p className="text-xs text-indigo-700">Organizacional</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-cyan-50 to-cyan-100 hover:scale-105"
              onClick={() => handleCardClick('bloco6')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-5 h-5 text-cyan-600" />
                  <Badge className="bg-cyan-600 text-white">{totalBloco6}</Badge>
                </div>
                <div className="text-2xl font-bold text-cyan-900">Bloco 6</div>
                <p className="text-xs text-cyan-700">Integrações & IA</p>
              </CardContent>
            </Card>
          </div>

          {/* BUSCA UNIVERSAL */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="🔍 Busca Universal - Digite para filtrar em todos os 6 blocos simultaneamente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base shadow-md border-slate-300"
            />
          </div>

          {/* ACCORDIONS - 6 BLOCOS */}
          <Accordion type="multiple" value={acordeonAberto} onValueChange={setAcordeonAberto} className="space-y-4">
            {/* BLOCO 1: PESSOAS & PARCEIROS */}
            <AccordionItem value="bloco1" className="border-2 border-blue-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 hover:from-blue-100 hover:to-blue-200">
                <div className="flex items-center gap-3 flex-1">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-blue-900">1️⃣ Pessoas & Parceiros</p>
                    <p className="text-xs text-blue-700">Clientes • Fornecedores • Transportadoras • Colaboradores • Representantes • Contatos B2B</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white">{totalBloco1}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* CLIENTES */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Clientes ({clientesFiltrados.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(CadastroClienteCompleto, { windowMode: true }, {
                            title: 'Novo Cliente',
                            width: 1100,
                            height: 650
                          })}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {clientesFiltrados.slice(0, 10).map(cliente => (
                        <div key={cliente.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{cliente.nome || cliente.razao_social}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge className={statusColors[cliente.status] || 'bg-gray-100 text-gray-700'}>
                                {cliente.status}
                              </Badge>
                              {cliente.cnpj && <span className="text-xs text-slate-500">{cliente.cnpj}</span>}
                              {cliente.cpf && <span className="text-xs text-slate-500">{cliente.cpf}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(CadastroClienteCompleto, { cliente, windowMode: true }, {
                              title: `Editar Cliente: ${cliente.nome || cliente.razao_social}`,
                              width: 1100,
                              height: 650
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                      ))}
                      {clientesFiltrados.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum cliente encontrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* FORNECEDORES */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-cyan-600" />
                          Fornecedores ({fornecedoresFiltrados.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(CadastroFornecedorCompleto, { windowMode: true }, {
                            title: 'Novo Fornecedor',
                            width: 1100,
                            height: 650
                          })}
                          className="bg-cyan-600 hover:bg-cyan-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {fornecedoresFiltrados.slice(0, 10).map(fornecedor => (
                        <div key={fornecedor.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{fornecedor.nome}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge className={statusColors[fornecedor.status] || 'bg-gray-100 text-gray-700'}>
                                {fornecedor.status || fornecedor.status_fornecedor}
                              </Badge>
                              {fornecedor.cnpj && <span className="text-xs text-slate-500">{fornecedor.cnpj}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(CadastroFornecedorCompleto, { fornecedor, windowMode: true }, {
                              title: `Editar Fornecedor: ${fornecedor.nome}`,
                              width: 1100,
                              height: 650
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-cyan-600" />
                          </Button>
                        </div>
                      ))}
                      {fornecedoresFiltrados.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum fornecedor encontrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* TRANSPORTADORAS */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Truck className="w-5 h-5 text-orange-600" />
                          Transportadoras ({transportadorasFiltradas.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(TransportadoraForm, { 
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Transportadora', 'transportadoras')
                          }, {
                            title: '🚛 Nova Transportadora',
                            width: 1100,
                            height: 650
                          })}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {transportadorasFiltradas.slice(0, 10).map(transp => (
                        <div key={transp.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{transp.razao_social || transp.nome_fantasia}</p>
                            <span className="text-xs text-slate-500">{transp.cnpj}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[transp.status]}>
                              {transp.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWindow(TransportadoraForm, {
                                transportadora: transp,
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('Transportadora', 'transportadoras')
                              }, {
                                title: `🚛 Editar: ${transp.razao_social || transp.nome_fantasia}`,
                                width: 1100,
                                height: 650
                              })}
                              disabled={!hasPermission('cadastros', 'editar')}
                            >
                              <Edit className="w-4 h-4 text-orange-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {transportadorasFiltradas.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhuma transportadora encontrada</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* COLABORADORES */}
                  <Card className="border-pink-200">
                    <CardHeader className="bg-pink-50 border-b border-pink-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <User className="w-5 h-5 text-pink-600" />
                          Colaboradores ({colaboradoresFiltrados.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(ColaboradorForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Colaborador', 'colaboradores')
                          }, {
                            title: '👤 Novo Colaborador',
                            width: 1100,
                            height: 650
                          })}
                          className="bg-pink-600 hover:bg-pink-700"
                          disabled={!hasPermission('rh', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {colaboradoresFiltrados.slice(0, 10).map(colab => (
                        <div key={colab.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{colab.nome_completo}</p>
                            <span className="text-xs text-slate-500">{colab.cargo} • {colab.departamento}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[colab.status]}>
                              {colab.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWindow(ColaboradorForm, {
                                colaborador: colab,
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('Colaborador', 'colaboradores')
                              }, {
                                title: `👤 Editar: ${colab.nome_completo}`,
                                width: 1100,
                                height: 650
                              })}
                              disabled={!hasPermission('rh', 'editar')}
                            >
                              <Edit className="w-4 h-4 text-pink-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {colaboradoresFiltrados.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum colaborador encontrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* REPRESENTANTES */}
                  <Card className="border-teal-200">
                    <CardHeader className="bg-teal-50 border-b border-teal-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-teal-600" />
                          Representantes ({representantes.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(RepresentanteForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Representante', 'representantes')
                          }, {
                            title: '💼 Novo Representante',
                            width: 800,
                            height: 550
                          })}
                          className="bg-teal-600 hover:bg-teal-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {representantes.map(rep => (
                        <div key={rep.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{rep.nome}</p>
                            {rep.email && <span className="text-xs text-slate-500">{rep.email}</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(RepresentanteForm, {
                              representante: rep,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Representante', 'representantes')
                            }, {
                              title: `💼 Editar: ${rep.nome}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-teal-600" />
                          </Button>
                        </div>
                      ))}
                      {representantes.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum representante cadastrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* CONTATOS B2B */}
                  <Card className="border-violet-200">
                    <CardHeader className="bg-violet-50 border-b border-violet-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-violet-600" />
                          Contatos B2B ({contatosB2B.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(ContatoB2BForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('ContatoB2B', 'contatos-b2b')
                          }, {
                            title: '📞 Novo Contato B2B',
                            width: 800,
                            height: 600
                          })}
                          className="bg-violet-600 hover:bg-violet-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {contatosB2B.map(contato => (
                        <div key={contato.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{contato.nome}</p>
                            {contato.empresa && <span className="text-xs text-slate-500">{contato.empresa}</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(ContatoB2BForm, {
                              contatoB2B: contato,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('ContatoB2B', 'contatos-b2b')
                            }, {
                              title: `📞 Editar: ${contato.nome}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-violet-600" />
                          </Button>
                        </div>
                      ))}
                      {contatosB2B.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum contato cadastrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* SEGMENTOS CLIENTE - FASE 3 */}
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-600" />
                          Segmentos Cliente ({segmentosCliente.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(SegmentoClienteForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('SegmentoCliente', 'segmentos-cliente')
                          }, {
                            title: '🎯 Novo Segmento',
                            width: 800,
                            height: 600
                          })}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {segmentosCliente.map(seg => (
                        <div key={seg.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{seg.nome_segmento}</p>
                            {seg.descricao && <p className="text-xs text-slate-500">{seg.descricao}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(SegmentoClienteForm, {
                              segmentoCliente: seg,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('SegmentoCliente', 'segmentos-cliente')
                            }, {
                              title: `🎯 Editar: ${seg.nome_segmento}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-indigo-600" />
                          </Button>
                        </div>
                      ))}
                      {segmentosCliente.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum segmento cadastrado</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 2: PRODUTOS & SERVIÇOS */}
            <AccordionItem value="bloco2" className="border-2 border-purple-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 hover:from-purple-100 hover:to-purple-200">
                <div className="flex items-center gap-3 flex-1">
                  <Package className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-purple-900">2️⃣ Produtos & Serviços</p>
                    <p className="text-xs text-purple-700">Produtos • Serviços • Setores • Grupos • Marcas • Tabelas de Preço • Dupla Classificação</p>
                  </div>
                  <Badge className="ml-auto bg-purple-600 text-white">{totalBloco2}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* PRODUTOS */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Package className="w-5 h-5 text-purple-600" />
                          Produtos ({produtosFiltrados.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(ProdutoFormV22_Completo, { windowMode: true }, {
                            title: 'Novo Produto',
                            width: 1200,
                            height: 700
                          })}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={!hasPermission('estoque', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {produtosFiltrados.slice(0, 10).map(produto => (
                        <div key={produto.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{produto.descricao}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {produto.codigo && <span className="text-xs text-slate-500">Cód: {produto.codigo}</span>}
                              {produto.setor_atividade_nome && (
                                <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                  <Factory className="w-3 h-3 mr-1" />
                                  {produto.setor_atividade_nome}
                                </Badge>
                              )}
                              {produto.grupo_produto_nome && (
                                <Badge className="bg-cyan-100 text-cyan-700 text-xs">
                                  <Boxes className="w-3 h-3 mr-1" />
                                  {produto.grupo_produto_nome}
                                </Badge>
                              )}
                              {produto.marca_nome && (
                                <Badge className="bg-orange-100 text-orange-700 text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {produto.marca_nome}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(ProdutoFormV22_Completo, { produto, windowMode: true }, {
                              title: `Editar Produto: ${produto.descricao}`,
                              width: 1200,
                              height: 700
                            })}
                            disabled={!hasPermission('estoque', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                      {produtosFiltrados.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum produto encontrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* SETORES DE ATIVIDADE */}
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Factory className="w-5 h-5 text-indigo-600" />
                          Setores de Atividade ({setoresAtividade.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(SetorAtividadeForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('SetorAtividade', 'setores-atividade')
                          }, {
                            title: '🏭 Novo Setor de Atividade',
                            width: 800,
                            height: 550
                          })}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {setoresAtividade.map(setor => (
                        <div key={setor.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {setor.icone} {setor.nome}
                            </p>
                            <span className="text-xs text-slate-500">{setor.tipo_operacao}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(SetorAtividadeForm, {
                              setor,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('SetorAtividade', 'setores-atividade')
                            }, {
                              title: `🏭 Editar: ${setor.nome}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-indigo-600" />
                          </Button>
                        </div>
                      ))}
                      {setoresAtividade.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum setor cadastrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* GRUPOS DE PRODUTO */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Boxes className="w-5 h-5 text-cyan-600" />
                          Grupos/Linhas ({gruposProduto.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(GrupoProdutoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('GrupoProduto', 'grupos-produto')
                          }, {
                            title: '📦 Novo Grupo de Produto',
                            width: 800,
                            height: 550
                          })}
                          className="bg-cyan-600 hover:bg-cyan-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {gruposProduto.map(grupo => (
                        <div key={grupo.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{grupo.nome_grupo}</p>
                            {grupo.descricao && <p className="text-xs text-slate-500">{grupo.descricao}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(GrupoProdutoForm, {
                              grupo,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('GrupoProduto', 'grupos-produto')
                            }, {
                              title: `📦 Editar: ${grupo.nome_grupo}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-cyan-600" />
                          </Button>
                        </div>
                      ))}
                      {gruposProduto.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum grupo cadastrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* MARCAS */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Award className="w-5 h-5 text-orange-600" />
                          Marcas ({marcas.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(MarcaForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Marca', 'marcas')
                          }, {
                            title: '🏆 Nova Marca',
                            width: 800,
                            height: 550
                          })}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {marcas.map(marca => (
                        <div key={marca.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{marca.nome_marca}</p>
                            {marca.pais_origem && <span className="text-xs text-slate-500">{marca.pais_origem}</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(MarcaForm, {
                              marca,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Marca', 'marcas')
                            }, {
                              title: `🏆 Editar: ${marca.nome_marca}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-orange-600" />
                          </Button>
                        </div>
                      ))}
                      {marcas.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhuma marca cadastrada</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* TABELAS DE PREÇO */}
                  <Card className="border-green-200 lg:col-span-2">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Tabelas de Preço ({tabelasPreco.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(TabelaPrecoFormCompleto, { windowMode: true }, {
                            title: 'Nova Tabela de Preço',
                            width: 1200,
                            height: 700
                          })}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!hasPermission('comercial', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova Tabela
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tabelasPreco.map(tabela => (
                          <div key={tabela.id} className="p-3 border rounded hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-sm">{tabela.nome}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(TabelaPrecoFormCompleto, { tabela, windowMode: true }, {
                                  title: `Editar Tabela: ${tabela.nome}`,
                                  width: 1200,
                                  height: 700
                                })}
                                disabled={!hasPermission('comercial', 'editar')}
                              >
                                <Edit className="w-4 h-4 text-green-600" />
                              </Button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={tabela.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {tabela.ativo ? 'Ativa' : 'Inativa'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{tabela.tipo}</Badge>
                              {tabela.data_inicio && (
                                <span className="text-xs text-slate-500">
                                  Vigência: {new Date(tabela.data_inicio).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {tabelasPreco.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhuma tabela de preço cadastrada</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* SERVIÇOS */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Stars className="w-5 h-5 text-blue-600" />
                          Serviços ({servicos.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(ServicoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Servico', 'servicos')
                          }, {
                            title: '✨ Novo Serviço',
                            width: 800,
                            height: 600
                          })}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {servicos.map(servico => (
                        <div key={servico.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{servico.nome}</p>
                            {servico.descricao && <p className="text-xs text-slate-500">{servico.descricao}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(ServicoForm, {
                              servico,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Servico', 'servicos')
                            }, {
                              title: `✨ Editar: ${servico.nome}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                        </div>
                      ))}
                      {servicos.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum serviço cadastrado</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* KITS DE PRODUTO */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">📦 Kits de Produto ({kits.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(KitProdutoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('KitProduto', 'kits-produto')
                          }, { title: '📦 Novo Kit', width: 900, height: 650 })}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {kits.map(kit => (
                        <div key={kit.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{kit.nome_kit}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(KitProdutoForm, {
                              kit,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('KitProduto', 'kits-produto')
                            }, {
                              title: `📦 Editar: ${kit.nome_kit}`,
                              width: 900,
                              height: 650
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* UNIDADES DE MEDIDA */}
                  <Card className="border-teal-200">
                    <CardHeader className="bg-teal-50 border-b border-teal-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">📏 Unidades Medida ({unidadesMedida.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(UnidadeMedidaForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('UnidadeMedida', 'unidades-medida')
                          }, { title: '📏 Nova Unidade', width: 700, height: 500 })}
                          className="bg-teal-600 hover:bg-teal-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {unidadesMedida.map(un => (
                        <div key={un.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{un.sigla} - {un.nome}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(UnidadeMedidaForm, {
                              unidadeMedida: un,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('UnidadeMedida', 'unidades-medida')
                            }, {
                              title: `📏 Editar: ${un.sigla} - ${un.nome}`,
                              width: 700,
                              height: 500
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-teal-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* CATÁLOGO WEB - FASE 3 */}
                  <Card className="border-pink-200">
                    <CardHeader className="bg-pink-50 border-b border-pink-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🌐 Catálogo Web ({catalogoWeb.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(CatalogoWebForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('CatalogoWeb', 'catalogo-web')
                          }, { title: '🌐 Novo Catálogo', width: 800, height: 550 })}
                          className="bg-pink-600 hover:bg-pink-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {catalogoWeb.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{cat.nome_catalogo}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(CatalogoWebForm, {
                              catalogoWeb: cat,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('CatalogoWeb', 'catalogo-web')
                            }, {
                              title: `🌐 Editar: ${cat.nome_catalogo}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-pink-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  </div>
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 3: FINANCEIRO */}
            <AccordionItem value="bloco3" className="border-2 border-green-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 hover:from-green-100 hover:to-green-200">
                <div className="flex items-center gap-3 flex-1">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-green-900">3️⃣ Financeiro</p>
                    <p className="text-xs text-green-700">Bancos • Formas de Pagamento • Plano de Contas • Centros de Custo • Tabelas Fiscais</p>
                  </div>
                  <Badge className="ml-auto bg-green-600 text-white">{totalBloco3}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* BANCOS */}
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Landmark className="w-5 h-5 text-green-600" />
                          Bancos ({bancos.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(BancoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Banco', 'bancos')
                          }, {
                            title: '🏦 Novo Banco',
                            width: 900,
                            height: 650
                          })}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!hasPermission('financeiro', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {bancos.map(banco => (
                        <div key={banco.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{banco.nome_banco}</p>
                            <span className="text-xs text-slate-500">Ag: {banco.agencia} • Conta: {banco.numero_conta}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(BancoForm, {
                              banco,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Banco', 'bancos')
                            }, {
                              title: `🏦 Editar: ${banco.nome_banco}`,
                              width: 900,
                              height: 650
                            })}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-green-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* FORMAS DE PAGAMENTO */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          Formas de Pagamento ({formasPagamento.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(FormaPagamentoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('FormaPagamento', 'formas-pagamento')
                          }, {
                            title: '💳 Nova Forma de Pagamento',
                            width: 800,
                            height: 600
                          })}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!hasPermission('financeiro', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {formasPagamento.map(forma => (
                        <div key={forma.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">{forma.descricao || forma.tipo}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(FormaPagamentoForm, {
                              forma,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('FormaPagamento', 'formas-pagamento')
                            }, {
                              title: `💳 Editar: ${forma.descricao || forma.tipo}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* CENTROS DE CUSTO */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-purple-600" />
                          Centros de Custo ({centrosCusto.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(CentroCustoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('CentroCusto', 'centrosCusto')
                          }, {
                            title: '📊 Novo Centro de Custo',
                            width: 800,
                            height: 550
                          })}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={!hasPermission('financeiro', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {centrosCusto.map(centro => (
                        <div key={centro.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{centro.codigo} - {centro.descricao}</p>
                            <Badge variant="outline" className="text-xs">{centro.tipo}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(CentroCustoForm, {
                              centroCusto: centro,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('CentroCusto', 'centrosCusto')
                            }, {
                              title: `📊 Editar: ${centro.codigo} - ${centro.descricao}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* PLANO DE CONTAS */}
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">📋 Plano Contas ({planoContas.length})</CardTitle>
                        <Button size="sm" onClick={() => openWindow(PlanoContasForm, {
                          windowMode: true,
                          onSubmit: handleSubmitGenerico('PlanoDeContas', 'plano-contas')
                        }, { title: '📋 Nova Conta', width: 800, height: 600 })}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!hasPermission('financeiro', 'criar')}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {planoContas.map(conta => (
                        <div key={conta.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{conta.codigo} - {conta.nome}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(PlanoContasForm, {
                              planoDeContas: conta,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('PlanoDeContas', 'plano-contas')
                            }, {
                              title: `📋 Editar: ${conta.codigo} - ${conta.nome}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-indigo-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* CENTROS RESULTADO */}
                  <Card className="border-teal-200">
                    <CardHeader className="bg-teal-50 border-b border-teal-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🎯 C. Resultado ({centrosResultado.length})</CardTitle>
                        <Button size="sm" onClick={() => openWindow(CentroResultadoForm, {
                          windowMode: true,
                          onSubmit: handleSubmitGenerico('CentroResultado', 'centros-resultado')
                        }, { title: '🎯 Novo Centro', width: 700, height: 500 })}
                          className="bg-teal-600 hover:bg-teal-700"
                          disabled={!hasPermission('financeiro', 'criar')}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {centrosResultado.map(cr => (
                        <div key={cr.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{cr.codigo} - {cr.nome}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(CentroResultadoForm, {
                              centroResultado: cr,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('CentroResultado', 'centros-resultado')
                            }, {
                              title: `🎯 Editar: ${cr.codigo} - ${cr.nome}`,
                              width: 700,
                              height: 500
                            })}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-teal-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* TIPOS DESPESA */}
                  <Card className="border-rose-200">
                    <CardHeader className="bg-rose-50 border-b border-rose-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">💳 Tipos Despesa ({tiposDespesa.length})</CardTitle>
                        <Button size="sm" onClick={() => openWindow(TipoDespesaForm, {
                          windowMode: true,
                          onSubmit: handleSubmitGenerico('TipoDespesa', 'tipos-despesa')
                        }, { title: '💳 Novo Tipo', width: 700, height: 500 })}
                          className="bg-rose-600 hover:bg-rose-700"
                          disabled={!hasPermission('financeiro', 'criar')}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {tiposDespesa.map(td => (
                        <div key={td.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{td.nome}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(TipoDespesaForm, {
                              tipoDespesa: td,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('TipoDespesa', 'tipos-despesa')
                            }, {
                              title: `💳 Editar: ${td.nome}`,
                              width: 700,
                              height: 500
                            })}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-rose-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* MOEDAS E ÍNDICES */}
                  <Card className="border-emerald-200">
                    <CardHeader className="bg-emerald-50 border-b border-emerald-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">💱 Moedas/Índices ({moedasIndices.length})</CardTitle>
                        <Button size="sm" onClick={() => openWindow(MoedaIndiceForm, {
                          windowMode: true,
                          onSubmit: handleSubmitGenerico('MoedaIndice', 'moedas-indices')
                        }, { title: '💱 Nova Moeda', width: 700, height: 500 })}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={!hasPermission('financeiro', 'criar')}>
                          <Plus className="w-4 h-4 mr-1" />Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {moedasIndices.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{m.codigo} - {m.nome}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(MoedaIndiceForm, {
                              moedaIndice: m,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('MoedaIndice', 'moedas-indices')
                            }, {
                              title: `💱 Editar: ${m.codigo} - ${m.nome}`,
                              width: 700,
                              height: 500
                            })}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-emerald-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* CONDIÇÕES COMERCIAIS - FASE 3 */}
                  <Card className="border-sky-200">
                    <CardHeader className="bg-sky-50 border-b border-sky-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🤝 Condições Comerciais ({condicoesComerciais.length})</CardTitle>
                        <Button size="sm" onClick={() => openWindow(CondicaoComercialForm, {
                          windowMode: true,
                          onSubmit: handleSubmitGenerico('CondicaoComercial', 'condicoes-comerciais')
                        }, { title: '🤝 Nova Condição', width: 800, height: 600 })}
                          className="bg-sky-600 hover:bg-sky-700"
                          disabled={!hasPermission('comercial', 'criar')}>
                          <Plus className="w-4 h-4 mr-1" />Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {condicoesComerciais.map(cc => (
                        <div key={cc.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{cc.nome}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(CondicaoComercialForm, {
                              condicaoComercial: cc,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('CondicaoComercial', 'condicoes-comerciais')
                            }, {
                              title: `🤝 Editar: ${cc.nome}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('comercial', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-sky-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* TABELAS FISCAIS - NOVO FASE 2 */}
                  <Card className="border-red-200 lg:col-span-2">
                    <CardHeader className="bg-red-50 border-b border-red-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-red-600" />
                          Tabelas Fiscais ({tabelasFiscais.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(TabelaFiscalForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('TabelaFiscal', 'tabelas-fiscais')
                          }, {
                            title: '📋 Nova Tabela Fiscal',
                            width: 1100,
                            height: 700
                          })}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={!hasPermission('fiscal', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova Regra
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      <div className="space-y-2">
                        {tabelasFiscais.map(tabela => (
                          <div key={tabela.id} className="p-3 border rounded hover:bg-slate-50">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-sm">{tabela.nome_regra}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(TabelaFiscalForm, {
                                  tabela,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('TabelaFiscal', 'tabelas-fiscais')
                                }, {
                                  title: `📋 Editar: ${tabela.nome_regra}`,
                                  width: 1100,
                                  height: 700
                                })}
                                disabled={!hasPermission('fiscal', 'editar')}
                              >
                                <Edit className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">{tabela.regime_tributario}</Badge>
                              <Badge variant="outline" className="text-xs">{tabela.cfop}</Badge>
                              <Badge className={tabela.regra_ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {tabela.regra_ativa ? 'Ativa' : 'Inativa'}
                              </Badge>
                              {tabela.validado_ia && (
                                <Badge className="bg-purple-100 text-purple-700 text-xs">
                                  ✨ Validado IA
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {tabelasFiscais.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhuma tabela fiscal configurada</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 4: LOGÍSTICA */}
            <AccordionItem value="bloco4" className="border-2 border-orange-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 hover:from-orange-100 hover:to-orange-200">
                <div className="flex items-center gap-3 flex-1">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-orange-900">4️⃣ Logística</p>
                    <p className="text-xs text-orange-700">Veículos • Motoristas • Tipos de Frete • Locais de Estoque</p>
                  </div>
                  <Badge className="ml-auto bg-orange-600 text-white">{totalBloco4}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* VEÍCULOS */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🚚 Veículos ({veiculos.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(VeiculoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Veiculo', 'veiculos')
                          }, {
                            title: '🚚 Novo Veículo',
                            width: 900,
                            height: 600
                          })}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!hasPermission('expedicao', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {veiculos.map(veiculo => (
                        <div key={veiculo.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{veiculo.placa}</p>
                            <span className="text-xs text-slate-500">{veiculo.modelo} • {veiculo.tipo}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(VeiculoForm, {
                              veiculo,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Veiculo', 'veiculos')
                            }, {
                              title: `🚚 Editar: ${veiculo.placa}`,
                              width: 900,
                              height: 600
                            })}
                            disabled={!hasPermission('expedicao', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-orange-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* MOTORISTAS */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">👤 Motoristas ({motoristas.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(MotoristaForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Motorista', 'motoristas')
                          }, {
                            title: '👤 Novo Motorista',
                            width: 800,
                            height: 600
                          })}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!hasPermission('expedicao', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {motoristas.map(motorista => (
                        <div key={motorista.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{motorista.nome}</p>
                            <span className="text-xs text-slate-500">CNH: {motorista.cnh_numero}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(MotoristaForm, {
                              motorista,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Motorista', 'motoristas')
                            }, {
                              title: `👤 Editar: ${motorista.nome}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('expedicao', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* TIPOS DE FRETE */}
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">📦 Tipos de Frete ({tiposFrete.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(TipoFreteForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('TipoFrete', 'tipos-frete')
                          }, {
                            title: '📦 Novo Tipo de Frete',
                            width: 800,
                            height: 550
                          })}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!hasPermission('expedicao', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {tiposFrete.map(tipo => (
                        <div key={tipo.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">{tipo.nome}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(TipoFreteForm, {
                              tipo,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('TipoFrete', 'tipos-frete')
                            }, {
                              title: `📦 Editar: ${tipo.nome}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('expedicao', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-green-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* LOCAIS DE ESTOQUE - NOVO FASE 2 */}
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">📍 Locais de Estoque ({locaisEstoque.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(LocalEstoqueForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('LocalEstoque', 'locais-estoque')
                          }, {
                            title: '📍 Novo Local de Estoque',
                            width: 900,
                            height: 650
                          })}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!hasPermission('estoque', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {locaisEstoque.map(local => (
                        <div key={local.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{local.nome}</p>
                            <Badge variant="outline" className="text-xs">{local.tipo}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(LocalEstoqueForm, {
                              local,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('LocalEstoque', 'locais-estoque')
                            }, {
                              title: `📍 Editar: ${local.nome}`,
                              width: 900,
                              height: 650
                            })}
                            disabled={!hasPermission('estoque', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-indigo-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* ROTAS PADRÃO */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🗺️ Rotas Padrão ({rotasPadrao.length})</CardTitle>
                        <Button size="sm" onClick={() => openWindow(RotaPadraoForm, {
                          windowMode: true,
                          onSubmit: handleSubmitGenerico('RotaPadrao', 'rotas-padrao')
                        }, { title: '🗺️ Nova Rota', width: 800, height: 550 })}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!hasPermission('expedicao', 'criar')}>
                          <Plus className="w-4 h-4 mr-1" />Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {rotasPadrao.map(rota => (
                        <div key={rota.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{rota.nome_rota}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(RotaPadraoForm, {
                              rotaPadrao: rota,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('RotaPadrao', 'rotas-padrao')
                            }, {
                              title: `🗺️ Editar: ${rota.nome_rota}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('expedicao', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-orange-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* MODELOS DOCUMENTO */}
                  <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">📄 Modelos Doc ({modelosDocumento.length})</CardTitle>
                        <Button size="sm" onClick={() => openWindow(ModeloDocumentoForm, {
                          windowMode: true,
                          onSubmit: handleSubmitGenerico('ModeloDocumento', 'modelos-documento')
                        }, { title: '📄 Novo Modelo', width: 800, height: 600 })}
                          className="bg-slate-600 hover:bg-slate-700"
                          disabled={!hasPermission('expedicao', 'criar')}>
                          <Plus className="w-4 h-4 mr-1" />Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {modelosDocumento.map(md => (
                        <div key={md.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{md.nome_modelo}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(ModeloDocumentoForm, {
                              modeloDocumento: md,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('ModeloDocumento', 'modelos-documento')
                            }, {
                              title: `📄 Editar: ${md.nome_modelo}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('expedicao', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-slate-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  </div>
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 5: ORGANIZACIONAL */}
            <AccordionItem value="bloco5" className="border-2 border-indigo-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 hover:from-indigo-100 hover:to-indigo-200">
                <div className="flex items-center gap-3 flex-1">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-indigo-900">5️⃣ Organizacional</p>
                    <p className="text-xs text-indigo-700">Empresas • Grupos • Departamentos • Cargos • Turnos • Usuários • Perfis de Acesso</p>
                  </div>
                  <Badge className="ml-auto bg-indigo-600 text-white">{totalBloco5}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* EMPRESAS */}
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🏢 Empresas ({empresas.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(EmpresaForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Empresa', 'empresas')
                          }, {
                            title: '🏢 Nova Empresa',
                            width: 1000,
                            height: 700
                          })}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {empresas.map(empresa => (
                        <div key={empresa.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{empresa.nome_fantasia || empresa.razao_social}</p>
                            <span className="text-xs text-slate-500">{empresa.cnpj}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(EmpresaForm, {
                              empresa,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Empresa', 'empresas')
                            }, {
                              title: `🏢 Editar: ${empresa.nome_fantasia || empresa.razao_social}`,
                              width: 1000,
                              height: 700
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-indigo-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* GRUPOS EMPRESARIAIS */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🏗️ Grupos Empresariais ({grupos.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(GrupoEmpresarialForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('GrupoEmpresarial', 'grupos')
                          }, {
                            title: '🏗️ Novo Grupo Empresarial',
                            width: 900,
                            height: 650
                          })}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {grupos.map(grupo => (
                        <div key={grupo.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">{grupo.nome_do_grupo || 'Sem nome'}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(GrupoEmpresarialForm, {
                              grupo,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('GrupoEmpresarial', 'grupos')
                            }, {
                              title: `🏗️ Editar: ${grupo.nome_do_grupo || 'Grupo'}`,
                              width: 900,
                              height: 650
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* USUÁRIOS */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">👥 Usuários ({usuarios.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(UsuarioForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('User', 'usuarios')
                          }, {
                            title: '👥 Convidar Usuário',
                            width: 800,
                            height: 600
                          })}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {usuarios.map(usuario => (
                        <div key={usuario.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{usuario.full_name}</p>
                            <span className="text-xs text-slate-500">{usuario.email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(UsuarioForm, {
                              usuario,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('User', 'usuarios')
                            }, {
                              title: `👥 Editar: ${usuario.full_name}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* DEPARTAMENTOS */}
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🏛️ Departamentos ({departamentos.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(DepartamentoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Departamento', 'departamentos')
                          }, {
                            title: '🏛️ Novo Departamento',
                            width: 700,
                            height: 500
                          })}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!hasPermission('rh', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {departamentos.map(dept => (
                        <div key={dept.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">{dept.nome}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(DepartamentoForm, {
                              departamento: dept,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Departamento', 'departamentos')
                            }, {
                              title: `🏛️ Editar: ${dept.nome}`,
                              width: 700,
                              height: 500
                            })}
                            disabled={!hasPermission('rh', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-green-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* CARGOS */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">💼 Cargos ({cargos.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(CargoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Cargo', 'cargos')
                          }, {
                            title: '💼 Novo Cargo',
                            width: 800,
                            height: 600
                          })}
                          className="bg-cyan-600 hover:bg-cyan-700"
                          disabled={!hasPermission('rh', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {cargos.map(cargo => (
                        <div key={cargo.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">{cargo.nome}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(CargoForm, {
                              cargo,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Cargo', 'cargos')
                            }, {
                              title: `💼 Editar: ${cargo.nome}`,
                              width: 800,
                              height: 600
                            })}
                            disabled={!hasPermission('rh', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-cyan-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* TURNOS */}
                  <Card className="border-amber-200">
                    <CardHeader className="bg-amber-50 border-b border-amber-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          <Clock className="w-4 h-4 inline mr-2 text-amber-600" />
                          Turnos ({turnos.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(TurnoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('Turno', 'turnos')
                          }, {
                            title: '⏰ Novo Turno',
                            width: 800,
                            height: 550
                          })}
                          className="bg-amber-600 hover:bg-amber-700"
                          disabled={!hasPermission('rh', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {turnos.map(turno => (
                        <div key={turno.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm flex-1">{turno.nome}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(TurnoForm, {
                              turno,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Turno', 'turnos')
                            }, {
                              title: `⏰ Editar: ${turno.nome}`,
                              width: 800,
                              height: 550
                            })}
                            disabled={!hasPermission('rh', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-amber-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* PERFIS DE ACESSO */}
                  <Card className="border-red-200">
                    <CardHeader className="bg-red-50 border-b border-red-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          <Shield className="w-4 h-4 inline mr-2 text-red-600" />
                          Perfis de Acesso ({perfisAcesso.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(PerfilAcessoForm, {
                            windowMode: true,
                            onSubmit: handleSubmitGenerico('PerfilAcesso', 'perfis-acesso')
                          }, {
                            title: '🔒 Novo Perfil de Acesso',
                            width: 1000,
                            height: 700
                          })}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Novo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {perfisAcesso.map(perfil => (
                        <div key={perfil.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{perfil.nome_perfil}</p>
                            <Badge className={perfil.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {perfil.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(PerfilAcessoForm, {
                              perfil,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('PerfilAcesso', 'perfis-acesso')
                            }, {
                              title: `🔒 Editar: ${perfil.nome_perfil}`,
                              width: 1000,
                              height: 700
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 6: INTEGRAÇÕES & IA */}
            <AccordionItem value="bloco6" className="border-2 border-cyan-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-6 py-4 hover:from-cyan-100 hover:to-cyan-200">
                <div className="flex items-center gap-3 flex-1">
                  <Cpu className="w-6 h-6 text-cyan-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-cyan-900">6️⃣ Integrações & IA</p>
                    <p className="text-xs text-cyan-700">Marketplaces • Webhooks • Notificações • Chatbot • 28 IAs Ativas</p>
                  </div>
                  <Badge className="ml-auto bg-cyan-600 text-white">{totalBloco6}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                {/* SUB-TABS INTEGRAÇÕES & IA - ETAPA 4 */}
                <Tabs value={abaIntegracoes} onValueChange={setAbaIntegracoes}>
                  <TabsList className="bg-slate-100 mb-6 flex-wrap h-auto">
                    <TabsTrigger value="gerenciamento">
                      <Database className="w-4 h-4 mr-2" />
                      Gerenciamento
                    </TabsTrigger>
                    <TabsTrigger value="status">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Status
                    </TabsTrigger>
                    <TabsTrigger value="notificacoes">
                      <Bell className="w-4 h-4 mr-2" />
                      Notificações
                    </TabsTrigger>
                    <TabsTrigger value="nfe">
                      <FileText className="w-4 h-4 mr-2" />
                      NF-e
                    </TabsTrigger>
                    <TabsTrigger value="boletos">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Boletos/PIX
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </TabsTrigger>
                    <TabsTrigger value="transportadoras">
                      <Truck className="w-4 h-4 mr-2" />
                      Transportadoras
                    </TabsTrigger>
                    <TabsTrigger value="maps">
                      <Globe className="w-4 h-4 mr-2" />
                      Maps
                    </TabsTrigger>
                    <TabsTrigger value="ia">
                      <Zap className="w-4 h-4 mr-2" />
                      IA
                    </TabsTrigger>
                    <TabsTrigger value="marketplaces">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Marketplaces
                    </TabsTrigger>
                  </TabsList>

                  {/* ABA: GERENCIAMENTO - CADASTROS BASE */}
                  <TabsContent value="gerenciamento">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* EVENTOS DE NOTIFICAÇÃO */}
                      <Card className="border-cyan-200">
                        <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">🔔 Eventos de Notificação ({eventosNotificacao.length})</CardTitle>
                            <Button
                              size="sm"
                              onClick={() => openWindow(EventoNotificacaoForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('EventoNotificacao', 'eventos-notificacao')
                              }, {
                                title: '🔔 Novo Evento de Notificação',
                                width: 1000,
                                height: 700
                              })}
                              className="bg-cyan-600 hover:bg-cyan-700"
                              disabled={!hasPermission('cadastros', 'criar')}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Novo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                          {eventosNotificacao.map(evento => (
                            <div key={evento.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{evento.nome_evento}</p>
                                <Badge variant="outline" className="text-xs">{evento.tipo_evento}</Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(EventoNotificacaoForm, {
                                  evento,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('EventoNotificacao', 'eventos-notificacao')
                                }, {
                                  title: `🔔 Editar: ${evento.nome_evento}`,
                                  width: 1000,
                                  height: 700
                                })}
                                disabled={!hasPermission('cadastros', 'editar')}
                              >
                                <Edit className="w-3 h-3 text-cyan-600" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* CONFIGURAÇÕES DE INTEGRAÇÃO */}
                      <Card className="border-purple-200">
                        <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">🛒 Integrações Marketplace ({configsIntegracao.length})</CardTitle>
                            <Button
                              size="sm"
                              onClick={() => openWindow(ConfiguracaoIntegracaoForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ConfiguracaoIntegracaoMarketplace', 'configs-integracao-marketplace')
                              }, {
                                title: '🔗 Nova Configuração de Integração',
                                width: 1100,
                                height: 750
                              })}
                              className="bg-purple-600 hover:bg-purple-700"
                              disabled={!hasPermission('cadastros', 'criar')}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Nova
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                          {configsIntegracao.map(config => (
                            <div key={config.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{config.marketplace}</p>
                                <Badge className={config.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {config.ativo ? 'Ativa' : 'Inativa'}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(ConfiguracaoIntegracaoForm, {
                                  config,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('ConfiguracaoIntegracaoMarketplace', 'configs-integracao-marketplace')
                                }, {
                                  title: `🔗 Editar: ${config.marketplace}`,
                                  width: 1100,
                                  height: 750
                                })}
                                disabled={!hasPermission('cadastros', 'editar')}
                              >
                                <Edit className="w-3 h-3 text-purple-600" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* WEBHOOKS */}
                      <Card className="border-indigo-200">
                        <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">🔗 Webhooks ({webhooks.length})</CardTitle>
                            <Button size="sm" onClick={() => openWindow(WebhookForm, {
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('Webhook', 'webhooks')
                            }, { title: '🔗 Novo Webhook', width: 900, height: 600 })}
                              className="bg-indigo-600 hover:bg-indigo-700"
                              disabled={!hasPermission('cadastros', 'criar')}>
                              <Plus className="w-4 h-4 mr-1" />Novo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                          {webhooks.map(wh => (
                            <div key={wh.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{wh.nome_webhook}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(WebhookForm, {
                                  webhook: wh,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('Webhook', 'webhooks')
                                }, {
                                  title: `🔗 Editar: ${wh.nome_webhook}`,
                                  width: 900,
                                  height: 600
                                })}
                                disabled={!hasPermission('cadastros', 'editar')}
                              >
                                <Edit className="w-3 h-3 text-indigo-600" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* CHATBOT INTENTS */}
                      <Card className="border-purple-200">
                        <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">💬 Intents ({chatbotIntents.length})</CardTitle>
                            <Button size="sm" onClick={() => openWindow(ChatbotIntentForm, {
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('ChatbotIntent', 'chatbotIntents')
                            }, { title: '💬 Nova Intent', width: 900, height: 650 })}
                              className="bg-purple-600 hover:bg-purple-700"
                              disabled={!hasPermission('cadastros', 'criar')}>
                              <Plus className="w-4 h-4 mr-1" />Nova
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                          {chatbotIntents.map(intent => (
                            <div key={intent.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{intent.nome_intent}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(ChatbotIntentForm, {
                                  chatbotIntent: intent,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('ChatbotIntent', 'chatbotIntents')
                                }, {
                                  title: `💬 Editar: ${intent.nome_intent}`,
                                  width: 900,
                                  height: 650
                                })}
                                disabled={!hasPermission('cadastros', 'editar')}
                              >
                                <Edit className="w-3 h-3 text-purple-600" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* CHATBOT CANAIS */}
                      <Card className="border-green-200">
                        <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">📱 Canais ({chatbotCanais.length})</CardTitle>
                            <Button size="sm" onClick={() => openWindow(ChatbotCanalForm, {
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('ChatbotCanal', 'chatbotCanais')
                            }, { title: '📱 Novo Canal', width: 800, height: 550 })}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={!hasPermission('cadastros', 'criar')}>
                              <Plus className="w-4 h-4 mr-1" />Novo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                          {chatbotCanais.map(canal => (
                            <div key={canal.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{canal.nome_canal}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(ChatbotCanalForm, {
                                  chatbotCanal: canal,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('ChatbotCanal', 'chatbotCanais')
                                }, {
                                  title: `📱 Editar: ${canal.nome_canal}`,
                                  width: 800,
                                  height: 550
                                })}
                                disabled={!hasPermission('cadastros', 'editar')}
                              >
                                <Edit className="w-3 h-3 text-green-600" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* APIS EXTERNAS */}
                      <Card className="border-blue-200">
                        <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">🔌 APIs ({apisExternas.length})</CardTitle>
                            <Button size="sm" onClick={() => openWindow(ApiExternaForm, {
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('ApiExterna', 'apis-externas')
                            }, { title: '🔌 Nova API', width: 900, height: 700 })}
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={!hasPermission('cadastros', 'criar')}>
                              <Plus className="w-4 h-4 mr-1" />Nova
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                          {apisExternas.map(api => (
                            <div key={api.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{api.nome_integracao}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(ApiExternaForm, {
                                  apiExterna: api,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('ApiExterna', 'apis-externas')
                                }, {
                                  title: `🔌 Editar: ${api.nome_integracao}`,
                                  width: 900,
                                  height: 700
                                })}
                                disabled={!hasPermission('cadastros', 'editar')}
                              >
                                <Edit className="w-3 h-3 text-blue-600" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* JOBS AGENDADOS */}
                      <Card className="border-amber-200">
                        <CardHeader className="bg-amber-50 border-b border-amber-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">⏰ Jobs IA ({jobsAgendados.length})</CardTitle>
                            <Button size="sm" onClick={() => openWindow(JobAgendadoForm, {
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('JobAgendado', 'jobs-agendados')
                            }, { title: '⏰ Novo Job', width: 900, height: 650 })}
                              className="bg-amber-600 hover:bg-amber-700"
                              disabled={!hasPermission('cadastros', 'criar')}>
                              <Plus className="w-4 h-4 mr-1" />Novo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-60 overflow-y-auto">
                          {jobsAgendados.map(job => (
                            <div key={job.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{job.nome_job}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(JobAgendadoForm, {
                                  jobAgendado: job,
                                  windowMode: true,
                                  onSubmit: handleSubmitGenerico('JobAgendado', 'jobs-agendados')
                                }, {
                                  title: `⏰ Editar: ${job.nome_job}`,
                                  width: 900,
                                  height: 650
                                })}
                                disabled={!hasPermission('cadastros', 'editar')}
                              >
                                <Edit className="w-3 h-3 text-amber-600" />
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    {/* SEÇÃO: PARÂMETROS OPERACIONAIS - FASE 3 */}
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-purple-600" />
                        Parâmetros Operacionais por Empresa
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* PARÂMETRO PORTAL CLIENTE */}
                        <Card className="border-blue-200">
                          <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">🌐 Portal Cliente ({parametrosPortal.length})</CardTitle>
                              <Button size="sm" onClick={() => openWindow(ParametroPortalClienteForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ParametroPortalCliente', 'parametros-portal')
                              }, { title: '🌐 Novo Parâmetro Portal', width: 900, height: 650 })}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={!hasPermission('cadastros', 'criar')}>
                                <Plus className="w-4 h-4 mr-1" />Novo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 max-h-60 overflow-y-auto">
                            {parametrosPortal.map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                                <p className="font-semibold text-sm flex-1">Portal Config</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWindow(ParametroPortalClienteForm, {
                                    parametro: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroPortalCliente', 'parametros-portal')
                                  }, { title: '🌐 Editar Parâmetro Portal', width: 900, height: 650 })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-blue-600" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* PARÂMETRO ORIGEM PEDIDO */}
                        <Card className="border-purple-200">
                          <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">🛒 Origem Pedido ({parametrosOrigemPedido.length})</CardTitle>
                              <Button size="sm" onClick={() => openWindow(ParametroOrigemPedidoForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ParametroOrigemPedido', 'parametros-origem-pedido')
                              }, { title: '🛒 Novo Parâmetro Origem', width: 800, height: 600 })}
                                className="bg-purple-600 hover:bg-purple-700"
                                disabled={!hasPermission('cadastros', 'criar')}>
                                <Plus className="w-4 h-4 mr-1" />Novo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 max-h-60 overflow-y-auto">
                            {parametrosOrigemPedido.map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                                <p className="font-semibold text-sm flex-1">{p.origem}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWindow(ParametroOrigemPedidoForm, {
                                    parametro: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroOrigemPedido', 'parametros-origem-pedido')
                                  }, { title: `🛒 Editar: ${p.origem}`, width: 800, height: 600 })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-purple-600" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* PARÂMETRO RECEBIMENTO NFE */}
                        <Card className="border-green-200">
                          <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">📄 Recebimento NF-e ({parametrosRecebimentoNFe.length})</CardTitle>
                              <Button size="sm" onClick={() => openWindow(ParametroRecebimentoNFeForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ParametroRecebimentoNFe', 'parametros-recebimento-nfe')
                              }, { title: '📄 Novo Parâmetro NFe', width: 900, height: 650 })}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={!hasPermission('cadastros', 'criar')}>
                                <Plus className="w-4 h-4 mr-1" />Novo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 max-h-60 overflow-y-auto">
                            {parametrosRecebimentoNFe.map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                                <p className="font-semibold text-sm flex-1">NF-e Config</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWindow(ParametroRecebimentoNFeForm, {
                                    parametro: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroRecebimentoNFe', 'parametros-recebimento-nfe')
                                  }, { title: '📄 Editar Parâmetro NFe', width: 900, height: 650 })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-green-600" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* PARÂMETRO ROTEIRIZAÇÃO */}
                        <Card className="border-orange-200">
                          <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">🗺️ Roteirização ({parametrosRoteirizacao.length})</CardTitle>
                              <Button size="sm" onClick={() => openWindow(ParametroRoteirizacaoForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ParametroRoteirizacao', 'parametros-roteirizacao')
                              }, { title: '🗺️ Novo Parâmetro Rotas', width: 800, height: 600 })}
                                className="bg-orange-600 hover:bg-orange-700"
                                disabled={!hasPermission('cadastros', 'criar')}>
                                <Plus className="w-4 h-4 mr-1" />Novo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 max-h-60 overflow-y-auto">
                            {parametrosRoteirizacao.map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                                <p className="font-semibold text-sm flex-1">Roteirização Config</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWindow(ParametroRoteirizacaoForm, {
                                    parametro: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroRoteirizacao', 'parametros-roteirizacao')
                                  }, { title: '🗺️ Editar Parâmetro Rotas', width: 800, height: 600 })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-orange-600" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* PARÂMETRO CONCILIAÇÃO */}
                        <Card className="border-cyan-200">
                          <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">🏦 Conciliação ({parametrosConciliacao.length})</CardTitle>
                              <Button size="sm" onClick={() => openWindow(ParametroConciliacaoBancariaForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ParametroConciliacaoBancaria', 'parametros-conciliacao')
                              }, { title: '🏦 Novo Parâmetro Conciliação', width: 900, height: 650 })}
                                className="bg-cyan-600 hover:bg-cyan-700"
                                disabled={!hasPermission('cadastros', 'criar')}>
                                <Plus className="w-4 h-4 mr-1" />Novo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 max-h-60 overflow-y-auto">
                            {parametrosConciliacao.map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                                <p className="font-semibold text-sm flex-1">Conciliação Config</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWindow(ParametroConciliacaoBancariaForm, {
                                    parametro: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroConciliacaoBancaria', 'parametros-conciliacao')
                                  }, { title: '🏦 Editar Parâmetro Conciliação', width: 900, height: 650 })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-cyan-600" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* PARÂMETRO CAIXA DIÁRIO */}
                        <Card className="border-emerald-200">
                          <CardHeader className="bg-emerald-50 border-b border-emerald-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">💰 Caixa Diário ({parametrosCaixa.length})</CardTitle>
                              <Button size="sm" onClick={() => openWindow(ParametroCaixaDiarioForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ParametroCaixaDiario', 'parametros-caixa')
                              }, { title: '💰 Novo Parâmetro Caixa', width: 800, height: 600 })}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={!hasPermission('cadastros', 'criar')}>
                                <Plus className="w-4 h-4 mr-1" />Novo
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 max-h-60 overflow-y-auto">
                            {parametrosCaixa.map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                                <p className="font-semibold text-sm flex-1">Caixa Config</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWindow(ParametroCaixaDiarioForm, {
                                    parametro: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroCaixaDiario', 'parametros-caixa')
                                  }, { title: '💰 Editar Parâmetro Caixa', width: 800, height: 600 })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-emerald-600" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ABA: STATUS INTEGRAÇÕES */}
                  <TabsContent value="status">
                    <StatusIntegracoes empresaId={empresaAtual?.id} />
                  </TabsContent>

                  {/* ABA: NOTIFICAÇÕES */}
                  <TabsContent value="notificacoes">
                    <ConfiguracaoNotificacoes empresaId={empresaAtual?.id} />
                  </TabsContent>

                  {/* ABA: NF-e */}
                  <TabsContent value="nfe">
                    <TesteNFe configuracao={configuracao} />
                  </TabsContent>

                  {/* ABA: BOLETOS/PIX */}
                  <TabsContent value="boletos">
                    <TesteBoletos configuracao={configuracao} />
                  </TabsContent>

                  {/* ABA: WHATSAPP */}
                  <TabsContent value="whatsapp">
                    <ConfigWhatsAppBusiness empresaId={empresaAtual?.id} />
                  </TabsContent>

                  {/* ABA: TRANSPORTADORAS */}
                  <TabsContent value="transportadoras">
                    <TesteTransportadoras configuracao={configuracao} />
                  </TabsContent>

                  {/* ABA: GOOGLE MAPS */}
                  <TabsContent value="maps">
                    <TesteGoogleMaps configuracao={configuracao} />
                  </TabsContent>

                  {/* ABA: IA E AUTOMAÇÕES */}
                  <TabsContent value="ia">
                    <IALeituraProjeto configuracao={configuracao} />
                  </TabsContent>

                  {/* ABA: MARKETPLACES */}
                  <TabsContent value="marketplaces">
                    <SincronizacaoMarketplacesAtiva />
                  </TabsContent>
                </Tabs>

                <Alert className="mt-6 border-purple-300 bg-gradient-to-r from-purple-50 to-cyan-50">
                  <Stars className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-sm text-purple-900">
                    <strong>28 IAs Ativas:</strong> PriceBrain 3.0 • ChurnDetection • ProductClassifier • FiscalValidator •
                    LeadScoring • RouteOptimizer • QualityPredictor • StockRecommender • e mais 20 IAs rodando 24/7
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* FOOTER - PRINCÍPIOS DA FASE 0 */}
          <Card className="border-2 border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Database className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Fonte Única de Verdade</p>
                    <p className="text-xs text-slate-600">Sem duplicação • Referências integradas</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Controle de Acesso Granular</p>
                    <p className="text-xs text-slate-600">Perfis • Permissões • Auditoria</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Global Audit Log</p>
                    <p className="text-xs text-slate-600">Todas alterações rastreadas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: FONTE ÚNICA DE VERDADE */}
        <TabsContent value="fonte-unica" className="mt-6">
          <FonteUnicaVerdade />
        </TabsContent>

        {/* ABA: CONTROLE DE ACESSO */}
        <TabsContent value="acesso" className="mt-6">
          <DashboardControleAcesso />
        </TabsContent>

        {/* ABA: AUDIT LOG */}
        <TabsContent value="auditoria" className="mt-6">
          <GlobalAuditLog limite={50} mostrarFiltros={true} />
        </TabsContent>
      </Tabs>

      {/* ==================== FASE 1 DEFINITIVO-100% ==================== */}
      {/* TODOS OS FORMULÁRIOS AGORA ABREM EM JANELAS REDIMENSIONÁVEIS */}
      {/* ZERO DIALOGS - TUDO É WINDOW MODE */}
    </div>
  );
}