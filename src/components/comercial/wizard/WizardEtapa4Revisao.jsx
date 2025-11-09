import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronLeft, 
  CheckCircle, 
  User, 
  MapPin, 
  Package, 
  DollarSign,
  FileText,
  Loader2,
  Printer,
  Save
} from "lucide-react";
import ItemPedidoUniversal from "../ItemPedidoUniversal";

/**
 * V21.1: ABA 4 - REVISÃO FINAL
 * Preview completo antes de salvar
 */
export default function WizardEtapa4Revisao({ formData, onBack, onSalvar, isSalvando }) {
  const [aceitouRevisao, setAceitouRevisao] = useState(false);

  const itensRevenda = formData.itens_revenda || [];
  const itensArmado = formData.itens_armado_padrao || [];
  const itensCorte = formData.itens_corte_dobra || [];
  const totalItens = itensRevenda.length + itensArmado.length + itensCorte.length;

  return (
    <div className="space-y-6">
      <Alert className="border-blue-300 bg-blue-50">
        <CheckCircle className="w-5 h-5 text-blue-600" />
        <AlertDescription>
          <p className="font-semibold text-blue-900 mb-1">✅ Pedido Pronto para Salvar</p>
          <p className="text-sm text-blue-800">
            Revise todas as informações antes de finalizar. Após salvar, o pedido ficará com status "Aguardando Aprovação".
          </p>
        </AlertDescription>
      </Alert>

      {/* RESUMO CLIENTE */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Cliente e Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-600">Cliente</p>
            <p className="font-semibold">{formData.cliente_nome}</p>
            <p className="text-xs text-slate-500">{formData.cliente_cpf_cnpj}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Endereço de Entrega</p>
            <p className="font-semibold text-xs">
              {formData.endereco_entrega_principal?.logradouro}, {formData.endereco_entrega_principal?.numero}
            </p>
            <p className="text-xs text-slate-500">
              {formData.endereco_entrega_principal?.cidade} - {formData.endereco_entrega_principal?.estado}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* RESUMO ITENS */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Itens do Pedido ({totalItens})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {itensRevenda.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-2">Revenda ({itensRevenda.length})</p>
              {itensRevenda.map((item, idx) => (
                <ItemPedidoUniversal key={idx} item={item} exibirAcoes={false} />
              ))}
            </div>
          )}

          {itensArmado.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-indigo-900 mb-2">Armado ({itensArmado.length})</p>
              {itensArmado.map((item, idx) => (
                <ItemPedidoUniversal 
                  key={idx} 
                  item={{
                    ...item,
                    descricao: item.descricao_automatica || `Armado ${item.tipo_armacao}`,
                    quantidade: item.quantidade,
                    unidade: 'UN'
                  }}
                  exibirAcoes={false} 
                />
              ))}
            </div>
          )}

          {itensCorte.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-orange-900 mb-2">Corte/Dobra ({itensCorte.length})</p>
              {itensCorte.map((item, idx) => (
                <ItemPedidoUniversal 
                  key={idx} 
                  item={{
                    ...item,
                    descricao: item.descricao_automatica || `${item.tipo_peca}`,
                    quantidade: item.quantidade,
                    unidade: 'UN'
                  }}
                  exibirAcoes={false} 
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESUMO FINANCEIRO */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-700">Forma de Pagamento:</span>
              <span className="font-semibold">{formData.forma_pagamento}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Valor Total:</span>
              <span className="font-bold text-xl text-green-700">
                R$ {(formData.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Peso Total:</span>
              <span className="font-semibold">{(formData.peso_total_kg || 0).toFixed(2)} KG</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONFIRMAÇÃO */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border">
        <input
          type="checkbox"
          checked={aceitouRevisao}
          onChange={(e) => setAceitouRevisao(e.target.checked)}
          className="w-5 h-5"
        />
        <Label className="cursor-pointer">
          Confirmo que revisei todas as informações e desejo criar o pedido
        </Label>
      </div>

      {/* NAVEGAÇÃO */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          onClick={onSalvar}
          disabled={!aceitouRevisao || isSalvando}
          className="bg-green-600 hover:bg-green-700 px-8"
        >
          {isSalvando ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Criar Pedido
            </>
          )}
        </Button>
      </div>
    </div>
  );
}