import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Receipt } from "lucide-react";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function CentroCustoForm({ centroCusto, onSubmit, isSubmitting, windowMode = false }) {
  const [formData, setFormData] = useState(centroCusto || {
    codigo: "",
    descricao: "",
    tipo: "Despesa",
    categoria: "Administrativo",
    responsavel: "",
    orcamento_mensal: "",
    status: "Ativo",
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      orcamento_mensal: formData.orcamento_mensal ? parseFloat(formData.orcamento_mensal) : null
    };
    onSubmit(dataToSubmit);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ex: CC001"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Despesa">Despesa</SelectItem>
              <SelectItem value="Investimento">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrativo">Administrativo</SelectItem>
              <SelectItem value="Comercial">Comercial</SelectItem>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="TI">TI</SelectItem>
              <SelectItem value="RH">RH</SelectItem>
              <SelectItem value="Logística">Logística</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="responsavel">Responsável</Label>
          <Input
            id="responsavel"
            value={formData.responsavel}
            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="orcamento_mensal">Orçamento Mensal (R$)</Label>
          <Input
            id="orcamento_mensal"
            type="number"
            step="0.01"
            value={formData.orcamento_mensal}
            onChange={(e) => setFormData({ ...formData, orcamento_mensal: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
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
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            {centroCusto ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}