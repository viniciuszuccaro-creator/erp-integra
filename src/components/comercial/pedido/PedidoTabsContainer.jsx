import React, { Suspense } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PedidoTabsNav from "./PedidoTabsNav";
import { toast } from "sonner";

// Lazy tabs (mantém padrão existente)
const WizardEtapa1Cliente = React.lazy(() => import('../wizard/WizardEtapa1Cliente'));
const ItensRevendaTab = React.lazy(() => import('../ItensRevendaTab'));
const ArmadoPadraoTab = React.lazy(() => import('../ArmadoPadraoTab'));
const CorteDobraIATab = React.lazy(() => import('../CorteDobraIATab'));
const HistoricoClienteTab = React.lazy(() => import('../HistoricoClienteTab'));
const LogisticaEntregaTab = React.lazy(() => import('../LogisticaEntregaTab'));
const FechamentoFinanceiroTab = React.lazy(() => import('../FechamentoFinanceiroTab'));
const ArquivosProjetosTab = React.lazy(() => import('../ArquivosProjetosTab'));
const AuditoriaAprovacaoTab = React.lazy(() => import('../AuditoriaAprovacaoTab'));

export default function PedidoTabsContainer({
  activeTab,
  setActiveTab,
  abas,
  formData,
  setFormData,
  clientes,
  bloquearEdicao,
  pedido,
}) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
      <PedidoTabsNav abas={abas} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área de conteúdo com altura fixa e scroll */}
      <div className="flex-1 overflow-hidden">
        {/* IDENTIFICAÇÃO */}
        <TabsContent value="identificacao" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <WizardEtapa1Cliente
              formData={formData}
              setFormData={setFormData}
              clientes={clientes}
              onNext={() => setActiveTab('revenda')}
              bloquearOrigemEdicao={bloquearEdicao}
            />
          </Suspense>
        </TabsContent>

        {/* ITENS DE REVENDA */}
        <TabsContent value="revenda" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <ItensRevendaTab
              formData={formData}
              setFormData={setFormData}
              onNext={() => setActiveTab('armado')}
            />
          </Suspense>
        </TabsContent>

        {/* ARMADO PADRÃO */}
        <TabsContent value="armado" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <ArmadoPadraoTab
              formData={formData}
              setFormData={setFormData}
              empresaId={formData?.empresa_id}
              onNext={() => setActiveTab('corte')}
            />
          </Suspense>
        </TabsContent>

        {/* CORTE E DOBRA (IA) */}
        <TabsContent value="corte" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <CorteDobraIATab
              formData={formData}
              setFormData={setFormData}
              empresaId={formData?.empresa_id}
              onNext={() => setActiveTab('historico')}
            />
          </Suspense>
        </TabsContent>

        {/* HISTÓRICO DO CLIENTE */}
        <TabsContent value="historico" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <HistoricoClienteTab
              formData={formData}
              setFormData={setFormData}
              onAdicionarItemAoPedido={(produto) => {
                toast.success(`Produto ${produto.descricao} adicionado!`);
                setActiveTab('revenda');
              }}
            />
          </Suspense>
        </TabsContent>

        {/* LOGÍSTICA */}
        <TabsContent value="logistica" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <LogisticaEntregaTab
              formData={formData}
              setFormData={setFormData}
              clientes={clientes}
              onNext={() => setActiveTab('financeiro')}
            />
          </Suspense>
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="financeiro" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <FechamentoFinanceiroTab
              formData={formData}
              setFormData={setFormData}
              onNext={() => setActiveTab('arquivos')}
            />
          </Suspense>
        </TabsContent>

        {/* ARQUIVOS */}
        <TabsContent value="arquivos" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <ArquivosProjetosTab
              formData={formData}
              setFormData={setFormData}
            />
          </Suspense>
        </TabsContent>

        {/* AUDITORIA */}
        <TabsContent value="auditoria" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <AuditoriaAprovacaoTab
              formData={formData}
              pedido={pedido}
            />
          </Suspense>
        </TabsContent>
      </div>
    </Tabs>
  );
}