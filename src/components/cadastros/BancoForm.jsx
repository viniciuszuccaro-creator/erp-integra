import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Landmark } from "lucide-react";

export default function BancoForm({ banco, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(banco || {
    nome_banco: '',
    codigo_banco: '',
    agencia: '',
    agencia_digito: '',
    conta: '',
    conta_digito: '',
    tipo_conta: 'Corrente',
    titular: '',
    cpf_cnpj_titular: '',
    saldo_inicial: 0,
    chave_pix: '',
    tipo_chave_pix: 'CNPJ',
    principal: false,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_banco || !formData.agencia || !formData.conta) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome do Banco *</Label>
          <Input
            value={formData.nome_banco}
            onChange={(e) => setFormData({...formData, nome_banco: e.target.value})}
            placeholder="Ex: Banco do Brasil"
          />
        </div>

        <div>
          <Label>Código do Banco</Label>
          <Input
            value={formData.codigo_banco}
            onChange={(e) => setFormData({...formData, codigo_banco: e.target.value})}
            placeholder="Ex: 001, 033, 237"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Agência *</Label>
          <Input
            value={formData.agencia}
            onChange={(e) => setFormData({...formData, agencia: e.target.value})}
            placeholder="0000"
          />
        </div>

        <div>
          <Label>Dígito</Label>
          <Input
            value={formData.agencia_digito}
            onChange={(e) => setFormData({...formData, agencia_digito: e.target.value})}
            placeholder="0"
            maxLength={1}
          />
        </div>

        <div>
          <Label>Tipo de Conta</Label>
          <Select value={formData.tipo_conta} onValueChange={(v) => setFormData({...formData, tipo_conta: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Corrente">Corrente</SelectItem>
              <SelectItem value="Poupança">Poupança</SelectItem>
              <SelectItem value="Investimento">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Conta *</Label>
          <Input
            value={formData.conta}
            onChange={(e) => setFormData({...formData, conta: e.target.value})}
            placeholder="00000000"
          />
        </div>

        <div>
          <Label>Dígito</Label>
          <Input
            value={formData.conta_digito}
            onChange={(e) => setFormData({...formData, conta_digito: e.target.value})}
            placeholder="0"
            maxLength={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Chave PIX</Label>
          <Input
            value={formData.chave_pix}
            onChange={(e) => setFormData({...formData, chave_pix: e.target.value})}
            placeholder="Chave PIX"
          />
        </div>

        <div>
          <Label>Tipo Chave PIX</Label>
          <Select value={formData.tipo_chave_pix} onValueChange={(v) => setFormData({...formData, tipo_chave_pix: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CNPJ">CNPJ</SelectItem>
              <SelectItem value="CPF">CPF</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Telefone">Telefone</SelectItem>
              <SelectItem value="Aleatória">Aleatória</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Conta Principal</Label>
          <p className="text-xs text-slate-500">Usar como padrão nas transações</p>
        </div>
        <Switch
          checked={formData.principal}
          onCheckedChange={(v) => setFormData({...formData, principal: v})}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Conta Ativa</Label>
          <p className="text-xs text-slate-500">Habilitar para uso</p>
        </div>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {banco ? 'Atualizar Conta' : 'Criar Conta'}
        </Button>
      </div>
    </form>
  );
}