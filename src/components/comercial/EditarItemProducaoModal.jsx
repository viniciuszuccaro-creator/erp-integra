
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card"; // New import
import { Alert, AlertDescription } from "@/components/ui/alert"; // New import
import { Factory, Scissors, Building2 } from "lucide-react"; // New imports

/**
 * V21.1 - Modal para Editar/Criar Item de Produção
 * COM CAMPO NOVO: "Vincular à Etapa da Obra"
 */
export default function EditarItemProducaoModal({
  isOpen,
  onClose,
  onSalvar,
  item,
  tipo = 'armado',
  empresaId
}) {
  const [formData, setFormData] = useState(item || {
    tipo_peca: tipo === 'armado' ? 'Coluna' : 'Viga',
    quantidade: 1,
    bitola_principal: '',
    comprimento: 0,
    largura: 0,
    altura: 0,
    estribo_bitola: '',
    estribo_distancia: 0,
    peso_total_kg: 0,
    preco_venda_unitario: 0,
    preco_venda_total: 0,
    etapa_obra: '' // V21.1: NOVO CAMPO
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tipo === 'armado' ? (
              <>
                <Factory className="w-5 h-5 text-purple-600" />
                {item ? 'Editar' : 'Adicionar'} Peça Armada
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5 text-orange-600" />
                {item ? 'Editar' : 'Adicionar'} Peça C/D
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* V21.1: NOVO - Vincular à Etapa da Obra */}
          <Card className="border-2 border-green-300 bg-green-50">
            <CardContent className="p-4">
              <Label htmlFor="etapa-obra" className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-green-700" />
                Vincular à Etapa da Obra (V21.1)
              </Label>
              <Input
                id="etapa-obra"
                value={formData.etapa_obra || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, etapa_obra: e.target.value }))}
                placeholder="Ex: Fundação, Estrutura, Cobertura, Piso 1"
                className="bg-white"
              />
              <p className="text-xs text-green-700 mt-1">
                💡 Agrupe peças da mesma etapa para faturamento parcial
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo-peca">Tipo de Peça</Label>
              <Select
                value={formData.tipo_peca}
                onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_peca: v }))}
              >
                <SelectTrigger id="tipo-peca">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coluna">Coluna</SelectItem>
                  <SelectItem value="Viga">Viga</SelectItem>
                  <SelectItem value="Bloco">Bloco</SelectItem>
                  <SelectItem value="Sapata">Sapata</SelectItem>
                  <SelectItem value="Laje">Laje</SelectItem>
                  <SelectItem value="Estaca">Estaca</SelectItem>
                  <SelectItem value="Estribo">Estribo</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantidade-peca">Quantidade de Peças</Label>
              <Input
                id="quantidade-peca"
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1;
                  setFormData(prev => ({
                    ...prev,
                    quantidade: newQuantity,
                    preco_venda_total: (prev.preco_venda_unitario || 0) * newQuantity
                  }));
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="comprimento">Comprimento (cm)</Label>
              <Input
                id="comprimento"
                type="number"
                step="0.1"
                value={formData.comprimento}
                onChange={(e) => setFormData(prev => ({ ...prev, comprimento: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="largura">Largura (cm)</Label>
              <Input
                id="largura"
                type="number"
                step="0.1"
                value={formData.largura}
                onChange={(e) => setFormData(prev => ({ ...prev, largura: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                value={formData.altura}
                onChange={(e) => setFormData(prev => ({ ...prev, altura: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bitola-principal">Bitola Principal</Label>
              <Input
                id="bitola-principal"
                value={formData.bitola_principal}
                onChange={(e) => setFormData(prev => ({ ...prev, bitola_principal: e.target.value }))}
                placeholder="Ex: 12.5mm, 16mm"
              />
            </div>
            <div>
              <Label htmlFor="estribo-bitola">Estribo (Bitola)</Label>
              <Input
                id="estribo-bitola"
                value={formData.estribo_bitola}
                onChange={(e) => setFormData(prev => ({ ...prev, estribo_bitola: e.target.value }))}
                placeholder="Ex: 6.3mm"
              />
            </div>
          </div>

          {formData.estribo_bitola && (
            <div>
              <Label htmlFor="estribo-dist">Espaçamento Estribo (cm)</Label>
              <Input
                id="estribo-dist"
                type="number"
                step="0.1"
                value={formData.estribo_distancia}
                onChange={(e) => setFormData(prev => ({ ...prev, estribo_distancia: parseFloat(e.target.value) || 0 }))}
                placeholder="10"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="peso-total">Peso Total (KG)</Label>
              <Input
                id="peso-total"
                type="number"
                step="0.01"
                value={formData.peso_total_kg}
                onChange={(e) => setFormData(prev => ({ ...prev, peso_total_kg: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="preco-unit">Preço Unitário (R$/peça)</Label>
              <Input
                id="preco-unit"
                type="number"
                step="0.01"
                value={formData.preco_venda_unitario}
                onChange={(e) => {
                  const preco = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    preco_venda_unitario: preco,
                    preco_venda_total: preco * (prev.quantidade || 1)
                  }));
                }}
              />
            </div>
          </div>

          {/* Resumo */}
          <Alert className="border-purple-300 bg-purple-50">
            <AlertDescription>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>Peso Total:</strong> {formData.peso_total_kg?.toFixed(2)} kg</p>
                <p><strong>Valor Total:</strong> R$ {(formData.preco_venda_total || 0).toFixed(2)}</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSalvar(formData)}
            className={tipo === 'armado' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'}
          >
            {item ? 'Atualizar' : 'Adicionar'} Peça
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
