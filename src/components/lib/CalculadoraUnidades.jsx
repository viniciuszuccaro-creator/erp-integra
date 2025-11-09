
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertTriangle } from "lucide-react";

/**
 * V22.0: CALCULADORA UNIVERSAL DE CONVERSÃO DE UNIDADES
 * Componente helper usado em TODOS os módulos operacionais
 * 
 * USO:
 * import { converterUnidade, exibirEquivalente } from '@/components/lib/CalculadoraUnidades';
 */

/**
 * Converte quantidade de uma unidade para outra usando os fatores do produto
 * @param {number} quantidade - Quantidade a converter
 * @param {string} unidadeOrigem - Unidade de origem (PÇ, KG, MT, TON)
 * @param {string} unidadeDestino - Unidade de destino
 * @param {object} produto - Objeto produto com fatores_conversao
 * @returns {number} Quantidade convertida
 */
export function converterUnidade(quantidade, unidadeOrigem, unidadeDestino, produto) {
  if (unidadeOrigem === unidadeDestino) return quantidade;
  
  const fatores = produto.fatores_conversao || {};
  
  // Primeira etapa: converter origem → KG (base universal)
  let quantidadeKG = quantidade;
  
  switch(unidadeOrigem) {
    case 'PÇ':
    case 'PEÇA':
      quantidadeKG = quantidade * (fatores.kg_por_peca || 0);
      break;
    case 'MT':
    case 'METRO':
      quantidadeKG = quantidade * (fatores.kg_por_metro || produto.peso_teorico_kg_m || 0);
      break;
    case 'TON':
      quantidadeKG = quantidade * 1000;
      break;
    case 'BARRA':
      quantidadeKG = quantidade * (fatores.kg_por_peca || 0); // BARRA = PÇ
      break;
    case 'KG':
      quantidadeKG = quantidade;
      break;
    default:
      quantidadeKG = quantidade;
  }
  
  // Segunda etapa: converter KG → destino
  let resultado = quantidadeKG;
  
  switch(unidadeDestino) {
    case 'PÇ':
    case 'PEÇA':
      resultado = fatores.kg_por_peca > 0 ? quantidadeKG / fatores.kg_por_peca : 0;
      break;
    case 'MT':
    case 'METRO':
      const kgPorMetro = fatores.kg_por_metro || produto.peso_teorico_kg_m || 0;
      resultado = kgPorMetro > 0 ? quantidadeKG / kgPorMetro : 0;
      break;
    case 'TON':
      resultado = quantidadeKG / 1000;
      break;
    case 'BARRA':
      resultado = fatores.kg_por_peca > 0 ? quantidadeKG / fatores.kg_por_peca : 0;
      break;
    case 'KG':
      resultado = quantidadeKG;
      break;
    default:
      resultado = quantidadeKG;
  }
  
  return resultado;
}

/**
 * Converte qualquer quantidade para KG (base do estoque)
 * @param {number} quantidade
 * @param {string} unidade
 * @param {object} produto
 * @returns {number} Quantidade em KG
 */
export function converterParaKG(quantidade, unidade, produto) {
  return converterUnidade(quantidade, unidade, 'KG', produto);
}

/**
 * Exibe equivalente em KG ao lado da quantidade vendida
 * Usado em PDFs, NF-e, Pedidos
 */
export function ExibirEquivalenteKG({ quantidade, unidade, produto, className = "" }) {
  if (unidade === 'KG') return null;
  
  const equivalenteKG = converterParaKG(quantidade, unidade, produto);
  
  if (equivalenteKG === 0) return null;
  
  return (
    <Badge variant="outline" className={`text-xs bg-slate-100 ${className}`}>
      ≈ {equivalenteKG.toFixed(2)} KG
    </Badge>
  );
}

/**
 * Componente de Preview de Conversão (usado em formulários)
 */
