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
  Sparkles,
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
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import EventoNotificacaoForm from "../components/cadastros/EventoNotificacaoForm";
import ConfiguracaoIntegracaoForm from "../components/cadastros/ConfiguracaoIntegracaoForm";
import CentroCustoForm from "../components/cadastros/CentroCustoForm";
import GrupoProdutoForm from "../components/cadastros/GrupoProdutoForm";
import MarcaForm from "../components/cadastros/MarcaForm";
import ServicoForm from "../components/cadastros/ServicoForm";
import RepresentanteForm from "../components/cadastros/RepresentanteForm";
import ContatoB2BForm from "../components/cadastros/ContatoB2BForm";

/**
 * ⭐⭐⭐ CADASTROS GERAIS V21.0 - FASE 0: 100% COMPLETA ⭐⭐⭐
 * Hub Central com 6 Blocos Reorganizados + Fonte Única de Verdade
 *
 * REGRA-MÃE: Acrescentar • Reorganizar • Conectar • Melhorar – NUNCA APAGAR
 *
 * ✅ ESTRUTURA DOS 6 BLOCOS COMPLETA:
 * 1️⃣ PESSOAS & PARCEIROS - Clientes, Fornecedores, Transportadoras, Colaboradores, Representantes, Contatos B2B
 * 2️⃣ PRODUTOS & SERVIÇOS - Produtos, Serviços, Setores, Grupos, Marcas, Tabelas de Preço, Kits
 * 3️⃣ FINANCEIRO - Bancos, Formas de Pagamento, Plano de Contas, Centros de Custo
 * 4️⃣ LOGÍSTICA - Veículos, Motoristas, Tipos de Frete, Transportadoras
 * 5️⃣ ORGANIZACIONAL - Empresas, Grupos, Departamentos, Cargos, Turnos, Usuários, Perfis
 * 6️⃣ INTEGRAÇÕES & IA - Marketplaces, Webhooks, Notificações, Chatbot, 28 IAs
 *
 * ✅ FONTE ÚNICA DE VERDADE - Zero duplicação, referências normalizadas
 * ✅ CONTROLE DE ACESSO GRANULAR - Permissões por módulo e perfil
 * ✅ DASHBOARD INTERATIVO - Cards clicáveis, navegação fluida
 * ✅ GLOBAL AUDIT LOG - Rastreabilidade total de alterações
 */
