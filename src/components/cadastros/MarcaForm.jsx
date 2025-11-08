import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Award } from "lucide-react";

export default function MarcaForm({ marca, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(marca || {
    nome_marca: '',
    descricao: '',
    cnpj: '',
    pais_origem: 'Brasil',
    site: '',
    logo_url: '',
    categoria: 'Aço',
    certificacoes: [],
    ativo: true
  });

  const [novaCertificacao, setNovaCertificacao] = useState('');

  const adicionarCertificacao = () => {
    if (novaCertificacao && !formData.certificacoes.includes(novaCertificacao)) {
      setFormData({
        ...formData,
        certificacoes: [...formData.certificacoes, novaCertificacao]
      });
      setNovaCertificacao('');
    }
  };

  const removerCertificacao = (cert) => {
    setFormData({
      ...formData,
      certificacoes: formData.certificacoes.filter(c => c !== cert)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_marca) {
      alert('Preencha o nome da marca');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Marca *</Label>
        <Input
          value={formData.nome_marca}
          onChange={(e) => setFormData({...formData, nome_marca: e.target.value})}
          placeholder="Ex: Gerdau, ArcelorMittal, Belgo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNPJ</Label>
          <Input
            value={formData.cnpj}
            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
          />
        </div>

        <div>
          <Label>País de Origem</Label>
          <Input
            value={formData.pais_origem}
            onChange={(e) => setFormData({...formData, pais_origem: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Categoria</Label>
        <Select value={formData.categoria} onValueChange={(v) => setFormData({...formData, categoria: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Aço">Aço</SelectItem>
            <SelectItem value="Ferramentas">Ferramentas</SelectItem>
            <SelectItem value="EPIs">EPIs</SelectItem>
            <SelectItem value="Elétricos">Elétricos</SelectItem>
            <SelectItem value="Hidráulica">Hidráulica</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Site</Label>
        <Input
          value={formData.site}
          onChange={(e) => setFormData({...formData, site: e.target.value})}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label>URL da Logo</Label>
        <Input
          value={formData.logo_url}
          onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
          placeholder="https://..."
        />
      </div>

      <div>
        <Label>Certificações (ISO, INMETRO, etc)</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={novaCertificacao}
            onChange={(e) => setNovaCertificacao(e.target.value)}
            placeholder="Ex: ISO 9001, INMETRO"
          />
          <Button type="button" size="sm" onClick={adicionarCertificacao}>
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.certificacoes.map((cert, idx) => (
            <div key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
              {cert}
              <button type="button" onClick={() => removerCertificacao(cert)} className="hover:text-green-900">
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {marca ? 'Atualizar' : 'Criar Marca'}
        </Button>
      </div>
    </form>
  );
}