import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  Shield, Users, Building2, CheckCircle, XCircle, Plus, Edit, Search, Settings,
  Eye, Pencil, Trash2, AlertTriangle, RefreshCw, Sparkles, UserPlus, UserCheck,
  Key, ShieldCheck, CheckSquare, LayoutDashboard, ShoppingCart, DollarSign,
  Package, Truck, Factory, UserCircle, FileText, BarChart3, Download,
  MessageCircle, Briefcase, Calendar, Layers, ChevronDown, Info
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { createPageUrl } from "@/utils";
import IAAnaliseSegurancaPerfis from "./IAAnaliseSegurancaPerfis";
import TemplatesPerfisInteligentes, { TEMPLATES_PERFIS } from "./TemplatesPerfisInteligentes";
import ComparadorPerfisVisual from "./ComparadorPerfisVisual";
import DashboardSegurancaPerfis from "./DashboardSegurancaPerfis";
import VisualizadorPermissoesPerfil from "./VisualizadorPermissoesPerfil";
import FormularioPerfilAcesso from "./FormularioPerfilAcesso";
import { useWindow } from "@/components/lib/useWindow";

/**
 * 🏆 CENTRAL DE PERFIS DE ACESSO V21.7 - 100% GRANULAR E COMPLETO
 * 
 * ESTRUTURA COMPLETA E GRANULAR:
 * ✅ Módulo → Seção → Aba → Ações (visualizar, criar, editar, excluir, aprovar, exportar)
 * ✅ Controle fino: cada aba de cada seção pode ter permissões independentes
 * ✅ Seleção em massa: tudo, por módulo, por seção, por aba
 * ✅ Perfis com CRUD completo (criar, editar, EXCLUIR)
 * ✅ Usuários: vincular empresas E grupos simultaneamente
 * ✅ Integrado com GerenciamentoAcessosCompleto (modo avançado)
 * ✅ Salvamento garantido com validação
 * 
 * REGRA-MÃE: Acrescentar • Reorganizar • Conectar • Melhorar ✅
 */

