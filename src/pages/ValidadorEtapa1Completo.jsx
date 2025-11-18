import React from 'react';
import Etapa1ValidadorCompleto from '@/components/ETAPA1_VALIDADOR_COMPLETO';

export default function ValidadorEtapa1Completo() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto min-h-[calc(100vh-4rem)] max-w-full" style={{ width: '100%', maxWidth: '100%' }}>
      <Etapa1ValidadorCompleto />
    </div>
  );
}