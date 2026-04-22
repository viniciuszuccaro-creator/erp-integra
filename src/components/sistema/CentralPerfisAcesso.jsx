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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import {
  Shield, Users, Building2, CheckCircle, XCircle, Plus, Edit, Search, Settings,
  Eye, Pencil, Trash2, AlertTriangle, RefreshCw, UserPlus,
  Key, CheckSquare, LayoutDashboard, ShoppingCart, DollarSign,
  Package, Truck, Factory, UserCircle, FileText, BarChart3, Download,
  MessageCircle, Briefcase, Calendar, Info
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ESTRUTURA_SISTEMA = {
  dashboard: { nome: "Dashboard", icone: LayoutDashboard, cor: "blue", secoes: { principal: { nome: "Visão Geral", abas: ["kpis", "graficos", "alertas"] }, corporativo: { nome: "Dashboard Corporativo", abas: ["multiempresa", "consolidado"] } } },
  comercial: { nome: "Comercial e Vendas", icone: ShoppingCart, cor: "green", secoes: { clientes: { nome: "Clientes", abas: ["lista", "detalhes", "historico", "crm"] }, pedidos: { nome: "Pedidos", abas: ["lista", "novo", "aprovacao", "faturamento"] }, orcamentos: { nome: "Orçamentos", abas: ["lista", "novo", "conversao"] }, tabelas_preco: { nome: "Tabelas de Preço", abas: ["lista", "itens"] }, comissoes: { nome: "Comissões", abas: ["lista", "calculo", "pagamento"] }, notas_fiscais: { nome: "Notas Fiscais", abas: ["emissao", "lista", "cancelamento"] } } },
  financeiro: { nome: "Financeiro e Contábil", icone: DollarSign, cor: "emerald", secoes: { contas_receber: { nome: "Contas a Receber", abas: ["lista", "baixa", "cobranca", "boletos"] }, contas_pagar: { nome: "Contas a Pagar", abas: ["lista", "baixa", "aprovacao", "pagamento"] }, caixa: { nome: "Caixa Diário", abas: ["movimentos", "fechamento", "transferencias"] }, conciliacao: { nome: "Conciliação Bancária", abas: ["importar", "conciliar", "historico"] }, relatorios: { nome: "Relatórios Financeiros", abas: ["dre", "fluxo_caixa", "inadimplencia"] } } },
  estoque: { nome: "Estoque e Almoxarifado", icone: Package, cor: "purple", secoes: { produtos: { nome: "Produtos", abas: ["lista", "novo", "lotes", "validade"] }, movimentacoes: { nome: "Movimentações", abas: ["entrada", "saida", "transferencia", "ajuste"] }, inventario: { nome: "Inventário", abas: ["contagem", "acerto", "historico"] }, requisicoes: { nome: "Requisições", abas: ["lista", "aprovacao", "atendimento"] } } },
  compras: { nome: "Compras e Suprimentos", icone: Briefcase, cor: "orange", secoes: { fornecedores: { nome: "Fornecedores", abas: ["lista", "avaliacao", "historico"] }, solicitacoes: { nome: "Solicitações", abas: ["lista", "nova", "aprovacao"] }, cotacoes: { nome: "Cotações", abas: ["lista", "nova", "comparativo"] }, ordens_compra: { nome: "Ordens de Compra", abas: ["lista", "nova", "recebimento"] } } },
  expedicao: { nome: "Expedição e Logística", icone: Truck, cor: "cyan", secoes: { entregas: { nome: "Entregas", abas: ["lista", "separacao", "despacho", "rastreamento"] }, romaneios: { nome: "Romaneios", abas: ["lista", "novo", "impressao"] }, roteirizacao: { nome: "Roteirização", abas: ["mapa", "otimizacao", "motoristas"] }, transportadoras: { nome: "Transportadoras", abas: ["lista", "tabelas_frete"] } } },
  producao: { nome: "Produção e Manufatura", icone: Factory, cor: "indigo", secoes: { ordens_producao: { nome: "Ordens de Produção", abas: ["lista", "nova", "programacao", "kanban"] }, apontamentos: { nome: "Apontamentos", abas: ["producao", "paradas", "refugo"] }, qualidade: { nome: "Qualidade", abas: ["inspecao", "nao_conformidades", "acoes"] } } },
  rh: { nome: "Recursos Humanos", icone: UserCircle, cor: "pink", secoes: { colaboradores: { nome: "Colaboradores", abas: ["lista", "documentos", "historico"] }, ponto: { nome: "Ponto Eletrônico", abas: ["registros", "ajustes", "relatorios"] }, ferias: { nome: "Férias", abas: ["programacao", "solicitacoes", "aprovacao"] }, folha: { nome: "Folha de Pagamento", abas: ["calculo", "holerites", "encargos"] } } },
  fiscal: { nome: "Fiscal e Tributário", icone: FileText, cor: "red", secoes: { nfe: { nome: "NF-e", abas: ["emissao", "entrada", "manifestacao", "inutilizacao"] }, tabelas_fiscais: { nome: "Tabelas Fiscais", abas: ["cfop", "cst", "ncm", "aliquotas"] }, sped: { nome: "SPED", abas: ["fiscal", "contribuicoes", "contabil"] }, obrigacoes: { nome: "Obrigações Acessórias", abas: ["calendario", "guias", "declaracoes"] } } },
  cadastros: { nome: "Cadastros Gerais", icone: Users, cor: "slate", secoes: { pessoas: { nome: "Pessoas & Parceiros", abas: ["clientes", "fornecedores", "transportadoras", "colaboradores"] }, produtos: { nome: "Produtos & Serviços", abas: ["produtos", "servicos", "grupos", "marcas"] }, financeiro: { nome: "Financeiro", abas: ["bancos", "formas_pagamento", "centros_custo"] }, logistica: { nome: "Logística", abas: ["veiculos", "motoristas", "rotas"] }, organizacional: { nome: "Organizacional", abas: ["empresas", "departamentos", "cargos", "usuarios"] }, integracoes: { nome: "Integrações & IA", abas: ["apis", "webhooks", "chatbot", "jobs_ia"] } } },
  crm: { nome: "CRM - Relacionamento", icone: MessageCircle, cor: "violet", secoes: { oportunidades: { nome: "Oportunidades", abas: ["funil", "lista", "conversao"] }, interacoes: { nome: "Interações", abas: ["historico", "nova", "follow_up"] }, campanhas: { nome: "Campanhas", abas: ["lista", "nova", "resultados"] } } },
  agenda: { nome: "Agenda e Calendário", icone: Calendar, cor: "amber", secoes: { eventos: { nome: "Eventos", abas: ["calendario", "lista", "notificacoes"] }, tarefas: { nome: "Tarefas", abas: ["kanban", "lista", "atribuicao"] } } },
  relatorios: { nome: "Relatórios e Análises", icone: BarChart3, cor: "teal", secoes: { dashboards: { nome: "Dashboards", abas: ["executivo", "operacional", "financeiro"] }, relatorios: { nome: "Relatórios", abas: ["vendas", "estoque", "financeiro", "rh"] }, exportacao: { nome: "Exportação", abas: ["excel", "pdf", "api"] } } },
  sistema: { nome: "Configurações do Sistema", icone: Settings, cor: "gray", secoes: { configuracoes: { nome: "Configurações Gerais", abas: ["geral", "notificacoes", "backup"] }, integracoes: { nome: "Integrações", abas: ["nfe", "boletos", "whatsapp", "marketplaces"] }, acessos: { nome: "Controle de Acesso", abas: ["perfis", "usuarios", "grupos"] }, ia: { nome: "IA & Otimização", abas: ["modelos", "limites", "logs"] } } },
};

const ACOES = [
  { id: "visualizar", nome: "Visualizar", icone: Eye, cor: "slate" },
  { id: "criar", nome: "Criar", icone: Plus, cor: "blue" },
  { id: "editar", nome: "Editar", icone: Pencil, cor: "green" },
  { id: "excluir", nome: "Excluir", icone: Trash2, cor: "red" },
  { id: "aprovar", nome: "Aprovar", icone: CheckSquare, cor: "purple" },
  { id: "exportar", nome: "Exportar", icone: Download, cor: "cyan" },
];

const COR_CLASS = { blue: "text-blue-600", green: "text-green-600", emerald: "text-emerald-600", purple: "text-purple-600", orange: "text-orange-600", cyan: "text-cyan-600", indigo: "text-indigo-600", pink: "text-pink-600", slate: "text-slate-600", red: "text-red-600", violet: "text-violet-600", amber: "text-amber-600", teal: "text-teal-600", sky: "text-sky-600", gray: "text-gray-600" };

export default function CentralPerfisAcesso() {
  const [activeTab, setActiveTab] = useState("perfis");
  const [perfilAberto, setPerfilAberto] = useState(null);
  const [usuarioAberto, setUsuarioAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [showEmpresas, setShowEmpresas] = useState(true);
  const [showGrupos, setShowGrupos] = useState(true);
  const [showAcoes, setShowAcoes] = useState(true);
  const [modulosExpandidos, setModulosExpandidos] = useState([]);
  const [formPerfil, setFormPerfil] = useState({ nome_perfil: "", descricao: "", nivel_perfil: "Operacional", permissoes: {}, ativo: true });

  const queryClient = useQueryClient();
  const { empresaAtual } = useContextoVisual();
  const { user } = usePermissions();

  const { data: perfis = [] } = useQuery({ queryKey: ['perfis-acesso'], queryFn: () => base44.entities.PerfilAcesso.list() });
  const { data: usuarios = [] } = useQuery({ queryKey: ['usuarios'], queryFn: () => base44.entities.User.list() });
  const { data: empresas = [] } = useQuery({ queryKey: ['empresas'], queryFn: () => base44.entities.Empresa.list() });
  const { data: grupos = [] } = useQuery({ queryKey: ['grupos'], queryFn: () => base44.entities.GrupoEmpresarial.list() });

  const salvarPerfilMutation = useMutation({
    mutationFn: async (data) => {
      const perfilId = perfilAberto?.id;
      if (perfilId && !perfilAberto.novo) return base44.entities.PerfilAcesso.update(perfilId, data);
      return base44.entities.PerfilAcesso.create(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      const foiCriacao = perfilAberto?.novo;
      toast.success(foiCriacao ? "✅ Perfil criado com sucesso!" : "✅ Perfil atualizado com sucesso!");
      try {
        base44.entities.AuditLog.create({ usuario: user?.full_name || user?.email || 'Usuário', usuario_id: user?.id, empresa_id: empresaAtual?.id || null, acao: foiCriacao ? 'Criação' : 'Edição', modulo: 'Controle de Acesso', entidade: 'PerfilAcesso', registro_id: result?.id || perfilAberto?.id, descricao: (foiCriacao ? 'Criação' : 'Atualização') + ` do perfil "${result?.nome_perfil || formPerfil.nome_perfil}"`, dados_novos: result || formPerfil });
      } catch {}
      setTimeout(() => { setPerfilAberto(null); resetForm(); }, 300);
    },
    onError: (error) => toast.error("❌ Erro ao salvar: " + error.message),
  });

  const excluirPerfilMutation = useMutation({
    mutationFn: (id) => base44.entities.PerfilAcesso.delete(id),
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      toast.success("🗑️ Perfil excluído!");
      try { base44.entities.AuditLog.create({ acao: 'Exclusão', modulo: 'Controle de Acesso', entidade: 'PerfilAcesso', registro_id: id, descricao: 'Perfil de acesso excluído' }); } catch {}
    },
    onError: (error) => toast.error("❌ Erro: " + error.message),
  });

  const atualizarUsuarioMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-gestao'] });
      queryClient.invalidateQueries({ queryKey: ['perfil-acesso'] });
      toast.success("✅ Usuário atualizado!");
    },
    onError: (error) => toast.error("❌ Erro: " + error.message),
  });

  const resetForm = () => setFormPerfil({ nome_perfil: "", descricao: "", nivel_perfil: "Operacional", permissoes: {}, ativo: true });

  const togglePermissao = (modulo, secao, acao) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      if (!novasPerms[modulo][secao]) novasPerms[modulo][secao] = [];
      const idx = novasPerms[modulo][secao].indexOf(acao);
      novasPerms[modulo][secao] = idx > -1 ? novasPerms[modulo][secao].filter(a => a !== acao) : [...novasPerms[modulo][secao], acao];
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoSecao = (modulo, secao) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      const todasAcoes = ACOES.map(a => a.id);
      const temTodas = todasAcoes.every(a => novasPerms[modulo][secao]?.includes(a));
      novasPerms[modulo][secao] = temTodas ? [] : [...todasAcoes];
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoModulo = (modulo) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      const todasAcoes = ACOES.map(a => a.id);
      const secoes = Object.keys(ESTRUTURA_SISTEMA[modulo].secoes);
      const tudoMarcado = secoes.every(s => todasAcoes.every(a => novasPerms[modulo]?.[s]?.includes(a)));
      novasPerms[modulo] = {};
      secoes.forEach(s => { novasPerms[modulo][s] = tudoMarcado ? [] : [...todasAcoes]; });
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoGlobal = () => {
    setFormPerfil(prev => {
      const todasAcoes = ACOES.map(a => a.id);
      const algumVazio = Object.keys(ESTRUTURA_SISTEMA).some(m => Object.keys(ESTRUTURA_SISTEMA[m].secoes).some(s => !prev.permissoes?.[m]?.[s] || prev.permissoes[m][s].length < todasAcoes.length));
      const novasPerms = {};
      Object.keys(ESTRUTURA_SISTEMA).forEach(m => { novasPerms[m] = {}; Object.keys(ESTRUTURA_SISTEMA[m].secoes).forEach(s => { novasPerms[m][s] = algumVazio ? [...todasAcoes] : []; }); });
      return { ...prev, permissoes: novasPerms };
    });
  };

  const temPermissao = (modulo, secao, acao) => formPerfil.permissoes?.[modulo]?.[secao]?.includes(acao) || false;
  const contarPermissoesModulo = (modulo) => Object.values(formPerfil.permissoes?.[modulo] || {}).reduce((t, s) => t + (s?.length || 0), 0);
  const contarPermissoesTotal = () => Object.values(formPerfil.permissoes || {}).reduce((t, m) => t + Object.values(m || {}).reduce((s, sec) => s + (sec?.length || 0), 0), 0);

  const abrirEdicaoPerfil = (perfil) => {
    setPerfilAberto(perfil);
    setFormPerfil({ nome_perfil: perfil.nome_perfil || "", descricao: perfil.descricao || "", nivel_perfil: perfil.nivel_perfil || "Operacional", permissoes: perfil.permissoes || {}, ativo: perfil.ativo !== false });
  };

  const handleVincularEmpresa = (usuario, empresaId, acao) => {
    const atuais = usuario.empresas_vinculadas || [];
    let novos;
    if (acao === 'adicionar') {
      if (atuais.some(v => v.empresa_id === empresaId)) { toast.error("Empresa já vinculada"); return; }
      novos = [...atuais, { empresa_id: empresaId, ativo: true, nivel_acesso: 'Operacional', data_vinculo: new Date().toISOString() }];
    } else {
      novos = atuais.filter(v => v.empresa_id !== empresaId);
    }
    const nomes = novos.map(v => { const e = empresas.find(x => x.id === v.empresa_id); return e?.nome_fantasia || e?.razao_social || v.empresa_id; });
    atualizarUsuarioMutation.mutate({ id: usuario.id, data: { empresas_vinculadas: novos, empresas_vinculadas_nomes: nomes } });
  };

  const handleVincularGrupo = (usuario, grupoId, acao) => {
    const atuais = usuario.grupos_vinculados || [];
    let novos;
    if (acao === 'adicionar') {
      if (atuais.some(v => v.grupo_id === grupoId)) { toast.error("Grupo já vinculado"); return; }
      novos = [...atuais, { grupo_id: grupoId, ativo: true, data_vinculo: new Date().toISOString() }];
    } else {
      novos = atuais.filter(v => v.grupo_id !== grupoId);
    }
    atualizarUsuarioMutation.mutate({ id: usuario.id, data: { grupos_vinculados: novos, pode_operar_em_grupo: novos.length > 0 } });
  };

  const stats = useMemo(() => {
    const totalUsuarios = usuarios.length;
    const usuariosComPerfil = usuarios.filter(u => u.perfil_acesso_id).length;
    const usuariosSemPerfil = totalUsuarios - usuariosComPerfil;
    const cobertura = totalUsuarios > 0 ? Math.round((usuariosComPerfil / totalUsuarios) * 100) : 0;
    return { totalPerfis: perfis.length, perfisAtivos: perfis.filter(p => p.ativo !== false).length, totalUsuarios, usuariosComPerfil, usuariosSemPerfil, cobertura };
  }, [perfis, usuarios]);

  const perfisFiltrados = perfis.filter(p => !busca || p.nome_perfil?.toLowerCase().includes(busca.toLowerCase()));
  const usuariosFiltrados = usuarios.filter(u => !busca || u.full_name?.toLowerCase().includes(busca.toLowerCase()) || u.email?.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Central de Perfis de Acesso</h2>
            <p className="text-blue-100 text-xs">Controle Granular Total • RBAC completo</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-white/20 px-3 py-1">{stats.totalPerfis} Perfis</Badge>
          <Badge className="bg-white/20 px-3 py-1">{stats.totalUsuarios} Usuários</Badge>
          <Badge className={`px-3 py-1 ${stats.cobertura >= 80 ? 'bg-green-500/80' : 'bg-orange-500/80'}`}>{stats.cobertura}% Cobertura</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-blue-500 text-white"><CardContent className="p-3"><p className="text-2xl font-bold">{stats.totalPerfis}</p><p className="text-xs opacity-90">Perfis</p></CardContent></Card>
        <Card className="bg-green-500 text-white"><CardContent className="p-3"><p className="text-2xl font-bold">{stats.usuariosComPerfil}</p><p className="text-xs opacity-90">Com Perfil</p></CardContent></Card>
        <Card className={`${stats.usuariosSemPerfil > 0 ? 'bg-orange-500' : 'bg-emerald-500'} text-white`}><CardContent className="p-3"><p className="text-2xl font-bold">{stats.usuariosSemPerfil}</p><p className="text-xs opacity-90">Sem Perfil</p></CardContent></Card>
        <Card className="bg-indigo-500 text-white"><CardContent className="p-3"><p className="text-2xl font-bold">{stats.cobertura}%</p><p className="text-xs opacity-90">Cobertura RBAC</p><Progress value={stats.cobertura} className="mt-1 h-1 bg-indigo-400" /></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input placeholder="Buscar perfis ou usuários..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="perfis"><Shield className="w-4 h-4 mr-1" />Perfis</TabsTrigger>
          <TabsTrigger value="usuarios"><Users className="w-4 h-4 mr-1" />Usuários</TabsTrigger>
          <TabsTrigger value="empresas"><Building2 className="w-4 h-4 mr-1" />Empresas</TabsTrigger>
        </TabsList>

        <TabsContent value="perfis" className="space-y-3 mt-3">
          <div className="flex justify-end">
            <Button onClick={() => { resetForm(); setPerfilAberto({ novo: true }); }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Novo Perfil
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {perfisFiltrados.map(perfil => {
              const qtd = Object.values(perfil.permissoes || {}).reduce((s, m) => s + Object.values(m || {}).reduce((ss, sec) => ss + (sec?.length || 0), 0), 0);
              return (
                <Card key={perfil.id} className="hover:shadow-md transition-all">
                  <CardHeader className="bg-slate-50 border-b pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{perfil.nome_perfil}</p>
                          <div className="flex gap-1 flex-wrap mt-1">
                            <Badge variant="outline" className="text-xs">{perfil.nivel_perfil}</Badge>
                            {qtd > 0 && <Badge className="bg-blue-100 text-blue-700 text-xs">{qtd} permissões</Badge>}
                          </div>
                        </div>
                      </div>
                      {perfil.ativo !== false ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    {perfil.descricao && <p className="text-xs text-slate-600 mb-2">{perfil.descricao}</p>}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <Badge className="bg-purple-100 text-purple-700 text-xs">{usuarios.filter(u => u.perfil_acesso_id === perfil.id).length} usuários</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => abrirEdicaoPerfil(perfil)}>
                          <Edit className="w-3 h-3 mr-1" />Editar
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => {
                          const using = usuarios.filter(u => u.perfil_acesso_id === perfil.id);
                          if (using.length > 0) { toast.error(`❌ ${using.length} usuário(s) usando este perfil`); return; }
                          if (confirm(`Confirma exclusão do perfil "${perfil.nome_perfil}"?`)) excluirPerfilMutation.mutate(perfil.id);
                        }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {perfisFiltrados.length === 0 && <div className="text-center py-8 text-slate-500"><Shield className="w-12 h-12 mx-auto mb-2 opacity-30" /><p className="text-sm">Nenhum perfil encontrado</p></div>}
        </TabsContent>

        <TabsContent value="usuarios" className="mt-3">
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-3 border-b bg-slate-50 text-sm flex-wrap">
                <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showEmpresas} onCheckedChange={setShowEmpresas} />Empresas</label>
                <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showGrupos} onCheckedChange={setShowGrupos} />Grupos</label>
                <label className="flex items-center gap-1 cursor-pointer"><Checkbox checked={showAcoes} onCheckedChange={setShowAcoes} />Ações</label>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[700px]">
                  <TableHeader><TableRow className="bg-slate-50">
                    <TableHead>Usuário</TableHead><TableHead>E-mail</TableHead><TableHead>Perfil</TableHead>
                    {showEmpresas && <TableHead>Emp.</TableHead>}
                    {showGrupos && <TableHead>Grupos</TableHead>}
                    {showAcoes && <TableHead>Ações</TableHead>}
                  </TableRow></TableHeader>
                  <TableBody>
                    {usuariosFiltrados.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium text-sm max-w-[150px]">
                          <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="truncate block max-w-[150px]">{u.full_name}</span></TooltipTrigger><TooltipContent>{u.full_name}</TooltipContent></Tooltip></TooltipProvider>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 max-w-[180px]">
                          <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="truncate block max-w-[180px]">{u.email}</span></TooltipTrigger><TooltipContent>{u.email}</TooltipContent></Tooltip></TooltipProvider>
                        </TableCell>
                        <TableCell>
                         <Select value={u.perfil_acesso_id || "sem-perfil"} onValueChange={(v) => {
                           const p = perfis.find(x => x.id === v);
                           atualizarUsuarioMutation.mutate({ id: u.id, data: { perfil_acesso_id: v === "sem-perfil" ? null : v, perfil_acesso_nome: v === "sem-perfil" ? null : (p?.nome_perfil || null) } });
                         }}>
                            <SelectTrigger className="w-[160px] h-7 text-xs"><SelectValue placeholder="Sem perfil" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sem-perfil">Sem perfil</SelectItem>
                              {perfis.filter(p => p.ativo !== false).map(p => (<SelectItem key={p.id} value={p.id}>{p.nome_perfil}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        {showEmpresas && <TableCell><div className="flex items-center gap-1"><Badge className="bg-purple-100 text-purple-700 text-xs">{(u.empresas_vinculadas || []).filter(v => v.ativo).length}</Badge><Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setUsuarioAberto(u)}><Settings className="w-3 h-3" /></Button></div></TableCell>}
                        {showGrupos && <TableCell><Badge className="bg-blue-100 text-blue-700 text-xs">{(u.grupos_vinculados || []).filter(v => v.ativo).length}</Badge></TableCell>}
                        {showAcoes && <TableCell><Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setUsuarioAberto(u)}><Key className="w-3 h-3 mr-1" />Config</Button></TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresas" className="mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="bg-purple-50 border-b pb-3"><CardTitle className="text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-600" />Empresas ({empresas.length})</CardTitle></CardHeader>
              <CardContent className="p-3 max-h-72 overflow-y-auto space-y-1">
                {empresas.map(e => {
                  const n = usuarios.filter(u => u.empresas_vinculadas?.some(v => v.empresa_id === e.id && v.ativo)).length;
                  return (<div key={e.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50 text-sm"><div><p className="font-medium">{e.nome_fantasia || e.razao_social}</p><Badge className="bg-purple-100 text-purple-700 text-xs">{n} usuários</Badge></div><Badge className={e.status === 'Ativa' ? 'bg-green-100 text-green-700 text-xs' : 'bg-gray-100 text-xs'}>{e.status}</Badge></div>);
                })}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-blue-50 border-b pb-3"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" />Grupos ({grupos.length})</CardTitle></CardHeader>
              <CardContent className="p-3 max-h-72 overflow-y-auto space-y-1">
                {grupos.map(g => {
                  const n = usuarios.filter(u => u.grupos_vinculados?.some(v => v.grupo_id === g.id && v.ativo)).length;
                  return (<div key={g.id} className="flex items-center justify-between p-2 border-b hover:bg-slate-50 text-sm"><div><p className="font-medium">{g.nome_do_grupo}</p><Badge className="bg-blue-100 text-blue-700 text-xs">{n} usuários</Badge></div><Badge className={g.status === 'Ativo' ? 'bg-green-100 text-green-700 text-xs' : 'bg-gray-100 text-xs'}>{g.status}</Badge></div>);
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {stats.usuariosSemPerfil > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription><strong>{stats.usuariosSemPerfil} usuários sem perfil.</strong> Configure em "Usuários".</AlertDescription>
        </Alert>
      )}

      {/* MODAL: CRIAR/EDITAR PERFIL */}
      {perfilAberto && (
        <div className="fixed inset-2 sm:inset-4 z-[9999999] bg-white shadow-2xl flex flex-col rounded-xl border overflow-hidden">
          <div className="bg-blue-50 border-b p-4 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold">{perfilAberto.novo ? 'Novo Perfil' : `Editar: ${perfilAberto.nome_perfil}`}</h3>
              {contarPermissoesTotal() > 0 && <Badge className="bg-blue-600 text-white">{contarPermissoesTotal()} perm.</Badge>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPerfilAberto(null)}>✕</Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!formPerfil.nome_perfil) { toast.error("Nome é obrigatório"); return; }
              salvarPerfilMutation.mutate({ ...formPerfil, group_id: empresaAtual?.group_id || null });
            }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><Label className="text-xs">Nome *</Label><Input value={formPerfil.nome_perfil} onChange={(e) => setFormPerfil({ ...formPerfil, nome_perfil: e.target.value })} placeholder="Ex: Vendedor" className="mt-1" required /></div>
                <div><Label className="text-xs">Nível</Label>
                  <Select value={formPerfil.nivel_perfil} onValueChange={(v) => setFormPerfil({ ...formPerfil, nivel_perfil: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Administrador","Gerencial","Operacional","Consulta","Personalizado"].map(n => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Status</Label>
                  <div className="flex items-center gap-2 mt-2"><Switch checked={formPerfil.ativo} onCheckedChange={(v) => setFormPerfil({ ...formPerfil, ativo: v })} /><span className="text-sm">{formPerfil.ativo ? 'Ativo' : 'Inativo'}</span></div>
                </div>
              </div>
              <div><Label className="text-xs">Descrição</Label><Textarea value={formPerfil.descricao} onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })} placeholder="Responsabilidades do perfil" className="mt-1" rows={2} /></div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-bold">Permissões Granulares</Label>
                  <Button type="button" variant="outline" size="sm" onClick={selecionarTudoGlobal}><CheckSquare className="w-3 h-3 mr-1" />Tudo/Nada</Button>
                </div>
                <Alert className="mb-3 border-blue-200 bg-blue-50 py-2"><Info className="w-3 h-3 text-blue-600" /><AlertDescription className="text-xs text-blue-800">{contarPermissoesTotal()} permissões selecionadas</AlertDescription></Alert>
                <div className="border rounded-lg bg-slate-50 max-h-[50vh] overflow-auto">
                  <Accordion type="multiple" value={modulosExpandidos} onValueChange={setModulosExpandidos}>
                    {Object.entries(ESTRUTURA_SISTEMA).map(([modId, mod]) => {
                      const Icone = mod.icone;
                      const qtd = contarPermissoesModulo(modId);
                      return (
                        <AccordionItem key={modId} value={modId} className="border-b">
                          <AccordionTrigger className="px-3 py-2 hover:bg-white/50">
                            <div className="flex items-center gap-2 flex-1">
                              <Icone className={`w-4 h-4 ${COR_CLASS[mod.cor] || 'text-gray-600'}`} />
                              <span className="text-sm font-medium">{mod.nome}</span>
                              {qtd > 0 && <Badge className="bg-blue-100 text-blue-700 text-xs">{qtd}</Badge>}
                              <Button type="button" variant="ghost" size="sm" className="ml-auto h-5 px-2 text-xs" onClick={(e) => { e.stopPropagation(); selecionarTudoModulo(modId); }}><CheckSquare className="w-3 h-3 mr-1" />Tudo</Button>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            <div className="space-y-2">
                              {Object.entries(mod.secoes).map(([secId, sec]) => {
                                const qtdSec = formPerfil.permissoes?.[modId]?.[secId]?.length || 0;
                                return (
                                  <Card key={secId} className="border bg-white">
                                    <CardHeader className="bg-slate-50 border-b py-2 px-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-xs font-semibold">{sec.nome}</p>
                                          {sec.abas?.length > 0 && <p className="text-xs text-slate-400">{sec.abas.join(", ")}</p>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {qtdSec > 0 && <Badge className="bg-green-100 text-green-700 text-xs">{qtdSec}</Badge>}
                                          <Button type="button" size="sm" variant="ghost" className="h-5 px-2 text-xs" onClick={() => selecionarTudoSecao(modId, secId)}><CheckSquare className="w-3 h-3" /></Button>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                      <div className="flex flex-wrap gap-1">
                                        {ACOES.map(acao => {
                                          const marcado = temPermissao(modId, secId, acao.id);
                                          const IconeAcao = acao.icone;
                                          return (
                                            <label key={acao.id} className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded border text-xs transition-all ${marcado ? 'bg-blue-100 border-blue-300 text-blue-700 font-semibold' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                              <Checkbox checked={marcado} onCheckedChange={() => togglePermissao(modId, secId, acao.id)} />
                                              <IconeAcao className="w-3 h-3" />
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

              <div className="flex justify-between items-center pt-3 border-t">
                <Badge className="bg-slate-100 text-slate-700 text-xs">{contarPermissoesTotal()} perm. • {Object.keys(formPerfil.permissoes).length} módulos</Badge>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setPerfilAberto(null)}>Cancelar</Button>
                  <Button type="submit" disabled={salvarPerfilMutation.isPending || !formPerfil.nome_perfil} className="bg-blue-600 hover:bg-blue-700">
                    {salvarPerfilMutation.isPending ? <><RefreshCw className="w-4 h-4 mr-1 animate-spin" />Salvando...</> : <><CheckCircle className="w-4 h-4 mr-1" />Salvar</>}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAR USUÁRIO */}
      {usuarioAberto && (
        <div className="fixed inset-2 sm:inset-4 z-[9999999] bg-white shadow-2xl flex flex-col rounded-xl border overflow-hidden">
          <div className="bg-green-50 border-b p-4 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-green-600" /><h3 className="font-bold text-sm">Configurar: {usuarioAberto.full_name}</h3></div>
            <Button variant="ghost" size="sm" onClick={() => setUsuarioAberto(null)}>✕</Button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div>
              <Label className="font-bold mb-2 block">Perfil de Acesso</Label>
              <Select value={usuarioAberto.perfil_acesso_id || "sem-perfil"} onValueChange={(v) => {
                const p = perfis.find(x => x.id === v);
                atualizarUsuarioMutation.mutate({ id: usuarioAberto.id, data: { perfil_acesso_id: v === "sem-perfil" ? null : v, perfil_acesso_nome: v === "sem-perfil" ? null : p?.nome_perfil } });
                setUsuarioAberto({ ...usuarioAberto, perfil_acesso_id: v === "sem-perfil" ? null : v });
              }}>
                <SelectTrigger><SelectValue placeholder="Selecione um perfil" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem-perfil">Sem perfil</SelectItem>
                  {perfis.filter(p => p.ativo !== false).map(p => (<SelectItem key={p.id} value={p.id}><span className="flex items-center gap-2"><Shield className="w-3 h-3" />{p.nome_perfil} <Badge variant="outline" className="text-xs">{p.nivel_perfil}</Badge></span></SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-bold mb-2 flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-600" />Empresas Vinculadas</Label>
              <Card className="border-purple-200"><CardContent className="p-3 space-y-2 max-h-56 overflow-y-auto">
                {empresas.length > 0 ? empresas.map(e => {
                  const vinc = usuarioAberto.empresas_vinculadas?.some(v => v.empresa_id === e.id && v.ativo) || false;
                  return (<div key={e.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50 text-sm">
                    <div className="flex items-center gap-2"><Checkbox checked={vinc} onCheckedChange={(c) => { handleVincularEmpresa(usuarioAberto, e.id, c ? 'adicionar' : 'remover'); const n = c ? [...(usuarioAberto.empresas_vinculadas || []), { empresa_id: e.id, ativo: true }] : (usuarioAberto.empresas_vinculadas || []).filter(v => v.empresa_id !== e.id); setUsuarioAberto({ ...usuarioAberto, empresas_vinculadas: n }); }} /><div><p className="font-medium text-xs">{e.nome_fantasia || e.razao_social}</p><p className="text-xs text-slate-400">{e.cnpj}</p></div></div>
                    <Badge className={vinc ? 'bg-green-100 text-green-700 text-xs' : 'bg-slate-100 text-xs'}>{vinc ? 'Vinculado' : 'Sem acesso'}</Badge>
                  </div>);
                }) : <p className="text-center text-slate-500 py-3 text-sm">Nenhuma empresa cadastrada</p>}
              </CardContent></Card>
            </div>
            <div>
              <Label className="font-bold mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" />Grupos Empresariais</Label>
              <Card className="border-blue-200"><CardContent className="p-3 space-y-2 max-h-56 overflow-y-auto">
                {grupos.length > 0 ? grupos.map(g => {
                  const vinc = usuarioAberto.grupos_vinculados?.some(v => v.grupo_id === g.id && v.ativo) || false;
                  return (<div key={g.id} className="flex items-center justify-between p-2 border rounded hover:bg-slate-50 text-sm">
                    <div className="flex items-center gap-2"><Checkbox checked={vinc} onCheckedChange={(c) => { handleVincularGrupo(usuarioAberto, g.id, c ? 'adicionar' : 'remover'); const n = c ? [...(usuarioAberto.grupos_vinculados || []), { grupo_id: g.id, ativo: true }] : (usuarioAberto.grupos_vinculados || []).filter(v => v.grupo_id !== g.id); setUsuarioAberto({ ...usuarioAberto, grupos_vinculados: n, pode_operar_em_grupo: n.length > 0 }); }} /><div><p className="font-medium text-xs">{g.nome_do_grupo}</p><p className="text-xs text-slate-400">{empresas.filter(e => e.group_id === g.id).length} empresas</p></div></div>
                    <Badge className={vinc ? 'bg-blue-100 text-blue-700 text-xs' : 'bg-slate-100 text-xs'}>{vinc ? 'Vinculado' : 'Sem acesso'}</Badge>
                  </div>);
                }) : <p className="text-center text-slate-500 py-3 text-sm">Nenhum grupo cadastrado</p>}
              </CardContent></Card>
            </div>
          </div>
          <div className="p-4 border-t bg-slate-50 sticky bottom-0">
            <Button onClick={() => setUsuarioAberto(null)} className="w-full bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-2" />Concluir</Button>
          </div>
        </div>
      )}
    </div>
  );
}