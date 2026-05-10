export const PEDIDO_ITEM_COLLECTIONS = [
  'itens',
  'itens_revenda',
  'itens_armado_padrao',
  'itens_corte_dobra'
];

export function getPedidoItens(pedido) {
  if (!pedido || typeof pedido !== 'object') return [];

  return PEDIDO_ITEM_COLLECTIONS.flatMap((field) => {
    const items = pedido[field];
    return Array.isArray(items) ? items : [];
  });
}