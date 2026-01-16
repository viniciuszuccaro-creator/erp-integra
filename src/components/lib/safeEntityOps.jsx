import { base44 } from "@/api/base44Client";
import { sanitizeObject } from "@/components/lib/security/InputSanitizer";

// Helper para carimbar contexto multiempresa quando disponível
function stampContext(data, context) {
  const stamped = { ...data };
  if (context?.empresa_id && stamped.empresa_id == null) stamped.empresa_id = context.empresa_id;
  if (context?.group_id && stamped.group_id == null) stamped.group_id = context.group_id;
  return stamped;
}

export async function safeCreate(entityName, data, context) {
  const clean = sanitizeObject(stampContext(data, context));
  return base44.entities[entityName].create(clean);
}

export async function safeUpdate(entityName, id, data, context) {
  const clean = sanitizeObject(stampContext(data, context));
  return base44.entities[entityName].update(id, clean);
}

export async function safeDelete(entityName, id) {
  return base44.entities[entityName].delete(id);
}