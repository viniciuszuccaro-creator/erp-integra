/**
 * Biblioteca de Integração NF-e Real
 * Suporta: eNotas.io, NFe.io, Focus NFe
 */

import { base44 } from '@/api/base44Client';

/**
 * Verifica se a integração está configurada
 */
async function verificarConfiguracao(empresaId) {
  const configs = await base44.entities.ConfigFiscalEmpresa.filter({ empresa_id: empresaId });
  
  if (!configs || configs.length === 0) {
    return { configurado: false, erro: 'Configuração fiscal não encontrada' };
  }
  
  const config = configs[0];
  const integracao = config.integracao_nfe || {};
  
  if (!integracao.ativa) {
    return { configurado: false, erro: 'Integração NF-e não está ativa', config };
  }
  
  if (!integracao.api_key) {
    return { configurado: false, erro: 'API Key não configurada', config };
  }
  
  return { configurado: true, config, integracao };
}

/**
 * Emitir NF-e via eNotas.io
 */
async function emitirNFeENotas(nfe, config) {
  const apiKey = config.integracao_nfe.api_key;
  const empresaId = config.integracao_nfe.empresa_id_provedor;
  
  // Montar payload eNotas.io
  const payload = {
    tipo: 'NF-e',
    idExterno: nfe.id,
    ambienteEmissao: config.ambiente === 'Produção' ? 'Producao' : 'Homologacao',
    cliente: {
      tipoPessoa: nfe.cliente_cpf_cnpj?.length === 14 ? 'J' : 'F',
      nome: nfe.cliente_fornecedor,
      email: nfe.cliente_endereco?.email || '',
      cpfCnpj: nfe.cliente_cpf_cnpj?.replace(/\D/g, ''),
      telefone: nfe.cliente_endereco?.telefone?.replace(/\D/g, '') || '',
      endereco: {
        pais: 'Brasil',
        uf: nfe.cliente_endereco?.estado || '',
        cidade: nfe.cliente_endereco?.cidade || '',
        logradouro: nfe.cliente_endereco?.logradouro || '',
        numero: nfe.cliente_endereco?.numero || 'S/N',
        complemento: nfe.cliente_endereco?.complemento || '',
        bairro: nfe.cliente_endereco?.bairro || '',
        cep: nfe.cliente_endereco?.cep?.replace(/\D/g, '') || ''
      }
    },
    servico: {
      valorServicos: nfe.valor_servicos || 0,
      valorPis: nfe.valor_pis || 0,
      valorCofins: nfe.valor_cofins || 0,
      valorInss: 0,
      valorIr: 0,
      valorCsll: 0,
      issRetido: false,
      valorIss: nfe.valor_iss || 0
    },
    produtos: (nfe.itens || []).map((item, idx) => ({
      numeroItem: idx + 1,
      codigo: item.codigo_produto || '',
      descricao: item.descricao,
      ncm: item.ncm?.replace(/\D/g, '') || '',
      cfop: item.cfop || config.cfop_padrao_dentro_estado,
      unidadeMedida: item.unidade || 'UN',
      quantidade: item.quantidade,
      valorUnitario: item.valor_unitario,
      valorBruto: item.valor_total,
      valorDesconto: item.valor_desconto || 0,
      icms: {
        situacaoTributaria: item.icms_situacao_tributaria || '00',
        origem: item.icms_origem || '0',
        baseCalculo: item.icms_base_calculo || item.valor_total,
        aliquota: item.icms_aliquota || config.aliquota_padrao_icms || 18,
        valor: item.icms_valor || 0
      },
      ipi: item.ipi_valor > 0 ? {
        situacaoTributaria: item.ipi_situacao_tributaria || '50',
        baseCalculo: item.ipi_base_calculo || item.valor_total,
        aliquota: item.ipi_aliquota || 0,
        valor: item.ipi_valor || 0
      } : null,
      pis: {
        situacaoTributaria: item.pis_situacao_tributaria || '01',
        baseCalculo: item.pis_base_calculo || item.valor_total,
        aliquota: item.pis_aliquota || config.aliquota_padrao_pis || 1.65,
        valor: item.pis_valor || 0
      },
      cofins: {
        situacaoTributaria: item.cofins_situacao_tributaria || '01',
        baseCalculo: item.cofins_base_calculo || item.valor_total,
        aliquota: item.cofins_aliquota || config.aliquota_padrao_cofins || 7.6,
        valor: item.cofins_valor || 0
      }
    })),
    pedidoNumero: nfe.numero_pedido || nfe.numero,
    observacoes: nfe.informacoes_complementares || ''
  };

  // Fazer chamada real à API eNotas.io
  const response = await fetch(`https://api.enotas.com.br/v2/empresas/${empresaId}/nfes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(apiKey + ':')}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.mensagem || 'Erro ao emitir NF-e');
  }

  const resultado = await response.json();
  
  return {
    sucesso: true,
    nfeId: resultado.id,
    numero: resultado.numero,
    serie: resultado.serie,
    chave: resultado.chaveAcesso,
    protocolo: resultado.protocolo,
    dataAutorizacao: resultado.dataAutorizacao,
    xml: resultado.linkDownloadXml,
    pdf: resultado.linkDownloadPdf,
    status: resultado.status
  };
}

/**
 * Emitir NF-e via NFe.io
 */
async function emitirNFeNFeIO(nfe, config) {
  const apiKey = config.integracao_nfe.api_key;
  const empresaId = config.integracao_nfe.empresa_id_provedor;

  const payload = {
    natureza_operacao: nfe.natureza_operacao || 'Venda de Mercadoria',
    tipo_documento: 1, // 1=Saída
    finalidade_emissao: nfe.finalidade === 'Normal' ? 1 : 2,
    cnpj_emitente: config.cnpj_emitente?.replace(/\D/g, ''),
    nome_destinatario: nfe.cliente_fornecedor,
    cpf_cnpj_destinatario: nfe.cliente_cpf_cnpj?.replace(/\D/g, ''),
    inscricao_estadual_destinatario: '',
    telefone_destinatario: '',
    email_destinatario: '',
    logradouro_destinatario: nfe.cliente_endereco?.logradouro || '',
    numero_destinatario: nfe.cliente_endereco?.numero || '',
    bairro_destinatario: nfe.cliente_endereco?.bairro || '',
    municipio_destinatario: nfe.cliente_endereco?.cidade || '',
    uf_destinatario: nfe.cliente_endereco?.estado || '',
    cep_destinatario: nfe.cliente_endereco?.cep?.replace(/\D/g, '') || '',
    valor_produtos: nfe.valor_produtos || 0,
    valor_desconto: nfe.valor_desconto || 0,
    valor_frete: nfe.valor_frete || 0,
    valor_seguro: nfe.valor_seguro || 0,
    valor_outras_despesas: nfe.outras_despesas || 0,
    valor_total: nfe.valor_total,
    informacoes_adicionais_contribuinte: nfe.informacoes_complementares || '',
    items: (nfe.itens || []).map(item => ({
      numero_item: item.numero_item,
      codigo_produto: item.codigo_produto || '',
      descricao: item.descricao,
      cfop: item.cfop || config.cfop_padrao_dentro_estado,
      unidade_comercial: item.unidade || 'UN',
      quantidade_comercial: item.quantidade,
      valor_unitario_comercial: item.valor_unitario,
      valor_bruto: item.valor_total,
      ncm: item.ncm?.replace(/\D/g, '') || '',
      origem: parseInt(item.icms_origem || '0'),
      icms_situacao_tributaria: item.icms_situacao_tributaria || '00',
      icms_aliquota: item.icms_aliquota || 0,
      icms_base_calculo: item.icms_base_calculo || 0,
      icms_valor: item.icms_valor || 0
    }))
  };

  const response = await fetch(`https://api.nfe.io/v1/companies/${empresaId}/productinvoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.message || 'Erro ao emitir NF-e');
  }

  const resultado = await response.json();
  
  return {
    sucesso: true,
    nfeId: resultado.id,
    numero: resultado.number,
    serie: resultado.serie,
    chave: resultado.key_access,
    protocolo: resultado.authorization_protocol,
    dataAutorizacao: resultado.issued_on,
    xml: resultado.xml_url,
    pdf: resultado.danfe_url,
    status: resultado.status
  };
}

