import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ModuleTabs({ listagem, cadastro = null, relatorio = null, defaultValue = "listagem", className = "" }) {
  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
      <Tabs defaultValue={defaultValue} className="w-full h-full flex flex-col overflow-hidden">
        <TabsList className="shrink-0 w-full justify-start sticky top-0 z-10 bg-white/70 backdrop-blur-sm">
          <TabsTrigger value="listagem">Listagem</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
          <TabsTrigger value="relatorio">Relatório</TabsTrigger>
        </TabsList>
        <div className="flex-1 min-h-0 overflow-auto px-2 sm:px-3 py-2">
          <TabsContent value="listagem" className="m-0 h-full">
            {listagem}
          </TabsContent>
          <TabsContent value="cadastro" className="m-0 h-full">
            {cadastro || <div className="text-sm text-slate-500">Selecione um item na listagem ou use as ações do topo.</div>}
          </TabsContent>
          <TabsContent value="relatorio" className="m-0 h-full">
            {relatorio || <div className="text-sm text-slate-500">Relatórios deste módulo aparecerão aqui.</div>}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}