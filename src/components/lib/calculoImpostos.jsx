/**
 * Motor de Cálculo de Impostos
 * ICMS, PIS, COFINS, IPI, DIFAL
 */

import { base44 } from "@/api/base44Client";

/**
 * Alíquotas padrão por regime tributário
 */
const ALIQUOTAS_PADRAO = {
  'Simples Nacional': {
    icms: 0, // Incluído no DAS
    pis: 0,
    cofins: 0,
    ipi: 0,
    aliquota_simples_anexo_1: 4.0, // Comércio
    aliquota_simples_anexo_2: 4.5, // Indústria
  },
  'Lucro Presumido': {
    icms: 18.0,
    pis: 0.65,
    cofins: 3.0,
    ipi: 0,
  },
  'Lucro Real': {
    icms: 18.0,
    pis: 1.65,
    cofins: 7.6,
    ipi: 0,
  },
  'MEI': {
    icms: 0,
    pis: 0,
    cofins: 0,
    ipi: 0,
  }
};

/**
 * Alíquotas de ICMS por estado (operações interestaduais)
 */
const ICMS_INTERESTADUAL = {
  'AC': 7, 'AL': 7, 'AM': 7, 'AP': 7, 'BA': 7, 'CE': 7,
  'DF': 7, 'ES': 7, 'GO': 7, 'MA': 7, 'MG': 7, 'MS': 7,
  'MT': 7, 'PA': 7, 'PB': 7, 'PE': 7, 'PI': 7, 'PR': 7,
  'RJ': 12, 'RN': 7, 'RO': 7, 'RR': 7, 'RS': 12, 'SC': 12,
  'SE': 7, 'SP': 12, 'TO': 7
};

/**
 * Tabela NCM Simplificada com IPI
 * (Em produção, usar tabela completa da Receita Federal)
 */
const TABELA_NCM_IPI = {
  // Ferro e Aço
  '72': { descricao: 'Ferro fundido, ferro e aço', ipi: 5 },
  '7308': { descricao: 'Construções e suas partes, de ferro ou aço', ipi: 5 },
  '7310': { descricao: 'Reservatórios, barris, tambores', ipi: 5 },
  '7326': { descricao: 'Outras obras de ferro ou aço', ipi: 5 },
  
  // Produtos Siderúrgicos
  '7213': { descricao: 'Fio-máquina de ferro ou aços', ipi: 0 },
  '7214': { descricao: 'Barras de ferro ou aço', ipi: 0 },
  '7228': { descricao: 'Barras e perfis de aços-liga', ipi: 0 },
  
  // Estruturas Metálicas
  '9406': { descricao: 'Construções pré-fabricadas', ipi: 10 },
  
  // Padrão
  'default': { descricao: 'Produto genérico', ipi: 0 }
};

/**
 * Calcula impostos de um item
 * @param {object} params - Parâmetros do cálculo
 * @returns {object} - Impostos calculados
 */
export async function calcularImpostosItem(params) {
  const {
    valor_unitario,
    quantidade,
    ncm,
    cfop,
    regime_tributario_emitente = 'Simples Nacional',
    uf_emitente,
    uf_destinatario,
    tipo_contribuinte_destinatario = '1 - Contribuinte',
    incluir_ipi = false
  } = params;

  const valor_total = valor_unitario * quantidade;
  const operacao_interna = uf_emitente === uf_destinatario;
  
  // Busca alíquotas do regime
  const aliquotas = ALIQUOTAS_PADRAO[regime_tributario_emitente] || ALIQUOTAS_PADRAO['Lucro Presumido'];
  
  // Calcula IPI (se aplicável)
  const ncm_prefixo = ncm ? ncm.substring(0, 4) : 'default';
  const ipi_aliquota = incluir_ipi ? (TABELA_NCM_IPI[ncm_prefixo]?.ipi || TABELA_NCM_IPI[ncm]?.ipi || 0) : 0;
  const ipi_valor = (valor_total * ipi_aliquota) / 100;
  
  // Base de cálculo (valor + IPI)
  const base_calculo = valor_total + ipi_valor;
  
  // Calcula ICMS
  let icms_aliquota = 0;
  let icms_valor = 0;
  
  if (regime_tributario_emitente !== 'Simples Nacional' && regime_tributario_emitente !== 'MEI') {
    if (operacao_interna) {
      icms_aliquota = aliquotas.icms;
    } else {
      icms_aliquota = ICMS_INTERESTADUAL[uf_destinatario] || 12;
    }
    icms_valor = (base_calculo * icms_aliquota) / 100;
  }
  
  // Calcula DIFAL (apenas operações interestaduais para não contribuinte)
  let difal_valor = 0;
  let icms_destino_aliquota = 0;
  let icms_origem_aliquota = 0;
  
  if (!operacao_interna && tipo_contribuinte_destinatario !== '1 - Contribuinte') {
    icms_destino_aliquota = aliquotas.icms; // Alíquota interna do destino
    icms_origem_aliquota = ICMS_INTERESTADUAL[uf_destinatario] || 12;
    difal_valor = ((icms_destino_aliquota - icms_origem_aliquota) * base_calculo) / 100;
  }
  
  // Calcula PIS e COFINS
  const pis_aliquota = aliquotas.pis;
  const pis_valor = (valor_total * pis_aliquota) / 100;
  
  const cofins_aliquota = aliquotas.cofins;
  const cofins_valor = (valor_total * cofins_aliquota) / 100;
  
  // Total de impostos
  const total_impostos = icms_valor + ipi_valor + pis_valor + cofins_valor + difal_valor;
  
  return {
    valor_total,
    base_calculo,
    icms: {
      aliquota: icms_aliquota,
      valor: icms_valor,
      base_calculo: base_calculo
    },
    ipi: {
      aliquota: ipi_aliquota,
      valor: ipi_valor,
      base_calculo: valor_total
    },
    pis: {
      aliquota: pis_aliquota,
      valor: pis_valor,
      base_calculo: valor_total
    },
    cofins: {
      aliquota: cofins_aliquota,
      valor: cofins_valor,
      base_calculo: valor_total
    },
    difal: {
      valor: difal_valor,
      icms_destino_aliquota,
      icms_origem_aliquota,
      fcp_aliquota: 2.0, // Fundo de Combate à Pobreza (padrão 2%)
      fcp_valor: (difal_valor * 2) / 100
    },
    total_impostos,
    valor_com_impostos: valor_total + total_impostos,
    carga_tributaria_percentual: (total_impostos / valor_total) * 100
  };
}

