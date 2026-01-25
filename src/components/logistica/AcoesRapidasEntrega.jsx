import React from 'react';
import { Button } from '@/components/ui/button';
import { Truck, Camera, RotateCcw, Mail, MapPin } from 'lucide-react';
import BotaoIniciarEntrega from './BotaoIniciarEntrega';

/**
 * ETAPA 3: Ações Rápidas de Entrega
 * Barra de ações contextuais por status
 */

export default function AcoesRapidasEntrega({ 
  entrega, 
  onPOD, 
  onReversa, 
  onNotificar, 
  onMapa,
  onRefresh 
}) {
  const acoes = [];

  // Ações por status
  if (entrega.status === 'Pronto para Expedir') {
    acoes.push(
      <BotaoIniciarEntrega
        key="iniciar"
        entrega={entrega}
        onSucesso={onRefresh}
        size="sm"
      />
    );
  }

  if (['Saiu para Entrega', 'Em Trânsito'].includes(entrega.status)) {
    acoes.push(
      <Button
        key="pod"
        onClick={onPOD}
        size="sm"
        className="bg-green-600 hover:bg-green-700"
      >
        <Camera className="w-3 h-3 mr-1" />
        POD
      </Button>
    );

    acoes.push(
      <Button
        key="reversa"
        onClick={onReversa}
        size="sm"
        variant="destructive"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        Reversa
      </Button>
    );
  }

  // Ações sempre disponíveis
  acoes.push(
    <Button
      key="mapa"
      onClick={onMapa}
      size="sm"
      variant="outline"
    >
      <MapPin className="w-3 h-3 mr-1" />
      Mapa
    </Button>
  );

  if (entrega.contato_entrega?.email) {
    acoes.push(
      <Button
        key="notificar"
        onClick={onNotificar}
        size="sm"
        variant="outline"
      >
        <Mail className="w-3 h-3 mr-1" />
        Notificar
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {acoes}
    </div>
  );
}