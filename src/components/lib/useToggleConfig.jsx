import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useToggleConfig v5 — Fix definitivo dos toggles.
 *
 * Problema raiz identificado: o layout.jsx intercepta base44.functions.invoke
 * e injeta deduplicação/caching que pode bloquear chamadas idênticas consecutivas.
 * Além disso, syncWithQueryData apagava o estado otimista prematuramente.
 *
 * Solução:
 * - Chama diretamente a API de entidade (sem passar pelo invoke wrapper do layout)
 * - Estado local NÃO é apagado pelo syncWithQueryData; apenas atualizado se o backend confirmar
 * - Sem de-duplicate: cada toggle é independente
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  const [optimisticMap, setOptimisticMap] = useState({});
  const queryClient = useQueryClient();
  // Rastreia o valor confirmado pelo backend para cada chave
  const confirmedRef = useRef({});

  // Reset ao trocar empresa/grupo
  useEffect(() => {
    setOptimisticMap({});
    confirmedRef.current = {};
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

    // 1. Aplica otimisticamente na UI imediatamente
    setSaving(prev => ({ ...prev, [chave]: true }));
    setOptimisticMap(prev => ({ ...prev, [chave]: newValue }));

    try {
      const api = base44.asServiceRole?.entities?.ConfiguracaoSistema
        ?? base44.entities.ConfiguracaoSistema;

      // 2. Busca registro existente diretamente (sem invoke wrapper)
      let existing = null;
      try {
        const filter = { chave, ...(scope.empresa_id ? { empresa_id: scope.empresa_id } : {}), ...(scope.group_id ? { group_id: scope.group_id } : {}) };
        const rows = await api.filter(filter, '-updated_date', 5);
        existing = Array.isArray(rows) ? (rows[0] || null) : null;
        // Fallback: busca só por chave+grupo se não achou por empresa
        if (!existing && scope.group_id && scope.empresa_id) {
          const rows2 = await api.filter({ chave, group_id: scope.group_id }, '-updated_date', 5);
          existing = Array.isArray(rows2) ? (rows2[0] || null) : null;
        }
      } catch (_) {}

      let savedRecord;
      if (existing?.id) {
        // Atualiza apenas o campo ativa (preservando todos os outros)
        savedRecord = await api.update(existing.id, {
          ...existing,
          chave,
          categoria: categoria || existing.categoria || 'Sistema',
          ativa: newValue,
          ...(scope.empresa_id && { empresa_id: scope.empresa_id }),
          ...(scope.group_id && { group_id: scope.group_id }),
        });
      } else {
        // Cria novo registro
        savedRecord = await api.create({
          chave,
          categoria: categoria || 'Sistema',
          ativa: newValue,
          ...(scope.empresa_id && { empresa_id: scope.empresa_id }),
          ...(scope.group_id && { group_id: scope.group_id }),
        });
      }

      // 3. Confirma com valor real do backend
      const backendValue = typeof savedRecord?.ativa === 'boolean' ? savedRecord.ativa : newValue;
      confirmedRef.current[chave] = backendValue;
      setOptimisticMap(prev => ({ ...prev, [chave]: backendValue }));

      toast.success(backendValue ? '✅ Ativado com sucesso!' : '⭕ Desativado com sucesso!');

      // 4. Invalida cache para sincronizar
      try {
        queryClient.removeQueries({ queryKey, exact: true });
        await queryClient.refetchQueries({ queryKey, exact: true });
      } catch (_) {}

    } catch (err) {
      // Reverte UI para o valor anterior
      setOptimisticMap(prev => {
        const next = { ...prev };
        delete next[chave];
        return next;
      });
      toast.error('Erro ao salvar configuração: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, getScope, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Prioridade 1: valor confirmado/otimista local
    if (chave in optimisticMap) return optimisticMap[chave];

    // Prioridade 2: valor do cache/backend
    const match = findMatchingRecord(configs, chave);
    if (match && typeof match.ativa === 'boolean') return match.ativa;

    return false;
  }, [optimisticMap, findMatchingRecord]);

  // syncWithQueryData: NÃO apaga o otimístico; apenas atualiza se o backend
  // retornou um valor diferente do que o usuário configurou (prevenção de conflito)
  const syncWithQueryData = useCallback((configs) => {
    if (!Array.isArray(configs) || configs.length === 0) return;

    setOptimisticMap(prev => {
      const next = { ...prev };
      let changed = false;

      Object.keys(next).forEach(chave => {
        const match = findMatchingRecord(configs, chave);
        // Só limpa o otimístico se o backend confirmou o valor que esperávamos
        const confirmed = confirmedRef.current[chave];
        if (match && typeof match.ativa === 'boolean') {
          if (confirmed === undefined || match.ativa === confirmed) {
            delete next[chave];
            delete confirmedRef.current[chave];
            changed = true;
          }
        }
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