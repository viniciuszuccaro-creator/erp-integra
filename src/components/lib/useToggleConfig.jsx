import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * Hook consolidado para gerenciar toggles de configuração (Fiscal, Notificações, IA, etc).
 * CORREÇÃO CRÍTICA: seedIdCache popula o cache de IDs a partir dos dados carregados,
 * garantindo que upsert sempre atualize o registro correto em vez de criar duplicados.
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

  // Popula o idCache a partir de uma lista de registros carregados
  // Deve ser chamado toda vez que os dados chegam do query
  const seedIdCache = useCallback((records) => {
    if (!Array.isArray(records) || records.length === 0) return;
    setIdCache(prev => {
      const next = { ...prev };
      records.forEach(rec => {
        if (rec?.chave && rec?.id) next[rec.chave] = rec.id;
      });
      return next;
    });
  }, []);

  const getScope = useCallback(() => {
    const scope = {};
    if (grupoId) scope.group_id = grupoId;
    if (empresaId) scope.empresa_id = empresaId;
    return scope;
  }, [grupoId, empresaId]);

  const upsert = useCallback(async (chave, categoria, dados) => {
    const scope = getScope();
    // Busca o id do cache local OU tenta buscar diretamente nos dados do query
    const cachedId = idCache[chave];
    // Se não há cache, tenta encontrar pelo queryData
    let resolvedId = cachedId;
    if (!resolvedId) {
      const queryData = queryClient.getQueryData(queryKey);
      const list = Array.isArray(queryData) ? queryData : [];
      const found = list.find(c => {
        if (c.chave !== chave) return false;
        if (empresaId && grupoId) return c.empresa_id === empresaId && c.group_id === grupoId;
        if (empresaId) return c.empresa_id === empresaId;
        if (grupoId) return c.group_id === grupoId;
        return true;
      });
      resolvedId = found?.id || null;
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
  }, [idCache, getScope, queryClient, queryKey, empresaId, grupoId]);

  const handleToggle = useCallback(async (chave, categoria, newValue) => {
    if (saving[chave]) return;
    // Optimistic update imediato para UI responsiva
    setOptimistic(prev => ({ ...prev, [chave]: newValue }));
    setSaving(prev => ({ ...prev, [chave]: true }));
    try {
      const res = await upsert(chave, categoria, { ativa: newValue });
      const savedRecord = res?.data?.record;

      if (savedRecord && typeof savedRecord.ativa === 'boolean') {
        toast.success(`${savedRecord.ativa ? '✅ Ativado' : '⭕ Desativado'} com sucesso!`);
      }
      // Invalida para recarregar os dados ANTES de resetar optimistic
      await queryClient.invalidateQueries({ queryKey });
      // Remove optimistic APÓS validação completar (força UI ler do query cache)
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
    } catch (err) {
      // Reverte o optimistic em caso de erro
      setOptimistic(prev => { const n = { ...prev }; delete n[chave]; return n; });
      toast.error('Erro ao salvar: ' + String(err?.message || err));
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[chave]; return n; });
    }
  }, [saving, upsert, queryClient, queryKey]);

  const getToggleValue = useCallback((configs, chave) => {
    // Optimistic sempre tem prioridade (usuário acabou de clicar)
    if (chave in optimistic) return optimistic[chave];
    const list = (configs || []).filter(c => c.chave === chave);
    if (!list.length) return false;
    // Resolve pelo escopo mais específico primeiro (nunca por ordem)
    if (grupoId && empresaId) {
      const exact = list.find(c => c.group_id === grupoId && c.empresa_id === empresaId);
      if (exact && typeof exact.ativa === 'boolean') return exact.ativa;
    }
    if (empresaId) {
      const byE = list.find(c => c.empresa_id === empresaId && !c.group_id);
      if (byE && typeof byE.ativa === 'boolean') return byE.ativa;
    }
    if (grupoId) {
      const byG = list.find(c => c.group_id === grupoId && !c.empresa_id);
      if (byG && typeof byG.ativa === 'boolean') return byG.ativa;
    }
    return false;
  }, [optimistic, grupoId, empresaId]);

  return {
    saving,
    optimistic,
    handleToggle,
    getToggleValue,
    seedIdCache,
    idCache,
  };
}