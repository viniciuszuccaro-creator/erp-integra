import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { safeNumber, isSameDay, isSameMonth } from "@/components/dashboard/utils/dashboardSafeData";

export default function DashboardStickyKpis({ pedidos = [], pedidosPendentes = [], pedidosAguardandoAprovacao = [], produtosBaixoEstoque = 0 }) {
  const pedidosValidos = Array.isArray(pedidos) ? pedidos : [];
  const faturamentoDia = pedidosValidos
    .filter((p) => isSameDay(p?.data_pedido || p?.created_date))
    .reduce((sum, p) => sum + safeNumber(p?.valor_total), 0);
  const faturamentoMes = pedidosValidos
    .filter((p) => isSameMonth(p?.data_pedido || p?.created_date))
    .reduce((sum, p) => sum + safeNumber(p?.valor_total), 0);

  return (
    <div className="sticky top-0 z-20 bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-sm border-b border-slate-200 py-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-sm rounded-md bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-3">
            <div className="text-xs text-slate-500">Faturamento</div>
            <div className="text-sm font-semibold text-slate-900">Dia: R$ {faturamentoDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <div className="text-xs text-slate-600">Mês: R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm rounded-md bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-3">
            <div className="text-xs text-slate-500">Pedidos</div>
            <div className="text-sm font-semibold text-slate-900">Abertos: {pedidosPendentes.length}</div>
            <div className="text-xs text-slate-600">Em aprovação: {pedidosAguardandoAprovacao.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm rounded-md bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-3">
            <div className="text-xs text-slate-500">Estoque crítico</div>
            <div className="text-sm font-semibold text-slate-900">Itens: {safeNumber(produtosBaixoEstoque)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}