/**
 * GroupCountBadge — soma totais de múltiplas entidades em um único batch.
 * Sempre inclui empresa atual + todas as empresas do grupo para contagem correta.
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const CAMPO_MAP = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};
const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

function buildFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  const campo = CAMPO_MAP[entityName] || 'empresa_id';
  const orConds = [];

  // Todos os IDs relevantes: empresa atual + todas do grupo
  const allEmpresaIds = new Set();
  if (empresaId) allEmpresaIds.add(empresaId);
  if (Array.isArray(empresasDoGrupo)) {
    empresasDoGrupo.forEach(e => { if (e?.id) allEmpresaIds.add(e.id); });
  }
  const ids = Array.from(allEmpresaIds);

  if (ids.length === 1) {
    const id = ids[0];
    if (entityName === 'Cliente') {
      orConds.push({ empresa_id: id }, { empresa_dona_id: id });
    } else {
      orConds.push({ [campo]: id });
    }
    if (SHARED.has(entityName)) orConds.push({ empresas_compartilhadas_ids: { $in: [id] } });
  } else if (ids.length > 1) {
    if (entityName === 'Cliente') {
      orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } });
    } else {
      orConds.push({ [campo]: { $in: ids } });
    }
    if (SHARED.has(entityName)) orConds.push({ empresas_compartilhadas_ids: { $in: ids } });
  }

  if (groupId) orConds.push({ group_id: groupId });

  return orConds.length ? { $or: orConds } : {};
}

export default function GroupCountBadge({ entities = [] }) {
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id;
  const groupId = grupoAtual?.id;
  const grupoEmpIds = (empresasDoGrupo || []).map(e => e.id).filter(Boolean).sort().join(',');

  const { data: total = 0, isLoading } = useQuery({
    queryKey: ['GroupCountBadge2', entities.join(','), empresaId || null, groupId || null, grupoEmpIds],
    queryFn: async () => {
      if (!empresaId && !groupId) return 0;
      const batch = entities.map(entityName => ({
        entityName,
        filter: buildFilter(entityName, empresaId, groupId, empresasDoGrupo),
      }));
      const res = await base44.functions.invoke('countEntities', { entities: batch });
      const counts = res?.data?.counts || {};
      return entities.reduce((sum, e) => sum + (Number(counts[e]) || 0), 0);
    },
    staleTime: 180_000,
    gcTime: 300_000,
    placeholderData: (prev) => prev ?? 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!(empresaId || groupId) && entities.length > 0,
  });

  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs rounded-sm">
      {isLoading && total === 0 ? '…' : total.toLocaleString('pt-BR')}
    </Badge>
  );
}