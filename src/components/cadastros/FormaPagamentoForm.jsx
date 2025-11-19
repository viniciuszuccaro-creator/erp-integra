import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, CreditCard } from "lucide-react";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function FormaPagamentoForm({ forma, onSubmit, isSubmitting, windowMode = false }) {
  const [formData, setFormData] = useState(forma || {
    codigo: '',
    descricao: '',
    tipo: 'Dinheiro',
    ativa: true,
    aceita_desconto: true,
    percentual_desconto_padrao: 0,
    aplicar_acrescimo: false,
    percentual_acrescimo_padrao: 0,
    prazo_compensacao_dias: 0,
    gerar_cobranca_online: false,
    permite_parcelamento: false,
    maximo_parcelas: 1,
    intervalo_parcelas_dias: 30
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.descricao || !formData.tipo) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Descrição *</Label>
          <Input
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Ex: PIX, Boleto 30 dias"
          />
        </div>

        <div>
          <Label>Código (opcional)</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="PIX-01"
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Pagamento *</Label>
        <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="Boleto">Boleto</SelectItem>
            <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
            <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
            <SelectItem value="Transferência">Transferência</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Prazo Compensação (dias)</Label>
          <Input
            type="number"
            value={formData.prazo_compensacao_dias}
            onChange={(e) => setFormData({...formData, prazo_compensacao_dias: parseInt(e.target.value) || 0})}
            placeholder="0"
          />
        </div>

        <div>
          <Label>Desconto Padrão (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.percentual_desconto_padrao}
            onChange={(e) => setFormData({...formData, percentual_desconto_padrao: parseFloat(e.target.value) || 0})}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Permite Parcelamento</Label>
          <p className="text-xs text-slate-500">Habilita parcelamento nesta forma</p>
        </div>
        <Switch
          checked={formData.permite_parcelamento}
          onCheckedChange={(v) => setFormData({...formData, permite_parcelamento: v})}
        />
      </div>

      {formData.permite_parcelamento && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border">
          <div>
            <Label>Máximo de Parcelas</Label>
            <Input
              type="number"
              value={formData.maximo_parcelas}
              onChange={(e) => setFormData({...formData, maximo_parcelas: parseInt(e.target.value) || 1})}
              placeholder="12"
            />
          </div>

          <div>
            <Label>Intervalo (dias)</Label>
            <Input
              type="number"
              value={formData.intervalo_parcelas_dias}
              onChange={(e) => setFormData({...formData, intervalo_parcelas_dias: parseInt(e.target.value) || 30})}
              placeholder="30"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Forma Ativa</Label>
        <Switch
          checked={formData.ativa}
          onCheckedChange={(v) => setFormData({...formData, ativa: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {forma ? 'Atualizar' : 'Criar Forma de Pagamento'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            {forma ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}