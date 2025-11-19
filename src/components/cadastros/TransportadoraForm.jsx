import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, Truck } from "lucide-react";

/**
 * V21.1.2: Transportadora Form - Adaptado para Window Mode
 */
export default function TransportadoraForm({ transportadora, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(transportadora || {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    rntrc: '',
    email: '',
    telefone: '',
    whatsapp: '',
    contato_responsavel: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    prazo_entrega_padrao: 0,
    valor_frete_minimo: 0,
    status: 'Ativo',
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
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" />
            Dados da Transportadora
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Razão Social *</Label>
              <Input
                value={formData.razao_social}
                onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Nome Fantasia</Label>
              <Input
                value={formData.nome_fantasia}
                onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
              />
            </div>

            <div>
              <Label>CNPJ *</Label>
              <Input
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Inscrição Estadual</Label>
              <Input
                value={formData.inscricao_estadual}
                onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
              />
            </div>

            <div>
              <Label>RNTRC</Label>
              <Input
                value={formData.rntrc}
                onChange={(e) => setFormData({ ...formData, rntrc: e.target.value })}
                placeholder="Registro Nacional"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Telefone</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>

            <div>
              <Label>Prazo Entrega Padrão (dias)</Label>
              <Input
                type="number"
                value={formData.prazo_entrega_padrao}
                onChange={(e) => setFormData({ ...formData, prazo_entrega_padrao: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
          <Save className="w-4 h-4 mr-2" />
          {transportadora ? 'Atualizar' : 'Criar'} Transportadora
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}