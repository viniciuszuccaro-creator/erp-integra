import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * useToggleConfig v9 — Salva via upsertConfig e mantém confirmedMap
 * para não perder o valor confirmado pelo banco após invalidate/refetch.
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  // optimisticMap: valor durante o request (antes de confirmar)
  const [optimisticMap, setOptimisticMap] = useState({});
  // confirmedMap: valor confirmado pelo backend (sobrescreve dados da query enquanto não há novo fetch limpo)
  const [confirmedMap, setConfirmedMap] = useState({});
  const queryClient = useQueryClient();
  const pendingRef = useRef({});

  // Reset ao trocar empresa/grupo
  useEffect(() => {
    setOptimisticMap({});
    setConfirmedMap({});
    pendingRef.current = {};
  }, [empresaId, grupoId]);

  const getScope = useCallback(() => {
    const scope = {};
    if (grupoId) scope.group_id = grupoId;
    if (empresaId) scope.empresa_id = empresaId;
    return scope;
  }, [grupoId, empresaId]);

  const findMatchingRecord = useCallback((list, chave) => {
    if (!Array.isArray(list)) return null;
    const candidates = list.filter(c => c.chave === chave);
    if (!candidates.length) return null;
    if (empresaId && grupoId) {
      const exact = candidates.find(c => c.empresa_id === empresaId && c.group_id === grupoId);
      if (exact) return exact;
    }
    if (empresaId) {
      const byE = candidates.find(c => c.empresa_id === empresaId);
      if (byE) return byE;
    }
    if (grupoId) {
      const byG = candidates.find(c => c.group_id === grupoId);
      if (byG) return byG;
    }
    return candidates[0] || null;
  }, [empresaId, grupoId]);

  const handleToggle = useCallback(async (chave, categoria, newValue) => {
    if (saving[chave] || pendingRef.current[chave]) return;

    const scope = getScope();

    // 1. Otimismo imediato
    pendingRef.current[chave] = true;
    setSaving(prev => ({ ...prev, [chave]: true }));
    setOptimisticMap(prev => ({ ...prev, [chave]: newValue }));

    try {
      // 2. Salva via backend
      const res = await base44.functions.invoke('upsertConfig', {
        chave,
        data: { chave, categoria: categoria || 'Sistema', ativa: newValue },
        scope,
      });

      const backendValue = typeof res?.data?.record?.ativa === 'boolean'
        ? res.data.record.ativa
        : newValue;

      // 3. Grava no confirmedMap — persiste mesmo após invalidate/refetch
      setConfirmedMap(prev => ({ ...prev, [chave]: backendValue }));

      // 4. Invalida cache (sem aguardar — não bloqueia a UI)
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey, exact: true }).catch(() => {});
      }

      return true;
    } catch (err) {
      // Reverte otimístico em caso de erro
      setOptimisticMap(prev => {
        const next = { ...prev };
        delete next[chave];
        return next;
      });
      throw err;
    } finally {
      // 5. Limpa otimístico (confirmedMap já tem o valor correto)
      setOptimisticMap(prev => {
        const next = { ...prev };
        delete next[chave];
        return next;
      });
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
      delete pendingRef.current[chave];
    }
  }, [saving, getScope, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Prioridade 1: valor otimístico local (clique imediato)
    if (chave in optimisticMap) return optimisticMap[chave];
    // Prioridade 2: valor confirmado pelo backend (após salvar, antes do refetch)
    if (chave in confirmedMap) return confirmedMap[chave];
    // Prioridade 3: valor da query (banco)
    const match = findMatchingRecord(configs, chave);
    if (match && typeof match.ativa === 'boolean') return match.ativa;
    // Prioridade 4: fallback global
    if (Array.isArray(configs)) {
      const global = configs.find(c => c.chave === chave && !c.empresa_id && !c.group_id);
      if (global && typeof global.ativa === 'boolean') return global.ativa;
    }
    return false;
  }, [optimisticMap, confirmedMap, findMatchingRecord]);

  return {
    saving,
    optimistic: optimisticMap,
    handleToggle,
    getToggleValue,
    seedIdCache: () => {},
    syncWithQueryData: () => {},
  };
}