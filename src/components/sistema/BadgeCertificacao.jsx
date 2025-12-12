import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle2, Zap, Sparkles } from 'lucide-react';

/**
 * 🏆 BADGE DE CERTIFICAÇÃO V21.6
 * Componente reutilizável para mostrar status de certificação
 */
export function BadgeCertificacao({ tipo = 'completo', size = 'md', animated = true }) {
  const configs = {
    completo: {
      icon: CheckCircle2,
      text: '100% Completo',
      gradient: 'from-green-600 to-emerald-600'
    },
    automacao: {
      icon: Zap,
      text: 'Automação 10s',
      gradient: 'from-orange-600 to-red-600'
    },
    ia: {
      icon: Sparkles,
      text: '28 IAs',
      gradient: 'from-purple-600 to-pink-600'
    },
    certificado: {
      icon: Trophy,
      text: 'Certificado',
      gradient: 'from-yellow-600 to-orange-600'
    }
  };

  const config = configs[tipo] || configs.completo;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <Badge 
      className={`bg-gradient-to-r ${config.gradient} text-white ${sizeClasses[size]} ${animated ? 'animate-pulse' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-1`} />
      {config.text}
    </Badge>
  );
}

export default BadgeCertificacao;