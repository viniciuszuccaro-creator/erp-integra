export default function useCRMDerivedData({ oportunidades = [] }) {
  const totalOportunidades = oportunidades.length;
  const oportunidadesAbertas = oportunidades.filter(o => o.status === 'Aberto' || o.status === 'Em Andamento').length;
  const valorPipeline = oportunidades
    .filter(o => o.status === 'Aberto' || o.status === 'Em Andamento')
    .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
  const valorPonderado = oportunidades
    .filter(o => o.status === 'Aberto' || o.status === 'Em Andamento')
    .reduce((sum, o) => sum + ((o.valor_estimado || 0) * (o.probabilidade || 0) / 100), 0);
  const taxaConversao = totalOportunidades > 0
    ? ((oportunidades.filter(o => o.status === 'Ganho').length / totalOportunidades) * 100).toFixed(1)
    : 0;

  return { totalOportunidades, oportunidadesAbertas, valorPipeline, valorPonderado, taxaConversao };
}