// ESTRUTURA COMPLETA DO SISTEMA - MESMA DO GerenciamentoAcessosCompleto
const ESTRUTURA_SISTEMA = {
  dashboard: {
    nome: "Dashboard",
    icone: LayoutDashboard,
    cor: "blue",
    secoes: {
      principal: { nome: "Visão Geral", abas: ["kpis", "graficos", "alertas"] },
      corporativo: { nome: "Dashboard Corporativo", abas: ["multiempresa", "consolidado"] }
    }
  },
  comercial: {
    nome: "Comercial e Vendas",
    icone: ShoppingCart,
    cor: "green",
    secoes: {
      clientes: { nome: "Clientes", abas: ["lista", "detalhes", "historico", "crm"] },
      pedidos: { nome: "Pedidos", abas: ["lista", "novo", "aprovacao", "faturamento"] },
      orcamentos: { nome: "Orçamentos", abas: ["lista", "novo", "conversao"] },
      tabelas_preco: { nome: "Tabelas de Preço", abas: ["lista", "itens", "clientes_vinculados"] },
      comissoes: { nome: "Comissões", abas: ["lista", "calculo", "pagamento"] },
      notas_fiscais: { nome: "Notas Fiscais", abas: ["emissao", "lista", "cancelamento"] }
    }
  },
  financeiro: {
    nome: "Financeiro e Contábil",
    icone: DollarSign,
    cor: "emerald",
    secoes: {
      contas_receber: { nome: "Contas a Receber", abas: ["lista", "baixa", "cobranca", "boletos"] },
      contas_pagar: { nome: "Contas a Pagar", abas: ["lista", "baixa", "aprovacao", "pagamento"] },
      caixa: { nome: "Caixa Diário", abas: ["movimentos", "fechamento", "transferencias"] },
      conciliacao: { nome: "Conciliação Bancária", abas: ["importar", "conciliar", "historico"] },
      relatorios: { nome: "Relatórios Financeiros", abas: ["dre", "fluxo_caixa", "inadimplencia"] }
    }
  },
  estoque: {
    nome: "Estoque e Almoxarifado",
    icone: Package,
    cor: "purple",
    secoes: {
      produtos: { nome: "Produtos", abas: ["lista", "novo", "lotes", "validade"] },
      movimentacoes: { nome: "Movimentações", abas: ["entrada", "saida", "transferencia", "ajuste"] },
      inventario: { nome: "Inventário", abas: ["contagem", "acerto", "historico"] },
      requisicoes: { nome: "Requisições", abas: ["lista", "aprovacao", "atendimento"] }
    }
  },
  compras: {
    nome: "Compras e Suprimentos",
    icone: Briefcase,
    cor: "orange",
    secoes: {
      fornecedores: { nome: "Fornecedores", abas: ["lista", "avaliacao", "historico"] },
      solicitacoes: { nome: "Solicitações", abas: ["lista", "nova", "aprovacao"] },
      cotacoes: { nome: "Cotações", abas: ["lista", "nova", "comparativo"] },
      ordens_compra: { nome: "Ordens de Compra", abas: ["lista", "nova", "recebimento"] }
    }
  },
  expedicao: {
    nome: "Expedição e Logística",
    icone: Truck,
    cor: "cyan",
    secoes: {
      entregas: { nome: "Entregas", abas: ["lista", "separacao", "despacho", "rastreamento"] },
      romaneios: { nome: "Romaneios", abas: ["lista", "novo", "impressao"] },
      roteirizacao: { nome: "Roteirização", abas: ["mapa", "otimizacao", "motoristas"] },
      transportadoras: { nome: "Transportadoras", abas: ["lista", "tabelas_frete"] }
    }
  },
  producao: {
    nome: "Produção e Manufatura",
    icone: Factory,
    cor: "indigo",
    secoes: {
      ordens_producao: { nome: "Ordens de Produção", abas: ["lista", "nova", "programacao", "kanban"] },
      apontamentos: { nome: "Apontamentos", abas: ["producao", "paradas", "refugo"] },
      qualidade: { nome: "Qualidade", abas: ["inspecao", "nao_conformidades", "acoes"] }
    }
  },
  rh: {
    nome: "Recursos Humanos",
    icone: UserCircle,
    cor: "pink",
    secoes: {
      colaboradores: { nome: "Colaboradores", abas: ["lista", "documentos", "historico"] },
      ponto: { nome: "Ponto Eletrônico", abas: ["registros", "ajustes", "relatorios"] },
      ferias: { nome: "Férias", abas: ["programacao", "solicitacoes", "aprovacao"] },
      folha: { nome: "Folha de Pagamento", abas: ["calculo", "holerites", "encargos"] }
    }
  },
  fiscal: {
    nome: "Fiscal e Tributário",
    icone: FileText,
    cor: "red",
    secoes: {
      nfe: { nome: "NF-e", abas: ["emissao", "entrada", "manifestacao", "inutilizacao"] },
      tabelas_fiscais: { nome: "Tabelas Fiscais", abas: ["cfop", "cst", "ncm", "aliquotas"] },
      sped: { nome: "SPED", abas: ["fiscal", "contribuicoes", "contabil"] }
    }
  },
  cadastros_gerais: {
    nome: "Cadastros Gerais",
    icone: Users,
    cor: "slate",
    secoes: {
      clientes: { nome: "Clientes", abas: ["lista", "novo", "historico"] },
      fornecedores: { nome: "Fornecedores", abas: ["lista", "novo", "avaliacoes"] },
      produtos: { nome: "Produtos", abas: ["lista", "novo", "importacao"] },
      colaboradores: { nome: "Colaboradores", abas: ["lista", "novo", "documentos"] },
      usuarios: { nome: "Usuários", abas: ["lista", "novo", "permissoes"] },
      empresas: { nome: "Empresas", abas: ["lista", "novo", "config"] }
    }
  },
  crm: {
    nome: "CRM - Relacionamento",
    icone: MessageCircle,
    cor: "violet",
    secoes: {
      oportunidades: { nome: "Oportunidades", abas: ["funil", "lista", "conversao"] },
      interacoes: { nome: "Interações", abas: ["historico", "nova", "follow_up"] },
      campanhas: { nome: "Campanhas", abas: ["lista", "nova", "resultados"] }
    }
  },
  relatorios: {
    nome: "Relatórios e Análises",
    icone: BarChart3,
    cor: "teal",
    secoes: {
      dashboards: { nome: "Dashboards", abas: ["executivo", "operacional", "financeiro"] },
      relatorios: { nome: "Relatórios", abas: ["vendas", "estoque", "financeiro", "rh"] },
      exportacao: { nome: "Exportação", abas: ["excel", "pdf", "api"] }
    }
  },
  chatbot: {
    nome: "Hub de Atendimento",
    icone: MessageCircle,
    cor: "green",
    secoes: {
      atendimento: { nome: "Atendimento", abas: ["conversas", "fila", "transferencia"] },
      configuracoes: { nome: "Configurações", abas: ["canais", "templates", "base_conhecimento"] }
    }
  }
};

