
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";

export default function PedidoHeader({ formData, pedido }) {
  return (
    <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">
              {pedido ? 'Editar Pedido' : 'Novo Pedido'}
            </h2>
            {pedido?.numero_pedido && (
              <Badge variant="outline" className="text-xs">#{pedido.numero_pedido}</Badge>
            )}
          </div>
          <p className="text-xs text-slate-600">V21.1.2-R1 • 9 Abas • Multi-instância • Histórico</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={
            formData.status === 'Aprovado' ? 'bg-green-600' :
            formData.status === 'Aguardando Aprovação' ? 'bg-orange-600' :
            'bg-slate-600'
          }>
            {formData.status}
          </Badge>
          {formData.prioridade === 'Urgente' && (
            <Badge className="bg-red-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Urgente
            </Badge>
          )}
          <Badge className={`${formData.origem_pedido === 'Manual' ? 'bg-slate-600' : 'bg-gradient-to-r from-purple-600 to-blue-600'}`}>
            🎯 {formData.origem_pedido}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-600">
          <span>Progresso do Pedido</span>
          <span>{Math.round(formData.percentual_conclusao_wizard || 0)}%</span>
        </div>
        <Progress value={formData.percentual_conclusao_wizard || 0} className="h-2" />
      </div>
    </div>
  );
}
