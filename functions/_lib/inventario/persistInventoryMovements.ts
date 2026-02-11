import { persistMovements } from '../inventoryUtils.js';

// Wrapper helper: persiste movimentos do inventário (mantém regra atual)
export async function persistInventoryMovements(base44, movimentoRecords) {
  return persistMovements(base44, movimentoRecords);
}