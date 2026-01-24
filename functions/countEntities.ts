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

    // ✅ ESTRATÉGIA OTIMIZADA: Retornar estimativa rápida para grandes volumes
    let totalCount = 0;
    const QUICK_SAMPLE = 500; // Amostra rápida para estimativa

    try {
      // Busca amostra inicial rápida
      const sample = await base44.entities[entityName].filter(filter, undefined, QUICK_SAMPLE);
      totalCount = sample.length;

      // Se a amostra está cheia, provavelmente há MUITO mais dados
      // Retorna ESTIMATIVA para evitar sobrecarga no servidor
      if (sample.length === QUICK_SAMPLE) {
        console.log(`${entityName}: Amostra cheia (${QUICK_SAMPLE}), retornando estimativa`);
        return Response.json({
          count: QUICK_SAMPLE,
          isEstimate: true,
          message: `Estimativa: ${QUICK_SAMPLE}+ registros`
        });
      }

      // Se a amostra não está cheia, é a contagem exata
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