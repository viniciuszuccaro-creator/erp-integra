import React, { Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FileText, Settings, Book, BarChart3, Upload, Sparkles } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import HeaderFiscalCompacto from "@/components/fiscal/fiscal-launchpad/HeaderFiscalCompacto";
import KPIsFiscal from "@/components/fiscal/fiscal-launchpad/KPIsFiscal";
import ModulosGridFiscal from "@/components/fiscal/fiscal-launchpad/ModulosGridFiscal";

const ConfigFiscalAutomatica = React.lazy(() => import("../components/fiscal/ConfigFiscalAutomatica"));
const PlanoDeContasTree = React.lazy(() => import("../components/fiscal/PlanoDeContasTree"));
const RelatorioDRE = React.lazy(() => import("../components/fiscal/RelatorioDRE"));
const MotorFiscalInteligente = React.lazy(() => import("@/components/fiscal/MotorFiscalInteligente"));
const ExportacaoSPED = React.lazy(() => import("../components/fiscal/ExportacaoSPED"));
const ImportarXMLNFe = React.lazy(() => import('../components/fiscal/ImportarXMLNFe'));

export default function FiscalPage() {
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();
  const { filtrarPorContexto, empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notasFiscais', empresaAtual?.id],
    queryFn: async () => {
      try {
        const filtro = empresaAtual?.id ? { empresa_faturamento_id: empresaAtual.id } : {};
        return await base44.entities.NotaFiscal.filter(filtro, '-created_date', 100);
      } catch (err) {
        console.error('Erro ao buscar notas fiscais:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2
  });

  // Dados já vêm filtrados do servidor
  const notasFiltradasContexto = notasFiscais;

  const statusCounts = {
    total: notasFiltradasContexto.length,
    autorizadas: notasFiltradasContexto.filter(n => n.status === "Autorizada").length,
    rascunho: notasFiltradasContexto.filter(n => n.status === "Rascunho").length,
    rejeitadas: notasFiltradasContexto.filter(n => n.status === "Rejeitada").length,
    canceladas: notasFiltradasContexto.filter(n => n.status === "Cancelada").length
  };

  if (loadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const modules = [
    {
      title: 'Notas Fiscais',
      description: 'NF-e emitidas',
      icon: FileText,
      color: 'blue',
      component: () => <div className="p-4">Listagem de NF-e (em desenvolvimento)</div>,
      windowTitle: '📄 Notas Fiscais',
      width: 1500,
      height: 850,
    },
    {
      title: 'Motor Fiscal IA',
      description: 'Validação inteligente',
      icon: Sparkles,
      color: 'purple',
      component: MotorFiscalInteligente,
      windowTitle: '🤖 Motor Fiscal IA',
      width: 1400,
      height: 800,
      props: { windowMode: true }
    },
    {
      title: 'Configuração',
      description: 'Config fiscal automática',
      icon: Settings,
      color: 'cyan',
      component: ConfigFiscalAutomatica,
      windowTitle: '⚙️ Configuração Fiscal',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'Plano de Contas',
      description: 'Estrutura contábil',
      icon: Book,
      color: 'indigo',
      component: PlanoDeContasTree,
      windowTitle: '📚 Plano de Contas',
      width: 1200,
      height: 800,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'DRE Gerencial',
      description: 'Demonstração resultado',
      icon: BarChart3,
      color: 'green',
      component: RelatorioDRE,
      windowTitle: '📊 DRE Gerencial',
      width: 1400,
      height: 800,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'SPED Fiscal',
      description: 'Exportação SPED',
      icon: FileText,
      color: 'orange',
      component: ExportacaoSPED,
      windowTitle: '📁 SPED Fiscal',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
    {
      title: 'Importar XML',
      description: 'Upload NF-e',
      icon: Upload,
      color: 'blue',
      component: ImportarXMLNFe,
      windowTitle: '📤 Importar XML NF-e',
      width: 1200,
      height: 700,
      props: { empresaId: empresaAtual?.id, windowMode: true }
    },
  ];

  const handleModuleClick = (module) => {
    React.startTransition(() => {
      openWindow(
        module.component,
        { 
          ...(module.props || {}),
          windowMode: true 
        },
        {
          title: module.windowTitle,
          width: module.width,
          height: module.height,
          uniqueKey: `fiscal-${module.title.toLowerCase().replace(/\s/g, '-')}`
        }
      );
    });
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full flex flex-col p-1.5 space-y-1.5 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <HeaderFiscalCompacto />
        
        <KPIsFiscal
          total={statusCounts.total}
          autorizadas={statusCounts.autorizadas}
          rascunho={statusCounts.rascunho}
          rejeitadas={statusCounts.rejeitadas}
          canceladas={statusCounts.canceladas}
        />

        <ModulosGridFiscal 
          modules={modules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </ErrorBoundary>
  );
}