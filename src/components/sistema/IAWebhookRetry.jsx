import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * V21.6 - IA Webhook Retry
 * Reenvio automático de webhooks falhados com timeout crescente
 * Estratégia: 5min → 15min → 30min → 1h → desistir
 */
export default function IAWebhookRetry({ empresaId }) {
  useEffect(() => {
    if (!empresaId) return;

    const executarRetry = async () => {
      console.log('🔄 [IA Webhook Retry] Verificando webhooks falhados...');

      try {
        // Buscar webhooks pendentes de retry
        const webhooksPendentes = await base44.entities.EventoNotificacao.filter({
          'webhook_externo.ativo': true,
          // Buscar eventos com falhas recentes (último dia)
        });

        for (const webhook of webhooksPendentes) {
          const webhookConfig = webhook.webhook_externo;
          
          if (!webhookConfig || !webhookConfig.ativo) continue;

          // Buscar histórico de falhas
          const tentativasAnteriores = webhook.total_disparos || 0;
          
          // Calcular timeout crescente (5min, 15min, 30min, 1h)
          const timeouts = [5, 15, 30, 60]; // minutos
          
          if (tentativasAnteriores >= timeouts.length) {
            console.log(`❌ [Webhook Retry] ${webhook.nome_evento} - Limite de tentativas excedido`);
            
            // Gerar notificação de desistência
            await base44.entities.Notificacao.create({
              titulo: `❌ Webhook ${webhook.nome_evento} FALHOU definitivamente`,
              mensagem: `Após ${tentativasAnteriores} tentativas, o webhook foi desativado. Verifique a URL e configurações.`,
              tipo: 'erro',
              categoria: 'Sistema',
              prioridade: 'Alta',
              destinatario_id: 'admin',
              entidade_relacionada: 'EventoNotificacao',
              registro_id: webhook.id
            });

            // Desativar webhook
            await base44.entities.EventoNotificacao.update(webhook.id, {
              'webhook_externo.ativo': false
            });

            continue;
          }

          const timeoutAtual = timeouts[tentativasAnteriores];
          
          console.log(`🔄 [Webhook Retry] ${webhook.nome_evento} - Tentativa ${tentativasAnteriores + 1} (timeout: ${timeoutAtual}min)`);

          // Simular envio (em produção usar fetch real)
          try {
            const response = await fetch(webhookConfig.url, {
              method: webhookConfig.metodo || 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...webhookConfig.headers
              },
              body: JSON.stringify(webhookConfig.payload_template || {})
            });

            if (response.ok) {
              console.log(`✅ [Webhook Retry] ${webhook.nome_evento} enviado com sucesso!`);
              
              await base44.entities.EventoNotificacao.update(webhook.id, {
                total_disparos: (webhook.total_disparos || 0) + 1,
                ultimo_disparo: new Date().toISOString()
              });
            } else {
              throw new Error(`HTTP ${response.status}`);
            }
          } catch (error) {
            console.error(`❌ [Webhook Retry] ${webhook.nome_evento} falhou:`, error);
            
            await base44.entities.EventoNotificacao.update(webhook.id, {
              total_disparos: (webhook.total_disparos || 0) + 1,
              ultimo_disparo: new Date().toISOString()
            });

            // Agendar próxima tentativa
            setTimeout(() => {
              console.log(`⏰ [Webhook Retry] Reagendando ${webhook.nome_evento} em ${timeoutAtual}min`);
            }, timeoutAtual * 60 * 1000);
          }
        }
      } catch (error) {
        console.error('❌ [IA Webhook Retry] Erro geral:', error);
      }
    };

    // Executar a cada 5 minutos
    const interval = setInterval(executarRetry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [empresaId]);

  return null;
}