import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DestinatarioTab({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Cliente/Fornecedor *</Label>
        <Input
          value={formData.cliente_fornecedor}
          onChange={(e) => setFormData({ ...formData, cliente_fornecedor: e.target.value })}
          placeholder="Nome do cliente ou fornecedor"
          required
        />
      </div>

      <div>
        <Label>CPF/CNPJ *</Label>
        <Input
          value={formData.cliente_cpf_cnpj}
          onChange={(e) => setFormData({ ...formData, cliente_cpf_cnpj: e.target.value })}
          placeholder="Digite apenas números"
          required
        />
      </div>

      <Card className="bg-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Endereço do Destinatário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Logradouro</Label>
              <Input
                value={formData.cliente_endereco?.logradouro || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  cliente_endereco: { ...formData.cliente_endereco, logradouro: e.target.value }
                })}
                placeholder="Rua, Avenida..."
              />
            </div>
            <div>
              <Label className="text-xs">Número</Label>
              <Input
                value={formData.cliente_endereco?.numero || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  cliente_endereco: { ...formData.cliente_endereco, numero: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Bairro</Label>
              <Input
                value={formData.cliente_endereco?.bairro || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  cliente_endereco: { ...formData.cliente_endereco, bairro: e.target.value }
                })}
              />
            </div>
            <div>
              <Label className="text-xs">Cidade</Label>
              <Input
                value={formData.cliente_endereco?.cidade || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  cliente_endereco: { ...formData.cliente_endereco, cidade: e.target.value }
                })}
              />
            </div>
            <div>
              <Label className="text-xs">Estado (UF)</Label>
              <Input
                value={formData.cliente_endereco?.estado || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  cliente_endereco: { ...formData.cliente_endereco, estado: e.target.value }
                })}
                maxLength={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}