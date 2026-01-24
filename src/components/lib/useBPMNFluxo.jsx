import { base44 } from '@/api/base44Client';

/**
 * HOOK BPMN FLUXO - Orquestração centralizada de transições
 * ETAPA 2: Reutilizável em qualquer fluxo
 */

export function useBPMNFluxo() {
  const executarTransicao = async (transicao, entityType, entityId, data = {}) => {
    try {
      const response = await base44.functions.invoke('fluxoComercialBPMN', {
        action: transicao,
        entityType,
        entityId,
        data
      });

      if (response.data?.success === false) {
        throw new Error(response.data?.error || 'Erro na transição');
      }

      return response.data?.resultado;
    } catch (err) {
      console.error(`Erro na transição ${transicao}:`, err);
      throw err;
    }
  };

  // Transições específicas do fluxo comercial
  const converterOrcamento = (oportunidadeId) =>
    executarTransicao('converter_orcamento', 'Oportunidade', oportunidadeId);

  const converterPedido = (orcamentoId) =>
    executarTransicao('converter_pedido', 'OrcamentoCliente', orcamentoId);

  const aprovarPedido = (pedidoId) =>
    executarTransicao('aprovar_pedido', 'Pedido', pedidoId);

  const gerarNF = (pedidoId) =>
    base44.functions.invoke('gerarNotaFiscalAutomatica', { pedidoId });

  const calcularComissao = (pedidoId) =>
    base44.functions.invoke('calcularComissaoAutomatica', { pedidoId, triggerEvent: 'faturamento' });

  return {
    executarTransicao,
    converterOrcamento,
    converterPedido,
    aprovarPedido,
    gerarNF,
    calcularComissao
  };
}

export default useBPMNFluxo;