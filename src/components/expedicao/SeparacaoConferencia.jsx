import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/**
 * Separação e Conferência - V21.2
 * Checklist de picking antes da expedição
 */
export default function SeparacaoConferencia({ entregas = [] }) {
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);
  const [conferindo, setConferindo] = useState(false);
  const queryClient = useQueryClient();

  const entregasPendentes = entregas.filter(e => 
    e.status === 'Aguardando Separação' || e.status === 'Pronto para Expedir'
  );

  const entrega = entregas.find(e => e.id === entregaSelecionada);

  const concluirSeparacao = useMutation({
    mutationFn: async () => {
      if (!entregaSelecionada) throw new Error('Selecione uma entrega');
      
      return base44.entities.Entrega.update(entregaSelecionada, {
        status: 'Pronto para Expedir'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['entregas']);
      toast.success('Separação concluída!');
      setEntregaSelecionada(null);
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Entregas Pendentes ({entregasPendentes.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {entregasPendentes.map(e => (
            <div
              key={e.id}
              onClick={() => setEntregaSelecionada(e.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                entregaSelecionada === e.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{e.cliente_nome}</p>
                  <p className="text-xs text-slate-600">
                    Pedido: {e.numero_pedido}
                  </p>
                  <Badge className="mt-1 text-xs">{e.status}</Badge>
                </div>
                {entregaSelecionada === e.id && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist de Separação</CardTitle>
        </CardHeader>
        <CardContent>
          {entrega ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded">
                <p className="font-semibold">{entrega.cliente_nome}</p>
                <p className="text-sm text-slate-600">Pedido: {entrega.numero_pedido}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Conferir Quantidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Conferir Qualidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Conferir Embalagem</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Conferir Etiquetas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Conferir Documentos</span>
                </div>
              </div>

              <Button 
                className="w-full mt-6"
                onClick={() => concluirSeparacao.mutate()}
                disabled={concluirSeparacao.isPending}
              >
                {concluirSeparacao.isPending ? 'Finalizando...' : 'Concluir Separação'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Selecione uma entrega para iniciar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}