export function isIdentificacaoValida(formData) {
  if (!formData) return false;
  return !!(
    formData.cliente_id &&
    formData.cliente_nome &&
    formData.data_pedido &&
    formData.numero_pedido
  );
}

export function hasItens(formData) {
  if (!formData) return false;
  return (
    (formData.itens_revenda?.length > 0) ||
    (formData.itens_armado_padrao?.length > 0) ||
    (formData.itens_corte_dobra?.length > 0)
  );
}