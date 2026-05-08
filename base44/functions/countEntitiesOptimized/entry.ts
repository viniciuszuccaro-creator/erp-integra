/**
 * countEntitiesOptimized — Função backend para contar entidades com multi-empresa
 * ✅ Batch counting rápido
 * ✅ Suporta grupo + empresa com $or automático
 * ✅ Cache de 30s no servidor
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const FIELD_MAP = {
  Cliente: "empresa_id",
  Fornecedor: "empresa_dona_id",
  Transportadora: "empresa_dona_id",
  Colaborador: "empresa_alocada_id",
  Produto: "empresa_id",
  CentroCusto: "empresa_id",
};

const SHARED_ENTITIES = new Set(["Cliente", "Fornecedor", "Transportadora", "Produto"]);
const SCOPED_ENTITIES = new Set([
  "Cliente", "Fornecedor", "Transportadora", "Colaborador", "Produto", "Pedido",
  "ContaPagar", "ContaReceber", "Entrega", "NotaFiscal", "OrdemCompra",
  "MovimentacaoEstoque", "CentroCusto", "PlanoDeContas", "PlanoContas"
]);

const stableStringify = (value) => {
  try {
    if (!value || typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return JSON.stringify(value.map((item) => JSON.parse(stableStringify(item))));
    return JSON.stringify(Object.keys(value).sort().reduce((acc, key) => ({ ...acc, [key]: value[key] }), {}));
  } catch (_) {
    return String(value);
  }
};

const serverCache = new Map();
const CACHE_TTL = 30_000;

async function countPaged(api, countFilter) {
  let total = 0;
  let skip = 0;
  const pageSize = 1000;

  while (true) {
    const rows = await api.filter(countFilter, undefined, pageSize, skip);
    const page = Array.isArray(rows) ? rows : [];
    total += page.length;
    if (page.length < pageSize) break;
    skip += pageSize;
  }

  return total;
}

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

      // Verificar cache incluindo filtro para evitar contagem cruzada entre telas/contextos
      const cacheKey = `${entity}|${groupId || ""}|${empresaId || ""}|${stableStringify(filter)}`;
      const cached = serverCache.get(cacheKey);
      if (cached && now - cached.ts < CACHE_TTL) {
        result[entity] = cached.count;
        continue;
      }

      // Construir filtro com suporte multi-empresa
      const countFilter = { ...filter };
      const campo = FIELD_MAP[entity] || "empresa_id";
      const orConditions = [];

      if (!empresaId && !groupId && SCOPED_ENTITIES.has(entity)) {
        result[entity] = 0;
        continue;
      }

      if (empresaId) {
        orConditions.push({ [campo]: empresaId }, { empresa_id: empresaId }, { empresa_dona_id: empresaId }, { empresa_alocada_id: empresaId });
        if (SHARED_ENTITIES.has(entity)) {
          orConditions.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
        }
      }
      if (groupId) {
        orConditions.push({ group_id: groupId });
        const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, "-created_date", 200);
        const empresasIds = (empresas || []).map((empresa) => empresa.id).filter(Boolean);
        if (empresasIds.length) {
          orConditions.push({ [campo]: { $in: empresasIds } }, { empresa_id: { $in: empresasIds } }, { empresa_dona_id: { $in: empresasIds } }, { empresa_alocada_id: { $in: empresasIds } });
          if (SHARED_ENTITIES.has(entity)) {
            orConditions.push({ empresas_compartilhadas_ids: { $in: empresasIds } });
          }
        }
      }

      if (orConditions.length > 0) {
        if (Array.isArray(countFilter.$or) && countFilter.$or.length) {
          countFilter.$and = [{ $or: countFilter.$or }, { $or: orConditions }];
          delete countFilter.$or;
        } else {
          countFilter.$or = orConditions;
        }
      }

      // Contar
      try {
        const api = base44.asServiceRole.entities[entity];
        const count = await countPaged(api, countFilter);

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