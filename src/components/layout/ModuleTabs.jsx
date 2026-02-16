import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";

export default function ModuleTabs({ listagem, cadastro = null, relatorio = null, defaultValue = "listagem", className = "", moduleName = null, cadastroSection = "Cadastro", relatorioSection = "Relatório" }) {
  const { hasPermission } = usePermissions();
  const canViewCadastro = moduleName ? hasPermission(moduleName, cadastroSection, 'visualizar') : true;
  const canViewRelatorio = moduleName ? hasPermission(moduleName, relatorioSection, 'visualizar') : true;
  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
      <Tabs defaultValue={defaultValue} className="w-full h-full flex flex-col overflow-hidden">
        <TabsList className="shrink-0 w-full justify-start sticky top-0 z-10 bg-white/70 backdrop-blur-sm">
          <TabsTrigger value="listagem">Listagem</TabsTrigger>
          {canViewCadastro && (<TabsTrigger value="cadastro">Cadastro</TabsTrigger>)}
          {canViewRelatorio && (<TabsTrigger value="relatorio">Relatório</TabsTrigger>)}
        </TabsList>
        <div className="flex-1 min-h-0 overflow-auto px-2 sm:px-3 py-2">
          <TabsContent value="listagem" className="m-0 h-full">
            {listagem}
          </TabsContent>
          <TabsContent value="cadastro" className="m-0 h-full">
            <ProtectedSection module={moduleName || 'Sistema'} section={cadastroSection} action="visualizar" hideInstead>
              {cadastro || <div className="text-sm text-slate-500">Selecione um item na listagem ou use as ações do topo.</div>}
            </ProtectedSection>
          </TabsContent>
          <TabsContent value="relatorio" className="m-0 h-full">
            <ProtectedSection module={moduleName || 'Sistema'} section={relatorioSection} action="visualizar" hideInstead>
              {relatorio || <div className="text-sm text-slate-500">Relatórios deste módulo aparecerão aqui.</div>}
            </ProtectedSection>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}