import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Package } from "lucide-react";

export default function ItensTab({ formData, setFormData }) {
  const addItem = () => {
    const novoItem = {
      numero_item: (formData.itens?.length || 0) + 1,
      descricao: "",
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0,
      cfop: formData.cfop,
      unidade: "UN"
    };
    setFormData({ ...formData, itens: [...(formData.itens || []), novoItem] });
  };

  const removeItem = (idx) => {
    const novosItens = formData.itens.filter((_, i) => i !== idx);
    setFormData({ ...formData, itens: novosItens });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">{formData.itens?.length || 0} item(ns) na nota</p>
        <Button type="button" size="sm" onClick={addItem}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {formData.itens?.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Valor Unit.</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formData.itens.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.numero_item}</TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell>R$ {item.valor_unitario?.toFixed(2)}</TableCell>
                <TableCell>R$ {item.valor_total?.toFixed(2)}</TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhum item adicionado</p>
          <p className="text-xs">Clique em "Adicionar Item" para começar</p>
        </div>
      )}
    </div>
  );
}