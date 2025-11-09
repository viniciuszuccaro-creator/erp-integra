
import React, { useEffect } from "react";
import { executarReguaCobranca } from "@/components/financeiro/ReguaCobrancaIA";
import executarIAPrevisaoPagamento from "@/components/financeiro/JobIAPrevisaoPagamento";
import executarIADIFALUpdate from "@/components/fiscal/JobIADIFALUpdate";
import { executarIAReposicaoPreditiva } from "@/components/estoque/JobIAReposicaoPreditiva";
import executarIAAuditoriaLocal from "@/components/estoque/JobIAAuditoriaLocal";
import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Agendador de Jobs de IA (Background) - COMPLETO
 * Jobs Ativos: 6 (Financeiro + Fiscal + Estoque)
 *
 * EM PRODUÇÃO: Usar cron real ou scheduler do Base44
 */
export default function AgendadorJobsIA({ empresaId }) {
  useEffect(() => {
    console.log('⏰ Agendador de Jobs IA iniciado...');

    // Job 1: IA DIFAL Update (Diário - 1h)
    const jobDIFAL = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 1) {
        console.log('⏰ [1h] Executando IA DIFAL Update...');
        await executarIADIFALUpdate();
      }
    }, 60 * 60 * 1000);

    // Job 2: Régua de Cobrança IA (Diário - 2h)
    const jobReguaCobranca = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 2) {
        console.log('⏰ [2h] Executando Régua de Cobrança IA...');
        await executarReguaCobranca(empresaId);
      }
    }, 60 * 60 * 1000);

    // Job 3: IA Previsão Pagamento (Diário - 3h)
    const jobPrevisaoPagamento = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 3) {
        console.log('⏰ [3h] Executando IA Previsão de Pagamento...');
        await executarIAPrevisaoPagamento(empresaId);
      }
    }, 60 * 60 * 1000);

    // Job 4: IA Reposição Preditiva (Diário - 4h)
    const jobReposicao = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 4) {
        console.log('⏰ [4h] Executando IA Reposição Preditiva...');
        await executarIAReposicaoPreditiva(empresaId);
      }
    }, 60 * 60 * 1000);

    // V21.4: Job IA Cross-CD (5h)
    const jobCrossCD = setInterval(async () => {
      const agora = new Date();
      if (agora.getHours() === 5) {
        console.log('🚀 Executando Job: IA Cross-CD');
        const empresa = await base44.entities.Empresa.get(empresaId);
        if (empresa?.grupo_id) {
          const { executarJobCrossCD } = await import('@/components/compras/JobIACrossCD');
          await executarJobCrossCD(empresa.grupo_id);
        }
      }
    }, 1000 * 60 * 60); // 1h

    // Job 6: IA Auditoria Local (Diário - 6h) - V21.4 NOVO
    const jobAuditoria = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 6) {
        console.log('⏰ [6h] Executando IA Auditoria Local...');
        await executarIAAuditoriaLocal(empresaId);
      }
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(jobDIFAL);
      clearInterval(jobReguaCobranca);
      clearInterval(jobPrevisaoPagamento);
      clearInterval(jobReposicao);
      clearInterval(jobCrossCD);
      clearInterval(jobAuditoria);
    };
  }, [empresaId]);

  return null; // Componente invisível (background)
}
