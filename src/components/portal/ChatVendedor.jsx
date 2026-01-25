import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ETAPA 3: Chat com Vendedor
 * Para portal cliente - comunicação direta
 */

export default function ChatVendedor({ cliente }) {
  const { user } = useUser();
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!mensagem.trim()) return;

    setEnviando(true);
    try {
      // Criar interação
      await base44.entities.Interacao.create({
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        tipo: 'Mensagem',
        descricao: mensagem,
        data_hora: new Date().toISOString(),
        responsavel: user?.full_name || user?.email,
        canal_origem: 'Portal do Cliente',
        resultado: 'Pendente'
      });

      // Notificar vendedor por email
      if (cliente.vendedor_responsavel_id) {
        await base44.integrations.Core.SendEmail({
          to: cliente.vendedor_responsavel_id, // Assumindo que é email
          subject: `Mensagem de ${cliente.nome} - Portal`,
          body: `O cliente ${cliente.nome} enviou uma mensagem:\n\n${mensagem}\n\nAcesse o sistema para responder.`
        });
      }

      toast.success('Mensagem enviada ao vendedor!');
      setMensagem('');
    } catch (err) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Fale com seu Vendedor
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {cliente.vendedor_responsavel && (
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">
              👤 {cliente.vendedor_responsavel}
            </p>
            <p className="text-xs text-blue-600">Seu vendedor responsável</p>
          </div>
        )}

        <Textarea
          placeholder="Digite sua mensagem..."
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={4}
        />

        <Button
          onClick={enviar}
          disabled={enviando || !mensagem.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {enviando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}