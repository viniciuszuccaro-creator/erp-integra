import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Globe,
  Boxes,
  Network,
  Sparkles,
  Cpu,
  Mail,
  UserCheck,
  Award,
  Target,
  Receipt,
  TrendingUp,
  Briefcase,
  UserCircle,
  Clock,
  MapPin,
  FileText,
  MessageCircle,
  Shield,
  Eye
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import BancoForm from "../components/cadastros/BancoForm";
import FormaPagamentoForm from "../components/cadastros/FormaPagamentoForm";
import VeiculoForm from "../components/cadastros/VeiculoForm";
import EmpresaForm from "../components/cadastros/EmpresaForm";
import ProdutoForm from "../components/cadastros/ProdutoForm";
import ServicoForm from "../components/cadastros/ServicoForm";
import TabelaPrecoForm from "../components/cadastros/TabelaPrecoForm";
import CatalogoWebForm from "../components/cadastros/CatalogoWebForm";
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
import UsuarioForm from "../components/cadastros/UsuarioForm";
import PerfilAcessoForm from "../components/cadastros/PerfilAcessoForm";

export default function Cadastros() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [currentForm, setCurrentForm] = useState(null);
  
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

  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list(),
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

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list(),
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

  // MUTATION UNIVERSAL
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
        'Produto': 'produtos',
        'Servico': 'servicos',
        'TabelaPreco': 'tabelas-preco',
        'CatalogoWeb': 'catalogo-web',
        'Empresa': 'empresas',
        'GrupoEmpresarial': 'grupos',
        'Departamento': 'departamentos',
        'Cargo': 'cargos',
        'Turno': 'turnos',
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
        'User': 'usuarios',
        'PerfilAcesso': 'perfis-acesso'
      };
      queryClient.invalidateQueries({ queryKey: [queryMap[variables.entity]] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "✅ Cadastro criado com sucesso!" });
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
        'Produto': 'produtos',
        'Servico': 'servicos',
        'TabelaPreco': 'tabelas-preco',
        'CatalogoWeb': 'catalogo-web',
        'Empresa': 'empresas',
        'GrupoEmpresarial': 'grupos',
        'Departamento': 'departamentos',
        'Cargo': 'cargos',
        'Turno': 'turnos',
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
        'User': 'usuarios',
        'PerfilAcesso': 'perfis-acesso'
      };
      queryClient.invalidateQueries({ queryKey: [queryMap[variables.entity]] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast({ title: "✅ Cadastro atualizado com sucesso!" });
    }
  });

  const handleOpenForm = (entityName, formType, item = null) => {
    setCurrentEntity(entityName);
    setCurrentForm(formType);
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data) => {
    if (editingItem?.id) {
      updateMutation.mutate({ entity: currentEntity, id: editingItem.id, data });
    } else {
      createMutation.mutate({ entity: currentEntity, data });
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
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-gray-100 text-gray-700',
    'Prospect': 'bg-blue-100 text-blue-700',
    'Bloqueado': 'bg-red-100 text-red-700',
    'Ativa': 'bg-green-100 text-green-700'
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🚀 Cadastros Gerais
          </h1>
          <p className="text-slate-600">Hub Central - 6 Blocos Completos</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          28 IAs Ativas
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="🔍 Buscar em todos os cadastros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base shadow-md"
        />
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          <TabsTrigger value="empresa">🏢 Empresa</TabsTrigger>
          <TabsTrigger value="pessoas">👥 Pessoas</TabsTrigger>
          <TabsTrigger value="produtos">🧱 Produtos</TabsTrigger>
          <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
          <TabsTrigger value="logistica">🚚 Logística</TabsTrigger>
          <TabsTrigger value="ia">🤖 IA/APIs</TabsTrigger>
        </TabsList>

        {/* ABA EMPRESA */}
        <TabsContent value="empresa" className="space-y-6">
          {/* EMPRESAS */}
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Empresas ({empresas.length})
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenForm('Empresa', 'empresa', null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Empresa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresas.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.razao_social}</TableCell>
                      <TableCell>{e.cnpj}</TableCell>
                      <TableCell><Badge variant="outline">{e.tipo}</Badge></TableCell>
                      <TableCell><Badge className={statusColors[e.status]}>{e.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Empresa', 'empresa', e)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* GRUPOS */}
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-purple-600" />
                  Grupos Empresariais ({grupos.length})
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenForm('GrupoEmpresarial', 'grupo', null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Grupo</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Empresas</TableHead>
                    <TableHead>Score IA</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grupos.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.nome_do_grupo}</TableCell>
                      <TableCell>{g.cnpj_opcional || '-'}</TableCell>
                      <TableCell><Badge>{(g.empresas_ids || []).length}</Badge></TableCell>
                      <TableCell><Badge className="bg-blue-100 text-blue-700">{g.score_integracao_erp || 0}%</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenForm('GrupoEmpresarial', 'grupo', g)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* DEPARTAMENTOS, CARGOS, TURNOS */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Departamentos ({departamentos.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Departamento', 'departamento', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {departamentos.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{d.nome}</p>
                        <p className="text-xs text-slate-500">{d.codigo}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Departamento', 'departamento', d)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Cargos ({cargos.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Cargo', 'cargo', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cargos.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{c.nome_cargo}</p>
                        <p className="text-xs text-slate-500">{c.nivel_hierarquico}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Cargo', 'cargo', c)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Turnos ({turnos.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Turno', 'turno', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {turnos.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{t.nome_turno}</p>
                        <p className="text-xs text-slate-500">{t.horario_inicio} - {t.horario_fim}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Turno', 'turno', t)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* USUÁRIOS E PERFIS */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Usuários ({usuarios.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('User', 'usuario', null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Convidar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell><Badge>{u.role === 'admin' ? 'Admin' : 'Usuário'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenForm('User', 'usuario', u)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Perfis de Acesso ({perfisAcesso.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('PerfilAcesso', 'perfil', null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Perfil
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {perfisAcesso.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell><Badge variant="outline">{p.nivel_acesso}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleOpenForm('PerfilAcesso', 'perfil', p)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA PESSOAS */}
        <TabsContent value="pessoas" className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Clientes ({clientes.length})
                </CardTitle>
                <Button size="sm" onClick={handleNovoCliente}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell>{c.cpf || c.cnpj || '-'}</TableCell>
                      <TableCell>{c.endereco_principal?.cidade || '-'}</TableCell>
                      <TableCell><Badge className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setClienteParaPainel(c); setPainelClienteAberto(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEditarCliente(c)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Fornecedores ({fornecedores.length})
                  </CardTitle>
                  <Button size="sm" onClick={handleNovoFornecedor}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {fornecedores.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{f.nome}</p>
                        <p className="text-xs text-slate-500">{f.categoria}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setFornecedorParaPainel(f); setPainelFornecedorAberto(true); }}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEditarFornecedor(f)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Colaboradores ({colaboradores.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Colaborador', 'colaborador', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {colaboradores.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{c.nome_completo}</p>
                        <p className="text-xs text-slate-500">{c.cargo} • {c.departamento}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setColaboradorParaPainel(c); setPainelColaboradorAberto(true); }}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Colaborador', 'colaborador', c)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Transportadoras ({transportadoras.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Transportadora', 'transportadora', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transportadoras.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{t.razao_social}</p>
                        <p className="text-xs text-slate-500">{t.cnpj}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setTransportadoraParaPainel(t); setPainelTransportadoraAberto(true); }}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Transportadora', 'transportadora', t)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contatos B2B ({contatosB2B.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('ContatoB2B', 'contato', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {contatosB2B.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{c.nome_contato}</p>
                        <p className="text-xs text-slate-500">{c.email}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('ContatoB2B', 'contato', c)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Representantes ({representantes.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Representante', 'representante', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {representantes.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{r.nome}</p>
                        <p className="text-xs text-slate-500">Comissão: {r.comissao_percentual}%</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Representante', 'representante', r)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA PRODUTOS */}
        <TabsContent value="produtos" className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Produtos ({produtos.length})
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenForm('Produto', 'produto', null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs">{p.codigo}</code>
                          {p.eh_bitola && <Badge className="bg-purple-100 text-purple-700 text-xs">Bitola</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.descricao}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.grupo}</Badge></TableCell>
                      <TableCell>
                        <span className={`font-semibold ${p.estoque_atual <= p.estoque_minimo ? 'text-red-600' : 'text-green-600'}`}>
                          {p.estoque_atual || 0}
                        </span> {p.unidade_medida}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        R$ {(p.preco_venda || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Produto', 'produto', p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Factory className="w-4 h-4" />
                    Serviços ({servicos.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Servico', 'servico', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {servicos.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{s.descricao}</p>
                        <p className="text-xs text-slate-500">R$ {(s.preco_servico || 0).toFixed(2)}/{s.unidade}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Servico', 'servico', s)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Tabelas Preço ({tabelasPreco.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('TabelaPreco', 'tabela', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tabelasPreco.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{t.nome}</p>
                        <p className="text-xs text-slate-500">{t.tipo} • {t.quantidade_produtos || 0} produtos</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('TabelaPreco', 'tabela', t)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Boxes className="w-4 h-4" />
                    Grupos ({gruposProduto.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('GrupoProduto', 'grupo-produto', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gruposProduto.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{g.nome_grupo}</p>
                        <p className="text-xs text-slate-500">{g.natureza}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('GrupoProduto', 'grupo-produto', g)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Marcas ({marcas.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Marca', 'marca', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {marcas.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{m.nome_marca}</p>
                        <p className="text-xs text-slate-500">{m.categoria}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Marca', 'marca', m)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Kits ({kits.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('KitProduto', 'kit', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {kits.map(k => (
                    <div key={k.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{k.nome_kit}</p>
                        <p className="text-xs text-slate-500">{(k.itens_kit || []).length} itens</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('KitProduto', 'kit', k)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Catálogo Web ({catalogoWeb.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('CatalogoWeb', 'catalogo', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {catalogoWeb.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{c.produto_descricao}</p>
                        <p className="text-xs text-slate-500">/{c.slug_site}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('CatalogoWeb', 'catalogo', c)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-blue-600" />
                    Bancos ({bancos.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Banco', 'banco', null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Conta
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {bancos.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium">{b.nome_banco}</p>
                        <p className="text-sm text-slate-500">Ag: {b.agencia} • CC: {b.conta}-{b.conta_digito}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          R$ {(b.saldo_atual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Banco', 'banco', b)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Formas Pagamento ({formasPagamento.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('FormaPagamento', 'forma-pagamento', null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Forma
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {formasPagamento.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{f.descricao}</p>
                        <p className="text-xs text-slate-500">{f.tipo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={f.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {f.ativa ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenForm('FormaPagamento', 'forma-pagamento', f)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Plano de Contas ({planoContas.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('PlanoDeContas', 'plano-contas', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {planoContas.map(pc => (
                    <div key={pc.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{pc.codigo_conta} - {pc.descricao_conta}</p>
                        <p className="text-xs text-slate-500">{pc.tipo} • {pc.natureza}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('PlanoDeContas', 'plano-contas', pc)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Centros de Custo ({centrosCusto.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('CentroCusto', 'centro-custo', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {centrosCusto.map(cc => (
                    <div key={cc.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{cc.descricao}</p>
                        <p className="text-xs text-slate-500">{cc.codigo} • {cc.tipo}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('CentroCusto', 'centro-custo', cc)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Centros Resultado ({centrosResultado.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('CentroResultado', 'centro-resultado', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {centrosResultado.map(cr => (
                    <div key={cr.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{cr.descricao}</p>
                        <p className="text-xs text-slate-500">{cr.codigo} • {cr.tipo}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('CentroResultado', 'centro-resultado', cr)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Tipos Despesa ({tiposDespesa.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('TipoDespesa', 'tipo-despesa', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tiposDespesa.map(td => (
                    <div key={td.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{td.nome}</p>
                        <p className="text-xs text-slate-500">{td.categoria}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('TipoDespesa', 'tipo-despesa', td)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Moedas/Índices ({moedasIndices.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('MoedaIndice', 'moeda', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {moedasIndices.map(mi => (
                    <div key={mi.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{mi.codigo} - {mi.nome}</p>
                        <p className="text-xs text-slate-500">{mi.simbolo} {(mi.valor_atual || 0).toFixed(4)}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('MoedaIndice', 'moeda', mi)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA LOGÍSTICA */}
        <TabsContent value="logistica" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-600" />
                    Veículos ({veiculos.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Veiculo', 'veiculo', null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Veículo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {veiculos.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-4 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-bold">{v.placa}</p>
                        <p className="text-sm text-slate-600">{v.modelo} • {v.tipo_veiculo}</p>
                        <p className="text-xs text-slate-500">Cap: {v.capacidade_kg}kg • {v.km_atual || 0}km</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Veiculo', 'veiculo', v)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Motoristas ({motoristas.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('Motorista', 'motorista', null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Motorista
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {motoristas.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{m.nome_completo}</p>
                        <p className="text-xs text-slate-500">CNH: {m.cnh_categoria} • {m.cnh_numero}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('Motorista', 'motorista', m)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Tipos Frete ({tiposFrete.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('TipoFrete', 'tipo-frete', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tiposFrete.map(tf => (
                    <div key={tf.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{tf.descricao}</p>
                        <p className="text-xs text-slate-500">{tf.modalidade}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('TipoFrete', 'tipo-frete', tf)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Modelos PDF ({modelosDocumento.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => handleOpenForm('ModeloDocumento', 'modelo', null)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {modelosDocumento.map(md => (
                    <div key={md.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-sm">{md.nome_modelo}</p>
                        <p className="text-xs text-slate-500">{md.tipo_documento}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenForm('ModeloDocumento', 'modelo', md)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA IA */}
        <TabsContent value="ia" className="space-y-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-purple-600" />
                Motor de IA - 28 Motores Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">🤖 IA Cadastro Automático</p>
                  <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                </div>
                <div className="p-4 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">🔍 IA KYC/KYB</p>
                  <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                </div>
                <div className="p-4 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">💰 IA PriceBrain</p>
                  <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                </div>
                <div className="p-4 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">📊 IA DIFAL</p>
                  <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                </div>
                <div className="p-4 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">🚛 IA Manutenção</p>
                  <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                </div>
                <div className="p-4 bg-white rounded border">
                  <p className="font-semibold text-sm mb-2">🗺️ IA Roteirização</p>
                  <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODAL UNIVERSAL */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? 'Editar' : 'Novo'}{' '}
              {currentForm === 'empresa' && 'Empresa'}
              {currentForm === 'grupo' && 'Grupo'}
              {currentForm === 'departamento' && 'Departamento'}
              {currentForm === 'cargo' && 'Cargo'}
              {currentForm === 'turno' && 'Turno'}
              {currentForm === 'usuario' && 'Usuário'}
              {currentForm === 'perfil' && 'Perfil'}
              {currentForm === 'colaborador' && 'Colaborador'}
              {currentForm === 'transportadora' && 'Transportadora'}
              {currentForm === 'contato' && 'Contato B2B'}
              {currentForm === 'representante' && 'Representante'}
              {currentForm === 'produto' && 'Produto'}
              {currentForm === 'servico' && 'Serviço'}
              {currentForm === 'tabela' && 'Tabela de Preço'}
              {currentForm === 'catalogo' && 'Catálogo Web'}
              {currentForm === 'grupo-produto' && 'Grupo de Produtos'}
              {currentForm === 'marca' && 'Marca'}
              {currentForm === 'kit' && 'Kit'}
              {currentForm === 'banco' && 'Banco'}
              {currentForm === 'forma-pagamento' && 'Forma de Pagamento'}
              {currentForm === 'plano-contas' && 'Plano de Contas'}
              {currentForm === 'centro-custo' && 'Centro de Custo'}
              {currentForm === 'centro-resultado' && 'Centro de Resultado'}
              {currentForm === 'tipo-despesa' && 'Tipo de Despesa'}
              {currentForm === 'moeda' && 'Moeda/Índice'}
              {currentForm === 'veiculo' && 'Veículo'}
              {currentForm === 'motorista' && 'Motorista'}
              {currentForm === 'tipo-frete' && 'Tipo de Frete'}
              {currentForm === 'modelo' && 'Modelo de Documento'}
            </DialogTitle>
          </DialogHeader>
          
          {currentForm === 'empresa' && <EmpresaForm empresa={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'grupo' && <GrupoEmpresarialForm grupo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'departamento' && <DepartamentoForm departamento={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'cargo' && <CargoForm cargo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'turno' && <TurnoForm turno={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'usuario' && <UsuarioForm usuario={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'perfil' && <PerfilAcessoForm perfil={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'colaborador' && <ColaboradorForm colaborador={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'transportadora' && <TransportadoraForm transportadora={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'contato' && <ContatoB2BForm contato={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'representante' && <RepresentanteForm representante={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'produto' && <ProdutoForm produto={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'servico' && <ServicoForm servico={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'tabela' && <TabelaPrecoForm tabela={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'catalogo' && <CatalogoWebForm catalogoItem={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'grupo-produto' && <GrupoProdutoForm grupo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'marca' && <MarcaForm marca={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'kit' && <KitProdutoForm kit={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'banco' && <BancoForm banco={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'forma-pagamento' && <FormaPagamentoForm forma={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'plano-contas' && <PlanoContasForm conta={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'centro-custo' && <CentroCustoForm centroCusto={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'centro-resultado' && <CentroResultadoForm centro={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'tipo-despesa' && <TipoDespesaForm tipo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'moeda' && <MoedaIndiceForm moeda={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'veiculo' && <VeiculoForm veiculo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'motorista' && <MotoristaForm motorista={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'tipo-frete' && <TipoFreteForm tipo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
          {currentForm === 'modelo' && <ModeloDocumentoForm modelo={editingItem} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} />}
        </DialogContent>
      </Dialog>

      {/* PAINÉIS DINÂMICOS */}
      <CadastroClienteCompleto
        cliente={clienteSelecionado}
        isOpen={cadastroCompletoAberto}
        onClose={() => {
          setCadastroCompletoAberto(false);
          setClienteSelecionado(null);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['clientes'] })}
      />

      <CadastroFornecedorCompleto
        fornecedor={fornecedorSelecionado}
        isOpen={cadastroFornecedorAberto}
        onClose={() => {
          setCadastroFornecedorAberto(false);
          setFornecedorSelecionado(null);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['fornecedores'] })}
      />

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

      <PainelDinamicoTransportadora
        transportadora={transportadoraParaPainel}
        isOpen={painelTransportadoraAberto}
        onClose={() => { setPainelTransportadoraAberto(false); setTransportadoraParaPainel(null); }}
        onEdit={(t) => {
          setPainelTransportadoraAberto(false);
          handleOpenForm('Transportadora', 'transportadora', t);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['transportadoras'] })}
      />

      <PainelDinamicoColaborador
        colaborador={colaboradorParaPainel}
        isOpen={painelColaboradorAberto}
        onClose={() => { setPainelColaboradorAberto(false); setColaboradorParaPainel(null); }}
        onEdit={(c) => {
          setPainelColaboradorAberto(false);
          handleOpenForm('Colaborador', 'colaborador', c);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['colaboradores'] })}
      />
    </div>
  );
}