import React, { useState, useEffect, Suspense } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import PedidoHeader from './pedido/PedidoHeader';
import PedidoTabsNav from './pedido/PedidoTabsNav';
import PedidoValidationAlerts from './pedido/PedidoValidationAlerts';
import {
  User,
  Package,
  Factory,
  Scissors,
  Truck,
  DollarSign,
  FileText,
  Shield,
  Check,
  AlertTriangle,
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useOrigemPedido } from '@/components/lib/useOrigemPedido';
import ProtectedSection from '@/components/security/ProtectedSection';
import useContextoVisual from '@/components/lib/useContextoVisual';

// Validações avançadas movidas para ./pedido/pedidoSchema

// Componentes das Etapas
const WizardEtapa1Cliente = React.lazy(() => import('./wizard/WizardEtapa1Cliente'));
const ItensRevendaTab = React.lazy(() => import('./ItensRevendaTab'));
const ArmadoPadraoTab = React.lazy(() => import('./ArmadoPadraoTab'));
const CorteDobraIATab = React.lazy(() => import('./CorteDobraIATab'));
const HistoricoClienteTab = React.lazy(() => import('./HistoricoClienteTab')); // NOVO V21.1
const LogisticaEntregaTab = React.lazy(() => import('./LogisticaEntregaTab'));
const FechamentoFinanceiroTab = React.lazy(() => import('./FechamentoFinanceiroTab'));
const ArquivosProjetosTab = React.lazy(() => import('./ArquivosProjetosTab'));
const AuditoriaAprovacaoTab = React.lazy(() => import('./AuditoriaAprovacaoTab'));
import AutomacaoFluxoPedido from './AutomacaoFluxoPedido';
import PedidoFooterAcoes from './pedido/PedidoFooterAcoes.jsx';
import { pedidoCompletoSchema } from './pedido/pedidoSchema.js';
import { getDefaultPedidoValues } from './pedido/pedidoDefaults.js';

/**
 * V21.1.2-R1 - Pedido Form Completo - PATCH OFICIAL
 * ✅ Modal agora SEMPRE max-w-[90vw] max-h-[95vh]
 * ✅ Todas as abas com scroll funcionando
 * ✅ Aba Histórico expandida com Top 20 produtos + Auditoria
 * ✅ Suporte multi-instância (múltiplos modais abertos)
 * 
 * REGRA-MÃE: NUNCA APAGAR - APENAS ACRESCENTAR
 */
