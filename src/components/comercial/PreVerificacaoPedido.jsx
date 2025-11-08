import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

/**
 * Pré-validação antes de fechar pedido
 * Bloqueia se tiver:
 * - Cliente sem contato
 * - Endereço vazio
 * - Item de produção sem bitola
 * - Pedido sem valor
 */
export default function PreVerificacaoPedido({ pedido }) {
  const erros = [];
  const avisos = [];

  // Validar contato
  if (!pedido.contato_telefone_pedido && !pedido.contato_whatsapp_pedido && !pedido.contato_email_pedido) {
    if (!pedido.contatos_cliente || pedido.contatos_cliente.length === 0) {
      erros.push({
        tipo: "contato",
        mensagem: "Cliente sem contato cadastrado",
        detalhes: "Adicione ao menos um telefone, WhatsApp ou e-mail"
      });
    }
  }

  // Validar endereço
  if (!pedido.endereco_entrega_principal || !pedido.endereco_entrega_principal.cidade) {
    erros.push({
      tipo: "endereco",
      mensagem: "Endereço de entrega não selecionado",
      detalhes: "Selecione um endereço de entrega válido"
    });
  }

  // Validar itens de produção
  if (pedido.itens_producao && pedido.itens_producao.length > 0) {
    pedido.itens_producao.forEach((item, idx) => {
      if (!item.ferro_principal_bitola) {
        erros.push({
          tipo: "producao",
          mensagem: `Item de produção #${idx + 1} sem bitola`,
          detalhes: `Item "${item.identificador || 'sem identificador'}" está sem bitola principal`
        });
      }

      if (item.origem_ia && !item.identificador) {
        erros.push({
          tipo: "producao_ia",
          mensagem: `Item de IA #${idx + 1} sem elemento estrutural`,
          detalhes: "Itens processados por IA precisam ter elemento estrutural (V1, C1, etc.)"
        });
      }
    });
  }

  // Validar valor
  if (!pedido.valor_total || pedido.valor_total <= 0) {
    erros.push({
      tipo: "valor",
      mensagem: "Pedido sem valor",
      detalhes: "Adicione itens ao pedido antes de salvar"
    });
  }

  // Validar forma de pagamento
  if (!pedido.forma_pagamento) {
    avisos.push({
      tipo: "pagamento",
      mensagem: "Forma de pagamento não definida",
      detalhes: "Defina a forma de pagamento na aba Pagamento"
    });
  }

  // Validar parcelamento sem configuração
  if (pedido.forma_pagamento === 'Parcelado' && (!pedido.parcelas || pedido.parcelas.length === 0)) {
    erros.push({
      tipo: "parcelas",
      mensagem: "Parcelamento sem parcelas definidas",
      detalhes: "Configure as parcelas na aba Pagamento"
    });
  }

  const temErros = erros.length > 0;
  const temAvisos = avisos.length > 0;

  if (!temErros && !temAvisos) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-900">✅ Pedido validado e pronto para salvar!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {erros.map((erro, idx) => (
        <Card key={`erro-${idx}`} className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">❌ {erro.mensagem}</p>
                <p className="text-sm text-red-700 mt-1">{erro.detalhes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {avisos.map((aviso, idx) => (
        <Card key={`aviso-${idx}`} className="border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900">⚠️ {aviso.mensagem}</p>
                <p className="text-sm text-orange-700 mt-1">{aviso.detalhes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {temErros && (
        <Card className="border-red-400 bg-red-100">
          <CardContent className="p-4">
            <p className="text-sm text-red-900 font-bold text-center">
              🚫 BLOQUEADO: Corrija os erros acima antes de salvar o pedido
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}