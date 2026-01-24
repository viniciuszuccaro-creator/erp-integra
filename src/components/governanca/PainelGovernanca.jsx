import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Database, Activity, CheckCircle2 } from 'lucide-react';

/**
 * PAINEL GOVERNANÇA - WIDGET COMPACTO
 * Resumo visual do status de governança para dashboards
 */

export default function PainelGovernanca({ dados }) {
  const {
    rbacAtivo = false,
    multiempresaAtivo = false,
    auditoriaAtiva = false,
    conformidade = 0
  } = dados || {};

  const pilares = [
    {
      nome: 'RBAC',
      ativo: rbacAtivo,
      icon: Shield,
      cor: 'blue'
    },
    {
      nome: 'Multiempresa',
      ativo: multiempresaAtivo,
      icon: Database,
      cor: 'purple'
    },
    {
      nome: 'Auditoria',
      ativo: auditoriaAtiva,
      icon: Activity,
      cor: 'green'
    }
  ];

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Governança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-slate-900">{conformidade}%</span>
          <Badge className={conformidade >= 90 ? 'bg-green-600' : 'bg-yellow-600'}>
            {conformidade >= 90 ? 'Conforme' : 'Em Progresso'}
          </Badge>
        </div>

        <div className="space-y-2">
          {pilares.map((pilar) => (
            <div key={pilar.nome} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <pilar.icon className={`w-4 h-4 text-${pilar.cor}-600`} />
                <span className="text-slate-700">{pilar.nome}</span>
              </div>
              {pilar.ativo ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <span className="text-xs text-slate-400">Pendente</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}