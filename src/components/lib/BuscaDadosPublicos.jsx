import React from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * 🌐 BUSCA AUTOMÁTICA DE DADOS PÚBLICOS
 * V21.2 - Sistema de autocomplete inteligente
 * 
 * Funcionalidades:
 * - CNPJ/CPF: Receita Federal via IA
 * - CEP: ViaCEP
 * - NCM: Tabela oficial + alíquotas
 * - RNTRC: Validação transportadoras
 */

/**
 * Buscar dados de CNPJ na Receita Federal via IA
 * @param {string} cnpj - CNPJ formatado ou não
 * @returns {object} Dados da empresa
 */
export async function buscarDadosCNPJ(cnpj) {
  const cnpjLimpo = cnpj?.replace(/\D/g, '') || '';
  
  if (cnpjLimpo.length !== 14) {
    return {
      sucesso: false,
      erro: 'CNPJ deve ter 14 dígitos'
    };
  }

  try {
    const resultado = await base44.functions.ConsultarCNPJ({ cnpj: cnpjLimpo });
    
    if (!resultado) {
      throw new Error('Resposta vazia da função');
    }
    
    return resultado;
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    return {
      sucesso: false,
      erro: error.message || 'Erro ao buscar CNPJ - verifique se as Funções Backend estão habilitadas'
    };
  }
}

/**
 * Buscar dados de CPF via IA (apenas validação + nome se público)
 * @param {string} cpf - CPF formatado ou não
 * @returns {object} Status do CPF
 */
export async function buscarDadosCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (cpfLimpo.length !== 11) {
    return {
      sucesso: false,
      erro: 'CPF deve ter 11 dígitos'
    };
  }

  // Validação local usando algoritmo oficial
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return {
      sucesso: false,
      erro: 'CPF inválido'
    };
  }
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto > 9 ? 0 : resto;
  
  if (digito1 !== parseInt(cpfLimpo.charAt(9))) {
    return {
      sucesso: false,
      erro: 'CPF inválido'
    };
  }
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto > 9 ? 0 : resto;
  
  if (digito2 !== parseInt(cpfLimpo.charAt(10))) {
    return {
      sucesso: false,
      erro: 'CPF inválido'
    };
  }

  const formatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  return {
    sucesso: true,
    dados: {
      valido: true,
      formatado: formatado
    }
  };
}

/**
 * Buscar endereço por CEP (ViaCEP + coordenadas)
 * @param {string} cep - CEP formatado ou não
 * @returns {object} Dados do endereço
 */
