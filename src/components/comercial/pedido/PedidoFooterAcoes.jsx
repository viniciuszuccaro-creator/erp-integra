import React from "react";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle2, Truck } from "lucide-react";

export default function PedidoFooterAcoes({
  valorTotal = 0,
  pesoTotalKg = 0,
  etapasCount = 0,
  salvando = false,
  canSalvarRascunho = false,
  canFecharCompleto = false,
  canFecharEnviarEntrega = false,
  canSalvarAlteracoes = false,
  canCriarPedido = false,
  onCancelar,
  onSalvarRascunho,
  onFecharCompleto,
  onFecharEnviarEntrega,
  onSalvarAlteracoes,
  onCriarPedido,
}) {
  return (
    <div className="flex-shrink-0 p-6 border-t bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="text-slate-600">Valor Total</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {Number(valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-slate-600">Peso Total</p>
            <p className="text-xl font-bold text-blue-600">{Number(pesoTotalKg).toFixed(2)} kg</p>
          </div>
          {etapasCount > 0 && (
            <div className="text-sm">
              <p className="text-slate-600">Etapas de Faturamento</p>
              <p className="text-xl font-bold text-purple-600">{etapasCount}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancelar}>Cancelar</Button>

          {canSalvarRascunho && (
            <Button variant="outline" onClick={onSalvarRascunho} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
          )}

          {canFecharCompleto && (
            <Button
              onClick={onFecharCompleto}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg"
              disabled={salvando}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {salvando ? 'Salvando...' : '🚀 Fechar Pedido Completo'}
            </Button>
          )}

          {canFecharEnviarEntrega && (
            <Button onClick={onFecharEnviarEntrega} className="bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={salvando}>
              <Truck className="w-4 h-4 mr-2" />
              {salvando ? 'Fechando...' : 'Fechar e Enviar para Entrega'}
            </Button>
          )}

          {canSalvarAlteracoes && (
            <Button onClick={onSalvarAlteracoes} className="bg-slate-600 hover:bg-slate-700" disabled={salvando}>
              <Check className="w-4 h-4 mr-2" />
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          )}

          {canCriarPedido && (
            <Button onClick={onCriarPedido} className="bg-blue-600 hover:bg-blue-700" disabled={salvando}>
              <Check className="w-4 h-4 mr-2" />
              {salvando ? 'Salvando...' : 'Criar Pedido'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}