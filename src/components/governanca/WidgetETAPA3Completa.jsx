import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, CheckCircle2 } from 'lucide-react';

/**
 * ETAPA 3: Widget Compacto de Status
 * Para exibir em dashboards
 */

export default function WidgetETAPA3Completa() {
  return (
    <Card className="w-full border-2 border-green-500 bg-gradient-to-br from-green-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">ETAPA 3</p>
              <p className="text-xs text-slate-600">Logística & Apps</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge className="bg-green-600 mb-1">
              100%
            </Badge>
            <p className="text-xs text-green-700 font-medium">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              Certificada
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-700">72</p>
              <p className="text-xs text-slate-600">Arquivos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-700">14</p>
              <p className="text-xs text-slate-600">Requisitos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-700">0</p>
              <p className="text-xs text-slate-600">Bugs</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}