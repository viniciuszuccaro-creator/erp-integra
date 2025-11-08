import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Zap } from "lucide-react";
import { mockSimularPagamento } from "@/components/integracoes/MockIntegracoes";

/**
 * Modal para simular recebimento de pagamento via webhook
 * (em produção, isso viria automaticamente do gateway)
 */
export default function SimularPagamentoModal({ isOpen, onClose, contaReceber }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const simularPagamentoMutation = useMutation({
    mutationFn: async () => {
      // Simular webhook de pagamento
      const resultado = await mockSimularPagamento({
        boleto_id: contaReceber.id_cobranca_externa,
        pix_id: contaReceber.pix_id_integracao,
        tipo: contaReceber.forma_cobranca?.toLowerCase()
      });

      // Dar baixa na conta
      await base44.entities.ContaReceber.update(contaReceber.id, {
        status: "Recebido",
        status_cobranca: "paga",
        data_recebimento: new Date().toISOString().split('T')[0],
        valor_recebido: contaReceber.valor,
        webhook_status: "pago",
        webhook_data: resultado,
        data_retorno_pagamento: new Date().toISOString()
      });

      // Log
      await base44.entities.LogCobranca.create({
        empresa_id: contaReceber.empresa_id,
        conta_receber_id: contaReceber.id,
        tipo_operacao: "webhook_recebido",
        provedor: "Mock/Simulação",
        data_hora: new Date().toISOString(),
        status_operacao: "simulado",
        retorno_recebido: resultado,
        usuario_nome: "Sistema (Webhook Simulado)"
      });

      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({
        title: "✅ Pagamento Confirmado (Simulação)",
        description: "Conta baixada automaticamente"
      });
      onClose();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Simular Recebimento de Pagamento</DialogTitle>
        </DialogHeader>

        <Alert className="border-blue-300 bg-blue-50">
          <Zap className="h-5 w-5 text-blue-600" />
          <AlertDescription>
            <strong>Modo Simulação</strong><br />
            Isso simula o recebimento de um webhook do gateway de pagamento confirmando o pagamento.
            Em produção, isso acontecerá automaticamente.
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-slate-50 rounded space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Cliente:</span>
            <span className="font-semibold">{contaReceber?.cliente}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Valor:</span>
            <span className="font-bold text-lg">
              R$ {contaReceber?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Forma:</span>
            <span className="font-semibold">{contaReceber?.forma_cobranca || '-'}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => simularPagamentoMutation.mutate()}
            disabled={simularPagamentoMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {simularPagamentoMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Pagamento (Mock)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}