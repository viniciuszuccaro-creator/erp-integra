import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, Calendar, Eye } from 'lucide-react';

/**
 * ETAPA 3: Card de Entrega Compacto
 * Componente reutilizável para listagens
 */

export default function CardEntregaCompacto({ entrega, onVerDetalhes, onIniciar, mostrarAcoes = true }) {
  const statusCores = {
    'Aguardando Separação': 'bg-slate-500',
    'Em Separação': 'bg-yellow-600',
    'Pronto para Expedir': 'bg-blue-600',
    'Saiu para Entrega': 'bg-purple-600',
    'Em Trânsito': 'bg-orange-600',
    'Entregue': 'bg-green-600',
    'Entrega Frustrada': 'bg-red-600',
    'Devolvido': 'bg-pink-600',
    'Cancelado': 'bg-slate-400'
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="font-bold text-lg">{entrega.cliente_nome}</p>
            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
            </p>
            {entrega.motorista && (
              <p className="text-xs text-slate-500 mt-1">
                🚛 {entrega.motorista}
              </p>
            )}
          </div>
          <Badge className={statusCores[entrega.status] || 'bg-slate-600'}>
            {entrega.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {entrega.data_previsao && (
            <div className="flex items-center gap-1 text-slate-600">
              <Calendar className="w-3 h-3" />
              {new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}
            </div>
          )}
          {entrega.volumes && (
            <div className="flex items-center gap-1 text-slate-600">
              <Package className="w-3 h-3" />
              {entrega.volumes} vol.
            </div>
          )}
        </div>

        {mostrarAcoes && (
          <div className="flex gap-2">
            <Button
              onClick={() => onVerDetalhes?.(entrega)}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              Detalhes
            </Button>
            {entrega.status === 'Pronto para Expedir' && onIniciar && (
              <Button
                onClick={() => onIniciar?.(entrega)}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Truck className="w-3 h-3 mr-1" />
                Iniciar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}