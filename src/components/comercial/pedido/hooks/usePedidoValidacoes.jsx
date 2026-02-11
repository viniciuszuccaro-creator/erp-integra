import { useEffect } from 'react';
import { isIdentificacaoValida, hasItens } from '../utils/validatePedidoSections';

export default function usePedidoValidacoes(formData, setValidacoes) {
  // Identificação
  useEffect(() => {
    if (!formData) return;
    const valido = isIdentificacaoValida(formData);
    setValidacoes(prev => ({ ...prev, identificacao: valido }));
  }, [formData?.cliente_id, formData?.cliente_nome, formData?.data_pedido, formData?.numero_pedido]);

  // Itens
  useEffect(() => {
    if (!formData) return;
    const tem = hasItens(formData);
    setValidacoes(prev => ({ ...prev, itens: tem }));
  }, [formData?.itens_revenda?.length, formData?.itens_armado_padrao?.length, formData?.itens_corte_dobra?.length]);
}