/**
 * Consultar Status NF-e
 */
async function consultarStatusNFe(nfeId, empresaId, chaveAcesso) {
  const { data } = await base44.functions.invoke('nfeActions', { action: 'status', nfeId, empresaId, chaveAcesso });
  return data;
}

/**
 * Cancelar NF-e
 */
async function cancelarNFe(nfeId, empresaId, justificativa) {
  const { data } = await base44.functions.invoke('nfeActions', { action: 'cancelar', nfeId, empresaId, justificativa });
  return data;
}

/**
 * Emitir Carta de Correção
 */
async function emitirCartaCorrecao(nfeId, empresaId, correcao) {
  const { data } = await base44.functions.invoke('nfeActions', { action: 'carta', nfeId, empresaId, correcao });
  return data;
}

/**
 * Função principal de emissão
 */
export async function emitirNFe(nfe, empresaId) {
  const { data } = await base44.functions.invoke('nfeActions', { action: 'emitir', nfe, empresaId });
  return data;
}

/**
  * Gerar chave de acesso simulada (44 dígitos)
  */
function gerarChaveAcessoSimulada() {
  const uf = '35'; // SP
  const aamm = new Date().toISOString().substr(2, 5).replace('-', '');
  const cnpj = '00000000000000';
  const mod = '55';
  const serie = '001';
  const numero = String(Math.floor(Math.random() * 999999999)).padStart(9, '0');
  const tpEmis = '1';
  const codigo = String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
  
  const chave = uf + aamm + cnpj + mod + serie + numero + tpEmis + codigo;
  const dv = calcularDVChave(chave);
  
  return chave + dv;
}

/**
 * Calcular dígito verificador da chave
 */
function calcularDVChave(chave) {
  const multiplicadores = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  
  for (let i = 0; i < 43; i++) {
    soma += parseInt(chave[i]) * multiplicadores[i];
  }
  
  const resto = soma % 11;
  return resto === 0 || resto === 1 ? 0 : 11 - resto;
}

export default {
  emitirNFe,
  consultarStatusNFe,
  cancelarNFe,
  emitirCartaCorrecao,
  verificarConfiguracao
};