import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * V22.0 ETAPA 3 - Card Interativo para Dashboards
 * 
 * Permite navegação direta por clique
 * Suporta drill-down em dados
 * Feedback visual de hover
 */
export function InteractiveCard({
  children,
  title,
  description,
  onClick,
  href,
  icon: Icon,
  value,
  label,
  trend,
  trendValue,
  className = '',
  interactive = true,
  variant = 'default',
  ...props
}) {
  const isClickable = !!(onClick || href);

  const variants = {
    default: 'bg-white border-slate-200',
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600',
    success: 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600',
    warning: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-600',
    cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-cyan-600'
  };

  const content = (
    <Card
      className={cn(
        'w-full transition-all duration-200',
        isClickable && interactive && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        variants[variant],
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardContent className="p-4">
        {title && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5" />}
              <div>
                <h3 className="font-semibold text-sm">{title}</h3>
                {description && (
                  <p className={cn(
                    'text-xs mt-0.5',
                    variant === 'default' ? 'text-slate-500' : 'text-white/80'
                  )}>
                    {description}
                  </p>
                )}
              </div>
            </div>
            {isClickable && (
              <ChevronRight className="w-5 h-5 opacity-60" />
            )}
          </div>
        )}

        {value !== undefined && (
          <div className="space-y-1">
            <p className="text-3xl font-bold">{value}</p>
            {label && (
              <p className={cn(
                'text-xs',
                variant === 'default' ? 'text-slate-500' : 'text-white/80'
              )}>
                {label}
              </p>
            )}
          </div>
        )}

        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span className={cn(
              'text-xs font-medium',
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'
            )}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
            </span>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href} className="block w-full">{content}</Link>;
  }

  return content;
}

/**
 * Grid de Cards Interativos
 */
export function InteractiveCardGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = ''
}) {
  return (
    <div className={cn(
      'w-full grid gap-4',
      `grid-cols-${cols.sm}`,
      `md:grid-cols-${cols.md}`,
      `lg:grid-cols-${cols.lg}`,
      `xl:grid-cols-${cols.xl}`,
      className
    )}>
      {children}
    </div>
  );
}