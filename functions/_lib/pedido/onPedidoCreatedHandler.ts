import { buildMovementsFromPedido } from './buildMovementsFromPedido.js';
import { auditPedidoReserva } from './auditPedidoReserva.js';
import { validatePedidoForReserva } from './validatePedido.js';
import { emitPedidoMovementsGenerated } from './pedidoEvents.js';

// Handler focado e reutilizável para criação de reservas a partir do Pedido
// Não altera regras de negócio (apenas organiza em pequenos arquivos helpers)
export async function handleOnPedidoCreated(base44, ctx, data, user) {
  const validation = validatePedidoForReserva(data);
  const movimentos = await buildMovementsFromPedido(base44, data, user);
  await auditPedidoReserva(base44, user, { pedido: data, movimentos });
  await emitPedidoMovementsGenerated(base44, { pedido: data, movimentos, validation });
  return { movimentos, validation };
}