import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Award } from 'lucide-react';

/**
 * STATUS FINAL ETAPA 1 - WIDGET COMPACTO
 * Widget de status para outros dashboards
 */

export default function StatusFinalEtapa1_100() {
  const { data: perfis = [] } = useQuery({
    queryKey: ['perfis-widget'],
    queryFn: () => base44.entities.PerfilAcesso.list()
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios-widget'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['logs-widget'],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - 24);
      return base44.entities.AuditLog.filter({
        data_hora: { $gte: dataLimite.toISOString() }
      }, '-data_hora', 100);
    }
  });

  const checks = {
    rbac: perfis.length > 0 && usuarios.every(u => u.perfil_acesso_id),
    multiempresa: logs.some(l => l.entidade === 'MultiempresaValidator'),
    auditoria: logs.length > 0
  };

  const completo = Object.values(checks).every(Boolean);
  const percentual = Math.round((Object.values(checks).filter(Boolean).length / 3) * 100);

  return (
    <Card className={`border-2 ${completo ? 'border-green-400' : 'border-yellow-400'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 ${completo ? 'text-green-600' : 'text-yellow-600'}`} />
            <h3 className="font-semibold text-slate-900">ETAPA 1</h3>
          </div>
          <Badge className={completo ? 'bg-green-600' : 'bg-yellow-600'}>
            {percentual}%
          </Badge>
        </div>
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            {checks.rbac ? (
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            ) : (
              <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
            )}
            <span className="text-slate-600">RBAC Backend</span>
          </div>
          <div className="flex items-center gap-2">
            {checks.multiempresa ? (
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            ) : (
              <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
            )}
            <span className="text-slate-600">Multiempresa</span>
          </div>
          <div className="flex items-center gap-2">
            {checks.auditoria ? (
              <CheckCircle2 className="w-3 h-3 text-green-600" />
            ) : (
              <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
            )}
            <span className="text-slate-600">Auditoria</span>
          </div>
        </div>

        {completo && (
          <div className="mt-3 pt-3 border-t border-green-300 text-center">
            <span className="text-xs font-semibold text-green-700">
              ✅ CERTIFICADO
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}