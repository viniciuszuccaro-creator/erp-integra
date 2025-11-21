import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Send, X } from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * ETAPA 4 - Enviar Títulos para Caixa
 * Componente para enviar títulos de CR/CP para liquidação no Caixa
 */
export default function EnviarParaCaixa({ 
  titulos = [], 
  tipo, // 'receber' ou 'pagar'
  onClose,
  onSuccess 
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [dados, setDados] = useState({
    forma_pagamento: "",
    banco_id: "",
    observacoes: ""
  });

  const enviarParaCaixa = useMutation({
    mutationFn: async () => {
      if (!dados.forma_pagamento) {
        throw new Error("Selecione a forma de pagamento");
      }

      const valorTotal = titulos.reduce((sum, t) => sum + (t.valor_total || t.valor_titulo || 0), 0);
      
      // Criar ordem de liquidação
      const ordem = await base44.entities.CaixaOrdemLiquidacao.create({
        group_id: titulos[0].group_id,
        empresa_id: titulos[0].empresa_id,
        tipo_operacao: tipo === 'receber' ? 'Recebimento' : 'Pagamento',
        origem: tipo === 'receber' ? 'Contas a Receber' : 'Contas a Pagar',
        titulos_vinculados: titulos.map(t => ({
          titulo_id: t.id,
          tipo_titulo: tipo === 'receber' ? 'ContaReceber' : 'ContaPagar',
          numero_titulo: t.numero_titulo || t.numero_documento,
          valor_titulo: t.valor_total || t.valor_titulo,
          cliente_fornecedor_id: t.cliente_id || t.fornecedor_id,
          cliente_fornecedor_nome: t.cliente_nome || t.fornecedor_nome
        })),
        valor_total: valorTotal,
        forma_pagamento_pretendida: dados.forma_pagamento,
        banco_id: dados.banco_id,
        observacoes: dados.observacoes,
        status: "Pendente",
        data_ordem: new Date().toISOString(),
        usuario_solicitante_id: user.id
      });

      // Atualizar status dos títulos
      for (const titulo of titulos) {
        if (tipo === 'receber') {
          await base44.entities.ContaReceber.update(titulo.id, {
            status: "Enviado ao Caixa"
          });
        } else {
          await base44.entities.ContaPagar.update(titulo.id, {
            status: "Enviado ao Caixa"
          });
        }
      }

      // Registrar auditoria
      await base44.entities.AuditLog.create({
        group_id: titulos[0].group_id,
        empresa_id: titulos[0].empresa_id,
        usuario_id: user.id,
        usuario_nome: user.full_name,
        acao: `Envio para Caixa - ${tipo === 'receber' ? 'Recebimento' : 'Pagamento'}`,
        modulo: tipo === 'receber' ? 'Contas a Receber' : 'Contas a Pagar',
        entidade: "CaixaOrdemLiquidacao",
        entidade_id: ordem.id,
        detalhes: {
          quantidade_titulos: titulos.length,
          valor_total: valorTotal,
          forma_pagamento: dados.forma_pagamento
        }
      });

      return ordem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['contas-receber']);
      queryClient.invalidateQueries(['contas-pagar']);
      queryClient.invalidateQueries(['caixa-ordens']);
      toast.success("Títulos enviados para o Caixa com sucesso!");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar para o Caixa");
    }
  });

  const valorTotal = titulos.reduce((sum, t) => sum + (t.valor_total || t.valor_titulo || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              Enviar para Caixa - {tipo === 'receber' ? 'Recebimento' : 'Pagamento'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Resumo dos Títulos */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Quantidade de Títulos:</span>
              <span className="font-medium">{titulos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Valor Total:</span>
              <span className="text-lg font-bold text-green-600">
                R$ {valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </span>
            </div>
          </div>

          {/* Lista de Títulos */}
          <div className="max-h-40 overflow-y-auto space-y-2">
            {titulos.map((titulo, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded">
                <div>
                  <p className="text-sm font-medium">
                    {titulo.cliente_nome || titulo.fornecedor_nome}
                  </p>
                  <p className="text-xs text-slate-500">
                    {titulo.numero_titulo || titulo.numero_documento} • 
                    Venc: {titulo.data_vencimento ? new Date(titulo.data_vencimento).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <span className="font-medium">
                  R$ {(titulo.valor_total || titulo.valor_titulo || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
              </div>
            ))}
          </div>

          {/* Forma de Pagamento */}
          <div>
            <Label>Forma de Pagamento Pretendida *</Label>
            <Select 
              value={dados.forma_pagamento}
              onValueChange={(v) => setDados({...dados, forma_pagamento: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
                <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Link Pagamento">Link Pagamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea 
              placeholder="Informações adicionais para o operador de caixa..."
              value={dados.observacoes}
              onChange={(e) => setDados({...dados, observacoes: e.target.value})}
              rows={3}
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => enviarParaCaixa.mutate()}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={enviarParaCaixa.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar para Caixa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}