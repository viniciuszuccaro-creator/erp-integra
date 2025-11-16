import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWindow } from '@/components/lib/useWindow';

/**
 * V21.0 - BOTÃO UNIVERSAL PARA ABRIR JANELAS
 * ✅ Reutilizável em qualquer página
 * ✅ Visual consistente
 * ✅ Feedback de multitarefa ativa
 */
export default function BotaoNovaJanela({ 
  tipo, 
  label, 
  item = null,
  variant = "default",
  size = "default",
  className = ""
}) {
  const window = useWindow();

  const handleClick = () => {
    switch(tipo) {
      case 'produto':
        window.openProductWindow(item);
        break;
      case 'pedido':
        window.openPedidoWindow(item);
        break;
      case 'cliente':
        window.openClienteWindow(item);
        break;
      case 'tabela-preco':
        window.openTabelaPrecoWindow(item);
        break;
      case 'fornecedor':
        window.openFornecedorWindow(item);
        break;
      case 'nfe':
        window.openNFeWindow(item);
        break;
      default:
        console.warn('Tipo de janela não reconhecido:', tipo);
    }
  };

  return (
    <Button 
      onClick={handleClick} 
      variant={variant}
      size={size}
      className={`relative ${className}`}
    >
      <Maximize2 className="w-4 h-4 mr-2" />
      {label || (item ? 'Editar' : 'Novo')}
      <Badge className="ml-2 bg-purple-600 text-white text-xs">
        V21.0
      </Badge>
    </Button>
  );
}