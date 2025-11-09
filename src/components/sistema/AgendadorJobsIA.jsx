import React, { useEffect } from "react";
import { executarReguaCobranca } from "@/components/financeiro/ReguaCobrancaIA";
import executarIAPrevisaoPagamento from "@/components/financeiro/JobIAPrevisaoPagamento";
import executarIADIFALUpdate from "@/components/fiscal/JobIADIFALUpdate";
import { executarIAReposicaoPreditiva } from "@/components/estoque/JobIAReposicaoPreditiva";
import executarIACrossCD from "@/components/estoque/JobIACrossCD";
import { executarIAAuditoriaLocal } from "@/components/estoque/JobIAAuditoriaLocal";
import executarIAPrevisaoProducao from "@/components/sistema/JobIAPrevisaoProducao";
import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Agendador de Jobs de IA (Background) - COMPLETO
 * Jobs Ativos: 7 (Financeiro + Fiscal + Estoque + Produção)
 * 
 * EM PRODUÇÃO: Usar cron real ou scheduler do Base44
 */
export default function AgendadorJobsIA({ empresaId }) {
  useEffect(() => {
    if (!empresaId) return;

    // Job 1: IA DIFAL Update (Diário - 1h)
    const difalInterval = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 1) {
        console.log('⏰ [1h] Executando IA DIFAL Update...');
        await executarIADIFALUpdate();
      }
    }, 60 * 60 * 1000);

    // Job 2: Régua de Cobrança IA (Diário - 2h)
    const reguaInterval = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 2) {
        console.log('⏰ [2h] Executando Régua de Cobrança IA...');
        await executarReguaCobranca(empresaId);
      }
    }, 60 * 60 * 1000);

    // Job 3: IA Previsão Pagamento (Diário - 3h)
    const previsaoInterval = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 3) {
        console.log('⏰ [3h] Executando IA Previsão de Pagamento...');
        await executarIAPrevisaoPagamento(empresaId);
      }
    }, 60 * 60 * 1000);

    // Job 4: IA Reposição Preditiva (Diário - 4h)
    const reposicaoInterval = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 4) {
        console.log('⏰ [4h] Executando IA Reposição Preditiva...');
        await executarIAReposicaoPreditiva(empresaId);
      }
    }, 60 * 60 * 1000);

    // Job 5: IA Cross-CD (Diário - 5h) - V21.4
    const crossCDInterval = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 5) {
        console.log('⏰ [5h] Executando IA Cross-CD...');
        const empresa = await base44.entities.Empresa.get(empresaId);
        if (empresa.grupo_id) {
          await executarIACrossCD(empresa.grupo_id);
        }
      }
    }, 60 * 60 * 1000);

    // Job 6: IA Auditoria Local (Diário - 6h) - V21.4
    const auditoriaInterval = setInterval(async () => {
      const hora = new Date().getHours();
      if (hora === 6) {
        console.log('⏰ [6h] Executando IA Auditoria Local...');
        await executarIAAuditoriaLocal(empresaId);
      }
    }, 60 * 60 * 1000);

    // Job 7: IA Previsão Produção (Semanal - Domingo 23h) - V21.4 NOVO
    const previsaoProducaoInterval = setInterval(async () => {
      const agora = new Date();
      const hora = agora.getHours();
      const diaSemana = agora.getDay(); // 0 = domingo

      if (diaSemana === 0 && hora === 23) {
        console.log('⏰ [Domingo 23h] Executando IA Previsão Produção...');
        await executarIAPrevisaoProducao(empresaId);
      }
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(difalInterval);
      clearInterval(reguaInterval);
      clearInterval(previsaoInterval);
      clearInterval(reposicaoInterval);
      clearInterval(crossCDInterval);
      clearInterval(auditoriaInterval);
      clearInterval(previsaoProducaoInterval);
    };
  }, [empresaId]);

  return null; // Componente invisível (background)
}