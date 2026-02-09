import React, { useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useContextoVisual from "@/components/lib/useContextoVisual";

// Tipos auxiliares
const itemSchema = z
  .object({
    descricao: z.string().min(1, "Descrição obrigatória"),
    quantidade: z.coerce.number().positive("Qtd > 0"),
    valor_unitario: z.coerce.number().min(0, "Valor inválido"),
    valor_total: z.coerce.number().min(0),
  })
  .refine(
    (d) => Math.abs(d.valor_total - d.quantidade * d.valor_unitario) < 0.0001,
    { path: ["valor_total"], message: "Total ≠ qtd x valor" }
  );

const pedidoSchema = z
  .object({
    numero_pedido: z.string().min(3, "Número inválido"),
    cliente_id: z.string().min(1, "Cliente é obrigatório"),
    cliente_nome: z.string().min(1, "Cliente é obrigatório"),
    data_pedido: z
      .string()
      .min(8, "Data inválida")
      .refine((s) => {
        const d = new Date(s);
        const hoje = new Date();
        d.setHours(0, 0, 0, 0);
        hoje.setHours(0, 0, 0, 0);
        return d <= hoje;
      }, "Data não pode ser futura"),
    status: z.enum(["Orçamento", "Aprovado", "Em Produção", "Pronto para Envio"]).default("Orçamento"),
    forma_pagamento: z.enum(["À Vista", "Cartão de Crédito", "Boleto", "Parcelado", "PIX"]).default("À Vista"),
    itens: z.array(itemSchema).min(1, "Inclua pelo menos 1 item"),
    observacoes: z.string().optional().default(""),
  })
  .refine((p) => p.itens.reduce((s, i) => s + (i.valor_total || 0), 0) >= 0, {
    message: "Total do pedido inválido",
    path: ["itens"],
  })
  .superRefine((p, ctx) => {
    if (p.forma_pagamento === 'Parcelado' && (!p.observacoes || p.observacoes.trim().length < 5)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['observacoes'], message: 'Informe as condições do parcelamento nas observações' });
    }
    if (p.status === 'Aprovado') {
      const algumZerado = p.itens.some(i => (i.valor_unitario || 0) <= 0);
      if (algumZerado) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['itens'], message: 'Itens aprovados devem ter valor unitário > 0' });
      }
    }
  });

export default function PedidoForm({ clientes = [], onSubmit, isSubmitting }) {
  const { carimbarContexto } = useContextoVisual();

  const defaultValues = useMemo(
    () => ({
      numero_pedido: `PED-${Date.now()}`,
      cliente_nome: "",
      cliente_id: "",
      data_pedido: new Date().toISOString().split("T")[0],
      status: "Orçamento",
      forma_pagamento: "À Vista",
      itens: [{ descricao: "", quantidade: 1, valor_unitario: 0, valor_total: 0 }],
      observacoes: "",
    }),
    []
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: zodResolver(pedidoSchema),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });

  const itens = watch("itens");

  // Recalcular valor_total do item ao alterar quantidade/valor
  const setItemField = (index, field, value) => {
    const path = `itens.${index}.${field}`;
    setValue(path, value, { shouldValidate: true, shouldDirty: true });
    if (field === "quantidade" || field === "valor_unitario") {
      const qtd = field === "quantidade" ? value : itens?.[index]?.quantidade || 0;
      const vu = field === "valor_unitario" ? value : itens?.[index]?.valor_unitario || 0;
      setValue(`itens.${index}.valor_total`, (Number(qtd) || 0) * (Number(vu) || 0), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const calculateTotal = () => (itens || []).reduce((sum, i) => sum + (Number(i?.valor_total) || 0), 0);

  const onSubmitForm = handleSubmit((data) => {
    const payload = { ...data, valor_total: calculateTotal() };
    const stamped = carimbarContexto(payload, "empresa_id");
    onSubmit(stamped);
  });

  return (
    <form onSubmit={onSubmitForm} className="space-y-6 w-full h-full">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="numero_pedido">Nº Pedido</Label>
          <Input id="numero_pedido" {...register("numero_pedido")} />
          {errors.numero_pedido && (
            <p className="text-xs text-red-600 mt-1">{errors.numero_pedido.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="data_pedido">Data</Label>
          <Input id="data_pedido" type="date" {...register("data_pedido")} />
          {errors.data_pedido && (
            <p className="text-xs text-red-600 mt-1">{errors.data_pedido.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="cliente">Cliente *</Label>
          <Controller
            control={control}
            name="cliente_id"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  const cli = clientes.find((c) => c.id === value);
                  field.onChange(value);
                  setValue("cliente_nome", cli?.nome || "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.cliente_id && (
            <p className="text-xs text-red-600 mt-1">{errors.cliente_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Orçamento">Orçamento</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Em Produção">Em Produção</SelectItem>
                  <SelectItem value="Pronto para Envio">Pronto para Envio</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
          <Controller
            control={control}
            name="forma_pagamento"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="À Vista">À Vista</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Parcelado">Parcelado</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

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
                  {...register(`itens.${index}.descricao`)}
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

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-sm text-slate-500">Valor Total</p>
          <p className="text-2xl font-bold text-blue-600">
            R$ {calculateTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" rows={3} {...register("observacoes")} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Salvando..." : "Salvar Pedido"}
        </Button>
      </div>
    </form>
  );
}