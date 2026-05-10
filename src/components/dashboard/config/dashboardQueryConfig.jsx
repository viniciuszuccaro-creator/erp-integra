export const DASHBOARD_LIST_LIMIT = 300;
export const DASHBOARD_REFETCH_INTERVAL_MS = 120000;
export const DASHBOARD_STALE_TIME_MS = 180000;
export const DASHBOARD_CACHE_TIME_MS = 600000;

export const dashboardQueryDefaults = {
  staleTime: DASHBOARD_STALE_TIME_MS,
  gcTime: DASHBOARD_CACHE_TIME_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  initialData: [],
};