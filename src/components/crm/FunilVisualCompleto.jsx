import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Star,
  AlertCircle,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import { toast } from 'sonner';

export default function FunilVisualCompleto() {
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
    { id: 'Fechado Ganho', titulo: 'Ganho', cor: 'bg-green-600' },
    { id: 'Fechado Perdido', titulo: 'Perdido', cor: 'bg-red-500' }
  ];

  const calcularMetricas = () => {
    const totalLeads = leads.length;
    const ganhos = leads.filter(l => l.estagio_funil === 'Fechado Ganho').length;
    const perdidos = leads.filter(l => l.estagio_funil === 'Fechado Perdido').length;
    const taxaConversao = totalLeads > 0 ? (ganhos / totalLeads * 100).toFixed(1) : 0;
    const valorPipeline = leads
      .filter(l => !l.estagio_funil.includes('Fechado'))
      .reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

    return { totalLeads, ganhos, perdidos, taxaConversao, valorPipeline };
  };

  const metricas = calcularMetricas();

  const abrirDetalhesLead = (lead) => {
    openWindow(
      () => import('@/components/crm/DetalhesLeadIA'),
      { leadId: lead.id },
      {
        title: `Lead: ${lead.nome}`,
        width: 1000,
        height: 700
      }
    );
  };

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Funil de Vendas com IA
            </h1>
            <p className="text-sm text-slate-600">
              Etapa 10 - CRM Inteligente & Priorização Automática
            </p>
          </div>

          <Button
            onClick={() => openWindow(
              () => import('@/components/crm/NovoLead'),
              {},
              { title: 'Novo Lead', width: 800, height: 600 }
            )}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
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
                  <p className="text-2xl font-bold">{metricas.totalLeads}</p>
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
                  <p className="text-2xl font-bold text-green-600">{metricas.ganhos}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Perdidos</p>
                  <p className="text-2xl font-bold text-red-600">{metricas.perdidos}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-purple-600">{metricas.taxaConversao}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pipeline</p>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {(metricas.valorPipeline / 1000).toFixed(0)}k
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="flex-1 overflow-x-auto mt-6">
        <div className="flex gap-4 h-full" style={{ minWidth: 'max-content' }}>
          {estagios.map(estagio => {
            const leadsEstagio = leads.filter(l => l.estagio_funil === estagio.id);
            const valorTotal = leadsEstagio.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);
            
            return (
              <div key={estagio.id} className="flex-shrink-0 w-72 flex flex-col">
                <div className={`${estagio.cor} text-white rounded-t-lg p-3 flex items-center justify-between`}>
                  <span className="font-semibold">{estagio.titulo}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {leadsEstagio.length}
                  </Badge>
                </div>

                <div className="bg-slate-100 p-2 text-sm text-center">
                  <span className="font-medium">
                    R$ {(valorTotal / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="flex-1 bg-slate-50 rounded-b-lg p-2 overflow-y-auto space-y-2">
                  {leadsEstagio
                    .sort((a, b) => (b.prioridade_ia || 0) - (a.prioridade_ia || 0))
                    .map(lead => (
                      <Card 
                        key={lead.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => abrirDetalhesLead(lead)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{lead.nome}</p>
                              <p className="text-xs text-slate-600">{lead.empresa || 'Sem empresa'}</p>
                            </div>
                            {lead.prioridade_ia >= 70 && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Valor:</span>
                              <span className="font-medium">
                                R$ {(lead.valor_estimado || 0).toLocaleString('pt-BR')}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Probabilidade:</span>
                              <Badge variant="secondary" className="text-xs">
                                {lead.probabilidade || 0}%
                              </Badge>
                            </div>

                            {lead.prioridade_ia && (
                              <div className="bg-purple-50 border border-purple-200 rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Star className="w-3 h-3 text-purple-600" />
                                  <span className="text-xs font-medium text-purple-900">
                                    Score IA: {lead.prioridade_ia.toFixed(0)}
                                  </span>
                                </div>
                                {lead.motivo_priorizacao && (
                                  <p className="text-xs text-purple-800">
                                    {lead.motivo_priorizacao}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-400 absolute bottom-3 right-3" />
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