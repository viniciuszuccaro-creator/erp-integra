import { buildFinalizePatch } from '../inventoryUtils.js';

// Wrapper helper: patch de finalização do inventário (mantém regra atual)
export function finalizeInventoryPatch(user) {
  return buildFinalizePatch(user);
}