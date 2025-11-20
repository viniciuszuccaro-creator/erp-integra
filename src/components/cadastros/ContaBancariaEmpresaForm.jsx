import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Landmark } from 'lucide-react';

export default function ContaBancariaEmpresaForm({ conta, onSubmit, windowMode }) {
  const [formData, setFormData] = useState(conta || {
    agencia: '',
    numero_conta: '',
    tipo_conta: 'Corrente',
    finalidade: 'Operacional',
    permite_recebimento_boleto: false,
    permite_recebimento_pix: false,
    conta_padrao: false,
    ativo: true
  });

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos'],
    queryFn: () => base44.entities.Banco.list()
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.empresa_id || !formData.banco_id || !formData.agencia || !formData.numero_conta) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit?.(formData);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Empresa *</Label>
          <Select value={formData.empresa_id} onValueChange={(val) => setFormData({ ...formData, empresa_id: val })}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {empresas.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Banco *</Label>
          <Select value={formData.banco_id} onValueChange={(val) => setFormData({ ...formData, banco_id: val })}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {bancos.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.nome_banco}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Agência *</Label>
          <Input
            value={formData.agencia}
            onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Número da Conta *</Label>
          <Input
            value={formData.numero_conta}
            onChange={(e) => setFormData({ ...formData, numero_conta: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Dígito</Label>
          <Input
            value={formData.conta_digito}
            onChange={(e) => setFormData({ ...formData, conta_digito: e.target.value })}
            maxLength={1}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Conta</Label>
          <Select value={formData.tipo_conta} onValueChange={(val) => setFormData({ ...formData, tipo_conta: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Corrente">Corrente</SelectItem>
              <SelectItem value="Poupança">Poupança</SelectItem>
              <SelectItem value="Aplicação">Aplicação</SelectItem>
              <SelectItem value="Salário">Salário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Finalidade</Label>
          <Select value={formData.finalidade} onValueChange={(val) => setFormData({ ...formData, finalidade: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="Folha">Folha</SelectItem>
              <SelectItem value="Tributos">Tributos</SelectItem>
              <SelectItem value="Investimento">Investimento</SelectItem>
              <SelectItem value="Cobrança">Cobrança</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Permite Recebimento via Boleto</Label>
        <Switch
          checked={formData.permite_recebimento_boleto}
          onCheckedChange={(val) => setFormData({ ...formData, permite_recebimento_boleto: val })}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Permite Recebimento via PIX</Label>
        <Switch
          checked={formData.permite_recebimento_pix}
          onCheckedChange={(val) => setFormData({ ...formData, permite_recebimento_pix: val })}
        />
      </div>

      {formData.permite_recebimento_pix && (
        <div>
          <Label>Chave PIX</Label>
          <Input
            value={formData.chave_pix}
            onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
          />
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Conta Padrão da Empresa</Label>
        <Switch
          checked={formData.conta_padrao}
          onCheckedChange={(val) => setFormData({ ...formData, conta_padrao: val })}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {conta ? 'Atualizar' : 'Criar Conta'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Landmark className="w-6 h-6 text-green-600" />
            {conta ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {renderForm()}
        </div>
      </div>
    );
  }

  return renderForm();
}