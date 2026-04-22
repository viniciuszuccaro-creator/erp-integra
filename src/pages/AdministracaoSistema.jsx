import React, { Suspense, lazy } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import ModuleContent from "@/components/layout/ModuleContent";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ProtectedSection from "@/components/security/ProtectedSection";
import AdminHeader from "@/components/administracao-sistema/AdminHeader";
import AdminTabs from "@/components/administracao-sistema/AdminTabs";

const PortalCliente = lazy(() => import("./PortalCliente"));

export default function AdministracaoSistema() {
  const { isAdmin } = usePermissions();
  const { user } = useUser();
  const params = new URLSearchParams(window.location.search);
  const rawTab = params.get("tab") || "gerais";
  const tabMap = {
    gerais: 'gerais', parametros: 'gerais', 'parametros-gerais': 'gerais',
    integracoes: 'integracoes', connectors: 'integracoes',
    apps: 'integracoes', 'apps-externos': 'integracoes',
    acessos: 'acessos', usuarios: 'acessos', 'controle-acesso': 'acessos',
    seguranca: 'seguranca', governanca: 'seguranca',
    ia: 'ia', tecnologia: 'ia', 'tecnologia-ia-parametros': 'ia', apis: 'ia', webhooks: 'ia', 'chatbot-intents': 'ia',
    auditoria: 'auditoria', logs: 'auditoria'
  };
  const initialTab = tabMap[String(rawTab).toLowerCase()] || 'gerais';
  const { empresaAtual, grupoAtual } = useContextoVisual();

  // RBAC cliente-only: se não for admin, renderiza Portal do Cliente reutilizando a página existente
  if (!isAdmin()) {
    return (
      <div className="w-full h-full">
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600 w-full h-full">Carregando Portal…</div>}>
          <PortalCliente />
        </Suspense>
      </div>
    );
  }

  return (
    <ProtectedSection module="Sistema" action="visualizar">
      <ModuleLayout title="Administração do Sistema">
        <AdminHeader />
        <ModuleContent>
          <div className="p-4 md:p-6">
            <AdminTabs initialTab={initialTab} isAdmin={isAdmin} empresaAtual={empresaAtual} grupoAtual={grupoAtual} />
          </div>
        </ModuleContent>
      </ModuleLayout>
    </ProtectedSection>
  );
}