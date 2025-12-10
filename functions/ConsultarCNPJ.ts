/**
 * 🔍 CONSULTA CNPJ NA RECEITA FEDERAL
 * Função Backend V21.5 - Busca dados REAIS de CNPJ
 * Fontes: ReceitaWS + BrasilAPI (com fallback)
 * Retorna: Razão Social, Nome Fantasia, IE, Situação, CNAE, Endereço, etc.
 */

export default async function ConsultarCNPJ({ cnpj }) {
  const cnpjLimpo = cnpj?.replace(/\D/g, '') || '';
  
  if (cnpjLimpo.length !== 14) {
    return {
      sucesso: false,
      erro: 'CNPJ deve ter 14 dígitos'
    };
  }

  // ===== TENTATIVA 1: ReceitaWS (API Pública Consolidada) =====
  try {
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const dados = await response.json();
      
      if (dados.status !== 'ERROR' && dados.nome) {
        return {
          sucesso: true,
          fonte: 'ReceitaWS',
          dados: {
            razao_social: dados.nome || '',
            nome_fantasia: dados.fantasia || dados.nome || '',
            inscricao_estadual: dados.inscricao_estadual || 'ISENTO',
            inscricao_municipal: dados.inscricao_municipal || '',
            situacao_cadastral: dados.situacao || 'ATIVA',
            data_abertura: dados.abertura || '',
            porte: dados.porte || '',
            natureza_juridica: dados.natureza_juridica || '',
            cnae_principal: dados.atividade_principal?.[0]?.text || '',
            cnae_codigo: dados.atividade_principal?.[0]?.code || '',
            capital_social: dados.capital_social || '0',
            endereco_completo: {
              logradouro: dados.logradouro || '',
              numero: dados.numero || 'S/N',
              complemento: dados.complemento || '',
              bairro: dados.bairro || '',
              cidade: dados.municipio || '',
              uf: dados.uf || '',
              cep: dados.cep?.replace(/\D/g, '') || ''
            },
            telefone: dados.telefone ? dados.telefone.replace(/\D/g, '') : '',
            email: dados.email || ''
          }
        };
      }
    }
  } catch (error) {
    console.error('❌ ReceitaWS falhou:', error.message);
  }

  // ===== TENTATIVA 2: BrasilAPI (Fallback Oficial) =====
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const dados = await response.json();
      
      if (dados.razao_social) {
        return {
          sucesso: true,
          fonte: 'BrasilAPI',
          dados: {
            razao_social: dados.razao_social || '',
            nome_fantasia: dados.nome_fantasia || dados.razao_social || '',
            inscricao_estadual: dados.inscricao_estadual || 'ISENTO',
            inscricao_municipal: dados.inscricao_municipal || '',
            situacao_cadastral: dados.descricao_situacao_cadastral || 'ATIVA',
            data_abertura: dados.data_inicio_atividade || '',
            porte: dados.porte || '',
            natureza_juridica: dados.descricao_natureza_juridica || '',
            cnae_principal: dados.cnae_fiscal_descricao || '',
            cnae_codigo: dados.cnae_fiscal?.toString() || '',
            capital_social: dados.capital_social?.toString() || '0',
            endereco_completo: {
              logradouro: dados.descricao_tipo_de_logradouro ? 
                `${dados.descricao_tipo_de_logradouro} ${dados.logradouro || ''}`.trim() : 
                dados.logradouro || '',
              numero: dados.numero || 'S/N',
              complemento: dados.complemento || '',
              bairro: dados.bairro || '',
              cidade: dados.municipio || '',
              uf: dados.uf || '',
              cep: dados.cep?.replace(/\D/g, '') || ''
            },
            telefone: dados.ddd_telefone_1 ? `${dados.ddd_telefone_1}`.replace(/\D/g, '') : '',
            email: dados.email || ''
          }
        };
      }
    }
  } catch (error) {
    console.error('❌ BrasilAPI falhou:', error.message);
  }

  // ===== AMBAS AS APIs FALHARAM =====
  return {
    sucesso: false,
    erro: '❌ CNPJ não encontrado ou APIs temporariamente indisponíveis. Tente novamente em alguns segundos.'
  };
}