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
  try {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    
    if (cnpjLimpo.length !== 14) {
      throw new Error('CNPJ inválido');
    }

    // Usar IA com contexto da internet (Receita Federal + fontes públicas)
    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Busque os dados oficiais da empresa com CNPJ ${cnpjLimpo} na Receita Federal do Brasil.
      
      Retorne EXATAMENTE as seguintes informações:
      - razao_social (nome completo oficial)
      - nome_fantasia (se houver)
      - situacao_cadastral (Ativa, Suspensa, Inapta, Baixada)
      - data_abertura (formato YYYY-MM-DD)
      - porte (MEI, ME, EPP, Grande)
      - natureza_juridica
      - cnae_principal (código + descrição)
      - endereco_completo (objeto com logradouro, numero, complemento, bairro, cidade, uf, cep)
      - telefone (se disponível)
      - email (se disponível)
      - capital_social (valor numérico)
      - socios (array com nome e qualificacao se disponível)
      
      Se a empresa não for encontrada ou CNPJ inválido, retorne {"erro": "Empresa não encontrada"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          erro: { type: "string" },
          razao_social: { type: "string" },
          nome_fantasia: { type: "string" },
          situacao_cadastral: { type: "string" },
          data_abertura: { type: "string" },
          porte: { type: "string" },
          natureza_juridica: { type: "string" },
          cnae_principal: { type: "string" },
          endereco_completo: {
            type: "object",
            properties: {
              logradouro: { type: "string" },
              numero: { type: "string" },
              complemento: { type: "string" },
              bairro: { type: "string" },
              cidade: { type: "string" },
              uf: { type: "string" },
              cep: { type: "string" }
            }
          },
          telefone: { type: "string" },
          email: { type: "string" },
          capital_social: { type: "number" },
          socios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                nome: { type: "string" },
                qualificacao: { type: "string" }
              }
            }
          }
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
      erro: error.message || 'Erro ao buscar CNPJ'
    };
  }
}

/**
 * Buscar dados de CPF via IA (apenas validação + nome se público)
 * @param {string} cpf - CPF formatado ou não
 * @returns {object} Status do CPF
 */
export async function buscarDadosCPF(cpf) {
  try {
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) {
      throw new Error('CPF inválido');
    }

    // IA apenas valida e retorna status público (sem dados sensíveis)
    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Valide se o CPF ${cpfLimpo} é um número válido usando o algoritmo de verificação de dígitos.
      
      Retorne apenas:
      - valido (true/false)
      - formatado (formato XXX.XXX.XXX-XX)
      
      NÃO busque dados pessoais (protegidos por LGPD).`,
      response_json_schema: {
        type: "object",
        properties: {
          valido: { type: "boolean" },
          formatado: { type: "string" }
        }
      }
    });

    return {
      sucesso: true,
      dados: resultado
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message || 'Erro ao validar CPF'
    };
  }
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
      throw new Error('CEP inválido');
    }

    // Buscar via IA (usa ViaCEP + Google Maps automaticamente)
    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Busque o endereço completo do CEP ${cepLimpo} no Brasil usando ViaCEP ou fontes oficiais dos Correios.
      
      Retorne:
      - logradouro (rua/avenida)
      - bairro
      - cidade (localidade)
      - uf (estado sigla)
      - latitude (coordenadas GPS)
      - longitude (coordenadas GPS)
      - ddd
      
      Se CEP não encontrado, retorne {"erro": "CEP não encontrado"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          erro: { type: "string" },
          logradouro: { type: "string" },
          bairro: { type: "string" },
          cidade: { type: "string" },
          uf: { type: "string" },
          latitude: { type: "number" },
          longitude: { type: "number" },
          ddd: { type: "string" }
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
 * Componente de Botão de Busca Automática
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
    cnpj: 'Buscar CNPJ',
    cpf: 'Validar CPF',
    cep: 'Buscar CEP',
    ncm: 'Buscar NCM',
    rntrc: 'Validar RNTRC'
  };

  const handleBuscar = async () => {
    if (!valor || valor.trim() === '') {
      setResultado({ sucesso: false, erro: 'Digite um valor válido' });
      return;
    }

    setBuscando(true);
    setResultado(null);

    const funcao = funcoesBusca[tipo];
    if (!funcao) {
      setResultado({ sucesso: false, erro: 'Tipo de busca inválido' });
      setBuscando(false);
      return;
    }

    const res = await funcao(valor);
    setResultado(res);
    setBuscando(false);

    if (res.sucesso && onDadosEncontrados) {
      onDadosEncontrados(res.dados);
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
            Buscando...
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
              <span className="text-green-900 font-semibold">✅ Dados encontrados e preenchidos!</span>
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