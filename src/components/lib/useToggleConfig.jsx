import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useToggleConfig — Hook para gerenciar toggles de ConfiguracaoSistema.
 * Usa upsertConfig no backend para persistir. Estado local mantém valor
 * confirmado após save até que o backend retorne via refetch.
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  // confirmedValues: armazena o valor salvo com sucesso no backend
  // Este mapa persiste até a query ser invalidada e retornar com o valor novo
  const confirmedRef = useRef({});
  const [, forceRender] = useState(0);
  const queryClient = useQueryClient();

  // Limpar ao trocar contexto
  useEffect(() => {
    confirmedRef.current = {};
    forceRender(n => n + 1);
  }, [empresaId, grupoId]);

  const seedIdCache = useCallback(() => {}, []); // compatibilidade

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
      const byE = candidates.find(c => c.empresa_id === empresaId);
      if (byE) return byE;
      const byG = candidates.find(c => c.group_id === grupoId);
      if (byG) return byG;
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

    // Seta optimistic imediatamente
    confirmedRef.current[chave] = newValue;
    forceRender(n => n + 1);
    setSaving(prev => ({ ...prev, [chave]: true }));

    try {
      const scope = getScope();
      const res = await base44.functions.invoke('upsertConfig', {
        chave,
        data: { chave, categoria, ativa: newValue },
        scope,
      });

      const savedRecord = res?.data?.record;
      // Confirma com valor do backend se disponível, senão mantém newValue
      const confirmedValue = typeof savedRecord?.ativa === 'boolean' ? savedRecord.ativa : newValue;
      confirmedRef.current[chave] = confirmedValue;
      forceRender(n => n + 1);

      toast.success(confirmedValue ? '✅ Ativado com sucesso!' : '⭕ Desativado com sucesso!');

      // Invalida query para sincronizar, mas o confirmedRef já mantém o valor correto
      queryClient.invalidateQueries({ queryKey });

    } catch (err) {
      // Reverte ao valor anterior (desconhecido — lê do query cache)
      delete confirmedRef.current[chave];
      forceRender(n => n + 1);
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, getScope, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Prioridade 1: valor confirmado pelo backend (persiste após save até próximo fetch)
    if (chave in confirmedRef.current) return confirmedRef.current[chave];

    // Prioridade 2: valor do backend via query
    const match = findMatchingRecord(configs, chave);
    if (match && typeof match.ativa === 'boolean') return match.ativa;

    return false;
  }, [findMatchingRecord]);

  // Quando a query refetch retornar, limpar os confirmed que já estão sincronizados
  const syncWithQueryData = useCallback((configs) => {
    if (!Array.isArray(configs)) return;
    let changed = false;
    Object.keys(confirmedRef.current).forEach(chave => {
      const match = findMatchingRecord(configs, chave);
      if (match && typeof match.ativa === 'boolean' && match.ativa === confirmedRef.current[chave]) {
        delete confirmedRef.current[chave];
        changed = true;
      }
    });
    if (changed) forceRender(n => n + 1);
  }, [findMatchingRecord]);

  return {
    saving,
    optimistic: confirmedRef.current,
    handleToggle,
    getToggleValue,
    seedIdCache,
    syncWithQueryData,
  };
}