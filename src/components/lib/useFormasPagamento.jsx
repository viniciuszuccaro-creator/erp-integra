import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook centralizado para gerenciar formas de pagamento
 * Busca dados de FormaPagamento e Banco configurados em Cadastros Gerais
 * 
 * Usado em: PDV, Pedidos, Contas a Receber, Contas a Pagar, Portal, Site, Chatbot, etc.
 */
export function useFormasPagamento(filtros = {}) {
  // Buscar formas de pagamento ativas
  const { data: formasPagamento = [], isLoading: loadingFormas } = useQuery({
    queryKey: ['formas-pagamento', filtros],
    queryFn: async () => {
      const formas = await base44.entities.FormaPagamento.filter({
        ativa: true,
        ...filtros
      });
      return formas.sort((a, b) => (a.ordem_exibicao || 0) - (b.ordem_exibicao || 0));
    },
    staleTime: 300000, // 5 minutos
  });

  // Buscar bancos cadastrados
  const { data: bancos = [], isLoading: loadingBancos } = useQuery({
    queryKey: ['bancos'],
    queryFn: async () => {
      return await base44.entities.Banco.filter({ ativo: true });
    },
    staleTime: 300000,
  });

  // Filtrar formas disponíveis por contexto
  const obterFormasPorContexto = (contexto = 'pdv') => {
    if (contexto === 'pdv') {
      return formasPagamento.filter(f => f.disponivel_pdv);
    }
    if (contexto === 'ecommerce') {
      return formasPagamento.filter(f => f.disponivel_ecommerce);
    }
    return formasPagamento;
  };

  // Obter banco específico por tipo de pagamento
  const obterBancoPorTipo = (tipoFormaPagamento) => {
    if (tipoFormaPagamento === 'Boleto') {
      return bancos.find(b => b.suporta_cobranca_boleto);
    }
    if (tipoFormaPagamento === 'PIX') {
      return bancos.find(b => b.suporta_cobranca_pix);
    }
    return null;
  };

  // Obter configuração completa de uma forma de pagamento
  const obterConfiguracao = (formaPagamentoId) => {
    const forma = formasPagamento.find(f => f.id === formaPagamentoId);
    if (!forma) return null;

    const banco = obterBancoPorTipo(forma.tipo);
    
    return {
      ...forma,
      banco: banco,
      requer_integracao: forma.integracao_obrigatoria,
      permite_desconto: forma.aceita_desconto,
      desconto_padrao: forma.percentual_desconto_padrao || 0,
      acrescimo_padrao: forma.percentual_acrescimo_padrao || 0,
      prazo_dias: forma.prazo_compensacao_dias || 0,
      max_parcelas: forma.maximo_parcelas || 1,
      permite_parcelar: forma.permite_parcelamento
    };
  };

  // Obter forma de pagamento por descrição (compatibilidade)
  const obterFormaPorDescricao = (descricao) => {
    return formasPagamento.find(f => 
      f.descricao === descricao || f.tipo === descricao
    );
  };

  // Validar se forma está disponível e configurada
  const validarFormaPagamento = (formaPagamentoId) => {
    const config = obterConfiguracao(formaPagamentoId);
    if (!config) {
      return { valido: false, erro: 'Forma de pagamento não encontrada' };
    }
    if (!config.ativa) {
      return { valido: false, erro: 'Forma de pagamento inativa' };
    }
    if (config.requer_integracao && !config.banco) {
      return { valido: false, erro: 'Banco não configurado para esta forma de pagamento' };
    }
    return { valido: true };
  };

  // Aplicar descontos/acréscimos automáticos
  const calcularValorFinal = (valorBase, formaPagamentoId) => {
    const config = obterConfiguracao(formaPagamentoId);
    if (!config) return valorBase;

    let valorFinal = valorBase;
    
    if (config.aceita_desconto && config.percentual_desconto_padrao > 0) {
      valorFinal -= (valorBase * config.percentual_desconto_padrao / 100);
    }
    
    if (config.aplicar_acrescimo && config.percentual_acrescimo_padrao > 0) {
      valorFinal += (valorBase * config.percentual_acrescimo_padrao / 100);
    }
    
    return valorFinal;
  };

  return {
    formasPagamento,
    bancos,
    isLoading: loadingFormas || loadingBancos,
    obterFormasPorContexto,
    obterBancoPorTipo,
    obterConfiguracao,
    obterFormaPorDescricao,
    validarFormaPagamento,
    calcularValorFinal
  };
}

export default useFormasPagamento;