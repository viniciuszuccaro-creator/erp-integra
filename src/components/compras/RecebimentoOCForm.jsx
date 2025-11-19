import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Package } from "lucide-react";

/**
 * V21.1.2: Recebimento OC - Window Mode
 */
export default function RecebimentoOCForm({ ordemCompra, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState({
    data_entrega_real: new Date().toISOString().split('T')[0],
    nota_fiscal_entrada: '',
    observacoes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-lg">{ordemCompra?.numero_oc}</p>
            </div>
            <p className="text-sm text-slate-600">Fornecedor: {ordemCompra?.fornecedor_nome}</p>
            <p className="text-sm text-slate-600">Valor: R$ {ordemCompra?.valor_total?.toFixed(2)}</p>
            <p className="text-sm text-slate-600">
              Itens: {ordemCompra?.itens?.length || 0} produto(s)
            </p>
          </div>

          <div>
            <Label>Data de Recebimento *</Label>
            <Input
              type="date"
              value={formData.data_entrega_real}
              onChange={(e) => setFormData({...formData, data_entrega_real: e.target.value})}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>Nota Fiscal de Entrada</Label>
            <Input
              value={formData.nota_fiscal_entrada}
              onChange={(e) => setFormData({...formData, nota_fiscal_entrada: e.target.value})}
              placeholder="Número da NF-e de entrada"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Observações do Recebimento</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              rows={4}
              placeholder="Condições da mercadoria, divergências, observações..."
              className="mt-1"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 font-semibold mb-2">✓ Ao confirmar:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• OC será marcada como "Recebida"</li>
              <li>• Estoque será atualizado automaticamente</li>
              <li>• Lead time será calculado</li>
              <li>• Estatísticas do fornecedor serão atualizadas</li>
              <li>• Você poderá avaliar o fornecedor em seguida</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Confirmar Recebimento
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}