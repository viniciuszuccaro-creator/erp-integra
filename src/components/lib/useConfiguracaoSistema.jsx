import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { findAdminControl } from "@/components/administracao-sistema/fase1/adminControlRegistry";

function buildConfigCandidates({ categoria, chave, empresaId, grupoId }) {
  const baseFilter = {};
  if (categoria) baseFilter.categoria = categoria;
  if (chave) baseFilter.chave = chave;

  const candidates = [];
  if (empresaId && grupoId) candidates.push({ ...baseFilter, empresa_id: empresaId, group_id: grupoId, __nivel: 1 });
  if (empresaId) candidates.push({ ...baseFilter, empresa_id: empresaId, __nivel: 2 });
  if (grupoId) candidates.push({ ...baseFilter, group_id: grupoId, __nivel: 3 });
  candidates.push({ ...baseFilter, __nivel: 4 });
  return candidates;
}

function pickBestConfig(list = [], { empresaId, grupoId }) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const scored = list.map((item) => {
    let score = 4;
    if (empresaId && grupoId && item?.empresa_id === empresaId && item?.group_id === grupoId) score = 1;
    else if (empresaId && item?.empresa_id === empresaId) score = 2;
    else if (grupoId && item?.group_id === grupoId) score = 3;
    return { item, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0]?.item || null;
}

/**
 * Hook de acesso centralizado às configurações do sistema
 * - Busca por categoria + chave (primeiro registro mais recente)
 * - Exposição segura (get/set) com cache via React Query
 * - Mantém simplicidade e não cria novos módulos: integra-se ao fluxo existente
 */
export default function useConfiguracaoSistema({ categoria, chave, empresaId, grupoId, aliases = [] } = {}) {
  const queryClient = useQueryClient();
  const controlMeta = findAdminControl(chave);
  const mergedAliases = useMemo(() => {
    const registryAliases = Array.isArray(controlMeta?.aliases) ? controlMeta.aliases : [];
    return Array.from(new Set([...(aliases || []), ...registryAliases].filter(Boolean)));
  }, [aliases, controlMeta]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["configuracaoSistema", categoria || "*", chave || "*", empresaId || "sem-empresa", grupoId || "sem-grupo"],
    queryFn: async () => {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) return null;
      const keys = [chave, ...mergedAliases].filter(Boolean);
      const scopedFilters = keys.flatMap((configKey) => {
        return buildConfigCandidates({ categoria, chave: configKey, empresaId, grupoId }).map(({ __nivel, ...rest }) => rest);
      });
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter: scopedFilters.length > 1 ? { $or: scopedFilters } : scopedFilters[0],
        limit: 100,
        sortField: '-updated_date'
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      return pickBestConfig(list.filter((item) => keys.includes(item?.chave)), { empresaId, grupoId });
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

  const ativo = useCallback((fallback = false) => {
    if (typeof data?.ativa === 'boolean') return data.ativa;
    return fallback;
  }, [data]);

  const resolver = useCallback((localChave, localCategoria = categoria) => {
    if (!localChave) return null;
    return base44.functions.invoke('getEntityRecord', {
      entityName: 'ConfiguracaoSistema',
      filter: {
        $or: buildConfigCandidates({
          categoria: localCategoria,
          chave: localChave,
          empresaId,
          grupoId,
        }).map(({ __nivel, ...rest }) => rest)
      },
      limit: 50,
      sortField: '-updated_date'
    }).then((res) => pickBestConfig(Array.isArray(res?.data) ? res.data : [], { empresaId, grupoId }));
  }, [categoria, empresaId, grupoId, JSON.stringify(mergedAliases)]);

  const requireEnabled = useCallback((fallback = false, message = 'Configuração desativada para este contexto.') => {
    const enabled = ativo(fallback);
    if (!enabled) throw new Error(message);
    return true;
  }, [ativo]);

  return {
    config: data,
    controlMeta,
    scope: controlMeta?.escopo || null,
    moduleName: controlMeta?.modulo || null,
    screenName: controlMeta?.tela || null,
    aliases: mergedAliases,
    isLoading,
    error,
    get,
    ativo,
    isEnabled: ativo,
    enabled: ativo(),
    requireEnabled,
    resolver,
    setConfig: (patch) => setMutation.mutate(patch),
    isSaving: setMutation.isPending,
  };
}