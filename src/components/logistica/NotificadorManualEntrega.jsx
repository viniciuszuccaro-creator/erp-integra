import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 3: Notificador Manual de Entrega
 * Permite enviar notificação manual ao cliente
 */

export default function NotificadorManualEntrega({ entrega }) {
  const [tipoNotificacao, setTipoNotificacao] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!tipoNotificacao) {
      toast.error('Selecione o tipo de notificação');
      return;
    }

    setEnviando(true);
    try {
      await base44.functions.invoke('notificarStatusEntrega', {
        entrega_id: entrega.id,
        novo_status: tipoNotificacao
      });
      toast.success('Notificação enviada ao cliente!');
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Mail className="w-4 h-4 text-blue-600" />
          Notificar Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={tipoNotificacao} onValueChange={setTipoNotificacao}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a notificação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Saiu para Entrega">🚚 Saiu para Entrega</SelectItem>
            <SelectItem value="Em Trânsito">📍 Em Trânsito</SelectItem>
            <SelectItem value="Entregue">✅ Entregue</SelectItem>
            <SelectItem value="Entrega Frustrada">⚠️ Entrega Frustrada</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={enviar}
          disabled={enviando || !tipoNotificacao}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          {enviando ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-3 h-3 mr-2" />
              Enviar Notificação
            </>
          )}
        </Button>

        {entrega.contato_entrega?.email && (
          <p className="text-xs text-slate-500 text-center">
            Para: {entrega.contato_entrega.email}
          </p>
        )}
      </CardContent>
    </Card>
  );
}