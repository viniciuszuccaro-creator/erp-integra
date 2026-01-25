import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { confirmarEntregaCompleta, processarReversaCompleta } from '../helpers/integracaoCompleta';

/**
 * ETAPA 3: Hook de Integração Completa
 * Orquestra todas integrações automáticas
 */

export function useConfirmarEntrega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entrega, pedido, comprovanteData, user }) =>
      confirmarEntregaCompleta(entrega, pedido, comprovanteData, user),
    onSuccess: (resultados) => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      
      const totalAcoes = (
        (resultados.entrega ? 1 : 0) +
        resultados.movimentacoes.length +
        (resultados.conta_pagar ? 1 : 0) +
        (resultados.notificacao ? 1 : 0)
      );

      toast.success(`✅ Entrega confirmada! ${totalAcoes} ações automáticas executadas.`);
      
      if (resultados.erros.length > 0) {
        toast.warning(`⚠️ ${resultados.erros.length} avisos registrados.`);
      }
    },
    onError: (err) => {
      toast.error(`Erro ao confirmar entrega: ${err.message}`);
    }
  });
}

export function useProcessarReversa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entrega, pedido, dadosReversa, user }) =>
      processarReversaCompleta(entrega, pedido, dadosReversa, user),
    onSuccess: (resultados) => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      
      toast.success('✅ Logística reversa processada!');
      
      if (resultados.erros.length > 0) {
        toast.warning(`⚠️ ${resultados.erros.length} avisos.`);
      }
    },
    onError: (err) => {
      toast.error(`Erro: ${err.message}`);
    }
  });
}