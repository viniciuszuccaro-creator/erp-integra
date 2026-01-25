import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Package } from 'lucide-react';

/**
 * ETAPA 3: Integração Romaneio
 * Vincula entregas ao romaneio de carga
 */

export default function IntegracaoRomaneio({ romaneio_id }) {
  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', 'romaneio', romaneio_id],
    queryFn: () => base44.entities.Entrega.filter({
      romaneio_id
    }),
    enabled: !!romaneio_id
  });

  const totalVolumes = entregas.reduce((sum, e) => sum + (e.volumes || 0), 0);
  const totalPeso = entregas.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-5 h-5 text-blue-600" />
          Romaneio de Carga
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <p className="text-lg font-bold text-blue-700">{entregas.length}</p>
            <p className="text-xs text-blue-600">Entregas</p>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <p className="text-lg font-bold text-green-700">{totalVolumes}</p>
            <p className="text-xs text-green-600">Volumes</p>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <p className="text-lg font-bold text-purple-700">{totalPeso.toFixed(0)}</p>
            <p className="text-xs text-purple-600">KG</p>
          </div>
        </div>

        <div className="space-y-2 max-h-40 overflow-auto">
          {entregas.map((e, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3 text-slate-400" />
                <span className="font-medium truncate">{e.cliente_nome}</span>
              </div>
              <Badge className="text-xs">
                {e.volumes || 1} vol
              </Badge>
            </div>
          ))}
        </div>

        <Button
          onClick={() => window.print()}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Printer className="w-3 h-3 mr-2" />
          Imprimir Romaneio
        </Button>
      </CardContent>
    </Card>
  );
}