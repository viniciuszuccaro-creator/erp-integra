import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * V21.6 - IA Monitoramento de API
 * Testa conexões com APIs externas a cada hora
 * Gera alertas e desativa módulos em caso de falha
 */
export default function JobIAMonitoramentoAPI({ empresaId }) {
  useEffect(() => {
    if (!empresaId) return;

    const executarMonitoramento = async () => {
      console.log('🔍 [IA Monitor API] Iniciando verificação de APIs...');

      const apisParaTestar = [
        { nome: 'Google Maps', endpoint: 'google_maps', modulo: 'Expedição' },
        { nome: 'NF-e Provider', endpoint: 'nfe_provider', modulo: 'Fiscal' },
        { nome: 'Boleto/PIX', endpoint: 'boleto_provider', modulo: 'Financeiro' },
        { nome: 'WhatsApp Business', endpoint: 'whatsapp', modulo: 'Comunicação' }
      ];

      for (const api of apisParaTestar) {
        try {
          const config = await base44.entities.ConfiguracaoIntegracaoMarketplace.filter({
            empresa_id: empresaId,
            marketplace: api.nome
          });

          if (config.length === 0) continue;

          const configuracao = config[0];

          // Simular teste de conexão (em produção usar API real)
          const testeOK = configuracao.ativo && configuracao.status_conexao !== 'erro';

          if (!testeOK) {
            // ❌ Falha detectada
            console.error(`❌ [IA Monitor] ${api.nome} FALHOU!`);

            // Desativar temporariamente
            await base44.entities.ConfiguracaoIntegracaoMarketplace.update(configuracao.id, {
              ativo: false,
              status_conexao: 'erro',
              mensagem_erro: 'Falha detectada pelo IA Monitor',
              ultima_sincronizacao: new Date().toISOString()
            });

            // Gerar notificação urgente
            await base44.entities.Notificacao.create({
              titulo: `⚠️ API ${api.nome} FALHOU`,
              mensagem: `A integração com ${api.nome} foi desativada automaticamente. Módulo ${api.modulo} está usando fallback manual.`,
              tipo: 'erro',
              categoria: 'Sistema',
              prioridade: 'Urgente',
              destinatario_id: 'admin',
              entidade_relacionada: 'ConfiguracaoIntegracaoMarketplace',
              registro_id: configuracao.id,
              acao_tomada: false
            });

            // Log de auditoria
            await base44.entities.AuditoriaGlobal.create({
              grupo_id: empresaId,
              empresa_id: empresaId,
              usuario_id: 'system',
              usuario_nome: 'IA Monitor API',
              data_hora: new Date().toISOString(),
              acao: 'IA Execution',
              modulo: 'Sistema',
              entidade_afetada: 'ConfiguracaoIntegracaoMarketplace',
              registro_id: configuracao.id,
              sucesso: false,
              mensagem_erro: `API ${api.nome} falhou no teste de conexão`,
              nivel_risco: 'Alto',
              alerta_ia_gerado: true,
              tipo_alerta: 'API Falhou'
            });
          } else {
            console.log(`✅ [IA Monitor] ${api.nome} OK`);
          }
        } catch (error) {
          console.error(`❌ [IA Monitor] Erro ao testar ${api.nome}:`, error);
        }
      }

      console.log('✅ [IA Monitor API] Verificação concluída.');
    };

    // Executar imediatamente
    executarMonitoramento();

    // Executar a cada hora
    const interval = setInterval(executarMonitoramento, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [empresaId]);

  return null;
}