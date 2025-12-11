import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

// Componentes das Etapas
import WizardEtapa1Cliente from './wizard/WizardEtapa1Cliente';
import ItensRevendaTab from './ItensRevendaTab';
import ArmadoPadraoTab from './ArmadoPadraoTab';
import CorteDobraIATab from './CorteDobraIATab';
import HistoricoClienteTab from './HistoricoClienteTab'; // NOVO V21.1
import LogisticaEntregaTab from './LogisticaEntregaTab';
import FechamentoFinanceiroTab from './FechamentoFinanceiroTab';
import ArquivosProjetosTab from './ArquivosProjetosTab';
import AuditoriaAprovacaoTab from './AuditoriaAprovacaoTab';

/**
 * V21.1.2-R1 - Pedido Form Completo - PATCH OFICIAL
 * ✅ Modal agora SEMPRE max-w-[90vw] max-h-[95vh]
 * ✅ Todas as abas com scroll funcionando
 * ✅ Aba Histórico expandida com Top 20 produtos + Auditoria
 * ✅ Suporte multi-instância (múltiplos modais abertos)
 * 
 * REGRA-MÃE: NUNCA APAGAR - APENAS ACRESCENTAR
 */
export default function PedidoFormCompleto({ pedido, clientes = [], onSubmit, onCancel, windowMode = false, contexto = 'erp', criacaoManual = true }) {
  const [activeTab, setActiveTab] = useState('identificacao');
  const [salvando, setSalvando] = useState(false); // V21.5: Anti-duplicação
  
  // V21.6 FINAL: Hook de detecção AUTOMÁTICA OBRIGATÓRIA
  const { origemPedido, bloquearEdicao } = useOrigemPedido();
  
  const [formData, setFormData] = useState(() => ({
    tipo: 'Pedido',
    tipo_pedido: 'Misto',
    origem_pedido: pedido?.origem_pedido || 'Manual', // Será preenchido pelo hook
    status: 'Rascunho',
    data_pedido: new Date().toISOString().split('T')[0],
    prioridade: 'Normal',
    itens_revenda: [],
    itens_armado_padrao: [],
    itens_corte_dobra: [],
    endereco_entrega_principal: {},
    forma_pagamento: 'À Vista',
    valor_total: 0,
    valor_produtos: 0,
    peso_total_kg: 0,
    percentual_conclusao_wizard: 0,
    etapa_atual_wizard: 1,
    cliente_id: '',
    cliente_nome: '',
    numero_pedido: '',
    empresa_id: '',
    projetos_ia: [],
    anexos: [],
    desconto_geral_pedido_percentual: 0,
    desconto_geral_pedido_valor: 0,
    valor_frete: 0,
    etapas_entrega: [], // V21.1
    obra_destino_id: '', // V21.1
    obra_destino_nome: '', // V21.1
    observacoes_nfe: '',
    ...(pedido || {})
  }));
  
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
          const dadosComAprovacao = {
            ...formData,
            status_aprovacao: 'pendente',
            margem_minima_produto: margemMinima,
            margem_aplicada_vendedor: margemAposDesconto,
            desconto_solicitado_percentual: formData.desconto_geral_pedido_percentual,
            status: 'Aguardando Aprovação'
          };
          await onSubmit(dadosComAprovacao);
          toast.info('⚠️ Pedido enviado para aprovação de desconto');
          return;
        }
      }

      await onSubmit(formData);
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
      <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {pedido ? `Editar Pedido ${pedido.numero_pedido}` : 'Novo Pedido'}
            </h2>
            <p className="text-sm text-slate-600">
              V21.1.2-R1 - 9 Abas • Multi-Instância • Histórico Expandido
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={
              formData.status === 'Aprovado' ? 'bg-green-600' :
              formData.status === 'Aguardando Aprovação' ? 'bg-orange-600' :
              'bg-slate-600'
            }>
              {formData.status}
            </Badge>
            {formData.prioridade === 'Urgente' && (
              <Badge className="bg-red-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Urgente
              </Badge>
            )}
            <Badge className={`${
              formData.origem_pedido === 'Manual' 
                ? 'bg-slate-600' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600'
            }`}>
              🎯 {formData.origem_pedido}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Progresso do Pedido</span>
            <span>{Math.round(formData.percentual_conclusao_wizard)}%</span>
          </div>
          <Progress value={formData.percentual_conclusao_wizard} className="h-2" />
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white/80 rounded-lg p-3 border">
            <p className="text-xs text-slate-600">Itens Revenda</p>
            <p className="text-lg font-bold text-blue-600">
              {formData.itens_revenda?.length || 0}
            </p>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border">
            <p className="text-xs text-slate-600">Armado Padrão</p>
            <p className="text-lg font-bold text-purple-600">
              {formData.itens_armado_padrao?.length || 0}
            </p>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border">
            <p className="text-xs text-slate-600">Corte e Dobra</p>
            <p className="text-lg font-bold text-orange-600">
              {formData.itens_corte_dobra?.length || 0}
            </p>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border">
            <p className="text-xs text-slate-600">Peso Total</p>
            <p className="text-lg font-bold text-green-600">
              {formData.peso_total_kg?.toFixed(2) || '0.00'} kg
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - FIXO */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="flex-shrink-0 bg-white border-b px-6 py-0 h-auto rounded-none flex-wrap justify-start">
          {abas.map((aba) => {
            const Icon = aba.icon;
            return (
              <TabsTrigger
                key={aba.id}
                value={aba.id}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white relative px-4 py-3"
              >
                <Icon className="w-4 h-4 mr-2" />
                {aba.label}
                {aba.novo && (
                  <Badge className="ml-2 bg-purple-600 text-xs">NOVO</Badge>
                )}
                {aba.valido && (
                  <Check className="w-4 h-4 ml-2 text-green-600" />
                )}
                {aba.count > 0 && (
                  <Badge className="ml-2 bg-orange-600 text-xs">
                    {aba.count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* 🔥 V21.1.2-R1: CORREÇÃO CRÍTICA - ÁREA DE CONTEÚDO COM ALTURA FIXA E SCROLL */}
        <div className="flex-1 overflow-hidden">
          {/* ABA 1: IDENTIFICAÇÃO */}
          <TabsContent value="identificacao" className="h-full overflow-y-auto p-6 m-0">
            <WizardEtapa1Cliente
              formData={formData}
              setFormData={setFormData}
              clientes={clientes}
              onNext={() => setActiveTab('revenda')}
              bloquearOrigemEdicao={bloquearEdicao}
            />
          </TabsContent>

          {/* ABA 2: ITENS DE REVENDA */}
          <TabsContent value="revenda" className="h-full overflow-y-auto p-6 m-0">
            <ItensRevendaTab
              formData={formData}
              setFormData={setFormData}
              onNext={() => setActiveTab('armado')}
            />
          </TabsContent>

          {/* ABA 3: ARMADO PADRÃO */}
          <TabsContent value="armado" className="h-full overflow-y-auto p-6 m-0">
            <ArmadoPadraoTab
              formData={formData}
              setFormData={setFormData}
              empresaId={formData?.empresa_id}
              onNext={() => setActiveTab('corte')}
            />
          </TabsContent>

          {/* ABA 4: CORTE E DOBRA (IA) */}
          <TabsContent value="corte" className="h-full overflow-y-auto p-6 m-0">
            <CorteDobraIATab
              formData={formData}
              setFormData={setFormData}
              empresaId={formData?.empresa_id}
              onNext={() => setActiveTab('historico')}
            />
          </TabsContent>

          {/* V21.1.2-R1: ABA 5 - HISTÓRICO DO CLIENTE (EXPANDIDA) */}
          <TabsContent value="historico" className="h-full overflow-y-auto p-6 m-0">
            <HistoricoClienteTab
              formData={formData}
              setFormData={setFormData}
              onAdicionarItemAoPedido={(produto) => {
                toast.success(`Produto ${produto.descricao} adicionado!`);
                // Optionally update formData here or let the HistoricoClienteTab do it
                setActiveTab('revenda');
              }}
            />
          </TabsContent>

          {/* ABA 6: LOGÍSTICA */}
          <TabsContent value="logistica" className="h-full overflow-y-auto p-6 m-0">
            <LogisticaEntregaTab
              formData={formData}
              setFormData={setFormData}
              clientes={clientes}
              onNext={() => setActiveTab('financeiro')}
            />
          </TabsContent>

          {/* ABA 7: FINANCEIRO */}
          <TabsContent value="financeiro" className="h-full overflow-y-auto p-6 m-0">
            <FechamentoFinanceiroTab
              formData={formData}
              setFormData={setFormData}
              onNext={() => setActiveTab('arquivos')}
            />
          </TabsContent>

          {/* ABA 8: ARQUIVOS */}
          <TabsContent value="arquivos" className="h-full overflow-y-auto p-6 m-0">
            <ArquivosProjetosTab
              formData={formData}
              setFormData={setFormData}
            />
          </TabsContent>

          {/* V21.1.2-R1: ABA 9 - AUDITORIA (ALTURA CORRIGIDA) */}
          <TabsContent value="auditoria" className="h-full overflow-y-auto p-6 m-0">
            <AuditoriaAprovacaoTab
              formData={formData}
              pedido={pedido}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer com Ações - FIXO */}
      <div className="flex-shrink-0 p-6 border-t bg-slate-50">
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
            
            {/* V21.5: APROVAR PEDIDO */}
            {(!pedido || pedido.status === 'Rascunho') && (
              <Button
                onClick={async () => {
                  if (salvando) return;
                  setSalvando(true);
                  try {
                    await onSubmit({
                      ...formData,
                      status: 'Aprovado'
                    });
                    toast.success('✅ Pedido aprovado e estoque baixado!');
                  } catch (error) {
                    toast.error('❌ Erro ao aprovar pedido');
                  } finally {
                    setSalvando(false);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 shadow-lg"
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {salvando ? 'Aprovando...' : 'Aprovar Pedido'}
              </Button>
            )}
            
            {/* V21.5: FECHAR PEDIDO E ENVIAR PARA ENTREGA */}
            {pedido && pedido.status === 'Aprovado' && (
              <Button
                onClick={async () => {
                  if (salvando) return;
                  setSalvando(true);
                  try {
                    await onSubmit({
                      ...formData,
                      status: 'Pronto para Faturar'
                    });
                    toast.success('✅ Pedido fechado e pronto para faturar!');
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
                onClick={handleSubmit}
                className="bg-slate-600 hover:bg-slate-700"
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                <Check className="w-4 h-4 mr-2" />
                {salvando ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            )}
            
            {!pedido && (
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={salvando || !validacoes.identificacao || !validacoes.itens}
              >
                <Check className="w-4 h-4 mr-2" />
                {salvando ? 'Salvando...' : 'Criar Pedido'}
              </Button>
            )}
          </div>
        </div>

        {/* Validações */}
        {(!validacoes.identificacao || !validacoes.itens) && (
          <Alert className="mt-4 border-orange-300 bg-orange-50">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <AlertDescription className="text-sm">
              {!validacoes.identificacao && <p>• Complete os dados de identificação e cliente</p>}
              {!validacoes.itens && <p>• Adicione pelo menos um item ao pedido</p>}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  if (windowMode) {
    return content;
  }

  return content;
}