export function PreviewConversao({ quantidade, unidadeOrigem, produto }) {
  if (!quantidade || quantidade === 0) return null;
  
  const conversoes = {
    KG: converterUnidade(quantidade, unidadeOrigem, 'KG', produto),
    MT: converterUnidade(quantidade, unidadeOrigem, 'MT', produto),
    PÇ: converterUnidade(quantidade, unidadeOrigem, 'PÇ', produto),
  };

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-2">
      <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
        <Calculator className="w-3 h-3" />
        Equivalências:
      </p>
      <div className="grid grid-cols-3 gap-2 text-xs text-blue-800">
        {conversoes.KG > 0 && unidadeOrigem !== 'KG' && (
          <p>• <strong>{conversoes.KG.toFixed(2)} KG</strong></p>
        )}
        {conversoes.MT > 0 && unidadeOrigem !== 'MT' && (
          <p>• <strong>{conversoes.MT.toFixed(2)} MT</strong></p>
        )}
        {conversoes.PÇ > 0 && unidadeOrigem !== 'PÇ' && (
          <p>• <strong>{conversoes.PÇ.toFixed(0)} PÇ</strong></p>
        )}
      </div>
    </div>
  );
}

/**
 * Validar se uma conversão é possível
 */
export function validarConversao(produto, unidade) {
  const unidadesHabilitadas = produto.unidades_secundarias || [];
  
  if (!unidadesHabilitadas.includes(unidade)) {
    return {
      valido: false,
      mensagem: `Unidade ${unidade} não habilitada para este produto. Use: ${unidadesHabilitadas.join(', ')}`
    };
  }

  if (produto.eh_bitola && unidade !== 'KG' && unidade !== 'PÇ' && unidade !== 'MT') {
    return {
      valido: false,
      mensagem: 'Bitolas só aceitam PÇ, KG ou MT'
    };
  }

  if (produto.eh_bitola && !produto.peso_teorico_kg_m) {
    return {
      valido: false,
      mensagem: 'Produto sem peso teórico configurado - impossível converter'
    };
  }

  return { valido: true };
}

/**
 * Gerar opções de dropdown de unidades para formulários
 * @param {object} produto
 * @returns {array} Lista de opções [{value, label}]
 */
export function gerarOpcoesUnidades(produto) {
  const unidadesHabilitadas = produto.unidades_secundarias || ['UN'];
  
  const mapeamento = {
    'UN': 'Unidade',
    'PÇ': 'Peça',
    'KG': 'Quilograma',
    'MT': 'Metro',
    'TON': 'Tonelada',
    'CX': 'Caixa',
    'BARRA': 'Barra',
    'LT': 'Litro'
  };

  return unidadesHabilitadas.map(u => ({
    value: u,
    label: `${u} - ${mapeamento[u] || u}`
  }));
}

/**
 * Calcular peso total em KG para NF-e
 * (Sempre necessário mesmo que venda seja em PÇ ou MT)
 */
export function calcularPesoTotalNFe(itens) {
  let pesoTotal = 0;
  
  itens.forEach(item => {
    const pesoKG = converterParaKG(
      item.quantidade, 
      item.unidade, 
      item.produto || { fatores_conversao: item.fatores_conversao, peso_teorico_kg_m: item.peso_teorico_kg_m }
    );
    pesoTotal += pesoKG;
  });
  
  return pesoTotal;
}

/**
 * Componente de Alerta se conversão inválida
 */
export function AlertaConversaoInvalida({ produto, unidade }) {
  const validacao = validarConversao(produto, unidade);
  
  if (validacao.valido) return null;
  
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-900">Conversão Inválida</p>
        <p className="text-xs text-red-700">{validacao.mensagem}</p>
      </div>
    </div>
  );
}

export default {
  converterUnidade,
  converterParaKG,
  ExibirEquivalenteKG,
  PreviewConversao,
  validarConversao,
  gerarOpcoesUnidades,
  calcularPesoTotalNFe,
  AlertaConversaoInvalida
};
