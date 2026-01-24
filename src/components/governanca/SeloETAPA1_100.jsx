import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2 } from 'lucide-react';

/**
 * SELO ETAPA 1 100% - BADGE COMPACTO
 * Badge visual para qualquer lugar do sistema
 */

export default function SeloETAPA1_100({ size = 'md', showIcon = true }) {
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge className={`bg-gradient-to-r from-green-600 to-emerald-600 text-white ${sizes[size]} shadow-lg hover:shadow-xl transition-all`}>
      {showIcon && <Award className={`${iconSizes[size]} mr-1.5`} />}
      ETAPA 1 — 100%
      <CheckCircle2 className={`${iconSizes[size]} ml-1.5`} />
    </Badge>
  );
}