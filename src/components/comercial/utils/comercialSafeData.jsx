export function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function isClienteAtivo(cliente) {
  const status = cliente?.status || 'Ativo';
  return status === 'Ativo' || status === 'Prospect';
}

export function isPedidoValidoParaVenda(pedido) {
  return pedido?.status !== 'Cancelado';
}