import React from 'react';
import LimparDadosTeste from '@/components/sistema/LimparDadosTeste';

export default function LimparDados() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[calc(100vh-4rem)]"> {/* ETAPA 1: w-full + responsivo */}
      <LimparDadosTeste />
    </div>
  );
}