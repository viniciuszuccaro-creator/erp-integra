import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Navigation, Truck } from "lucide-react";
import { format } from "date-fns";

function getStatusColor(status) {
  const cores = {
    'Rascunho': 'bg-slate-100 text-slate-700',
    'Aprovado': 'bg-blue-100 text-blue-700',
    'Em Produção': 'bg-purple-100 text-purple-700',
    'Faturado': 'bg-cyan-100 text-cyan-700',
    'Em Trânsito': 'bg-orange-100 text-orange-700',
    'Entregue': 'bg-green-100 text-green-700',
    'Cancelado': 'bg-red-100 text-red-700',
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Aberto': 'bg-blue-100 text-blue-700',
    'Em Atendimento': 'bg-orange-100 text-orange-700',
    'Concluído': 'bg-green-100 text-green-700',
  };
  return cores[status] || 'bg-slate-100 text-slate-700';
}

export default function EntregasOldSection({ entregas = [] }) {
  const entregasVisiveis = (entregas || []).filter(e => e.status !== 'Entregue' && e.status !== 'Cancelado');
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Rastreamento de Entregas em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {entregasVisiveis.map((entrega) => (
            <Card key={entrega.id} className="border-2 border-blue-300 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Truck className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Pedido {entrega.numero_pedido}</p>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        {entrega.endereco_entrega_completo?.cidade} - {entrega.endereco_entrega_completo?.estado}
                      </p>
                      {entrega.motorista && (
                        <p className="text-sm text-slate-600 mt-1">
                          Motorista: {entrega.motorista} | Placa: {entrega.placa}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(entrega.status)} text-sm px-3 py-1`}>{entrega.status}</Badge>
                </div>

                {entrega.data_previsao && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Previsão de Entrega</p>
                        <p className="text-lg font-bold text-blue-700">{format(new Date(entrega.data_previsao), 'dd/MM/yyyy')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {entrega.qr_code && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-purple-900 mb-2">QR Code de Rastreamento</p>
                    <p className="font-mono text-sm bg-white px-3 py-2 rounded border inline-block">{entrega.qr_code}</p>
                  </div>
                )}

                {entrega.codigo_rastreamento && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-green-900 mb-2">Código Transportadora</p>
                    <p className="font-mono font-bold text-green-700">{entrega.codigo_rastreamento}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {entrega.link_rastreamento && (
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => window.open(entrega.link_rastreamento, '_blank')}>
                      <Navigation className="w-4 h-4 mr-2" />
                      Rastrear em Tempo Real
                    </Button>
                  )}
                  {entrega.link_publico_rastreamento && (
                    <Button variant="outline" className="w-full" onClick={() => window.open(entrega.link_publico_rastreamento, '_blank')}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Compartilhar Rastreio
                    </Button>
                  )}
                </div>

                {entrega.endereco_entrega_completo && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-slate-500 mb-2">Endereço de Entrega</p>
                    <p className="text-sm font-medium">{entrega.endereco_entrega_completo.logradouro}, {entrega.endereco_entrega_completo.numero}</p>
                    <p className="text-sm text-slate-600">{entrega.endereco_entrega_completo.bairro} - {entrega.endereco_entrega_completo.cidade}/{entrega.endereco_entrega_completo.estado}</p>
                    <p className="text-sm text-slate-600">CEP: {entrega.endereco_entrega_completo.cep}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {entregasVisiveis.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Truck className="w-20 h-20 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma entrega em andamento</p>
              <p className="text-sm mt-2">Suas entregas concluídas estão disponíveis na aba "Docs & Boletos"</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}