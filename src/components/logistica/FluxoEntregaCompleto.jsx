import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Camera, RotateCcw, MapPin, FileText } from 'lucide-react';
import CapturaPODMobile from './CapturaPODMobile';
import LogisticaReversaForm from './LogisticaReversaForm';
import StatusEntregaTimeline from './StatusEntregaTimeline';
import MapaEntregaSimples from './MapaEntregaSimples';
import HistoricoEntregaCompleto from './HistoricoEntregaCompleto';
import AutomacaoEntregaWidget from './AutomacaoEntregaWidget';

/**
 * ETAPA 3: Fluxo de Entrega Completo
 * Componente master que agrega todas as funcionalidades
 */

export default function FluxoEntregaCompleto({ entrega, onFechar }) {
  const [abaAtiva, setAbaAtiva] = useState('timeline');

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Entrega - {entrega.cliente_nome}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Pedido: {entrega.numero_pedido || 'N/A'}
              </p>
            </div>
            <Badge className="bg-blue-600">{entrega.status}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="h-full flex flex-col">
            <TabsList className="w-full grid grid-cols-5 flex-shrink-0">
              <TabsTrigger value="timeline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="mapa" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="pod" className="text-xs">
                <Camera className="w-3 h-3 mr-1" />
                POD
              </TabsTrigger>
              <TabsTrigger value="reversa" className="text-xs">
                <RotateCcw className="w-3 h-3 mr-1" />
                Reversa
              </TabsTrigger>
              <TabsTrigger value="historico" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="timeline" className="mt-0 h-full">
                <div className="p-4 space-y-4">
                  <StatusEntregaTimeline entrega={entrega} />
                  <AutomacaoEntregaWidget entrega_id={entrega.id} />
                </div>
              </TabsContent>

              <TabsContent value="mapa" className="mt-0 h-full">
                <div className="p-4">
                  <MapaEntregaSimples entrega={entrega} />
                </div>
              </TabsContent>

              <TabsContent value="pod" className="mt-0 h-full">
                <CapturaPODMobile entrega={entrega} onConcluir={onFechar} />
              </TabsContent>

              <TabsContent value="reversa" className="mt-0 h-full">
                <LogisticaReversaForm entrega={entrega} onConcluir={onFechar} />
              </TabsContent>

              <TabsContent value="historico" className="mt-0 h-full">
                <div className="p-4">
                  <HistoricoEntregaCompleto entrega={entrega} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}