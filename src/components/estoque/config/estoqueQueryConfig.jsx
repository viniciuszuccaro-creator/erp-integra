export const ESTOQUE_LIST_LIMIT = 50;
export const ESTOQUE_PRODUCTS_LIMIT = 5000;
export const ESTOQUE_BATCH_SIZE = 500;

export const estoqueQueryDefaults = {
  staleTime: 120000,
  gcTime: 600000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  initialData: [],
};