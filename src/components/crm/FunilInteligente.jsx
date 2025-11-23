import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { toast } from 'sonner';

export default function FunilInteligente() {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['funil_crm'],
    queryFn: () => base44.entities.FunilCRM.list()
  });

  const estagios = [
    { id: 'Lead', titulo: 'Lead', cor: 'bg-slate-500' },
    { id: 'Qualificado', titulo: 'Qualificado', cor: 'bg-blue-500' },
    { id: 'Proposta Enviada', titulo: 'Proposta', cor: 'bg-indigo-500' },
    { id: 'Negociação', titulo: 'Negociação', cor: 'bg-purple-500' },
    { id: 'Fechado Ganho', titulo: 'Ganho', cor: 'bg-green-500' }
  ];

  const calcularMetricas = () => {
    const total = leads.length;
    const ganhos = leads.filter(l => l.estagio_funil === 'Fechado Ganho').length;
    const perdidos = leads.filter(l => l.estagio_funil === 'Fechado Perdido').length;
    const valorTotal = leads.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);
    const taxaConversao = total > 0 ? Math.round((ganhos / total) * 100) : 0;

    return { total, ganhos, perdidos, valorTotal, taxaConversao };
  };

  const stats = calcularMetricas();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="w-full h-full flex flex-col p-6 space-y-6">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Funil Comercial Inteligente</h1>
            <p className="text-sm text-slate-600">
              ETAPA 10 - CRM • Priorização por IA • Pós-Venda
            </p>
          </div>
          
          <Button className="bg-blue-600">
            <Users className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Leads</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Ganhos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ganhos}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Perdidos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.perdidos}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Valor Pipeline</p>
                  <p className="text-lg font-bold">
                    R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.taxaConversao}%</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content' }}>
          {estagios.map(estagio => {
            const leadsEstagio = leads.filter(l => l.estagio_funil === estagio.id);
            const valorEstagio = leadsEstagio.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

            return (
              <div key={estagio.id} className="flex-shrink-0 w-80 flex flex-col">
                <div className={`${estagio.cor} text-white rounded-t-lg p-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{estagio.titulo}</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {leadsEstagio.length}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">
                    R$ {valorEstagio.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </p>
                </div>

                <div className="flex-1 bg-slate-50 rounded-b-lg p-2 overflow-y-auto space-y-2">
                  {leadsEstagio
                    .sort((a, b) => (b.prioridade_ia || 0) - (a.prioridade_ia || 0))
                    .map(lead => (
                      <Card key={lead.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader className="p-3 pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-semibold">
                                {lead.nome}
                              </CardTitle>
                              <p className="text-xs text-slate-600 mt-1">{lead.empresa}</p>
                            </div>
                            
                            {lead.prioridade_ia > 70 && (
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="p-3 pt-0 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Valor Estimado:</span>
                            <span className="font-medium">
                              R$ {lead.valor_estimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Probabilidade:</span>
                            <span className="font-medium text-blue-600">{lead.probabilidade}%</span>
                          </div>

                          {lead.prioridade_ia > 0 && (
                            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <div className="flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-yellow-600" />
                                <span className="font-medium text-yellow-900">
                                  Prioridade IA: {lead.prioridade_ia}/100
                                </span>
                              </div>
                              {lead.motivo_priorizacao && (
                                <p className="text-yellow-700">{lead.motivo_priorizacao}</p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-1 pt-2">
                            <Button size="sm" variant="outline" className="flex-1 text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Contato
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {leadsEstagio.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-8">
                      Nenhum lead
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}