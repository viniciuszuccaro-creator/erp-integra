export default function useFinanceiroDerivedData({ contasReceber = [], contasPagar = [], extratosBancarios = [], configsGateway = [], ordensLiquidacao = [], pedidosPendentesAprovacao = [] }) {
  const contasReceberFiltradas = contasReceber;
  const contasPagarFiltradas = contasPagar;

  const receberPendente = contasReceberFiltradas
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const pagarPendente = contasPagarFiltradas
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const saldo = receberPendente - pagarPendente;

  const hoje = new Date();
  const contasReceberVencidas = contasReceberFiltradas.filter(c => c.status === 'Pendente' && new Date(c.data_vencimento) < hoje).length;
  const contasPagarVencidas = contasPagarFiltradas.filter(c => c.status === 'Pendente' && new Date(c.data_vencimento) < hoje).length;

  const titulosComBoleto = contasReceberFiltradas.filter(c => c.boleto_id_integracao).length;
  const titulosComPix = contasReceberFiltradas.filter(c => c.pix_id_integracao).length;
  const empresasComGateway = configsGateway.filter(c => c.ativo).length;

  const extratosNaoConciliados = extratosBancarios.filter(e => !e.conciliado).length;
  const valorNaoConciliado = extratosBancarios
    .filter(e => !e.conciliado)
    .reduce((sum, e) => sum + Math.abs(e.valor || 0), 0);

  const ordensLiquidacaoPendentes = ordensLiquidacao.filter(o => o.status_ordem === 'Pendente').length;
  const totalPendentesAprovacao = pedidosPendentesAprovacao.length;

  return {
    receberPendente,
    pagarPendente,
    saldo,
    contasReceberVencidas,
    contasPagarVencidas,
    titulosComBoleto,
    titulosComPix,
    empresasComGateway,
    extratosNaoConciliados,
    valorNaoConciliado,
    ordensLiquidacaoPendentes,
    totalPendentesAprovacao,
  };
}