function PedidoFormCompleto({ pedido, clientes = [], onSubmit, onCancel, windowMode = false, contexto = 'erp', criacaoManual = true }) {
  const [activeTab, setActiveTab] = useState('identificacao');
  const [salvando, setSalvando] = useState(false); // V21.5: Anti-duplicação
  
  // V21.6 FINAL: Hook de detecção AUTOMÁTICA OBRIGATÓRIA
  const { origemPedido, bloquearEdicao } = useOrigemPedido();
  const { carimbarContexto } = useContextoVisual();
  
  const defaultValues = { ...getDefaultPedidoValues(pedido), ...(pedido || {}) };

  const [formData, setFormData] = useState(defaultValues);

  // RHF + Zod (Etapa 2)
  const { handleSubmit: rhfHandleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pedidoCompletoSchema),
    defaultValues
  });

  useEffect(() => { reset(formData); }, [formData, reset]);
  
  // V21.6 FINAL: SEMPRE aplicar origem detectada automaticamente
  useEffect(() => {
    if (origemPedido) {
      setFormData(prev => ({ ...prev, origem_pedido: origemPedido }));
      console.log('🎯 Origem automática aplicada:', origemPedido, '| Bloqueado:', bloquearEdicao);
    }
  }, [origemPedido, bloquearEdicao]);

  const [validacoes, setValidacoes] = useState({
    identificacao: false,
    itens: false,
    logistica: false,
    financeiro: false
  });

  // Calcular progresso
  useEffect(() => {
    const etapasCompletas = Object.values(validacoes).filter(Boolean).length;
    const progresso = (etapasCompletas / 4) * 100;
    setFormData(prev => ({ ...prev, percentual_conclusao_wizard: progresso }));
  }, [validacoes]);

  // Validar identificação - COM PROTEÇÃO
  useEffect(() => {
    if (!formData) return;
    
    const valido = !!(
      formData.cliente_id &&
      formData.cliente_nome &&
      formData.data_pedido &&
      formData.numero_pedido
    );
    setValidacoes(prev => ({ ...prev, identificacao: valido }));
  }, [formData?.cliente_id, formData?.cliente_nome, formData?.data_pedido, formData?.numero_pedido]);

  // Validar itens - COM PROTEÇÃO
  useEffect(() => {
    if (!formData) return;
    
    const temItens = (
      (formData.itens_revenda?.length > 0) ||
      (formData.itens_armado_padrao?.length > 0) ||
      (formData.itens_corte_dobra?.length > 0)
    );
    setValidacoes(prev => ({ ...prev, itens: temItens }));
  }, [formData?.itens_revenda?.length, formData?.itens_armado_padrao?.length, formData?.itens_corte_dobra?.length]);

  // Recalcular totais - COM PROTEÇÃO
  const recalcularTotais = () => {
    if (!formData) return;
    
    const valorRevenda = (formData.itens_revenda || []).reduce((sum, item) => 
      sum + (item.valor_item || 0), 0
    );
    const valorArmado = (formData.itens_armado_padrao || []).reduce((sum, item) => 
      sum + (item.preco_venda_total || 0), 0
    );
    const valorCorte = (formData.itens_corte_dobra || []).reduce((sum, item) => 
      sum + (item.preco_venda_total || 0), 0
    );

    const valorProdutos = valorRevenda + valorArmado + valorCorte;
    const valorDesconto = formData.desconto_geral_pedido_valor || 0;
    const valorFrete = formData.valor_frete || 0;
    const valorTotal = valorProdutos - valorDesconto + valorFrete;

    const pesoRevenda = (formData.itens_revenda || []).reduce((sum, item) => 
      sum + ((item.peso_unitario || 0) * (item.quantidade || 0)), 0
    );
    const pesoArmado = (formData.itens_armado_padrao || []).reduce((sum, item) => 
      sum + (item.peso_total_kg || 0), 0
    );
    const pesoCorte = (formData.itens_corte_dobra || []).reduce((sum, item) => 
      sum + (item.peso_total_kg || 0), 0
    );

    const pesoTotal = pesoRevenda + pesoArmado + pesoCorte;

    setFormData(prev => ({
      ...prev,
      valor_produtos: valorProdutos,
      valor_total: valorTotal,
      peso_total_kg: pesoTotal
    }));
  };

  useEffect(() => {
    recalcularTotais();
  }, [
    formData?.itens_revenda,
    formData?.itens_armado_padrao,
    formData?.itens_corte_dobra,
    formData?.desconto_geral_pedido_valor,
    formData?.valor_frete
  ]);

  const handleSubmit = async () => {
    if (!formData || salvando) return;
    
    if (!validacoes.identificacao) {
      toast.error('❌ Complete os dados de identificação');
      setActiveTab('identificacao');
      return;
    }

    if (!validacoes.itens) {
      toast.error('❌ Adicione pelo menos um item ao pedido');
      setActiveTab('revenda');
      return;
    }

    // Validação avançada (Etapa 2) + carimbo multiempresa
    const stamped = carimbarContexto(formData, 'empresa_id');
    const parsed = pedidoCompletoSchema.safeParse(stamped);
    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
      toast.error('❌ Erros de validação', { description: msg });
      return;
    }
    const empresaId = parsed.data.empresa_id || formData.empresa_id;

    setSalvando(true);

    try {
      // V21.5: BAIXAR ESTOQUE SE STATUS FOR APROVADO
      if (formData.status === 'Aprovado' && formData.itens_revenda?.length > 0) {
        for (const item of formData.itens_revenda) {
          if (item.produto_id) {
            const produtos = await base44.entities.Produto.filter({ 
              id: item.produto_id,
              empresa_id: formData.empresa_id 
            });
            
            const produto = produtos[0];
            if (produto && (produto.estoque_atual || 0) >= (item.quantidade || 0)) {
              const novoEstoque = (produto.estoque_atual || 0) - (item.quantidade || 0);
              
              await base44.entities.MovimentacaoEstoque.create({
                empresa_id: formData.empresa_id,
                tipo_movimento: "saida",
                origem_movimento: "pedido",
                origem_documento_id: formData.id || `temp_${Date.now()}`,
                produto_id: item.produto_id,
                produto_descricao: item.descricao || item.produto_descricao,
                codigo_produto: item.codigo_sku,
                quantidade: item.quantidade,
                unidade_medida: item.unidade,
                estoque_anterior: produto.estoque_atual || 0,
                estoque_atual: novoEstoque,
                data_movimentacao: new Date().toISOString(),
                documento: formData.numero_pedido,
                motivo: `Baixa automática - Pedido ${formData.id ? 'atualizado' : 'criado'} aprovado`,
                responsavel: "Sistema Automático",
                aprovado: true
              });
              
              await base44.entities.Produto.update(item.produto_id, {
                estoque_atual: novoEstoque
              });
            }
          }
        }
        toast.success('✅ Pedido salvo e estoque baixado!');
      }
      
      // ETAPA 4: Validar aprovação de desconto
      if (formData.desconto_geral_pedido_percentual > 0) {
        const custoTotal = formData.valor_produtos * 0.7;
        const valorComDesconto = formData.valor_produtos * (1 - formData.desconto_geral_pedido_percentual / 100);
        const margemAposDesconto = ((valorComDesconto - custoTotal) / custoTotal) * 100;
        const margemMinima = 10;

        if (margemAposDesconto < margemMinima && formData.status !== 'Aprovado') {
          // Cria solicitação de aprovação de desconto (backend)
          try {
            const { data: solicitacao } = await base44.functions.invoke('solicitacoesAprovacao', {
              action: 'create',
              group_id: formData.group_id || null,
              empresa_id: formData.empresa_id || null,
              tipo_solicitacao: 'desconto_pedido',
              entidade_alvo: 'Pedido',
              entidade_alvo_id: formData.id || `temp_${Date.now()}`,
              dados_propostos: {
                desconto_geral_pedido_percentual: formData.desconto_geral_pedido_percentual,
                desconto_geral_pedido_valor: formData.desconto_geral_pedido_valor || 0,
                margem_aplicada_vendedor: margemAposDesconto,
                margem_minima_produto: margemMinima
              },
              justificativa: formData.justificativa_desconto || 'Ajuste comercial abaixo da margem mínima'
            });
            toast.info('⚠️ Solicitação de aprovação enviada', { description: `#${solicitacao?.id || ''}` });
          } catch (e) {
            toast.error('Não foi possível abrir a solicitação de aprovação');
          }

          // Mantém o pedido aguardando aprovação e salva rascunho
          await onSubmit(carimbarContexto({
            ...formData,
            status_aprovacao: 'pendente',
            margem_minima_produto: margemMinima,
            margem_aplicada_vendedor: margemAposDesconto,
            desconto_solicitado_percentual: formData.desconto_geral_pedido_percentual,
            status: 'Aguardando Aprovação'
          }, 'empresa_id'));
          return;
        }
      }

      await onSubmit(carimbarContexto(formData, 'empresa_id'));
    } finally {
      setSalvando(false);
    }
  };


  const abas = [
    { 
      id: 'identificacao', 
      label: 'Identificação', 
      icon: User, 
      valido: validacoes.identificacao 
    },
    { 
      id: 'revenda', 
      label: 'Itens Revenda', 
      icon: Package, 
      count: formData?.itens_revenda?.length || 0 
    },
    { 
      id: 'armado', 
      label: 'Armado Padrão', 
      icon: Factory, 
      count: formData?.itens_armado_padrao?.length || 0 
    },
    { 
      id: 'corte', 
      label: 'Corte e Dobra', 
      icon: Scissors, 
      count: formData?.itens_corte_dobra?.length || 0 
    },
    { 
      id: 'historico', // NOVO V21.1
      label: 'Histórico', 
      icon: Clock,
      novo: true
    },
    { 
      id: 'logistica', 
      label: 'Logística', 
      icon: Truck, 
      valido: validacoes.logistica,
      count: formData?.etapas_entrega?.length || 0
    },
    { 
      id: 'financeiro', 
      label: 'Financeiro', 
      icon: DollarSign, 
      valido: validacoes.financeiro 
    },
    { 
      id: 'arquivos', 
      label: 'Arquivos', 
      icon: FileText, 
      count: formData?.projetos_ia?.length || 0 
    },
    { 
      id: 'auditoria', 
      label: 'Auditoria', 
      icon: Shield 
    }
  ];

  // Proteção adicional: não renderizar até formData estar pronto
  if (!formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const content = (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header - FIXO */}
      <PedidoHeader formData={formData} pedido={pedido} />

      {/* Tabs - FIXO */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <PedidoTabsNav abas={abas} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 🔥 V21.1.2-R1: CORREÇÃO CRÍTICA - ÁREA DE CONTEÚDO COM ALTURA FIXA E SCROLL */}
        <div className="flex-1 overflow-hidden">
          {/* ABA 1: IDENTIFICAÇÃO */}
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

          {/* ABA 2: ITENS DE REVENDA */}
          <TabsContent value="revenda" className="h-full overflow-y-auto p-6 m-0">
            <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
              <ItensRevendaTab
                formData={formData}
                setFormData={setFormData}
                onNext={() => setActiveTab('armado')}
              />
            </Suspense>
          </TabsContent>

          {/* ABA 3: ARMADO PADRÃO */}
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

          {/* ABA 4: CORTE E DOBRA (IA) */}
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

          {/* V21.1.2-R1: ABA 5 - HISTÓRICO DO CLIENTE (EXPANDIDA) */}
          <TabsContent value="historico" className="h-full overflow-y-auto p-6 m-0">
            <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
              <HistoricoClienteTab
                formData={formData}
                setFormData={setFormData}
                onAdicionarItemAoPedido={(produto) => {
                  toast.success(`Produto ${produto.descricao} adicionado!`);
                  // Optionally update formData here or let the HistoricoClienteTab do it
                  setActiveTab('revenda');
                }}
              />
            </Suspense>
          </TabsContent>

          {/* ABA 6: LOGÍSTICA */}
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

          {/* ABA 7: FINANCEIRO (protegida) */}
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

          {/* ABA 8: ARQUIVOS */}
          <TabsContent value="arquivos" className="h-full overflow-y-auto p-6 m-0">
            <Suspense fallback={<div className='h-40 rounded-md bg-slate-100 animate-pulse' />}>
              <ArquivosProjetosTab
                formData={formData}
                setFormData={setFormData}
              />
            </Suspense>
          </TabsContent>

          {/* V21.1.2-R1: ABA 9 - AUDITORIA (ALTURA CORRIGIDA) */}
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

      {/* Footer com Ações - FIXO */}
      <PedidoFooterAcoes
         valorTotal={formData?.valor_total || 0}
         pesoTotalKg={formData?.peso_total_kg || 0}
         etapasCount={formData?.etapas_entrega?.length || 0}
         salvando={salvando}
         canSalvarRascunho={validacoes.identificacao && validacoes.itens}
         canFecharCompleto={validacoes.identificacao && validacoes.itens}
         canFecharEnviarEntrega={validacoes.identificacao && validacoes.itens}
         canSalvarAlteracoes={validacoes.identificacao && validacoes.itens}
         canCriarPedido={validacoes.identificacao && validacoes.itens}
         onCancelar={onCancel}
         onSalvarRascunho={async () => {
           if (salvando) return;
           setSalvando(true);
           try {
             const stamped = carimbarContexto({ ...formData, status: 'Rascunho' }, 'empresa_id');
             const parsed = pedidoCompletoSchema.safeParse(stamped);
             if (!parsed.success) {
               const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
               toast.error('❌ Erros de validação', { description: msg });
               return;
             }
             await onSubmit(parsed.data);
             toast.success('✅ Rascunho salvo!');
             onCancel();
           } finally { setSalvando(false); }
         }}
         onFecharCompleto={async () => {
           if (salvando) return;
           setSalvando(true);
           try {
             const stamped = carimbarContexto({ ...formData, status: 'Aprovado' }, 'empresa_id');
             const parsed = pedidoCompletoSchema.safeParse(stamped);
             if (!parsed.success) {
               const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
               toast.error('❌ Erros de validação', { description: msg });
               setSalvando(false);
               return;
             }
             const pedidoSalvo = await onSubmit(parsed.data);
             setSalvando(false);
             onCancel();
             setTimeout(() => {
               if (window.__currentOpenWindow) {
                 window.__currentOpenWindow(
                   AutomacaoFluxoPedido,
                   { pedido: pedidoSalvo || { ...formData, id: formData.id, status: 'Aprovado' }, windowMode: true },
                   { title: `🚀 Automação - Pedido ${formData.numero_pedido}`, width: 1200, height: 700 }
                 );
               }
             }, 150);
           } catch { setSalvando(false); toast.error('❌ Erro ao salvar pedido'); }
         }}
         onFecharEnviarEntrega={async () => {
           if (salvando) return;
           setSalvando(true);
           try {
             const stamped = carimbarContexto({ ...formData, status: 'Pronto para Faturar' }, 'empresa_id');
             const parsed = pedidoCompletoSchema.safeParse(stamped);
             if (!parsed.success) {
               const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
               toast.error('❌ Erros de validação', { description: msg });
             } else {
               await onSubmit(parsed.data);
               toast.success('✅ Pedido fechado e pronto para faturar!');
             }
           } finally { setSalvando(false); }
         }}
         onSalvarAlteracoes={async () => {
           if (salvando) return;
           setSalvando(true);
           try { await onSubmit(carimbarContexto(formData, 'empresa_id')); toast.success('✅ Alterações salvas!'); onCancel(); }
           finally { setSalvando(false); }
         }}
         onCriarPedido={rhfHandleSubmit(handleSubmit)}
       />

      {/* Legacy footer removed and replaced by component */}
      <div className="hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {(formData?.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-sm">
              <p className="text-slate-600">Peso Total</p>
              <p className="text-xl font-bold text-blue-600">
                {(formData?.peso_total_kg || 0).toFixed(2)} kg
              </p>
            </div>
            {/* NOVO V21.1: Etapas */}
            {formData?.etapas_entrega?.length > 0 && (
              <div className="text-sm">
                <p className="text-slate-600">Etapas de Faturamento</p>
                <p className="text-xl font-bold text-purple-600">
                  {formData.etapas_entrega.length}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            
            {/* V21.6: SALVAR COMO RASCUNHO */}
            {(!pedido || pedido.status === 'Rascunho') && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (salvando) return;
                  setSalvando(true);
                  try {
                    const stamped = carimbarContexto({ ...formData, status: 'Rascunho' }, 'empresa_id');
                    const parsed = pedidoCompletoSchema.safeParse(stamped);
                    if (!parsed.success) {
                      const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
                      toast.error('❌ Erros de validação', { description: msg });
                      return;
                    }
                    await onSubmit(parsed.data);
                    toast.success('✅ Rascunho salvo!');
                    onCancel();
                  } catch (error) {
                    toast.error('❌ Erro ao salvar');
                  } finally {
                    setSalvando(false);
                  }
                }}
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                {salvando ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
            )}

            {/* V21.6: FECHAR PEDIDO COM AUTOMAÇÃO COMPLETA */}
            {(!pedido || pedido.status === 'Rascunho') && (
              <Button
                onClick={async () => {
                  if (salvando) return;

                  setSalvando(true);
                  try {
                    // 1. Validar e salvar pedido como Aprovado
                    const stamped = carimbarContexto({ ...formData, status: 'Aprovado' }, 'empresa_id');
                    const parsed = pedidoCompletoSchema.safeParse(stamped);
                    if (!parsed.success) {
                      const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
                      toast.error('❌ Erros de validação', { description: msg });
                      setSalvando(false);
                      return;
                    }
                    const pedidoSalvo = await onSubmit(parsed.data);

                    setSalvando(false);

                    // 2. Fechar modal atual
                    onCancel();

                    // 3. Aguardar modal fechar e abrir automação
                    setTimeout(() => {
                      if (window.__currentOpenWindow) {
                        window.__currentOpenWindow(
                          AutomacaoFluxoPedido,
                          { 
                            pedido: pedidoSalvo || { ...formData, id: formData.id, status: 'Aprovado' },
                            windowMode: true,
                            onComplete: () => {
                              toast.success('✅ Pedido fechado com sucesso!');
                            }
                          },
                          {
                            title: `🚀 Automação - Pedido ${formData.numero_pedido}`,
                            width: 1200,
                            height: 700
                          }
                        );
                      }
                    }, 150);
                  } catch (error) {
                    setSalvando(false);
                    toast.error('❌ Erro ao salvar pedido');
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg"
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {salvando ? 'Salvando...' : '🚀 Fechar Pedido Completo'}
              </Button>
            )}
            
            {/* V21.5: FECHAR PEDIDO E ENVIAR PARA ENTREGA */}
            {pedido && pedido.status === 'Aprovado' && (
              <Button
                onClick={async () => {
                  if (salvando) return;
                  setSalvando(true);
                  try {
                    const stamped = carimbarContexto({ ...formData, status: 'Pronto para Faturar' }, 'empresa_id');
                    const parsed = pedidoCompletoSchema.safeParse(stamped);
                    if (!parsed.success) {
                      const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
                      toast.error('❌ Erros de validação', { description: msg });
                    } else {
                      await onSubmit(parsed.data);
                      toast.success('✅ Pedido fechado e pronto para faturar!');
                    }
                  } catch (error) {
                    toast.error('❌ Erro ao fechar pedido');
                  } finally {
                    setSalvando(false);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                <Truck className="w-4 h-4 mr-2" />
                {salvando ? 'Fechando...' : 'Fechar e Enviar para Entrega'}
              </Button>
            )}
            
            {(pedido && pedido.status !== 'Rascunho' && pedido.status !== 'Aprovado') && (
              <Button
                onClick={async () => {
                  if (salvando) return;
                  setSalvando(true);
                  try {
                    await onSubmit(carimbarContexto(formData, 'empresa_id'));
                    toast.success('✅ Alterações salvas!');
                    onCancel();
                  } catch (error) {
                    toast.error('❌ Erro ao salvar');
                  } finally {
                    setSalvando(false);
                  }
                }}
                className="bg-slate-600 hover:bg-slate-700"
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                <Check className="w-4 h-4 mr-2" />
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            )}
            
            {!pedido && (
              <Button
                onClick={rhfHandleSubmit(handleSubmit)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                <Check className="w-4 h-4 mr-2" />
                {salvando ? 'Salvando...' : 'Criar Pedido'}
              </Button>
            )}
          </div>
        </div>

        <PedidoValidationAlerts errors={errors} validacoes={validacoes} />
      </div>
    </div>
  );

  if (windowMode) {
    return content;
  }

  return content;
}
export default React.memo(PedidoFormCompleto);