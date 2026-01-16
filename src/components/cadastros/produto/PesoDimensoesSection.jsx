import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PesoDimensoesSection({ formData, setFormData }) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-bold text-orange-900">📦 Peso e Dimensões (Logística)</h3>
        <Alert className="border-orange-300 bg-orange-100">
          <AlertDescription className="text-xs text-orange-900">
            <strong>Usado em:</strong> Cálculo de frete, cubagem, marketplace, Portal
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Peso Líquido (kg)</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.peso_liquido_kg}
              onChange={(e) => setFormData(prev => ({...prev, peso_liquido_kg: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Peso Bruto (kg)</Label>
            <Input
              type="number"
              step="0.001"
              value={formData.peso_bruto_kg}
              onChange={(e) => setFormData(prev => ({...prev, peso_bruto_kg: parseFloat(e.target.value) || 0}))}
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Altura (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.altura_cm}
              onChange={(e) => setFormData(prev => ({...prev, altura_cm: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Largura (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.largura_cm}
              onChange={(e) => setFormData(prev => ({...prev, largura_cm: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Comprimento (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.comprimento_cm}
              onChange={(e) => setFormData(prev => ({...prev, comprimento_cm: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Volume (m³)</Label>
            <Input
              type="number"
              value={formData.volume_m3?.toFixed(6) || 0}
              disabled
              className="bg-white"
            />
          </div>
        </div>
        {formData.volume_m3 > 0 && (
          <Alert className="border-green-300 bg-green-50">
            <AlertDescription className="text-xs text-green-900">
              ✅ Cubagem: {formData.volume_m3.toFixed(6)} m³
              {formData.peso_bruto_kg > 0 && ` • Peso taxado: ${Math.max(formData.peso_bruto_kg, formData.volume_m3 * 300).toFixed(2)} kg`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}