import React from "react";
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

  if (!podeVer) {
    return (
      <div className="p-4 text-sm text-slate-500">Acesso restrito.</div>
    );
  }

  // Carregar dados para Relatório
  const { data: perfis = [] } = useQuery({ queryKey: ['perfis-acesso', empresaAtual?.id], queryFn: () => filterInContext('PerfilAcesso', {}, '-updated_date', 200) });
  const { data: usuarios = [] } = useQuery({ queryKey: ['usuarios'], queryFn: () => base44.entities.User.list() });
  const { data: empresas = [] } = useQuery({ queryKey: ['empresas', empresaAtual?.id], queryFn: () => filterInContext('Empresa', {}, '-updated_date', 200) });

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="perfis">Perfis</TabsTrigger>
          <TabsTrigger value="matriz">Matriz</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="sod">SoD</TabsTrigger>
        </TabsList>

        <TabsContent value="perfis" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <CentralPerfisAcesso />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matriz" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="text-center py-10 text-slate-500">
                <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>O componente `MatrizPermissoesVisual` precisa ser implementado ou alimentado com dados.</p>
                <p className="text-sm">Verifique a implementação interna ou a fonte de dados.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <RelatorioPermissoes perfis={perfis} usuarios={usuarios} empresas={empresas} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <GestaoUsuariosAvancada />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sod" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <SoDChecker />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}