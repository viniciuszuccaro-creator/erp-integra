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

    // Estratégia de contagem otimizada
    let totalCount = 0;
    const BATCH_SIZE = 1000;
    const MAX_ITERATIONS = 100; // Limite de segurança para evitar loops infinitos

    try {
      // Tenta buscar o primeiro lote
      const firstBatch = await base44.entities[entityName].filter(filter, undefined, BATCH_SIZE);
      totalCount = firstBatch.length;

      // Se o primeiro lote está cheio, há mais dados - continua paginando
      if (firstBatch.length === BATCH_SIZE) {
        let iteration = 1;
        let hasMore = true;

        while (hasMore && iteration < MAX_ITERATIONS) {
          const nextBatch = await base44.entities[entityName].filter(
            filter,
            undefined,
            BATCH_SIZE,
            iteration * BATCH_SIZE // skip
          );

          if (nextBatch.length === 0) {
            hasMore = false;
          } else {
            totalCount += nextBatch.length;
            if (nextBatch.length < BATCH_SIZE) {
              hasMore = false;
            }
          }

          iteration++;
        }

        // Se atingiu o limite de iterações, retorna estimativa
        if (iteration >= MAX_ITERATIONS) {
          console.warn(`Contagem atingiu limite de ${MAX_ITERATIONS} iterações para ${entityName}`);
          return Response.json({
            count: totalCount,
            isEstimate: true,
            message: `Estimativa baseada em ${MAX_ITERATIONS * BATCH_SIZE} primeiros registros`
          });
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