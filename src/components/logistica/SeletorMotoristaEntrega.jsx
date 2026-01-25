import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Loader2 } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * ETAPA 3: Seletor de Motorista para Entrega
 * Lista colaboradores com permissão para dirigir
 */

export default function SeletorMotoristaEntrega({ value, onChange, className }) {
  const { filterInContext, empresaAtual } = useContextoVisual();

  const { data: motoristas = [], isLoading } = useQuery({
    queryKey: ['motoristas', empresaAtual?.id],
    queryFn: () => filterInContext('Colaborador', {
      pode_dirigir: true,
      status: 'Ativo'
    }, 'nome_completo', 100),
    enabled: !!empresaAtual
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando motoristas...
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={(val) => {
      const motorista = motoristas.find(m => m.id === val);
      onChange?.({
        motorista_id: val,
        motorista: motorista?.nome_completo,
        motorista_telefone: motorista?.telefone || motorista?.whatsapp
      });
    }}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Selecione o motorista">
          {value ? (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {motoristas.find(m => m.id === value)?.nome_completo}
            </div>
          ) : 'Selecione o motorista'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {motoristas.map(motorista => (
          <SelectItem key={motorista.id} value={motorista.id}>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium">{motorista.nome_completo}</p>
                {motorista.cnh_categoria && (
                  <p className="text-xs text-slate-500">CNH: {motorista.cnh_categoria}</p>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
        {motoristas.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500">
            Nenhum motorista disponível
          </div>
        )}
      </SelectContent>
    </Select>
  );
}