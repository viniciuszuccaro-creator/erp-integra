import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * ETAPA 4: Validação Fiscal Inteligente
 * Consulta dados fiscais via IA e preenche campos automaticamente
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cnpj, cpf, entidade_id, tipo_entidade } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documento = cnpj || cpf;
    if (!documento) {
      return Response.json({ error: 'CPF ou CNPJ obrigatório' }, { status: 400 });
    }

    // Usar IA com contexto da internet para buscar dados fiscais
    const validacao = await base44.integrations.Core.InvokeLLM({
      prompt: `Consulte dados da Receita Federal para o ${cnpj ? 'CNPJ' : 'CPF'}: ${documento}

Retorne:
- status_fiscal_receita (Ativa, Inapta, Suspensa, Baixada)
- cnae_principal (código CNAE se for CNPJ)
- ramo_atividade (descrição da atividade)
- porte_empresa (MEI, Micro, Pequena, Média, Grande - se CNPJ)
- razao_social (se CNPJ)
- nome_fantasia (se CNPJ)`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          status_fiscal_receita: { 
            type: 'string',
            enum: ['Ativa', 'Inapta', 'Suspensa', 'Baixada', 'Não Verificado']
          },
          cnae_principal: { type: 'string' },
          ramo_atividade: { type: 'string' },
          porte_empresa: { 
            type: 'string',
            enum: ['MEI', 'Micro', 'Pequena', 'Média', 'Grande']
          },
          razao_social: { type: 'string' },
          nome_fantasia: { type: 'string' },
          confianca: { type: 'number' }
        }
      }
    });

    // Calcular risco baseado no status
    let risco_cadastro_ia = 'Baixo';
    if (validacao.status_fiscal_receita === 'Inapta') risco_cadastro_ia = 'Médio';
    if (['Suspensa', 'Baixada'].includes(validacao.status_fiscal_receita)) risco_cadastro_ia = 'Alto';

    const dadosValidados = {
      ...validacao,
      risco_cadastro_ia,
      status_validacao_kyc: validacao.confianca > 0.7 ? 'Aprovado' : 'Em Análise',
      data_validacao_kyc: new Date().toISOString()
    };

    // Atualizar entidade se ID foi passado
    if (entidade_id && tipo_entidade) {
      const entity = tipo_entidade === 'Cliente' ? base44.entities.Cliente : base44.entities.Fornecedor;
      await entity.update(entidade_id, dadosValidados);
    }

    // Auditoria IA
    await base44.entities.AuditoriaIA.create({
      tipo_operacao: 'Validação Fiscal',
      entidade_afetada: tipo_entidade || 'Validação',
      entidade_id,
      prompt_enviado: `Validar ${documento}`,
      resposta_ia: JSON.stringify(validacao),
      confianca_score: validacao.confianca,
      usuario: user.full_name,
      usuario_id: user.id
    });

    return Response.json({
      validacao: dadosValidados,
      mensagem: `✅ Validação concluída. Status: ${dadosValidados.status_fiscal_receita}, Risco: ${risco_cadastro_ia}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});