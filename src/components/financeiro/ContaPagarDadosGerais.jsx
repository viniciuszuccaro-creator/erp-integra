import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContaPagarDadosGerais({ formData, setFormData, fornecedores = [], empresas = [] }) {
  return (
    <>
      <div>
        <Label>Descrição *</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Ex: Compra de Matéria-Prima - OC #456"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fornecedor *</Label>
          <Select
            value={formData.fornecedor_id}
            onValueChange={(v) => {
              const forn = fornecedores.find((f) => f.id === v);
              setFormData({
                ...formData,
                fornecedor_id: v,
                fornecedor: forn?.nome || forn?.razao_social || "",
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fornecedor..." />
            </SelectTrigger>
            <SelectContent>
              {fornecedores.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.nome || f.razao_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Empresa *</Label>
          <Select
            value={formData.empresa_id}
            onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a empresa..." />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome_fantasia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Valor *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
            <Input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label>Data Emissão *</Label>
          <Input
            type="date"
            value={formData.data_emissao}
            onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Data Vencimento *</Label>
          <Input
            type="date"
            value={formData.data_vencimento}
            onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
            required
          />
        </div>
      </div>
    </>
  );
}