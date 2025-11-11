import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Auditoria de Localização Física
 * Executa: Diariamente às 6h
 * Detecta: Divergências físicas vs sistema, produtos parados há muito tempo
 * Cria: Inventários rotativos automáticos
 */
export async function executarIAAuditoriaLocal(empresaId) {
  console.log('🧠 [IA Auditoria Local] Iniciando...');

  const locaisEstoque = await base44.entities.LocalEstoque.filter({
    empresa_id: empresaId,
    ativo: true
  });

  const alertas = [];
  const inventariosAgendados = [];

  for (const local of locaisEstoque) {
    const produtos = await base44.entities.Produto.filter({
      empresa_id: empresaId,
      almoxarifado_id: local.id,
      status: 'Ativo'
    });

    for (const produto of produtos) {
      const ultimaMovimentacao = await base44.entities.MovimentacaoEstoque.filter({
        produto_id: produto.id,
        localizacao_origem: local.codigo_local
      }, '-data_movimentacao', 1);

      const diasSemMovimento = ultimaMovimentacao.length > 0
        ? Math.floor((Date.now() - new Date(ultimaMovimentacao[0].data_movimentacao)) / (1000 * 60 * 60 * 24))
        : 999;

      const analiseIA = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é uma IA de Auditoria de Estoque.

PRODUTO:
- Descrição: ${produto.descricao}
- Estoque Sistema: ${produto.estoque_atual || 0} KG
- Última Movimentação: há ${diasSemMovimento} dias
- Localização: ${local.nome_local} - ${produto.localizacao || 'Não definida'}
- Classificação ABC: ${produto.classificacao_abc || 'Sem Movimento'}
- Giro Médio: ${produto.giro_estoque_dias || 0} dias

CRITÉRIOS DE RISCO:
1. Produto sem movimentação há mais de 60 dias → Inventário obrigatório
2. Produto sem localização física definida → Risco alto
3. Classificação "A" sem movimentação há mais de 30 dias → Alerta
4. Estoque negativo → Crítico
5. Divergência provável (produto parado + estoque alto) → Investigar

TAREFA:
Avalie o risco de divergência física vs sistema e sugira ação.

Retorne JSON com:
- nivel_risco: "Baixo" | "Médio" | "Alto" | "Crítico"
- requer_inventario: boolean
- prioridade_inventario: "Baixa" | "Normal" | "Alta" | "Urgente"
- motivo_alerta: string
- acao_sugerida: string`,
        response_json_schema: {
          type: 'object',
          properties: {
            nivel_risco: { type: 'string' },
            requer_inventario: { type: 'boolean' },
            prioridade_inventario: { type: 'string' },
            motivo_alerta: { type: 'string' },
            acao_sugerida: { type: 'string' }
          }
        }
      });

      if (analiseIA.nivel_risco === 'Alto' || analiseIA.nivel_risco === 'Crítico') {
        const notificacao = await base44.entities.Notificacao.create({
          titulo: `⚠️ Auditoria: ${produto.descricao}`,
          mensagem: analiseIA.motivo_alerta,
          tipo: analiseIA.nivel_risco === 'Crítico' ? 'erro' : 'aviso',
          categoria: 'Estoque',
          prioridade: analiseIA.nivel_risco === 'Crítico' ? 'Urgente' : 'Alta',
          entidade_relacionada: 'Produto',
          registro_id: produto.id,
          link_acao: `/estoque`,
          dados_adicionais: {
            local_id: local.id,
            local_nome: local.nome_local,
            dias_sem_movimento: diasSemMovimento,
            nivel_risco: analiseIA.nivel_risco,
            acao_sugerida: analiseIA.acao_sugerida
          }
        });

        alertas.push(notificacao);
      }

      if (analiseIA.requer_inventario) {
        const evento = await base44.entities.Evento.create({
          titulo: `📋 Inventário: ${produto.descricao}`,
          descricao: `Inventário agendado pela IA Auditoria Local.\n\nMotivo: ${analiseIA.motivo_alerta}\n\nAção: ${analiseIA.acao_sugerida}`,
          tipo: 'Tarefa',
          data_inicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          data_fim: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          responsavel: 'Almoxarifado',
          local: local.nome_local,
          prioridade: analiseIA.prioridade_inventario,
          status: 'Agendado'
        });

        inventariosAgendados.push(evento);
      }
    }

    const totalProdutos = produtos.length;
    const produtosComLocalizacao = produtos.filter(p => p.localizacao || p.localizacao_fisica).length;
    const percentualOrganizacao = totalProdutos > 0 ? (produtosComLocalizacao / totalProdutos) * 100 : 0;

    await base44.entities.LocalEstoque.update(local.id, {
      ocupacao_atual_percentual: percentualOrganizacao
    });
  }

  console.log(`✅ [IA Auditoria] ${alertas.length} alertas gerados, ${inventariosAgendados.length} inventários agendados.`);
  return { alertas, inventariosAgendados };
}