/**
 * Calcula impostos de NF-e completa
 * @param {object} nfe - Dados da NF-e
 * @returns {object} - Totais calculados
 */
export async function calcularImpostosNFe(nfe) {
  const { itens, empresa_emitente, cliente_destinatario } = nfe;
  
  let totais = {
    valor_produtos: 0,
    base_calculo_icms: 0,
    valor_icms: 0,
    base_calculo_icms_st: 0,
    valor_icms_st: 0,
    valor_ipi: 0,
    valor_pis: 0,
    valor_cofins: 0,
    valor_difal: 0,
    valor_fcp: 0,
    total_impostos: 0,
    valor_total: 0
  };
  
  for (const item of itens) {
    const resultado = await calcularImpostosItem({
      valor_unitario: item.valor_unitario,
      quantidade: item.quantidade,
      ncm: item.ncm,
      cfop: item.cfop,
      regime_tributario_emitente: empresa_emitente.regime_tributario,
      uf_emitente: empresa_emitente.estado,
      uf_destinatario: cliente_destinatario.estado,
      tipo_contribuinte_destinatario: cliente_destinatario.tipo_contribuinte,
      incluir_ipi: item.incluir_ipi || false
    });
    
    totais.valor_produtos += resultado.valor_total;
    totais.base_calculo_icms += resultado.icms.base_calculo;
    totais.valor_icms += resultado.icms.valor;
    totais.valor_ipi += resultado.ipi.valor;
    totais.valor_pis += resultado.pis.valor;
    totais.valor_cofins += resultado.cofins.valor;
    totais.valor_difal += resultado.difal.valor;
    totais.valor_fcp += resultado.difal.fcp_valor;
  }
  
  totais.total_impostos = totais.valor_icms + totais.valor_ipi + totais.valor_pis + 
                          totais.valor_cofins + totais.valor_difal + totais.valor_fcp;
  totais.valor_total = totais.valor_produtos + totais.valor_ipi + (nfe.valor_frete || 0) + 
                       (nfe.outras_despesas || 0) - (nfe.valor_desconto || 0);
  
  return totais;
}

/**
 * Calcula Simples Nacional baseado em faturamento
 * @param {number} faturamento_12meses - Faturamento dos últimos 12 meses
 * @param {string} anexo - Anexo do Simples (I a V)
 * @returns {object} - Alíquota e valor
 */
export function calcularSimplesNacional(faturamento_12meses, anexo = 'I') {
  // Tabela simplificada - Anexo I (Comércio)
  const faixas = [
    { ate: 180000, aliquota: 4.0, deducao: 0 },
    { ate: 360000, aliquota: 7.3, deducao: 5940 },
    { ate: 720000, aliquota: 9.5, deducao: 13860 },
    { ate: 1800000, aliquota: 10.7, deducao: 22500 },
    { ate: 3600000, aliquota: 14.3, deducao: 87300 },
    { ate: 4800000, aliquota: 19.0, deducao: 378000 }
  ];
  
  const faixa = faixas.find(f => faturamento_12meses <= f.ate) || faixas[faixas.length - 1];
  
  const aliquota_efetiva = ((faturamento_12meses * faixa.aliquota / 100) - faixa.deducao) / faturamento_12meses * 100;
  
  return {
    faixa: faixas.indexOf(faixa) + 1,
    aliquota_nominal: faixa.aliquota,
    aliquota_efetiva: aliquota_efetiva,
    deducao: faixa.deducao
  };
}

