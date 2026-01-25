import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, CheckCircle2, Truck, Navigation, AlertCircle, XCircle, RotateCcw } from 'lucide-react';

/**
 * ETAPA 3: Badge de Status de Entrega com Ícone
 * Componente visual reutilizável
 */

export default function BadgeStatusEntrega({ status, size = 'default' }) {
  const config = {
    'Aguardando Separação': { cor: 'bg-slate-500', icon: Clock },
    'Em Separação': { cor: 'bg-yellow-600', icon: Package },
    'Pronto para Expedir': { cor: 'bg-blue-600', icon: CheckCircle2 },
    'Saiu para Entrega': { cor: 'bg-purple-600', icon: Truck },
    'Em Trânsito': { cor: 'bg-orange-600', icon: Navigation },
    'Entregue': { cor: 'bg-green-600', icon: CheckCircle2 },
    'Entrega Frustrada': { cor: 'bg-red-600', icon: AlertCircle },
    'Devolvido': { cor: 'bg-pink-600', icon: RotateCcw },
    'Cancelado': { cor: 'bg-slate-400', icon: XCircle }
  };

  const info = config[status] || { cor: 'bg-slate-600', icon: Truck };
  const Icon = info.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <Badge className={`${info.cor} ${sizeClasses[size]} flex items-center gap-1.5`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {status}
    </Badge>
  );
}