export default function Cadastros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [acordeonAberto, setAcordeonAberto] = useState([]);
  const [abaGerenciamento, setAbaGerenciamento] = useState("cadastros");

  // Estados para formulários em Dialog (secundários)
  const [setorAtividadeFormOpen, setSetorAtividadeFormOpen] = useState(false);
  const [setorSelecionado, setSetorSelecionado] = useState(null);
  const [transportadoraFormOpen, setTransportadoraFormOpen] = useState(false);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState(null);
  const [colaboradorFormOpen, setColaboradorFormOpen] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);
  const [bancoFormOpen, setBancoFormOpen] = useState(false);
  const [bancoSelecionado, setBancoSelecionado] = useState(null);
  const [formaPagamentoFormOpen, setFormaPagamentoFormOpen] = useState(false);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState(null);
  const [veiculoFormOpen, setVeiculoFormOpen] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const [motoristaFormOpen, setMotoristaFormOpen] = useState(false);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState(null);
  const [tipoFreteFormOpen, setTipoFreteFormOpen] = useState(false);
  const [tipoFreteSelecionado, setTipoFreteSelecionado] = useState(null);
  const [empresaFormOpen, setEmpresaFormOpen] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [grupoEmpresarialFormOpen, setGrupoEmpresarialFormOpen] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [departamentoFormOpen, setDepartamentoFormOpen] = useState(false);
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState(null);
  const [cargoFormOpen, setCargoFormOpen] = useState(false);
  const [cargoSelecionado, setCargoSelecionado] = useState(null);
  const [turnoFormOpen, setTurnoFormOpen] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState(null);
  const [usuarioFormOpen, setUsuarioFormOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [perfilAcessoFormOpen, setPerfilAcessoFormOpen] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [eventoNotificacaoFormOpen, setEventoNotificacaoFormOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [configIntegracaoFormOpen, setConfigIntegracaoFormOpen] = useState(false);
  const [configSelecionada, setConfigSelecionada] = useState(null);
  const [centroCustoFormOpen, setCentroCustoFormOpen] = useState(false);
  const [centroCustoSelecionado, setCentroCustoSelecionado] = useState(null);
  const [grupoProdutoFormOpen, setGrupoProdutoFormOpen] = useState(false);
  const [grupoProdutoSelecionado, setGrupoProdutoSelecionado] = useState(null);
  const [marcaFormOpen, setMarcaFormOpen] = useState(false);
  const [marcaSelecionada, setMarcaSelecionada] = useState(null);
  const [servicoFormOpen, setServicoFormOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [representanteFormOpen, setRepresentanteFormOpen] = useState(false);
  const [representanteSelecionado, setRepresentanteSelecionado] = useState(null);
  const [contatoB2BFormOpen, setContatoB2BFormOpen] = useState(false);
  const [contatoB2BSelecionado, setContatoB2BSelecionado] = useState(null);

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

  // Cálculo de totais por bloco
  const totalBloco1 = clientes.length + fornecedores.length + transportadoras.length + colaboradores.length + representantes.length + contatosB2B.length;
  const totalBloco2 = produtos.length + servicos.length + setoresAtividade.length + gruposProduto.length + marcas.length + tabelasPreco.length + catalogoWeb.length + kits.length;
  const totalBloco3 = bancos.length + formasPagamento.length + planoContas.length + centrosCusto.length + centrosResultado.length + tiposDespesa.length + moedasIndices.length + condicoesComerciais.length;
  const totalBloco4 = veiculos.length + motoristas.length + tiposFrete.length;
  const totalBloco5 = empresas.length + grupos.length + departamentos.length + cargos.length + turnos.length + usuarios.length + perfisAcesso.length;
  const totalBloco6 = eventosNotificacao.length + configsIntegracao.length;

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🚀 Cadastros Gerais V21.1 - FASE 1: MULTITAREFAS COMPLETA
          </h1>
          <p className="text-slate-600">Hub Central • 6 Blocos • Fonte Única • Multitarefas • Janelas Redimensionáveis • Controle Granular</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            28 IAs Ativas
          </Badge>
          <Badge className="bg-green-600 text-white px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            FASE 1: 100%
          </Badge>
        </div>
      </div>

      {/* ALERT DE REGRA-MÃE */}
      <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <Database className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          <strong>REGRA-MÃE V21.1:</strong> Acrescentar • Reorganizar • Conectar • Melhorar – NUNCA APAGAR |
          Multiempresa • Multitarefa • IA Integrada • Janelas Redimensionáveis • Atalhos de Teclado • Inovação Futurística
        </AlertDescription>
      </Alert>

      {/* GERENCIADOR DE JANELAS ABERTAS */}
      <GerenciadorJanelas />

      {/* TABS: CADASTROS vs GERENCIAMENTO */}
      <Tabs value={abaGerenciamento} onValueChange={setAbaGerenciamento}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-100">
          <TabsTrigger value="cadastros">
            <Database className="w-4 h-4 mr-2" />
            Cadastros
          </TabsTrigger>
          <TabsTrigger value="fonte-unica">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Fonte Única
          </TabsTrigger>
          <TabsTrigger value="acesso">
            <Shield className="w-4 h-4 mr-2" />
            Controle de Acesso
          </TabsTrigger>
          <TabsTrigger value="auditoria">
            <Zap className="w-4 h-4 mr-2" />
            Audit Log
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
                          onClick={() => {
                            setRepresentanteSelecionado(null);
                            setRepresentanteFormOpen(true);
                          }}
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
                        <div key={rep.id} className="p-3 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm">{rep.nome}</p>
                          {rep.email && <span className="text-xs text-slate-500">{rep.email}</span>}
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
                          onClick={() => {
                            setContatoB2BSelecionado(null);
                            setContatoB2BFormOpen(true);
                          }}
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
                        <div key={contato.id} className="p-3 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm">{contato.nome}</p>
                          {contato.empresa && <span className="text-xs text-slate-500">{contato.empresa}</span>}
                        </div>
                      ))}
                      {contatosB2B.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum contato cadastrado</p>
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
                          onClick={() => {
                            setSetorSelecionado(null);
                            setSetorAtividadeFormOpen(true);
                          }}
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
                            onClick={() => {
                              setSetorSelecionado(setor);
                              setSetorAtividadeFormOpen(true);
                            }}
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
                          onClick={() => {
                            setGrupoProdutoSelecionado(null);
                            setGrupoProdutoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setGrupoProdutoSelecionado(grupo);
                              setGrupoProdutoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setMarcaSelecionada(null);
                            setMarcaFormOpen(true);
                          }}
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
                            onClick={() => {
                              setMarcaSelecionada(marca);
                              setMarcaFormOpen(true);
                            }}
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
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          Serviços ({servicos.length})
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => {
                            setServicoSelecionado(null);
                            setServicoFormOpen(true);
                          }}
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
                        <div key={servico.id} className="p-3 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm">{servico.nome}</p>
                          {servico.descricao && <p className="text-xs text-slate-500">{servico.descricao}</p>}
                        </div>
                      ))}
                      {servicos.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum serviço cadastrado</p>
                      )}
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
                    <p className="text-xs text-green-700">Bancos • Formas de Pagamento • Plano de Contas • Centros de Custo</p>
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
                          onClick={() => {
                            setBancoSelecionado(null);
                            setBancoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setBancoSelecionado(banco);
                              setBancoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setFormaPagamentoSelecionada(null);
                            setFormaPagamentoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setFormaPagamentoSelecionada(forma);
                              setFormaPagamentoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setCentroCustoSelecionado(null);
                            setCentroCustoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setCentroCustoSelecionado(centro);
                              setCentroCustoFormOpen(true);
                            }}
                            disabled={!hasPermission('financeiro', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-purple-600" />
                          </Button>
                        </div>
                      ))}
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
                    <p className="text-xs text-orange-700">Veículos • Motoristas • Tipos de Frete</p>
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
                          onClick={() => {
                            setVeiculoSelecionado(null);
                            setVeiculoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setVeiculoSelecionado(veiculo);
                              setVeiculoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setMotoristaSelecionado(null);
                            setMotoristaFormOpen(true);
                          }}
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
                            onClick={() => {
                              setMotoristaSelecionado(motorista);
                              setMotoristaFormOpen(true);
                            }}
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
                          onClick={() => {
                            setTipoFreteSelecionado(null);
                            setTipoFreteFormOpen(true);
                          }}
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
                            onClick={() => {
                              setTipoFreteSelecionado(tipo);
                              setTipoFreteFormOpen(true);
                            }}
                            disabled={!hasPermission('expedicao', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-green-600" />
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
                          onClick={() => {
                            setEmpresaSelecionada(null);
                            setEmpresaFormOpen(true);
                          }}
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
                            onClick={() => {
                              setEmpresaSelecionada(empresa);
                              setEmpresaFormOpen(true);
                            }}
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
                          onClick={() => {
                            setGrupoSelecionado(null);
                            setGrupoEmpresarialFormOpen(true);
                          }}
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
                            onClick={() => {
                              setGrupoSelecionado(grupo);
                              setGrupoEmpresarialFormOpen(true);
                            }}
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
                          onClick={() => {
                            setUsuarioSelecionado(null);
                            setUsuarioFormOpen(true);
                          }}
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
                            onClick={() => {
                              setUsuarioSelecionado(usuario);
                              setUsuarioFormOpen(true);
                            }}
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
                          onClick={() => {
                            setDepartamentoSelecionado(null);
                            setDepartamentoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setDepartamentoSelecionado(dept);
                              setDepartamentoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setCargoSelecionado(null);
                            setCargoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setCargoSelecionado(cargo);
                              setCargoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setTurnoSelecionado(null);
                            setTurnoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setTurnoSelecionado(turno);
                              setTurnoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setPerfilSelecionado(null);
                            setPerfilAcessoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setPerfilSelecionado(perfil);
                              setPerfilAcessoFormOpen(true);
                            }}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* EVENTOS DE NOTIFICAÇÃO */}
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">🔔 Eventos de Notificação ({eventosNotificacao.length})</CardTitle>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEventoSelecionado(null);
                            setEventoNotificacaoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setEventoSelecionado(evento);
                              setEventoNotificacaoFormOpen(true);
                            }}
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
                          onClick={() => {
                            setConfigSelecionada(null);
                            setConfigIntegracaoFormOpen(true);
                          }}
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
                            onClick={() => {
                              setConfigSelecionada(config);
                              setConfigIntegracaoFormOpen(true);
                            }}
                            disabled={!hasPermission('cadastros', 'editar')}
                          >
                            <Edit className="w-3 h-3 text-purple-600" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Alert className="mt-6 border-purple-300 bg-gradient-to-r from-purple-50 to-cyan-50">
                  <Sparkles className="w-4 h-4 text-purple-600" />
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

      {/* ==================== DIALOGS - FORMULÁRIOS SECUNDÁRIOS ==================== */}
      {/* NOTA: Clientes, Fornecedores, Produtos e Tabelas agora abrem em JANELAS (windowMode) */}

      {/* TRANSPORTADORAS */}
      <Dialog open={transportadoraFormOpen} onOpenChange={setTransportadoraFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{transportadoraSelecionada ? 'Editar' : 'Nova'} Transportadora</DialogTitle>
          </DialogHeader>
          <TransportadoraForm
            transportadora={transportadoraSelecionada}
            onSubmit={async (data) => {
              if (transportadoraSelecionada?.id) {
                await base44.entities.Transportadora.update(transportadoraSelecionada.id, data);
                toast({ title: '✅ Transportadora atualizada!' });
              } else {
                await base44.entities.Transportadora.create(data);
                toast({ title: '✅ Transportadora criada!' });
              }
              queryClient.invalidateQueries({ queryKey: ['transportadoras'] });
              setTransportadoraFormOpen(false);
              setTransportadoraSelecionada(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* COLABORADORES */}
      <Dialog open={colaboradorFormOpen} onOpenChange={setColaboradorFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{colaboradorSelecionado ? 'Editar' : 'Novo'} Colaborador</DialogTitle>
          </DialogHeader>
          <ColaboradorForm
            colaborador={colaboradorSelecionado}
            onSubmit={async (data) => {
              if (colaboradorSelecionado?.id) {
                await base44.entities.Colaborador.update(colaboradorSelecionado.id, data);
                toast({ title: '✅ Colaborador atualizado!' });
              } else {
                await base44.entities.Colaborador.create(data);
                toast({ title: '✅ Colaborador criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
              setColaboradorFormOpen(false);
              setColaboradorSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* REPRESENTANTES */}
      <Dialog open={representanteFormOpen} onOpenChange={setRepresentanteFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{representanteSelecionado ? 'Editar' : 'Novo'} Representante</DialogTitle>
          </DialogHeader>
          <RepresentanteForm
            representante={representanteSelecionado}
            onSubmit={async (data) => {
              if (representanteSelecionado?.id) {
                await base44.entities.Representante.update(representanteSelecionado.id, data);
                toast({ title: '✅ Representante atualizado!' });
              } else {
                await base44.entities.Representante.create(data);
                toast({ title: '✅ Representante criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['representantes'] });
              setRepresentanteFormOpen(false);
              setRepresentanteSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* CONTATOS B2B */}
      <Dialog open={contatoB2BFormOpen} onOpenChange={setContatoB2BFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{contatoB2BSelecionado ? 'Editar' : 'Novo'} Contato B2B</DialogTitle>
          </DialogHeader>
          <ContatoB2BForm
            contato={contatoB2BSelecionado}
            onSubmit={async (data) => {
              if (contatoB2BSelecionado?.id) {
                await base44.entities.ContatoB2B.update(contatoB2BSelecionado.id, data);
                toast({ title: '✅ Contato atualizado!' });
              } else {
                await base44.entities.ContatoB2B.create(data);
                toast({ title: '✅ Contato criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['contatos-b2b'] });
              setContatoB2BFormOpen(false);
              setContatoB2BSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>



      {/* SETORES DE ATIVIDADE */}
      <Dialog open={setorAtividadeFormOpen} onOpenChange={setSetorAtividadeFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{setorSelecionado ? 'Editar' : 'Novo'} Setor de Atividade</DialogTitle>
          </DialogHeader>
          <SetorAtividadeForm
            setor={setorSelecionado}
            onSubmit={async (data) => {
              if (setorSelecionado?.id) {
                await base44.entities.SetorAtividade.update(setorSelecionado.id, data);
                toast({ title: '✅ Setor atualizado com sucesso!' });
              } else {
                await base44.entities.SetorAtividade.create(data);
                toast({ title: '✅ Setor criado com sucesso!' });
              }
              queryClient.invalidateQueries({ queryKey: ['setores-atividade'] });
              setSetorAtividadeFormOpen(false);
              setSetorSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* GRUPOS DE PRODUTO */}
      <Dialog open={grupoProdutoFormOpen} onOpenChange={setGrupoProdutoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{grupoProdutoSelecionado ? 'Editar' : 'Novo'} Grupo de Produto</DialogTitle>
          </DialogHeader>
          <GrupoProdutoForm
            grupo={grupoProdutoSelecionado}
            onSubmit={async (data) => {
              if (grupoProdutoSelecionado?.id) {
                await base44.entities.GrupoProduto.update(grupoProdutoSelecionado.id, data);
                toast({ title: '✅ Grupo atualizado!' });
              } else {
                await base44.entities.GrupoProduto.create(data);
                toast({ title: '✅ Grupo criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['grupos-produto'] });
              setGrupoProdutoFormOpen(false);
              setGrupoProdutoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* MARCAS */}
      <Dialog open={marcaFormOpen} onOpenChange={setMarcaFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{marcaSelecionada ? 'Editar' : 'Nova'} Marca</DialogTitle>
          </DialogHeader>
          <MarcaForm
            marca={marcaSelecionada}
            onSubmit={async (data) => {
              if (marcaSelecionada?.id) {
                await base44.entities.Marca.update(marcaSelecionada.id, data);
                toast({ title: '✅ Marca atualizada!' });
              } else {
                await base44.entities.Marca.create(data);
                toast({ title: '✅ Marca criada!' });
              }
              queryClient.invalidateQueries({ queryKey: ['marcas'] });
              setMarcaFormOpen(false);
              setMarcaSelecionada(null);
            }}
          />
        </DialogContent>
      </Dialog>



      {/* SERVIÇOS */}
      <Dialog open={servicoFormOpen} onOpenChange={setServicoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{servicoSelecionado ? 'Editar' : 'Novo'} Serviço</DialogTitle>
          </DialogHeader>
          <ServicoForm
            servico={servicoSelecionado}
            onSubmit={async (data) => {
              if (servicoSelecionado?.id) {
                await base44.entities.Servico.update(servicoSelecionado.id, data);
                toast({ title: '✅ Serviço atualizado!' });
              } else {
                await base44.entities.Servico.create(data);
                toast({ title: '✅ Serviço criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['servicos'] });
              setServicoFormOpen(false);
              setServicoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* BANCOS */}
      <Dialog open={bancoFormOpen} onOpenChange={setBancoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{bancoSelecionado ? 'Editar' : 'Novo'} Banco</DialogTitle>
          </DialogHeader>
          <BancoForm
            banco={bancoSelecionado}
            onSubmit={async (data) => {
              if (bancoSelecionado?.id) {
                await base44.entities.Banco.update(bancoSelecionado.id, data);
                toast({ title: '✅ Banco atualizado!' });
              } else {
                await base44.entities.Banco.create(data);
                toast({ title: '✅ Banco criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['bancos'] });
              setBancoFormOpen(false);
              setBancoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* FORMAS DE PAGAMENTO */}
      <Dialog open={formaPagamentoFormOpen} onOpenChange={setFormaPagamentoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formaPagamentoSelecionada ? 'Editar' : 'Nova'} Forma de Pagamento</DialogTitle>
          </DialogHeader>
          <FormaPagamentoForm
            forma={formaPagamentoSelecionada}
            onSubmit={async (data) => {
              if (formaPagamentoSelecionada?.id) {
                await base44.entities.FormaPagamento.update(formaPagamentoSelecionada.id, data);
                toast({ title: '✅ Forma de pagamento atualizada!' });
              } else {
                await base44.entities.FormaPagamento.create(data);
                toast({ title: '✅ Forma de pagamento criada!' });
              }
              queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
              setFormaPagamentoFormOpen(false);
              setFormaPagamentoSelecionada(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* CENTROS DE CUSTO */}
      <Dialog open={centroCustoFormOpen} onOpenChange={setCentroCustoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{centroCustoSelecionado ? 'Editar' : 'Novo'} Centro de Custo</DialogTitle>
          </DialogHeader>
          <CentroCustoForm
            centroCusto={centroCustoSelecionado}
            onSubmit={async (data) => {
              if (centroCustoSelecionado?.id) {
                await base44.entities.CentroCusto.update(centroCustoSelecionado.id, data);
                toast({ title: '✅ Centro de custo atualizado!' });
              } else {
                await base44.entities.CentroCusto.create(data);
                toast({ title: '✅ Centro de custo criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['centrosCusto'] });
              setCentroCustoFormOpen(false);
              setCentroCustoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* VEÍCULOS */}
      <Dialog open={veiculoFormOpen} onOpenChange={setVeiculoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{veiculoSelecionado ? 'Editar' : 'Novo'} Veículo</DialogTitle>
          </DialogHeader>
          <VeiculoForm
            veiculo={veiculoSelecionado}
            onSubmit={async (data) => {
              if (veiculoSelecionado?.id) {
                await base44.entities.Veiculo.update(veiculoSelecionado.id, data);
                toast({ title: '✅ Veículo atualizado!' });
              } else {
                await base44.entities.Veiculo.create(data);
                toast({ title: '✅ Veículo criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['veiculos'] });
              setVeiculoFormOpen(false);
              setVeiculoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* MOTORISTAS */}
      <Dialog open={motoristaFormOpen} onOpenChange={setMotoristaFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{motoristaSelecionado ? 'Editar' : 'Novo'} Motorista</DialogTitle>
          </DialogHeader>
          <MotoristaForm
            motorista={motoristaSelecionado}
            onSubmit={async (data) => {
              if (motoristaSelecionado?.id) {
                await base44.entities.Motorista.update(motoristaSelecionado.id, data);
                toast({ title: '✅ Motorista atualizado!' });
              } else {
                await base44.entities.Motorista.create(data);
                toast({ title: '✅ Motorista criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['motoristas'] });
              setMotoristaFormOpen(false);
              setMotoristaSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* TIPOS DE FRETE */}
      <Dialog open={tipoFreteFormOpen} onOpenChange={setTipoFreteFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{tipoFreteSelecionado ? 'Editar' : 'Novo'} Tipo de Frete</DialogTitle>
          </DialogHeader>
          <TipoFreteForm
            tipo={tipoFreteSelecionado}
            onSubmit={async (data) => {
              if (tipoFreteSelecionado?.id) {
                await base44.entities.TipoFrete.update(tipoFreteSelecionado.id, data);
                toast({ title: '✅ Tipo de frete atualizado!' });
              } else {
                await base44.entities.TipoFrete.create(data);
                toast({ title: '✅ Tipo de frete criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['tipos-frete'] });
              setTipoFreteFormOpen(false);
              setTipoFreteSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* EMPRESAS */}
      <Dialog open={empresaFormOpen} onOpenChange={setEmpresaFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{empresaSelecionada ? 'Editar' : 'Nova'} Empresa</DialogTitle>
          </DialogHeader>
          <EmpresaForm
            empresa={empresaSelecionada}
            onSubmit={async (data) => {
              if (empresaSelecionada?.id) {
                await base44.entities.Empresa.update(empresaSelecionada.id, data);
                toast({ title: '✅ Empresa atualizada!' });
              } else {
                await base44.entities.Empresa.create(data);
                toast({ title: '✅ Empresa criada!' });
              }
              queryClient.invalidateQueries({ queryKey: ['empresas'] });
              setEmpresaFormOpen(false);
              setEmpresaSelecionada(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* GRUPOS EMPRESARIAIS */}
      <Dialog open={grupoEmpresarialFormOpen} onOpenChange={setGrupoEmpresarialFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{grupoSelecionado ? 'Editar' : 'Novo'} Grupo Empresarial</DialogTitle>
          </DialogHeader>
          <GrupoEmpresarialForm
            grupo={grupoSelecionado}
            onSubmit={async (data) => {
              if (grupoSelecionado?.id) {
                await base44.entities.GrupoEmpresarial.update(grupoSelecionado.id, data);
                toast({ title: '✅ Grupo atualizado!' });
              } else {
                await base44.entities.GrupoEmpresarial.create(data);
                toast({ title: '✅ Grupo criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['grupos'] });
              setGrupoEmpresarialFormOpen(false);
              setGrupoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* DEPARTAMENTOS */}
      <Dialog open={departamentoFormOpen} onOpenChange={setDepartamentoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{departamentoSelecionado ? 'Editar' : 'Novo'} Departamento</DialogTitle>
          </DialogHeader>
          <DepartamentoForm
            departamento={departamentoSelecionado}
            onSubmit={async (data) => {
              if (departamentoSelecionado?.id) {
                await base44.entities.Departamento.update(departamentoSelecionado.id, data);
                toast({ title: '✅ Departamento atualizado!' });
              } else {
                await base44.entities.Departamento.create(data);
                toast({ title: '✅ Departamento criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['departamentos'] });
              setDepartamentoFormOpen(false);
              setDepartamentoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* CARGOS */}
      <Dialog open={cargoFormOpen} onOpenChange={setCargoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{cargoSelecionado ? 'Editar' : 'Novo'} Cargo</DialogTitle>
          </DialogHeader>
          <CargoForm
            cargo={cargoSelecionado}
            onSubmit={async (data) => {
              if (cargoSelecionado?.id) {
                await base44.entities.Cargo.update(cargoSelecionado.id, data);
                toast({ title: '✅ Cargo atualizado!' });
              } else {
                await base44.entities.Cargo.create(data);
                toast({ title: '✅ Cargo criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['cargos'] });
              setCargoFormOpen(false);
              setCargoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* TURNOS */}
      <Dialog open={turnoFormOpen} onOpenChange={setTurnoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{turnoSelecionado ? 'Editar' : 'Novo'} Turno</DialogTitle>
          </DialogHeader>
          <TurnoForm
            turno={turnoSelecionado}
            onSubmit={async (data) => {
              if (turnoSelecionado?.id) {
                await base44.entities.Turno.update(turnoSelecionado.id, data);
                toast({ title: '✅ Turno atualizado!' });
              } else {
                await base44.entities.Turno.create(data);
                toast({ title: '✅ Turno criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['turnos'] });
              setTurnoFormOpen(false);
              setTurnoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* USUÁRIOS */}
      <Dialog open={usuarioFormOpen} onOpenChange={setUsuarioFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{usuarioSelecionado ? 'Editar' : 'Novo'} Usuário</DialogTitle>
          </DialogHeader>
          <UsuarioForm
            usuario={usuarioSelecionado}
            onSubmit={async (data) => {
              if (usuarioSelecionado?.id) {
                await base44.entities.User.update(usuarioSelecionado.id, data);
                toast({ title: '✅ Usuário atualizado!' });
              } else {
                await base44.entities.User.create(data);
                toast({ title: '✅ Usuário criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['usuarios'] });
              setUsuarioFormOpen(false);
              setUsuarioSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* PERFIS DE ACESSO */}
      <Dialog open={perfilAcessoFormOpen} onOpenChange={setPerfilAcessoFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{perfilSelecionado ? 'Editar' : 'Novo'} Perfil de Acesso</DialogTitle>
          </DialogHeader>
          <PerfilAcessoForm
            perfil={perfilSelecionado}
            onSubmit={async (data) => {
              if (perfilSelecionado?.id) {
                await base44.entities.PerfilAcesso.update(perfilSelecionado.id, data);
                toast({ title: '✅ Perfil atualizado!' });
              } else {
                await base44.entities.PerfilAcesso.create(data);
                toast({ title: '✅ Perfil criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
              setPerfilAcessoFormOpen(false);
              setPerfilSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* EVENTOS DE NOTIFICAÇÃO */}
      <Dialog open={eventoNotificacaoFormOpen} onOpenChange={setEventoNotificacaoFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{eventoSelecionado ? 'Editar' : 'Novo'} Evento de Notificação</DialogTitle>
          </DialogHeader>
          <EventoNotificacaoForm
            evento={eventoSelecionado}
            onSubmit={async (data) => {
              if (eventoSelecionado?.id) {
                await base44.entities.EventoNotificacao.update(eventoSelecionado.id, data);
                toast({ title: '✅ Evento atualizado!' });
              } else {
                await base44.entities.EventoNotificacao.create(data);
                toast({ title: '✅ Evento criado!' });
              }
              queryClient.invalidateQueries({ queryKey: ['eventos-notificacao'] });
              setEventoNotificacaoFormOpen(false);
              setEventoSelecionado(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* CONFIGURAÇÕES DE INTEGRAÇÃO */}
      <Dialog open={configIntegracaoFormOpen} onOpenChange={setConfigIntegracaoFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{configSelecionada ? 'Editar' : 'Nova'} Configuração de Integração</DialogTitle>
          </DialogHeader>
          <ConfiguracaoIntegracaoForm
            config={configSelecionada}
            onSubmit={async (data) => {
              if (configSelecionada?.id) {
                await base44.entities.ConfiguracaoIntegracaoMarketplace.update(configSelecionada.id, data);
                toast({ title: '✅ Configuração atualizada!' });
              } else {
                await base44.entities.ConfiguracaoIntegracaoMarketplace.create(data);
                toast({ title: '✅ Configuração criada!' });
              }
              queryClient.invalidateQueries({ queryKey: ['configs-integracao-marketplace'] });
              setConfigIntegracaoFormOpen(false);
              setConfigSelecionada(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}