import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import WizardEtapa1Cliente from "./wizard/WizardEtapa1Cliente";
import WizardEtapa2Itens from "./wizard/WizardEtapa2Itens";
import WizardEtapa3Financeiro from "./wizard/WizardEtapa3Financeiro";
import WizardEtapa4Revisao from "./wizard/WizardEtapa4Revisao";
import { toast } from "sonner";

/**
 * Wizard de Pedido - V21.1
 * Fluxo guiado com validação de Hub V16.1
 */
export default function WizardPedido({ open, onOpenChange, pedidoInicial = null }) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosPedido, setDadosPedido] = useState(pedidoInicial || {
    cliente_id: '',
    cliente_nome: '',
    vendedor_id: '',
    vendedor: '',
    itens_revenda: [],
    valor_total: 0,
    forma_pagamento: '',
    tipo_frete: 'CIF',
    endereco_entrega_id: '',
  });
  const queryClient = useQueryClient();

  const etapas = [
    { numero: 1, titulo: 'Cliente e Vendedor', icone: '👤' },
    { numero: 2, titulo: 'Itens do Pedido', icone: '📦' },
    { numero: 3, titulo: 'Financeiro e Entrega', icone: '💰' },
    { numero: 4, titulo: 'Revisão Final', icone: '✅' },
  ];

  const progresso = (etapaAtual / etapas.length) * 100;

  const proximaEtapa = () => {
    if (etapaAtual < etapas.length) {
      setEtapaAtual(etapaAtual + 1);
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
    }
  };

  const finalizarPedido = useMutation({
    mutationFn: async () => {
      const pedidos = await base44.entities.Pedido.list();
      const numeroPedido = `PED${(pedidos.length + 1).toString().padStart(6, '0')}`;

      return base44.entities.Pedido.create({
        ...dadosPedido,
        numero_pedido: numeroPedido,
        tipo: 'Pedido',
        data_pedido: new Date().toISOString().split('T')[0],
        status: 'Aguardando Aprovação',
        origem_pedido: 'Manual',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pedidos']);
      toast.success('Pedido criado com sucesso!');
      onOpenChange(false);
      setEtapaAtual(1);
      setDadosPedido({});
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Novo Pedido - Wizard Guiado</span>
            <Badge variant="outline">Etapa {etapaAtual} de {etapas.length}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Progress value={progresso} className="h-2" />
            <div className="flex justify-between">
              {etapas.map(etapa => (
                <div 
                  key={etapa.numero}
                  className={`flex items-center gap-2 ${etapa.numero === etapaAtual ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}
                >
                  {etapa.numero < etapaAtual ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                  <span className="text-xs hidden md:inline">{etapa.icone} {etapa.titulo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            {etapaAtual === 1 && (
              <WizardEtapa1Cliente 
                dadosPedido={dadosPedido}
                onChange={setDadosPedido}
              />
            )}
            {etapaAtual === 2 && (
              <WizardEtapa2Itens 
                dadosPedido={dadosPedido}
                onChange={setDadosPedido}
              />
            )}
            {etapaAtual === 3 && (
              <WizardEtapa3Financeiro 
                dadosPedido={dadosPedido}
                onChange={setDadosPedido}
              />
            )}
            {etapaAtual === 4 && (
              <WizardEtapa4Revisao 
                dadosPedido={dadosPedido}
              />
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            {etapaAtual > 1 && (
              <Button 
                variant="outline" 
                onClick={etapaAnterior}
              >
                Anterior
              </Button>
            )}
            <div className="flex-1" />
            {etapaAtual < etapas.length && (
              <Button 
                onClick={proximaEtapa}
                disabled={
                  (etapaAtual === 1 && !dadosPedido.cliente_id) ||
                  (etapaAtual === 2 && dadosPedido.itens_revenda?.length === 0)
                }
              >
                Próxima Etapa
              </Button>
            )}
            {etapaAtual === etapas.length && (
              <Button 
                onClick={() => finalizarPedido.mutate()}
                disabled={finalizarPedido.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {finalizarPedido.isPending ? 'Criando...' : 'Criar Pedido'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}