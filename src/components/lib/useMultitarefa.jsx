import React, { createContext, useContext, useState } from 'react';

/**
 * V21.1.2 - SISTEMA MULTITAREFA
 * Usando React Context (sem zustand)
 */
const MultitarefaContext = createContext(null);

export function MultitarefaProvider({ children }) {
  const [janelas, setJanelas] = useState([]);

  const abrirJanela = (janela) => {
    setJanelas((prev) => {
      const jaAberta = prev.find(j => j.id === janela.id);
      if (jaAberta) {
        return prev.map(j => ({ ...j, ativa: j.id === janela.id }));
      }
      return [
        ...prev.map(j => ({ ...j, ativa: false })),
        { ...janela, ativa: true, minimizada: false }
      ];
    });
  };

  const fecharJanela = (id) => {
    setJanelas(prev => prev.filter(j => j.id !== id));
  };

  const ativarJanela = (id) => {
    setJanelas(prev => prev.map(j => ({ ...j, ativa: j.id === id })));
  };

  const minimizarJanela = (id) => {
    setJanelas(prev => prev.map(j => 
      j.id === id ? { ...j, minimizada: !j.minimizada } : j
    ));
  };

  return (
    <MultitarefaContext.Provider value={{ janelas, abrirJanela, fecharJanela, ativarJanela, minimizarJanela }}>
      {children}
    </MultitarefaContext.Provider>
  );
}

export const useMultitarefa = () => {
  const context = useContext(MultitarefaContext);
  if (!context) {
    throw new Error('useMultitarefa deve ser usado dentro de MultitarefaProvider');
  }
  return context;
};