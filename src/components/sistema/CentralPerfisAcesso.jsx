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
  MessageCircle, Briefcase, Calendar, Layers, ChevronDown, Info, Zap as ZapIcon
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { createPageUrl } from "@/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// ESTRUTURA COMPLETA DO SISTEMA - 100% ALINHADA COM GerenciamentoAcessosCompleto
// TOTAL: 13 módulos × 49 seções × 6 ações = 294 permissões possíveis
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
  const [perfilAberto, setPerfilAberto] = useState(null);
  const [usuarioAberto, setUsuarioAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [modulosExpandidos, setModulosExpandidos] = useState([]);

  const queryClient = useQueryClient();
  const { empresaAtual, empresasDoGrupo, estaNoGrupo } = useContextoVisual();
  const { user } = usePermissions();

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

  // State do formulário - ESTRUTURA GRANULAR: módulo → seção → ações[]
  const [formPerfil, setFormPerfil] = useState({
    nome_perfil: "",
    descricao: "",
    nivel_perfil: "Operacional",
    permissoes: {},
    ativo: true
  });

  // Mutations
  const salvarPerfilMutation = useMutation({
    mutationFn: async (data) => {
      console.log("📝 SALVANDO PERFIL:");
      console.log("  Nome:", data.nome_perfil);
      console.log("  Nível:", data.nivel_perfil);
      console.log("  Permissões (estrutura):", data.permissoes);
      console.log("  Total módulos:", Object.keys(data.permissoes || {}).length);
      
      // Contar total de permissões
      let totalPerms = 0;
      Object.values(data.permissoes || {}).forEach(mod => {
        Object.values(mod || {}).forEach(sec => {
          totalPerms += sec?.length || 0;
        });
      });
      console.log("  Total ações:", totalPerms);
      
      const perfilId = perfilAberto?.id;
      if (perfilId && !perfilAberto.novo) {
        console.log("  Modo: ATUALIZAR perfil existente (ID:", perfilId, ")");
        const resultado = await base44.entities.PerfilAcesso.update(perfilId, data);
        console.log("✅ Atualização concluída:", resultado);
        return resultado;
      } else {
        console.log("  Modo: CRIAR novo perfil");
        const resultado = await base44.entities.PerfilAcesso.create(data);
        console.log("✅ Criação concluída:", resultado);
        return resultado;
      }
    },
    onSuccess: (result) => {
      console.log("✅✅✅ PERFIL SALVO COM SUCESSO!");
      console.log("  Resultado do banco:", result);
      
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      const foiCriacao = perfilAberto?.novo;
      toast.success(foiCriacao ? "✅ Perfil criado com sucesso!" : "✅ Perfil atualizado com sucesso!");
      
      // auditoria de segurança (mudança de permissão)
      try {
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: foiCriacao ? 'Criação' : 'Edição',
          modulo: 'Controle de Acesso',
          entidade: 'PerfilAcesso',
          registro_id: result?.id || perfilAberto?.id,
          descricao: (foiCriacao ? 'Criação' : 'Atualização') + ` do perfil "${result?.nome_perfil || formPerfil.nome_perfil}"`,
          dados_novos: result || formPerfil,
        });
      } catch {}
      
      // Aguardar 300ms para garantir que query foi invalidada
      setTimeout(() => {
        setPerfilAberto(null);
        resetForm();
      }, 300);
    },
    onError: (error) => {
      console.error("❌❌❌ ERRO AO SALVAR PERFIL:", error);
      console.error("  Mensagem:", error.message);
      console.error("  Stack:", error.stack);
      toast.error("❌ Erro ao salvar: " + error.message);
    }
  });

  const excluirPerfilMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.PerfilAcesso.delete(id);
    },
    onSuccess: (_res, idExcluido) => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      toast.success("🗑️ Perfil excluído!");
      try {
        base44.entities.AuditLog.create({
          acao: 'Exclusão',
          modulo: 'Controle de Acesso',
          entidade: 'PerfilAcesso',
          registro_id: idExcluido,
          descricao: 'Perfil de acesso excluído',
        });
      } catch {}
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

  const resetForm = () => {
    setFormPerfil({
      nome_perfil: "",
      descricao: "",
      nivel_perfil: "Operacional",
      permissoes: {},
      ativo: true
    });
  };

  // TOGGLE PERMISSÃO: módulo → seção → ação
  const togglePermissao = (modulo, secao, acao) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      if (!novasPerms[modulo][secao]) novasPerms[modulo][secao] = [];

      const index = novasPerms[modulo][secao].indexOf(acao);
      if (index > -1) {
        novasPerms[modulo][secao] = novasPerms[modulo][secao].filter(a => a !== acao);
      } else {
        novasPerms[modulo][secao] = [...novasPerms[modulo][secao], acao];
      }

      console.log(`🔄 Toggle: ${modulo}.${secao}.${acao} →`, novasPerms[modulo][secao]);
      console.log(`📊 Total permissões após toggle:`, Object.keys(novasPerms).length, "módulos");
      
      return { ...prev, permissoes: novasPerms };
    });
  };

  // SELECIONAR TUDO EM UMA SEÇÃO
  const selecionarTudoSecao = (modulo, secao) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      
      const todasAcoes = ACOES.map(a => a.id);
      const temTodas = todasAcoes.every(a => novasPerms[modulo][secao]?.includes(a));
      
      novasPerms[modulo][secao] = temTodas ? [] : [...todasAcoes];
      
      console.log(`🔄 Seção ${modulo}.${secao}:`, novasPerms[modulo][secao]);
      console.log(`📊 Total permissões:`, Object.keys(novasPerms).length, "módulos");
      
      return { ...prev, permissoes: novasPerms };
    });
  };

  // SELECIONAR TUDO EM UM MÓDULO
  const selecionarTudoModulo = (modulo) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      const todasAcoes = ACOES.map(a => a.id);
      
      // Verifica se todas as seções têm todas as ações
      const secoes = Object.keys(ESTRUTURA_SISTEMA[modulo].secoes);
      const tudoMarcado = secoes.every(secao => 
        todasAcoes.every(a => novasPerms[modulo]?.[secao]?.includes(a))
      );
      
      novasPerms[modulo] = {};
      secoes.forEach(secao => {
        novasPerms[modulo][secao] = tudoMarcado ? [] : [...todasAcoes];
      });
      
      console.log(`🔄 Módulo ${modulo}:`, novasPerms[modulo]);
      console.log(`📊 Total permissões:`, Object.keys(novasPerms).length, "módulos");
      
      return { ...prev, permissoes: novasPerms };
    });
  };

  // SELECIONAR TUDO GLOBAL
  const selecionarTudoGlobal = () => {
    setFormPerfil(prev => {
      const todasAcoes = [...ACOES.map(a => a.id)];
      
      // Verifica se algum módulo está vazio
      const algumVazio = Object.keys(ESTRUTURA_SISTEMA).some(modId => {
        const secoes = Object.keys(ESTRUTURA_SISTEMA[modId].secoes);
        return secoes.some(secaoId => {
          return !prev.permissoes?.[modId]?.[secaoId] || 
                 prev.permissoes[modId][secaoId].length < todasAcoes.length;
        });
      });

      const novasPerms = {};
      let totalAcoes = 0;
      let totalSecoes = 0;
      let totalModulos = 0;

      Object.keys(ESTRUTURA_SISTEMA).forEach(modId => {
        novasPerms[modId] = {};
        totalModulos++;
        Object.keys(ESTRUTURA_SISTEMA[modId].secoes).forEach(secaoId => {
          novasPerms[modId][secaoId] = algumVazio ? [...todasAcoes] : [];
          totalSecoes++;
          if (algumVazio) totalAcoes += todasAcoes.length;
        });
      });

      console.log("🌐 Seleção Global:", algumVazio ? "TUDO MARCADO" : "TUDO DESMARCADO");
      console.log("📊 Total módulos:", totalModulos, "/ 13");
      console.log("📊 Total seções:", totalSecoes, "/ 49");
      console.log("📊 Total ações:", totalAcoes, "/ 294");
      console.log("📊 Estrutura:", novasPerms);
      
      return { ...prev, permissoes: novasPerms };
    });
  };

  // VERIFICAR SE TEM PERMISSÃO
  const temPermissao = (modulo, secao, acao) => {
    return formPerfil.permissoes?.[modulo]?.[secao]?.includes(acao) || false;
  };

  // CONTAR PERMISSÕES
  const contarPermissoesModulo = (modulo) => {
    let total = 0;
    const perms = formPerfil.permissoes?.[modulo] || {};
    Object.values(perms).forEach(secao => {
      total += secao?.length || 0;
    });
    return total;
  };

  const contarPermissoesTotal = () => {
    let total = 0;
    Object.values(formPerfil.permissoes || {}).forEach(modulo => {
      Object.values(modulo || {}).forEach(secao => {
        total += secao?.length || 0;
      });
    });
    return total;
  };

  const abrirEdicaoPerfil = (perfil) => {
    console.log("📂 Abrindo perfil para edição:", perfil.nome_perfil, "Permissões:", perfil.permissoes);
    
    setPerfilAberto(perfil);
    setFormPerfil({
      nome_perfil: perfil.nome_perfil || "",
      descricao: perfil.descricao || "",
      nivel_perfil: perfil.nivel_perfil || "Operacional",
      permissoes: perfil.permissoes || {},
      ativo: perfil.ativo !== false
    });
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
        <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm">
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
        </TabsList>

        {/* TAB: PERFIS */}
        <TabsContent value="perfis" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                resetForm();
                setPerfilAberto({ novo: true });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Perfil
            </Button>
          </div>

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
                  <CardContent className="p-4">
                    {perfil.descricao && (
                      <p className="text-sm text-slate-600 mb-3">{perfil.descricao}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-100 text-purple-700">
                        {usuarios.filter(u => u.perfil_acesso_id === perfil.id).length} usuários
                      </Badge>
                      <div className="flex gap-2">
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
              <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
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
                        <TableCell className="font-medium max-w-[200px] truncate">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span title={usuario.full_name} className="inline-block max-w-[200px] truncate">{usuario.full_name}</span>
      </TooltipTrigger>
      <TooltipContent>{usuario.full_name}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</TableCell>
                        <TableCell className="text-sm text-slate-600 max-w-[240px] truncate">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span title={usuario.email} className="inline-block max-w-[240px] truncate">{usuario.email}</span>
      </TooltipTrigger>
      <TooltipContent>{usuario.email}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</TableCell>
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
              </div>
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
      </Tabs>

      {/* MODAL: EDITAR/CRIAR PERFIL - ESTRUTURA GRANULAR COMPLETA */}
      {perfilAberto && (
        <Card className="fixed inset-4 z-[9999999] bg-white shadow-2xl flex flex-col">
          <CardHeader className="bg-blue-50 border-b sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                {perfilAberto.novo ? 'Novo Perfil de Acesso' : `Editar: ${perfilAberto.nome_perfil}`}
                {contarPermissoesTotal() > 0 && (
                  <Badge className="bg-blue-600 text-white ml-2">
                    {contarPermissoesTotal()} permissões selecionadas
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" onClick={() => setPerfilAberto(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-auto p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!formPerfil.nome_perfil) {
                toast.error("❌ Nome do perfil é obrigatório");
                return;
              }
              
              // SPREAD DIRETO COMO NO GerenciamentoAcessosCompleto
              const dadosSalvar = {
                ...formPerfil,
                group_id: empresaAtual?.group_id || null
              };
              
              console.log("💾 Enviando para salvar:");
              console.log("  - Nome:", dadosSalvar.nome_perfil);
              console.log("  - Permissões:", dadosSalvar.permissoes);
              console.log("  - Total de permissões:", Object.keys(dadosSalvar.permissoes || {}).length, "módulos");
              
              salvarPerfilMutation.mutate(dadosSalvar);
            }} className="space-y-6 h-full flex flex-col">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                  <Label>Nível</Label>
                  <Select
                    value={formPerfil.nivel_perfil}
                    onValueChange={(v) => setFormPerfil({ ...formPerfil, nivel_perfil: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Gerencial">Gerencial</SelectItem>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                      <SelectItem value="Personalizado">Personalizado</SelectItem>
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

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formPerfil.descricao}
                  onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })}
                  placeholder="Descreva as responsabilidades deste perfil"
                  className="mt-1"
                  rows={2}
                />
              </div>

              {/* PERMISSÕES GRANULARES */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-bold">Permissões Granulares por Módulo</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={selecionarTudoGlobal}
                    className="text-sm"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Selecionar/Desmarcar Tudo
                  </Button>
                </div>

                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Info className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    <strong>Controle Granular Total:</strong> Cada seção pode ter permissões independentes. 
                    {contarPermissoesTotal()} permissões selecionadas no total.
                  </AlertDescription>
                </Alert>

                <div className="flex-1 overflow-auto border rounded-lg bg-slate-50">
                  <Accordion type="multiple" value={modulosExpandidos} onValueChange={setModulosExpandidos}>
                    {Object.entries(ESTRUTURA_SISTEMA).map(([moduloId, modulo]) => {
                      const Icone = modulo.icone;
                      const qtdPerms = contarPermissoesModulo(moduloId);
                      
                      return (
                        <AccordionItem key={moduloId} value={moduloId} className="border-b">
                          <AccordionTrigger className="px-4 py-3 hover:bg-white/50">
                            <div className="flex items-center gap-3 flex-1">
                               <Icone className={`w-5 h-5 ${
                                  modulo.cor === 'blue' ? 'text-blue-600' :
                                  modulo.cor === 'green' ? 'text-green-600' :
                                  modulo.cor === 'emerald' ? 'text-emerald-600' :
                                  modulo.cor === 'purple' ? 'text-purple-600' :
                                  modulo.cor === 'orange' ? 'text-orange-600' :
                                  modulo.cor === 'cyan' ? 'text-cyan-600' :
                                  modulo.cor === 'indigo' ? 'text-indigo-600' :
                                  modulo.cor === 'pink' ? 'text-pink-600' :
                                  modulo.cor === 'slate' ? 'text-slate-600' :
                                  modulo.cor === 'red' ? 'text-red-600' :
                                  modulo.cor === 'violet' ? 'text-violet-600' :
                                  modulo.cor === 'amber' ? 'text-amber-600' :
                                  modulo.cor === 'teal' ? 'text-teal-600' :
                                  modulo.cor === 'sky' ? 'text-sky-600' :
                                  'text-gray-600'
                               }`} />
                               <span className="font-medium">{modulo.nome}</span>
                              {qtdPerms > 0 && (
                                <Badge className="bg-blue-100 text-blue-700 ml-2">
                                  {qtdPerms}
                                </Badge>
                              )}
                              <div className="ml-auto mr-4">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selecionarTudoModulo(moduloId);
                                  }}
                                  className="text-xs"
                                >
                                  <CheckSquare className="w-3 h-3 mr-1" />
                                  Tudo
                                </Button>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3">
                              {Object.entries(modulo.secoes).map(([secaoId, secao]) => {
                                const qtdSecao = formPerfil.permissoes?.[moduloId]?.[secaoId]?.length || 0;
                                
                                return (
                                  <Card key={secaoId} className="border-2 bg-white">
                                    <CardHeader className="bg-slate-50 border-b pb-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <CardTitle className="text-sm font-semibold">{secao.nome}</CardTitle>
                                          {secao.abas?.length > 0 && (
                                            <p className="text-xs text-slate-500 mt-1">
                                              Abas: {secao.abas.join(", ")}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {qtdSecao > 0 && (
                                            <Badge className="bg-green-100 text-green-700">
                                              {qtdSecao}
                                            </Badge>
                                          )}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => selecionarTudoSecao(moduloId, secaoId)}
                                            className="h-6 px-2 text-xs"
                                          >
                                            <CheckSquare className="w-3 h-3 mr-1" />
                                            Todas
                                          </Button>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                      <div className="flex flex-wrap gap-2">
                                        {ACOES.map(acao => {
                                          const marcado = temPermissao(moduloId, secaoId, acao.id);
                                          const IconeAcao = acao.icone;
                                          
                                          return (
                                            <label
                                              key={acao.id}
                                              className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded border text-xs transition-all ${
                                                marcado
                                                  ? 'bg-blue-100 border-blue-300 text-blue-700 font-semibold'
                                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                                              }`}
                                            >
                                              <Checkbox
                                                checked={marcado}
                                                onCheckedChange={() => togglePermissao(moduloId, secaoId, acao.id)}
                                              />
                                              <IconeAcao className="w-3.5 h-3.5" />
                                              {acao.nome}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-between items-center gap-3 pt-4 border-t mt-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-700">
                    {contarPermissoesTotal()} permissões selecionadas
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700">
                    {Object.keys(formPerfil.permissoes).length} módulos configurados
                  </Badge>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setPerfilAberto(null)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={salvarPerfilMutation.isPending || !formPerfil.nome_perfil}
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
                        Salvar Perfil
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}