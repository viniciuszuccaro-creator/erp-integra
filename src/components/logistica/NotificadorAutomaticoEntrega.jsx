import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Loader2, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';

/**
 * ETAPA 3: Notificador Automático de Entrega
 * Envia notificações ao cliente
 */

export default function NotificadorAutomaticoEntrega({ pedido, entrega, onClose }) {
  const { user } = useUser();
  const [canal, setCanal] = useState('email');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setEnviando(true);
    try {
      // Invocar backend
      await base44.functions.invoke('notificarStatusEntrega', {
        entrega_id: entrega?.id || null,
        pedido_id: pedido.id,
        novo_status: pedido.status,
        mensagem_adicional: mensagemPersonalizada,
        canal
      });

      toast.success('✅ Notificação enviada!');
      onClose?.();
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notificar Cliente
        </CardTitle>
        <p className="text-sm text-slate-600">
          Pedido: {pedido.numero_pedido} • Cliente: {pedido.cliente_nome}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-1">Status Atual:</p>
          <Badge className="bg-blue-600">{pedido.status}</Badge>
        </div>

        {/* Canal */}
        <div>
          <label className="block text-sm font-medium mb-2">Canal de Notificação</label>
          <div className="flex gap-2">
            <Button
              onClick={() => setCanal('email')}
              variant={canal === 'email' ? 'default' : 'outline'}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button
              onClick={() => setCanal('whatsapp')}
              variant={canal === 'whatsapp' ? 'default' : 'outline'}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Mensagem */}
        <div>
          <label className="block text-sm font-medium mb-2">Mensagem Adicional (opcional)</label>
          <Textarea
            value={mensagemPersonalizada}
            onChange={(e) => setMensagemPersonalizada(e.target.value)}
            placeholder="Adicione informações extras para o cliente..."
            rows={3}
          />
        </div>

        {/* Preview */}
        <div className="p-3 bg-slate-50 rounded border">
          <p className="text-xs text-slate-600 mb-2">Preview da mensagem:</p>
          <p className="text-sm">
            Olá <strong>{pedido.cliente_nome}</strong>,<br />
            Seu pedido <strong>{pedido.numero_pedido}</strong> está com status: <strong>{pedido.status}</strong>.
            {mensagemPersonalizada && (
              <>
                <br /><br />
                {mensagemPersonalizada}
              </>
            )}
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            onClick={enviar}
            disabled={enviando}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Notificação
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}