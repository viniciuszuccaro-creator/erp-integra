import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

/**
 * WIDGET ETAPA 1 MINI
 * Versão ultra-compacta para outros dashboards
 */

export default function WidgetETAPA1Mini() {
  return (
    <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm text-slate-900">ETAPA 1</h3>
              <Badge className="bg-green-700 text-white text-xs">100%</Badge>
            </div>
            <p className="text-xs text-slate-600">Governança Completa</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}