import { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * [DEPRECATED] Hook descontinuado — ConfiguracaoSistema foi removida.
 * Mantém interface para compatibilidade com views legadas.
 * 
 * TODO: Migrar para sistema de configurações simplificado.
 */
export function useToggleConfig(empresaId, grupoId, queryKey) {
  const [saving, setSaving] = useState({});
  const [optimistic, setOptimistic] = useState({});
  const [idCache, setIdCache] = useState({});
  const queryClient = useQueryClient();
  // Ref para evitar race condition: guarda o valor salvo durante refetch
  const savedValueRef = useRef({});

  useEffect(() => {
    setOptimistic({});
    setIdCache({});
    savedValueRef.current = {};
  }, [empresaId, grupoId]);

  const seedIdCache = useCallback((records) => {
    if (!Array.isArray(records) || records.length === 0) return;
    setIdCache(prev => {
      const next = { ...prev };
      records.forEach(rec => {
        if (rec?.chave && rec?.id) {
          // Usa a chave como índice — o escopo mais específico ganha
          // Prioridade: exato (eId+gId) > só eId > só gId
          if (!next[rec.chave]) {
            next[rec.chave] = rec.id;
          } else {
            // Se já existe, sobrescreve apenas se for mais específico
            const isExact = empresaId && grupoId
              ? rec.empresa_id === empresaId && rec.group_id === grupoId
              : empresaId
                ? rec.empresa_id === empresaId
                : rec.group_id === grupoId;
            if (isExact) next[rec.chave] = rec.id;
          }
        }
      });
      return next;
    });
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
      // Exato: empresa + grupo
      const exact = candidates.find(c => c.empresa_id === empresaId && c.group_id === grupoId);
      if (exact) return exact;
      // Fallback: só empresa (sem grupo)
      const byE = candidates.find(c => c.empresa_id === empresaId && !c.group_id);
      if (byE) return byE;
      // Fallback: só grupo
      const byG = candidates.find(c => c.group_id === grupoId && !c.empresa_id);
      if (byG) return byG;
      return candidates[0];
    }
    if (empresaId) {
      const byE = candidates.find(c => c.empresa_id === empresaId);
      if (byE) return byE;
      return null;
    }
    if (grupoId) {
      const byG = candidates.find(c => c.group_id === grupoId);
      if (byG) return byG;
      return null;
    }
    return candidates[0] || null;
  }, [empresaId, grupoId]);

  const upsert = useCallback(async (chave, categoria, dados) => {
    const scope = getScope();

    // Busca ID no cache
    let resolvedId = idCache[chave];

    // Se não tem no cache, busca no query data
    if (!resolvedId) {
      const queryData = queryClient.getQueryData(queryKey);
      const match = findMatchingRecord(Array.isArray(queryData) ? queryData : [], chave);
      resolvedId = match?.id || null;
      if (resolvedId) setIdCache(prev => ({ ...prev, [chave]: resolvedId }));
    }

    const mergedData = { chave, categoria, ...dados };
    const payload = resolvedId
      ? { id: resolvedId, chave, data: mergedData, scope }
      : { chave, data: mergedData, scope };

    const res = await base44.functions.invoke('upsertConfig', payload);
    const returnedId = res?.data?.id || res?.data?.record?.id;
    if (returnedId) {
      setIdCache(prev => ({ ...prev, [chave]: returnedId }));
    }
    return res;
  }, [idCache, getScope, queryClient, queryKey, findMatchingRecord]);

  const handleToggle = useCallback(async (chave, categoria, newValue) => {
    if (saving[chave]) return;

    // Salva o novo valor na ref ANTES do optimistic
    savedValueRef.current[chave] = newValue;
    setOptimistic(prev => ({ ...prev, [chave]: newValue }));
    setSaving(prev => ({ ...prev, [chave]: true }));

    try {
      const res = await upsert(chave, categoria, { ativa: newValue });
      const savedRecord = res?.data?.record;
      const confirmedValue = savedRecord?.ativa;

      // Toast baseado no valor CONFIRMADO pelo backend
      if (typeof confirmedValue === 'boolean') {
        toast.success(`${confirmedValue ? '✅ Ativado' : '⭕ Desativado'} com sucesso!`);
        // Atualiza ref com valor confirmado
        savedValueRef.current[chave] = confirmedValue;
      } else {
        toast.success('✅ Configuração salva!');
      }

      // Invalida e refetch — após isso o optimistic é removido
      await queryClient.invalidateQueries({ queryKey });
      await queryClient.refetchQueries({ queryKey, exact: true });

    } catch (err) {
      // Reverte optimistic e ref
      delete savedValueRef.current[chave];
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
      // Remove optimistic DEPOIS que saving virou false — UI lê do backend
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, upsert, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Enquanto salvando: mostra optimistic
    if (saving[chave] === true && chave in optimistic) return optimistic[chave];

    // Busca no backend data
    const match = findMatchingRecord(configs, chave);
    if (match && typeof match.ativa === 'boolean') return match.ativa;

    return false;
  }, [optimistic, saving, findMatchingRecord]);

  return {
    saving,
    optimistic,
    handleToggle,
    getToggleValue,
    seedIdCache,
    idCache,
  };
}