import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Lock,
  Unlock,
  Truck,
  FileText,
  Package,
  DollarSign,
  AlertTriangle,
  Factory,
  Archive,
  Clock,
  XCircle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import usePermissions from '@/components/lib/usePermissions';
import { 
  gatilhoAprovacao, 
  gatilhoFaturamento, 
  gatilhoExpedicao,
  orquestrarProximaEtapa,
  executarCicloAutomatico,
  executarCicloCompletoIntegral,
  validarTransicao
} from './AutomacaoCicloPedido';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

/**
 * V21.7 - GERENCIADOR DE CICLO DE VIDA DO PEDIDO
 * 
 * FLUXO COMPLETO:
 * 1. Rascunho → 2. Aguardando Aprovação → 3. Aprovado (baixa estoque)
 * 4. Pronto para Faturar → 5. Faturado (gera financeiro)
 * 6. Em Expedição → 7. Em Trânsito → 8. Entregue
 * 
 * REGRAS:
 * - Apenas gerência pode reabrir pedidos fechados
 * - Baixa de estoque automática na aprovação
 * - Geração de financeiro no faturamento
 * - Criação de entrega/romaneio na expedição
 */

export default function GerenciadorCicloPedido({ 
  pedido, 
  onStatusChanged,
  showActions = true,
  compact = false 
}) {
  const { isAdmin, hasPermission } = usePermissions();
  const [processando, setProcessando] = useState(false);
  const [showReabrirDialog, setShowReabrirDialog] = useState(false);
  const [justificativaReabertura, setJustificativaReabertura] = useState('');
  const [proximaAcaoAutomatica, setProximaAcaoAutomatica] = useState(null);

  // 🤖 Carregar próxima ação automática
  React.useEffect(() => {
    orquestrarProximaEtapa(pedido.id).then(resultado => {
      if (resultado) {
        setProximaAcaoAutomatica(resultado);
      }
    });
  }, [pedido.id, pedido.status]);

  // Mapa de transições permitidas
  const transicoes = {
    'Rascunho': ['Aguardando Aprovação', 'Aprovado', 'Cancelado'],
    'Aguardando Aprovação': ['Aprovado', 'Cancelado'],
    'Aprovado': ['Pronto para Faturar', 'Cancelado'],
    'Pronto para Faturar': ['Faturado', 'Cancelado'],
    'Faturado': ['Em Expedição', 'Cancelado'],
    'Em Expedição': ['Em Trânsito', 'Cancelado'],
    'Em Trânsito': ['Entregue', 'Cancelado'],
    'Entregue': [],
    'Cancelado': []
  };

  const podeReabrir = isAdmin || hasPermission('comercial', 'reabrir_pedidos');

  // 🔥 FUNÇÃO PRINCIPAL: BAIXAR ESTOQUE
  const baixarEstoque = async (pedidoId) => {
    const pedidoAtual = await base44.entities.Pedido.filter({ id: pedidoId });
    const p = pedidoAtual[0];

    if (!p || !p.itens_revenda?.length) return;

    for (const item of p.itens_revenda) {
      if (!item.produto_id) continue;

      const produtos = await base44.entities.Produto.filter({
        id: item.produto_id,
        empresa_id: p.empresa_id
      });

      const produto = produtos[0];
      if (!produto) continue;

      const qtdNecessaria = item.quantidade || 0;
      const estoqueDisponivel = (produto.estoque_atual || 0) - (produto.estoque_reservado || 0);

      if (estoqueDisponivel < qtdNecessaria) {
        throw new Error(`❌ Estoque insuficiente: ${produto.descricao} (disponível: ${estoqueDisponivel}, necessário: ${qtdNecessaria})`);
      }

      const novoEstoque = (produto.estoque_atual || 0) - qtdNecessaria;

      await base44.entities.MovimentacaoEstoque.create({
        empresa_id: p.empresa_id,
        tipo_movimento: 'saida',
        origem_movimento: 'pedido',
        origem_documento_id: pedidoId,
        produto_id: item.produto_id,
        produto_descricao: item.descricao || item.produto_descricao,
        codigo_produto: item.codigo_sku,
        quantidade: qtdNecessaria,
        unidade_medida: item.unidade,
        estoque_anterior: produto.estoque_atual || 0,
        estoque_atual: novoEstoque,
        data_movimentacao: new Date().toISOString(),
        documento: p.numero_pedido,
        motivo: `Baixa automática - Aprovação do pedido ${p.numero_pedido}`,
        responsavel: 'Sistema Automático',
        aprovado: true
      });

      await base44.entities.Produto.update(item.produto_id, {
        estoque_atual: novoEstoque
      });
    }
  };

  // 🔥 FUNÇÃO: GERAR FINANCEIRO (CONTAS A RECEBER)
  const gerarFinanceiro = async (pedidoId) => {
    const pedidoAtual = await base44.entities.Pedido.filter({ id: pedidoId });
    const p = pedidoAtual[0];

    if (!p) return;

    const numParcelas = p.numero_parcelas || 1;
    const valorParcela = p.valor_total / numParcelas;
    const intervalo = p.intervalo_parcelas || 30;

    for (let i = 0; i < numParcelas; i++) {
      const dataVencimento = new Date(p.data_pedido);
      dataVencimento.setDate(dataVencimento.getDate() + (intervalo * i));

      await base44.entities.ContaReceber.create({
        empresa_id: p.empresa_id,
        origem_tipo: 'pedido',
        pedido_id: pedidoId,
        descricao: `Pedido ${p.numero_pedido} - Parcela ${i + 1}/${numParcelas}`,
        cliente: p.cliente_nome,
        cliente_id: p.cliente_id,
        numero_parcela: `${i + 1}/${numParcelas}`,
        valor: valorParcela,
        data_emissao: p.data_pedido,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status: 'Pendente',
        forma_cobranca: p.forma_pagamento === 'Boleto' ? 'Boleto' : 'Não Definida',
        numero_documento: `${p.numero_pedido}-${i + 1}`,
        visivel_no_portal: true
      });
    }
  };

  // 🔥 FUNÇÃO: CRIAR ENTREGA AUTOMÁTICA
  const criarEntrega = async (pedidoId) => {
    const pedidoAtual = await base44.entities.Pedido.filter({ id: pedidoId });
    const p = pedidoAtual[0];

    if (!p || p.tipo_frete === 'Retirada') return;

    await base44.entities.Entrega.create({
      empresa_id: p.empresa_id,
      pedido_id: pedidoId,
      numero_pedido: p.numero_pedido,
      cliente_id: p.cliente_id,
      cliente_nome: p.cliente_nome,
      endereco_entrega_completo: p.endereco_entrega_principal || {},
      contato_entrega: p.contatos_cliente?.[0] ? {
        nome: p.cliente_nome,
        telefone: p.contatos_cliente[0].valor
      } : {},
      data_previsao: p.data_prevista_entrega,
      tipo_frete: p.tipo_frete,
      valor_frete: p.valor_frete || 0,
      peso_total_kg: p.peso_total_kg || 0,
      valor_mercadoria: p.valor_total || 0,
      status: 'Aguardando Separação',
      prioridade: p.prioridade || 'Normal',
      rastreamento_habilitado: true
    });
  };

  // 🔥 FUNÇÃO PRINCIPAL: TRANSIÇÃO AUTOMÁTICA DE STATUS
  const executarTransicao = async (novoStatus) => {
    if (processando) return;
    setProcessando(true);

    try {
      const statusAtual = pedido.status;

      // ✅ VALIDAR ANTES DE TRANSICIONAR
      const validacao = await validarTransicao(pedido.id, novoStatus);
      if (!validacao.valido) {
        toast.error(`❌ ${validacao.motivo}`);
        setProcessando(false);
        return;
      }

      // 🤖 EXECUTAR GATILHOS AUTOMÁTICOS
      if (novoStatus === 'Aprovado') {
        const sucesso = await gatilhoAprovacao(pedido.id);
        if (!sucesso) {
          setProcessando(false);
          return;
        }
      } else if (novoStatus === 'Faturado') {
        const sucesso = await gatilhoFaturamento(pedido.id);
        if (!sucesso) {
          setProcessando(false);
          return;
        }
      } else {
        // Transição simples sem automações
        await base44.entities.Pedido.update(pedido.id, { status: novoStatus });
        
        await base44.entities.AuditLog.create({
          usuario_id: (await base44.auth.me()).id,
          usuario: (await base44.auth.me()).full_name,
          empresa_id: pedido.empresa_id,
          acao: 'Transição Manual',
          modulo: 'Comercial',
          entidade: 'Pedido',
          registro_id: pedido.id,
          descricao: `Status alterado: ${statusAtual} → ${novoStatus}`,
          data_hora: new Date().toISOString(),
          dados_anteriores: { status: statusAtual },
          dados_novos: { status: novoStatus },
          sucesso: true
        });

        toast.success(`✅ Pedido movido para: ${novoStatus}`);
      }

      if (onStatusChanged) onStatusChanged();
    } catch (error) {
      toast.error(error.message || '❌ Erro ao executar transição');
    } finally {
      setProcessando(false);
    }
  };

  // 🤖 EXECUTAR CICLO COMPLETO AUTOMÁTICO (PRÓXIMA ETAPA)
  const executarCicloCompleto = async () => {
    setProcessando(true);
    toast.info('🤖 Iniciando automação...');
    
    await executarCicloAutomatico(pedido.id);
    
    if (onStatusChanged) onStatusChanged();
    setProcessando(false);
  };

  // 🚀 MEGA AUTOMAÇÃO: EXECUTAR TUDO ATÉ O FIM
  const executarCicloIntegralCompleto = async () => {
    setProcessando(true);
    toast.info('🚀 Executando ciclo COMPLETO automático...');
    
    const resultado = await executarCicloCompletoIntegral(pedido.id);
    
    if (resultado.sucesso) {
      toast.success(`🎉 Ciclo completo! Etapas: ${resultado.etapasExecutadas.join(' → ')}`);
    } else {
      toast.error(`❌ ${resultado.erro}`);
    }
    
    if (onStatusChanged) onStatusChanged();
    setProcessando(false);
  };

  // 🔥 FUNÇÃO: REABRIR PEDIDO (APENAS GERÊNCIA)
  const reabrirPedido = async () => {
    if (!podeReabrir) {
      toast.error('❌ Apenas gerentes podem reabrir pedidos');
      return;
    }

    if (!justificativaReabertura.trim()) {
      toast.error('❌ Justificativa obrigatória');
      return;
    }

    setProcessando(true);
    try {
      await base44.entities.Pedido.update(pedido.id, {
        status: 'Rascunho'
      });

      await base44.entities.AuditLog.create({
        usuario_id: (await base44.auth.me()).id,
        usuario: (await base44.auth.me()).full_name,
        empresa_id: pedido.empresa_id,
        acao: 'Reabertura de Pedido',
        modulo: 'Comercial',
        entidade: 'Pedido',
        registro_id: pedido.id,
        descricao: `Pedido reaberto pela gerência. Justificativa: ${justificativaReabertura}`,
        data_hora: new Date().toISOString(),
        dados_anteriores: { status: pedido.status },
        dados_novos: { status: 'Rascunho', justificativa_reabertura: justificativaReabertura },
        sucesso: true
      });

      toast.success('✅ Pedido reaberto!');
      setShowReabrirDialog(false);
      setJustificativaReabertura('');
      if (onStatusChanged) onStatusChanged();
    } catch (error) {
      toast.error('❌ Erro ao reabrir pedido');
    } finally {
      setProcessando(false);
    }
  };

  const proximasTransicoes = transicoes[pedido.status] || [];
  const statusFechado = !['Rascunho', 'Aguardando Aprovação'].includes(pedido.status);

  // Ícones por status
  const statusIcons = {
    'Rascunho': <Clock className="w-4 h-4" />,
    'Aguardando Aprovação': <AlertTriangle className="w-4 h-4" />,
    'Aprovado': <CheckCircle2 className="w-4 h-4" />,
    'Pronto para Faturar': <Package className="w-4 h-4" />,
    'Faturado': <FileText className="w-4 h-4" />,
    'Em Expedição': <Archive className="w-4 h-4" />,
    'Em Trânsito': <Truck className="w-4 h-4" />,
    'Entregue': <CheckCircle2 className="w-4 h-4" />,
    'Cancelado': <XCircle className="w-4 h-4" />
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className={
          pedido.status === 'Entregue' ? 'bg-green-600' :
          pedido.status === 'Aprovado' ? 'bg-green-500' :
          pedido.status === 'Faturado' ? 'bg-blue-600' :
          pedido.status === 'Cancelado' ? 'bg-red-600' :
          'bg-slate-600'
        }>
          {statusIcons[pedido.status]}
          <span className="ml-2">{pedido.status}</span>
        </Badge>
        
        {statusFechado && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Lock className="w-3 h-3 mr-1" />
            Fechado
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Status Atual */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-3">
            {statusIcons[pedido.status]}
            <span>Status Atual: {pedido.status}</span>
            {statusFechado && (
              <Badge className="bg-yellow-500">
                <Lock className="w-3 h-3 mr-1" />
                Pedido Fechado
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Timeline Visual */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {['Rascunho', 'Aprovado', 'Faturado', 'Entregue'].map((status, idx) => {
              const statusAtingido = 
                status === 'Rascunho' ? true :
                status === 'Aprovado' ? ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status) :
                status === 'Faturado' ? ['Faturado', 'Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status) :
                status === 'Entregue' ? pedido.status === 'Entregue' :
                false;

              return (
                <div key={status} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    statusAtingido ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {statusAtingido ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <p className="text-xs mt-2 text-center font-medium">{status}</p>
                  {idx < 3 && (
                    <ChevronRight className="w-4 h-4 text-slate-400 absolute" style={{ left: `${(idx + 1) * 25}%` }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* 🤖 Próxima Ação Automática */}
          {proximaAcaoAutomatica && (
            <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 mb-4">
              <AlertDescription>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 mb-1">🤖 Automação Disponível:</p>
                    <p className="text-sm text-blue-800">{proximaAcaoAutomatica.proximaEtapa}</p>
                    
                    <div className="flex gap-2 mt-3">
                      {proximaAcaoAutomatica.acao && (
                        <Button
                          onClick={executarCicloCompleto}
                          disabled={processando}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          size="sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          ▶️ Próxima Etapa
                        </Button>
                      )}
                      
                      {pedido.status !== 'Entregue' && pedido.status !== 'Cancelado' && (
                        <Button
                          onClick={executarCicloIntegralCompleto}
                          disabled={processando}
                          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                          size="sm"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          🚀 CICLO COMPLETO (Tudo Automático)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Informações do Status */}
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Estoque Baixado:</p>
                <p className="font-bold">
                  {['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status) 
                    ? '✅ Sim (Automático)' : '⏳ Aguardando'}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Financeiro Gerado:</p>
                <p className="font-bold">
                  {['Faturado', 'Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status) 
                    ? '✅ Sim (Automático)' : '⏳ Aguardando'}
                </p>
              </div>
              <div>
                <p className="text-slate-600">NF-e Emitida:</p>
                <p className="font-bold">
                  {pedido.status === 'Faturado' || pedido.status === 'Em Expedição' || pedido.status === 'Em Trânsito' || pedido.status === 'Entregue'
                    ? '✅ Sim' : '⏳ Aguardando'}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Entrega Criada:</p>
                <p className="font-bold">
                  {['Em Expedição', 'Em Trânsito', 'Entregue'].includes(pedido.status) 
                    ? '✅ Sim (Automático)' : '⏳ Aguardando'}
                </p>
              </div>
            </div>
          </div>

          {/* Ações Disponíveis */}
          {showActions && proximasTransicoes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Ações de Transição:</p>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  🤖 Automático
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {proximasTransicoes.map((proxStatus) => {
                  const acaoConfig = {
                    'Aguardando Aprovação': { icon: Clock, color: 'bg-yellow-600 hover:bg-yellow-700', label: 'Enviar p/ Aprovação' },
                    'Aprovado': { icon: CheckCircle2, color: 'bg-green-600 hover:bg-green-700', label: '✅ Aprovar e Baixar Estoque' },
                    'Pronto para Faturar': { icon: Package, color: 'bg-blue-600 hover:bg-blue-700', label: '📦 Fechar p/ Faturamento' },
                    'Faturado': { icon: FileText, color: 'bg-indigo-600 hover:bg-indigo-700', label: '📄 Faturar e Gerar Financeiro' },
                    'Em Expedição': { icon: Archive, color: 'bg-purple-600 hover:bg-purple-700', label: '📦 Expedir e Criar Entrega' },
                    'Em Trânsito': { icon: Truck, color: 'bg-orange-600 hover:bg-orange-700', label: '🚚 Colocar em Trânsito' },
                    'Entregue': { icon: CheckCircle2, color: 'bg-green-700 hover:bg-green-800', label: '🎉 Marcar como Entregue' },
                    'Cancelado': { icon: XCircle, color: 'bg-red-600 hover:bg-red-700', label: '❌ Cancelar Pedido' }
                  }[proxStatus];

                  const Icon = acaoConfig?.icon || Clock;

                  return (
                    <Button
                      key={proxStatus}
                      onClick={() => executarTransicao(proxStatus)}
                      disabled={processando}
                      className={acaoConfig?.color || 'bg-slate-600'}
                    >
                      {processando ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 mr-2" />
                      )}
                      {acaoConfig?.label || proxStatus}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Opção de Reabertura (Gerência) */}
          {statusFechado && podeReabrir && pedido.status !== 'Cancelado' && (
            <div className="mt-6 pt-6 border-t">
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription>
                  <p className="font-semibold text-red-900 mb-2">⚠️ Zona de Risco - Acesso Gerencial</p>
                  <p className="text-sm text-red-700 mb-3">
                    Este pedido já está fechado. Reabrí-lo pode causar inconsistências no estoque e financeiro.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowReabrirDialog(true)}
                    disabled={processando}
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Reabrir Pedido (Gerência)
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!showActions && proximasTransicoes.length === 0 && pedido.status !== 'Cancelado' && (
            <Alert>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription>
                Pedido finalizado. Não há mais ações disponíveis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Reabertura */}
      <Dialog open={showReabrirDialog} onOpenChange={setShowReabrirDialog}>
        <DialogContent className="z-[99999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reabrir Pedido - Justificativa Obrigatória
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-sm text-red-900">
                ⚠️ <strong>ATENÇÃO:</strong> Reabrir este pedido irá movê-lo para Rascunho.
                Você precisará verificar manualmente o estoque e financeiro.
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Justificativa da Reabertura:
              </label>
              <Textarea
                value={justificativaReabertura}
                onChange={(e) => setJustificativaReabertura(e.target.value)}
                placeholder="Ex: Cliente solicitou alteração de endereço de entrega..."
                rows={4}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReabrirDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={reabrirPedido}
              disabled={processando || !justificativaReabertura.trim()}
            >
              {processando ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4 mr-2" />
              )}
              Confirmar Reabertura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}