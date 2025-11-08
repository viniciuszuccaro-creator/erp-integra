import React, { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Shield, Users, Building2, Lock, CheckCircle, XCircle, Plus, Edit } from "lucide-react";

/**
 * Gerenciamento completo de acessos granulares
 * - Perfis de acesso
 * - Permissões por módulo/ação
 * - Permissões por empresa
 * - Auditoria de acessos
 */
export default function GerenciamentoAcessos() {
  const [activeTab, setActiveTab] = useState("perfis");
  const [perfilDialogOpen, setPerfilDialogOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState(null);
  const [permissaoDialogOpen, setPermissaoDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-acesso'],
    queryFn: () => base44.entities.PerfilAcesso.list(),
  });

  const { data: usuarios = [] } = useQuery({
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

  const modulos = [
    'Dashboard',
    'Comercial e Vendas',
    'Financeiro e Contábil',
    'Estoque e Almoxarifado',
    'Compras e Suprimentos',
    'Expedição e Logística',
    'Produção e Manufatura',
    'Recursos Humanos',
    'Fiscal e Tributário',
    'Cadastros Gerais',
    'CRM - Relacionamento',
    'Agenda e Calendário',
    'Relatórios e Análises',
    'Contratos',
    'Gestão de Empresas',
    'Controle de Acesso',
    'Integrações',
    'Configurações'
  ];

  const [formPerfil, setFormPerfil] = useState({
    nome: "",
    descricao: "",
    nivel_acesso: "Básico",
    permissoes: {}
  });

  const criarPerfilMutation = useMutation({
    mutationFn: (data) => base44.entities.PerfilAcesso.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      setPerfilDialogOpen(false);
      setEditingPerfil(null);
      setFormPerfil({ nome: "", descricao: "", nivel_acesso: "Básico", permissoes: {} });
      toast({ title: "✅ Perfil criado!" });
    },
  });

  const atualizarPerfilMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PerfilAcesso.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis-acesso'] });
      setPerfilDialogOpen(false);
      setEditingPerfil(null);
      toast({ title: "✅ Perfil atualizado!" });
    },
  });

  const criarPermissaoEmpresaMutation = useMutation({
    mutationFn: (data) => base44.entities.PermissaoEmpresaModulo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissoes-empresa'] });
      setPermissaoDialogOpen(false);
      toast({ title: "✅ Permissão configurada!" });
    },
  });

  const handleSubmitPerfil = (e) => {
    e.preventDefault();
    if (editingPerfil) {
      atualizarPerfilMutation.mutate({ id: editingPerfil.id, data: formPerfil });
    } else {
      criarPerfilMutation.mutate(formPerfil);
    }
  };

  const togglePermissao = (modulo, acao) => {
    setFormPerfil(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [modulo]: {
          ...(prev.permissoes[modulo] || {}),
          [acao]: !(prev.permissoes[modulo]?.[acao])
        }
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Acessos</h2>
          <p className="text-slate-600">Perfis, permissões e controle granular</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border">
          <TabsTrigger value="perfis">
            <Shield className="w-4 h-4 mr-2" />
            Perfis de Acesso
          </TabsTrigger>
          <TabsTrigger value="usuarios">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="empresas">
            <Building2 className="w-4 h-4 mr-2" />
            Por Empresa
          </TabsTrigger>
        </TabsList>

        {/* PERFIS DE ACESSO */}
        <TabsContent value="perfis" className="space-y-4">
          <Card>
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle>Perfis de Acesso ({perfis.length})</CardTitle>
              <Dialog open={perfilDialogOpen} onOpenChange={setPerfilDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPerfil ? 'Editar' : 'Novo'} Perfil de Acesso</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitPerfil} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Perfil *</Label>
                        <Input
                          value={formPerfil.nome}
                          onChange={(e) => setFormPerfil({ ...formPerfil, nome: e.target.value })}
                          required
                          placeholder="Ex: Vendedor, Gerente Financeiro"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Nível de Acesso</Label>
                        <Select
                          value={formPerfil.nivel_acesso}
                          onValueChange={(v) => setFormPerfil({ ...formPerfil, nivel_acesso: v })}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Básico">Básico</SelectItem>
                            <SelectItem value="Intermediário">Intermediário</SelectItem>
                            <SelectItem value="Avançado">Avançado</SelectItem>
                            <SelectItem value="Administrador">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={formPerfil.descricao}
                        onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })}
                        placeholder="Descrição do perfil"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-semibold">Permissões por Módulo</Label>
                      <div className="mt-3 space-y-3 max-h-96 overflow-y-auto border rounded p-4">
                        {modulos.map(modulo => {
                          const moduloKey = modulo.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
                          const perms = formPerfil.permissoes[moduloKey] || {};

                          return (
                            <div key={modulo} className="border-b pb-3">
                              <p className="font-semibold text-sm mb-2">{modulo}</p>
                              <div className="flex flex-wrap gap-2">
                                {['visualizar', 'criar', 'editar', 'excluir', 'aprovar'].map(acao => (
                                  <label key={acao} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={perms[acao] || false}
                                      onChange={() => togglePermissao(moduloKey, acao)}
                                      className="rounded"
                                    />
                                    <span className="text-sm capitalize">{acao}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => {
                        setPerfilDialogOpen(false);
                        setEditingPerfil(null);
                        setFormPerfil({ nome: "", descricao: "", nivel_acesso: "Básico", permissoes: {} });
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={criarPerfilMutation.isPending || atualizarPerfilMutation.isPending}>
                        {editingPerfil ? 'Atualizar' : 'Criar'} Perfil
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perfis.map(perfil => (
                    <TableRow key={perfil.id}>
                      <TableCell className="font-medium">{perfil.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{perfil.nivel_acesso}</Badge>
                      </TableCell>
                      <TableCell>{perfil.usuarios_vinculados?.length || 0}</TableCell>
                      <TableCell>
                        {perfil.ativo ? (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingPerfil(perfil);
                            setFormPerfil(perfil);
                            setPerfilDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {perfis.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum perfil criado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USUÁRIOS */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Usuários e Permissões</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Empresa Padrão</TableHead>
                    <TableHead>Empresas Vinculadas</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.perfil_acesso_nome || 'Sem perfil'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.empresa_padrao_nome || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-700">
                          {user.empresas_vinculadas?.length || 0} empresas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.role === 'admin' ? 'bg-purple-600' : 'bg-slate-600'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERMISSÕES POR EMPRESA */}
        <TabsContent value="empresas">
          <Card>
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
              <CardTitle>Permissões Específicas por Empresa</CardTitle>
              <Dialog open={permissaoDialogOpen} onOpenChange={setPermissaoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Permissão
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configurar Permissão por Empresa</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    
                    const usuario = usuarios.find(u => u.id === formData.get('usuario'));
                    const empresa = empresas.find(emp => emp.id === formData.get('empresa'));
                    
                    criarPermissaoEmpresaMutation.mutate({
                      usuario_id: formData.get('usuario'),
                      usuario_nome: usuario?.full_name,
                      empresa_id: formData.get('empresa'),
                      empresa_nome: empresa?.nome_fantasia || empresa?.razao_social,
                      modulo: formData.get('modulo'),
                      nivel_acesso: formData.get('nivel'),
                      data_concessao: new Date().toISOString(),
                      alterado_por: "Sistema",
                      ativo: true
                    });
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Usuário *</Label>
                        <Select name="usuario" required>
                          <SelectTrigger className="mt-2">
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
                          <SelectTrigger className="mt-2">
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
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {modulos.map(mod => (
                            <SelectItem key={mod} value={mod}>
                              {mod}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Nível de Acesso *</Label>
                      <Select name="nivel" required defaultValue="Visualizar">
                        <SelectTrigger className="mt-2">
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
                      <Button type="submit" disabled={criarPermissaoEmpresaMutation.isPending}>
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
                          perm.nivel_acesso === 'Aprovar' ? 'bg-purple-600' :
                          perm.nivel_acesso === 'Excluir' ? 'bg-red-600' :
                          perm.nivel_acesso === 'Criar' ? 'bg-blue-600' :
                          perm.nivel_acesso === 'Editar' ? 'bg-green-600' :
                          'bg-slate-600'
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
      </Tabs>
    </div>
  );
}