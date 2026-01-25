import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Truck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 3: Botão Iniciar Entrega
 * Atualiza status + notifica cliente
 */

export default function BotaoIniciarEntrega({ entrega, onSucesso, size = 'default' }) {
  const [iniciando, setIniciando] = useState(false);

  const iniciar = async () => {
    setIniciando(true);

    try {
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

      // Atualizar status
      await base44.entities.Entrega.update(entrega.id, {
        status: 'Saiu para Entrega',
        data_saida: new Date().toISOString()
      });

      // Notificar cliente
      await base44.functions.invoke('notificarStatusEntrega', {
        entrega_id: entrega.id,
        novo_status: 'Saiu para Entrega',
        latitude: lat,
        longitude: lng
      });

      toast.success('Entrega iniciada! Cliente notificado.');
      onSucesso?.();

    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIniciando(false);
    }
  };

  return (
    <Button
      onClick={iniciar}
      disabled={iniciando || entrega?.status !== 'Pronto para Expedir'}
      size={size}
      className="bg-green-600 hover:bg-green-700"
    >
      {iniciando ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Iniciando...
        </>
      ) : (
        <>
          <Truck className="w-4 h-4 mr-2" />
          Iniciar Entrega
        </>
      )}
    </Button>
  );
}