import React, { Suspense } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PedidoTabsNav from './PedidoTabsNav';
import ProtectedSection from '@/components/security/ProtectedSection';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Lazy-loaded tabs (keep same split as original)
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
  formData,
  setFormData,
  clientes,
  bloquearEdicao,
  validacoes,
  errors,
  pedido,
}) {
  const abas = [
    { id: 'identificacao', label: 'Identificação', icon: null, valido: validacoes?.identificacao },
    { id: 'revenda', label: 'Itens Revenda', icon: null, count: formData?.itens_revenda?.length || 0 },
    { id: 'armado', label: 'Armado Padrão', icon: null, count: formData?.itens_armado_padrao?.length || 0 },
    { id: 'corte', label: 'Corte e Dobra', icon: null, count: formData?.itens_corte_dobra?.length || 0 },
    { id: 'historico', label: 'Histórico', icon: null, novo: true },
    { id: 'logistica', label: 'Logística', icon: null, valido: validacoes?.logistica, count: formData?.etapas_entrega?.length || 0 },
    { id: 'financeiro', label: 'Financeiro', icon: null, valido: validacoes?.financeiro },
    { id: 'arquivos', label: 'Arquivos', icon: null, count: formData?.projetos_ia?.length || 0 },
    { id: 'auditoria', label: 'Auditoria', icon: null },
  ];

  const isLocked = (['Em Trânsito','Faturado'].includes(formData?.status)) && !formData?.__liberado_gerencia;

  const solicitarLiberacao = async () => {
    try {
      await base44.functions.invoke('solicitacoesAprovacao', { tipo: 'pedido_edicao_em_transito', entidade: 'Pedido', entidade_id: pedido?.id });
      toast.success('Solicitação enviada ao gerente');
    } catch (e) {
      toast.error('Falha ao solicitar liberação');
    }
  };

  const liberarEdicaoLocal = () => setFormData(prev => ({ ...prev, __liberado_gerencia: true }));

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
      <PedidoTabsNav abas={abas} activeTab={activeTab} setActiveTab={setActiveTab} />

      {isLocked && (
        <div className="mx-6 mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 flex items-center justify-between">
          <span>Edição bloqueada para pedidos em {formData?.status}.</span>
          <div className="flex gap-2">
            {formData?.status === 'Em Trânsito' && (
              <button className="px-3 py-1 rounded bg-amber-600 text-white" onClick={solicitarLiberacao}>Pedir liberação</button>
            )}
            <ProtectedSection module="Comercial" action="aprovar" hideInstead>
              <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={liberarEdicaoLocal}>Liberar Edição (Gerente)</button>
            </ProtectedSection>
          </div>
        </div>
      )}

      <div className={`flex-1 overflow-hidden ${isLocked ? 'pointer-events-none opacity-60' : ''}`}>
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

        <TabsContent value="revenda" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <ItensRevendaTab
              formData={formData}
              setFormData={setFormData}
              onNext={() => setActiveTab('armado')}
            />
          </Suspense>
        </TabsContent>

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

        <TabsContent value="financeiro" className="h-full overflow-y-auto p-6 m-0">
          <ProtectedSection module="Comercial" section={"Pedido.Financeiro"} action="visualizar" fallback={<div className="text-sm text-slate-500">Acesso restrito ao financeiro.</div>}>
            <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
              <FechamentoFinanceiroTab
                formData={formData}
                setFormData={setFormData}
                onNext={() => setActiveTab('arquivos')}
              />
            </Suspense>
          </ProtectedSection>
        </TabsContent>

        <TabsContent value="arquivos" className="h-full overflow-y-auto p-6 m-0">
          <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
            <ArquivosProjetosTab
              formData={formData}
              setFormData={setFormData}
            />
          </Suspense>
        </TabsContent>

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