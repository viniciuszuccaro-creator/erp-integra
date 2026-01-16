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
  const { data } = await base44.functions.invoke('nfeActions', { action: 'emitir', nfe });
  return data;
}

/**
 * Emitir NF-e via NFe.io
 */
async function emitirNFeNFeIO(nfe, config) {
  const { data } = await base44.functions.invoke('nfeActions', { action: 'emitir', nfe });
  return data;
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