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
import { toast } from "sonner";
import {
  Shield,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Search,
  Settings,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  UserPlus,
  UserCheck,
  Key,
  ShieldCheck,
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
  Download,
  MessageCircle,
  Briefcase
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";

/**
 * 🏆 CENTRAL DE PERFIS DE ACESSO V21.7 - 100% UNIFICADO
 * Gerencia TUDO em um só lugar:
 * - Perfis de Acesso
 * - Usuários e Atribuições
 * - Permissões por Empresa
 * - Vínculo de Empresas
 * 
 * Resolve o problema: "não tenho acesso à empresa"
 */

const MODULOS = {
  dashboard: { nome: "Dashboard", icone: LayoutDashboard, cor: "blue" },
  comercial: { nome: "Comercial", icone: ShoppingCart, cor: "green" },
  financeiro: { nome: "Financeiro", icone: DollarSign, cor: "emerald" },
  estoque: { nome: "Estoque", icone: Package, cor: "purple" },
  compras: { nome: "Compras", icone: Briefcase, cor: "orange" },
  expedicao: { nome: "Expedição", icone: Truck, cor: "cyan" },
  producao: { nome: "Produção", icone: Factory, cor: "indigo" },
  rh: { nome: "RH", icone: UserCircle, cor: "pink" },
  fiscal: { nome: "Fiscal", icone: FileText, cor: "red" },
  cadastros: { nome: "Cadastros", icone: Users, cor: "slate" },
  crm: { nome: "CRM", icone: MessageCircle, cor: "violet" },
  relatorios: { nome: "Relatórios", icone: BarChart3, cor: "teal" }
};

const ACOES = [
  { id: "visualizar", nome: "Visualizar", cor: "slate" },
  { id: "criar", nome: "Criar", cor: "blue" },
  { id: "editar", nome: "Editar", cor: "green" },
  { id: "excluir", nome: "Excluir", cor: "red" },
  { id: "aprovar", nome: "Aprovar", cor: "purple" },
  { id: "exportar", nome: "Exportar", cor: "cyan" }
];

export default function CentralPerfisAcesso() {
  const [activeTab, setActiveTab] = useState("perfis");
  const [perfilAberto, setPerfilAberto] = useState(null);
  const [usuarioAberto, setUsuarioAberto] = useState(null);
  const [busca, setBusca] = useState("");

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

  // State do formulário de perfil
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
      const perfilId = perfilAberto?.id;
      if (perfilId && !perfilAberto.novo) {
        return await base44.entities.PerfilAcesso.update(perfilId, data);
      } else {
        return await base44.entities.PerfilAcesso.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      const foiCriacao = perfilAberto?.novo;
      toast.success(foiCriacao ? "✅ Perfil criado com sucesso!" : "✅ Perfil atualizado com sucesso!");
      setPerfilAberto(null);
      resetForm();
    },
    onError: (error) => {
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

  const resetForm = () => {
    setFormPerfil({
      nome_perfil: "",
      descricao: "",
      nivel_perfil: "Operacional",
      permissoes: {},
      ativo: true
    });
  };

  const togglePermissao = (modulo, acao) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      
      const moduloPerms = novasPerms[modulo];
      const secaoPrincipal = Object.keys(moduloPerms)[0] || modulo;
      
      if (!moduloPerms[secaoPrincipal]) moduloPerms[secaoPrincipal] = [];
      
      const index = moduloPerms[secaoPrincipal].indexOf(acao);
      if (index > -1) {
        moduloPerms[secaoPrincipal] = moduloPerms[secaoPrincipal].filter(a => a !== acao);
      } else {
        moduloPerms[secaoPrincipal] = [...moduloPerms[secaoPrincipal], acao];
      }

      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoModulo = (modulo) => {
    setFormPerfil(prev => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      
      const moduloPerms = novasPerms[modulo];
      const secaoPrincipal = Object.keys(moduloPerms)[0] || modulo;
      
      const todasAcoes = ACOES.map(a => a.id);
      const temTodas = todasAcoes.every(a => moduloPerms[secaoPrincipal]?.includes(a));
      
      if (temTodas) {
        moduloPerms[secaoPrincipal] = [];
      } else {
        moduloPerms[secaoPrincipal] = [...todasAcoes];
      }

      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoGlobal = () => {
    setFormPerfil(prev => {
      const novasPerms = {};
      const todasAcoes = ACOES.map(a => a.id);
      
      const algumModuloVazio = Object.keys(MODULOS).some(modId => {
        const perms = prev.permissoes?.[modId];
        const secao = Object.keys(perms || {})[0] || modId;
        return !perms || !perms[secao] || perms[secao].length < todasAcoes.length;
      });

      Object.keys(MODULOS).forEach(modId => {
        novasPerms[modId] = {};
        novasPerms[modId][modId] = algumModuloVazio ? [...todasAcoes] : [];
      });

      return { ...prev, permissoes: novasPerms };
    });
  };

  const temPermissao = (modulo, acao) => {
    const moduloPerms = formPerfil.permissoes?.[modulo];
    if (!moduloPerms) return false;
    const secaoPrincipal = Object.keys(moduloPerms)[0];
    if (!secaoPrincipal || !Array.isArray(moduloPerms[secaoPrincipal])) return false;
    return moduloPerms[secaoPrincipal].includes(acao) || false;
  };

  const abrirEdicaoPerfil = (perfil) => {
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

    const empresa = empresas.find(e => e.id === empresaId);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Central de Perfis de Acesso</h1>
                <p className="text-blue-100">Gerenciamento completo • Perfis • Usuários • Empresas • Permissões</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-white/20 px-4 py-2">
                {stats.totalPerfis} Perfis
              </Badge>
              <Badge className="bg-white/20 px-4 py-2">
                {stats.totalUsuarios} Usuários
              </Badge>
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
          {/* Botão criar */}
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

          {/* Lista de Perfis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {perfisFiltrados.map(perfil => (
              <Card key={perfil.id} className="hover:shadow-lg transition-all">
                <CardHeader className="bg-slate-50 border-b pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-base">{perfil.nome_perfil}</CardTitle>
                        <Badge variant="outline" className="mt-1">{perfil.nivel_perfil}</Badge>
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
                    <Badge className="bg-blue-100 text-blue-700">
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
                        title={usuarios.some(u => u.perfil_acesso_id === perfil.id) ? "Perfil em uso, não pode ser excluído" : "Excluir perfil"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                const perfil = perfis.find(p => p.id === usuario.perfil_acesso_id);
                const empresasVinculadas = usuario.empresas_vinculadas || [];
                const gruposVinculados = usuario.grupos_vinculados || [];

                return (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.full_name}</TableCell>
                    <TableCell className="text-sm text-slate-600">{usuario.email}</TableCell>
                    <TableCell>
                      <Select
                        value={usuario.perfil_acesso_id || ""}
                        onValueChange={(v) => {
                          const perfilSel = perfis.find(p => p.id === v);
                          atualizarUsuarioMutation.mutate({
                            id: usuario.id,
                            data: {
                              perfil_acesso_id: v || null,
                              perfil_acesso_nome: perfilSel?.nome_perfil || null
                            }
                          });
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sem perfil" />
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
        </TabsContent>

        {/* TAB: EMPRESAS */}
        <TabsContent value="empresas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empresas */}
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

            {/* Grupos */}
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

      {/* Modal Editar Perfil */}
      {perfilAberto && (
        <Card className="fixed inset-4 z-[9999999] overflow-auto bg-white shadow-2xl">
          <CardHeader className="bg-blue-50 border-b sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                {perfilAberto.novo ? 'Novo Perfil de Acesso' : `Editar: ${perfilAberto.nome_perfil}`}
              </CardTitle>
              <Button variant="ghost" onClick={() => setPerfilAberto(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              console.log("Salvando perfil:", formPerfil);
              const dadosSalvar = {
                ...formPerfil,
                group_id: empresaAtual?.group_id || null
              };
              salvarPerfilMutation.mutate(dadosSalvar);
            }} className="space-y-6">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Nome do Perfil *</Label>
                  <Input
                    value={formPerfil.nome_perfil}
                    onChange={(e) => setFormPerfil({ ...formPerfil, nome_perfil: e.target.value })}
                    placeholder="Ex: Vendedor, Gerente"
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

              {/* Grid de Permissões */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-bold">Permissões por Módulo</Label>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(MODULOS).map(([modId, mod]) => {
                    const Icone = mod.icone;
                    return (
                      <Card key={modId} className="border-2">
                        <CardHeader className={`bg-${mod.cor}-50 border-b pb-3`}>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Icone className={`w-4 h-4 text-${mod.cor}-600`} />
                              {mod.nome}
                            </CardTitle>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => selecionarTudoModulo(modId)}
                              className="h-6 px-2 text-xs"
                            >
                              <CheckSquare className="w-3 h-3 mr-1" />
                              Tudo
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {ACOES.map(acao => {
                              const marcado = temPermissao(modId, acao.id);
                              return (
                                <label
                                  key={acao.id}
                                  className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded border text-xs transition-all ${
                                    marcado
                                      ? `bg-${acao.cor}-100 border-${acao.cor}-300 text-${acao.cor}-700`
                                      : 'bg-white border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <Checkbox
                                    checked={marcado}
                                    onCheckedChange={() => togglePermissao(modId, acao.id)}
                                  />
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
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setPerfilAberto(null)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={salvarPerfilMutation.isPending}
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
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal Configurar Usuário */}
      {usuarioAberto && (
        <Card className="fixed inset-4 z-[9999999] overflow-auto bg-white shadow-2xl">
          <CardHeader className="bg-green-50 border-b sticky top-0 z-10">
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
          <CardContent className="p-6 space-y-6">
            {/* Perfil */}
            <div>
              <Label className="text-base font-bold mb-3 block">Perfil de Acesso</Label>
              <Select
                value={usuarioAberto.perfil_acesso_id || ""}
                onValueChange={(v) => {
                  const perfilSel = perfis.find(p => p.id === v);
                  atualizarUsuarioMutation.mutate({
                    id: usuarioAberto.id,
                    data: {
                      perfil_acesso_id: v || null,
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
                  <SelectItem value={null}>Sem perfil</SelectItem>
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
                <CardContent className="p-4 space-y-3">
                  {empresas.map(empresa => {
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
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Vincular Grupos */}
            <div>
              <Label className="text-base font-bold mb-3 block flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Grupos Vinculados
              </Label>
              <Card className="border-blue-200">
                <CardContent className="p-4 space-y-3">
                  {grupos.map(grupo => {
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
                  })}
                </CardContent>
              </Card>
            </div>
          </CardContent>

          <div className="p-6 border-t bg-slate-50">
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