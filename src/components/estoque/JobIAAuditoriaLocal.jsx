import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Auditoria de Divergências
 * Detecta inconsistências entre saldo sistema x movimentações
 * 
 * GATILHO: Diário às 6h (via AgendadorJobsIA)
 */
export async function executarIAAuditoriaLocal(empresaId) {
  console.log('🔍 [IA Auditoria] Iniciando análise...');

  const produtos = await base44.entities.Produto.filter({ empresa_id: empresaId });
  const divergencias = [];

  for (const produto of produtos) {
    const movimentacoes = await base44.entities.MovimentacaoEstoque.filter({
      produto_id: produto.id,
      empresa_id: empresaId
    }, '-data_movimentacao', 500);

    // Recalcular saldo baseado em movimentações
    let saldoCalculado = 0;
    
    movimentacoes.reverse().forEach(mov => {
      if (mov.tipo_movimento === 'entrada') {
        saldoCalculado += mov.quantidade;
      } else if (mov.tipo_movimento === 'saida') {
        saldoCalculado -= mov.quantidade;
      } else if (mov.tipo_movimento === 'ajuste') {
        saldoCalculado = mov.estoque_atual;
      }
    });

    const saldoSistema = produto.estoque_atual || 0;
    const diferenca = Math.abs(saldoCalculado - saldoSistema);

    // Se divergência > 0.5 KG, registrar
    if (diferenca > 0.5) {
      divergencias.push({
        produto_id: produto.id,
        produto_descricao: produto.descricao,
        saldo_sistema: saldoSistema,
        saldo_calculado: saldoCalculado,
        diferenca: diferenca,
        severidade: diferenca > 10 ? 'Alta' : diferenca > 5 ? 'Média' : 'Baixa'
      });

      // Criar notificação
      await base44.entities.Notificacao.create({
        titulo: `Divergência de Estoque: ${produto.descricao}`,
        mensagem: `IA detectou diferença de ${diferenca.toFixed(2)} KG entre sistema (${saldoSistema.toFixed(2)} KG) e movimentações (${saldoCalculado.toFixed(2)} KG).`,
        tipo: diferenca > 10 ? 'erro' : 'aviso',
        categoria: 'Estoque',
        prioridade: diferenca > 10 ? 'Alta' : 'Normal',
        entidade_relacionada: 'Produto',
        registro_id: produto.id
      });
    }
  }

  console.log(`✅ [IA Auditoria] ${divergencias.length} divergência(s) detectada(s).`);
  return divergencias;
}

export default executarIAAuditoriaLocal;