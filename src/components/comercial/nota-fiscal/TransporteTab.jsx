import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TransporteTab({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Modalidade de Frete</Label>
          <Select
            value={formData.transportadora?.modalidade_frete || "CIF"}
            onValueChange={(value) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, modalidade_frete: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CIF">CIF - Por conta do emitente</SelectItem>
              <SelectItem value="FOB">FOB - Por conta do destinatário</SelectItem>
              <SelectItem value="Sem Frete">Sem Frete</SelectItem>
              <SelectItem value="Próprio">Próprio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Transportadora</Label>
          <Input
            value={formData.transportadora?.nome || ""}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, nome: e.target.value }
            })}
            placeholder="Nome da transportadora"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Volumes</Label>
          <Input
            type="number"
            value={formData.transportadora?.volumes || 0}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, volumes: parseInt(e.target.value) || 0 }
            })}
          />
        </div>

        <div>
          <Label>Peso Bruto (kg)</Label>
          <Input
            type="number"
            step="0.001"
            value={formData.transportadora?.peso_bruto || 0}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, peso_bruto: parseFloat(e.target.value) || 0 }
            })}
          />
        </div>

        <div>
          <Label>Peso Líquido (kg)</Label>
          <Input
            type="number"
            step="0.001"
            value={formData.transportadora?.peso_liquido || 0}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, peso_liquido: parseFloat(e.target.value) || 0 }
            })}
          />
        </div>
      </div>
    </div>
  );
}