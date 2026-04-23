import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useToggleConfig v7 — Usa upsertConfig (backend function) para salvar toggles.
 * Isso garante que o valor seja persistido corretamente, bypassa o wrapper do layout
 * e usa a função backend que já tem lógica de upsert por escopo.
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  const [optimisticMap, setOptimisticMap] = useState({});
  const queryClient = useQueryClient();
  const pendingRef = useRef({});

  // Reset ao trocar empresa/grupo
  useEffect(() => {
    setOptimisticMap({});
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
    if (!scope.empresa_id && !scope.group_id) {
      toast.error('Selecione uma empresa ou grupo antes de salvar.');
      return;
    }

    // 1. Otimismo imediato na UI
    pendingRef.current[chave] = true;
    setSaving(prev => ({ ...prev, [chave]: true }));
    setOptimisticMap(prev => ({ ...prev, [chave]: newValue }));

    try {
      // 2. Salva via backend function (bypassa wrapper do layout)
      const res = await base44.functions.invoke('upsertConfig', {
        chave,
        data: { chave, categoria: categoria || 'Sistema', ativa: newValue },
        scope,
      });

      const backendValue = typeof res?.data?.record?.ativa === 'boolean'
        ? res.data.record.ativa
        : newValue;

      // 3. Invalida e refaz o cache para pegar o novo valor
      if (queryKey) {
        try {
          queryClient.invalidateQueries({ queryKey, exact: true });
          await queryClient.refetchQueries({ queryKey, exact: true, stale: true });
        } catch (_) {}
      }

      // 4. Limpa otimístico após sucesso confirmado
      setOptimisticMap(prev => {
        const next = { ...prev };
        delete next[chave];
        return next;
      });

      toast.success(backendValue ? '✅ Ativado com sucesso!' : '⭕ Desativado com sucesso!');

    } catch (err) {
      // Reverte UI
      setOptimisticMap(prev => {
        const next = { ...prev };
        delete next[chave];
        return next;
      });
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
      delete pendingRef.current[chave];
    }
  }, [saving, getScope, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Prioridade 1: valor otimístico local
    if (chave in optimisticMap) return optimisticMap[chave];
    // Prioridade 2: valor do cache/backend
    const match = findMatchingRecord(configs, chave);
    if (match && typeof match.ativa === 'boolean') return match.ativa;
    return false;
  }, [optimisticMap, findMatchingRecord]);

  // NO-OP: retrocompatibilidade
  const syncWithQueryData = useCallback((_configs) => {}, []);

  return {
    saving,
    optimistic: optimisticMap,
    handleToggle,
    getToggleValue,
    seedIdCache: () => {},
    syncWithQueryData,
  };
}