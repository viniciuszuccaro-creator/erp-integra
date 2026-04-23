import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useToggleConfig v4 — Correção definitiva dos toggles de ConfiguracaoSistema.
 *
 * Estratégia:
 * - Estado local (optimisticMap) com useState para re-renders síncronos
 * - Após save no backend, força refetch e sincroniza com o valor real
 * - syncWithQueryData só limpa o estado local quando o backend confirma o valor
 * - Sem race conditions: saving[chave] bloqueia cliques duplos
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  // optimisticMap: { [chave]: boolean } — valores confirmados localmente antes do refetch
  const [optimisticMap, setOptimisticMap] = useState({});
  const queryClient = useQueryClient();

  // Reset ao trocar empresa/grupo
  useEffect(() => {
    setOptimisticMap({});
  }, [empresaId, grupoId]);

  const seedIdCache = useCallback(() => {}, []); // retrocompatibilidade

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
    if (saving[chave]) return;

    const scope = getScope();
    if (!scope.empresa_id && !scope.group_id) {
      toast.error('Selecione uma empresa ou grupo antes de salvar.');
      return;
    }

    // 1. Aplica otimisticamente na UI
    setSaving(prev => ({ ...prev, [chave]: true }));
    setOptimisticMap(prev => ({ ...prev, [chave]: newValue }));

    try {
      // 2. Persiste no backend
      const res = await base44.functions.invoke('upsertConfig', {
        chave,
        data: { chave, categoria, ativa: newValue },
        scope,
      });

      // 3. Confirma com valor real retornado pelo backend
      const savedRecord = res?.data?.record;
      const backendValue = typeof savedRecord?.ativa === 'boolean' ? savedRecord.ativa : newValue;

      // Atualiza optimistic com valor confirmado
      setOptimisticMap(prev => ({ ...prev, [chave]: backendValue }));

      toast.success(backendValue ? '✅ Ativado!' : '⭕ Desativado!');

      // 4. Invalida cache e refaz query para sincronizar backend → frontend
      queryClient.removeQueries({ queryKey, exact: true });
      try {
        await queryClient.refetchQueries({ queryKey, exact: true });
      } catch (_) {}

    } catch (err) {
      // Reverte: remove do optimistic para mostrar valor do cache
      setOptimisticMap(prev => {
        const next = { ...prev };
        delete next[chave];
        return next;
      });
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, getScope, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Prioridade 1: valor local otimista (pós-save, antes do refetch completar)
    if (chave in optimisticMap) return optimisticMap[chave];

    // Prioridade 2: valor do cache/backend
    const match = findMatchingRecord(configs, chave);
    if (match && typeof match.ativa === 'boolean') return match.ativa;

    return false;
  }, [optimisticMap, findMatchingRecord]);

  // syncWithQueryData: chamado após refetch. Limpa optimistic quando backend confirmou.
  const syncWithQueryData = useCallback((configs) => {
    if (!Array.isArray(configs) || configs.length === 0) return;

    setOptimisticMap(prev => {
      const next = { ...prev };
      let changed = false;

      Object.keys(next).forEach(chave => {
        const match = findMatchingRecord(configs, chave);
        if (match && typeof match.ativa === 'boolean') {
          // Backend já tem o valor — limpa o estado local
          delete next[chave];
          changed = true;
        }
        // Se não encontrou: mantém (registro pode ainda não ter chegado no refetch)
      });

      return changed ? next : prev;
    });
  }, [findMatchingRecord]);

  return {
    saving,
    optimistic: optimisticMap,
    handleToggle,
    getToggleValue,
    seedIdCache,
    syncWithQueryData,
  };
}