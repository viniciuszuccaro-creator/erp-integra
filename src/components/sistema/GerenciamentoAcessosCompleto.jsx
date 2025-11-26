import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Building2,
  Lock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Search,
  Settings,
  Eye,
  Pencil,
  Trash2,
  Download,
  Upload,
  CheckSquare,
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  Factory,
  UserCircle,
  FileText,
  BarChart3,
  Calendar,
  MessageCircle,
  Briefcase,
  Globe,
  Zap,
  AlertTriangle,
  Copy,
  RefreshCw,
  Filter,
  ChevronRight,
  Layers
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";

/**
 * V21.6 - GERENCIAMENTO DE ACESSOS COMPLETO E UNIFICADO
 * 
 * Central única de controle de acesso com granularidade total:
 * ✅ Módulos do sistema
 * ✅ Seções dentro de cada módulo
 * ✅ Abas específicas
 * ✅ Ações (visualizar, criar, editar, excluir, aprovar, exportar)
 * ✅ Permissões por empresa
 * ✅ Perfis de acesso pré-definidos
 * ✅ IA de Segregação de Funções (SoD)
 * ✅ Auditoria de acessos
 * ✅ Multi-empresa total
 */

// Estrutura completa de módulos, seções e abas do sistema
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
      sped: { nome: "SPED", abas: ["fiscal", "contribuicoes", "contabil"] },
      obrigacoes: { nome: "Obrigações Acessórias", abas: ["calendario", "guias", "declaracoes"] }
    }
  },
  cadastros: {
    nome: "Cadastros Gerais",
    icone: Users,
    cor: "slate",
    secoes: {
      pessoas: { nome: "Pessoas & Parceiros", abas: ["clientes", "fornecedores", "transportadoras", "colaboradores"] },
      produtos: { nome: "Produtos & Serviços", abas: ["produtos", "servicos", "grupos", "marcas"] },
      financeiro: { nome: "Financeiro", abas: ["bancos", "formas_pagamento", "centros_custo"] },
      logistica: { nome: "Logística", abas: ["veiculos", "motoristas", "rotas"] },
      organizacional: { nome: "Organizacional", abas: ["empresas", "departamentos", "cargos", "usuarios"] },
      integracoes: { nome: "Integrações & IA", abas: ["apis", "webhooks", "chatbot", "jobs_ia"] }
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
  agenda: {
    nome: "Agenda e Calendário",
    icone: Calendar,
    cor: "amber",
    secoes: {
      eventos: { nome: "Eventos", abas: ["calendario", "lista", "notificacoes"] },
      tarefas: { nome: "Tarefas", abas: ["kanban", "lista", "atribuicao"] }
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
  contratos: {
    nome: "Gestão de Contratos",
    icone: FileText,
    cor: "sky",
    secoes: {
      contratos: { nome: "Contratos", abas: ["lista", "novo", "renovacao", "aditivos"] }
    }
  },
  chatbot: {
    nome: "Hub de Atendimento",
    icone: MessageCircle,
    cor: "green",
    secoes: {
      atendimento: { nome: "Atendimento", abas: ["conversas", "fila", "transferencia"] },
      configuracoes: { nome: "Configurações", abas: ["canais", "templates", "base_conhecimento"] },
      analytics: { nome: "Analytics", abas: ["metricas", "relatorios", "sla"] }
    }
  },
  configuracoes: {
    nome: "Configurações",
    icone: Settings,
    cor: "gray",
    secoes: {
      sistema: { nome: "Sistema", abas: ["geral", "notificacoes", "backup"] },
      integracoes: { nome: "Integrações", abas: ["nfe", "boletos", "whatsapp", "marketplaces"] },
      ia: { nome: "Inteligência Artificial", abas: ["modelos", "limites", "logs"] }
    }
  }
};

// Ações disponíveis
const ACOES = [
  { id: "visualizar", nome: "Visualizar", icone: Eye, cor: "slate" },
  { id: "criar", nome: "Criar", icone: Plus, cor: "blue" },
  { id: "editar", nome: "Editar", icone: Pencil, cor: "green" },
  { id: "excluir", nome: "Excluir", icone: Trash2, cor: "red" },
  { id: "aprovar", nome: "Aprovar", icone: CheckSquare, cor: "purple" },
  { id: "exportar", nome: "Exportar", icone: Download, cor: "cyan" }
];

// Níveis de perfil
const NIVEIS_PERFIL = [
  { id: "Administrador", nome: "Administrador", descricao: "Acesso total ao sistema" },
  { id: "Gerencial", nome: "Gerencial", descricao: "Acesso gerencial com aprovações" },
  { id: "Operacional", nome: "Operacional", descricao: "Acesso operacional básico" },
  { id: "Consulta", nome: "Consulta", descricao: "Apenas visualização" },
  { id: "Personalizado", nome: "Personalizado", descricao: "Permissões customizadas" }
];

export default function GerenciamentoAcessosCompleto() {
  const [activeTab, setActiveTab] = useState("perfis");
  const [perfilDialogOpen, setPerfilDialogOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [permissaoDialogOpen, setPermissaoDialogOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [moduloExpandido, setModuloExpandido] = useState([]);

  const queryClient = useQueryClient();
  const { empresaAtual, empresasDoGrupo, estaNoGrupo } = useContextoVisual();
  const { hasPermission, isAdmin, user } = usePermissions();

  // Queries
  const { data: perfis = [], isLoading: loadingPerfis } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-acesso'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: permissoesEmpresa = [] } = useQuery({
    queryKey: ['permissoes-empresa'],
    queryFn: () => base44.entities.PermissaoEmpresaModulo.list(),
  });

  // Estado do formulário de perfil
  const [formPerfil, setFormPerfil] = useState({
    nome_perfil: "",
    descricao: "",
    nivel_perfil: "Operacional",
    permissoes: {},
    ativo: true
  });

  // Conflitos de SoD detectados
  const [conflitosSOD, setConflitosSOD] = useState([]);

  // Mutations
  const salvarPerfilMutation = useMutation({
    mutationFn: async (data) => {
      if (editingPerfil?.id) {
        return await base44.entities.PerfilAcesso.update(editingPerfil.id, data);
      } else {
        return await base44.entities.PerfilAcesso.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      setPerfilDialogOpen(false);
      setEditingPerfil(null);
      resetFormPerfil();
      toast.success(editingPerfil ? "Perfil atualizado!" : "Perfil criado!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar perfil: " + error.message);
    }
  });

  const salvarPermissaoEmpresaMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.PermissaoEmpresaModulo.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes-empresa'] });
      setPermissaoDialogOpen(false);
      toast.success("Permissão configurada!");
    }
  });

  const atualizarUsuarioMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await base44.entities.User.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success("Usuário atualizado!");
    }
  });

  // Reset form
  const resetFormPerfil = () => {
    setFormPerfil({
      nome_perfil: "",
      descricao: "",
      nivel_perfil: "Operacional",
      permissoes: {},
      ativo: true
    });
    setConflitosSOD([]);
  };

  // Validar Segregação de Funções (SoD)
  const validarSOD = (permissoes) => {
    const conflitos = [];

    // Regra 1: Criar Fornecedor + Aprovar Pagamentos
    const podeCriarFornecedor = permissoes?.cadastros_gerais?.fornecedores?.includes("criar");
    const podeAprovarPagamentos = permissoes?.financeiro?.contas_pagar?.includes("aprovar");
    
    if (podeCriarFornecedor && podeAprovarPagamentos) {
      conflitos.push({
        tipo: "Crítico",
        regra: "SoD-001",
        descricao: "Não pode criar fornecedor E aprovar pagamentos (risco de fraude)",
        severidade: "Crítica"
      });
    }

    // Regra 2: Criar Cliente + Aprovar Descontos
    const podeCriarCliente = permissoes?.cadastros_gerais?.clientes?.includes("criar");
    const podeAprovarDesconto = permissoes?.comercial?.pedidos?.includes("aprovar");
    
    if (podeCriarCliente && podeAprovarDesconto) {
      conflitos.push({
        tipo: "Aviso",
        regra: "SoD-002",
        descricao: "Criar cliente e aprovar pedidos pode gerar risco de fraude",
        severidade: "Alta"
      });
    }

    // Regra 3: Estoque + Financeiro total
    const temEstoqueTotal = permissoes?.estoque?.movimentacoes?.includes("criar") && 
                           permissoes?.estoque?.movimentacoes?.includes("excluir");
    const temFinanceiroTotal = permissoes?.financeiro?.contas_pagar?.includes("criar") && 
                              permissoes?.financeiro?.contas_pagar?.includes("aprovar");
    
    if (temEstoqueTotal && temFinanceiroTotal) {
      conflitos.push({
        tipo: "Crítico",
        regra: "SoD-003",
        descricao: "Controle total de estoque E financeiro representa alto risco",
        severidade: "Crítica"
      });
    }

    setConflitosSOD(conflitos);
    return conflitos;
  };

  // Toggle permissão no formulário
  const togglePermissao = (modulo, secao, acao) => {
    setFormPerfil(prev => {
      const novasPermissoes = { ...prev.permissoes };
      
      if (!novasPermissoes[modulo]) {
        novasPermissoes[modulo] = {};
      }
      if (!novasPermissoes[modulo][secao]) {
        novasPermissoes[modulo][secao] = [];
      }

      const index = novasPermissoes[modulo][secao].indexOf(acao);
      if (index > -1) {
        novasPermissoes[modulo][secao] = novasPermissoes[modulo][secao].filter(a => a !== acao);
      } else {
        novasPermissoes[modulo][secao] = [...novasPermissoes[modulo][secao], acao];
      }

      // Validar SoD após cada mudança
      validarSOD(novasPermissoes);

      return { ...prev, permissoes: novasPermissoes };
    });
  };

  // Marcar todas as permissões de um módulo
  const marcarTodoModulo = (modulo, marcar) => {
    setFormPerfil(prev => {
      const novasPermissoes = { ...prev.permissoes };
      
      if (marcar) {
        novasPermissoes[modulo] = {};
        Object.keys(ESTRUTURA_SISTEMA[modulo].secoes).forEach(secao => {
          novasPermissoes[modulo][secao] = ACOES.map(a => a.id);
        });
      } else {
        delete novasPermissoes[modulo];
      }

      validarSOD(novasPermissoes);
      return { ...prev, permissoes: novasPermissoes };
    });
  };

  // Marcar todas as permissões de uma seção
  const marcarTodoSecao = (modulo, secao, marcar) => {
    setFormPerfil(prev => {
      const novasPermissoes = { ...prev.permissoes };
      
      if (!novasPermissoes[modulo]) {
        novasPermissoes[modulo] = {};
      }

      if (marcar) {
        novasPermissoes[modulo][secao] = ACOES.map(a => a.id);
      } else {
        novasPermissoes[modulo][secao] = [];
      }

      validarSOD(novasPermissoes);
      return { ...prev, permissoes: novasPermissoes };
    });
  };

  // Aplicar template de nível
  const aplicarTemplateNivel = (nivel) => {
    let permissoes = {};

    switch (nivel) {
      case "Administrador":
        // Acesso total
        Object.keys(ESTRUTURA_SISTEMA).forEach(modulo => {
          permissoes[modulo] = {};
          Object.keys(ESTRUTURA_SISTEMA[modulo].secoes).forEach(secao => {
            permissoes[modulo][secao] = ACOES.map(a => a.id);
          });
        });
        break;
      
      case "Gerencial":
        // Visualizar tudo + criar/editar/aprovar em áreas específicas
        Object.keys(ESTRUTURA_SISTEMA).forEach(modulo => {
          permissoes[modulo] = {};
          Object.keys(ESTRUTURA_SISTEMA[modulo].secoes).forEach(secao => {
            permissoes[modulo][secao] = ["visualizar", "criar", "editar", "aprovar", "exportar"];
          });
        });
        break;
      
      case "Operacional":
        // Visualizar + criar/editar básico
        Object.keys(ESTRUTURA_SISTEMA).forEach(modulo => {
          permissoes[modulo] = {};
          Object.keys(ESTRUTURA_SISTEMA[modulo].secoes).forEach(secao => {
            permissoes[modulo][secao] = ["visualizar", "criar", "editar"];
          });
        });
        break;
      
      case "Consulta":
        // Apenas visualizar
        Object.keys(ESTRUTURA_SISTEMA).forEach(modulo => {
          permissoes[modulo] = {};
          Object.keys(ESTRUTURA_SISTEMA[modulo].secoes).forEach(secao => {
            permissoes[modulo][secao] = ["visualizar"];
          });
        });
        break;
      
      default:
        // Personalizado - sem template
        break;
    }

    setFormPerfil(prev => ({ ...prev, nivel_perfil: nivel, permissoes }));
    validarSOD(permissoes);
  };

  // Submit do formulário de perfil
  const handleSubmitPerfil = (e) => {
    e.preventDefault();

    if (!formPerfil.nome_perfil) {
      toast.error("Informe o nome do perfil");
      return;
    }

    // Verificar conflitos críticos
    const temCritico = conflitosSOD.some(c => c.severidade === "Crítica");
    if (temCritico) {
      toast.error("Existem conflitos críticos de Segregação de Funções. Ajuste as permissões.");
      return;
    }

    const dados = {
      ...formPerfil,
      group_id: empresaAtual?.group_id,
      conflitos_sod_detectados: conflitosSOD
    };

    salvarPerfilMutation.mutate(dados);
  };

  // Abrir edição de perfil
  const abrirEdicaoPerfil = (perfil) => {
    setEditingPerfil(perfil);
    setFormPerfil({
      nome_perfil: perfil.nome_perfil || "",
      descricao: perfil.descricao || "",
      nivel_perfil: perfil.nivel_perfil || "Operacional",
      permissoes: perfil.permissoes || {},
      ativo: perfil.ativo !== false
    });
    validarSOD(perfil.permissoes || {});
    setPerfilDialogOpen(true);
  };

  // Filtrar perfis
  const perfisFiltrados = useMemo(() => {
    return perfis.filter(p => {
      const matchBusca = !busca || 
        p.nome_perfil?.toLowerCase().includes(busca.toLowerCase()) ||
        p.descricao?.toLowerCase().includes(busca.toLowerCase());
      
      const matchNivel = filtroNivel === "todos" || p.nivel_perfil === filtroNivel;
      
      return matchBusca && matchNivel;
    });
  }, [perfis, busca, filtroNivel]);

  // Filtrar usuários
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchBusca = !busca ||
        u.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
        u.email?.toLowerCase().includes(busca.toLowerCase());
      
      return matchBusca;
    });
  }, [usuarios, busca]);

  // Verificar se uma permissão está marcada
  const temPermissao = (modulo, secao, acao) => {
    return formPerfil.permissoes?.[modulo]?.[secao]?.includes(acao) || false;
  };

  // Contar permissões de um módulo
  const contarPermissoesModulo = (modulo) => {
    let total = 0;
    const perms = formPerfil.permissoes?.[modulo] || {};
    Object.values(perms).forEach(secao => {
      total += secao?.length || 0;
    });
    return total;
  };

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            Gerenciamento de Acessos Completo
          </h2>
          <p className="text-slate-600">
            Controle granular de permissões • Módulos • Seções • Abas • Multi-empresa • IA SoD
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-blue-600 text-white">
            {perfis.length} perfis
          </Badge>
          <Badge className="bg-green-600 text-white">
            {usuarios.length} usuários
          </Badge>
          {empresaAtual && (
            <Badge variant="outline">
              <Building2 className="w-3 h-3 mr-1" />
              {empresaAtual.nome_fantasia || empresaAtual.razao_social}
            </Badge>
          )}
        </div>
      </div>

      {/* Busca e Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar perfis, usuários..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filtroNivel} onValueChange={setFiltroNivel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Níveis</SelectItem>
                {NIVEIS_PERFIL.map(n => (
                  <SelectItem key={n.id} value={n.id}>{n.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBusca("");
                setFiltroNivel("todos");
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto">
          <TabsTrigger value="perfis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Perfis de Acesso
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="empresas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Building2 className="w-4 h-4 mr-2" />
            Por Empresa
          </TabsTrigger>
          <TabsTrigger value="matriz" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Layers className="w-4 h-4 mr-2" />
            Matriz de Permissões
          </TabsTrigger>
        </TabsList>

        {/* Tab: Perfis de Acesso */}
        <TabsContent value="perfis" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Perfis de Acesso ({perfisFiltrados.length})
              </CardTitle>
              <Dialog open={perfilDialogOpen} onOpenChange={(open) => {
                setPerfilDialogOpen(open);
                if (!open) {
                  setEditingPerfil(null);
                  resetFormPerfil();
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      {editingPerfil ? 'Editar Perfil de Acesso' : 'Novo Perfil de Acesso'}
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmitPerfil} className="flex-1 overflow-hidden flex flex-col">
                    {/* Dados Básicos */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>Nome do Perfil *</Label>
                        <Input
                          value={formPerfil.nome_perfil}
                          onChange={(e) => setFormPerfil({ ...formPerfil, nome_perfil: e.target.value })}
                          placeholder="Ex: Vendedor, Gerente Financeiro"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label>Nível do Perfil</Label>
                        <Select
                          value={formPerfil.nivel_perfil}
                          onValueChange={(v) => aplicarTemplateNivel(v)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NIVEIS_PERFIL.map(n => (
                              <SelectItem key={n.id} value={n.id}>
                                <div>
                                  <span className="font-medium">{n.nome}</span>
                                  <span className="text-xs text-slate-500 ml-2">{n.descricao}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Switch
                            checked={formPerfil.ativo}
                            onCheckedChange={(v) => setFormPerfil({ ...formPerfil, ativo: v })}
                          />
                          <span className="text-sm">{formPerfil.ativo ? 'Ativo' : 'Inativo'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label>Descrição</Label>
                      <Textarea
                        value={formPerfil.descricao}
                        onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })}
                        placeholder="Descrição do perfil e suas responsabilidades"
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    {/* Alertas de SoD */}
                    {conflitosSOD.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {conflitosSOD.map((conflito, idx) => (
                          <Alert key={idx} className={
                            conflito.severidade === "Crítica" 
                              ? "border-red-300 bg-red-50" 
                              : "border-orange-300 bg-orange-50"
                          }>
                            {conflito.severidade === "Crítica" ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                            <AlertDescription>
                              <strong>[{conflito.regra}]</strong> {conflito.descricao}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    {/* Grid de Permissões */}
                    <div className="flex-1 overflow-auto border rounded-lg">
                      <Accordion type="multiple" value={moduloExpandido} onValueChange={setModuloExpandido}>
                        {Object.entries(ESTRUTURA_SISTEMA).map(([moduloId, modulo]) => {
                          const Icone = modulo.icone;
                          const qtdPerms = contarPermissoesModulo(moduloId);
                          
                          return (
                            <AccordionItem key={moduloId} value={moduloId} className="border-b">
                              <AccordionTrigger className="px-4 py-3 hover:bg-slate-50">
                                <div className="flex items-center gap-3 flex-1">
                                  <Icone className={`w-5 h-5 text-${modulo.cor}-600`} />
                                  <span className="font-medium">{modulo.nome}</span>
                                  {qtdPerms > 0 && (
                                    <Badge className="bg-blue-100 text-blue-700 ml-2">
                                      {qtdPerms} permissões
                                    </Badge>
                                  )}
                                  <div className="ml-auto mr-4 flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        marcarTodoModulo(moduloId, true);
                                      }}
                                    >
                                      Marcar Tudo
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        marcarTodoModulo(moduloId, false);
                                      }}
                                    >
                                      Desmarcar
                                    </Button>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4">
                                  {Object.entries(modulo.secoes).map(([secaoId, secao]) => (
                                    <div key={secaoId} className="border rounded-lg p-3 bg-slate-50">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">{secao.nome}</span>
                                        <div className="flex gap-2">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => marcarTodoSecao(moduloId, secaoId, true)}
                                          >
                                            Todas
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => marcarTodoSecao(moduloId, secaoId, false)}
                                          >
                                            Nenhuma
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-3">
                                        {ACOES.map(acao => {
                                          const marcado = temPermissao(moduloId, secaoId, acao.id);
                                          const IconeAcao = acao.icone;
                                          
                                          return (
                                            <label
                                              key={acao.id}
                                              className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border transition-colors ${
                                                marcado 
                                                  ? `bg-${acao.cor}-100 border-${acao.cor}-300 text-${acao.cor}-700`
                                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                              }`}
                                            >
                                              <Checkbox
                                                checked={marcado}
                                                onCheckedChange={() => togglePermissao(moduloId, secaoId, acao.id)}
                                              />
                                              <IconeAcao className="w-3.5 h-3.5" />
                                              <span className="text-sm">{acao.nome}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                      {secao.abas?.length > 0 && (
                                        <div className="mt-2 text-xs text-slate-500">
                                          Abas: {secao.abas.join(", ")}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPerfilDialogOpen(false);
                          setEditingPerfil(null);
                          resetFormPerfil();
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={salvarPerfilMutation.isPending || conflitosSOD.some(c => c.severidade === "Crítica")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {salvarPerfilMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {editingPerfil ? 'Atualizar' : 'Criar'} Perfil
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Nome do Perfil</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Conflitos SoD</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfisFiltrados.map(perfil => {
                    const usuariosDoPerfil = usuarios.filter(u => u.perfil_acesso_id === perfil.id);
                    const temConflitos = perfil.conflitos_sod_detectados?.length > 0;
                    
                    return (
                      <TableRow key={perfil.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{perfil.nome_perfil}</p>
                            {perfil.descricao && (
                              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                {perfil.descricao}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {perfil.nivel_perfil || "Operacional"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700">
                            {usuariosDoPerfil.length} usuários
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {temConflitos ? (
                            <Badge className="bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {perfil.conflitos_sod_detectados.length} conflitos
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              OK
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {perfil.ativo !== false ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirEdicaoPerfil(perfil)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(perfil.permissoes, null, 2));
                                toast.success("Permissões copiadas!");
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {perfisFiltrados.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum perfil encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Usuários */}
        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">
                Usuários e Atribuições ({usuariosFiltrados.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil de Acesso</TableHead>
                    <TableHead>Empresas Vinculadas</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map(usuario => {
                    const perfilUsuario = perfis.find(p => p.id === usuario.perfil_acesso_id);
                    
                    return (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium">{usuario.full_name}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          <Select
                            value={usuario.perfil_acesso_id || ""}
                            onValueChange={(v) => {
                              const perfilSelecionado = perfis.find(p => p.id === v);
                              atualizarUsuarioMutation.mutate({
                                id: usuario.id,
                                data: {
                                  perfil_acesso_id: v,
                                  perfil_acesso_nome: perfilSelecionado?.nome_perfil
                                }
                              });
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Selecionar perfil" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={null}>Sem perfil</SelectItem>
                              {perfis.filter(p => p.ativo !== false).map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.nome_perfil}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700">
                            {usuario.empresas_vinculadas?.length || 0} empresas
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={usuario.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-600 text-white'}>
                            {usuario.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Por Empresa */}
        <TabsContent value="empresas" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Permissões Específicas por Empresa ({permissoesEmpresa.length})
              </CardTitle>
              <Dialog open={permissaoDialogOpen} onOpenChange={setPermissaoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Permissão
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configurar Permissão por Empresa</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      
                      const usuario = usuarios.find(u => u.id === formData.get('usuario'));
                      const empresa = empresas.find(emp => emp.id === formData.get('empresa'));
                      
                      salvarPermissaoEmpresaMutation.mutate({
                        usuario_id: formData.get('usuario'),
                        usuario_nome: usuario?.full_name,
                        empresa_id: formData.get('empresa'),
                        empresa_nome: empresa?.nome_fantasia || empresa?.razao_social,
                        modulo: formData.get('modulo'),
                        nivel_acesso: formData.get('nivel'),
                        data_concessao: new Date().toISOString(),
                        alterado_por: user?.full_name || "Sistema",
                        ativo: true
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Usuário *</Label>
                        <Select name="usuario" required>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {usuarios.map(u => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Empresa *</Label>
                        <Select name="empresa" required>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {empresas.map(emp => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.nome_fantasia || emp.razao_social}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Módulo *</Label>
                      <Select name="modulo" required>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ESTRUTURA_SISTEMA).map(([id, mod]) => (
                            <SelectItem key={id} value={mod.nome}>
                              {mod.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Nível de Acesso *</Label>
                      <Select name="nivel" required defaultValue="Visualizar">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nenhum">Nenhum (Bloquear)</SelectItem>
                          <SelectItem value="Visualizar">Visualizar</SelectItem>
                          <SelectItem value="Editar">Editar</SelectItem>
                          <SelectItem value="Criar">Criar</SelectItem>
                          <SelectItem value="Excluir">Excluir</SelectItem>
                          <SelectItem value="Aprovar">Aprovar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setPermissaoDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={salvarPermissaoEmpresaMutation.isPending}>
                        Criar Permissão
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Usuário</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Concedido em</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissoesEmpresa.map(perm => (
                    <TableRow key={perm.id}>
                      <TableCell className="font-medium">{perm.usuario_nome}</TableCell>
                      <TableCell>{perm.empresa_nome}</TableCell>
                      <TableCell>{perm.modulo}</TableCell>
                      <TableCell>
                        <Badge className={
                          perm.nivel_acesso === 'Aprovar' ? 'bg-purple-600 text-white' :
                          perm.nivel_acesso === 'Excluir' ? 'bg-red-600 text-white' :
                          perm.nivel_acesso === 'Criar' ? 'bg-blue-600 text-white' :
                          perm.nivel_acesso === 'Editar' ? 'bg-green-600 text-white' :
                          'bg-slate-600 text-white'
                        }>
                          {perm.nivel_acesso}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(perm.data_concessao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {perm.ativo ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {permissoesEmpresa.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma permissão específica configurada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Matriz de Permissões */}
        <TabsContent value="matriz" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">
                Matriz Visual de Permissões
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-slate-100 text-left">Módulo / Perfil</th>
                      {perfis.filter(p => p.ativo !== false).map(p => (
                        <th key={p.id} className="border p-2 bg-slate-100 text-center text-sm">
                          {p.nome_perfil}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ESTRUTURA_SISTEMA).map(([moduloId, modulo]) => {
                      const Icone = modulo.icone;
                      return (
                        <tr key={moduloId}>
                          <td className="border p-2">
                            <div className="flex items-center gap-2">
                              <Icone className={`w-4 h-4 text-${modulo.cor}-600`} />
                              <span className="font-medium text-sm">{modulo.nome}</span>
                            </div>
                          </td>
                          {perfis.filter(p => p.ativo !== false).map(perfil => {
                            const perms = perfil.permissoes?.[moduloId] || {};
                            const temAcesso = Object.values(perms).some(arr => arr?.length > 0);
                            const acessoTotal = Object.keys(modulo.secoes).every(
                              secao => perms[secao]?.length === ACOES.length
                            );

                            return (
                              <td key={perfil.id} className="border p-2 text-center">
                                {acessoTotal ? (
                                  <Badge className="bg-green-600 text-white text-xs">Total</Badge>
                                ) : temAcesso ? (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">Parcial</Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-500 text-xs">Nenhum</Badge>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}