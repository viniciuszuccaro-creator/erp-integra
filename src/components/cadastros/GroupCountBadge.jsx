/**
 * GroupCountBadge — soma totais de múltiplas entidades com batching eficiente.
 * Divide entidades em grupos de 5 para evitar timeout e rate limit.
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { cn } from "@/lib/utils";

const CAMPO_MAP = {
  Fornecedor: 'empresa_dona_id',
  Transportadora: 'empresa_dona_id',
  Colaborador: 'empresa_alocada_id',
};
const SHARED = new Set(['Cliente', 'Fornecedor', 'Transportadora']);

const SIMPLE_CATALOG = new Set([
  'Banco', 'FormaPagamento', 'TipoDespesa', 'MoedaIndice', 'TipoFrete',
  'UnidadeMedida', 'Departamento', 'Cargo', 'Turno', 'GrupoProduto', 'Marca',
  'SetorAtividade', 'LocalEstoque', 'TabelaFiscal', 'CentroResultado',
  'OperadorCaixa', 'RotaPadrao', 'ModeloDocumento', 'KitProduto', 'CatalogoWeb',
  'Servico', 'CondicaoComercial', 'TabelaPreco', 'PerfilAcesso',
  'ConfiguracaoNFe', 'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp',
  'GatewayPagamento', 'ApiExterna', 'Webhook', 'ChatbotIntent', 'ChatbotCanal',
  'JobAgendado', 'EventoNotificacao', 'SegmentoCliente', 'RegiaoAtendimento',
  'ContatoB2B', 'CentroCusto', 'PlanoDeContas', 'PlanoContas',
  'Veiculo', 'Motorista', 'Representante', 'GrupoEmpresarial', 'Empresa',
  'TabelaPrecoItem', 'CentroOperacao',
]);

function buildFilter(entityName, empresaId, groupId, empresasDoGrupo) {
  if (SIMPLE_CATALOG.has(entityName)) return {};

  const campo = CAMPO_MAP[entityName] || 'empresa_id';
  const orConds = [];

  // Se há groupId mas sem empresa, expandir para TODAS as empresas do grupo
  if (groupId && !empresaId && Array.isArray(empresasDoGrupo) && empresasDoGrupo.length > 0) {
    const ids = empresasDoGrupo.map(e => e.id).filter(Boolean);
    if (ids.length > 0) {
      if (entityName === 'Cliente') {
        orConds.push({ empresa_id: { $in: ids } }, { empresa_dona_id: { $in: ids } });
      } else {
        orConds.push({ [campo]: { $in: ids } });
      }
      if (SHARED.has(entityName)) orConds.push({ empresas_compartilhadas_ids: { $in: ids } });
    }
  } else {
    // Caso padrão: quando há empresa selecionada
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
  }

  // Sempre adicionar group_id se existir
  if (groupId && !orConds.some(c => c.group_id)) {
    orConds.push({ group_id: groupId });
  }

  return orConds.length ? { $or: orConds } : {};
}

// Divide array em chunks de tamanho n
function chunk(arr, n) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
  return result;
}

export default function GroupCountBadge({ entities = [], badgeClassName }) {
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id;
  const groupId = grupoAtual?.id;
  const grupoEmpIds = (empresasDoGrupo || []).map(e => e.id).filter(Boolean).sort().join(',');

  const hasAnyNonSimple = entities.some(e => !SIMPLE_CATALOG.has(e));
  // Permitir fetch se houver entidades E (nenhuma é não-simples OU houver empresa/grupo)
  const canFetch = entities.length > 0 && (!hasAnyNonSimple || !!(empresaId || groupId));
  // Se está em contexto de grupo, sempre fetch (group_id é válido)
  const shouldFetch = canFetch || (entities.length > 0 && groupId && hasAnyNonSimple);

  const { data: total = 0, isLoading } = useQuery({
    queryKey: ['GroupCountBadge3', entities.join(','), empresaId || null, groupId || null, grupoEmpIds],
    queryFn: async () => {
      if (hasAnyNonSimple && !empresaId && !groupId) return 0;

      const batch = entities.map(entityName => ({
        entityName,
        filter: buildFilter(entityName, empresaId, groupId, empresasDoGrupo),
      }));

      // Divide em chunks de 5 entidades para evitar timeout
      const chunks = chunk(batch, 5);
      const allCounts = {};

      for (let i = 0; i < chunks.length; i++) {
        try {
          const res = await base44.functions.invoke('countEntities', { entities: chunks[i] });
          const counts = res?.data?.counts || {};
          Object.assign(allCounts, counts);
        } catch (_) {
          // Em caso de erro, mantém 0 para essas entidades
        }
        // Pausa entre chunks para não sobrecarregar
        if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 100));
      }

      return entities.reduce((sum, e) => sum + (Number(allCounts[e]) || 0), 0);
    },
    staleTime: 300_000, // 5 min cache
    gcTime: 600_000,
    placeholderData: (prev) => prev ?? 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: shouldFetch,
  });

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs rounded-sm",
        badgeClassName || "bg-blue-50 text-blue-700 border-blue-200"
      )}
    >
      {isLoading && total === 0 ? '…' : total.toLocaleString('pt-BR')}
    </Badge>
  );
}