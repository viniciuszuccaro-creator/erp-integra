import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * ETAPA 3: Hook para Notificar Cliente
 * Centraliza lógica de notificação
 */

export function useNotificarCliente(options = {}) {
  const { onSuccess, onError } = options;

  return useMutation({
    mutationFn: async ({ entrega_id, novo_status }) => {
      // Capturar geolocalização
      let lat = null, lng = null;
      
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              resolve();
            },
            () => resolve()
          );
        });
      }

      const res = await base44.functions.invoke('notificarStatusEntrega', {
        entrega_id,
        novo_status,
        latitude: lat,
        longitude: lng
      });

      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`✅ Cliente notificado: ${variables.novo_status}`);
      onSuccess?.(data, variables);
    },
    onError: (err, variables) => {
      toast.error(`Erro ao notificar: ${err.message}`);
      onError?.(err, variables);
    }
  });
}

export default useNotificarCliente;