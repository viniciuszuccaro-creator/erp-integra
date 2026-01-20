import React from 'react';
import { InteractiveCard, InteractiveCardGrid } from '@/components/ui/interactive-card';
import { createPageUrl } from '@/utils';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

/**
 * V22.0 ETAPA 3 - Métricas Interativas Reutilizáveis
 * 
 * Cards padrão para dashboards com navegação
 */
export function MetricaClicavel({ 
  tipo, 
  valor, 
  label, 
  trend, 
  trendValue, 
  onClick,
  href 
}) {
  const configs = {
    pedidos: {
      title: 'Pedidos',
      icon: ShoppingCart,
      variant: 'primary',
      href: href || createPageUrl('Comercial')
    },
    faturamento: {
      title: 'Faturamento',
      icon: DollarSign,
      variant: 'success',
      href: href || createPageUrl('Financeiro')
    },
    estoque: {
      title: 'Estoque Crítico',
      icon: Package,
      variant: 'warning',
      href: href || createPageUrl('Estoque')
    },
    entregas: {
      title: 'Entregas',
      icon: Truck,
      variant: 'cyan',
      href: href || createPageUrl('Expedicao')
    },
    clientes: {
      title: 'Clientes',
      icon: Users,
      variant: 'purple',
      href: href || createPageUrl('CRM')
    }
  };

  const config = configs[tipo] || {};

  return (
    <InteractiveCard
      title={config.title}
      value={valor}
      label={label}
      icon={config.icon}
      variant={config.variant}
      trend={trend}
      trendValue={trendValue}
      onClick={onClick}
      href={onClick ? undefined : config.href}
    />
  );
}

/**
 * Grid de Métricas Padrão
 */
export function GridMetricas({ metricas, cols }) {
  return (
    <InteractiveCardGrid cols={cols || { sm: 1, md: 2, lg: 3, xl: 4 }}>
      {metricas.map((metrica, idx) => (
        <MetricaClicavel key={idx} {...metrica} />
      ))}
    </InteractiveCardGrid>
  );
}