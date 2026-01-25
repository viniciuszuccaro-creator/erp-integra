import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Camera, FileText, MapPin, User, Download } from 'lucide-react';

/**
 * ETAPA 3: Comprovante de Entrega Digital
 * Visualização completa do POD
 */

export default function ComprovanteEntregaDigital({ entrega, pedido, onSuccess }) {
  const pod = entrega?.comprovante_entrega;

  if (!pod || !pod.data_hora_recebimento) {
    return (
      <Card className="w-full">
        <CardContent className="py-8 text-center text-slate-500">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Comprovante ainda não coletado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2 border-green-500">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-base text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          Comprovante de Entrega
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Data/Hora */}
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
          <span className="text-sm text-slate-600">Recebido em:</span>
          <span className="font-medium text-sm">
            {new Date(pod.data_hora_recebimento).toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Recebedor */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-sm">Dados do Recebedor</span>
          </div>
          <div className="pl-6 space-y-1 text-sm">
            <p><span className="text-slate-600">Nome:</span> {pod.nome_recebedor}</p>
            {pod.documento_recebedor && (
              <p><span className="text-slate-600">Documento:</span> {pod.documento_recebedor}</p>
            )}
            {pod.cargo_recebedor && (
              <p><span className="text-slate-600">Cargo:</span> {pod.cargo_recebedor}</p>
            )}
          </div>
        </div>

        {/* Geolocalização */}
        {pod.latitude_entrega && pod.longitude_entrega && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-sm">Localização GPS</span>
            </div>
            <div className="pl-6 text-sm">
              <p className="text-slate-600 font-mono">
                {pod.latitude_entrega.toFixed(6)}, {pod.longitude_entrega.toFixed(6)}
              </p>
              <Button
                onClick={() => {
                  const url = `https://www.google.com/maps/@${pod.latitude_entrega},${pod.longitude_entrega},17z`;
                  window.open(url, '_blank');
                }}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Ver no Mapa
              </Button>
            </div>
          </div>
        )}

        {/* Foto */}
        {pod.foto_comprovante && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-sm">Foto</span>
            </div>
            <img
              src={pod.foto_comprovante}
              alt="Comprovante"
              className="w-full rounded-lg border shadow-sm"
            />
            <Button
              onClick={() => window.open(pod.foto_comprovante, '_blank')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Download className="w-3 h-3 mr-1" />
              Baixar Foto
            </Button>
          </div>
        )}

        {/* Assinatura */}
        {pod.assinatura_digital && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-sm">Assinatura Digital</span>
            </div>
            <img
              src={pod.assinatura_digital}
              alt="Assinatura"
              className="w-full max-h-24 object-contain bg-white border rounded p-2"
            />
          </div>
        )}

        {/* Observações */}
        {pod.observacoes_recebimento && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs font-medium text-blue-800 mb-1">Observações:</p>
            <p className="text-xs text-blue-700">{pod.observacoes_recebimento}</p>
          </div>
        )}

        {/* Badge Verificado */}
        <div className="pt-3 border-t text-center">
          <Badge className="bg-green-600 text-sm px-4 py-1.5">
            ✓ Entrega Verificada
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}