/**
 * Parser de XML de NF-e
 * Extrai dados estruturados do XML da Nota Fiscal Eletrônica
 */

/**
 * Converte XML string para objeto JavaScript
 */
export function parseXMLString(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  // Verificar se houve erro no parse
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Erro ao fazer parse do XML: ' + parserError.textContent);
  }
  
  return xmlDoc;
}

/**
 * Extrai texto de um elemento XML
 */
function getTagValue(xmlDoc, tagName, parent = null) {
  const element = parent 
    ? parent.querySelector(tagName)
    : xmlDoc.querySelector(tagName);
  
  return element ? element.textContent.trim() : null;
}

/**
 * Extrai todos os elementos com uma tag
 */
function getAllTags(xmlDoc, tagName, parent = null) {
  const elements = parent
    ? parent.querySelectorAll(tagName)
    : xmlDoc.querySelectorAll(tagName);
  
  return Array.from(elements);
}

/**
 * Parse completo do XML da NF-e
 */
export function parseNFeXML(xmlString) {
  const xmlDoc = parseXMLString(xmlString);
  
  // Dados da NF-e
  const ide = xmlDoc.querySelector('ide');
  const emit = xmlDoc.querySelector('emit');
  const dest = xmlDoc.querySelector('dest');
  const total = xmlDoc.querySelector('total');
  const infProt = xmlDoc.querySelector('infProt');
  
  // Identificação
  const chaveAcesso = getTagValue(xmlDoc, 'chNFe', infProt) || getTagValue(xmlDoc, 'Id')?.replace('NFe', '');
  const numeroNFe = getTagValue(xmlDoc, 'nNF', ide);
  const serieNFe = getTagValue(xmlDoc, 'serie', ide);
  const dataEmissao = getTagValue(xmlDoc, 'dhEmi', ide) || getTagValue(xmlDoc, 'dEmi', ide);
  const naturezaOperacao = getTagValue(xmlDoc, 'natOp', ide);
  const cfop = getTagValue(xmlDoc, 'CFOP', ide);
  
  // Emitente (Fornecedor)
  const emitenteCNPJ = getTagValue(xmlDoc, 'CNPJ', emit);
  const emitenteNome = getTagValue(xmlDoc, 'xNome', emit) || getTagValue(xmlDoc, 'xFant', emit);
  const emitenteRazaoSocial = getTagValue(xmlDoc, 'xNome', emit);
  const emitenteFantasia = getTagValue(xmlDoc, 'xFant', emit);
  const emitenteIE = getTagValue(xmlDoc, 'IE', emit);
  
  // Endereço do emitente
  const emitEndereco = emit?.querySelector('enderEmit');
  const emitenteEndereco = emitEndereco ? {
    logradouro: getTagValue(xmlDoc, 'xLgr', emitEndereco),
    numero: getTagValue(xmlDoc, 'nro', emitEndereco),
    complemento: getTagValue(xmlDoc, 'xCpl', emitEndereco),
    bairro: getTagValue(xmlDoc, 'xBairro', emitEndereco),
    cidade: getTagValue(xmlDoc, 'xMun', emitEndereco),
    estado: getTagValue(xmlDoc, 'UF', emitEndereco),
    cep: getTagValue(xmlDoc, 'CEP', emitEndereco),
    telefone: getTagValue(xmlDoc, 'fone', emit)
  } : null;
  
  // Destinatário
  const destCNPJ = getTagValue(xmlDoc, 'CNPJ', dest) || getTagValue(xmlDoc, 'CPF', dest);
  const destNome = getTagValue(xmlDoc, 'xNome', dest);
  
  // Totais
  const icmsTotal = total?.querySelector('ICMSTot');
  const valorProdutos = parseFloat(getTagValue(xmlDoc, 'vProd', icmsTotal) || 0);
  const valorNFe = parseFloat(getTagValue(xmlDoc, 'vNF', icmsTotal) || 0);
  const valorICMS = parseFloat(getTagValue(xmlDoc, 'vICMS', icmsTotal) || 0);
  const valorIPI = parseFloat(getTagValue(xmlDoc, 'vIPI', icmsTotal) || 0);
  const valorPIS = parseFloat(getTagValue(xmlDoc, 'vPIS', icmsTotal) || 0);
  const valorCOFINS = parseFloat(getTagValue(xmlDoc, 'vCOFINS', icmsTotal) || 0);
  const valorFrete = parseFloat(getTagValue(xmlDoc, 'vFrete', icmsTotal) || 0);
  const valorDesconto = parseFloat(getTagValue(xmlDoc, 'vDesc', icmsTotal) || 0);
  
  // Itens
  const detElements = getAllTags(xmlDoc, 'det');
  const itens = detElements.map((det, index) => {
    const prod = det.querySelector('prod');
    const imposto = det.querySelector('imposto');
    
    const icms = imposto?.querySelector('ICMS');
    const ipi = imposto?.querySelector('IPI');
    const pis = imposto?.querySelector('PIS');
    const cofins = imposto?.querySelector('COFINS');
    
    return {
      numero_item: index + 1,
      codigo_produto: getTagValue(xmlDoc, 'cProd', prod),
      codigo_ean: getTagValue(xmlDoc, 'cEAN', prod),
      descricao: getTagValue(xmlDoc, 'xProd', prod),
      ncm: getTagValue(xmlDoc, 'NCM', prod),
      cfop: getTagValue(xmlDoc, 'CFOP', prod),
      unidade: getTagValue(xmlDoc, 'uCom', prod),
      quantidade: parseFloat(getTagValue(xmlDoc, 'qCom', prod) || 0),
      valor_unitario: parseFloat(getTagValue(xmlDoc, 'vUnCom', prod) || 0),
      valor_total: parseFloat(getTagValue(xmlDoc, 'vProd', prod) || 0),
      valor_desconto: parseFloat(getTagValue(xmlDoc, 'vDesc', prod) || 0),
      valor_frete: parseFloat(getTagValue(xmlDoc, 'vFrete', prod) || 0),
      // Impostos
      icms_cst: getTagValue(xmlDoc, 'CST', icms) || getTagValue(xmlDoc, 'CSOSN', icms),
      icms_base: parseFloat(getTagValue(xmlDoc, 'vBC', icms) || 0),
      icms_aliquota: parseFloat(getTagValue(xmlDoc, 'pICMS', icms) || 0),
      icms_valor: parseFloat(getTagValue(xmlDoc, 'vICMS', icms) || 0),
      ipi_cst: getTagValue(xmlDoc, 'CST', ipi),
      ipi_valor: parseFloat(getTagValue(xmlDoc, 'vIPI', ipi) || 0),
      pis_cst: getTagValue(xmlDoc, 'CST', pis),
      pis_valor: parseFloat(getTagValue(xmlDoc, 'vPIS', pis) || 0),
      cofins_cst: getTagValue(xmlDoc, 'CST', cofins),
      cofins_valor: parseFloat(getTagValue(xmlDoc, 'vCOFINS', cofins) || 0)
    };
  });
  
  // Duplicatas (Contas a Pagar)
  const duplicatas = getAllTags(xmlDoc, 'dup').map(dup => ({
    numero: getTagValue(xmlDoc, 'nDup', dup),
    vencimento: getTagValue(xmlDoc, 'dVenc', dup),
    valor: parseFloat(getTagValue(xmlDoc, 'vDup', dup) || 0)
  }));
  
  // Transportadora
  const transp = xmlDoc.querySelector('transp');
  const transportadora = transp ? {
    nome: getTagValue(xmlDoc, 'xNome', transp.querySelector('transporta')),
    cnpj: getTagValue(xmlDoc, 'CNPJ', transp.querySelector('transporta')),
    placa: getTagValue(xmlDoc, 'placa', transp.querySelector('veicTransp')),
    volumes: parseFloat(getTagValue(xmlDoc, 'qVol', transp.querySelector('vol')) || 0),
    peso_bruto: parseFloat(getTagValue(xmlDoc, 'pesoB', transp.querySelector('vol')) || 0),
    peso_liquido: parseFloat(getTagValue(xmlDoc, 'pesoL', transp.querySelector('vol')) || 0)
  } : null;
  
  // Informações complementares
  const infAdic = xmlDoc.querySelector('infAdic');
  const informacoesComplementares = getTagValue(xmlDoc, 'infCpl', infAdic);
  
  // Protocolo de autorização
  const protocolo = getTagValue(xmlDoc, 'nProt', infProt);
  const dataAutorizacao = getTagValue(xmlDoc, 'dhRecbto', infProt);
  
  return {
    chaveAcesso,
    numeroNFe,
    serieNFe,
    dataEmissao,
    naturezaOperacao,
    cfop,
    // Fornecedor
    fornecedor: {
      cnpj: emitenteCNPJ,
      razao_social: emitenteRazaoSocial,
      nome_fantasia: emitenteFantasia,
      inscricao_estadual: emitenteIE,
      endereco: emitenteEndereco
    },
    // Destinatário
    destinatario: {
      cnpj: destCNPJ,
      nome: destNome
    },
    // Valores
    valores: {
      produtos: valorProdutos,
      total: valorNFe,
      icms: valorICMS,
      ipi: valorIPI,
      pis: valorPIS,
      cofins: valorCOFINS,
      frete: valorFrete,
      desconto: valorDesconto
    },
    // Itens
    itens,
    quantidadeItens: itens.length,
    // Duplicatas
    duplicatas,
    // Transportadora
    transportadora,
    // Outros
    informacoesComplementares,
    protocolo,
    dataAutorizacao
  };
}

