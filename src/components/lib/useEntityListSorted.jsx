import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function useEntityListSorted(entityName, criterios = {}, options = {}) {
  const { getFiltroContexto } = useContextoVisual();
  const {
    sortField = undefined,
    sortDirection = undefined,
    limit = undefined,
    campo = "empresa_id",
    page = 1,
    pageSize = 100,
  } = options || {};

  const filtroContextOutside = getFiltroContexto(campo, true);

  // Best default sort: last user choice -> per-entity default -> updated_date desc
  const DEFAULT_SORTS = {
    Produto: { field: 'descricao', direction: 'asc' },
    Cliente: { field: 'nome', direction: 'asc' },
    Fornecedor: { field: 'nome', direction: 'asc' },
    Pedido: { field: 'data_pedido', direction: 'desc' },
    ContaPagar: { field: 'data_vencimento', direction: 'asc' },
    ContaReceber: { field: 'data_vencimento', direction: 'asc' },
    OrdemCompra: { field: 'data_solicitacao', direction: 'desc' },
    CentroCusto: { field: 'codigo', direction: 'asc' },
    PlanoDeContas: { field: 'codigo', direction: 'asc' },
    PlanoContas: { field: 'codigo', direction: 'asc' },
    User: { field: 'full_name', direction: 'asc' }
  };

  let finalSortField = sortField;
  let finalSortDirection = sortDirection;
  if (!finalSortField || !finalSortDirection) {
    try {
      const last = JSON.parse(localStorage.getItem(`sort_${entityName}`) || 'null');
      const sf = last?.sortField ?? last?.field;
      const sd = last?.sortDirection ?? last?.direction;
      if (sf && sd) {
        finalSortField = sf;
        finalSortDirection = sd;
      }
    } catch (_) {}
    if (!finalSortField || !finalSortDirection) {
      finalSortField = DEFAULT_SORTS[entityName]?.field || 'updated_date';
      finalSortDirection = DEFAULT_SORTS[entityName]?.direction || 'desc';
    }
  }

  return useQuery({
    queryKey: ["entityListSorted", entityName, JSON.stringify(criterios || {}), finalSortField, finalSortDirection, limit, page, pageSize, filtroContextOutside?.group_id || null, filtroContextOutside?.[campo] || null],
    queryFn: async () => {
      const filtro = { ...criterios, ...filtroContextOutside };
      if (!filtro.group_id && !filtro[campo]) return [];
      const res = await base44.functions.invoke("entityListSorted", {
        entityName,
        filter: filtro,
        sortField: finalSortField,
        sortDirection: finalSortDirection,
        limit: (typeof limit === 'number' && limit > 0) ? limit : pageSize,
        skip: (typeof page === 'number' && typeof pageSize === 'number') ? Math.max(0, (Math.max(1, page) - 1) * pageSize) : undefined,
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 120_000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
}