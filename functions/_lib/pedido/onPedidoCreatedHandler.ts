import { audit } from '../guard.js';
import { processReservas } from '../orderReservationUtils.js';

// Handler focado e reutilizável para criação de reservas a partir do Pedido
// Não altera regras de negócio (apenas organiza em pequeno arquivo)
export async function handleOnPedidoCreated(base44, ctx, data, user) {
  const movimentos = await processReservas(base44, data, user);

  await audit(base44, user, {
    acao: 'Criação',
    modulo: 'Estoque',
    entidade: 'MovimentacaoEstoque',
    registro_id: null,
    descricao: `Reservas criadas a partir do Pedido ${data?.id}`,
    dados_novos: { movimentos }
  });

  return { movimentos };
}