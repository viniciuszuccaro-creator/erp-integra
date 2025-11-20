import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ContaBancariaEmpresaForm({ conta, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(conta || {
    banco_id: '',
    agencia: '',
    numero_conta: '',
    tipo_conta: 'Corrente',
    finalidade: 'Operacional',
    permite_recebimento_boleto: false,
    permite_recebimento_pix: false,
    chave_pix: '',
    conta_padrao: false,
    ativo: true,
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos-lookup'],
    queryFn: () => base44.entities.Banco.list()
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Banco *</Label>
        <Select value={formData.banco_id} onValueChange={(val) => setFormData({...formData, banco_id: val})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o banco" />
          </SelectTrigger>
          <SelectContent>
            {bancos.map(b => (
              <SelectItem key={b.id} value={b.id}>
                {b.codigo_banco} - {b.nome_banco}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Agência *</Label>
          <Input
            value={formData.agencia}
            onChange={(e) => setFormData({...formData, agencia: e.target.value})}
            required
          />
        </div>
        <div>
          <Label>Dígito Agência</Label>
          <Input
            value={formData.agencia_digito || ''}
            onChange={(e) => setFormData({...formData, agencia_digito: e.target.value})}
            maxLength={1}
          />
        </div>
        <div>
          <Label>Número Conta *</Label>
          <Input
            value={formData.numero_conta}
            onChange={(e) => setFormData({...formData, numero_conta: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Conta</Label>
          <Select value={formData.tipo_conta} onValueChange={(val) => setFormData({...formData, tipo_conta: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
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
          <Select value={formData.finalidade} onValueChange={(val) => setFormData({...formData, finalidade: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="Folha">Folha de Pagamento</SelectItem>
              <SelectItem value="Tributos">Tributos</SelectItem>
              <SelectItem value="Investimento">Investimento</SelectItem>
              <SelectItem value="Cobrança">Cobrança</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label>Permite Recebimento Boleto</Label>
          <Switch
            checked={formData.permite_recebimento_boleto}
            onCheckedChange={(val) => setFormData({...formData, permite_recebimento_boleto: val})}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Permite Recebimento PIX</Label>
          <Switch
            checked={formData.permite_recebimento_pix}
            onCheckedChange={(val) => setFormData({...formData, permite_recebimento_pix: val})}
          />
        </div>
      </div>

      {formData.permite_recebimento_pix && (
        <div>
          <Label>Chave PIX</Label>
          <Input
            value={formData.chave_pix}
            onChange={(e) => setFormData({...formData, chave_pix: e.target.value})}
            placeholder="CPF, CNPJ, E-mail, Telefone ou Chave Aleatória"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label>Conta Padrão da Empresa</Label>
          <Switch
            checked={formData.conta_padrao}
            onCheckedChange={(val) => setFormData({...formData, conta_padrao: val})}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Ativo</Label>
          <Switch
            checked={formData.ativo}
            onCheckedChange={(val) => setFormData({...formData, ativo: val})}
          />
        </div>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Landmark className="w-4 h-4 mr-2" />}
        {conta ? 'Atualizar Conta Bancária' : 'Criar Conta Bancária'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <div className="flex-1 overflow-auto p-6">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}