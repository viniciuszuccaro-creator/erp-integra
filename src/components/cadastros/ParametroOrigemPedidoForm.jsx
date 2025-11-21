import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Save } from "lucide-react";

export default function ParametroOrigemPedidoForm({ parametro, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(parametro || {
    origem: "Manual",
    canal_preferencial: "Portal",
    permitir_edicao_cliente: true,
    gerar_ordem_liquidacao_automatica: false,
    criar_conta_receber_automatica: true,
    ativo: true,
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "space-y-6";

  return (
    <div className={containerClass}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              Parâmetros de Origem de Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Origem do Pedido</Label>
              <Select value={formData.origem} onValueChange={(val) => setFormData({ ...formData, origem: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Portal">Portal</SelectItem>
                  <SelectItem value="Marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Canal Preferencial</Label>
              <Select value={formData.canal_preferencial} onValueChange={(val) => setFormData({ ...formData, canal_preferencial: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Portal">Portal</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="E-mail">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Permitir Edição pelo Cliente</Label>
                <Switch
                  checked={formData.permitir_edicao_cliente}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_edicao_cliente: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Gerar Ordem Liquidação Automática</Label>
                <Switch
                  checked={formData.gerar_ordem_liquidacao_automatica}
                  onCheckedChange={(val) => setFormData({ ...formData, gerar_ordem_liquidacao_automatica: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Criar Conta a Receber Automática</Label>
                <Switch
                  checked={formData.criar_conta_receber_automatica}
                  onCheckedChange={(val) => setFormData({ ...formData, criar_conta_receber_automatica: val })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Parâmetros
          </Button>
        </div>
      </form>
    </div>
  );
}