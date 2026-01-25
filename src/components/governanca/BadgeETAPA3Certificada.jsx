import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle2 } from 'lucide-react';

/**
 * ETAPA 3: Badge de Certificação
 * Selo visual para exibir em dashboards
 */

export default function BadgeETAPA3Certificada({ variant = 'full' }) {
  if (variant === 'compact') {
    return (
      <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1">
        <Award className="w-3 h-3 mr-1" />
        ETAPA 3 ✓
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
        <CheckCircle2 className="w-3 h-3" />
        ETAPA 3 Certificada
      </span>
    );
  }

  // variant === 'full'
  return (
    <div className="inline-block">
      <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg px-6 py-2 shadow-lg">
        <Award className="w-5 h-5 mr-2" />
        ETAPA 3 — 100% CERTIFICADA
      </Badge>
    </div>
  );
}