export async function buscarEnderecoCEP(cep) {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      throw new Error('CEP inválido - deve ter 8 dígitos');
    }

    // 1. Buscar via ViaCEP
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!resposta.ok) {
      throw new Error('Erro ao buscar CEP na API ViaCEP');
    }
    
    const dadosViaCep = await resposta.json();
    
    if (dadosViaCep.erro) {
      throw new Error('CEP não encontrado');
    }

    // 2. Buscar coordenadas GPS via OpenStreetMap Nominatim
    const enderecoCompleto = `${dadosViaCep.logradouro}, ${dadosViaCep.bairro}, ${dadosViaCep.localidade}, ${dadosViaCep.uf}, Brasil`;
    const urlNominatim = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enderecoCompleto)}&format=json&limit=1`;
    
    let latitude = null;
    let longitude = null;
    
    try {
      const respostaGPS = await fetch(urlNominatim, {
        headers: {
          'User-Agent': 'ERP-Zuccaro/1.0'
        }
      });
      
      if (respostaGPS.ok) {
        const dadosGPS = await respostaGPS.json();
        if (dadosGPS && dadosGPS.length > 0) {
          latitude = parseFloat(dadosGPS[0].lat);
          longitude = parseFloat(dadosGPS[0].lon);
        }
      }
    } catch (erroGPS) {
      console.warn('Não foi possível obter coordenadas GPS:', erroGPS);
    }

    return {
      sucesso: true,
      dados: {
        logradouro: dadosViaCep.logradouro || '',
        bairro: dadosViaCep.bairro || '',
        cidade: dadosViaCep.localidade || '',
        uf: dadosViaCep.uf || '',
        latitude: latitude,
        longitude: longitude,
        ddd: dadosViaCep.ddd || ''
      }
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message || 'Erro ao buscar CEP'
    };
  }
}

/**
 * Buscar informações de NCM (código fiscal de produtos)
 * @param {string} ncm - Código NCM (8 dígitos)
 * @returns {object} Descrição e alíquotas
 */
export async function buscarDadosNCM(ncm) {
  try {
    const ncmLimpo = ncm.replace(/\D/g, '');
    
    if (ncmLimpo.length !== 8) {
      throw new Error('NCM deve ter 8 dígitos');
    }

    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Busque informações oficiais do código NCM ${ncmLimpo} na tabela NCM brasileira (Nomenclatura Comum do Mercosul).
      
      Retorne:
      - descricao (descrição oficial do produto)
      - unidade (unidade padrão: KG, UN, MT, etc)
      - aliquota_ipi (% de IPI médio)
      - aliquota_pis (% de PIS padrão)
      - aliquota_cofins (% de COFINS padrão)
      - cest (código CEST se aplicável)
      - obs (observações sobre tributação especial)
      
      Se NCM inválido, retorne {"erro": "NCM não encontrado"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          erro: { type: "string" },
          descricao: { type: "string" },
          unidade: { type: "string" },
          aliquota_ipi: { type: "number" },
          aliquota_pis: { type: "number" },
          aliquota_cofins: { type: "number" },
          cest: { type: "string" },
          obs: { type: "string" }
        }
      }
    });

    if (resultado.erro) {
      throw new Error(resultado.erro);
    }

    return {
      sucesso: true,
      dados: resultado
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message || 'Erro ao buscar NCM'
    };
  }
}

/**
 * Validar RNTRC de transportadora (ANTT)
 * @param {string} rntrc - Código RNTRC
 * @returns {object} Status da transportadora
 */
export async function buscarDadosRNTRC(rntrc) {
  try {
    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Valide o código RNTRC ${rntrc} no registro da ANTT (Agência Nacional de Transportes Terrestres).
      
      Retorne:
      - valido (true/false)
      - situacao (Ativo, Suspenso, Cancelado)
      - tipo_registro (ETC, TAC, CTC)
      - categoria (se disponível)
      
      Se RNTRC não encontrado, retorne {"erro": "RNTRC não encontrado"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          erro: { type: "string" },
          valido: { type: "boolean" },
          situacao: { type: "string" },
          tipo_registro: { type: "string" },
          categoria: { type: "string" }
        }
      }
    });

    if (resultado.erro) {
      throw new Error(resultado.erro);
    }

    return {
      sucesso: true,
      dados: resultado
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message || 'Erro ao validar RNTRC'
    };
  }
}

/**
 * Componente de Botão de Busca Automática V21.5
 * Integração completa com backend functions para dados reais
 */
export function BotaoBuscaAutomatica({ tipo, valor, onDadosEncontrados, disabled }) {
  const [buscando, setBuscando] = React.useState(false);
  const [resultado, setResultado] = React.useState(null);

  const funcoesBusca = {
    cnpj: buscarDadosCNPJ,
    cpf: buscarDadosCPF,
    cep: buscarEnderecoCEP,
    ncm: buscarDadosNCM,
    rntrc: buscarDadosRNTRC
  };

  const labels = {
    cnpj: '🔍 Buscar CNPJ Real',
    cpf: '✅ Validar CPF',
    cep: '📍 Buscar CEP',
    ncm: '📊 Buscar NCM',
    rntrc: '🚛 Validar RNTRC'
  };

  const handleBuscar = async () => {
    if (!valor || valor.trim() === '') {
      setResultado({ sucesso: false, erro: 'Digite um valor válido' });
      return;
    }

    setBuscando(true);
    setResultado(null);

    try {
      const funcao = funcoesBusca[tipo];
      if (!funcao) {
        throw new Error('Tipo de busca inválido');
      }

      const res = await funcao(valor);
      setResultado(res);

      if (res.sucesso && onDadosEncontrados) {
        onDadosEncontrados(res.dados);
      }
    } catch (error) {
      setResultado({ 
        sucesso: false, 
        erro: error.message || 'Erro ao buscar dados' 
      });
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={handleBuscar}
        disabled={disabled || buscando || !valor}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {buscando ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Buscando na Receita...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            {labels[tipo] || 'Buscar'}
          </>
        )}
      </Button>

      {resultado && (
        <Alert className={resultado.sucesso ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}>
          {resultado.sucesso ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <AlertDescription className="text-xs">
            {resultado.sucesso ? (
              <div className="text-green-900">
                <p className="font-semibold">✅ Dados REAIS preenchidos!</p>
                {resultado.fonte && (
                  <p className="text-[10px] opacity-70 mt-1">Fonte: {resultado.fonte}</p>
                )}
              </div>
            ) : (
              <span className="text-red-900">{resultado.erro}</span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Hook customizado para busca automática
 */
export function useBuscaAutomatica(tipo) {
  const [buscando, setBuscando] = React.useState(false);
  const [dados, setDados] = React.useState(null);
  const [erro, setErro] = React.useState(null);

  const buscar = async (valor) => {
    setBuscando(true);
    setErro(null);
    setDados(null);

    const funcoesBusca = {
      cnpj: buscarDadosCNPJ,
      cpf: buscarDadosCPF,
      cep: buscarEnderecoCEP,
      ncm: buscarDadosNCM,
      rntrc: buscarDadosRNTRC
    };

    const funcao = funcoesBusca[tipo];
    if (!funcao) {
      setErro('Tipo de busca inválido');
      setBuscando(false);
      return;
    }

    const resultado = await funcao(valor);
    
    if (resultado.sucesso) {
      setDados(resultado.dados);
    } else {
      setErro(resultado.erro);
    }

    setBuscando(false);
    return resultado;
  };

  return { buscar, buscando, dados, erro };
}

export default {
  buscarDadosCNPJ,
  buscarDadosCPF,
  buscarEnderecoCEP,
  buscarDadosNCM,
  buscarDadosRNTRC,
  BotaoBuscaAutomatica,
  useBuscaAutomatica
};