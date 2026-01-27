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
  const { empresaAtual, filterInContext, createInContext, updateInContext } = useContextoVisual();

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
        return await base44.entities.Cliente.list('-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  // V22.0: Contagem total otimizada para grandes volumes
  const { data: totalClientes = 0 } = useQuery({
    queryKey: ['clientes-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Cliente',
          filter: {}
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
        return await base44.entities.Fornecedor.list('-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  const { data: totalFornecedores = 0 } = useQuery({
    queryKey: ['fornecedores-count', empresaAtual?.id],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('countEntities', {
          entityName: 'Fornecedor',
          filter: {}
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
    retry: 1
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await base44.entities.Colaborador.list('-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar colaboradores:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: representantes = [] } = useQuery({
    queryKey: ['representantes', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await base44.entities.Representante.list('-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar representantes:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { data: contatosB2B = [] } = useQuery({
    queryKey: ['contatos-b2b', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await base44.entities.ContatoB2B.list('-created_date', 9999);
      } catch (err) {
        console.error('Erro ao buscar contatos B2B:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  // QUERIES - BLOCO 2: PRODUTOS & SERVIÇOS
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id],
    queryFn: async () => {
      try {
        return await base44.entities.Produto.list('-created_date', 100);
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
        return await base44.entities.Servico.list('-created_date', 9999);
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
        return await base44.entities.SetorAtividade.list('-created_date', 9999);
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
        return await base44.entities.GrupoProduto.list('-created_date', 9999);
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
        return await base44.entities.Marca.list('-created_date', 9999);
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
        return await base44.entities.TabelaPreco.list('-created_date', 9999);
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
        return await base44.entities.CatalogoWeb.list('-created_date', 9999);
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
        return await base44.entities.KitProduto.list('-created_date', 9999);
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
    queryFn: () => base44.entities.Banco.list('-created_date', 9999),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list('-created_date', 9999),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: operadoresCaixa = [] } = useQuery({
    queryKey: ['operadores-caixa'],
    queryFn: () => base44.entities.OperadorCaixa.list('-created_date', 9999),
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: () => base44.entities.PlanoDeContas.list('-created_date', 9999),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => base44.entities.CentroCusto.list('-created_date', 9999),
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: centrosResultado = [] } = useQuery({
    queryKey: ['centros-resultado'],
    queryFn: () => base44.entities.CentroResultado.list('-created_date', 9999),
  });

  const { data: tiposDespesa = [] } = useQuery({
    queryKey: ['tipos-despesa'],
    queryFn: () => base44.entities.TipoDespesa.list('-created_date', 9999),
  });

  const { data: moedasIndices = [] } = useQuery({
    queryKey: ['moedas-indices'],
    queryFn: () => base44.entities.MoedaIndice.list('-created_date', 9999),
  });

  const { data: condicoesComerciais = [] } = useQuery({
    queryKey: ['condicoes-comerciais'],
    queryFn: () => base44.entities.CondicaoComercial.list('-created_date', 9999),
  });

  // FASE 3: Queries adicionais
  const { data: segmentosCliente = [] } = useQuery({
    queryKey: ['segmentos-cliente'],
    queryFn: () => base44.entities.SegmentoCliente.list('-created_date', 9999),
  });

  const { data: regioesAtendimento = [] } = useQuery({
    queryKey: ['regioes-atendimento'],
    queryFn: () => base44.entities.RegiaoAtendimento.list('-created_date', 9999),
  });

  const { data: unidadesMedida = [] } = useQuery({
    queryKey: ['unidades-medida'],
    queryFn: () => base44.entities.UnidadeMedida.list('-created_date', 9999),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list('-created_date', 9999),
  });

  const { data: rotasPadrao = [] } = useQuery({
    queryKey: ['rotas-padrao'],
    queryFn: () => base44.entities.RotaPadrao.list('-created_date', 9999),
  });

  const { data: modelosDocumento = [] } = useQuery({
    queryKey: ['modelos-documento'],
    queryFn: () => base44.entities.ModeloDocumento.list('-created_date', 9999),
  });

  const { data: apisExternas = [] } = useQuery({
    queryKey: ['apis-externas'],
    queryFn: () => base44.entities.ApiExterna.list('-created_date', 9999),
  });

  const { data: jobsAgendados = [] } = useQuery({
    queryKey: ['jobs-agendados'],
    queryFn: () => base44.entities.JobAgendado.list('-created_date', 9999),
  });

  const { data: configsIA = [] } = useQuery({
    queryKey: ['configs-ia'],
    queryFn: () => base44.entities.IAConfig.list('-created_date', 9999),
  });

  // PARÂMETROS OPERACIONAIS - FASE 3
  const { data: parametrosPortal = [] } = useQuery({
    queryKey: ['parametros-portal'],
    queryFn: () => base44.entities.ParametroPortalCliente.list('-created_date', 9999),
  });

  const { data: parametrosOrigemPedido = [] } = useQuery({
    queryKey: ['parametros-origem-pedido'],
    queryFn: () => base44.entities.ParametroOrigemPedido.list('-created_date', 9999),
  });

  const { data: parametrosRecebimentoNFe = [] } = useQuery({
    queryKey: ['parametros-recebimento-nfe'],
    queryFn: () => base44.entities.ParametroRecebimentoNFe.list('-created_date', 9999),
  });

  const { data: parametrosRoteirizacao = [] } = useQuery({
    queryKey: ['parametros-roteirizacao'],
    queryFn: () => base44.entities.ParametroRoteirizacao.list('-created_date', 9999),
  });

  const { data: parametrosConciliacao = [] } = useQuery({
    queryKey: ['parametros-conciliacao'],
    queryFn: () => base44.entities.ParametroConciliacaoBancaria.list('-created_date', 9999),
  });

  const { data: parametrosCaixa = [] } = useQuery({
    queryKey: ['parametros-caixa'],
    queryFn: () => base44.entities.ParametroCaixaDiario.list('-created_date', 9999),
  });

  // QUERIES - BLOCO 4: LOGÍSTICA
  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => base44.entities.Veiculo.list('-created_date', 9999),
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => base44.entities.Motorista.list('-created_date', 9999),
  });

  const { data: tiposFrete = [] } = useQuery({
    queryKey: ['tipos-frete'],
    queryFn: () => base44.entities.TipoFrete.list('-created_date', 9999),
  });

  const { data: chatbotIntents = [] } = useQuery({
    queryKey: ['chatbotIntents'],
    queryFn: () => base44.entities.ChatbotIntent.list('-created_date', 9999),
  });

  const { data: chatbotCanais = [] } = useQuery({
    queryKey: ['chatbotCanais'],
    queryFn: () => base44.entities.ChatbotCanal.list('-created_date', 9999),
  });

  // QUERIES - BLOCO 5: ORGANIZACIONAL
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list('-created_date', 9999),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => base44.entities.GrupoEmpresarial.list('-created_date', 9999),
  });

  const { data: departamentos = [] } = useQuery({
    queryKey: ['departamentos'],
    queryFn: () => base44.entities.Departamento.list('-created_date', 9999),
  });

  const { data: cargos = [] } = useQuery({
    queryKey: ['cargos'],
    queryFn: () => base44.entities.Cargo.list('-created_date', 9999),
  });

  const { data: turnos = [] } = useQuery({
    queryKey: ['turnos'],
    queryFn: () => base44.entities.Turno.list('-created_date', 9999),
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* CLIENTES */}
                  <Card 
                    className="border-blue-200 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => openWindow(
                      VisualizadorUniversalEntidade,
                      {
                        nomeEntidade: 'Cliente',
                        tituloDisplay: 'Clientes',
                        icone: Users,
                        camposPrincipais: ['nome', 'razao_social', 'cnpj', 'cpf', 'status', 'email'],
                        componenteEdicao: CadastroClienteCompleto,
                        windowMode: true
                      },
                      { title: '👥 Todos os Clientes', width: 1400, height: 800, zIndex: 50000 }
                    )}
                  >
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Clientes ({totalClientes})
                        </CardTitle>
                        <div className="flex items-center gap-2">
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
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                            onClick={() => openWindow(CadastroClienteCompleto, { 
                              cliente, 
                              windowMode: true,
                              onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clientes'] })
                            }, {
                              title: `Editar Cliente: ${cliente.nome || cliente.razao_social}`,
                              width: 1100,
                              height: 650,
                              uniqueKey: `edit-Cliente-${cliente.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* FORNECEDORES */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-cyan-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'Fornecedor',
                              tituloDisplay: 'Fornecedores',
                              icone: Building2,
                              camposPrincipais: ['nome', 'razao_social', 'cnpj', 'status', 'categoria'],
                              componenteEdicao: CadastroFornecedorCompleto,
                              windowMode: true
                            },
                            { title: '🏭 Todos os Fornecedores', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
                          <Building2 className="w-5 h-5 text-cyan-600" />
                          Fornecedores ({totalFornecedores})
                        </CardTitle>
                        <div className="flex items-center gap-2">
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
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                            onClick={() => openWindow(CadastroFornecedorCompleto, { 
                              fornecedor, 
                              windowMode: true,
                              onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
                            }, {
                              title: `Editar Fornecedor: ${fornecedor.nome}`,
                              width: 1100,
                              height: 650,
                              uniqueKey: `edit-Fornecedor-${fornecedor.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* TRANSPORTADORAS */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-orange-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'Transportadora',
                              tituloDisplay: 'Transportadoras',
                              icone: Truck,
                              camposPrincipais: ['razao_social', 'nome_fantasia', 'cnpj', 'status', 'nota_media'],
                              componenteEdicao: TransportadoraForm,
                              windowMode: true
                            },
                            { title: '🚛 Todas as Transportadoras', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                                height: 650,
                                uniqueKey: `edit-Transportadora-${transp.id}-${Date.now()}`,
                                zIndex: 999999,
                                bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* COLABORADORES */}
                  <Card className="border-pink-200">
                    <CardHeader className="bg-pink-50 border-b border-pink-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-pink-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'Colaborador',
                              tituloDisplay: 'Colaboradores',
                              icone: User,
                              camposPrincipais: ['nome_completo', 'cpf', 'cargo', 'departamento', 'status', 'email'],
                              componenteEdicao: ColaboradorForm,
                              windowMode: true
                            },
                            { title: '👥 Todos os Colaboradores', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                                height: 650,
                                uniqueKey: `edit-Colaborador-${colab.id}-${Date.now()}`,
                                zIndex: 999999,
                                bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* REPRESENTANTES V21.5 COMPLETO */}
                  <Card className="border-purple-200 lg:col-span-2">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-purple-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'Representante',
                              tituloDisplay: 'Representantes & Indicadores',
                              icone: Award,
                              camposPrincipais: ['nome', 'tipo_representante', 'percentual_comissao', 'email', 'telefone'],
                              componenteEdicao: RepresentanteFormCompleto,
                              windowMode: true
                            },
                            { title: '💰 Todos os Representantes', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
                          <Award className="w-5 h-5 text-purple-600" />
                          💰 Representantes & Indicadores ({representantes.length})
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openWindow(DashboardRepresentantes, {}, {
                              title: '📊 Dashboard de Representantes',
                              width: 1200,
                              height: 700
                            })}
                            className="border-purple-300 text-purple-700"
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Dashboard
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openWindow(RepresentanteFormCompleto, { windowMode: true }, {
                              title: '💼 Novo Representante',
                              width: 1100,
                              height: 650
                            })}
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={!hasPermission('cadastros', 'criar')}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Novo
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
                      {representantes.map(rep => {
                        const clientesIndicados = clientes.filter(c => c.indicador_id === rep.id).length;
                        return (
                          <div key={rep.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50 transition-all">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">
                                  {rep.tipo_representante === 'Arquiteto' ? '📐' :
                                   rep.tipo_representante === 'Engenheiro' ? '⚙️' :
                                   rep.tipo_representante === 'Construtor' ? '🏗️' : '🤝'}
                                </span>
                                <p className="font-semibold text-sm">{rep.nome}</p>
                              </div>
                              <div className="flex gap-2 flex-wrap items-center">
                                <Badge variant="outline" className="text-xs">{rep.tipo_representante}</Badge>
                                {rep.percentual_comissao > 0 && (
                                  <Badge className="bg-green-100 text-green-700 text-xs">
                                    {rep.percentual_comissao}% comissão
                                  </Badge>
                                )}
                                {clientesIndicados > 0 && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    {clientesIndicados} clientes
                                  </Badge>
                                )}
                                {rep.email && <span className="text-xs text-slate-500">📧 {rep.email}</span>}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWindow(RepresentanteFormCompleto, {
                                representante: rep,
                                windowMode: true,
                                onSuccess: () => queryClient.invalidateQueries({ queryKey: ['representantes'] })
                              }, {
                                title: `💼 ${rep.nome}`,
                                width: 1100,
                                height: 650,
                                uniqueKey: `edit-Representante-${rep.id}-${Date.now()}`,
                                zIndex: 999999,
                                bringToFront: true
                              })}
                              disabled={!hasPermission('cadastros', 'editar')}
                            >
                              <Edit className="w-4 h-4 text-purple-600" />
                            </Button>
                          </div>
                        );
                      })}
                      {representantes.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum representante cadastrado</p>
                      )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* CONTATOS B2B */}
                  <Card className="border-violet-200">
                    <CardHeader className="bg-violet-50 border-b border-violet-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-violet-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'ContatoB2B',
                              tituloDisplay: 'Contatos B2B',
                              icone: MessageCircle,
                              camposPrincipais: ['nome', 'empresa', 'cargo', 'email', 'telefone'],
                              componenteEdicao: ContatoB2BForm,
                              windowMode: true
                            },
                            { title: '📞 Todos os Contatos B2B', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                              height: 600,
                              uniqueKey: `edit-ContatoB2B-${contato.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-indigo-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'SegmentoCliente',
                              tituloDisplay: 'Segmentos de Cliente',
                              icone: TrendingUp,
                              camposPrincipais: ['nome_segmento', 'descricao', 'criterios'],
                              componenteEdicao: SegmentoClienteForm,
                              windowMode: true
                            },
                            { title: '🎯 Todos os Segmentos', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                              height: 600,
                              uniqueKey: `edit-SegmentoCliente-${seg.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* REGIÕES DE ATENDIMENTO */}
                  <Card className="border-sky-200">
                    <CardHeader className="bg-sky-50 border-b border-sky-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-sky-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'RegiaoAtendimento',
                              tituloDisplay: 'Regiões de Atendimento',
                              icone: MapPin,
                              camposPrincipais: ['nome_regiao', 'tipo_regiao', 'estados_abrangidos'],
                              componenteEdicao: RegiaoAtendimentoForm,
                              windowMode: true
                            },
                            { title: '🗺️ Todas as Regiões', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
                          <MapPin className="w-5 h-5 text-sky-600" />
                          Regiões de Atendimento ({regioesAtendimento.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => openWindow(RegiaoAtendimentoForm, {
                            open: true,
                            windowMode: true,
                            onOpenChange: () => {},
                            onSubmit: handleSubmitGenerico('RegiaoAtendimento', 'regioes-atendimento')
                          }, {
                            title: '🗺️ Nova Região de Atendimento',
                            width: 1000,
                            height: 700
                          })}
                          className="bg-sky-600 hover:bg-sky-700"
                          disabled={!hasPermission('cadastros', 'criar')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {regioesAtendimento.map(regiao => (
                        <div key={regiao.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{regiao.nome_regiao}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">{regiao.tipo_regiao}</Badge>
                              {regiao.estados_abrangidos?.length > 0 && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {regiao.estados_abrangidos.length} estados
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(RegiaoAtendimentoForm, {
                              regiaoAtendimento: regiao,
                              open: true,
                              windowMode: true,
                              onOpenChange: () => {},
                              onSubmit: handleSubmitGenerico('RegiaoAtendimento', 'regioes-atendimento')
                            }, {
                              title: `🗺️ Editar: ${regiao.nome_regiao}`,
                              width: 1000,
                              height: 700,
                              uniqueKey: `edit-RegiaoAtendimento-${regiao.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
                            })}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-4 h-4 text-sky-600" />
                          </Button>
                        </div>
                      ))}
                      {regioesAtendimento.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhuma região cadastrada</p>
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
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-purple-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorProdutos,
                            { windowMode: true },
                            { title: '📦 Todos os Produtos', width: 1400, height: 800 }
                          )}
                        >
                          <Package className="w-5 h-5 text-purple-600" />
                          Produtos ({totalProdutos})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                           <Button
                            size="sm"
                            onClick={() => openWindow(ProdutoFormV22_Completo, { windowMode: true, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] }) }, {
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
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWindow(ProdutoFormV22_Completo, { 
                              produto, 
                              windowMode: true,
                              onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] })
                            }, {
                              title: `Editar Produto: ${produto.descricao}`,
                              width: 1200,
                              height: 700,
                              uniqueKey: `edit-Produto-${produto.id}-${Date.now()}`
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
                    </div>
                  </CardContent>
                  </Card>

                  {/* SETORES DE ATIVIDADE */}
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-indigo-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'SetorAtividade',
                              tituloDisplay: 'Setores de Atividade',
                              icone: Factory,
                              camposPrincipais: ['nome', 'tipo_operacao', 'icone', 'descricao'],
                              componenteEdicao: SetorAtividadeForm,
                              windowMode: true
                            },
                            { title: '🏭 Todos os Setores', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                              setorAtividade: setor,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('SetorAtividade', 'setores-atividade')
                            }, {
                              title: `🏭 Editar: ${setor.nome}`,
                              width: 800,
                              height: 550,
                              uniqueKey: `edit-SetorAtividade-${setor.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* GRUPOS DE PRODUTO */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-cyan-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'GrupoProduto',
                              tituloDisplay: 'Grupos/Linhas de Produto',
                              icone: Boxes,
                              camposPrincipais: ['nome_grupo', 'descricao', 'codigo'],
                              componenteEdicao: GrupoProdutoForm,
                              windowMode: true
                            },
                            { title: '📦 Todos os Grupos', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                              grupoProduto: grupo,
                              windowMode: true,
                              onSubmit: handleSubmitGenerico('GrupoProduto', 'grupos-produto')
                            }, {
                              title: `📦 Editar: ${grupo.nome_grupo}`,
                              width: 800,
                              height: 550,
                              uniqueKey: `edit-GrupoProduto-${grupo.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* MARCAS */}
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-orange-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'Marca',
                              tituloDisplay: 'Marcas',
                              icone: Award,
                              camposPrincipais: ['nome_marca', 'pais_origem', 'site', 'descricao'],
                              componenteEdicao: MarcaForm,
                              windowMode: true
                            },
                            { title: '🏆 Todas as Marcas', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                              height: 550,
                              uniqueKey: `edit-Marca-${marca.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* TABELAS DE PREÇO */}
                  <Card className="border-green-200 lg:col-span-2">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-green-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'TabelaPreco',
                              tituloDisplay: 'Tabelas de Preço',
                              icone: TrendingUp,
                              camposPrincipais: ['nome', 'tipo', 'ativo', 'data_inicio', 'data_fim'],
                              componenteEdicao: TabelaPrecoFormCompleto,
                              windowMode: true
                            },
                            { title: '💰 Todas as Tabelas de Preço', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tabelasPreco.map(tabela => (
                          <div key={tabela.id} className="p-3 border rounded hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-sm">{tabela.nome}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWindow(TabelaPrecoFormCompleto, { 
                                  tabela, 
                                  windowMode: true,
                                  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] })
                                }, {
                                  title: `Editar Tabela: ${tabela.nome}`,
                                  width: 1200,
                                  height: 700,
                                  uniqueKey: `edit-TabelaPreco-${tabela.id}-${Date.now()}`,
                                  zIndex: 999999,
                                  bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* SERVIÇOS */}
                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base flex items-center gap-2 cursor-pointer hover:text-blue-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'Servico',
                              tituloDisplay: 'Serviços',
                              icone: Stars,
                              camposPrincipais: ['nome', 'descricao', 'valor_padrao', 'unidade_medida'],
                              componenteEdicao: ServicoForm,
                              windowMode: true
                            },
                            { title: '✨ Todos os Serviços', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
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
                              height: 600,
                              uniqueKey: `edit-Servico-${servico.id}-${Date.now()}`,
                              zIndex: 999999,
                              bringToFront: true
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
                      </div>
                    </CardContent>
                  </Card>

                  {/* KITS DE PRODUTO */}
                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle 
                          className="text-base cursor-pointer hover:text-purple-700 transition-colors"
                          onClick={() => openWindow(
                            VisualizadorUniversalEntidade,
                            {
                              nomeEntidade: 'KitProduto',
                              tituloDisplay: 'Kits de Produto',
                              icone: Package,
                              camposPrincipais: ['nome_kit', 'descricao', 'valor_total', 'ativo'],
                              componenteEdicao: KitProdutoForm,
                              windowMode: true
                            },
                            { title: '📦 Todos os Kits', width: 1400, height: 800, zIndex: 50000 }
                          )}
                        >
                          📦 Kits de Produto ({kits.length})
                        </CardTitle>
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
                    <CardContent className="p-4">
                      <div className="max-h-80 overflow-y-auto">
                        {kits.map(kit => (
                          <div key={kit.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{kit.nome_kit || kit.nome || 'Kit'}</p>
                              {kit.descricao && <p className="text-xs text-slate-500">{kit.descricao}</p>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openWindow(KitProdutoForm, {
                                kitProduto: kit,
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('KitProduto', 'kits-produto')
                              }, {
                                title: `📦 Editar: ${kit.nome_kit || kit.nome || 'Kit'}`,
                                width: 900,
                                height: 650,
                                uniqueKey: `edit-KitProduto-${kit.id}-${Date.now()}`,
                                zIndex: 999999,
                                bringToFront: true
                              })}
                              disabled={!hasPermission('cadastros', 'editar')}
                            >
                              <Edit className="w-4 h-4 text-purple-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                      </Card>

                      {/* CONFIGURAÇÕES DE INTEGRAÇÃO */}
                      <Card className="border-purple-200">
                        <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle 
                              className="text-base cursor-pointer hover:text-purple-700 transition-colors"
                              onClick={() => openWindow(
                                VisualizadorUniversalEntidade,
                                {
                                  nomeEntidade: 'ConfiguracaoIntegracaoMarketplace',
                                  tituloDisplay: 'Integrações Marketplace',
                                  icone: ShoppingCart,
                                  camposPrincipais: ['marketplace', 'ativo', 'api_key', 'url_base'],
                                  componenteEdicao: ConfiguracaoIntegracaoForm,
                                  windowMode: true
                                },
                                { title: '🛒 Todas as Integrações', width: 1400, height: 800, zIndex: 50000 }
                              )}
                            >
                              🛒 Integrações Marketplace ({configsIntegracao.length})
                            </CardTitle>
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
                        <CardContent className="p-4">
                          <div className="max-h-60 overflow-y-auto">
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
                                    configuracaoIntegracaoMarketplace: config,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ConfiguracaoIntegracaoMarketplace', 'configs-integracao-marketplace')
                                  }, {
                                    title: `🔗 Editar: ${config.marketplace}`,
                                    width: 1100,
                                    height: 750,
                                    uniqueKey: `edit-ConfiguracaoIntegracaoMarketplace-${config.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-purple-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* WEBHOOKS */}
                      <Card className="border-indigo-200">
                        <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle 
                              className="text-base cursor-pointer hover:text-indigo-700 transition-colors"
                              onClick={() => openWindow(
                                VisualizadorUniversalEntidade,
                                {
                                  nomeEntidade: 'Webhook',
                                  tituloDisplay: 'Webhooks',
                                  icone: Link2,
                                  camposPrincipais: ['nome_webhook', 'url', 'evento_gatilho', 'ativo'],
                                  componenteEdicao: WebhookForm,
                                  windowMode: true
                                },
                                { title: '🔗 Todos os Webhooks', width: 1400, height: 800, zIndex: 50000 }
                              )}
                            >
                              🔗 Webhooks ({webhooks.length})
                            </CardTitle>
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
                        <CardContent className="p-4">
                          <div className="max-h-60 overflow-y-auto">
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
                                    height: 600,
                                    uniqueKey: `edit-Webhook-${wh.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-indigo-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* CHATBOT INTENTS */}
                      <Card className="border-purple-200">
                        <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle 
                              className="text-base cursor-pointer hover:text-purple-700 transition-colors"
                              onClick={() => openWindow(
                                VisualizadorUniversalEntidade,
                                {
                                  nomeEntidade: 'ChatbotIntent',
                                  tituloDisplay: 'Chatbot Intents',
                                  icone: MessageCircle,
                                  camposPrincipais: ['nome_intent', 'exemplos_frases', 'resposta_padrao', 'ativo'],
                                  componenteEdicao: ChatbotIntentForm,
                                  windowMode: true
                                },
                                { title: '💬 Todas as Intents', width: 1400, height: 800, zIndex: 50000 }
                              )}
                            >
                              💬 Intents ({chatbotIntents.length})
                            </CardTitle>
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
                        <CardContent className="p-4">
                          <div className="max-h-60 overflow-y-auto">
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
                                    height: 650,
                                    uniqueKey: `edit-ChatbotIntent-${intent.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-purple-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* CHATBOT CANAIS */}
                      <Card className="border-green-200">
                        <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle 
                              className="text-base cursor-pointer hover:text-green-700 transition-colors"
                              onClick={() => openWindow(
                                VisualizadorUniversalEntidade,
                                {
                                  nomeEntidade: 'ChatbotCanal',
                                  tituloDisplay: 'Canais de Chatbot',
                                  icone: MessageCircle,
                                  camposPrincipais: ['nome_canal', 'tipo_canal', 'configuracao', 'ativo'],
                                  componenteEdicao: ChatbotCanalForm,
                                  windowMode: true
                                },
                                { title: '📱 Todos os Canais', width: 1400, height: 800, zIndex: 50000 }
                              )}
                            >
                              📱 Canais ({chatbotCanais.length})
                            </CardTitle>
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
                        <CardContent className="p-4">
                          <div className="max-h-60 overflow-y-auto">
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
                                    height: 550,
                                    uniqueKey: `edit-ChatbotCanal-${canal.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-green-600" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* APIS EXTERNAS */}
                      <Card className="border-blue-200">
                        <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle 
                              className="text-base cursor-pointer hover:text-blue-700 transition-colors"
                              onClick={() => openWindow(
                                VisualizadorUniversalEntidade,
                                {
                                  nomeEntidade: 'ApiExterna',
                                  tituloDisplay: 'APIs Externas',
                                  icone: Link2,
                                  camposPrincipais: ['nome_integracao', 'url_base', 'autenticacao', 'ativo'],
                                  componenteEdicao: ApiExternaForm,
                                  windowMode: true
                                },
                                { title: '🔌 Todas as APIs', width: 1400, height: 800, zIndex: 50000 }
                              )}
                            >
                              🔌 APIs ({apisExternas.length})
                            </CardTitle>
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
                                  height: 700,
                                  uniqueKey: `edit-ApiExterna-${api.id}-${Date.now()}`,
                                  zIndex: 999999,
                                  bringToFront: true
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
                            <CardTitle 
                              className="text-base cursor-pointer hover:text-amber-700 transition-colors"
                              onClick={() => openWindow(
                                VisualizadorUniversalEntidade,
                                {
                                  nomeEntidade: 'JobAgendado',
                                  tituloDisplay: 'Jobs Agendados (IA)',
                                  icone: Clock,
                                  camposPrincipais: ['nome_job', 'tipo_job', 'periodicidade', 'ativo', 'ultima_execucao'],
                                  componenteEdicao: JobAgendadoForm,
                                  windowMode: true
                                },
                                { title: '⏰ Todos os Jobs de IA', width: 1400, height: 800, zIndex: 50000 }
                              )}
                            >
                              ⏰ Jobs IA ({jobsAgendados.length})
                            </CardTitle>
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
                                  height: 650,
                                  uniqueKey: `edit-JobAgendado-${job.id}-${Date.now()}`,
                                  zIndex: 999999,
                                  bringToFront: true
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
                              <CardTitle 
                                className="text-base cursor-pointer hover:text-blue-700 transition-colors"
                                onClick={() => openWindow(
                                  VisualizadorUniversalEntidade,
                                  {
                                    nomeEntidade: 'ParametroPortalCliente',
                                    tituloDisplay: 'Parâmetros Portal Cliente',
                                    icone: Globe,
                                    camposPrincipais: ['empresa_id', 'habilitar_portal', 'habilitar_aprovacao_orcamento'],
                                    componenteEdicao: ParametroPortalClienteForm,
                                    windowMode: true
                                  },
                                  { title: '🌐 Todos os Parâmetros Portal', width: 1400, height: 800, zIndex: 50000 }
                                )}
                              >
                                🌐 Portal Cliente ({parametrosPortal.length})
                              </CardTitle>
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
                                    parametroPortalCliente: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroPortalCliente', 'parametros-portal')
                                  }, { 
                                    title: '🌐 Editar Parâmetro Portal', 
                                    width: 900, 
                                    height: 650,
                                    uniqueKey: `edit-ParametroPortalCliente-${p.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-blue-600" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* PARÂMETRO ORIGEM PEDIDO - V21.6 COMPLETO */}
                        <Card className="border-purple-200">
                          <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle 
                                className="text-base cursor-pointer hover:text-purple-700 transition-colors"
                                onClick={() => openWindow(
                                  VisualizadorUniversalEntidade,
                                  {
                                    nomeEntidade: 'ParametroOrigemPedido',
                                    tituloDisplay: 'Parâmetros Origem de Pedido',
                                    icone: ShoppingCart,
                                    camposPrincipais: ['nome', 'canal', 'tipo_criacao', 'ativo'],
                                    componenteEdicao: ParametroOrigemPedidoForm,
                                    windowMode: true
                                  },
                                  { title: '🛒 Todos os Canais de Origem', width: 1400, height: 800, zIndex: 50000 }
                                )}
                              >
                                🛒 Origem Pedido ({parametrosOrigemPedido.length})
                              </CardTitle>
                              <Button size="sm" onClick={() => openWindow(ParametroOrigemPedidoForm, {
                                windowMode: true,
                                onSubmit: handleSubmitGenerico('ParametroOrigemPedido', 'parametros-origem-pedido')
                              }, { title: '🛒 Novo Canal de Origem', width: 900, height: 650 })}
                                className="bg-purple-600 hover:bg-purple-700"
                                disabled={!hasPermission('cadastros', 'criar')}>
                                <Plus className="w-4 h-4 mr-1" />Novo Canal
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 max-h-60 overflow-y-auto">
                            {parametrosOrigemPedido.map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{p.nome}</p>
                                  <div className="flex gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-xs">{p.canal}</Badge>
                                    <Badge className={`text-xs ${
                                      p.tipo_criacao === 'Manual' ? 'bg-blue-100 text-blue-700' :
                                      p.tipo_criacao === 'Automático' ? 'bg-green-100 text-green-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      {p.tipo_criacao}
                                    </Badge>
                                    {p.ativo && <Badge className="bg-green-100 text-green-700 text-xs">✅ Ativo</Badge>}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWindow(ParametroOrigemPedidoForm, {
                                    parametroOrigemPedido: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroOrigemPedido', 'parametros-origem-pedido')
                                  }, { 
                                    title: `🛒 Editar: ${p.nome}`, 
                                    width: 900, 
                                    height: 650,
                                    uniqueKey: `edit-ParametroOrigemPedido-${p.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
                                  disabled={!hasPermission('cadastros', 'editar')}
                                >
                                  <Edit className="w-3 h-3 text-purple-600" />
                                </Button>
                              </div>
                            ))}
                            {parametrosOrigemPedido.length === 0 && (
                              <p className="text-center text-slate-500 py-8 text-sm">
                                Nenhum canal configurado. Crie canais para automação de origem.
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        {/* PARÂMETRO RECEBIMENTO NFE */}
                        <Card className="border-green-200">
                          <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle 
                                className="text-base cursor-pointer hover:text-green-700 transition-colors"
                                onClick={() => openWindow(
                                  VisualizadorUniversalEntidade,
                                  {
                                    nomeEntidade: 'ParametroRecebimentoNFe',
                                    tituloDisplay: 'Parâmetros Recebimento NF-e',
                                    icone: FileText,
                                    camposPrincipais: ['empresa_id', 'criar_produto_automaticamente', 'validar_duplicidade'],
                                    componenteEdicao: ParametroRecebimentoNFeForm,
                                    windowMode: true
                                  },
                                  { title: '📄 Todos os Parâmetros NF-e', width: 1400, height: 800, zIndex: 50000 }
                                )}
                              >
                                📄 Recebimento NF-e ({parametrosRecebimentoNFe.length})
                              </CardTitle>
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
                                    parametroRecebimentoNFe: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroRecebimentoNFe', 'parametros-recebimento-nfe')
                                  }, { 
                                    title: '📄 Editar Parâmetro NFe', 
                                    width: 900, 
                                    height: 650,
                                    uniqueKey: `edit-ParametroRecebimentoNFe-${p.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
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
                              <CardTitle 
                                className="text-base cursor-pointer hover:text-orange-700 transition-colors"
                                onClick={() => openWindow(
                                  VisualizadorUniversalEntidade,
                                  {
                                    nomeEntidade: 'ParametroRoteirizacao',
                                    tituloDisplay: 'Parâmetros de Roteirização',
                                    icone: MapPin,
                                    camposPrincipais: ['empresa_id', 'otimizar_por', 'habilitar_ia'],
                                    componenteEdicao: ParametroRoteirizacaoForm,
                                    windowMode: true
                                  },
                                  { title: '🗺️ Todos os Parâmetros de Rotas', width: 1400, height: 800, zIndex: 50000 }
                                )}
                              >
                                🗺️ Roteirização ({parametrosRoteirizacao.length})
                              </CardTitle>
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
                                    parametroRoteirizacao: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroRoteirizacao', 'parametros-roteirizacao')
                                  }, { 
                                    title: '🗺️ Editar Parâmetro Rotas', 
                                    width: 800, 
                                    height: 600,
                                    uniqueKey: `edit-ParametroRoteirizacao-${p.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
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
                              <CardTitle 
                                className="text-base cursor-pointer hover:text-cyan-700 transition-colors"
                                onClick={() => openWindow(
                                  VisualizadorUniversalEntidade,
                                  {
                                    nomeEntidade: 'ParametroConciliacaoBancaria',
                                    tituloDisplay: 'Parâmetros Conciliação',
                                    icone: Landmark,
                                    camposPrincipais: ['empresa_id', 'tolerancia_valor', 'habilitar_ia'],
                                    componenteEdicao: ParametroConciliacaoBancariaForm,
                                    windowMode: true
                                  },
                                  { title: '🏦 Todos os Parâmetros Conciliação', width: 1400, height: 800, zIndex: 50000 }
                                )}
                              >
                                🏦 Conciliação ({parametrosConciliacao.length})
                              </CardTitle>
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
                                    parametroConciliacaoBancaria: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroConciliacaoBancaria', 'parametros-conciliacao')
                                  }, { 
                                    title: '🏦 Editar Parâmetro Conciliação', 
                                    width: 900, 
                                    height: 650,
                                    uniqueKey: `edit-ParametroConciliacaoBancaria-${p.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
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
                              <CardTitle 
                                className="text-base cursor-pointer hover:text-emerald-700 transition-colors"
                                onClick={() => openWindow(
                                  VisualizadorUniversalEntidade,
                                  {
                                    nomeEntidade: 'ParametroCaixaDiario',
                                    tituloDisplay: 'Parâmetros Caixa Diário',
                                    icone: Wallet,
                                    camposPrincipais: ['empresa_id', 'horario_abertura', 'horario_fechamento'],
                                    componenteEdicao: ParametroCaixaDiarioForm,
                                    windowMode: true
                                  },
                                  { title: '💰 Todos os Parâmetros Caixa', width: 1400, height: 800, zIndex: 50000 }
                                )}
                              >
                                💰 Caixa Diário ({parametrosCaixa.length})
                              </CardTitle>
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
                                    parametroCaixaDiario: p,
                                    windowMode: true,
                                    onSubmit: handleSubmitGenerico('ParametroCaixaDiario', 'parametros-caixa')
                                  }, { 
                                    title: '💰 Editar Parâmetro Caixa', 
                                    width: 800, 
                                    height: 600,
                                    uniqueKey: `edit-ParametroCaixaDiario-${p.id}-${Date.now()}`,
                                    zIndex: 999999,
                                    bringToFront: true
                                  })}
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