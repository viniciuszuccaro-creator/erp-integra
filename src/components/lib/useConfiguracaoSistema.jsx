import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * Hook de acesso centralizado às configurações do sistema
 * - Busca por categoria + chave (primeiro registro mais recente)
 * - Exposição segura (get/set) com cache via React Query
 * - Mantém simplicidade e não cria novos módulos: integra-se ao fluxo existente
 */
export default function useConfiguracaoSistema({ categoria, chave, empresaId, grupoId } = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["configuracaoSistema", categoria || "*", chave || "*", empresaId || "sem-empresa", grupoId || "sem-grupo"],
    queryFn: async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return null;
      const orConds = [];
      const baseFilter = {};
      if (categoria) baseFilter.categoria = categoria;
      if (chave) baseFilter.chave = chave;
      if (empresaId && grupoId) orConds.push({ ...baseFilter, empresa_id: empresaId, group_id: grupoId });
      if (empresaId) orConds.push({ ...baseFilter, empresa_id: empresaId });
      if (grupoId) orConds.push({ ...baseFilter, group_id: grupoId });
      orConds.push(baseFilter);
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter: orConds.length > 1 ? { $or: orConds } : baseFilter,
        limit: 20,
        sortField: '-updated_date'
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      return list[0] || null;
    },
    staleTime: 60_000,
  });

  const setMutation = useMutation({
    mutationFn: async (payload) => {
      return base44.functions.invoke('upsertConfig', {
        id: data?.id,
        chave: chave || payload?.chave || "default",
        data: { categoria: categoria || "Sistema", ...payload },
        scope: {
          ...(grupoId ? { group_id: grupoId } : {}),
          ...(empresaId ? { empresa_id: empresaId } : {})
        }
      });
    },
    onSuccess: async (res, variables) => {
      // Invalida todos os consumidores conhecidos
      queryClient.invalidateQueries({ queryKey: ["configuracaoSistema"] });
      queryClient.invalidateQueries({ queryKey: ["config-sistema"] });
      // Auditoria detalhada (quem, parâmetro, antes/depois)
      try {
        const me = await base44.auth.me();
        await base44.functions.invoke('auditEntityEvents', {
          event: {
            type: data?.id ? 'update' : 'create',
            entity_name: 'ConfiguracaoSistema',
            entity_id: (res && res.id) || data?.id || null
          },
          data: { ...(res || {}), __meta: { changed_by: me?.email || me?.full_name, param: chave || variables?.chave } },
          old_data: data || null
        });
      } catch (_) {}
    }
  });

  // Helper para acessar caminhos aninhados com safety
  const get = useMemo(() => {
    return (path, defaultValue = undefined) => {
      if (!data || !path) return defaultValue;
      const parts = String(path).split(".");
      let cur = data;
      for (const p of parts) {
        if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
          cur = cur[p];
        } else {
          return defaultValue;
        }
      }
      return cur == null ? defaultValue : cur;
    };
  }, [data]);

  return {
    config: data,
    isLoading,
    error,
    get,
    setConfig: (patch) => setMutation.mutate(patch),
    isSaving: setMutation.isPending,
  };
}