/**
 * Determina CFOP automaticamente
 * @param {object} params - Parâmetros
 * @returns {string} - CFOP adequado
 */
export function determinarCFOP(params) {
  const {
    operacao = 'venda', // venda, compra, devolucao, transferencia
    uf_origem,
    uf_destino,
    tipo_produto = 'mercadoria', // mercadoria, ativo, uso_consumo
    finalidade = 'Normal' // Normal, Devolucao, Remessa
  } = params;
  
  const operacao_interna = uf_origem === uf_destino;
  
  // Vendas
  if (operacao === 'venda') {
    if (finalidade === 'Devolucao') {
      return operacao_interna ? '5202' : '6202'; // Devolução de compra
    }
    if (tipo_produto === 'mercadoria') {
      return operacao_interna ? '5102' : '6102'; // Venda de mercadoria adquirida
    }
    if (tipo_produto === 'producao_propria') {
      return operacao_interna ? '5101' : '6101'; // Venda de produção própria
    }
  }
  
  // Compras
  if (operacao === 'compra') {
    return operacao_interna ? '1102' : '2102'; // Compra para comercialização
  }
  
  // Transferências entre filiais
  if (operacao === 'transferencia') {
    return operacao_interna ? '5152' : '6152'; // Transferência de mercadoria
  }
  
  // Remessas (produção, conserto, etc.)
  if (operacao === 'remessa') {
    return operacao_interna ? '5901' : '6901'; // Remessa para industrialização
  }
  
  // Padrão
  return operacao_interna ? '5102' : '6102';
}

/**
 * Valida dados fiscais antes de emitir NF-e
 * @param {object} nfe - Dados da NF-e
 * @returns {object} - { valido: boolean, erros: [], avisos: [] }
 */
export function validarDadosFiscais(nfe) {
  const erros = [];
  const avisos = [];
  
  // Validações Obrigatórias
  if (!nfe.emitente?.cnpj) {
    erros.push('CNPJ do emitente é obrigatório');
  }
  
  if (!nfe.destinatario?.cpf_cnpj) {
    erros.push('CPF/CNPJ do destinatário é obrigatório');
  }
  
  if (!nfe.destinatario?.endereco?.cep) {
    erros.push('CEP do destinatário é obrigatório');
  }
  
  if (!nfe.itens || nfe.itens.length === 0) {
    erros.push('NF-e deve conter pelo menos 1 item');
  }
  
  // Validações de Itens
  nfe.itens?.forEach((item, idx) => {
    if (!item.ncm || item.ncm.length !== 8) {
      erros.push(`Item ${idx + 1}: NCM inválido (deve ter 8 dígitos)`);
    }
    
    if (!item.cfop) {
      erros.push(`Item ${idx + 1}: CFOP não informado`);
    }
    
    if (!item.valor_unitario || item.valor_unitario <= 0) {
      erros.push(`Item ${idx + 1}: Valor unitário inválido`);
    }
    
    if (!item.quantidade || item.quantidade <= 0) {
      erros.push(`Item ${idx + 1}: Quantidade inválida`);
    }
    
    // Avisos
    if (!item.descricao || item.descricao.length < 3) {
      avisos.push(`Item ${idx + 1}: Descrição muito curta`);
    }
  });
  
  // Validações de Valores
  const valor_total_itens = nfe.itens?.reduce((sum, item) => 
    sum + (item.valor_unitario * item.quantidade), 0) || 0;
  
  if (Math.abs(valor_total_itens - (nfe.valor_produtos || 0)) > 0.01) {
    avisos.push(`Divergência entre soma dos itens (R$ ${valor_total_itens.toFixed(2)}) e valor total (R$ ${(nfe.valor_produtos || 0).toFixed(2)})`);
  }
  
  // Validação de DIFAL
  if (nfe.emitente?.estado !== nfe.destinatario?.estado) {
    if (nfe.destinatario?.tipo_contribuinte !== '1 - Contribuinte') {
      avisos.push('Operação interestadual para não contribuinte: DIFAL será calculado');
    }
  }
  
  return {
    valido: erros.length === 0,
    erros,
    avisos,
    total_erros: erros.length,
    total_avisos: avisos.length
  };
}

/**
 * Aplica regime especial de empresa
 * (Ex: Empresa com redução de ICMS, isenção, etc.)
 */
