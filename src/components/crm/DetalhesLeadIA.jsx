import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import IALeadScoring from './IALeadScoring';
import { User, Mail, Phone, Building, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function DetalhesLeadIA({ leadId }) {
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const lista = await base44.entities.FunilCRM.list();
      return lista.find(l => l.id === leadId);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{lead?.nome}</h1>
        <Badge>{lead?.estagio_funil}</Badge>
      </div>

      <div className="flex-1 overflow-auto grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-600" />
                <span>{lead?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-600" />
                <span>{lead?.telefone}</span>
              </div>
              {lead?.empresa && (
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-slate-600" />
                  <span>{lead.empresa}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interações ({lead?.interacoes?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lead?.interacoes?.slice(0, 5).map((int, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 bg-slate-50 p-3 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary">{int.tipo}</Badge>
                      <span className="text-xs text-slate-600">
                        {format(new Date(int.data), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">{int.resumo}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <IALeadScoring lead={lead} />
        </div>
      </div>
    </div>
  );
}