import { create } from 'zustand';

/**
 * V21.1.2 - SISTEMA MULTITAREFA
 * Gerencia janelas abertas simultaneamente (estilo Windows/Mac)
 */
export const useMultitarefaStore = create((set) => ({
  janelas: [],
  
  abrirJanela: (janela) => set((state) => {
    const jaAberta = state.janelas.find(j => j.id === janela.id);
    if (jaAberta) {
      return {
        janelas: state.janelas.map(j => 
          j.id === janela.id ? { ...j, ativa: true } : { ...j, ativa: false }
        )
      };
    }
    return {
      janelas: [
        ...state.janelas.map(j => ({ ...j, ativa: false })),
        { ...janela, ativa: true }
      ]
    };
  }),
  
  fecharJanela: (id) => set((state) => ({
    janelas: state.janelas.filter(j => j.id !== id)
  })),
  
  ativarJanela: (id) => set((state) => ({
    janelas: state.janelas.map(j => ({
      ...j,
      ativa: j.id === id
    }))
  })),
  
  minimizarJanela: (id) => set((state) => ({
    janelas: state.janelas.map(j => 
      j.id === id ? { ...j, minimizada: !j.minimizada } : j
    )
  }))
}));

export const useMultitarefa = () => {
  const { janelas, abrirJanela, fecharJanela, ativarJanela, minimizarJanela } = useMultitarefaStore();
  return { janelas, abrirJanela, fecharJanela, ativarJanela, minimizarJanela };
};