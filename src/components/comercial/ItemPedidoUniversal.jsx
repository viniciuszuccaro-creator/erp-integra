import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Image as ImageIcon } from "lucide-react";
import { ExibirEquivalenteKG } from "@/components/lib/CalculadoraUnidades";

/**
 * V22.0: ITEM DE PEDIDO UNIVERSAL
 * Mostra a unidade de venda + equivalente KG
 * Usado em: Lista de Itens do Pedido, NF-e, Orçamento PDF
 */
export default function ItemPedidoUniversal({ item, onEdit, onRemove, exibirAcoes = true }) {
  const valorTotal = (item.quantidade || 0) * (item.valor_unitario || 0);
  const desconto = item.percentual_desconto ? (valorTotal * (item.percentual_desconto / 100)) : 0;
  const valorFinal = valorTotal - desconto;

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Foto do Produto - V22.0 */}
          <div className="flex items-start gap-3 flex-1">
            {item.foto_produto_url ? (
              <img 
                src={item.foto_produto_url} 
                alt={item.descricao} 
                className="w-14 h-14 object-cover rounded border"
              />
            ) : (
              <div className="w-14 h-14 bg-slate-100 rounded border flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
            )}

            <div className="flex-1">
              <p className="font-semibold text-sm">{item.descricao}</p>
              {item.codigo_produto && (
                <p className="text-xs text-slate-500">SKU: {item.codigo_produto}</p>
              )}
              
              {/* V22.0: Quantidade + Equivalente KG */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-sm">
                  {item.quantidade} {item.unidade}
                </Badge>
                
                <ExibirEquivalenteKG
                  quantidade={item.quantidade}
                  unidade={item.unidade}
                  produto={item.produto || { 
                    fatores_conversao: item.fatores_conversao, 
                    peso_teorico_kg_m: item.peso_teorico_kg_m 
                  }}
                />
              </div>

              {/* Preço */}
              <div className="mt-2 text-xs text-slate-600">
                <p>R$ {(item.valor_unitario || 0).toFixed(2)}/{item.unidade}</p>
                {desconto > 0 && (
                  <p className="text-orange-600">Desconto: {item.percentual_desconto}% (R$ {desconto.toFixed(2)})</p>
                )}
              </div>
            </div>
          </div>

          {/* Valor Total */}
          <div className="text-right">
            <p className="text-lg font-bold text-green-700">
              R$ {valorFinal.toFixed(2)}
            </p>
            {desconto > 0 && (
              <p className="text-xs text-slate-500 line-through">
                R$ {valorTotal.toFixed(2)}
              </p>
            )}
          </div>

          {/* Ações */}
          {exibirAcoes && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onRemove && (
                <Button size="sm" variant="ghost" onClick={() => onRemove(item)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}