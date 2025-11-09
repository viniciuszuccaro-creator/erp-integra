import { base44 } from "@/api/base44Client";

/**
 * V21.5 - Job IA CNH/ASO (Saúde Ocupacional)
 * Monitora vencimentos de CNH e ASO
 * Executa diariamente às 7h
 */
export async function executarJobCNHASO(empresaId) {
  console.log('🏥 Executando IA CNH/ASO...');

  const colaboradores = await base44.entities.Colaborador.filter({
    empresa_alocada_id: empresaId,
    status: 'Ativo'
  });

  const alertas = [];
  const hoje = new Date();

  for (const colab of colaboradores) {
    // Verificar CNH
    if (colab.pode_dirigir && colab.cnh_validade) {
      const dataValidade = new Date(colab.cnh_validade);
      const diasRestantes = Math.floor((dataValidade - hoje) / (1000 * 60 * 60 * 24));

      if (diasRestantes <= 30 && diasRestantes >= 0) {
        await base44.entities.Notificacao.create({
          titulo: `⚠️ CNH Vencendo: ${colab.nome_completo}`,
          mensagem: `CNH do colaborador ${colab.nome_completo} vence em ${diasRestantes} dias (${new Date(colab.cnh_validade).toLocaleDateString('pt-BR')}).\n\nProvidenciar renovação urgente.`,
          tipo: diasRestantes <= 7 ? 'urgente' : 'aviso',
          categoria: 'RH',
          prioridade: diasRestantes <= 7 ? 'Urgente' : 'Alta',
          entidade_relacionada: 'Colaborador',
          registro_id: colab.id,
          link_acao: `/rh?colaborador=${colab.id}`
        });

        alertas.push({
          tipo: 'CNH',
          colaborador: colab.nome_completo,
          dias_restantes: diasRestantes
        });
      }

      // Bloquear se vencida
      if (diasRestantes < 0) {
        await base44.entities.Colaborador.update(colab.id, {
          pode_dirigir: false,
          observacoes: `CNH VENCIDA desde ${new Date(colab.cnh_validade).toLocaleDateString('pt-BR')} - BLOQUEADO AUTOMATICAMENTE PELA IA`
        });

        alertas.push({
          tipo: 'CNH_BLOQUEIO',
          colaborador: colab.nome_completo,
          acao: 'Bloqueado para dirigir'
        });
      }
    }

    // Verificar ASO
    if (colab.aso_validade) {
      const dataValidade = new Date(colab.aso_validade);
      const diasRestantes = Math.floor((dataValidade - hoje) / (1000 * 60 * 60 * 24));

      if (diasRestantes <= 30 && diasRestantes >= 0) {
        await base44.entities.Notificacao.create({
          titulo: `🏥 ASO Vencendo: ${colab.nome_completo}`,
          mensagem: `ASO do colaborador ${colab.nome_completo} vence em ${diasRestantes} dias.\n\nAgendar exame ocupacional.`,
          tipo: diasRestantes <= 7 ? 'urgente' : 'aviso',
          categoria: 'RH',
          prioridade: diasRestantes <= 7 ? 'Urgente' : 'Alta',
          entidade_relacionada: 'Colaborador',
          registro_id: colab.id
        });

        alertas.push({
          tipo: 'ASO',
          colaborador: colab.nome_completo,
          dias_restantes: diasRestantes
        });
      }

      // Bloquear produção se vencido
      if (diasRestantes < 0) {
        await base44.entities.Colaborador.update(colab.id, {
          pode_apontar_producao: false,
          observacoes: `ASO VENCIDO desde ${new Date(colab.aso_validade).toLocaleDateString('pt-BR')} - BLOQUEADO PARA PRODUÇÃO`
        });

        alertas.push({
          tipo: 'ASO_BLOQUEIO',
          colaborador: colab.nome_completo,
          acao: 'Bloqueado para apontamento'
        });
      }
    }
  }

  console.log(`✅ IA CNH/ASO gerou ${alertas.length} alerta(s).`);
  return alertas;
}

export default { executarJobCNHASO };