import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function EditarItemProducaoModal({ item, isOpen, onClose, onSave }) {
  const [editedItem, setEditedItem] = useState(item || {});
  const { toast } = useToast();

  const handleSave = () => {
    // Recalcular totais se necessário
    if (editedItem.tipo_servico === 'corte_dobra' && editedItem.posicoes) {
      editedItem.posicoes = editedItem.posicoes.map(pos => {
        // Recalcular peso
        const pesoPorMetro = 0.617; // Exemplo
        const comprimentoTotal = (pos.medidas?.comprimento || 0) + 
                                 (pos.medidas?.dobra_esquerda || 0) + 
                                 (pos.medidas?.dobra_direita || 0);
        pos.peso_unitario = comprimentoTotal * pesoPorMetro;
        pos.peso_total = pos.peso_unitario * (pos.quantidade_barras || 0);
        return pos;
      });
    }

    onSave(editedItem);
    toast({ title: "✅ Item Atualizado!" });
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Item de Produção</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Badge>{item.tipo_servico?.toUpperCase()}</Badge>
            <p className="text-sm text-slate-600 mt-1">{item.nome_projeto || 'Projeto'}</p>
          </div>

          {/* Campos editáveis básicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Elemento</Label>
              <Input
                value={editedItem.elemento_estrutural || ''}
                onChange={(e) => setEditedItem({...editedItem, elemento_estrutural: e.target.value})}
              />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={editedItem.quantidade_elementos || editedItem.quantidade || 1}
                onChange={(e) => setEditedItem({...editedItem, quantidade_elementos: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Input
              value={editedItem.observacoes || ''}
              onChange={(e) => setEditedItem({...editedItem, observacoes: e.target.value})}
              placeholder="Observações técnicas..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}