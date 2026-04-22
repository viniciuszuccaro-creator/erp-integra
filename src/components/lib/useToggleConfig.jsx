import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Hook consolidado para gerenciar toggles de configuração (Fiscal, Notificações, IA, etc).
 * Elimina duplicação de lógica entre ConfigGlobal e IAOtimizacaoIndex.
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  const [optimistic, setOptimistic] = useState({});
  const [idCache, setIdCache] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    setOptimistic({});
    setIdCache({});
  }, [empresaId, grupoId]);

  const getScope = useCallback(() => {
    const scope = {};
    if (grupoId) scope.group_id = grupoId;
    if (empresaId) scope.empresa_id = empresaId;
    return scope;
  }, [grupoId, empresaId]);

  const upsert = useCallback(async (chave, categoria, dados) => {
    const scope = getScope();
    const cachedId = idCache[chave];
    const mergedData = { chave, categoria, ...dados };
    const payload = cachedId
      ? { id: cachedId, chave, data: mergedData, scope }
      : { chave, data: mergedData, scope };
    const res = await base44.functions.invoke('upsertConfig', payload);
    const returnedId = res?.data?.id || res?.data?.record?.id;
    if (returnedId) {
      setIdCache(prev => ({ ...prev, [chave]: returnedId }));
    }
    return res;
  }, [idCache, getScope]);

  const handleToggle = useCallback(async (chave, categoria, newValue) => {
    if (saving[chave]) return;
    setSaving(prev => ({ ...prev, [chave]: true }));
    try {
      const res = await upsert(chave, categoria, { ativa: newValue });
      const savedRecord = res?.data?.record;
      
      if (savedRecord && typeof savedRecord.ativa === 'boolean') {
        setOptimistic(prev => ({
          ...prev,
          [chave]: savedRecord.ativa
        }));
        await queryClient.invalidateQueries({ queryKey });
        toast.success(`${savedRecord.ativa ? '✅ Ativado' : '⭕ Desativado'} com sucesso!`);
      } else {
        setOptimistic(prev => ({ ...prev, [chave]: newValue }));
        await queryClient.invalidateQueries({ queryKey });
      }
    } catch (err) {
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, upsert, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    if (chave in optimistic) return optimistic[chave];
    const list = (configs || []).filter(c => c.chave === chave);
    if (!list.length) return false;
    if (grupoId && empresaId) {
      const exact = list.find(c => c.group_id === grupoId && c.empresa_id === empresaId);
      if (exact) return typeof exact.ativa === 'boolean' ? exact.ativa : false;
    }
    if (empresaId) {
      const byE = list.find(c => c.empresa_id === empresaId);
      if (byE) return typeof byE.ativa === 'boolean' ? byE.ativa : false;
    }
    if (grupoId) {
      const byG = list.find(c => c.group_id === grupoId);
      if (byG) return typeof byG.ativa === 'boolean' ? byG.ativa : false;
    }
    return typeof list[0]?.ativa === 'boolean' ? list[0].ativa : false;
  }, [optimistic, grupoId, empresaId]);

  return {
    saving,
    optimistic,
    handleToggle,
    getToggleValue,
    idCache,
  };
}