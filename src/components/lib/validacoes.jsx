/**
 * Biblioteca de Validações e Utilidades
 * CPF, CNPJ, Telefone, Email, etc.
 */

/**
 * Valida CPF
 * @param {string} cpf - CPF com ou sem máscara
 * @returns {boolean} - true se válido
 */
export function validarCPF(cpf) {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf.charAt(9)) !== digitoVerificador1) return false;
  
  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(cpf.charAt(10)) !== digitoVerificador2) return false;
  
  return true;
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ com ou sem máscara
 * @returns {boolean} - true se válido
 */
export function validarCNPJ(cnpj) {
  if (!cnpj) return false;
  
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;
  
  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(1)) return false;
  
  return true;
}

/**
 * Formata CPF
 * @param {string} cpf - CPF sem formatação
 * @returns {string} - CPF formatado (000.000.000-00)
 */
export function formatarCPF(cpf) {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} - CNPJ formatado (00.000.000/0000-00)
 */
export function formatarCNPJ(cnpj) {
  if (!cnpj) return '';
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return cnpj;
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 * @param {string} valor - CPF ou CNPJ
 * @returns {string} - Valor formatado
 */
export function formatarCPFCNPJ(valor) {
  if (!valor) return '';
  const numeros = valor.replace(/\D/g, '');
  
  if (numeros.length <= 11) {
    return formatarCPF(numeros);
  } else {
    return formatarCNPJ(numeros);
  }
}

/**
 * Valida CPF ou CNPJ
 * @param {string} valor - CPF ou CNPJ
 * @returns {boolean} - true se válido
 */
export function validarCPFCNPJ(valor) {
  if (!valor) return false;
  const numeros = valor.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    return validarCPF(numeros);
  } else if (numeros.length === 14) {
    return validarCNPJ(numeros);
  }
  
  return false;
}

/**
 * Formata telefone brasileiro
 * @param {string} telefone - Telefone sem formatação
 * @returns {string} - Telefone formatado
 */
export function formatarTelefone(telefone) {
  if (!telefone) return '';
  telefone = telefone.replace(/\D/g, '');
  
  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}

/**
 * Valida email
 * @param {string} email - Email
 * @returns {boolean} - true se válido
 */
export function validarEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Formata CEP
 * @param {string} cep - CEP sem formatação
 * @returns {string} - CEP formatado (00000-000)
 */
export function formatarCEP(cep) {
  if (!cep) return '';
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return cep;
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata valor monetário
 * @param {number} valor - Valor numérico
 * @returns {string} - Valor formatado em BRL
 */
export function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata percentual
 * @param {number} valor - Valor de 0 a 100
 * @returns {string} - Valor formatado com %
 */
export function formatarPercentual(valor) {
  if (valor === null || valor === undefined) return '0%';
  return `${valor.toFixed(2)}%`;
}

/**
 * Valida se é número válido
 * @param {any} valor - Valor a validar
 * @returns {boolean} - true se é número válido
 */
export function validarNumero(valor) {
  return !isNaN(parseFloat(valor)) && isFinite(valor);
}

/**
 * Calcula idade
 * @param {string} dataNascimento - Data no formato YYYY-MM-DD
 * @returns {number} - Idade em anos
 */
export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade;
}

/**
 * Remove acentos de string
 * @param {string} texto - Texto com acentos
 * @returns {string} - Texto sem acentos
 */
