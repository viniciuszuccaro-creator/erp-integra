import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Zap } from 'lucide-react';

/**
 * V21.5 - Status Widget Portal
 * Indica que o Portal está 100% completo
 */
export default function StatusWidgetPortal() {
  return (
    <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-xl w-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-green-900">Portal do Cliente V21.5</h3>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-sm text-green-700 font-medium">
              ✅ 100% COMPLETO • 19 Componentes • 14 Abas • Tempo Real • IA
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-800">
                📱 Responsivo
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-800">
                🤖 IA Integrada
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-purple-200 text-purple-800">
                ⚡ Tempo Real
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-orange-200 text-orange-800">
                🔐 Seguro
              </span>
              <span className="text-xs bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-800">
                📊 Analytics
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}