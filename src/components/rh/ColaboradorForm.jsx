import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ColaboradorForm({ colaborador, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(colaborador || {
    nome_completo: "",
    cpf: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    data_admissao: "",
    cargo: "",
    departamento: "Administrativo",
    salario: "",
    tipo_contrato: "CLT",
    status: "Ativo",
    endereco: "",
    banco: "",
    agencia: "",
    conta: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      salario: formData.salario ? parseFloat(formData.salario) : 0
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nome_completo">Nome Completo *</Label>
          <Input
            id="nome_completo"
            value={formData.nome_completo}
            onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="data_nascimento">Data de Nascimento</Label>
          <Input
            id="data_nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="cargo">Cargo *</Label>
          <Input
            id="cargo"
            value={formData.cargo}
            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="departamento">Departamento *</Label>
          <Select
            value={formData.departamento}
            onValueChange={(value) => setFormData({ ...formData, departamento: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrativo">Administrativo</SelectItem>
              <SelectItem value="Comercial">Comercial</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
              <SelectItem value="RH">RH</SelectItem>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="TI">TI</SelectItem>
              <SelectItem value="Logística">Logística</SelectItem>
              <SelectItem value="Compras">Compras</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="data_admissao">Data de Admissão *</Label>
          <Input
            id="data_admissao"
            type="date"
            value={formData.data_admissao}
            onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="salario">Salário</Label>
          <Input
            id="salario"
            type="number"
            step="0.01"
            value={formData.salario}
            onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
          <Select
            value={formData.tipo_contrato}
            onValueChange={(value) => setFormData({ ...formData, tipo_contrato: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="Estágio">Estágio</SelectItem>
              <SelectItem value="Temporário">Temporário</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="Férias">Férias</SelectItem>
              <SelectItem value="Afastado">Afastado</SelectItem>
              <SelectItem value="Desligado">Desligado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="banco">Banco</Label>
          <Input
            id="banco"
            value={formData.banco}
            onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="agencia">Agência</Label>
          <Input
            id="agencia"
            value={formData.agencia}
            onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="conta">Conta</Label>
          <Input
            id="conta"
            value={formData.conta}
            onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700">
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}