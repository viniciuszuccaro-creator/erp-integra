import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { MessageCircle, Send, CheckCircle, AlertCircle } from "lucide-react";
import { mockEnviarWhatsApp, avisoModoSimulacao } from "@/components/integracoes/MockIntegracoes";

/**
 * Componente para envio de WhatsApp automático nas entregas
 * EM MODO SIMULAÇÃO
 */
export default function EnvioMensagemAutomatica({ entrega, tipo = "saida_entrega" }) {
  const [enviando, setEnviando] = useState(false);
  const [mensagemCustom, setMensagemCustom] = useState("");
  const [enviado, setEnviado] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const templates = {
    saida_entrega: `🚚 Olá! Seu pedido saiu para entrega!\n\n📦 Pedido: ${entrega.numero_pedido}\n📍 Previsão: Hoje\n🔍 Rastreio: ${entrega.qr_code || entrega.codigo_rastreamento}\n\nQualquer dúvida, estamos à disposição!`,
    
    confirmacao_pedido: `✅ Pedido confirmado!\n\n📦 Número: ${entrega.numero_pedido}\n📅 Previsão de entrega: ${entrega.data_previsao ? new Date(entrega.data_previsao).toLocaleDateString('pt-BR') : 'A definir'}\n\nObrigado pela preferência!`,
    
    entrega_realizada: `✅ Entrega concluída!\n\n📦 Pedido: ${entrega.numero_pedido}\n⏰ Entregue em: ${new Date().toLocaleString('pt-BR')}\n\nObrigado pela confiança!`
  };

  const enviarMensagemMutation = useMutation({
    mutationFn: async (mensagem) => {
      const telefone = entrega.contato_entrega?.whatsapp || entrega.contato_entrega?.telefone;

      if (!telefone) {
        throw new Error("Cliente não possui WhatsApp cadastrado");
      }

      // MOCK: Enviar WhatsApp simulado
      const resultado = await mockEnviarWhatsApp({
        telefone: telefone,
        mensagem: mensagem,
        anexos: []
      });

      // Atualizar entrega com histórico de notificação
      const notificacoesAtuais = entrega.notificacoes_enviadas || [];
      
      await base44.entities.Entrega.update(entrega.id, {
        notificacoes_enviadas: [
          ...notificacoesAtuais,
          {
            tipo: tipo === "saida_entrega" ? "Saída" : tipo === "entrega_realizada" ? "Entregue" : "Confirmação",
            canal: "WhatsApp",
            destinatario: telefone,
            data_envio: new Date().toISOString(),
            status_envio: "Enviado",
            mensagem: mensagem,
            message_id: resultado.message_id,
            __simulado__: true
          }
        ]
      });

      // Registrar no histórico do cliente
      await base44.entities.HistoricoCliente.create({
        empresa_id: entrega.empresa_id,
        cliente_id: entrega.cliente_id,
        cliente_nome: entrega.cliente_nome,
        modulo_origem: "Expedicao",
        referencia_id: entrega.id,
        referencia_tipo: "Entrega",
        referencia_numero: entrega.numero_pedido,
        tipo_evento: "Comunicacao",
        titulo_evento: "WhatsApp Enviado (Simulação)",
        descricao_detalhada: mensagem,
        usuario_responsavel: "Sistema",
        data_evento: new Date().toISOString(),
        whatsapp_envio: true,
        whatsapp_mensagem: mensagem,
        whatsapp_status: "Enviado"
      });

      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['historico-cliente'] });
      
      setEnviado(true);
      toast({
        title: "✅ WhatsApp Enviado (Simulação)",
        description: `Mensagem registrada no histórico`
      });
    }
  });

  const handleEnviar = (template) => {
    const mensagem = template || mensagemCustom;
    if (!mensagem) {
      toast({ title: "⚠️ Digite uma mensagem", variant: "destructive" });
      return;
    }

    setEnviando(true);
    enviarMensagemMutation.mutate(mensagem);
    setTimeout(() => setEnviando(false), 1500);
  };

  const aviso = avisoModoSimulacao();

  return (
    <Card>
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="w-5 h-5 text-green-600" />
          Notificação WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-amber-300 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs">
            <strong>{aviso.titulo}</strong> - {aviso.mensagem}
          </AlertDescription>
        </Alert>

        {enviado ? (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <div className="flex items-center gap-2 text-green-900 font-semibold mb-2">
              <CheckCircle className="w-5 h-5" />
              Mensagem Enviada! (Simulação)
            </div>
            <p className="text-sm text-green-700">
              Para: {entrega.contato_entrega?.whatsapp || entrega.contato_entrega?.telefone}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Registrado no histórico do cliente
            </p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm text-slate-700 mb-2">
                <strong>Destinatário:</strong> {entrega.contato_entrega?.nome || entrega.cliente_nome}
              </p>
              <p className="text-sm text-slate-700">
                <strong>WhatsApp:</strong> {entrega.contato_entrega?.whatsapp || entrega.contato_entrega?.telefone || 'Não cadastrado'}
              </p>
            </div>

            <div>
              <Label>Templates Prontos</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEnviar(templates.confirmacao_pedido)}
                  disabled={enviando}
                >
                  Confirmação
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEnviar(templates.saida_entrega)}
                  disabled={enviando}
                >
                  Saída
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEnviar(templates.entrega_realizada)}
                  disabled={enviando}
                >
                  Entregue
                </Button>
              </div>
            </div>

            <div>
              <Label>Ou escreva uma mensagem personalizada:</Label>
              <Textarea
                value={mensagemCustom}
                onChange={(e) => setMensagemCustom(e.target.value)}
                placeholder="Digite sua mensagem..."
                rows={4}
                className="mt-2"
              />
            </div>

            <Button
              onClick={() => handleEnviar(null)}
              disabled={enviando || !mensagemCustom}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem (Simulação)
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}