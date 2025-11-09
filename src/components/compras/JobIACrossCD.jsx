import { base44 } from "@/api/base44Client";

/**
 * V21.5 - Job IA Cross-CD (Transferência Inteligente)
 * Antes de criar solicitação de compra, verifica se outra filial tem estoque
 * Executa diariamente às 5h
 */
export async function executarJobCrossCD(grupoId) {
  console.log('🧠 Executando IA Cross-CD...');

  // Buscar todas empresas do grupo
  const empresas = await base44.entities.Empresa.filter({ grupo_id: grupoId });

  if (empresas.length < 2) {
    console.log('⚠️ Grupo com menos de 2 empresas, Cross-CD não aplicável.');
    return [];
  }

  const sugestoes = [];

  // Para cada empresa
  for (const empresaOrigem of empresas) {
    // Buscar produtos com estoque baixo
    const produtosBaixos = await base44.entities.Produto.filter({
      empresa_id: empresaOrigem.id,
      status: 'Ativo'
    });

    const produtosCriticos = produtosBaixos.filter(p => 
      (p.estoque_disponivel || 0) < (p.estoque_minimo || 0)
    );

    // Para cada produto crítico
    for (const produto of produtosCriticos) {
      // Buscar mesmo produto em outras empresas
      for (const empresaDestino of empresas) {
        if (empresaDestino.id === empresaOrigem.id) continue;

        const produtoOutraEmpresa = await base44.entities.Produto.filter({
          empresa_id: empresaDestino.id,
          codigo: produto.codigo
        });

        if (produtoOutraEmpresa.length === 0) continue;

        const produtoDestino = produtoOutraEmpresa[0];

        // Verificar se tem excesso
        const excessoDestino = (produtoDestino.estoque_disponivel || 0) - (produtoDestino.estoque_minimo || 0);

        if (excessoDestino > 50) { // > 50 KG de excesso
          const faltaOrigem = (produto.estoque_minimo || 0) - (produto.estoque_disponivel || 0);
          const quantidadeTransferir = Math.min(excessoDestino, faltaOrigem);

          sugestoes.push({
            produto_id: produto.id,
            produto_descricao: produto.descricao,
            codigo: produto.codigo,
            empresa_origem_id: empresaOrigem.id,
            empresa_origem_nome: empresaOrigem.nome_fantasia,
            estoque_origem: produto.estoque_disponivel,
            estoque_minimo_origem: produto.estoque_minimo,
            empresa_destino_id: empresaDestino.id,
            empresa_destino_nome: empresaDestino.nome_fantasia,
            estoque_destino: produtoDestino.estoque_disponivel,
            quantidade_sugerida: quantidadeTransferir,
            economia_compra: quantidadeTransferir * (produto.custo_medio || 0)
          });
        }
      }
    }
  }

  console.log(`✅ IA Cross-CD encontrou ${sugestoes.length} oportunidade(s) de transferência.`);
  return sugestoes;
}

/**
 * V21.5: NOVO - Criar Transferência Automática
 */
export async function criarTransferenciaAutomatica(sugestao) {
  console.log('🚚 Criando transferência entre filiais...');

  // Criar movimentação de SAÍDA na empresa destino (quem tem excesso)
  await base44.entities.MovimentacaoEstoque.create({
    empresa_id: sugestao.empresa_destino_id,
    tipo_movimento: 'transferencia',
    produto_id: sugestao.produto_id,
    produto_descricao: sugestao.produto_descricao,
    quantidade: sugestao.quantidade_sugerida,
    unidade_medida: 'KG',
    data_movimentacao: new Date().toISOString(),
    empresa_destino_id: sugestao.empresa_origem_id,
    motivo: `Cross-CD IA: Transferência para ${sugestao.empresa_origem_nome}`,
    responsavel: 'IA Cross-CD'
  });

  // Criar movimentação de ENTRADA na empresa origem (quem precisa)
  await base44.entities.MovimentacaoEstoque.create({
    empresa_id: sugestao.empresa_origem_id,
    tipo_movimento: 'transferencia',
    produto_id: sugestao.produto_id,
    produto_descricao: sugestao.produto_descricao,
    quantidade: sugestao.quantidade_sugerida,
    unidade_medida: 'KG',
    data_movimentacao: new Date().toISOString(),
    empresa_origem_id: sugestao.empresa_destino_id,
    motivo: `Cross-CD IA: Recebimento de ${sugestao.empresa_destino_nome}`,
    responsavel: 'IA Cross-CD'
  });

  // Atualizar produtos
  const produtoOrigem = await base44.entities.Produto.filter({
    empresa_id: sugestao.empresa_origem_id,
    codigo: sugestao.codigo
  });

  const produtoDestino = await base44.entities.Produto.filter({
    empresa_id: sugestao.empresa_destino_id,
    codigo: sugestao.codigo
  });

  if (produtoOrigem.length > 0) {
    await base44.entities.Produto.update(produtoOrigem[0].id, {
      estoque_disponivel: (produtoOrigem[0].estoque_disponivel || 0) + sugestao.quantidade_sugerida
    });
  }

  if (produtoDestino.length > 0) {
    await base44.entities.Produto.update(produtoDestino[0].id, {
      estoque_disponivel: (produtoDestino[0].estoque_disponivel || 0) - sugestao.quantidade_sugerida
    });
  }

  console.log('✅ Transferência Cross-CD concluída!');
  return true;
}

export default { executarJobCrossCD, criarTransferenciaAutomatica };