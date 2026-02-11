export default function useComercialDerivedData({ pedidos = [], clientes = [], pedidosExternos = [] }) {
  const pedidosExternosPendentes = pedidosExternos.filter(p => p.status_importacao === 'A Validar').length;
  const pedidosFiltrados = pedidos;
  const totalVendas = pedidosFiltrados.filter(p => p.status !== 'Cancelado').reduce((sum, p) => sum + (p.valor_total || 0), 0);
  const ticketMedio = pedidosFiltrados.length > 0 ? totalVendas / pedidosFiltrados.length : 0;
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
  const pedidosPendentesAprovacao = pedidosFiltrados.filter(p => p.status_aprovacao === 'pendente').length;
  const pedidosEntrega = pedidosFiltrados.filter(p => (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') && ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)).length;
  const pedidosRetirada = pedidosFiltrados.filter(p => p.tipo_frete === 'Retirada' && ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Pronto para Retirada'].includes(p.status)).length;

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