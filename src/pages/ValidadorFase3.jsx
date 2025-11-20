import React from 'react';
import ValidadorFase3Component from '../components/sistema/ValidadorFase3';

export default function ValidadorFase3() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Validador FASE 3</h1>
        <p className="text-slate-600 mt-2">Validação completa dos Cadastros Gerais - Hub de Dados Mestre</p>
      </div>
      
      <ValidadorFase3Component />
    </div>
  );
}