import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import FiltroEmpresaContexto from "@/components/FiltroEmpresaContexto";

// Sistema (já existentes no projeto)
import CentralPerfisAcesso from "@/components/sistema/CentralPerfisAcesso";
import MatrizPermissoesVisual from "@/components/sistema/MatrizPermissoesVisual";
import ValidadorAcessoCompleto from "@/components/sistema/ValidadorAcessoCompleto";
import StatusControleAcesso from "@/components/sistema/StatusControleAcesso";
import GlobalAuditLog from "@/components/sistema/GlobalAuditLog";
import IAGovernancaCompliance from "@/components/ia/IAGovernancaCompliance";

import { Shield, KeyRound, Users2, Activity, Brain } from "lucide-react";

export default function Acessos() {
  const [activeTab, setActiveTab] = useState("perfis");
  const { user } = useUser();
  const { hasPermission } = usePermissions();
  const { empresaAtual, estaNoGrupo } = useContextoVisual();

  // Auditoria automática de alterações em Perfis/Permissões (não altera funcionalidades; apenas registra)
  useEffect(() => {
    const unsub1 = base44.entities?.PerfilAcesso?.subscribe?.(async (evt) => {
      try {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Usuário",
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: evt.type === "create" ? "Criação" : evt.type === "update" ? "Edição" : "Exclusão",
          modulo: "Controle de Acesso",
          entidade: "PerfilAcesso",
          registro_id: evt.id,
          descricao: `PerfilAcesso ${evt.type} (${evt?.data?.nome_perfil || ""})`,
          dados_novos: evt?.data || null,
        });
      } catch {}
    });

    const unsub2 = base44.entities?.PermissaoEmpresaModulo?.subscribe?.(async (evt) => {
      try {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Usuário",
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
          acao: evt.type === "create" ? "Criação" : evt.type === "update" ? "Edição" : "Exclusão",
          modulo: "Controle de Acesso",
          entidade: "PermissaoEmpresaModulo",
          registro_id: evt.id,
          descricao: `Permissão ${evt.type} para módulo ${evt?.data?.modulo || ""}`,
          dados_novos: evt?.data || null,
        });
      } catch {}
    });

    return () => {
      if (typeof unsub1 === "function") unsub1();
      if (typeof unsub2 === "function") unsub2();
    };
  }, [user?.id, user?.email, user?.full_name, empresaAtual?.id, empresaAtual?.nome_fantasia, empresaAtual?.razao_social]);

  return (
    <div className="h-full w-full p-6 lg:p-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </span>
            Controle de Acesso Multiempresa
          </h1>
          <p className="text-slate-600 mt-1">
            {estaNoGrupo ? "Visão consolidada do grupo • Perfis • Matriz • Auditoria • IA de Governança" : "Gestão de acesso da empresa atual"}
          </p>
        </div>
        <div className="w-full md:w-auto">
          <FiltroEmpresaContexto />
        </div>
      </div>

      {/* Painel redimensionável (sidebar de status à esquerda, conteúdo à direita) */}
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-13rem)] min-h-[480px]">
        <ResizablePanel defaultSize={28} minSize={20} maxSize={40} className="h-full">
          <div className="h-full flex flex-col gap-4">
            <Card className="h-full border-0 shadow-md">
              <CardHeader className="border-b bg-slate-50">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Status do Controle de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full overflow-auto">
                <StatusControleAcesso empresaId={empresaAtual?.id || null} />
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={72} minSize={45} className="h-full">
          <Card className="h-full border-0 shadow-md">
            <CardHeader className="border-b bg-white/70 backdrop-blur">
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Central de Acessos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full overflow-hidden">
              <div className="h-full flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="px-4 pt-3">
                    <TabsList className="flex flex-wrap bg-white border shadow-sm">
                      <TabsTrigger value="perfis" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Users2 className="w-4 h-4 mr-2" /> Perfis
                      </TabsTrigger>
                      <TabsTrigger value="matriz" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                        <KeyRound className="w-4 h-4 mr-2" /> Matriz
                      </TabsTrigger>
                      <TabsTrigger value="validador" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                        <Shield className="w-4 h-4 mr-2" /> Validador
                      </TabsTrigger>
                      <TabsTrigger value="auditoria" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                        <Activity className="w-4 h-4 mr-2" /> Auditoria
                      </TabsTrigger>
                      <TabsTrigger value="ia" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                        <Brain className="w-4 h-4 mr-2" /> IA
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 min-h-0">
                    <TabsContent value="perfis" className="h-full">
                      <div className="h-full overflow-auto p-4">
                        <CentralPerfisAcesso empresaId={empresaAtual?.id || null} />
                      </div>
                    </TabsContent>

                    <TabsContent value="matriz" className="h-full">
                      <div className="h-full overflow-auto p-4">
                        <MatrizPermissoesVisual empresaId={empresaAtual?.id || null} />
                      </div>
                    </TabsContent>

                    <TabsContent value="validador" className="h-full">
                      <div className="h-full overflow-auto p-4">
                        <ValidadorAcessoCompleto empresaId={empresaAtual?.id || null} />
                      </div>
                    </TabsContent>

                    <TabsContent value="auditoria" className="h-full">
                      <div className="h-full overflow-auto p-4">
                        <GlobalAuditLog />
                      </div>
                    </TabsContent>

                    <TabsContent value="ia" className="h-full">
                      <div className="h-full overflow-auto p-4">
                        <IAGovernancaCompliance empresaId={empresaAtual?.id || null} />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}