
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
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Componentes das Etapas
import WizardEtapa1Cliente from './wizard/WizardEtapa1Cliente';
import ItensRevendaTab from './ItensRevendaTab';
import ArmadoPadraoTab from './ArmadoPadraoTab';
import CorteDobraIATab from './CorteDobraIATab';
import HistoricoClienteTab from './HistoricoClienteTab';
import LogisticaEntregaTab from './LogisticaEntregaTab';
import FechamentoFinanceiroTab from './FechamentoFinanceiroTab';
import ArquivosProjetosTab from './ArquivosProjetosTab';
import AuditoriaAprovacaoTab from './AuditoriaAprovacaoTab';

/**
 * V21.2 - CORREÇÃO CRÍTICA: clientes agora é passado corretamente para WizardEtapa1Cliente
 * Problema: ao editar pedido ou criar novo, a busca de clientes não funcionava
 * Solução: garantir que clientes={clientes} seja passado em todas as chamadas
 */
export default function PedidoFormCompleto({ pedido, clientes = [], onSubmit, onCancel }) {
  const [activeTab, setActiveTab] = useState('identificacao');
  const [formData, setFormData] = useState(() => ({
    tipo: 'Pedido',
    tipo_pedido: 'Misto',
    origem_pedido: 'Manual',
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
    etapas_entrega: [],
    obra_destino_id: '',
    obra_destino_nome: '',
    observacoes_nfe: '',
    ...(pedido || {})
  }));

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

  const handleSubmit = () => {
    if (!formData) return;
    
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

    onSubmit(formData);
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
      id: 'historico',
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

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - FIXO */}
      <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {pedido ? `Editar Pedido ${pedido.numero_pedido}` : 'Novo Pedido'}
            </h2>
            <p className="text-sm text-slate-600">
              V21.2 - Busca universal de clientes corrigida
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

        {/* 🔥 CORREÇÃO CRÍTICA: ÁREA DE CONTEÚDO COM SCROLL */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 400px)' }}>
          {/* ABA 1: IDENTIFICAÇÃO */}
          <TabsContent value="identificacao" className="m-0">
            <WizardEtapa1Cliente
              formData={formData}
              setFormData={setFormData}
              clientes={clientes}
              onNext={() => setActiveTab('revenda')}
            />
          </TabsContent>

          {/* ABA 2: ITENS DE REVENDA */}
          <TabsContent value="revenda" className="m-0">
            <ItensRevendaTab
              formData={formData}
              setFormData={setFormData}
              onNext={() => setActiveTab('armado')}
            />
          </TabsContent>

          {/* ABA 3: ARMADO PADRÃO */}
          <TabsContent value="armado" className="m-0">
            <ArmadoPadraoTab
              formData={formData}
              setFormData={setFormData}
              empresaId={formData?.empresa_id}
              onNext={() => setActiveTab('corte')}
            />
          </TabsContent>

          {/* ABA 4: CORTE E DOBRA (IA) */}
          <TabsContent value="corte" className="m-0">
            <CorteDobraIATab
              formData={formData}
              setFormData={setFormData}
              empresaId={formData?.empresa_id}
              onNext={() => setActiveTab('historico')}
            />
          </TabsContent>

          {/* NOVO V21.1: ABA 5 - HISTÓRICO DO CLIENTE */}
          <TabsContent value="historico" className="m-0">
            <HistoricoClienteTab
              formData={formData}
              setFormData={setFormData}
            />
          </TabsContent>

          {/* ABA 5: LOGÍSTICA */}
          <TabsContent value="logistica" className="m-0">
            <LogisticaEntregaTab
              formData={formData}
              setFormData={setFormData}
              clientes={clientes}
              onNext={() => setActiveTab('financeiro')}
            />
          </TabsContent>

          {/* ABA 6: FINANCEIRO */}
          <TabsContent value="financeiro" className="m-0">
            <FechamentoFinanceiroTab
              formData={formData}
              setFormData={setFormData}
              onNext={() => setActiveTab('arquivos')}
            />
          </TabsContent>

          {/* ABA 7: ARQUIVOS */}
          <TabsContent value="arquivos" className="m-0">
            <ArquivosProjetosTab
              formData={formData}
              setFormData={setFormData}
            />
          </TabsContent>

          {/* ABA 8: AUDITORIA */}
          <TabsContent value="auditoria" className="m-0">
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
            <Button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={!validacoes.identificacao || !validacoes.itens}
            >
              <Check className="w-4 h-4 mr-2" />
              {pedido ? 'Salvar Alterações' : 'Criar Pedido'}
            </Button>
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
}
