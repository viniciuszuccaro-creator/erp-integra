import React, { useState, useEffect, Suspense } from "react";
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
  Calendar,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchInput from "@/components/ui/SearchInput";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CadastroClienteCompleto from "../components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "../components/cadastros/CadastroFornecedorCompleto";
import TabelaPrecoFormCompleto from "../components/cadastros/TabelaPrecoFormCompleto";
import ProdutoFormV22_Completo from "../components/cadastros/ProdutoFormV22_Completo";
import BotoesImportacaoProduto from "../components/cadastros/BotoesImportacaoProduto";
import SetorAtividadeForm from "../components/cadastros/SetorAtividadeForm";


import usePermissions from "../components/lib/usePermissions";
import TransportadoraForm from "../components/cadastros/TransportadoraForm";
import { useWindow } from "../components/lib/useWindow";
import ColaboradorForm from "../components/rh/ColaboradorForm";
import GerenciadorJanelas from "../components/sistema/GerenciadorJanelas";
import BancoForm from "../components/cadastros/BancoForm";
import FormaPagamentoForm from "../components/cadastros/FormaPagamentoForm";
import FormaPagamentoFormCompleto from "../components/cadastros/FormaPagamentoFormCompleto";
import GestorFormasPagamento from "../components/cadastros/GestorFormasPagamento";
import GestorGatewaysPagamento from "../components/cadastros/GestorGatewaysPagamento";
import GestorDespesasRecorrentes from "../components/cadastros/GestorDespesasRecorrentes";
import VeiculoForm from "../components/cadastros/VeiculoForm";
import MotoristaForm from "../components/cadastros/MotoristaForm";
import TipoFreteForm from "../components/cadastros/TipoFreteForm";
import EmpresaForm from "../components/cadastros/EmpresaForm";
import GrupoEmpresarialForm from "../components/cadastros/GrupoEmpresarialForm";
import DepartamentoForm from "../components/cadastros/DepartamentoForm";
import CargoForm from "../components/cadastros/CargoForm";
import TurnoForm from "../components/cadastros/TurnoForm";


