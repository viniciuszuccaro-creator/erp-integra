import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import usePermissions from "@/components/lib/usePermissions";
import CentralPerfisAcesso from "@/components/sistema/CentralPerfisAcesso";
// import MatrizPermissoesVisual from "@/components/sistema/MatrizPermissoesVisual";
import RelatorioPermissoes from "@/components/sistema/RelatorioPermissoes";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { useQuery } from "@tanstack/react-query";
import GestaoUsuariosAvancada from "@/components/sistema/GestaoUsuariosAvancada";
import SoDChecker from "@/components/administracao-sistema/gestao-acessos/SoDChecker";
import { Shield } from "lucide-react";

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
        entidade: 'Controle de Acesso',
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
  };

  // Hooks SEMPRE antes de qualquer return condicional
  const { data: perfis = [] } = useQuery({ queryKey: ['perfis-acesso', empresaAtual?.id], queryFn: () => filterInContext('PerfilAcesso', {}, '-updated_date', 200), enabled: podeVer });
  const { data: usuarios = [] } = useQuery({ queryKey: ['usuarios'], queryFn: () => base44.entities.User.list(), enabled: podeVer });
  const { data: empresas = [] } = useQuery({ queryKey: ['empresas', empresaAtual?.id], queryFn: () => filterInContext('Empresa', {}, '-updated_date', 200), enabled: podeVer });

  if (!podeVer) {
    return (
      <div className="p-4 text-sm text-slate-500">Acesso restrito.</div>
    );
  }

  return (
    <div className="w-full min-w-0 flex flex-col gap-3">
      {/* Info RBAC — compacto e responsivo */}
      <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <Shield className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
        <span className="leading-relaxed">
          <strong>RBAC ativo</strong> — Perfis controlam acesso granular por módulo/seção/ação. Admins têm acesso total.
          Atribua perfis na aba <em>Usuários</em>.
        </span>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full min-w-0">
        {/* TabsList com scroll horizontal — nunca espreme em telas pequenas */}
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto gap-1 flex-nowrap min-w-max bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="perfis" className="text-xs px-2 sm:px-3 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              🔐 Perfis RBAC
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="text-xs px-2 sm:px-3 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              👤 Usuários
            </TabsTrigger>
            <TabsTrigger value="sod" className="text-xs px-2 sm:px-3 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              ⚖️ SoD
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs px-2 sm:px-3 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              📊 Relatórios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="perfis" className="mt-3 w-full min-w-0">
          <div className="w-full min-w-0 overflow-x-auto">
            <CentralPerfisAcesso />
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-3 w-full min-w-0">
          <div className="w-full min-w-0 overflow-x-auto">
            <GestaoUsuariosAvancada />
          </div>
        </TabsContent>

        <TabsContent value="sod" className="mt-3 w-full min-w-0">
          <SoDChecker />
        </TabsContent>

        <TabsContent value="relatorios" className="mt-3 w-full min-w-0">
          <div className="w-full min-w-0 overflow-x-auto">
            <RelatorioPermissoes perfis={perfis} usuarios={usuarios} empresas={empresas} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}