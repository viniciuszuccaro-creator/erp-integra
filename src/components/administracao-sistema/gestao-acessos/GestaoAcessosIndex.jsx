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
    <div className="w-full flex flex-col gap-0">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex flex-wrap gap-1 h-auto mb-1">
          <TabsTrigger value="perfis" className="text-xs sm:text-sm px-2 sm:px-4">Perfis RBAC</TabsTrigger>
          <TabsTrigger value="usuarios" className="text-xs sm:text-sm px-2 sm:px-4">Usuários</TabsTrigger>
          <TabsTrigger value="sod" className="text-xs sm:text-sm px-2 sm:px-4">SoD</TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs sm:text-sm px-2 sm:px-4">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="perfis" className="mt-3">
          <Card className="w-full min-w-0 overflow-hidden">
            <CardContent className="p-3 sm:p-4 w-full overflow-x-auto">
              <CentralPerfisAcesso />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-3">
          <Card className="w-full min-w-0 overflow-hidden">
            <CardContent className="p-3 sm:p-4 w-full overflow-x-auto">
              <GestaoUsuariosAvancada />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sod" className="mt-3">
          <Card className="w-full min-w-0 overflow-hidden">
            <CardContent className="p-3 sm:p-4">
              <SoDChecker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-3">
          <Card className="w-full min-w-0 overflow-hidden">
            <CardContent className="p-3 sm:p-4 w-full overflow-x-auto">
              <RelatorioPermissoes perfis={perfis} usuarios={usuarios} empresas={empresas} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}