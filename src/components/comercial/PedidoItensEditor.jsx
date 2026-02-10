import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function PedidoItensEditor({
  fields,
  itens,
  errors,
  setItemField,
  append,
  remove
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label>Itens do Pedido</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ descricao: "", quantidade: 1, valor_unitario: 0, valor_total: 0 })}
        >
          <Plus className="w-4 h-4 mr-1" /> Adicionar Item
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((fieldItem, index) => (
          <div key={fieldItem.id} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
            <div className="col-span-5">
              <Input
                placeholder="Descrição"
                value={itens?.[index]?.descricao ?? ""}
                onChange={(e) => setItemField(index, "descricao", e.target.value)}
              />
              {errors.itens?.[index]?.descricao && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.itens[index].descricao?.message}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="Qtd"
                value={itens?.[index]?.quantidade ?? 0}
                onChange={(e) => setItemField(index, "quantidade", Number(e.target.value) || 0)}
              />
              {errors.itens?.[index]?.quantidade && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.itens[index].quantidade?.message}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Valor"
                value={itens?.[index]?.valor_unitario ?? 0}
                onChange={(e) => setItemField(index, "valor_unitario", Number(e.target.value) || 0)}
              />
              {errors.itens?.[index]?.valor_unitario && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.itens[index].valor_unitario?.message}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <Input
                value={`R$ ${(itens?.[index]?.valor_total || 0).toFixed(2)}`}
                readOnly
                className="bg-slate-50"
              />
              {errors.itens?.[index]?.valor_total && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.itens[index].valor_total?.message}
                </p>
              )}
            </div>
            <div className="col-span-1 flex items-center">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {errors.itens && typeof errors.itens.message === "string" && (
        <p className="text-xs text-red-600 mt-2">{errors.itens.message}</p>
      )}
    </div>
  );
}