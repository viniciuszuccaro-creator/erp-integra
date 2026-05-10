import { safeArray, safeNumber, isClienteAtivo, isPedidoValidoParaVenda } from "@/components/comercial/utils/comercialSafeData";

const STATUS_ENTREGA = ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'];
const STATUS_RETIRADA = ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Pronto para Retirada'];

export default function useComercialDerivedData({ pedidos = [], clientes = [], pedidosExternos = [] }) {
  const listaPedidos = safeArray(pedidos);
  const listaClientes = safeArray(clientes);
  const listaPedidosExternos = safeArray(pedidosExternos);
  const pedidosExternosPendentes = listaPedidosExternos.filter((p) => p?.status_importacao === 'A Validar').length;
  const pedidosValidos = listaPedidos.filter((p) => isPedidoValidoParaVenda(p));
  const totalVendas = pedidosValidos.reduce((sum, p) => sum + safeNumber(p?.valor_total), 0);
  const ticketMedio = pedidosValidos.length > 0 ? totalVendas / pedidosValidos.length : 0;
  const clientesAtivos = listaClientes.filter((c) => isClienteAtivo(c)).length;
  const pedidosPendentesAprovacao = listaPedidos.filter((p) => p?.status_aprovacao === 'pendente').length;
  const pedidosEntrega = listaPedidos.filter((p) => (p?.tipo_frete === 'CIF' || p?.tipo_frete === 'FOB') && STATUS_ENTREGA.includes(p?.status)).length;
  const pedidosRetirada = listaPedidos.filter((p) => p?.tipo_frete === 'Retirada' && STATUS_RETIRADA.includes(p?.status)).length;

  return {
    pedidosExternosPendentes,
    totalVendas,
    ticketMedio,
    clientesAtivos,
    pedidosPendentesAprovacao,
    pedidosEntrega,
    pedidosRetirada,
  };
}