/**
 * Valida XML antes de processar
 */
export function validarXMLNFe(xmlString) {
  const erros = [];
  
  try {
    const xmlDoc = parseXMLString(xmlString);
    
    // Verificar se é uma NF-e válida
    const nfe = xmlDoc.querySelector('NFe') || xmlDoc.querySelector('nfeProc');
    if (!nfe) {
      erros.push('Arquivo não é um XML de NF-e válido');
      return { valido: false, erros };
    }
    
    // Verificar chave de acesso
    const chave = getTagValue(xmlDoc, 'chNFe') || getTagValue(xmlDoc, 'Id')?.replace('NFe', '');
    if (!chave || chave.length !== 44) {
      erros.push('Chave de acesso inválida ou não encontrada');
    }
    
    // Verificar dados do emitente
    const emit = xmlDoc.querySelector('emit');
    if (!emit) {
      erros.push('Dados do emitente não encontrados');
    } else {
      const cnpj = getTagValue(xmlDoc, 'CNPJ', emit);
      if (!cnpj || cnpj.length !== 14) {
        erros.push('CNPJ do emitente inválido');
      }
    }
    
    // Verificar itens
    const detElements = getAllTags(xmlDoc, 'det');
    if (detElements.length === 0) {
      erros.push('Nenhum item encontrado na NF-e');
    }
    
  } catch (error) {
    erros.push(`Erro ao validar XML: ${error.message}`);
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * Lê arquivo XML
 */
export function lerArquivoXML(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsText(file);
  });
}

export default {
  parseXMLString,
  parseNFeXML,
  validarXMLNFe,
  lerArquivoXML
};