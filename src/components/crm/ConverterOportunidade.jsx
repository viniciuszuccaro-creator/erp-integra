import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";

/**
 * Converter Oportunidade - V21.1
 * Gera Pedido a partir da Oportunidade
 */
export default function ConverterOportunidade({ open, onOpenChange, oportunidade }) {
  const queryClient = useQueryClient();

  const converterMutation = useMutation({
    mutationFn: async () => {
      // Gerar número de pedido
      const pedidos = await base44.entities.Pedido.list();
      const numeroPedido = `PED${(pedidos.length + 1).toString().padStart(6, '0')}`;

      // Criar pedido
      const pedido = await base44.entities.Pedido.create({
        numero_pedido: numeroPedido,
        tipo: 'Pedido',
        tipo_pedido: 'Revenda',
        origem_pedido: 'CRM',
        cliente_id: oportunidade.cliente_id,
        cliente_nome: oportunidade.cliente_nome,
        vendedor: oportunidade.responsavel,
        vendedor_id: oportunidade.responsavel_id,
        data_pedido: new Date().toISOString().split('T')[0],
        valor_total: oportunidade.valor_estimado || 0,
        status: 'Rascunho',
        observacoes_internas: `Convertido da oportunidade: ${oportunidade.titulo}`,
        itens_revenda: [],
      });

      // Atualizar oportunidade
      await base44.entities.Oportunidade.update(oportunidade.id, {
        status: 'Ganho',
        etapa: 'Fechamento',
        data_fechamento: new Date().toISOString().split('T')[0],
        pedido_gerado_id: pedido.id
      });

      return pedido;
    },
    onSuccess: (pedido) => {
      queryClient.invalidateQueries(['oportunidades']);
      queryClient.invalidateQueries(['pedidos']);
      toast.success('Oportunidade convertida em pedido!');
      onOpenChange(false);
      
      // Redirecionar para o pedido
      setTimeout(() => {
        window.location.href = createPageUrl('Comercial');
      }, 1500);
    },
  });

  if (!oportunidade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Converter em Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">{oportunidade.titulo}</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p><strong>Cliente:</strong> {oportunidade.cliente_nome}</p>
              <p><strong>Responsável:</strong> {oportunidade.responsavel}</p>
              <p>
                <strong>Valor Estimado:</strong> R$ {(oportunidade.valor_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">O que acontecerá:</span>
            </div>
            <ul className="space-y-1 text-sm text-green-700">
              <li>✓ Um pedido em Rascunho será criado</li>
              <li>✓ Você será redirecionado para finalizá-lo</li>
              <li>✓ A oportunidade será marcada como "Ganho"</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={() => converterMutation.mutate()} 
              disabled={converterMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {converterMutation.isPending ? 'Convertendo...' : 'Converter em Pedido'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}