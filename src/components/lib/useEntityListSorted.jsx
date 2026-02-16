import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function useEntityListSorted(entityName, criterios = {}, options = {}) {
  const { getFiltroContexto } = useContextoVisual();
  const {
    sortField = "updated_date",
    sortDirection = "desc",
    limit = 500,
    campo = "empresa_id"
  } = options || {};

  return useQuery({
    queryKey: ["entityListSorted", entityName, criterios, sortField, sortDirection, limit],
    queryFn: async () => {
      const filtroContexto = getFiltroContexto(campo, true);
      const filtro = { ...criterios, ...filtroContexto };
      if (!filtro.group_id && !filtro[campo]) return [];
      const res = await base44.functions.invoke("entityListSorted", {
        entityName,
        filter: filtro,
        sortField,
        sortDirection,
        limit,
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 60_000,
  });
}