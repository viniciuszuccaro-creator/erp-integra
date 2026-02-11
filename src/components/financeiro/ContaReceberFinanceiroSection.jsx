import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContaReceberFinanceiroSection({ formData, setFormData, formasPagamento = [] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Forma de Recebimento</Label>
          <Select
            value={formData.forma_recebimento_id || formData.forma_recebimento}
            onValueChange={(formaId) => {
              const forma = (formasPagamento || []).find((f) => f.id === formaId);
              setFormData({
                ...formData,
                forma_recebimento_id: formaId,
                forma_recebimento: forma?.descricao || formaId,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(formasPagamento || []).map((forma) => (
                <SelectItem key={forma.id} value={forma.id}>
                  {forma.icone && `${forma.icone} `}
                  {forma.descricao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Recebido">Recebido</SelectItem>
              <SelectItem value="Atrasado">Atrasado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
              <SelectItem value="Parcial">Parcial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Número do Documento</Label>
          <Input
            value={formData.numero_documento}
            onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
            placeholder="Ex: NF-123456"
          />
        </div>

        <div>
          <Label>Número Parcela</Label>
          <Input
            value={formData.numero_parcela}
            onChange={(e) => setFormData({ ...formData, numero_parcela: e.target.value })}
            placeholder="Ex: 1/3"
          />
        </div>
      </div>
    </div>
  );
}