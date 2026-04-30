import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { CheckCircle2, AlertCircle, XCircle, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resolveConfiguracaoSistema } from "@/components/lib/useConfiguracaoSistema";

/**
 * AdminStatusBar — barra de saúde em tempo real do sistema.
 * Mostra status de integrações, segurança e IA em um único painel compacto.
 */
export default function AdminStatusBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const eId = empresaAtual?.id;
  const gId = grupoAtual?.id;

  const { data: status = {}, isFetching } = useQuery({
    queryKey: ["admin-status-bar", eId ?? "sem", gId ?? "sem"],
    queryFn: async () => {
      const [nfeConfig, boletoConfig, whatsappConfig, notifPedidoConfig, iaVendasConfig, iaFinanceiroConfig] = await Promise.all([
        resolveConfiguracaoSistema({ chave: `integracoes_${eId}`, categoria: 'Integracoes', empresaId: eId, grupoId: gId }),
        resolveConfiguracaoSistema({ chave: `integracoes_${eId}`, categoria: 'Integracoes', empresaId: eId, grupoId: gId }),
        resolveConfiguracaoSistema({ chave: 'integracao_whatsapp', categoria: 'Integracoes', empresaId: eId, grupoId: gId }),
        resolveConfiguracaoSistema({ chave: 'notif_pedido_aprovado', categoria: 'Notificacoes', empresaId: eId, grupoId: gId }),
        resolveConfiguracaoSistema({ chave: 'ia_preditiva_vendas', categoria: 'Sistema', empresaId: eId, grupoId: gId, aliases: ['cc_ia_preditiva_vendas'] }),
        resolveConfiguracaoSistema({ chave: 'ia_anomalia_financeira', categoria: 'Sistema', empresaId: eId, grupoId: gId })
      ]);

      return {
        nfeOk: !!nfeConfig?.integracao_nfe?.api_key,
        boletosOk: !!boletoConfig?.integracao_boletos?.api_key,
        whatsappOk: whatsappConfig?.ativa === true,
        notifPedidoOk: notifPedidoConfig?.ativa === true,
        iaVendasOk: iaVendasConfig?.ativa === true,
        iaFinanceiroOk: iaFinanceiroConfig?.ativa === true,
      };
    },
    enabled: !!(eId || gId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 60000,
  });

  const indicators = [
    { label: "NF-e", ok: !!status.nfeOk },
    { label: "Boleto/PIX", ok: !!status.boletosOk },
    { label: "WhatsApp", ok: !!status.whatsappOk },
    { label: "Notif. Pedido", ok: !!status.notifPedidoOk },
    { label: "IA Vendas", ok: !!status.iaVendasOk },
    { label: "IA Finanças", ok: !!status.iaFinanceiroOk },
  ];

  const okCount = indicators.filter((i) => i.ok).length;
  const totalCount = indicators.length;
  const healthPct = Math.round((okCount / totalCount) * 100);
  const healthColor =
    healthPct >= 80 ? "text-green-600" : healthPct >= 50 ? "text-amber-600" : "text-red-600";
  const healthBg =
    healthPct >= 80 ? "bg-green-50 border-green-200" : healthPct >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className={`w-full border rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center gap-3 ${healthBg}`}>
      {/* Score geral */}
      <div className="flex items-center gap-2 min-w-[120px]">
        {isFetching ? (
          <Wifi className="w-4 h-4 text-blue-400 animate-pulse" />
        ) : healthPct >= 80 ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600" />
        )}
        <span className={`font-bold text-sm ${healthColor}`}>
          Saúde: {healthPct}%
        </span>
        <span className="text-xs text-slate-500">({okCount}/{totalCount} ativos)</span>
      </div>

      <div className="h-4 w-px bg-slate-300 hidden sm:block" />

      {/* Indicadores individuais */}
      <div className="flex flex-wrap gap-1.5">
        {indicators.map(({ label, ok }) => (
          <Badge
            key={label}
            className={`text-[10px] px-2 py-0.5 flex items-center gap-1 ${
              ok
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {ok ? (
              <CheckCircle2 className="w-2.5 h-2.5" />
            ) : (
              <XCircle className="w-2.5 h-2.5 text-slate-400" />
            )}
            {label}
          </Badge>
        ))}
      </div>

      {!eId && !gId && (
        <span className="text-xs text-amber-700 ml-auto">
          ⚠️ Selecione empresa/grupo para ver status real
        </span>
      )}
    </div>
  );
}