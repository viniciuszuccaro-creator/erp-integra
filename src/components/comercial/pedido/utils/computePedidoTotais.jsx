export function computePedidoTotais(formData) {
  if (!formData) return { valor_produtos: 0, valor_total: 0, peso_total_kg: 0 };

  const valorRevenda = (formData.itens_revenda || []).reduce((sum, item) => sum + (item.valor_item || 0), 0);
  const valorArmado = (formData.itens_armado_padrao || []).reduce((sum, item) => sum + (item.preco_venda_total || 0), 0);
  const valorCorte = (formData.itens_corte_dobra || []).reduce((sum, item) => sum + (item.preco_venda_total || 0), 0);

  const valor_produtos = valorRevenda + valorArmado + valorCorte;
  const valorDesconto = formData.desconto_geral_pedido_valor || 0;
  const valorFrete = formData.valor_frete || 0;
  const valor_total = valor_produtos - valorDesconto + valorFrete;

  const pesoRevenda = (formData.itens_revenda || []).reduce((sum, item) => sum + ((item.peso_unitario || 0) * (item.quantidade || 0)), 0);
  const pesoArmado = (formData.itens_armado_padrao || []).reduce((sum, item) => sum + (item.peso_total_kg || 0), 0);
  const pesoCorte = (formData.itens_corte_dobra || []).reduce((sum, item) => sum + (item.peso_total_kg || 0), 0);

  const peso_total_kg = pesoRevenda + pesoArmado + pesoCorte;
  return { valor_produtos, valor_total, peso_total_kg };
}