import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, DollarSign } from "lucide-react";

/**
 * V21.1.2: Conta a Pagar Form - Adaptado para Window Mode
 */
export default function ContaPagarForm({ conta, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(conta || {
    descricao: '',
    fornecedor: '',
    fornecedor_id: '',
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    forma_pagamento: 'Boleto',
    categoria: 'Fornecedores',
    centro_custo: '',
    observacoes: '',
    empresa_id: ''
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
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
            <DollarSign className="w-5 h-5 text-red-600" />
            Dados da Conta a Pagar
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Fornecedor *</Label>
              <Select
                value={formData.fornecedor_id}
                onValueChange={(value) => {
                  const forn = fornecedores.find(f => f.id === value);
                  setFormData({
                    ...formData,
                    fornecedor_id: value,
                    fornecedor: forn?.nome || ''
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
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
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Empresa *</Label>
              <Select
                value={formData.empresa_id}
                onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome_fantasia || e.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Valor *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
                required
              />
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

            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="TED">TED</SelectItem>
                  <SelectItem value="DOC">DOC</SelectItem>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão">Cartão</SelectItem>
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
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          <Save className="w-4 h-4 mr-2" />
          {conta ? 'Atualizar' : 'Criar'} Conta a Pagar
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}