import { computeInventoryMovements } from './computeInventoryMovements.js';
import { persistInventoryMovements } from './persistInventoryMovements.js';
import { finalizeInventoryPatch } from './finalizeInventoryPatch.js';
import { audit } from '../guard.js';

// Handler pequeno e reutilizável para aplicar ajustes de inventário
export async function handleApplyInventoryAdjustments(base44, ctx, inv, user) {
  const movimentoRecords = computeInventoryMovements(inv, user);
  if (!Array.isArray(movimentoRecords) || movimentoRecords.length === 0) {
    return { movimentos: [], movimentos_count: 0, skipped: true };
  }

  const movimentos = await persistInventoryMovements(base44, movimentoRecords);

  await base44.asServiceRole.entities.Inventario.update(inv.id, finalizeInventoryPatch(user));

  await audit(base44, user, {
    acao: 'Edição',
    modulo: 'Estoque',
    entidade: 'Inventario',
    registro_id: inv.id,
    descricao: 'Aplicação de ajustes de inventário',
    dados_novos: { movimentos }
  });

  return { movimentos, movimentos_count: movimentos.length, skipped: false };
}