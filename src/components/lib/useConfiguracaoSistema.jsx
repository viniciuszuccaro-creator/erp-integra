import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export function useConfiguracaoSistema({ categoria, chave } = {}) {
  const { filterInContext, carimbarContexto } = useContextoVisual();
  const queryClient = useQueryClient();

  const { data: itens = [], isLoading, error } = useQuery({
    queryKey: ["configuracao-sistema", categoria || "all", chave || "all"],
    queryFn: async () => {
      const crit = {};
      if (categoria) crit.categoria = categoria;
      if (chave) crit.chave = chave;
      return await filterInContext("ConfiguracaoSistema", crit, "-updated_date", 500, "empresa_id");
    },
    staleTime: 300000,
  });

  const cfg = useMemo(() => (itens?.[0] || null), [itens]);

  const upsertMutation = useMutation({
    mutationFn: async (data) => {
      const payload = carimbarContexto(data, "empresa_id");
      if (cfg?.id) return await base44.entities.ConfiguracaoSistema.update(cfg.id, payload);
      return await base44.entities.ConfiguracaoSistema.create(payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configuracao-sistema"] }),
  });

  return {
    isLoading,
    error,
    itens,
    config: cfg,
    upsert: upsertMutation.mutateAsync,
  };
}

export default useConfiguracaoSistema;