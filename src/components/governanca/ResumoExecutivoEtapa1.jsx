import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, Database, Activity } from 'lucide-react';

/**
 * RESUMO EXECUTIVO ETAPA 1 - WIDGET COMPACTO
 * Para inserir em outros dashboards
 */

export default function ResumoExecutivoEtapa1() {
  return (
    <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-green-900">ETAPA 1 Completa</h3>
            <Badge className="bg-green-700">100% Certificado</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="text-slate-700">RBAC</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-purple-600" />
            <span className="text-slate-700">Multi</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-600" />
            <span className="text-slate-700">Audit</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-green-300">
          <p className="text-xs text-green-800">
            ✅ 9 backends • 20+ componentes • 11 dashboards
          </p>
        </div>
      </CardContent>
    </Card>
  );
}