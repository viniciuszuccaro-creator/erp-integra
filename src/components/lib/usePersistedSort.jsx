import { useEffect, useState } from "react";

// Hook simples para padronizar e persistir sort por entidade (localStorage)
// Uso: const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('OrdemCompra', 'data_solicitacao', 'desc')
export default function usePersistedSort(entityName, defaultField = 'updated_date', defaultDirection = 'desc') {
  const [sortField, setSortField] = useState(defaultField);
  const [sortDirection, setSortDirection] = useState(defaultDirection);

  // Restaurar do storage na primeira carga
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`sort_${entityName}`);
      if (raw) {
        const { sortField: sf, sortDirection: sd } = JSON.parse(raw);
        if (sf) setSortField(sf);
        if (sd) setSortDirection(sd);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityName]);

  // Persistir toda vez que mudar
  useEffect(() => {
    try {
      localStorage.setItem(`sort_${entityName}`, JSON.stringify({ sortField, sortDirection }));
    } catch {}
  }, [entityName, sortField, sortDirection]);

  return [sortField, setSortField, sortDirection, setSortDirection];
}