export function removerAcentos(texto) {
  if (!texto) return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera slug a partir de texto
 * @param {string} texto - Texto a converter
 * @returns {string} - Slug gerado
 */
export function gerarSlug(texto) {
  if (!texto) return '';
  return removerAcentos(texto)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Trunca texto
 * @param {string} texto - Texto a truncar
 * @param {number} limite - Limite de caracteres
 * @returns {string} - Texto truncado com ...
 */
export function truncarTexto(texto, limite = 50) {
  if (!texto) return '';
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + '...';
}


/**
 * NOVAS VALIDAÇÕES DE NEGÓCIO - V12.0
 */

// Validar limite de crédito do cliente
export const validarLimiteCredito = (cliente, valorPedido) => {
  if (!cliente?.condicao_comercial) {
    return { valido: true, mensagem: '' };
  }

  const limite = cliente.condicao_comercial.limite_credito || 0;
  const utilizado = cliente.condicao_comercial.limite_credito_utilizado || 0;
  const disponivel = limite - utilizado;
  
  if (cliente.status === 'Bloqueado') {
    return {
      valido: false,
      mensagem: '❌ Cliente bloqueado! Não é possível aprovar o pedido.',
      bloqueado: true
    };
  }

  if (valorPedido > disponivel) {
    return {
      valido: false,
      mensagem: `⚠️ Limite de crédito insuficiente! Disponível: R$ ${disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Necessário: R$ ${valorPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      limite_excedido: true,
      disponivel,
      necessario: valorPedido
    };
  }

  const percentualUtilizado = limite > 0 ? ((utilizado + valorPedido) / limite) * 100 : 0;
  
  if (percentualUtilizado >= 90) {
    return {
      valido: true,
      mensagem: `⚠️ Atenção: Cliente próximo do limite de crédito (${percentualUtilizado.toFixed(0)}%)`,
      alerta: true
    };
  }

  return { valido: true, mensagem: '' };
};

// Validar estoque antes de aprovar pedido
export const validarEstoquePedido = async (pedido, base44) => {
  const itensRevenda = pedido.itens_revenda || [];
  const itensInsuficientes = [];

  for (const item of itensRevenda) {
    if (!item.produto_id) continue;

    const produto = await base44.entities.Produto.filter({ id: item.produto_id });
    if (produto.length === 0) continue;

    const produtoData = produto[0];
    const disponivel = (produtoData.estoque_atual || 0) - (produtoData.estoque_reservado || 0);

    if (disponivel < item.quantidade) {
      itensInsuficientes.push({
        descricao: item.descricao,
        solicitado: item.quantidade,
        disponivel,
        faltando: item.quantidade - disponivel
      });
    }
  }

  if (itensInsuficientes.length > 0) {
    return {
      valido: false,
      itensInsuficientes,
      mensagem: `⚠️ ${itensInsuficientes.length} item(ns) com estoque insuficiente`
    };
  }

  return { valido: true, mensagem: '' };
};

// Validar preço abaixo do custo
export const validarPrecoMinimo = (item, produto) => {
  if (!produto?.custo_medio) {
    return { valido: true, mensagem: '' };
  }

  const precoVenda = item.preco_unitario || item.preco_venda_unitario || 0;
  const custo = produto.custo_medio;
  const margemMinima = produto.margem_minima_percentual || 10;
  
  const precoMinimo = custo * (1 + margemMinima / 100);

  if (precoVenda < custo) {
    return {
      valido: false,
      mensagem: `❌ Preço abaixo do custo! Custo: R$ ${custo.toFixed(2)} | Preço: R$ ${precoVenda.toFixed(2)}`,
      prejuizo: true
    };
  }

  if (precoVenda < precoMinimo) {
    const margemAtual = ((precoVenda - custo) / custo) * 100;
    return {
      valido: false,
      mensagem: `⚠️ Margem abaixo do mínimo! Margem atual: ${margemAtual.toFixed(1)}% | Mínima: ${margemMinima}%`,
      margem_baixa: true,
      requer_aprovacao: true
    };
  }

  return { valido: true, mensagem: '' };
};

// Validar CPF/CNPJ em tempo real
export const validarDocumento = (documento, tipo) => {
  const limpo = documento.replace(/[^\d]/g, '');

  if (tipo === 'cpf' || tipo === 'CPF') {
    if (limpo.length !== 11) return false;
    
    // Verificar dígitos repetidos
    if (/^(\d)\1+$/.test(limpo)) return false;

    // Validar dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(limpo.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(limpo.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.charAt(10))) return false;

    return true;
  }

  if (tipo === 'cnpj' || tipo === 'CNPJ') {
    if (limpo.length !== 14) return false;
    
    // Verificar dígitos repetidos
    if (/^(\d)\1+$/.test(limpo)) return false;

    // Validar dígitos verificadores
    let tamanho = limpo.length - 2;
    let numeros = limpo.substring(0, tamanho);
    const digitos = limpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = limpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  }

  return false;
};