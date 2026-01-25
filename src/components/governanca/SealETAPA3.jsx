import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

/**
 * ETAPA 3: Selo de Certificação
 * Componente visual de aprovação
 */

export default function SealETAPA3({ size = 'md' }) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className="relative inline-block">
      <div className={`${sizes[size]} bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse`}>
        <div className="absolute inset-0 bg-white rounded-full opacity-20"></div>
        <Award className="w-1/2 h-1/2 text-white relative z-10" />
      </div>
      <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-1 shadow-lg">
        <CheckCircle2 className="w-6 h-6 text-white" />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
          100%
        </span>
      </div>
    </div>
  );
}