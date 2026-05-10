import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { safeNumber, safeDate } from "@/components/dashboard/utils/dashboardSafeData";

const formatCurrency = (value) => `R$ ${safeNumber(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

const formatDate = (value) => {
  const date = safeDate(value);
  return date ? date.toLocaleDateString('pt-BR') : '-';
};

function PedidoRow({ pedido, mode = "valor" }) {
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded border border-slate-200 bg-white min-w-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900 truncate">
          #{pedido?.numero_pedido || '-'} • {pedido?.cliente_nome || 'Cliente não informado'}
        </div>
        <div className="text-xs text-slate-500">
          {mode === "aprovacao"
            ? `solicit.: ${pedido?.vendedor || '-'} • desc ${safeNumber(pedido?.desconto_solicitado_percentual)}%`
            : `${formatDate(pedido?.data_pedido || pedido?.created_date)} • ${pedido?.status || '-'}`}
        </div>
      </div>
      {mode === "aprovacao" ? (
        <Badge className="bg-rose-100 text-rose-700 text-[10px] shrink-0">{pedido?.status_aprovacao || 'pendente'}</Badge>
      ) : (
        <div className="text-sm font-semibold text-slate-700 shrink-0">{formatCurrency(pedido?.valor_total)}</div>
      )}
    </div>
  );
}

function PedidoColumn({ title, badge, pedidos, emptyText, mode }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {badge}
      </div>
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {pedidos.map((pedido) => <PedidoRow key={pedido?.id || `${title}-${pedido?.numero_pedido}`} pedido={pedido} mode={mode} />)}
        {pedidos.length === 0 && <p className="text-sm text-slate-500">{emptyText}</p>}
      </div>
    </div>
  );
}

export default function PedidosResumoPanel({ pedidosRecentes = [], pedidosPendentes = [], pedidosAguardandoAprovacao = [], onVerTodos }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-md shadow-sm w-full h-full">
      <CardHeader>
        <CardTitle>Pedidos (Recentes, Pendentes, Aprovação)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <PedidoColumn
            title="Recentes"
            badge={<Badge variant="outline">{pedidosRecentes.length}</Badge>}
            pedidos={pedidosRecentes}
            emptyText="Sem pedidos."
          />
          <PedidoColumn
            title="Pendentes"
            badge={<Badge className="bg-amber-100 text-amber-700">{pedidosPendentes.length}</Badge>}
            pedidos={pedidosPendentes}
            emptyText="Sem pendências."
          />
          <PedidoColumn
            title="Aguardando Aprovação"
            badge={<Badge className="bg-red-100 text-red-700">{pedidosAguardandoAprovacao.length}</Badge>}
            pedidos={pedidosAguardandoAprovacao}
            emptyText="Sem aprovações pendentes."
            mode="aprovacao"
          />
        </div>
        <div className="flex justify-end mt-3">
          <Button variant="outline" onClick={onVerTodos}>Ver todos</Button>
        </div>
      </CardContent>
    </Card>
  );
}