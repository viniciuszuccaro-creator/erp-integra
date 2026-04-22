import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import usePermissions from "@/components/lib/usePermissions";
import CentralPerfisAcesso from "@/components/sistema/CentralPerfisAcesso";
import RelatorioPermissoes from "@/components/sistema/RelatorioPermissoes";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { useQuery } from "@tanstack/react-query";
import SoDChecker from "@/components/administracao-sistema/gestao-acessos/SoDChecker";
import UsuariosTab from "@/components/administracao-sistema/gestao-acessos/UsuariosTab";
import { Shield, Users, BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function GestaoAcessosIndex() {
  const { hasPermission, isAdmin } = usePermissions();
  const podeVer = isAdmin() || hasPermission('Sistema', ['Controle de Acesso'], 'visualizar');
  const { filterInContext, empresaAtual } = useContextoVisual();
  const { user } = useUser();
  const [tab, setTab] = React.useState('perfis');

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
        acao: 'Visualização',
        modulo: 'Sistema',
        tipo_auditoria: 'ui',
        entidade: 'Controle de Acesso',
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
  };

  // Hooks SEMPRE antes de qualquer return condicional
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-acesso', empresaAtual?.id],
    queryFn: () => filterInContext('PerfilAcesso', {}, '-updated_date', 200),
    enabled: podeVer,
  });
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list(),
    enabled: podeVer,
  });
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-ga', empresaAtual?.id],
    queryFn: () => base44.entities.Empresa.list(),
    enabled: podeVer,
  });

  if (!podeVer) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <p className="font-semibold text-slate-800">Acesso Restrito</p>
        <p className="text-sm text-slate-500">Você não tem permissão para acessar a Gestão de Acessos.</p>
      </div>
    );
  }

  // Estatísticas rápidas para o banner de status do RBAC
  const usuariosSemPerfil = usuarios.filter(u => !u.perfil_acesso_id && u.role !== 'admin').length;
  const perfisAtivos = perfis.filter(p => p.ativo !== false).length;

  return (
    <div className="w-full flex flex-col gap-3 min-h-0">
      {/* Banner RBAC com estatísticas */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-600 font-medium">RBAC Ativo</p>
              <p className="text-lg font-bold text-blue-900">{perfisAtivos} perfil(is)</p>
            </div>
          </CardContent>
        </Card>
        <Card className={usuariosSemPerfil > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}>
          <CardContent className="p-3 flex items-center gap-3">
            {usuariosSemPerfil > 0
              ? <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
              : <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />}
            <div>
              <p className={`text-xs font-medium ${usuariosSemPerfil > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {usuariosSemPerfil > 0 ? 'Sem perfil atribuído' : 'Todos com perfil'}
              </p>
              <p className={`text-lg font-bold ${usuariosSemPerfil > 0 ? 'text-amber-900' : 'text-green-900'}`}>
                {usuariosSemPerfil > 0 ? `${usuariosSemPerfil} usuário(s)` : `${usuarios.length} usuário(s)`}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-3 flex items-center gap-3">
            <Users className="w-8 h-8 text-slate-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-600 font-medium">Total de Usuários</p>
              <p className="text-lg font-bold text-slate-900">{usuarios.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso se há usuários sem perfil */}
      {usuariosSemPerfil > 0 && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 w-full">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>{usuariosSemPerfil} usuário(s)</strong> sem perfil RBAC atribuído.
            Acesse a aba <strong>Usuários</strong> para corrigir.
          </span>
        </div>
      )}

      {/* Info RBAC */}
       <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 w-full">
         <Shield className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
         <span className="leading-relaxed break-words min-w-0 flex-1">
           <strong>RBAC granular + multiempresa</strong> — Perfis controlam acesso por módulo, seção e ação. 
           Permissões propagam automaticamente entre grupo ↔ empresas. 
           Admins têm acesso total. Atribua perfis na aba <em>Usuários</em>.
           Verifique conflitos SoD na aba correspondente.
         </span>
       </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <div className="w-full overflow-x-auto pb-1 -mx-1 px-1">
          <TabsList className="inline-flex h-auto gap-1 flex-nowrap min-w-max bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="perfis" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Perfis RBAC
              <Badge className="ml-1.5 text-[9px] bg-blue-100 text-blue-700 px-1">{perfisAtivos}</Badge>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-3.5 h-3.5 mr-1" />
              Usuários
              {usuariosSemPerfil > 0 && (
                <Badge className="ml-1.5 text-[9px] bg-amber-100 text-amber-700 px-1">{usuariosSemPerfil} ⚠</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sod" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              SoD
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              Relatórios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="perfis" className="mt-3 w-full">
          <div className="w-full overflow-x-auto">
            <CentralPerfisAcesso />
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-3 w-full">
          <div className="w-full">
            <UsuariosTab />
          </div>
        </TabsContent>

        <TabsContent value="sod" className="mt-3 w-full">
          <div className="w-full overflow-x-auto">
            <SoDChecker />
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-3 w-full">
          <div className="w-full overflow-x-auto">
            <RelatorioPermissoes perfis={perfis} usuarios={usuarios} empresas={empresas} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}