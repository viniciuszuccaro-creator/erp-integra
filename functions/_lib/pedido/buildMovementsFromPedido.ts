import { processReservas } from '../orderReservationUtils.js';

// Pequeno helper: converte Pedido em movimentos/reservas (reutilizável)
export async function buildMovementsFromPedido(base44, pedido, user) {
  // Delegamos à função já existente para manter a regra de negócio
  const movimentos = await processReservas(base44, pedido, user);
  return movimentos || [];
}