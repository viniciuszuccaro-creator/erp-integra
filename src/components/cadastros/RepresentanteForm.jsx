import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCheck } from "lucide-react";

export default function RepresentanteForm({ representante, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(representante || {
    nome: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    whatsapp: '',
    regioes_atendimento: [],
    comissao_percentual: 0,
    tipo_contrato: 'Autônomo',
    ativo: true
  });

  const [novaRegiao, setNovaRegiao] = useState('');

  const adicionarRegiao = () => {
    if (novaRegiao && !formData.regioes_atendimento.includes(novaRegiao)) {
      setFormData({
        ...formData,
        regioes_atendimento: [...formData.regioes_atendimento, novaRegiao]
      });
      setNovaRegiao('');
    }
  };

  const removerRegiao = (regiao) => {
    setFormData({
      ...formData,
      regioes_atendimento: formData.regioes_atendimento.filter(r => r !== regiao)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      alert('Preencha o nome');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Representante *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Nome completo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CPF/CNPJ</Label>
          <Input
            value={formData.cpf_cnpj}
            onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
          />
        </div>

        <div>
          <Label>Tipo de Contrato</Label>
          <Select value={formData.tipo_contrato} onValueChange={(v) => setFormData({...formData, tipo_contrato: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="Autônomo">Autônomo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <Label>WhatsApp</Label>
          <Input
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Comissão (%)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.comissao_percentual}
          onChange={(e) => setFormData({...formData, comissao_percentual: parseFloat(e.target.value)})}
        />
      </div>

      <div>
        <Label>Regiões de Atendimento</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={novaRegiao}
            onChange={(e) => setNovaRegiao(e.target.value)}
            placeholder="Ex: São Paulo, Rio de Janeiro"
          />
          <Button type="button" size="sm" onClick={adicionarRegiao}>
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.regioes_atendimento.map((regiao, idx) => (
            <div key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
              {regiao}
              <button type="button" onClick={() => removerRegiao(regiao)} className="hover:text-blue-900">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {representante ? 'Atualizar' : 'Criar Representante'}
        </Button>
      </div>
    </form>
  );
}