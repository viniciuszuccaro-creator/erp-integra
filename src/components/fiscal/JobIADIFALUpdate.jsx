import { base44 } from "@/api/base44Client";

/**
 * V21.3 - Job IA: Atualização de Tabela DIFAL
 * Executa: Diariamente (1h da manhã)
 * Função: Atualizar alíquotas interestaduais via web scraping IA
 */
export async function executarIADIFALUpdate() {
  console.log('🧠 IA DIFAL Update iniciada...');

  const anoAtual = new Date().getFullYear();
  const estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  // Buscar dados atualizados com IA
  const tabelaAtualizada = await base44.integrations.Core.InvokeLLM({
    prompt: `Você é uma IA especializada em tributação brasileira.

TAREFA:
Consulte as alíquotas de ICMS interestaduais vigentes para ${anoAtual}.

Para TODAS as combinações de estados brasileiros, retorne:
1. Alíquota interestadual (7% ou 12% conforme Resolução Senado)
2. Alíquota interna do estado de destino
3. Percentual FCP (se aplicável)

REGRA GERAL:
- Sul/Sudeste → Sul/Sudeste = 12%
- Sul/Sudeste → Norte/Nordeste/CO = 7%
- Demais = 12%

Retorne JSON estruturado com todas combinações.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        ano_vigencia: { type: 'number' },
        combinacoes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              estado_origem: { type: 'string' },
              estado_destino: { type: 'string' },
              aliquota_interestadual: { type: 'number' },
              aliquota_destino: { type: 'number' },
              fcp_percentual: { type: 'number' }
            }
          }
        },
        fonte: { type: 'string' },
        data_consulta: { type: 'string' }
      }
    }
  });

  const criadas = [];
  const atualizadas = [];

  // Salvar/atualizar no banco
  for (const comb of tabelaAtualizada.combinacoes) {
    const existe = await base44.entities.TabelaDIFAL.filter({
      estado_origem: comb.estado_origem,
      estado_destino: comb.estado_destino,
      ano_vigencia: anoAtual
    });

    if (existe.length > 0) {
      await base44.entities.TabelaDIFAL.update(existe[0].id, {
        aliquota_interestadual: comb.aliquota_interestadual,
        aliquota_destino: comb.aliquota_destino,
        fcp_percentual: comb.fcp_percentual || 0,
        data_atualizacao: new Date().toISOString(),
        atualizado_por_ia: true,
        fonte_atualizacao: tabelaAtualizada.fonte
      });
      atualizadas.push(comb);
    } else {
      await base44.entities.TabelaDIFAL.create({
        estado_origem: comb.estado_origem,
        estado_destino: comb.estado_destino,
        ano_vigencia: anoAtual,
        aliquota_interestadual: comb.aliquota_interestadual,
        aliquota_destino: comb.aliquota_destino,
        fcp_percentual: comb.fcp_percentual || 0,
        data_atualizacao: new Date().toISOString(),
        atualizado_por_ia: true,
        fonte_atualizacao: tabelaAtualizada.fonte
      });
      criadas.push(comb);
    }
  }

  console.log(`✅ DIFAL Update concluído. ${criadas.length} criadas, ${atualizadas.length} atualizadas.`);
  
  return {
    criadas: criadas.length,
    atualizadas: atualizadas.length,
    fonte: tabelaAtualizada.fonte,
    data: new Date().toISOString()
  };
}

export default executarIADIFALUpdate;