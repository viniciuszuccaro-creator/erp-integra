import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Hook para Entregas do Motorista
 * Reutilizável em múltiplos componentes
 */

export function useEntregasMotorista(options = {}) {
  const { user } = useUser();
  const { refetchInterval = 15000, incluirConcluidas = false } = options;

  return useQuery({
    queryKey: ['entregas', 'motorista', user?.id, incluirConcluidas],
    queryFn: async () => {
      if (!user?.id) return [];

      // Buscar colaborador
      const colaboradores = await base44.entities.Colaborador.filter({
        vincular_a_usuario_id: user.id
      });

      if (!colaboradores || colaboradores.length === 0) {
        return [];
      }

      const colaborador = colaboradores[0];

      // Buscar entregas
      const filtro = {
        motorista_id: colaborador.id
      };

      if (!incluirConcluidas) {
        filtro.status = { $nin: ['Entregue', 'Cancelado'] };
      }

      return base44.entities.Entrega.filter(filtro, '-data_previsao', 100);
    },
    enabled: !!user?.id,
    refetchInterval
  });
}

export default useEntregasMotorista;