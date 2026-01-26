import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import usePermissions from "@/components/lib/usePermissions";
import CentralPerfisAcesso from "@/components/sistema/CentralPerfisAcesso";
import MatrizPermissoesVisual from "@/components/sistema/MatrizPermissoesVisual";
import RelatorioPermissoes from "@/components/sistema/RelatorioPermissoes";
import GestaoUsuariosAvancada from "@/components/sistema/GestaoUsuariosAvancada";

export default function GestaoAcessosIndex() {
  const { hasPermission, isAdmin } = usePermissions();
  const podeVer = isAdmin || hasPermission('Sistema', 'Controle de Acesso', 'ver');

  if (!podeVer) {
    return (
      <div className="p-4 text-sm text-slate-500">Acesso restrito.</div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="perfis" className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="perfis">Perfis</TabsTrigger>
          <TabsTrigger value="matriz">Matriz</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
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
              <MatrizPermissoesVisual />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <RelatorioPermissoes />
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
      </Tabs>
    </div>
  );
}