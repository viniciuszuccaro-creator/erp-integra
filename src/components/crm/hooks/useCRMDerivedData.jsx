import { safeArray, safeNumber, isOpenOpportunity } from "@/components/crm/utils/crmSafeData";

export default function useCRMDerivedData({ oportunidades = [] }) {
  const listaOportunidades = safeArray(oportunidades);
  const oportunidadesEmAberto = listaOportunidades.filter((o) => isOpenOpportunity(o?.status));
  const totalOportunidades = listaOportunidades.length;
  const oportunidadesAbertas = oportunidadesEmAberto.length;
  const valorPipeline = oportunidadesEmAberto.reduce((sum, o) => sum + safeNumber(o?.valor_estimado), 0);
  const valorPonderado = oportunidadesEmAberto.reduce((sum, o) => {
    return sum + ((safeNumber(o?.valor_estimado) * safeNumber(o?.probabilidade)) / 100);
  }, 0);
  const taxaConversao = totalOportunidades > 0
    ? ((listaOportunidades.filter((o) => o?.status === 'Ganho').length / totalOportunidades) * 100).toFixed(1)
    : 0;

  return { totalOportunidades, oportunidadesAbertas, valorPipeline, valorPonderado, taxaConversao };
}