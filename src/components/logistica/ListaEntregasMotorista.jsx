import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/components/lib/UserContext';
import CardEntregaCompacto from './CardEntregaCompacto';
import { Loader2, CheckCircle2 } from 'lucide-react';

/**
 * ETAPA 3: Lista de Entregas do Motorista
 * Componente reutilizável filtrado por motorista logado
 */

export default function ListaEntregasMotorista({ onVerDetalhes, onIniciar }) {
  const { user } = useUser();

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ['entregas', 'motorista', user?.id],
    queryFn: async () => {
      // Encontrar colaborador do usuário
      const colaboradores = await base44.entities.Colaborador.filter({
        vincular_a_usuario_id: user?.id
      });

      if (!colaboradores || colaboradores.length === 0) return [];

      const colaborador = colaboradores[0];

      // Buscar entregas do motorista
      return base44.entities.Entrega.filter({
        motorista_id: colaborador.id,
        status: { $nin: ['Entregue', 'Cancelado'] }
      }, '-data_previsao', 50);
    },
    enabled: !!user?.id,
    refetchInterval: 15000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (entregas.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Nenhuma entrega pendente!</p>
        <p className="text-sm text-slate-500 mt-1">Você está em dia 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entregas.map(entrega => (
        <CardEntregaCompacto
          key={entrega.id}
          entrega={entrega}
          onVerDetalhes={onVerDetalhes}
          onIniciar={onIniciar}
        />
      ))}
    </div>
  );
}