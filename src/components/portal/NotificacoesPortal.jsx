import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, Package, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function NotificacoesPortal() {
  const { data: notificacoes = [] } = useQuery({
    queryKey: ['notificacoes-portal'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.Notificacao.filter(
        { usuario_id: user.id, lida: false },
        '-created_date',
        10
      );
    },
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  const getIconByTipo = (tipo) => {
    switch (tipo) {
      case 'pedido':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'nfe':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'alerta':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'sucesso':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const marcarComoLida = async (notifId) => {
    await base44.entities.Notificacao.update(notifId, { lida: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {notificacoes.length > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs">
              {notificacoes.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <h3 className="font-bold text-lg">Notificações</h3>
          <p className="text-xs text-blue-100">{notificacoes.length} não lida(s)</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notificacoes.length > 0 ? (
            notificacoes.map((notif) => (
              <div
                key={notif.id}
                className="p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => marcarComoLida(notif.id)}
              >
                <div className="flex items-start gap-3">
                  {getIconByTipo(notif.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{notif.titulo}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.mensagem}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {format(new Date(notif.created_date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}