import CentroCustoForm from "../components/cadastros/CentroCustoForm";
import GrupoProdutoForm from "../components/cadastros/GrupoProdutoForm";
import MarcaForm from "../components/cadastros/MarcaForm";
import ServicoForm from "../components/cadastros/ServicoForm";
import RepresentanteForm from "../components/cadastros/RepresentanteForm";
import RepresentantesTab from "../components/cadastros/RepresentantesTab";
import RepresentanteFormCompleto from "../components/cadastros/RepresentanteFormCompleto";
import DashboardRepresentantes from "../components/relatorios/DashboardRepresentantes";
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
import OperadorCaixaForm from "../components/cadastros/OperadorCaixaForm";
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
import RegiaoAtendimentoForm from "../components/cadastros/RegiaoAtendimentoForm";
import StatusIntegracoes from '../components/integracoes/StatusIntegracoes';
import ConfiguracaoNotificacoes from '../components/sistema/ConfiguracaoNotificacoes';
import VisualizadorUniversalEntidade from '../components/cadastros/VisualizadorUniversalEntidade';
import VisualizadorProdutos from '../components/cadastros/VisualizadorProdutos';
import Bloco1Pessoas from "@/components/cadastros/blocks/Bloco1Pessoas.jsx";
import Bloco2Produtos from "@/components/cadastros/blocks/Bloco2Produtos.jsx";
import Bloco3Financeiro from "@/components/cadastros/blocks/Bloco3Financeiro.jsx";
import Bloco4Logistica from "@/components/cadastros/blocks/Bloco4Logistica.jsx";
import Bloco5Organizacional from "@/components/cadastros/blocks/Bloco5Organizacional.jsx";
import Bloco6Tecnologia from "@/components/cadastros/blocks/Bloco6Tecnologia.jsx";
import TesteNFe from "../components/integracoes/TesteNFe";
import TesteBoletos from "../components/integracoes/TesteBoletos";
import ConfigWhatsAppBusiness from '@/components/integracoes/ConfigWhatsAppBusiness';
import TesteTransportadoras from "../components/integracoes/TesteTransportadoras";
import TesteGoogleMaps from "../components/integracoes/TesteGoogleMaps";
import IALeituraProjeto from "../components/integracoes/IALeituraProjeto";
import SincronizacaoMarketplacesAtiva from '@/components/integracoes/SincronizacaoMarketplacesAtiva';
import ConfigGlobal from "@/components/sistema/ConfigGlobal";
import AppEntregasMotorista from "@/components/mobile/AppEntregasMotorista";
import ChatbotDashboard from "@/components/chatbot/ChatbotDashboard";
import DashboardCliente from "@/components/portal/DashboardCliente";
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
  const [acordeonAberto, setAcordeonAberto] = useState(['bloco1', 'bloco2', 'bloco3', 'bloco4', 'bloco5', 'bloco6']);
  const [abaGerenciamento, setAbaGerenciamento] = useState("cadastros");
  const [abaIntegracoes, setAbaIntegracoes] = useState("gerenciamento");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let t = params.get('tab');
    let s = params.get('sub');
    if (!t) { try { t = localStorage.getItem('Cadastros_tab'); } catch {} }
    if (!s) { try { s = localStorage.getItem('Cadastros_subtab'); } catch {} }
    if (t) setAbaGerenciamento(t);
    if (s) setAbaIntegracoes(s);
  }, []);
  const handleAbaChange = (value) => {
    setAbaGerenciamento(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Cadastros_tab', value); } catch {}
  };
  const handleSubChange = (value) => {
    setAbaIntegracoes(value);
    const url = new URL(window.location.href);
    url.searchParams.set('sub', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Cadastros_subtab', value); } catch {}
  };
  const { empresaAtual, filterInContext, createInContext, updateInContext, getFiltroContexto, estaNoGrupo } = useContextoVisual();
  const bloqueadoSemEmpresa = !estaNoGrupo && !empresaAtual;

  // Seleções em massa (Clientes, Fornecedores, Produtos)

 

  // FASE 1 DEFINITIVO-100%: ZERO estados de dialog - TUDO é window

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();
  const { openWindow } = useWindow();


 

  // QUERIES - BLOCO 1: PESSOAS & PARCEIROS
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filterInContext('Cliente', {}, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !bloqueadoSemEmpresa
  });

  // V22.0: Contagem total otimizada para grandes volumes
  const { data: totalClientes = 0 } = useQuery({
    queryKey: ['clientes-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: getFiltroContexto('empresa_id')
        });
        return response.data?.count || clientes.length;
      } catch {
        return clientes.length;
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filterInContext('Fornecedor', {}, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: totalFornecedores = 0 } = useQuery({
    queryKey: ['fornecedores-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Fornecedor',
          filter: getFiltroContexto('empresa_dona_id')
        });
        return response.data?.count || fornecedores.length;
      } catch {
        return fornecedores.length;
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: transportadoras = [] } = useQuery({
    queryKey: ['transportadoras', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filterInContext('Transportadora', {}, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar transportadoras:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filterInContext('Colaborador', {}, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar colaboradores:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: representantes = [] } = useQuery({
    queryKey: ['representantes', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filterInContext('Representante', {}, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar representantes:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !bloqueadoSemEmpresa
  });

  const { data: contatosB2B = [] } = useQuery({
    queryKey: ['contatos-b2b', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filterInContext('ContatoB2B', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar contatos B2B:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !bloqueadoSemEmpresa
  });

  // QUERIES - BLOCO 2: PRODUTOS & SERVIÇOS
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await filterInContext('Produto', {}, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: totalProdutos = 0 } = useQuery({
    queryKey: ['produtos-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : {};
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Produto',
          filter: filtro
        });
        return response.data?.count || produtos.length;
      } catch {
        return produtos.length;
      }
    },
    staleTime: 60000,
    retry: 1
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: async () => {
      try {
        return await filterInContext('Servico', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar serviços:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: setoresAtividade = [] } = useQuery({
    queryKey: ['setores-atividade'],
    queryFn: async () => {
      try {
        return await filterInContext('SetorAtividade', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar setores:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: gruposProduto = [] } = useQuery({
    queryKey: ['grupos-produto'],
    queryFn: async () => {
      try {
        return await filterInContext('GrupoProduto', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar grupos de produto:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas'],
    queryFn: async () => {
      try {
        return await filterInContext('Marca', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar marcas:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: async () => {
      try {
        return await filterInContext('TabelaPreco', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar tabelas de preço:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: catalogoWeb = [] } = useQuery({
    queryKey: ['catalogo-web'],
    queryFn: async () => {
      try {
        return await filterInContext('CatalogoWeb', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar catálogo web:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: kits = [] } = useQuery({
    queryKey: ['kits-produto'],
    queryFn: async () => {
      try {
        return await filterInContext('KitProduto', {}, '-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar kits:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // QUERIES - BLOCO 3: FINANCEIRO
  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => filterInContext('Banco', {}, '-created_date', 9999),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => filterInContext('FormaPagamento', {}, '-created_date', 9999),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: operadoresCaixa = [] } = useQuery({
    queryKey: ['operadores-caixa'],
    queryFn: () => filterInContext('OperadorCaixa', {}, '-created_date', 9999),
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: () => filterInContext('PlanoDeContas', {}, '-created_date', 9999),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => filterInContext('CentroCusto', {}, '-created_date', 9999),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: centrosResultado = [] } = useQuery({
    queryKey: ['centros-resultado'],
    queryFn: () => filterInContext('CentroResultado', {}, '-created_date', 9999),
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: () => filterInContext('TipoDespesa', {}, '-created_date', 9999),
  });

  const { data: moedasIndices = [] } = useQuery({
    queryKey: ['moedas-indices'],
    queryFn: () => filterInContext('MoedaIndice', {}, '-created_date', 9999),
  });

  const { data: condicoesComerciais = [] } = useQuery({
    queryKey: ['condicoes-comerciais'],
    queryFn: () => filterInContext('CondicaoComercial', {}, '-created_date', 9999),
  });

  // FASE 3: Queries adicionais
  const { data: segmentosCliente = [] } = useQuery({
    queryKey: ['segmentos-cliente'],
    queryFn: () => filterInContext('SegmentoCliente', {}, '-created_date', 9999),
  });

  const { data: regioesAtendimento = [] } = useQuery({
    queryKey: ['regioes-atendimento'],
    queryFn: () => filterInContext('RegiaoAtendimento', {}, '-created_date', 9999),
  });

  const { data: unidadesMedida = [] } = useQuery({
    queryKey: ['unidades-medida'],
    queryFn: () => filterInContext('UnidadeMedida', {}, '-created_date', 9999),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => filterInContext('Webhook', {}, '-created_date', 9999),
  });

  const { data: rotasPadrao = [] } = useQuery({
    queryKey: ['rotas-padrao'],
    queryFn: () => filterInContext('RotaPadrao', {}, '-created_date', 9999),
  });

  const { data: modelosDocumento = [] } = useQuery({
    queryKey: ['modelos-documento'],
    queryFn: () => filterInContext('ModeloDocumento', {}, '-created_date', 9999),
  });

  const { data: apisExternas = [] } = useQuery({
    queryKey: ['apis-externas'],
    queryFn: () => filterInContext('ApiExterna', {}, '-created_date', 9999),
  });

  const { data: jobsAgendados = [] } = useQuery({
    queryKey: ['jobs-agendados'],
    queryFn: () => filterInContext('JobAgendado', {}, '-created_date', 9999),
  });

  const { data: configsIA = [] } = useQuery({
    queryKey: ['configs-ia'],
    queryFn: () => filterInContext('IAConfig', {}, '-created_date', 9999),
  });

  // PARÂMETROS OPERACIONAIS - FASE 3
  const { data: parametrosPortal = [] } = useQuery({
    queryKey: ['parametros-portal'],
    queryFn: () => filterInContext('ParametroPortalCliente', {}, '-created_date', 9999),
  });

  const { data: parametrosOrigemPedido = [] } = useQuery({
    queryKey: ['parametros-origem-pedido'],
    queryFn: () => filterInContext('ParametroOrigemPedido', {}, '-created_date', 9999),
  });

  const { data: parametrosRecebimentoNFe = [] } = useQuery({
    queryKey: ['parametros-recebimento-nfe'],
    queryFn: () => filterInContext('ParametroRecebimentoNFe', {}, '-created_date', 9999),
  });

  const { data: parametrosRoteirizacao = [] } = useQuery({
    queryKey: ['parametros-roteirizacao'],
    queryFn: () => filterInContext('ParametroRoteirizacao', {}, '-created_date', 9999),
  });

  const { data: parametrosConciliacao = [] } = useQuery({
    queryKey: ['parametros-conciliacao'],
    queryFn: () => filterInContext('ParametroConciliacaoBancaria', {}, '-created_date', 9999),
  });

  const { data: parametrosCaixa = [] } = useQuery({
    queryKey: ['parametros-caixa'],
    queryFn: () => filterInContext('ParametroCaixaDiario', {}, '-created_date', 9999),
  });

  // QUERIES - BLOCO 4: LOGÍSTICA
  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => filterInContext('Veiculo', {}, '-created_date', 9999),
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => filterInContext('Motorista', {}, '-created_date', 9999),
  });

  const { data: tiposFrete = [] } = useQuery({
    queryKey: ['tipos-frete'],
    queryFn: () => filterInContext('TipoFrete', {}, '-created_date', 9999),
  });

  const { data: chatbotIntents = [] } = useQuery({
    queryKey: ['chatbotIntents'],
    queryFn: () => filterInContext('ChatbotIntent', {}, '-created_date', 9999),
  });

  const { data: chatbotCanais = [] } = useQuery({
    queryKey: ['chatbotCanais'],
    queryFn: () => filterInContext('ChatbotCanal', {}, '-created_date', 9999),
  });

  // QUERIES - BLOCO 5: ORGANIZACIONAL
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas', empresaAtual?.id],
    queryFn: () => filterInContext('Empresa', {}, '-created_date', 9999),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos', empresaAtual?.id],
    queryFn: () => filterInContext('GrupoEmpresarial', {}, '-created_date', 9999),
  });

  const { data: departamentos = [] } = useQuery({
    queryKey: ['departamentos', empresaAtual?.id],
    queryFn: () => filterInContext('Departamento', {}, '-created_date', 9999),
  });

  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos', empresaAtual?.id],
    queryFn: () => filterInContext('Cargo', {}, '-created_date', 9999),
  });

  const { data: turnos = [] } = useQuery({
    queryKey: ['turnos', empresaAtual?.id],
    queryFn: () => filterInContext('Turno', {}, '-created_date', 9999),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list('-created_date', 9999),
  });

  const { data: perfisAcesso = [] } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list('-created_date', 9999),
  });

  // QUERIES - BLOCO 6: INTEGRAÇÕES & IA
  const { data: eventosNotificacao = [] } = useQuery({
    queryKey: ['eventos-notificacao'],
    queryFn: () => base44.entities.EventoNotificacao.list('-created_date', 9999),
  });

  const { data: configsIntegracao = [] } = useQuery({
    queryKey: ['configs-integracao-marketplace'],
    queryFn: () => base44.entities.ConfiguracaoIntegracaoMarketplace.list('-created_date', 9999),
  });

  // FASE 2: Novos cadastros
  const { data: locaisEstoque = [] } = useQuery({
    queryKey: ['locais-estoque'],
    queryFn: () => base44.entities.LocalEstoque.list('-created_date', 9999),
  });

  const { data: tabelasFiscais = [] } = useQuery({
    queryKey: ['tabelas-fiscais'],
    queryFn: () => base44.entities.TabelaFiscal.list('-created_date', 9999),
  });

  const { data: configuracao } = useQuery({
    queryKey: ['configuracaoSistema'],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSistema.list();
      return configs[0] || null;
    },
  });

  // V22.0: Cálculo de totais por bloco com contagens otimizadas
  const totalBloco1 = totalClientes + totalFornecedores + transportadoras.length + colaboradores.length + representantes.length + contatosB2B.length + segmentosCliente.length + regioesAtendimento.length;
  const totalBloco2 = totalProdutos + servicos.length + setoresAtividade.length + gruposProduto.length + marcas.length + tabelasPreco.length + catalogoWeb.length + kits.length + unidadesMedida.length;
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
    if (data?._salvamentoCompleto) return;
    try {
      if (data.id) {
        await updateInContext(entityName, data.id, data);
        toast({ title: `✅ ${entityName} atualizado com sucesso!` });
      } else {
        await createInContext(entityName, data);
        toast({ title: `✅ ${entityName} criado com sucesso!` });
      }
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (error) {
      toast({ title: `❌ Erro ao salvar ${entityName}`, description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="h-full min-h-screen w-full p-6 lg:p-8 space-y-6 overflow-auto">
      {/* GERENCIADOR DE JANELAS ABERTAS */}
      <GerenciadorJanelas />

      {/* TABS: CADASTROS vs GERENCIAMENTO */}
      <Tabs value={abaGerenciamento} onValueChange={handleAbaChange}>
        <TabsList className="grid w-full grid-cols-1 bg-slate-100">
          <TabsTrigger value="cadastros">
            <Database className="w-4 h-4 mr-2" />
            Cadastros
          </TabsTrigger>
        </TabsList>

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

          {/* ✅ V22.0 ETAPA 5 e 6: BUSCA UNIVERSAL LIMPA */}
          <SearchInput
            placeholder="🔍 Busca Universal - Digite para filtrar em todos os 6 blocos simultaneamente..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            className="h-12 text-base shadow-md border-slate-300"
          />

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
                <Bloco1Pessoas />
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
                <Bloco2Produtos />
              </AccordionContent>
                </AccordionItem>

            {/* BLOCO 3: FINANCEIRO */}
            <AccordionItem value="bloco3" className="border-2 border-green-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 hover:from-green-100 hover:to-green-200">
                <div className="flex items-center gap-3 flex-1">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-green-900">3️⃣ Financeiro & Fiscal</p>
                  </div>
                  <Badge className="ml-auto bg-green-600 text-white">{totalBloco3}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco3Financeiro />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 4: LOGÍSTICA, FROTA & ALMOXARIFADO */}
            <AccordionItem value="bloco4" className="border-2 border-orange-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 hover:from-orange-100 hover:to-orange-200">
                <div className="flex items-center gap-3 flex-1">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-orange-900">4️⃣ Logística, Frota & Almoxarifado</p>
                  </div>
                  <Badge className="ml-auto bg-orange-600 text-white">{totalBloco4}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco4Logistica />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 5: ESTRUTURA ORGANIZACIONAL */}
            <AccordionItem value="bloco5" className="border-2 border-indigo-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 hover:from-indigo-100 hover:to-indigo-200">
                <div className="flex items-center gap-3 flex-1">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-indigo-900">5️⃣ Estrutura Organizacional</p>
                  </div>
                  <Badge className="ml-auto bg-indigo-600 text-white">{totalBloco5}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco5Organizacional />
              </AccordionContent>
            </AccordionItem>

            {/* BLOCO 6: TECNOLOGIA, IA & PARÂMETROS */}
            <AccordionItem value="bloco6" className="border-2 border-cyan-200 rounded-lg overflow-hidden shadow-md">
              <AccordionTrigger className="bg-gradient-to-r from-cyan-50 to-cyan-100 px-6 py-4 hover:from-cyan-100 hover:to-cyan-200">
                <div className="flex items-center gap-3 flex-1">
                  <Cpu className="w-6 h-6 text-cyan-600" />
                  <div className="text-left">
                    <p className="font-bold text-lg text-cyan-900">6️⃣ Tecnologia, IA & Parâmetros</p>
                  </div>
                  <Badge className="ml-auto bg-cyan-600 text-white">{totalBloco6}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <Bloco6Tecnologia />
              </AccordionContent>
            </AccordionItem>

              </Accordion>



                <Alert className="mt-6 border-purple-300 bg-gradient-to-r from-purple-50 to-cyan-50">
                  <Stars className="w-4 h-4 text-purple-600" />
                  <AlertDescription className="text-sm text-purple-900">
                    <strong>28 IAs Ativas:</strong> PriceBrain 3.0 • ChurnDetection • ProductClassifier • FiscalValidator •
                    LeadScoring • RouteOptimizer • QualityPredictor • StockRecommender • e mais 20 IAs rodando 24/7
                  </AlertDescription>
                </Alert>

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
      </Tabs>

      {/* ==================== FASE 1 DEFINITIVO-100% ==================== */}
      {/* TODOS OS FORMULÁRIOS AGORA ABREM EM JANELAS REDIMENSIONÁVEIS */}
      {/* ZERO DIALOGS - TUDO É WINDOW MODE */}
    </div>
  );
}