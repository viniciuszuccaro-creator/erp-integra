export default function useEstoqueDerivedData({ movimentacoes = [], produtos = [] }) {
  const totalReservado = produtos.reduce((sum, p) => sum + ((p.estoque_reservado || 0) * (p.custo_aquisicao || 0)), 0);
  const estoqueDisponivel = produtos.reduce((sum, p) => {
    const disp = (p.estoque_atual || 0) - (p.estoque_reservado || 0);
    return sum + (disp * (p.custo_aquisicao || 0));
  }, 0);
  const recebimentos = movimentacoes.filter(m => m.tipo_movimento === 'entrada' && (m.origem_movimento === 'compra' || m.documento?.startsWith('REC-')));
  const requisicoesAlmoxarifado = movimentacoes.filter(m => m.tipo_movimento === 'saida' && m.documento?.startsWith('REQ-ALM-'));

  return { totalReservado, estoqueDisponivel, recebimentos, requisicoesAlmoxarifado };
}