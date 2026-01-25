import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, MapPin, FileText } from 'lucide-react';

/**
 * ETAPA 3: Histórico Completo da Entrega
 * Todas as mudanças e eventos registrados
 */

export default function HistoricoEntregaCompleto({ entrega }) {
  const historico = entrega?.historico_status || [];
  const notificacoes = entrega?.notificacoes_enviadas || [];
  const ocorrencias = entrega?.ocorrencias || [];

  // Combinar todos os eventos e ordenar por data
  const todosEventos = [
    ...historico.map(h => ({ ...h, tipo: 'status', icon: Clock })),
    ...notificacoes.map(n => ({ ...n, tipo: 'notificacao', icon: FileText, data_hora: n.data_envio })),
    ...ocorrencias.map(o => ({ ...o, tipo: 'ocorrencia', icon: MapPin }))
  ].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

  const getTipoCor = (tipo) => {
    switch (tipo) {
      case 'status': return 'bg-blue-600';
      case 'notificacao': return 'bg-green-600';
      case 'ocorrencia': return 'bg-orange-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Histórico Completo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {todosEventos.map((evento, idx) => {
              const Icon = evento.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded border">
                  <Icon className="w-4 h-4 text-slate-500 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getTipoCor(evento.tipo)} style={{ fontSize: '0.65rem' }}>
                        {evento.tipo}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(evento.data_hora).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium">
                      {evento.status || evento.tipo_evento || evento.tipo_notificacao || 'Evento'}
                    </p>
                    
                    {evento.observacao && (
                      <p className="text-xs text-slate-600 mt-1">{evento.observacao}</p>
                    )}
                    
                    {evento.descricao && (
                      <p className="text-xs text-slate-600 mt-1">{evento.descricao}</p>
                    )}
                    
                    {evento.mensagem && (
                      <p className="text-xs text-slate-600 mt-1">{evento.mensagem}</p>
                    )}
                    
                    {evento.usuario && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        {evento.usuario}
                      </div>
                    )}
                    
                    {evento.localizacao && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                        <MapPin className="w-3 h-3" />
                        {evento.localizacao.latitude?.toFixed(5)}, {evento.localizacao.longitude?.toFixed(5)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {todosEventos.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">
                Nenhum evento registrado
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}