import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';

/**
 * ETAPA 3: Widget Notificações Automáticas
 * Mostra histórico de notificações
 */

export default function WidgetNotificacoesAuto({ entrega }) {
  const notificacoes = entrega?.notificacoes_enviadas || [];

  const iconMap = {
    'WhatsApp': MessageCircle,
    'E-mail': Mail,
    'Email': Mail,
    'SMS': MessageCircle,
    'Sistema': Bell
  };

  return (
    <Card className="w-full border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notificações Automáticas
        </CardTitle>
        <p className="text-xs text-slate-600">
          {notificacoes.length} notificação(ões) enviada(s)
        </p>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {notificacoes.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            Nenhuma notificação enviada ainda
          </p>
        ) : (
          notificacoes.slice(0, 5).map((n, idx) => {
            const Icon = iconMap[n.canal] || Bell;
            return (
              <div key={idx} className="flex items-start gap-2 text-sm p-2 bg-white rounded border">
                <Icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{n.tipo}</p>
                  <p className="text-xs text-slate-600">
                    {n.canal} • {new Date(n.data_envio).toLocaleString('pt-BR')}
                  </p>
                </div>
                {n.status_envio === 'Entregue' && (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            );
          })
        )}

        {notificacoes.length > 0 && (
          <div className="pt-2 border-t">
            <Badge className="bg-blue-600 w-full justify-center text-xs">
              ✓ Automático via ETAPA 3
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}