const ACOES = [
  { id: "visualizar", nome: "Visualizar", icone: Eye, cor: "slate" },
  { id: "criar", nome: "Criar", icone: Plus, cor: "blue" },
  { id: "editar", nome: "Editar", icone: Pencil, cor: "green" },
  { id: "excluir", nome: "Excluir", icone: Trash2, cor: "red" },
  { id: "aprovar", nome: "Aprovar", icone: CheckSquare, cor: "purple" },
  { id: "exportar", nome: "Exportar", icone: Download, cor: "cyan" }
];

export default function CentralPerfisAcesso() {
  const [activeTab, setActiveTab] = useState("perfis");
  const [usuarioAberto, setUsuarioAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [modoTemplate, setModoTemplate] = useState(false);
  const [modoComparador, setModoComparador] = useState(false);
  const [perfilComparar1, setPerfilComparar1] = useState(null);
  const [perfilComparar2, setPerfilComparar2] = useState(null);
  const [perfilVisualizacao, setPerfilVisualizacao] = useState(null);

  const queryClient = useQueryClient();
  const { empresaAtual, empresasDoGrupo, estaNoGrupo } = useContextoVisual();
  const { user } = usePermissions();
  const { openWindow } = useWindow();

  // Queries
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn: () => base44.entities.GrupoEmpresarial.list(),
  });

  // Mutations
  const salvarPerfilMutation = useMutation({
    mutationFn: async ({ perfil, data }) => {
      console.log("📝 Salvando perfil com permissões:", data);
      const perfilId = perfil?.id;
      const dadosComGrupo = {
        ...data,
        group_id: empresaAtual?.group_id || null
      };
      if (perfilId && !perfil.novo) {
        return await base44.entities.PerfilAcesso.update(perfilId, dadosComGrupo);
      } else {
        return await base44.entities.PerfilAcesso.create(dadosComGrupo);
      }
    },
    onSuccess: (result) => {
      console.log("✅ Perfil salvo com sucesso:", result);
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      toast.success("✅ Perfil salvo com sucesso!");
    },
    onError: (error) => {
      console.error("❌ Erro ao salvar perfil:", error);
      toast.error("❌ Erro ao salvar: " + error.message);
    }
  });

  const excluirPerfilMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.PerfilAcesso.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      toast.success("🗑️ Perfil excluído!");
    },
    onError: (error) => {
      toast.error("❌ Erro: " + error.message);
    }
  });

  const atualizarUsuarioMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.User.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success("✅ Usuário atualizado!");
    },
    onError: (error) => {
      toast.error("❌ Erro: " + error.message);
    }
  });

  const abrirEdicaoPerfil = (perfil) => {
    openWindow({
      id: `perfil-${perfil.id || 'novo'}`,
      title: perfil.novo ? '✨ Novo Perfil de Acesso' : `✏️ Editar: ${perfil.nome_perfil}`,
      component: FormularioPerfilAcesso,
      props: {
        perfil: perfil,
        estruturaSistema: ESTRUTURA_SISTEMA,
        onSalvar: async (dadosPerfil) => {
          const dadosSalvar = {
            ...dadosPerfil,
            group_id: empresaAtual?.group_id || null
          };
          console.log("💾 Salvando perfil:", dadosSalvar);
          await salvarPerfilMutation.mutateAsync({ perfil, data: dadosSalvar });
          return true;
        },
        onCancelar: () => {}
      },
      defaultWidth: 1200,
      defaultHeight: 800,
      minWidth: 900,
      minHeight: 600
    });
  };

  const aplicarTemplate = (template) => {
    openWindow({
      id: `perfil-template-${Date.now()}`,
      title: `✨ Novo Perfil (Template: ${template.nome})`,
      component: FormularioPerfilAcesso,
      props: {
        perfil: { 
          novo: true,
          nome_perfil: template.nome,
          descricao: template.descricao,
          nivel_perfil: template.nivel,
          permissoes: template.permissoes,
          ativo: true
        },
        estruturaSistema: ESTRUTURA_SISTEMA,
        onSalvar: async (dadosPerfil) => {
          const dadosSalvar = {
            ...dadosPerfil,
            group_id: empresaAtual?.group_id || null
          };
          await salvarPerfilMutation.mutateAsync({ perfil: { novo: true }, data: dadosSalvar });
          return true;
        },
        onCancelar: () => {}
      },
      defaultWidth: 1200,
      defaultHeight: 800,
      minWidth: 900,
      minHeight: 600
    });
    setModoTemplate(false);
    toast.success(`✅ Template "${template.nome}" aplicado em nova janela!`);
  };

  const abrirComparador = () => {
    if (perfis.length < 2) {
      toast.error("❌ É necessário ter pelo menos 2 perfis para comparar");
      return;
    }
    setModoComparador(true);
    setPerfilComparar1(perfis[0]?.id || null);
    setPerfilComparar2(perfis[1]?.id || null);
  };

  const handleVincularEmpresa = (usuario, empresaId, acao) => {
    const vinculosAtuais = usuario.empresas_vinculadas || [];
    let novosVinculos;

    if (acao === 'adicionar') {
      if (!vinculosAtuais.some(v => v.empresa_id === empresaId)) {
        novosVinculos = [
          ...vinculosAtuais,
          {
            empresa_id: empresaId,
            ativo: true,
            nivel_acesso: 'Operacional',
            data_vinculo: new Date().toISOString()
          }
        ];
      } else {
        toast.error("Empresa já vinculada");
        return;
      }
    } else {
      novosVinculos = vinculosAtuais.filter(v => v.empresa_id !== empresaId);
    }

    const nomesEmpresas = novosVinculos.map(v => {
      const emp = empresas.find(e => e.id === v.empresa_id);
      return emp?.nome_fantasia || emp?.razao_social || v.empresa_id;
    });

    atualizarUsuarioMutation.mutate({
      id: usuario.id,
      data: {
        empresas_vinculadas: novosVinculos,
        empresas_vinculadas_nomes: nomesEmpresas
      }
    });
  };

  const handleVincularGrupo = (usuario, grupoId, acao) => {
    const vinculosAtuais = usuario.grupos_vinculados || [];
    let novosVinculos;

    if (acao === 'adicionar') {
      if (!vinculosAtuais.some(v => v.grupo_id === grupoId)) {
        novosVinculos = [
          ...vinculosAtuais,
          {
            grupo_id: grupoId,
            ativo: true,
            data_vinculo: new Date().toISOString()
          }
        ];
      } else {
        toast.error("Grupo já vinculado");
        return;
      }
    } else {
      novosVinculos = vinculosAtuais.filter(v => v.grupo_id !== grupoId);
    }

    atualizarUsuarioMutation.mutate({
      id: usuario.id,
      data: {
        grupos_vinculados: novosVinculos,
        pode_operar_em_grupo: novosVinculos.length > 0
      }
    });
  };

  // Estatísticas
  const stats = useMemo(() => {
    const totalPerfis = perfis.length;
    const perfisAtivos = perfis.filter(p => p.ativo !== false).length;
    const totalUsuarios = usuarios.length;
    const usuariosComPerfil = usuarios.filter(u => u.perfil_acesso_id).length;
    const usuariosSemPerfil = totalUsuarios - usuariosComPerfil;
    const cobertura = totalUsuarios > 0 ? Math.round((usuariosComPerfil / totalUsuarios) * 100) : 0;

    return {
      totalPerfis,
      perfisAtivos,
      totalUsuarios,
      usuariosComPerfil,
      usuariosSemPerfil,
      cobertura
    };
  }, [perfis, usuarios]);

  // Filtros
  const perfisFiltrados = perfis.filter(p => 
    !busca || p.nome_perfil?.toLowerCase().includes(busca.toLowerCase())
  );

  const usuariosFiltrados = usuarios.filter(u => 
    !busca || 
    u.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Central de Perfis de Acesso</h1>
                <p className="text-blue-100">Controle Granular Total • Módulo → Seção → Aba → Ações</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Badge className="bg-white/20 px-4 py-2">
                {stats.totalPerfis} Perfis
              </Badge>
              <Badge className="bg-white/20 px-4 py-2">
                {stats.totalUsuarios} Usuários
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => window.open(createPageUrl('GerenciamentoAcessosCompleto'), '_blank')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Modo Avançado (16 Componentes)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <Shield className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.totalPerfis}</p>
            <p className="text-sm opacity-90">Perfis Criados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <Users className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.totalUsuarios}</p>
            <p className="text-sm opacity-90">Usuários</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <UserCheck className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.usuariosComPerfil}</p>
            <p className="text-sm opacity-90">Com Perfil</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.usuariosSemPerfil > 0 ? 'from-orange-500 to-orange-600' : 'from-emerald-500 to-emerald-600'} text-white`}>
          <CardContent className="p-4">
            <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.usuariosSemPerfil}</p>
            <p className="text-sm opacity-90">Sem Perfil</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <ShieldCheck className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.cobertura}%</p>
            <p className="text-sm opacity-90">Cobertura</p>
            <Progress value={stats.cobertura} className="mt-1 h-1 bg-indigo-400" />
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar perfis ou usuários..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-12 h-12 shadow-md"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm">
          <TabsTrigger value="perfis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Perfis de Acesso
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Usuários e Vínculos
          </TabsTrigger>
          <TabsTrigger value="empresas" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" />
            Empresas e Grupos
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Dashboard Segurança
          </TabsTrigger>
        </TabsList>

        {/* TAB: PERFIS */}
        <TabsContent value="perfis" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setModoTemplate(!modoTemplate)}
                className="bg-purple-50 hover:bg-purple-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {modoTemplate ? 'Ocultar Templates' : 'Templates Inteligentes'}
              </Button>
              <Button
                variant="outline"
                onClick={abrirComparador}
              >
                <Layers className="w-4 h-4 mr-2" />
                Comparar Perfis
              </Button>
            </div>
            <Button
              onClick={() => abrirEdicaoPerfil({ novo: true })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Perfil
            </Button>
          </div>

          {/* Templates Inteligentes */}
          {modoTemplate && (
           <TemplatesPerfisInteligentes
             onSelecionarTemplate={aplicarTemplate}
           />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {perfisFiltrados.map(perfil => {
              const qtdPermissoes = Object.values(perfil.permissoes || {}).reduce((sum, mod) => {
                return sum + Object.values(mod || {}).reduce((s, secao) => s + (secao?.length || 0), 0);
              }, 0);

              return (
                <Card key={perfil.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="bg-slate-50 border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-base">{perfil.nome_perfil}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{perfil.nivel_perfil}</Badge>
                            {qtdPermissoes > 0 && (
                              <Badge className="bg-blue-100 text-blue-700">
                                {qtdPermissoes} permissões
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {perfil.ativo !== false ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {perfil.descricao && (
                      <p className="text-sm text-slate-600">{perfil.descricao}</p>
                    )}
                    
                    {/* Visualizador compacto de permissões */}
                    <VisualizadorPermissoesPerfil 
                      perfil={perfil} 
                      estruturaSistema={ESTRUTURA_SISTEMA}
                      compact={true}
                    />
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge className="bg-purple-100 text-purple-700">
                        {usuarios.filter(u => u.perfil_acesso_id === perfil.id).length} usuários
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPerfilVisualizacao(perfil)}
                          className="bg-blue-50 hover:bg-blue-100"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Permissões
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirEdicaoPerfil(perfil)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const usuariosUsando = usuarios.filter(u => u.perfil_acesso_id === perfil.id);
                            if (usuariosUsando.length > 0) {
                              toast.error(`❌ Não é possível excluir: ${usuariosUsando.length} usuário(s) usando este perfil`);
                              return;
                            }
                            if (confirm(`⚠️ Confirma exclusão permanente do perfil "${perfil.nome_perfil}"?`)) {
                              excluirPerfilMutation.mutate(perfil.id);
                            }
                          }}
                          title={usuarios.some(u => u.perfil_acesso_id === perfil.id) ? "Perfil em uso" : "Excluir perfil"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {perfisFiltrados.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-slate-500">
                <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum perfil encontrado</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: USUÁRIOS */}
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Empresas</TableHead>
                    <TableHead>Grupos</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map(usuario => {
                    const empresasVinculadas = usuario.empresas_vinculadas || [];
                    const gruposVinculados = usuario.grupos_vinculados || [];

                    return (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.full_name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{usuario.email}</TableCell>
                        <TableCell>
                          <Select
                            value={usuario.perfil_acesso_id || "sem-perfil"}
                            onValueChange={(v) => {
                              if (v === "sem-perfil") return;
                              const perfilSel = perfis.find(p => p.id === v);
                              atualizarUsuarioMutation.mutate({
                                id: usuario.id,
                                data: {
                                  perfil_acesso_id: v,
                                  perfil_acesso_nome: perfilSel?.nome_perfil || null
                                }
                              });
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Sem perfil" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sem-perfil">Sem perfil</SelectItem>
                              {perfis.filter(p => p.ativo !== false).map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.nome_perfil}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-100 text-purple-700">
                              {empresasVinculadas.filter(v => v.ativo).length}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setUsuarioAberto(usuario)}
                            >
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700">
                            {gruposVinculados.filter(v => v.ativo).length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUsuarioAberto(usuario)}
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Configurar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: EMPRESAS E GRUPOS */}
        <TabsContent value="empresas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Empresas ({empresas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {empresas.map(empresa => {
                  const usuariosNesta = usuarios.filter(u => 
                    u.empresas_vinculadas?.some(v => v.empresa_id === empresa.id && v.ativo)
                  ).length;

                  return (
                    <div key={empresa.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-sm">{empresa.nome_fantasia || empresa.razao_social}</p>
                        <Badge className="bg-purple-100 text-purple-700 mt-1">
                          {usuariosNesta} usuários com acesso
                        </Badge>
                      </div>
                      <Badge className={empresa.status === 'Ativa' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                        {empresa.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Grupos Empresariais ({grupos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                {grupos.map(grupo => {
                  const usuariosNeste = usuarios.filter(u => 
                    u.grupos_vinculados?.some(v => v.grupo_id === grupo.id && v.ativo)
                  ).length;

                  return (
                    <div key={grupo.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-sm">{grupo.nome_do_grupo}</p>
                        <Badge className="bg-blue-100 text-blue-700 mt-1">
                          {usuariosNeste} usuários com acesso
                        </Badge>
                      </div>
                      <Badge className={grupo.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                        {grupo.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: DASHBOARD DE SEGURANÇA */}
        <TabsContent value="seguranca" className="space-y-4">
          <DashboardSegurancaPerfis perfis={perfis} usuarios={usuarios} />
        </TabsContent>
      </Tabs>



      {/* MODAL: CONFIGURAR USUÁRIO */}
      {usuarioAberto && (
        <Card className="fixed inset-4 z-[9999999] bg-white shadow-2xl flex flex-col">
          <CardHeader className="bg-green-50 border-b sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Configurar: {usuarioAberto.full_name}
              </CardTitle>
              <Button variant="ghost" onClick={() => setUsuarioAberto(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto p-6 space-y-6">
            {/* Perfil */}
            <div>
              <Label className="text-base font-bold mb-3 block">Perfil de Acesso</Label>
              <Select
                value={usuarioAberto.perfil_acesso_id || "sem-perfil"}
                onValueChange={(v) => {
                  if (v === "sem-perfil") {
                    atualizarUsuarioMutation.mutate({
                      id: usuarioAberto.id,
                      data: { perfil_acesso_id: null, perfil_acesso_nome: null }
                    });
                    setUsuarioAberto({ ...usuarioAberto, perfil_acesso_id: null });
                    return;
                  }
                  const perfilSel = perfis.find(p => p.id === v);
                  atualizarUsuarioMutation.mutate({
                    id: usuarioAberto.id,
                    data: {
                      perfil_acesso_id: v,
                      perfil_acesso_nome: perfilSel?.nome_perfil || null
                    }
                  });
                  setUsuarioAberto({ ...usuarioAberto, perfil_acesso_id: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-perfil">Sem perfil</SelectItem>
                  {perfis.filter(p => p.ativo !== false).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        {p.nome_perfil}
                        <Badge variant="outline" className="ml-2 text-xs">{p.nivel_perfil}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vincular Empresas */}
            <div>
              <Label className="text-base font-bold mb-3 block flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Empresas Vinculadas
              </Label>
              <Card className="border-purple-200">
                <CardContent className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {empresas.length > 0 ? empresas.map(empresa => {
                    const vinculado = usuarioAberto.empresas_vinculadas?.some(
                      v => v.empresa_id === empresa.id && v.ativo
                    ) || false;

                    return (
                      <div key={empresa.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={vinculado}
                            onCheckedChange={(checked) => {
                              handleVincularEmpresa(usuarioAberto, empresa.id, checked ? 'adicionar' : 'remover');
                              const novosVinculos = checked
                                ? [...(usuarioAberto.empresas_vinculadas || []), { empresa_id: empresa.id, ativo: true }]
                                : (usuarioAberto.empresas_vinculadas || []).filter(v => v.empresa_id !== empresa.id);
                              setUsuarioAberto({ ...usuarioAberto, empresas_vinculadas: novosVinculos });
                            }}
                          />
                          <div>
                            <p className="font-semibold text-sm">{empresa.nome_fantasia || empresa.razao_social}</p>
                            <p className="text-xs text-slate-500">{empresa.cnpj}</p>
                          </div>
                        </div>
                        <Badge className={vinculado ? 'bg-green-100 text-green-700' : 'bg-slate-100'}>
                          {vinculado ? 'Vinculado' : 'Sem acesso'}
                        </Badge>
                      </div>
                    );
                  }) : (
                    <p className="text-center text-slate-500 py-4">Nenhuma empresa cadastrada</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Vincular Grupos */}
            <div>
              <Label className="text-base font-bold mb-3 block flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Grupos Empresariais Vinculados
              </Label>
              <Card className="border-blue-200">
                <CardContent className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {grupos.length > 0 ? grupos.map(grupo => {
                    const vinculado = usuarioAberto.grupos_vinculados?.some(
                      v => v.grupo_id === grupo.id && v.ativo
                    ) || false;

                    return (
                      <div key={grupo.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={vinculado}
                            onCheckedChange={(checked) => {
                              handleVincularGrupo(usuarioAberto, grupo.id, checked ? 'adicionar' : 'remover');
                              const novosVinculos = checked
                                ? [...(usuarioAberto.grupos_vinculados || []), { grupo_id: grupo.id, ativo: true }]
                                : (usuarioAberto.grupos_vinculados || []).filter(v => v.grupo_id !== grupo.id);
                              setUsuarioAberto({ 
                                ...usuarioAberto, 
                                grupos_vinculados: novosVinculos,
                                pode_operar_em_grupo: novosVinculos.length > 0
                              });
                            }}
                          />
                          <div>
                            <p className="font-semibold text-sm">{grupo.nome_do_grupo}</p>
                            <p className="text-xs text-slate-500">
                              {empresas.filter(e => e.group_id === grupo.id).length} empresas
                            </p>
                          </div>
                        </div>
                        <Badge className={vinculado ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}>
                          {vinculado ? 'Vinculado' : 'Sem acesso'}
                        </Badge>
                      </div>
                    );
                  }) : (
                    <p className="text-center text-slate-500 py-4">Nenhum grupo cadastrado</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>

          <div className="p-6 border-t bg-slate-50 sticky bottom-0">
            <Button
              onClick={() => setUsuarioAberto(null)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Concluir Configuração
            </Button>
          </div>
        </Card>
      )}

      {/* Alerta de Usuários sem Perfil */}
      {stats.usuariosSemPerfil > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription>
            <strong>{stats.usuariosSemPerfil} usuários sem perfil atribuído.</strong> 
            Vá para a aba "Usuários e Vínculos" para configurar.
          </AlertDescription>
        </Alert>
      )}

      {/* Removido: Modal de edição de perfil - agora usa janela multitarefa */}

      {/* MODAL: COMPARADOR DE PERFIS */}
      {modoComparador && (
        <Card className="fixed inset-4 z-[9999999] bg-white shadow-2xl flex flex-col">
          <CardHeader className="bg-purple-50 border-b sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Comparador de Perfis
              </CardTitle>
              <Button variant="ghost" onClick={() => setModoComparador(false)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Perfil 1</Label>
                <Select value={perfilComparar1 || ""} onValueChange={setPerfilComparar1}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o primeiro perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nome_perfil}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Perfil 2</Label>
                <Select value={perfilComparar2 || ""} onValueChange={setPerfilComparar2}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o segundo perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nome_perfil}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {perfilComparar1 && perfilComparar2 && (
              <ComparadorPerfisVisual
                perfil1={perfis.find(p => p.id === perfilComparar1)}
                perfil2={perfis.find(p => p.id === perfilComparar2)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* MODAL: VISUALIZAÇÃO COMPLETA DE PERMISSÕES */}
      {perfilVisualizacao && (
        <Card className="fixed inset-4 z-[9999999] bg-white shadow-2xl flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <div className="text-xl font-bold">{perfilVisualizacao.nome_perfil}</div>
                  <p className="text-sm text-blue-100 font-normal">{perfilVisualizacao.descricao}</p>
                </div>
              </CardTitle>
              <Button variant="ghost" onClick={() => setPerfilVisualizacao(null)} className="text-white hover:bg-white/20">
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto p-6">
            <div className="mb-4 flex gap-3">
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5">
                {perfilVisualizacao.nivel_perfil}
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 px-3 py-1.5">
                {usuarios.filter(u => u.perfil_acesso_id === perfilVisualizacao.id).length} usuários usando
              </Badge>
            </div>

            <VisualizadorPermissoesPerfil 
              perfil={perfilVisualizacao} 
              estruturaSistema={ESTRUTURA_SISTEMA}
              compact={false}
            />

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => {
                  setPerfilVisualizacao(null);
                  abrirEdicaoPerfil(perfilVisualizacao);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Este Perfil
              </Button>
              <Button
                variant="outline"
                onClick={() => setPerfilVisualizacao(null)}
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}