export async function aplicarRegimeEspecial(empresaId) {
  try {
    const configs = await base44.entities.ConfigFiscalEmpresa.filter({ empresa_id: empresaId });
    const config = configs[0];
    
    if (!config) return null;
    
    return {
      regime_tributario: config.regime_tributario,
      icms_aliquota_custom: config.aliquota_padrao_icms,
      pis_aliquota_custom: config.aliquota_padrao_pis,
      cofins_aliquota_custom: config.aliquota_padrao_cofins,
      ipi_aliquota_custom: config.aliquota_padrao_ipi,
      substituicao_tributaria: config.substituicao_tributaria || false
    };
  } catch (error) {
    console.error('Erro ao buscar regime especial:', error);
    return null;
  }
}

/**
 * Calcula rateio de despesas acessórias
 * @param {array} itens - Itens da NF-e
 * @param {number} valor_frete - Valor do frete
 * @param {number} valor_seguro - Valor do seguro
 * @param {number} outras_despesas - Outras despesas
 * @returns {array} - Itens com rateio
 */
export function ratearDespesasAcessorias(itens, valor_frete = 0, valor_seguro = 0, outras_despesas = 0) {
  const total_produtos = itens.reduce((sum, item) => sum + (item.valor_unitario * item.quantidade), 0);
  const total_despesas = valor_frete + valor_seguro + outras_despesas;
  
  if (total_despesas === 0 || total_produtos === 0) return itens;
  
  return itens.map(item => {
    const valor_item = item.valor_unitario * item.quantidade;
    const percentual_item = valor_item / total_produtos;
    
    const rateio_frete = valor_frete * percentual_item;
    const rateio_seguro = valor_seguro * percentual_item;
    const rateio_outras = outras_despesas * percentual_item;
    
    return {
      ...item,
      rateio_frete,
      rateio_seguro,
      rateio_outras_despesas: rateio_outras,
      valor_total_com_despesas: valor_item + rateio_frete + rateio_seguro + rateio_outras
    };
  });
}

/**
 * Calcula redução de base de cálculo de ICMS
 * (Para produtos com benefício fiscal)
 */
export function calcularReducaoBaseICMS(valor, percentual_reducao) {
  const base_reduzida = valor * (1 - percentual_reducao / 100);
  const reducao = valor - base_reduzida;
  
  return {
    base_calculo_original: valor,
    percentual_reducao,
    reducao,
    base_calculo_reduzida: base_reduzida
  };
}

/**
 * Formata dados para XML da NF-e
 * (Preparado para integração com eNotas/NFe.io)
 */
export function formatarParaXMLNFe(nfe, impostos) {
  return {
    // Dados do Emitente
    emitente: {
      cnpj: nfe.emitente.cnpj.replace(/\D/g, ''),
      razao_social: nfe.emitente.razao_social,
      nome_fantasia: nfe.emitente.nome_fantasia,
      ie: nfe.emitente.inscricao_estadual,
      crt: nfe.emitente.regime_tributario === 'Simples Nacional' ? '1' : '3',
      endereco: nfe.emitente.endereco
    },
    
    // Dados do Destinatário
    destinatario: {
      tipo_pessoa: nfe.destinatario.cpf ? 'F' : 'J',
      cpf_cnpj: (nfe.destinatario.cpf || nfe.destinatario.cnpj).replace(/\D/g, ''),
      nome: nfe.destinatario.nome,
      ie: nfe.destinatario.inscricao_estadual || '',
      endereco: nfe.destinatario.endereco
    },
    
    // Totais
    totais: impostos,
    
    // Itens com impostos calculados
    itens: nfe.itens.map((item, idx) => ({
      numero_item: idx + 1,
      codigo_produto: item.codigo_produto,
      descricao: item.descricao,
      ncm: item.ncm,
      cfop: item.cfop,
      unidade: item.unidade,
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      valor_total: item.valor_unitario * item.quantidade,
      // Impostos calculados
      icms_cst: item.icms_cst || '00',
      icms_origem: item.icms_origem || '0',
      icms_aliquota: item.icms_aliquota,
      icms_valor: item.icms_valor,
      pis_cst: item.pis_cst || '01',
      pis_aliquota: item.pis_aliquota,
      pis_valor: item.pis_valor,
      cofins_cst: item.cofins_cst || '01',
      cofins_aliquota: item.cofins_aliquota,
      cofins_valor: item.cofins_valor,
      ipi_cst: item.ipi_cst || '99',
      ipi_aliquota: item.ipi_aliquota,
      ipi_valor: item.ipi_valor
    }))
  };
}

export default {
  calcularImpostosItem,
  calcularImpostosNFe,
  validarDadosFiscais,
  determinarCFOP,
  calcularSimplesNacional,
  ratearDespesasAcessorias,
  calcularReducaoBaseICMS,
  formatarParaXMLNFe,
  ALIQUOTAS_PADRAO,
  ICMS_INTERESTADUAL,
  TABELA_NCM_IPI
};