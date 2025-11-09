import { base44 } from "@/api/base44Client";

/**
 * V21.4 - Job IA: Cross-CD (Transferências Inteligentes)
 * Analisa estoques entre empresas do grupo e sugere transferências
 * 
 * GATILHO: Diário às 5h (via AgendadorJobsIA)
 */
export async function executarIACrossCD(grupoId) {
  console.log('🧠 [IA Cross-CD] Iniciando análise...');

  const empresas = await base44.entities.Empresa.filter({ grupo_id: grupoId });
  const transferencias = [];

  // Buscar produtos em todas empresas
  for (const empresaOrigem of empresas) {
    const produtosOrigem = await base44.entities.Produto.filter({ 
      empresa_id: empresaOrigem.id 
    });

    for (const produto of produtosOrigem) {
      // Se estoque > máximo, buscar empresa com estoque baixo
      if ((produto.estoque_disponivel || 0) > (produto.estoque_maximo || 0)) {
        const excesso = produto.estoque_disponivel - produto.estoque_maximo;

        // Buscar produto em outras empresas
        for (const empresaDestino of empresas) {
          if (empresaDestino.id === empresaOrigem.id) continue;

          const produtosDestino = await base44.entities.Produto.filter({
            empresa_id: empresaDestino.id,
            codigo: produto.codigo
          });

          if (produtosDestino.length === 0) continue;

          const produtoDestino = produtosDestino[0];

          // Se destino está abaixo do mínimo
          if ((produtoDestino.estoque_disponivel || 0) < (produtoDestino.estoque_minimo || 0)) {
            const falta = produtoDestino.estoque_minimo - produtoDestino.estoque_disponivel;
            const quantidadeTransferir = Math.min(excesso, falta);

            if (quantidadeTransferir > 0) {
              transferencias.push({
                produto_id: produto.id,
                produto_descricao: produto.descricao,
                empresa_origem_id: empresaOrigem.id,
                empresa_origem_nome: empresaOrigem.nome_fantasia,
                empresa_destino_id: empresaDestino.id,
                empresa_destino_nome: empresaDestino.nome_fantasia,
                quantidade: quantidadeTransferir,
                motivo_ia: `Excesso em ${empresaOrigem.nome_fantasia} (${excesso.toFixed(2)} KG) e falta em ${empresaDestino.nome_fantasia} (${falta.toFixed(2)} KG)`
              });
            }
          }
        }
      }
    }
  }

  console.log(`✅ [IA Cross-CD] ${transferencias.length} transferências sugeridas.`);
  return transferencias;
}

export default executarIACrossCD;