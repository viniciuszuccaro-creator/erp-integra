/**
 * 🔍 CONSULTA CNPJ NA RECEITA FEDERAL
 * Função Backend para buscar dados reais de CNPJ
 * Fontes: ReceitaWS + BrasilAPI
 */

export default async function ConsultarCNPJ({ cnpj }) {
  const cnpjLimpo = cnpj.replace(/\D/g, '');
  
  if (cnpjLimpo.length !== 14) {
    return {
      sucesso: false,
      erro: 'CNPJ deve ter 14 dígitos'
    };
  }

  // Tentar ReceitaWS primeiro
  try {
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
    
    if (response.ok) {
      const dados = await response.json();
      
      if (dados.status !== 'ERROR') {
        return {
          sucesso: true,
          dados: {
            razao_social: dados.nome || '',
            nome_fantasia: dados.fantasia || '',
            inscricao_estadual: dados.inscricao_estadual || '',
            situacao_cadastral: dados.situacao || '',
            data_abertura: dados.abertura || '',
            porte: dados.porte || '',
            natureza_juridica: dados.natureza_juridica || '',
            cnae_principal: dados.atividade_principal?.[0]?.text || '',
            endereco_completo: {
              logradouro: dados.logradouro || '',
              numero: dados.numero || '',
              complemento: dados.complemento || '',
              bairro: dados.bairro || '',
              cidade: dados.municipio || '',
              uf: dados.uf || '',
              cep: dados.cep?.replace(/\D/g, '') || ''
            },
            telefone: dados.telefone || '',
            email: dados.email || '',
            capital_social: dados.capital_social || ''
          }
        };
      }
    }
  } catch (error) {
    console.log('ReceitaWS falhou, tentando BrasilAPI...');
  }

  // Tentar BrasilAPI como fallback
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
    
    if (response.ok) {
      const dados = await response.json();
      
      return {
        sucesso: true,
        dados: {
          razao_social: dados.razao_social || '',
          nome_fantasia: dados.nome_fantasia || '',
          inscricao_estadual: dados.inscricao_estadual || '',
          situacao_cadastral: dados.descricao_situacao_cadastral || '',
          data_abertura: dados.data_inicio_atividade || '',
          porte: dados.porte || '',
          natureza_juridica: dados.natureza_juridica || '',
          cnae_principal: dados.cnae_fiscal_descricao || '',
          endereco_completo: {
            logradouro: dados.logradouro || '',
            numero: dados.numero || '',
            complemento: dados.complemento || '',
            bairro: dados.bairro || '',
            cidade: dados.municipio || '',
            uf: dados.uf || '',
            cep: dados.cep?.replace(/\D/g, '') || ''
          },
          telefone: dados.ddd_telefone_1 || '',
          email: '',
          capital_social: dados.capital_social || ''
        }
      };
    }
  } catch (error) {
    console.log('BrasilAPI também falhou');
  }

  return {
    sucesso: false,
    erro: 'CNPJ não encontrado nas fontes públicas'
  };
}