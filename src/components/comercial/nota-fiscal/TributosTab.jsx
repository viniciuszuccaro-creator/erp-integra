import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function TributosTab({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Valor Produtos</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.valor_produtos}
            onChange={(e) => setFormData({ ...formData, valor_produtos: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label>Valor Serviços</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.valor_servicos}
            onChange={(e) => setFormData({ ...formData, valor_servicos: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label>Desconto</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.valor_desconto}
            onChange={(e) => setFormData({ ...formData, valor_desconto: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label>Frete</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.valor_frete}
            onChange={(e) => setFormData({ ...formData, valor_frete: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label>Seguro</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.valor_seguro}
            onChange={(e) => setFormData({ ...formData, valor_seguro: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label>Outras Despesas</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.outras_despesas}
            onChange={(e) => setFormData({ ...formData, outras_despesas: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">VALOR TOTAL DA NF-e</span>
            <span className="text-2xl font-bold text-blue-600">
              R$ {formData.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}