import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Package, Users, DollarSign, ShoppingCart, Building2, Truck } from "lucide-react";
import { useWindow } from "@/components/lib/useWindow";

/**
 * V21.0 - BOTÃO UNIVERSAL PARA ABRIR JANELAS
 * ✅ Reutilizável
 * ✅ Visual consistente
 * ✅ Feedback multitarefa
 */
export default function BotaoNovaJanela({ 
  tipo, 
  label, 
  variant = "default", 
  size = "default",
  data = null 
}) {
  const {
    openProductWindow,
    openPedidoWindow,
    openClienteWindow,
    openFornecedorWindow,
    openTabelaPrecoWindow,
    openColaboradorWindow,
    openTransportadoraWindow,
    openCentroCustoWindow,
    openBancoWindow,
    openFormaPagamentoWindow,
    openVeiculoWindow,
    openEmpresaWindow,
    openGrupoWindow,
    openUsuarioWindow,
    openPerfilAcessoWindow,
    openServicoWindow
  } = useWindow();

  const handleClick = () => {
    switch(tipo) {
      case 'produto':
        openProductWindow(data);
        break;
      case 'pedido':
        openPedidoWindow(data);
        break;
      case 'cliente':
        openClienteWindow(data);
        break;
      case 'fornecedor':
        openFornecedorWindow(data);
        break;
      case 'tabela-preco':
        openTabelaPrecoWindow(data);
        break;
      case 'colaborador':
        openColaboradorWindow(data);
        break;
      case 'transportadora':
        openTransportadoraWindow(data);
        break;
      case 'centro-custo':
        openCentroCustoWindow(data);
        break;
      case 'banco':
        openBancoWindow(data);
        break;
      case 'forma-pagamento':
        openFormaPagamentoWindow(data);
        break;
      case 'veiculo':
        openVeiculoWindow(data);
        break;
      case 'empresa':
        openEmpresaWindow(data);
        break;
      case 'grupo':
        openGrupoWindow(data);
        break;
      case 'usuario':
        openUsuarioWindow(data);
        break;
      case 'perfil':
        openPerfilAcessoWindow(data);
        break;
      case 'servico':
        openServicoWindow(data);
        break;
      default:
        console.warn(`Tipo de janela não implementado: ${tipo}`);
    }
  };

  const getIcon = () => {
    const icons = {
      'produto': Package,
      'pedido': ShoppingCart,
      'cliente': Users,
      'fornecedor': Building2,
      'tabela-preco': DollarSign,
      'transportadora': Truck
    };
    return icons[tipo] || Maximize2;
  };

  const Icon = getIcon();

  return (
    <Button variant={variant} size={size} onClick={handleClick}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
      <Badge className="ml-2 bg-purple-600 text-white text-[10px] px-1.5 py-0">
        V21
      </Badge>
    </Button>
  );
}