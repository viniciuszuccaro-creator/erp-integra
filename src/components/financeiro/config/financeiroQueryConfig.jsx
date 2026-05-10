export const FINANCEIRO_LIST_LIMIT = 100;
export const FINANCEIRO_SMALL_LIST_LIMIT = 50;
export const FINANCEIRO_CONFIG_LIMIT = 9999;

export const financeiroQueryDefaults = {
  staleTime: 120000,
  gcTime: 600000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  initialData: [],
};

export const financeiroCountQueryDefaults = {
  staleTime: 300000,
  gcTime: 600000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};