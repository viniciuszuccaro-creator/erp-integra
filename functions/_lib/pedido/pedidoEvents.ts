import { notify } from '../notificationService.js';

// Emite notificação padrão quando movimentos/reservas são gerados a partir do Pedido
export async function emitPedidoMovementsGenerated(base44, { pedido, movimentos, validation }) {
  const empresa_id = pedido?.empresa_id || null;
  const count = Array.isArray(movimentos) ? movimentos.length : (movimentos?.length || 0);

  const titulo = 'Reserva de Estoque';
  const mensagem = `${count} movimentações geradas para o pedido ${pedido?.numero_pedido || pedido?.id || ''}`;

  await notify(base44, {
    titulo,
    mensagem,
    tipo: 'info',
    categoria: 'Comercial',
    prioridade: count > 0 ? 'Normal' : 'Baixa',
    empresa_id,
    dados: {
      pedido_id: pedido?.id,
      movimentos_count: count,
      validation,
    },
  }, { whatsapp: false });
}