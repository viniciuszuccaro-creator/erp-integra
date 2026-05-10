import { safeArray, safeNumber, isPendingStatus, isDatePast } from "@/components/financeiro/utils/financeiroSafeData";

export default function useFinanceiroDerivedData({ contasReceber = [], contasPagar = [], extratosBancarios = [], configsGateway = [], ordensLiquidacao = [], pedidosPendentesAprovacao = [] }) {
  const contasReceberFiltradas = safeArray(contasReceber);
  const contasPagarFiltradas = safeArray(contasPagar);
  const extratos = safeArray(extratosBancarios);
  const gateways = safeArray(configsGateway);
  const ordens = safeArray(ordensLiquidacao);

  const receberPendente = contasReceberFiltradas
    .filter((c) => isPendingStatus(c?.status))
    .reduce((sum, c) => sum + safeNumber(c?.valor), 0);

  const pagarPendente = contasPagarFiltradas
    .filter((c) => isPendingStatus(c?.status))
    .reduce((sum, c) => sum + safeNumber(c?.valor), 0);

  const saldo = receberPendente - pagarPendente;

  const hoje = new Date();
  const contasReceberVencidas = contasReceberFiltradas.filter((c) => isPendingStatus(c?.status) && isDatePast(c?.data_vencimento, hoje)).length;
  const contasPagarVencidas = contasPagarFiltradas.filter((c) => isPendingStatus(c?.status) && isDatePast(c?.data_vencimento, hoje)).length;

  const titulosComBoleto = contasReceberFiltradas.filter((c) => c?.boleto_id_integracao).length;
  const titulosComPix = contasReceberFiltradas.filter((c) => c?.pix_id_integracao).length;
  const empresasComGateway = gateways.filter((c) => c?.ativo).length;

  const extratosNaoConciliados = extratos.filter((e) => !e?.conciliado).length;
  const valorNaoConciliado = extratos
    .filter((e) => !e?.conciliado)
    .reduce((sum, e) => sum + Math.abs(safeNumber(e?.valor)), 0);

  const ordensLiquidacaoPendentes = ordens.filter((o) => isPendingStatus(o?.status_ordem)).length;
  const totalPendentesAprovacao = safeArray(pedidosPendentesAprovacao).length;

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