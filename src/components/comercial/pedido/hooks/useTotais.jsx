import { useEffect } from 'react';
import { computePedidoTotais } from '../utils/computePedidoTotais';

export default function useTotais(formData, setFormData) {
  useEffect(() => {
    if (!formData) return;
    const { valor_produtos, valor_total, peso_total_kg } = computePedidoTotais(formData);
    setFormData(prev => ({
      ...prev,
      valor_produtos,
      valor_total,
      peso_total_kg,
    }));
  }, [
    formData?.itens_revenda,
    formData?.itens_armado_padrao,
    formData?.itens_corte_dobra,
    formData?.desconto_geral_pedido_valor,
    formData?.valor_frete,
  ]);
}