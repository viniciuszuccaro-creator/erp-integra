/**
 * useCadastrosAllCounts — Carrega TODAS as contagens de Cadastros Gerais em UMA chamada.
 * Evita rate limit ao substituir N fetches paralelos por 1 único batch.
 * Retorna: { counts: { EntityName: number }, totals: { bloco1: n, ... }, isLoading }
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { buildContextFilter, SIMPLE_CATALOG } from "@/components/lib/useEntityCounts";
import { useEffect } from "react";

const ALL_ENTITIES = [
  // Bloco 1 - Pessoas & Parceiros
  "Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento",
  // Bloco 2 - Produtos & Serviços
  "Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","KitProduto","CatalogoWeb","UnidadeMedida",
  // Bloco 3 - Financeiro & Fiscal
  "Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","OperadorCaixa",
  "GatewayPagamento","ConfiguracaoDespesaRecorrente","TabelaFiscal","CondicaoComercial",
  // Bloco 4 - Logística
  "Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento",
  // Bloco 5 - Organizacional
  "Empresa","GrupoEmpresarial","Departamento","Cargo","Turno",
  // Bloco 6 - Tecnologia
  "ApiExterna","ChatbotCanal","ChatbotIntent","JobAgendado","Webhook",
  "ConfiguracaoNFe","EventoNotificacao",
];

export const BLOCOS_ENTITIES = {
  bloco1: ["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"],
  bloco2: ["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","KitProduto","CatalogoWeb","UnidadeMedida"],
  bloco3: ["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","OperadorCaixa","GatewayPagamento","ConfiguracaoDespesaRecorrente","TabelaFiscal","CondicaoComercial"],
  bloco4: ["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"],
  bloco5: ["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno"],
  bloco6: ["ApiExterna","ChatbotCanal","ChatbotIntent","JobAgendado","Webhook","ConfiguracaoNFe","EventoNotificacao"],
};

export default function useCadastrosAllCounts() {
  const { empresaAtual, grupoAtual, empresasDoGrupo } = useContextoVisual();
  const empresaId = empresaAtual?.id || null;
  const groupId   = grupoAtual?.id   || null;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cadastros-all-counts", empresaId, groupId],
    queryFn: async () => {
      const entities = ALL_ENTITIES.map(entityName => ({
        entityName,
        filter: SIMPLE_CATALOG.has(entityName)
          ? {}
          : (buildContextFilter(entityName, empresaId, groupId, empresasDoGrupo) || {}),
      }));
      try {
        const res = await base44.functions.invoke("countEntities", { entities });
        return res?.data?.counts || {};
      } catch (_) {
        return {};
      }
    },
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });

  // Invalida ao trocar empresa/grupo
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["cadastros-all-counts"] });
  }, [empresaId, groupId]); // eslint-disable-line

  const counts = data || {};

  const totals = Object.fromEntries(
    Object.entries(BLOCOS_ENTITIES).map(([bloco, entities]) => [
      bloco,
      entities.reduce((sum, e) => sum + (Number(counts[e]) || 0), 0),
    ])
  );

  return { counts, totals, isLoading };
}