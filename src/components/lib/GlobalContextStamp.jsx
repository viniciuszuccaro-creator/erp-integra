import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * GlobalContextStamp
 * - Carimba automaticamente group_id/empresa_id em create/update/bulkCreate quando ausentes
 * - Injeta filtro de contexto em filter() quando não informado
 * - Não altera UI e não renderiza nada
 */
export default function GlobalContextStamp() {
  const { getFiltroContexto, carimbarContexto, contexto, empresaAtual, grupoAtual } = useContextoVisual();

  useEffect(() => {
    if (!base44?.entities) return;
    const root = base44.entities;
    if (root.__patched_multiempresa) return; // evita patch duplicado

    const original = new Map();

    const patchEntity = (name) => {
      const api = root[name];
      if (!api || typeof api !== 'object') return;

      // Guardar originais
      const o = {
        create: api.create?.bind(api),
        bulkCreate: api.bulkCreate?.bind(api),
        update: api.update?.bind(api),
        filter: api.filter?.bind(api),
      };
      original.set(name, o);

      // create
      if (o.create) {
        api.create = (dados) => {
          const stamped = carimbarContexto?.(dados) || dados;
          return o.create(stamped);
        };
      }

      // bulkCreate
      if (o.bulkCreate) {
        api.bulkCreate = (lista) => {
          const stampedList = (lista || []).map((item) => carimbarContexto?.(item) || item);
          return o.bulkCreate(stampedList);
        };
      }

      // update
      if (o.update) {
        api.update = (id, dados) => {
          const stamped = carimbarContexto?.(dados) || dados;
          return o.update(id, stamped);
        };
      }

      // filter
      if (o.filter) {
        api.filter = (criterios = {}, order, limit) => {
          const merged = { ...criterios, ...getFiltroContexto?.() };
          return o.filter(merged, order, limit);
        };
      }
    };

    try {
      // Enumerar chaves conhecidas (evita mexer em User/AuditLog se não desejar)
      Object.keys(root).forEach((key) => {
        // Não alterar User para evitar regras especiais
        if (key === 'User') return;
        patchEntity(key);
      });
      root.__patched_multiempresa = true;
    } catch (_) {}

    // sem cleanup (mantém patch durante a sessão)
  }, [contexto, empresaAtual?.id, grupoAtual?.id]);

  return null;
}