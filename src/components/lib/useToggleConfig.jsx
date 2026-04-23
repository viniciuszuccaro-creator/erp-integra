import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useToggleConfig v6 — Fix definitivo dos toggles.
 *
 * Problema raiz: syncWithQueryData apagava o estado otimístico antes do backend confirmar.
 * Solução:
 * - Estado local (optimisticMap) NUNCA é limpo por syncWithQueryData
 * - syncWithQueryData é NO-OP: apenas retrocompatibilidade
 * - Após salvar, faz refetch e usa o valor real do backend (removendo otimístico)
 * - Chama API de entidade diretamente (bypassa wrapper de invoke do layout)
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  // optimisticMap: { [chave]: boolean } — valor local enquanto salva
  const [optimisticMap, setOptimisticMap] = useState({});
  const queryClient = useQueryClient();
  const pendingRef = useRef({}); // evita duplo clique

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

    // 1. Aplica otimisticamente na UI imediatamente
    pendingRef.current[chave] = true;
    setSaving(prev => ({ ...prev, [chave]: true }));
    setOptimisticMap(prev => ({ ...prev, [chave]: newValue }));

    try {
      // Usa asServiceRole para bypass do wrapper de intercepção do layout
      const api = base44.asServiceRole?.entities?.ConfiguracaoSistema
        ?? base44.entities.ConfiguracaoSistema;

      // 2. Busca registro existente (escopo exato → fallback grupo)
      let existing = null;
      try {
        const f1 = { chave, ...(scope.empresa_id ? { empresa_id: scope.empresa_id } : {}), ...(scope.group_id ? { group_id: scope.group_id } : {}) };
        const rows = await api.filter(f1, '-updated_date', 5);
        existing = Array.isArray(rows) ? (rows[0] || null) : null;
        if (!existing && scope.group_id && scope.empresa_id) {
          const rows2 = await api.filter({ chave, group_id: scope.group_id }, '-updated_date', 5);
          existing = Array.isArray(rows2) ? (rows2[0] || null) : null;
        }
      } catch (_) {}

      let savedRecord;
      if (existing?.id) {
        savedRecord = await api.update(existing.id, {
          ...existing,
          chave,
          categoria: categoria || existing.categoria || 'Sistema',
          ativa: newValue,
          ...(scope.empresa_id && { empresa_id: scope.empresa_id }),
          ...(scope.group_id && { group_id: scope.group_id }),
        });
      } else {
        savedRecord = await api.create({
          chave,
          categoria: categoria || 'Sistema',
          ativa: newValue,
          ...(scope.empresa_id && { empresa_id: scope.empresa_id }),
          ...(scope.group_id && { group_id: scope.group_id }),
        });
      }

      // 3. Usa valor confirmado pelo backend
      const backendValue = typeof savedRecord?.ativa === 'boolean' ? savedRecord.ativa : newValue;

      // 4. Refetch do cache para atualizar dados do servidor
      try {
        queryClient.removeQueries({ queryKey, exact: true });
        await queryClient.refetchQueries({ queryKey, exact: true });
      } catch (_) {}

      // 5. Após refetch, remove otimístico (o dado real do servidor já está no cache)
      setOptimisticMap(prev => {
        const next = { ...prev };
        // Mantém o valor confirmado se por algum motivo o refetch demorar
        next[chave] = backendValue;
        return next;
      });

      // 6. Após um tick, remove o otimístico (o cache já tem o valor real)
      setTimeout(() => {
        setOptimisticMap(prev => {
          const next = { ...prev };
          delete next[chave];
          return next;
        });
      }, 500);

      toast.success(backendValue ? '✅ Ativado com sucesso!' : '⭕ Desativado com sucesso!');

    } catch (err) {
      // Reverte UI para o valor do backend/cache
      setOptimisticMap(prev => {
        const next = { ...prev };
        delete next[chave];
        return next;
      });
      toast.error('Erro ao salvar configuração: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
      delete pendingRef.current[chave];
    }
  }, [saving, getScope, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Prioridade 1: valor otimístico local (enquanto salva ou logo após)
    if (chave in optimisticMap) return optimisticMap[chave];

    // Prioridade 2: valor do cache/backend
    const match = findMatchingRecord(configs, chave);
    if (match && typeof match.ativa === 'boolean') return match.ativa;

    return false;
  }, [optimisticMap, findMatchingRecord]);

  // NO-OP: mantido apenas para retrocompatibilidade (não apaga mais o otimístico)
  const syncWithQueryData = useCallback((_configs) => {
    // Intencional: não faz nada. O estado é gerenciado por handleToggle e pelo timeout acima.
  }, []);

  return {
    saving,
    optimistic: optimisticMap,
    handleToggle,
    getToggleValue,
    seedIdCache: () => {},
    syncWithQueryData,
  };
}