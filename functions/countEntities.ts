import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * FUNÇÃO BACKEND: Contagem Eficiente de Entidades
 * 
 * Esta função resolve o problema de contagem precisa para grandes volumes de dados
 * fazendo a contagem no lado do servidor de forma otimizada.
 * 
 * Para volumes muito grandes (>10k), usa paginação incremental.
 * Para volumes menores, busca tudo de uma vez.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityName, filter = {} } = await req.json();

    if (!entityName) {
      return Response.json({ error: 'entityName é obrigatório' }, { status: 400 });
    }

    // ✅ CONTAGEM REAL COMPLETA - busca tudo até encontrar o total
    let totalCount = 0;
    const BATCH_SIZE = 500;
    let skip = 0;
    let hasMore = true;

    try {
      // Busca em lotes até obter todos os registros
      while (hasMore) {
        const batch = await base44.entities[entityName].filter(filter, undefined, BATCH_SIZE, skip);
        
        if (!batch || batch.length === 0) {
          hasMore = false;
        } else {
          totalCount += batch.length;
          
          // Se retornou menos que BATCH_SIZE, chegamos ao fim
          if (batch.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            skip += BATCH_SIZE;
          }
        }
      }

      return Response.json({
        count: totalCount,
        isEstimate: false,
        entityName,
        filter
      });

    } catch (error) {
      console.error(`Erro ao contar ${entityName}:`, error);
      return Response.json({
        error: 'Erro ao contar entidade',
        details: error.message,
        count: 0,
        isEstimate: true
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro na função countEntities:', error);
    return Response.json({
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
});