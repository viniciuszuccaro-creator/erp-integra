import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * V21.6 - IA de Risco Global
 * Correlaciona falhas de API com impactos financeiros
 * Ex: Falha NF-e → Aumento de inadimplência
 */
export default function IARiscoGlobal({ empresaId }) {
  useEffect(() => {
    if (!empresaId) return;

    const executarAnalise = async () => {
      console.log('🎯 [IA Risco Global] Analisando correlações...');

      try {
        // Buscar falhas de API nas últimas 24h
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);

        const falhasAPI = await base44.entities.AuditoriaGlobal.filter({
          empresa_id: empresaId,
          modulo: 'Fiscal',
          sucesso: false,
          'data_hora': { $gte: ontem.toISOString() }
        });

        if (falhasAPI.length === 0) {
          console.log('✅ [IA Risco] Nenhuma falha detectada.');
          return;
        }

        // Buscar contas a receber vencidas do mesmo período
        const contasVencidas = await base44.entities.ContaReceber.filter({
          empresa_id: empresaId,
          status: 'Atrasado',
          'data_vencimento': { $gte: ontem.toISOString().split('T')[0] }
        });

        // Correlacionar: Se houve falhas de NF-e E aumento de inadimplência
        if (falhasAPI.length >= 3 && contasVencidas.length >= 5) {
          console.log('⚠️ [IA Risco] CORRELAÇÃO DETECTADA: Falha Fiscal → Instabilidade Financeira');

          // Gerar alerta de risco sistêmico
          await base44.entities.Notificacao.create({
            titulo: '🚨 Alerta de Risco Sistêmico',
            mensagem: `A IA detectou correlação entre ${falhasAPI.length} falha(s) de NF-e e ${contasVencidas.length} conta(s) vencida(s) nas últimas 24h. Possível impacto financeiro pós-falha fiscal. Recomenda-se verificar urgentemente as integrações.`,
            tipo: 'erro',
            categoria: 'Sistema',
            prioridade: 'Urgente',
            destinatario_id: 'admin',
            entidade_relacionada: 'AuditoriaGlobal',
            acao_tomada: false
          });

          // Log de risco
          await base44.entities.AuditoriaGlobal.create({
            grupo_id: empresaId,
            empresa_id: empresaId,
            usuario_id: 'system',
            usuario_nome: 'IA Risco Global',
            data_hora: new Date().toISOString(),
            acao: 'IA Execution',
            modulo: 'Sistema',
            descricao: `Correlação: ${falhasAPI.length} falhas API + ${contasVencidas.length} contas vencidas`,
            sucesso: true,
            nivel_risco: 'Crítico',
            alerta_ia_gerado: true,
            tipo_alerta: 'Risco Sistêmico'
          });
        }

        console.log('✅ [IA Risco Global] Análise concluída.');
      } catch (error) {
        console.error('❌ [IA Risco Global] Erro:', error);
      }
    };

    // Executar a cada 2 horas
    const interval = setInterval(executarAnalise, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [empresaId]);

  return null;
}