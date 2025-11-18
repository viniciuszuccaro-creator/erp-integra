
import PedidoFormCompleto from '@/components/comercial/PedidoFormCompleto';
import CadastroClienteCompleto from '@/components/cadastros/CadastroClienteCompleto';
import CadastroFornecedorCompleto from '@/components/cadastros/CadastroFornecedorCompleto';
import ProdutoFormV22_Completo from '@/components/cadastros/ProdutoFormV22_Completo';

/**
 * REGISTRO CENTRAL DE COMPONENTES PARA JANELAS MULTITAREFA
 * V21.1 - Sistema Universal de Janelas
 * 
 * TODOS os formulários e detalhes do sistema devem estar aqui
 * para permitir abertura em janelas multitarefa
 */
export const WINDOW_COMPONENTS = {
  // COMPONENTES LEGADOS
  PedidoFormCompleto,
  CadastroClienteCompleto,
  CadastroFornecedorCompleto,
  ProdutoFormV22_Completo,
  
  // MAPEAMENTO POR MÓDULO/AÇÃO
  'comercial/pedido': PedidoFormCompleto,
  'comercial/cliente': CadastroClienteCompleto,
  'comercial/orcamento': PedidoFormCompleto,
  
  'cadastros/cliente': CadastroClienteCompleto,
  'cadastros/fornecedor': CadastroFornecedorCompleto,
  'cadastros/produto': ProdutoFormV22_Completo,
  'cadastros/colaborador': CadastroClienteCompleto, // Placeholder
  
  'financeiro/conta-receber': CadastroClienteCompleto, // Placeholder
  'financeiro/conta-pagar': CadastroClienteCompleto, // Placeholder
  
  'expedicao/entrega': CadastroClienteCompleto, // Placeholder
  'expedicao/romaneio': CadastroClienteCompleto, // Placeholder
  
  'producao/ordem': CadastroClienteCompleto, // Placeholder
  
  'fiscal/nota': CadastroClienteCompleto, // Placeholder
  
  'crm/oportunidade': CadastroClienteCompleto, // Placeholder
  
  'contratos/contrato': CadastroClienteCompleto, // Placeholder
};

export default WINDOW_COMPONENTS;
