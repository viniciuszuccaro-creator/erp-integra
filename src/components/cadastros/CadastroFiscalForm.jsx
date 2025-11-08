import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CadastroFiscalForm({ cadastroFiscal, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(cadastroFiscal || {
    tipo_cadastro: 'NCM',
    codigo: '',
    descricao: '',
    aliquota_padrao: 0,
    observacoes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tipo_cadastro || !formData.codigo) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tipo de Cadastro *</Label>
        <Select value={formData.tipo_cadastro} onValueChange={(v) => setFormData({...formData, tipo_cadastro: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NCM">NCM - Nomenclatura Comum Mercosul</SelectItem>
            <SelectItem value="CFOP">CFOP - Código Fiscal de Operações</SelectItem>
            <SelectItem value="CEST">CEST - Código Especificador ST</SelectItem>
            <SelectItem value="CST">CST - Código de Situação Tributária</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Código *</Label>
        <Input
          value={formData.codigo}
          onChange={(e) => setFormData({...formData, codigo: e.target.value})}
          placeholder={
            formData.tipo_cadastro === 'NCM' ? 'Ex: 7213.10.00' :
            formData.tipo_cadastro === 'CFOP' ? 'Ex: 5102' :
            formData.tipo_cadastro === 'CEST' ? 'Ex: 01.001.00' :
            'Ex: 00'
          }
        />
      </div>

      <div>
        <Label>Descrição *</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
          placeholder="Descrição completa"
        />
      </div>

      {formData.tipo_cadastro === 'NCM' && (
        <div>
          <Label>Alíquota Padrão IPI (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.aliquota_padrao}
            onChange={(e) => setFormData({...formData, aliquota_padrao: parseFloat(e.target.value)})}
          />
        </div>
      )}

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={2}
        />
      </div>

      <Alert className="border-purple-200 bg-purple-50">
        <FileText className="w-4 h-4" />
        <AlertDescription className="text-sm">
          🤖 IA DIFAL atualiza alíquotas automaticamente via API Sefaz
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {cadastroFiscal ? 'Atualizar' : 'Criar Cadastro Fiscal'}
        </Button>
      </div>
    </form>
  );
}