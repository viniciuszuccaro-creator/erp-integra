import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, UserCog, Mail, Shield, Building2 } from "lucide-react";
import GestaoUsuariosAvancada from "@/components/sistema/GestaoUsuariosAvancada";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";

export default function UsuariosTab() {
  const { filterInContext, empresaAtual } = useContextoVisual();
  const { hasPermission, isAdmin } = usePermissions();
  const podeConvidar = isAdmin() || hasPermission('Sistema', 'Controle de Acesso', 'criar');
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("todos");

  const { data: usuarios = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['usuarios-gestao', empresaAtual?.id],
    queryFn: () => base44.entities.User.list(),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    enabled: isAdmin() || hasPermission('Sistema', 'Controle de Acesso', 'visualizar'),
  });

  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-acesso-tab', empresaAtual?.id],
    queryFn: () => filterInContext('PerfilAcesso', {}, '-updated_date', 200),
    enabled: isAdmin() || hasPermission('Sistema', 'Controle de Acesso', 'visualizar'),
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-gestao'],
    queryFn: () => base44.entities.Empresa.list(),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    enabled: isAdmin() || hasPermission('Sistema', 'Controle de Acesso', 'visualizar'),
  });

  const handleInvite = async () => {
    const email = prompt("E-mail do novo usuário:");
    if (!email) return;
    try {
      await base44.users.inviteUser(email, "user");
      toast.success(`Convite enviado para ${email}`);
      qc.invalidateQueries({ queryKey: ['usuarios-gestao'] });
    } catch (e) {
      toast.error("Erro ao convidar: " + e.message);
    }
  };

  const filtered = usuarios.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "todos" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColor = (role) => role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600';

  return (
    <div className="w-full min-w-0 h-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between min-w-0 w-full">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
          <div className="relative min-w-[180px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <Input className="pl-8" placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {podeConvidar && (
          <Button onClick={handleInvite} className="bg-blue-600 hover:bg-blue-700">
            <UserCog className="w-4 h-4 mr-2" />Convidar Usuário
          </Button>
        )}
      </div>

      {/* Lista */}
      {loadingUsers ? (
        <div className="text-sm text-slate-500 p-4">Carregando...</div>
      ) : (
        <div className="grid gap-2 min-w-0">
          {filtered.length === 0 && (
            <div className="text-sm text-slate-400 p-6 text-center">Nenhum usuário encontrado.</div>
          )}
          {filtered.map(u => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {u.full_name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{u.full_name || '—'}</p>
                    <Badge className={roleColor(u.role) + " text-xs"}>{u.role}</Badge>
                    {u.perfil_acesso_nome && (
                      <Badge variant="outline" className="text-xs"><Shield className="w-3 h-3 mr-1" />{u.perfil_acesso_nome}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <Mail className="w-3 h-3" />{u.email}
                    {u.empresas_vinculadas?.length > 0 && (
                      <span className="ml-2 flex items-center gap-1"><Building2 className="w-3 h-3" />{u.empresas_vinculadas.length} empresa(s)</span>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" data-permission="Sistema.Controle de Acesso.editar" onClick={() => setSelectedUser(u)}>
                  Configurar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de edição */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Configurar Usuário — {selectedUser.full_name}</DialogTitle>
            </DialogHeader>
            <GestaoUsuariosAvancada
              usuario={selectedUser}
              perfis={perfis}
              empresas={empresas}
              onClose={() => setSelectedUser(null)}
              onSuccess={() => { setSelectedUser(null); qc.invalidateQueries({ queryKey: ['usuarios-gestao'] }); }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}