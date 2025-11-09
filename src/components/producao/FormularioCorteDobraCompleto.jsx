import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Calculator } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.1: FORMULÁRIO CORTE E DOBRA
 * Modal para adicionar peças de corte/dobra
 */
export default function FormularioCorteDobraCompleto({ isOpen, onClose, onSubmit, obraDestino = null }) {
  const [formData, setFormData] = useState({
    identificador: `CD-${Date.now()}`,
    tipo_peca: 'Viga',
    quantidade: 1,
    comprimento: 0,
    largura: 0,
    altura: 0,
    ferro_principal_bitola: '12.5',
    dobra_lado_1: 0,
    dobra_lado_2: 0,
    peso_total_kg: 0,
    preco_venda_unitario: 0,
    preco_venda_total: 0,
    obra_destino: obraDestino
  });

  const PESOS_BITOLA = {
    "6.3": 0.245,
    "8.0": 0.395,
    "10.0": 0.617,
    "12.5": 0.963,
    "16.0": 1.578,
    "20.0": 2.466,
    "25.0": 3.853
  };

  const calcular = () => {
    const pesoKgM = PESOS_BITOLA[formData.ferro_principal_bitola] || 0.963;
    const comprimentoTotal = (formData.comprimento + formData.dobra_lado_1 + formData.dobra_lado_2) / 100; // cm → m
    const pesoUnitario = comprimentoTotal * pesoKgM;
    const pesoTotal = pesoUnitario * formData.quantidade;

    const custoKg = 8.5;
    const custoTotal = pesoTotal * custoKg * 1.5; // Material + MOD
    const precoUnitario = custoTotal / formData.quantidade;

    setFormData(prev => ({
      ...prev,
      peso_total_kg: pesoTotal,
      preco_venda_unitario: precoUnitario,
      preco_venda_total: custoTotal
    }));

    toast.success("✅ Cálculo realizado!");
  };

  const handleSalvar = () => {
    if (!formData.comprimento || formData.peso_total_kg === 0) {
      toast.error("Preencha os dados e clique em CALCULAR");
      return;
    }

    onSubmit({
      ...formData,
      descricao_automatica: `${formData.tipo_peca} - ${formData.ferro_principal_bitola}mm - ${formData.comprimento}cm`
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nova Peça de Corte/Dobra {obraDestino && `- ${obraDestino}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Peça</Label>
              <Select value={formData.tipo_peca} onValueChange={(v) => setFormData({...formData, tipo_peca: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Viga">Viga</SelectItem>
                  <SelectItem value="Coluna">Coluna</SelectItem>
                  <SelectItem value="Estribo">Estribo</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantidade *</Label>
              <Input
                type="number"
                value={formData.quantidade}
                onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Comprimento (cm) *</Label>
              <Input
                type="number"
                value={formData.comprimento}
                onChange={(e) => setFormData({...formData, comprimento: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div>
              <Label>Dobra Lado 1 (cm)</Label>
              <Input
                type="number"
                value={formData.dobra_lado_1}
                onChange={(e) => setFormData({...formData, dobra_lado_1: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div>
              <Label>Dobra Lado 2 (cm)</Label>
              <Input
                type="number"
                value={formData.dobra_lado_2}
                onChange={(e) => setFormData({...formData, dobra_lado_2: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div>
            <Label>Bitola do Ferro *</Label>
            <Select value={formData.ferro_principal_bitola} onValueChange={(v) => setFormData({...formData, ferro_principal_bitola: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(PESOS_BITOLA).map(b => (
                  <SelectItem key={b} value={b}>{b}mm</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={calcular}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calcular Peso e Preço
          </Button>

          {formData.peso_total_kg > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-slate-600">Peso Total</p>
                    <p className="text-2xl font-bold text-green-700">{formData.peso_total_kg.toFixed(2)} KG</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Preço Total</p>
                    <p className="text-2xl font-bold text-green-700">
                      R$ {formData.preco_venda_total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} className="bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}