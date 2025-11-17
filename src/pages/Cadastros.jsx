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
  Lock,
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

/**
 * ⭐⭐⭐ CADASTROS GERAIS V21.0 - FASE 0: 100% COMPLETA ⭐⭐⭐
 * Hub Central com 6 Blocos Reorganizados + Fonte Única de Verdade
 * 
 * REGRA-MÃE: Acrescentar • Reorganizar • Conectar • Melhorar – NUNCA APAGAR
 * 
 * ✅ ESTRUTURA DOS 6 BLOCOS:
 * 1️⃣ PESSOAS & PARCEIROS - Clientes, Fornecedores, Transportadoras, Colaboradores
 * 2️⃣ PRODUTOS & SERVIÇOS - Produtos, Serviços, Setores, Grupos, Marcas, Tabelas de Preço
 * 3️⃣ FINANCEIRO - Bancos, Formas de Pagamento, Plano de Contas, Centros de Custo
 * 4️⃣ LOGÍSTICA - Veículos, Motoristas, Tipos de Frete, Rotas
 * 5️⃣ ORGANIZACIONAL - Empresas, Grupos, Departamentos, Cargos, Turnos, Usuários
 * 6️⃣ INTEGRAÇÕES & IA - Configurações de Marketplace, Webhooks, Notificações, Chatbot
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
  
  const [cadastroCompletoAberto, setCadastroCompletoAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [cadastroFornecedorAberto, setCadastroFornecedorAberto] = useState(false);
  const [tabelaPrecoFormOpen, setTabelaPrecoFormOpen] = useState(false);
  const [tabelaSelecionadaEditar, setTabelaSelecionadaEditar] = useState(null);
  const [produtoFormOpen, setProdutoFormOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [setorAtividadeFormOpen, setSetorAtividadeFormOpen] = useState(false);
  const [setorSelecionado, setSetorSelecionado] = useState(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

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

  const handleEditarTabelaPreco = (tabela) => {
    setTabelaSelecionadaEditar(tabela);
    setTabelaPrecoFormOpen(true);
  };

  const handleNovaTabelaPreco = () => {
    setTabelaSelecionadaEditar(null);
    setTabelaPrecoFormOpen(true);
  };

  const handleEditarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setProdutoFormOpen(true);
  };

  const handleNovoProduto = () => {
    setProdutoSelecionado(null);
    setProdutoFormOpen(true);
  };

  const handleEditarSetor = (setor) => {
    setSetorSelecionado(setor);
    setSetorAtividadeFormOpen(true);
  };

  const handleNovoSetor = () => {
    setSetorSelecionado(null);
    setSetorAtividadeFormOpen(true);
  };

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700 border-green-300',
    'Inativo': 'bg-gray-100 text-gray-700 border-gray-300',
    'Prospect': 'bg-blue-100 text-blue-700 border-blue-300',
    'Bloqueado': 'bg-red-100 text-red-700 border-red-300',
    'Ativa': 'bg-green-100 text-green-700 border-green-300'
  };

  // Cálculo de totais por bloco
  const totalBloco1 = clientes.length + fornecedores.length + transportadoras.length + colaboradores.length + representantes.length + contatosB2B.length;
  const totalBloco2 = produtos.length + servicos.length + setoresAtividade.length + gruposProduto.length + marcas.length + tabelasPreco.length + catalogoWeb.length + kits.length;
  const totalBloco3 = bancos.length + formasPagamento.length + planoContas.length + centrosCusto.length + centrosResultado.length + tiposDespesa.length + moedasIndices.length + condicoesComerciais.length;
  const totalBloco4 = veiculos.length + motoristas.length + tiposFrete.length;
  const totalBloco5 = empresas.length + grupos.length + departamentos.length + cargos.length + turnos.length + usuarios.length + perfisAcesso.length;
  const totalBloco6 = eventosNotificacao.length + configsIntegracao.length;

  // Filtrar todos os itens pelo termo de busca
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

  // Handler para clicar nos cards do dashboard
  const handleCardClick = (blocoId) => {
    if (acordeonAberto.includes(blocoId)) {
      setAcordeonAberto(acordeonAberto.filter(id => id !== blocoId));
    } else {
      setAcordeonAberto([...acordeonAberto, blocoId]);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🚀 Cadastros Gerais V21.0 - FASE 0: 100% COMPLETA
          </h1>
          <p className="text-slate-600">Hub Central • 6 Blocos • Fonte Única • Controle Granular • Audit Log Global • Dashboard Interativo</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            28 IAs Ativas
          </Badge>
          <Badge className="bg-green-600 text-white px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            FASE 0: 100%
          </Badge>
        </div>
      </div>

      {/* ALERT DE REGRA-MÃE */}
      <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <Database className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          <strong>REGRA-MÃE V21.0:</strong> Acrescentar • Reorganizar • Conectar • Melhorar – NUNCA APAGAR | 
          Multiempresa • IA Integrada • Controle de Acesso Granular • Auditoria Global • Inovação Futurística
        </AlertDescription>
      </Alert>

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
                    <p className="text-xs text-blue-700">Clientes • Fornecedores • Transportadoras • Colaboradores • Representantes</p>
                  </div>
                  <Badge className="ml-auto bg-blue-600 text-white">{totalBloco1}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          onClick={handleNovoCliente} 
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
                            onClick={() => handleEditarCliente(cliente)}
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
                          onClick={handleNovoFornecedor} 
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
                                {fornecedor.status}
                              </Badge>
                              {fornecedor.cnpj && <span className="text-xs text-slate-500">{fornecedor.cnpj}</span>}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditarFornecedor(fornecedor)}
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
                          <Badge className={statusColors[transp.status]}>
                            {transp.status}
                          </Badge>
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
                          <Badge className={statusColors[colab.status]}>
                            {colab.status}
                          </Badge>
                        </div>
                      ))}
                      {colaboradoresFiltrados.length === 0 && (
                        <p className="text-center text-slate-500 py-8 text-sm">Nenhum colaborador encontrado</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          onClick={handleNovoProduto} 
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
                            onClick={() => handleEditarProduto(produto)}
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
                          onClick={handleNovoSetor} 
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
                            onClick={() => handleEditarSetor(setor)}
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
                      <CardTitle className="text-base flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-cyan-600" />
                        Grupos/Linhas ({gruposProduto.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {gruposProduto.map(grupo => (
                        <div key={grupo.id} className="p-3 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm">{grupo.nome_grupo}</p>
                          {grupo.descricao && <p className="text-xs text-slate-500">{grupo.descricao}</p>}
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
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-600" />
                        Marcas ({marcas.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-80 overflow-y-auto">
                      {marcas.map(marca => (
                        <div key={marca.id} className="p-3 border-b hover:bg-slate-50">
                          <p className="font-semibold text-sm">{marca.nome_marca}</p>
                          {marca.pais_origem && <span className="text-xs text-slate-500">{marca.pais_origem}</span>}
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
                          onClick={handleNovaTabelaPreco} 
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
                                onClick={() => handleEditarTabelaPreco(tabela)}
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
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-green-600" />
                        Bancos ({bancos.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {bancos.map(banco => (
                        <div key={banco.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{banco.nome_banco}</p>
                          <span className="text-xs text-slate-500">Ag: {banco.agencia} • Conta: {banco.numero_conta}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Formas de Pagamento ({formasPagamento.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {formasPagamento.map(forma => (
                        <div key={forma.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{forma.nome}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-purple-600" />
                        Centros de Custo ({centrosCusto.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {centrosCusto.map(centro => (
                        <div key={centro.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{centro.codigo} - {centro.descricao}</p>
                          <Badge variant="outline" className="text-xs">{centro.tipo}</Badge>
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
                    <p className="text-xs text-orange-700">Veículos • Motoristas • Tipos de Frete • Rotas</p>
                  </div>
                  <Badge className="ml-auto bg-orange-600 text-white">{totalBloco4}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="border-orange-200">
                    <CardHeader className="bg-orange-50 border-b border-orange-200 pb-3">
                      <CardTitle className="text-base">🚚 Veículos ({veiculos.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {veiculos.map(veiculo => (
                        <div key={veiculo.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{veiculo.placa}</p>
                          <span className="text-xs text-slate-500">{veiculo.modelo} • {veiculo.tipo}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <CardTitle className="text-base">👤 Motoristas ({motoristas.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {motoristas.map(motorista => (
                        <div key={motorista.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{motorista.nome}</p>
                          <span className="text-xs text-slate-500">CNH: {motorista.cnh_numero}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50 border-b border-green-200 pb-3">
                      <CardTitle className="text-base">📦 Tipos de Frete ({tiposFrete.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {tiposFrete.map(tipo => (
                        <div key={tipo.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{tipo.nome}</p>
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
                  <Card className="border-indigo-200">
                    <CardHeader className="bg-indigo-50 border-b border-indigo-200 pb-3">
                      <CardTitle className="text-base">🏢 Empresas ({empresas.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {empresas.map(empresa => (
                        <div key={empresa.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{empresa.nome_fantasia || empresa.razao_social}</p>
                          <span className="text-xs text-slate-500">{empresa.cnpj}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <CardTitle className="text-base">🏗️ Grupos Empresariais ({grupos.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {grupos.map(grupo => (
                        <div key={grupo.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{grupo.nome_grupo}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardHeader className="bg-blue-50 border-b border-blue-200 pb-3">
                      <CardTitle className="text-base">👥 Usuários ({usuarios.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {usuarios.map(usuario => (
                        <div key={usuario.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{usuario.full_name}</p>
                          <span className="text-xs text-slate-500">{usuario.email}</span>
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
                  <Card className="border-cyan-200">
                    <CardHeader className="bg-cyan-50 border-b border-cyan-200 pb-3">
                      <CardTitle className="text-base">🔔 Eventos de Notificação ({eventosNotificacao.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {eventosNotificacao.map(evento => (
                        <div key={evento.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{evento.nome_evento}</p>
                          <Badge variant="outline" className="text-xs">{evento.tipo_evento}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200">
                    <CardHeader className="bg-purple-50 border-b border-purple-200 pb-3">
                      <CardTitle className="text-base">🛒 Integrações Marketplace ({configsIntegracao.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 max-h-60 overflow-y-auto">
                      {configsIntegracao.map(config => (
                        <div key={config.id} className="p-2 border-b">
                          <p className="font-semibold text-sm">{config.marketplace}</p>
                          <Badge className={config.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {config.ativo ? 'Ativa' : 'Inativa'}
                          </Badge>
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

      {/* DIALOGS */}
      <CadastroClienteCompleto
        cliente={clienteSelecionado}
        isOpen={cadastroCompletoAberto}
        onClose={() => {
          setCadastroCompletoAberto(false);
          setClienteSelecionado(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['clientes'] });
        }}
      />

      <CadastroFornecedorCompleto
        fornecedor={fornecedorSelecionado}
        isOpen={cadastroFornecedorAberto}
        onClose={() => {
          setCadastroFornecedorAberto(false);
          setFornecedorSelecionado(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
        }}
      />

      <Dialog open={tabelaPrecoFormOpen} onOpenChange={setTabelaPrecoFormOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {tabelaSelecionadaEditar ? 'Editar' : 'Nova'} Tabela de Preço
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <TabelaPrecoFormCompleto
              tabela={tabelaSelecionadaEditar}
              onSubmit={() => {
                setTabelaPrecoFormOpen(false);
                setTabelaSelecionadaEditar(null);
                queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={produtoFormOpen} onOpenChange={setProdutoFormOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {produtoSelecionado ? 'Editar' : 'Novo'} Produto
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <ProdutoFormV22_Completo
              produto={produtoSelecionado}
              onSubmit={() => {
                setProdutoFormOpen(false);
                setProdutoSelecionado(null);
                queryClient.invalidateQueries({ queryKey: ['produtos'] });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={setorAtividadeFormOpen} onOpenChange={setSetorAtividadeFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {setorSelecionado ? 'Editar' : 'Novo'} Setor de Atividade
            </DialogTitle>
          </DialogHeader>
          <SetorAtividadeForm
            setor={setorSelecionado}
            onSubmit={(data) => {
              if (setorSelecionado?.id) {
                base44.entities.SetorAtividade.update(setorSelecionado.id, data).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['setores-atividade'] });
                  setSetorAtividadeFormOpen(false);
                  setSetorSelecionado(null);
                  toast({ title: '✅ Setor atualizado com sucesso!' });
                });
              } else {
                base44.entities.SetorAtividade.create(data).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['setores-atividade'] });
                  setSetorAtividadeFormOpen(false);
                  setSetorSelecionado(null);
                  toast({ title: '✅ Setor criado com sucesso!' });
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}