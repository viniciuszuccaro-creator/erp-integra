import { computeMovements } from '../inventoryUtils.js';

// Wrapper helper: calcula movimentos do inventário (mantém regra atual)
export function computeInventoryMovements(inv, user) {
  return computeMovements(inv, user);
}