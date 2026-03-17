/**
 * GroupCountBadge — soma totais de múltiplas entidades em um único batch.
 * Corrigido: usa $or expandido para grupo (empresa_id $in) em vez de apenas group_id.
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

function buildEntityFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  const campoMap = { Fornecedor: 'empresa_dona_id', Transportadora: 'empresa_dona_id', Colaborador: 'empresa_alocada_id' };
  const campo = campoMap[entityName] || 'empresa_id';
  const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);
  const orConds = [];

  if (empresaId) {
    if (entityName === 'Cliente') {
      orConds.push({ empresa_id: empresaId }, { empresa_dona_id: empresaId });
    } else {
      orConds.push({ [campo]: empresaId });
    }
    if (SHARED.has(entityName)) orConds.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
  }

  if (groupId) {
    orConds.push({ group_id: groupId });
    if (!empresaId && Array.isArray(empresasDoGrupo) && empresasDoGrupo.length) {
      const ids = empresasDoGrupo.map(e => e.id).filter(Boolean);
      if (ids.length) {
        if (entityName === 'Cliente') {
          orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } });
        } else {
          orConds.push({ [campo]: { $in: ids } });
        }
        if (SHARED.has(entityName)) orConds.push({ empresas_compartilhadas_ids: { $in: ids } });
      }
    }
  }

  return orConds.length ? { $or: orConds } : {};
}

export default function GroupCountBadge({ entities = [] }) {
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id;
  const groupId = grupoAtual?.id;

  const { data: total = 0 } = useQuery({
    queryKey: ['GroupCountBadge', entities.join(','), empresaId || null, groupId || null, (empresasDoGrupo || []).map(e => e.id).join(',')],
    queryFn: async () => {
      if (!empresaId && !groupId) return 0;
      const batch = entities.map(entityName => ({
        entityName,
        filter: buildEntityFilter(entityName, empresaId, groupId, empresasDoGrupo),
      }));
      const res = await base44.functions.invoke('countEntities', { entities: batch });
      const counts = res?.data?.counts || {};
      return entities.reduce((sum, e) => sum + (Number(counts[e]) || 0), 0);
    },
    staleTime: 120_000,
    gcTime: 300_000,
    placeholderData: (prev) => prev ?? 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!(empresaId || groupId) && entities.length > 0,
  });

  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
      {total.toLocaleString('pt-BR')}
    </Badge>
  );
}