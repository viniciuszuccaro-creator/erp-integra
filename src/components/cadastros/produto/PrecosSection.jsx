import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function PrecosSection({ formData, setFormData }) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-bold text-green-900">💰 Precificação</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Custo Aquisição</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.custo_aquisicao}
              onChange={(e) => setFormData(prev => ({...prev, custo_aquisicao: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Preço Venda</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.preco_venda}
              onChange={(e) => setFormData(prev => ({...prev, preco_venda: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Margem (%)</Label>
            <Input
              type="number"
              value={formData.custo_aquisicao > 0 ? (((formData.preco_venda - formData.custo_aquisicao) / formData.custo_aquisicao) * 100).toFixed(2) : 0}
              disabled
              className="bg-white"
            />
          </div>
          <div>
            <Label>Margem Mínima (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.margem_minima_percentual}
              onChange={(e) => setFormData(prev => ({...prev, margem_minima_percentual: parseFloat(e.target.value) || 0}))}
            />
            <p className="text-xs text-slate-500 mt-1">Usada na aprovação de descontos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}