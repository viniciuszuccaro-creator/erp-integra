import React from "react";

export default function PedidoResumoTotal({ total = 0 }) {
  return (
    <div className="flex justify-end">
      <div className="text-right">
        <p className="text-sm text-slate-500">Valor Total</p>
        <p className="text-2xl font-bold text-blue-600">
          R$ {Number(total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}