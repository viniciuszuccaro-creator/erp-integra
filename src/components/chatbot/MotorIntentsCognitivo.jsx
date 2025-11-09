import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * V21.6 - Motor de Intents Cognitivo
 * Autoaprendizado: Monitora score de confiança e solicita retreinamento
 * Transbordo Inteligente: Identifica perfil preferencial para cada intent
 */
export default function MotorIntentsCognitivo({ empresaId }) {
  useEffect(() => {
    if (!empresaId) return;

    const executarMonitoramento = async () => {
      console.log('🧠 [Motor Intents] Analisando performance dos intents...');

      try {
        // Buscar todos os logs do chatbot dos últimos 3 dias
        const tresDiasAtras = new Date();
        tresDiasAtras.setDate(tresDiasAtras.getDate() - 3);

        const logsRecentes = await base44.entities.AuditoriaGlobal.filter({
          empresa_id: empresaId,
          modulo: 'CRM',
          acao: 'IA Execution',
          'data_hora': { $gte: tresDiasAtras.toISOString() }
        });

        // Agrupar por intent e calcular score médio
        const intentStats = {};

        logsRecentes.forEach(log => {
          const intent = log.observacoes; // Nome do intent
          if (!intent) return;

          if (!intentStats[intent]) {
            intentStats[intent] = {
              total: 0,
              sucessos: 0,
              scoreTotal: 0
            };
          }

          intentStats[intent].total++;
          if (log.sucesso) {
            intentStats[intent].sucessos++;
          }
        });

        // Analisar cada intent
        for (const [intentNome, stats] of Object.entries(intentStats)) {
          const scoreMedio = stats.total > 0 ? (stats.sucessos / stats.total * 100) : 100;

          console.log(`📊 [Motor Intents] ${intentNome}: ${scoreMedio.toFixed(1)}% (${stats.sucessos}/${stats.total})`);

          // IA Autoaprendizado: Score < 70% por 3 dias → Alerta
          if (scoreMedio < 70 && stats.total >= 10) {
            console.log(`⚠️ [Motor Intents] ${intentNome} com performance baixa!`);

            // Gerar notificação para Gerente de Produto
            await base44.entities.Notificacao.create({
              titulo: `🧠 Intent "${intentNome}" precisa de retreinamento`,
              mensagem: `A IA detectou que o intent "${intentNome}" está com score de ${scoreMedio.toFixed(1)}% nos últimos 3 dias (${stats.total} interações). Recomenda-se revisar o prompt ou adicionar mais exemplos de treinamento.`,
              tipo: 'aviso',
              categoria: 'CRM',
              prioridade: 'Alta',
              destinatario_id: 'admin',
              entidade_relacionada: 'ChatbotIntent',
              acao_tomada: false
            });

            // Log de auditoria
            await base44.entities.AuditoriaGlobal.create({
              grupo_id: empresaId,
              empresa_id: empresaId,
              usuario_id: 'system',
              usuario_nome: 'IA Motor Intents',
              data_hora: new Date().toISOString(),
              acao: 'IA Execution',
              modulo: 'CRM',
              entidade_afetada: 'ChatbotIntent',
              descricao: `Intent ${intentNome} com score baixo: ${scoreMedio.toFixed(1)}%`,
              sucesso: true,
              nivel_risco: 'Médio',
              alerta_ia_gerado: true,
              tipo_alerta: 'Performance Baixa'
            });
          }
        }

        console.log('✅ [Motor Intents] Análise concluída.');
      } catch (error) {
        console.error('❌ [Motor Intents] Erro:', error);
      }
    };

    // Executar diariamente às 8h
    const agora = new Date();
    const proximaExecucao = new Date();
    proximaExecucao.setHours(8, 0, 0, 0);
    
    if (proximaExecucao < agora) {
      proximaExecucao.setDate(proximaExecucao.getDate() + 1);
    }

    const timeout = proximaExecucao - agora;
    const timeoutId = setTimeout(() => {
      executarMonitoramento();
      const interval = setInterval(executarMonitoramento, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [empresaId]);

  return null;
}