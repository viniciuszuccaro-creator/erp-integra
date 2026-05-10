import { safeArray, safeNumber, getProdutoEstoqueDisponivel } from "@/components/estoque/utils/estoqueSafeData";

export default function useEstoqueDerivedData({ movimentacoes = [], produtos = [] }) {
  const listaProdutos = safeArray(produtos);
  const listaMovimentacoes = safeArray(movimentacoes);
  const totalReservado = listaProdutos.reduce((sum, p) => sum + (safeNumber(p?.estoque_reservado) * safeNumber(p?.custo_aquisicao || p?.custo_medio)), 0);
  const estoqueDisponivel = listaProdutos.reduce((sum, p) => {
    return sum + (getProdutoEstoqueDisponivel(p) * safeNumber(p?.custo_aquisicao || p?.custo_medio));
  }, 0);
  const recebimentos = listaMovimentacoes.filter((m) => m?.tipo_movimento === 'entrada' && (m?.origem_movimento === 'compra' || String(m?.documento || '').startsWith('REC-')));
  const requisicoesAlmoxarifado = listaMovimentacoes.filter((m) => m?.tipo_movimento === 'saida' && String(m?.documento || '').startsWith('REQ-ALM-'));

  return { totalReservado, estoqueDisponivel, recebimentos, requisicoesAlmoxarifado };
}