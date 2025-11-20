import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2 } from 'lucide-react';

export default function CondicaoComercialFormCompleto({ condicao, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(condicao || {
    nome_condicao: '',
    descricao: '',
    tipo_condicao: 'Pagamento',
    prazo_pagamento_dias: 0,
    forma_pagamento: 'À Vista',
    numero_parcelas: 1,
    intervalo_parcelas_dias: 30,
    desconto_percentual: 0,
    acrescimo_percentual: 0,
    tipo_frete: 'CIF',
    ativo: true,
    observacoes: ''
  });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Condição *</Label>
        <Input
          value={formData.nome_condicao}
          onChange={(e) => setFormData({...formData, nome_condicao: e.target.value})}
          placeholder="Ex: Pagamento 30 dias"
          required
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Condição</Label>
          <Select value={formData.tipo_condicao} onValueChange={(val) => setFormData({...formData, tipo_condicao: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pagamento">Pagamento</SelectItem>
              <SelectItem value="Desconto">Desconto</SelectItem>
              <SelectItem value="Frete">Frete</SelectItem>
              <SelectItem value="Prazo Entrega">Prazo Entrega</SelectItem>
              <SelectItem value="Comissão">Comissão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Forma de Pagamento</Label>
          <Select value={formData.forma_pagamento} onValueChange={(val) => setFormData({...formData, forma_pagamento: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="À Vista">À Vista</SelectItem>
              <SelectItem value="Parcelado">Parcelado</SelectItem>
              <SelectItem value="Boleto">Boleto</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
              <SelectItem value="Cartão">Cartão</SelectItem>
              <SelectItem value="Depósito">Depósito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Prazo (dias)</Label>
          <Input
            type="number"
            value={formData.prazo_pagamento_dias}
            onChange={(e) => setFormData({...formData, prazo_pagamento_dias: parseInt(e.target.value) || 0})}
          />
        </div>
        <div>
          <Label>Nº Parcelas</Label>
          <Input
            type="number"
            value={formData.numero_parcelas}
            onChange={(e) => setFormData({...formData, numero_parcelas: parseInt(e.target.value) || 1})}
          />
        </div>
        <div>
          <Label>Intervalo Parcelas</Label>
          <Input
            type="number"
            value={formData.intervalo_parcelas_dias}
            onChange={(e) => setFormData({...formData, intervalo_parcelas_dias: parseInt(e.target.value) || 30})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Desconto (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.desconto_percentual}
            onChange={(e) => setFormData({...formData, desconto_percentual: parseFloat(e.target.value) || 0})}
          />
        </div>
        <div>
          <Label>Acréscimo (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.acrescimo_percentual}
            onChange={(e) => setFormData({...formData, acrescimo_percentual: parseFloat(e.target.value) || 0})}
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Frete</Label>
        <Select value={formData.tipo_frete} onValueChange={(val) => setFormData({...formData, tipo_frete: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CIF">CIF (pago pelo remetente)</SelectItem>
            <SelectItem value="FOB">FOB (pago pelo destinatário)</SelectItem>
            <SelectItem value="Retira">Retira (sem frete)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({...formData, ativo: val})}
        />
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
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
        {condicao ? 'Atualizar Condição' : 'Criar Condição'}
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