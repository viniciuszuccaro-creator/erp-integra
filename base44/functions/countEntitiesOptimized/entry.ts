/**
 * countEntitiesOptimized — Função backend para contar entidades com multi-empresa
 * ✅ Batch counting rápido
 * ✅ Suporta grupo + empresa com $or automático
 * ✅ Cache de 30s no servidor
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.20";

const FIELD_MAP = {
  Cliente: "empresa_id",
  Fornecedor: "empresa_dona_id",
  Transportadora: "empresa_dona_id",
  Colaborador: "empresa_alocada_id",
  Produto: "empresa_id",
  CentroCusto: "empresa_id",
};

const SHARED_ENTITIES = new Set(["Cliente", "Fornecedor", "Transportadora"]);

const serverCache = new Map();
const CACHE_TTL = 30_000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { batch = [], filter = {} } = body;

    if (!Array.isArray(batch) || !batch.length) {
      return Response.json({}, { status: 200 });
    }

    const result = {};
    const now = Date.now();

    for (const item of batch) {
      const { entity, groupId, empresaId } = item;

      if (!entity) continue;

      // Verificar cache
      const cacheKey = `${entity}|${groupId}|${empresaId}`;
      const cached = serverCache.get(cacheKey);
      if (cached && now - cached.ts < CACHE_TTL) {
        result[entity] = cached.count;
        continue;
      }

      // Construir filtro com suporte multi-empresa
      const countFilter = { ...filter };
      const campo = FIELD_MAP[entity] || "empresa_id";
      const orConditions = [];

      if (empresaId) {
        orConditions.push({ [campo]: empresaId });
        if (SHARED_ENTITIES.has(entity)) {
          orConditions.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
        }
      }
      if (groupId) {
        orConditions.push({ group_id: groupId });
      }

      if (orConditions.length > 0) {
        countFilter.$or = orConditions;
      }

      // Contar
      try {
        const api = base44.asServiceRole.entities[entity];
        const count = await api.filter(countFilter, undefined, 0).then((res) => res?.length || 0);

        result[entity] = count;

        // Cache
        serverCache.set(cacheKey, { count, ts: now });
      } catch (_e) {
        result[entity] = 0;
      }
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
});