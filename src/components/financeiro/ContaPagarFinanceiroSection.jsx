import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContaPagarFinanceiroSection({ formData, setFormData, formasPagamento }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Categoria</Label>
          <Select
            value={formData.categoria}
            onValueChange={(v) => setFormData({ ...formData, categoria: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fornecedores">Fornecedores</SelectItem>
              <SelectItem value="Salários">Salários</SelectItem>
              <SelectItem value="Impostos">Impostos</SelectItem>
              <SelectItem value="Aluguel">Aluguel</SelectItem>
              <SelectItem value="Energia">Energia</SelectItem>
              <SelectItem value="Água">Água</SelectItem>
              <SelectItem value="Telefone">Telefone</SelectItem>
              <SelectItem value="Internet">Internet</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Comissões">Comissões</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Forma de Pagamento</Label>
          <Select
            value={formData.forma_pagamento_id || formData.forma_pagamento}
            onValueChange={(formaId) => {
              const forma = (formasPagamento || []).find((f) => f.id === formaId);
              setFormData({
                ...formData,
                forma_pagamento_id: formaId,
                forma_pagamento: forma?.descricao || formaId,
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Número do Documento</Label>
          <Input
            value={formData.numero_documento}
            onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
            placeholder="Ex: NF-789"
          />
        </div>

        <div>
          <Label>Número Parcela</Label>
          <Input
            value={formData.numero_parcela}
            onChange={(e) => setFormData({ ...formData, numero_parcela: e.target.value })}
            placeholder="Ex: 2/5"
          />
        </div>
      </div>
    </div>
  );
}