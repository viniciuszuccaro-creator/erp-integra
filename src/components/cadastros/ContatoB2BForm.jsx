import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ContatoB2BForm({ contato, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(contato || {
    cliente_id: '',
    nome_contato: '',
    cargo: '',
    departamento: 'Compras',
    email: '',
    telefone: '',
    whatsapp: '',
    preferencias_comunicacao: {
      receber_transacionais: true,
      receber_marketing: false,
      canal_preferencial: 'Email'
    },
    principal: false,
    ativo: true
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.nome_contato || !formData.email) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Cliente *</Label>
        <Select value={formData.cliente_id} onValueChange={(v) => setFormData({...formData, cliente_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome do Contato *</Label>
          <Input
            value={formData.nome_contato}
            onChange={(e) => setFormData({...formData, nome_contato: e.target.value})}
            placeholder="Nome completo"
          />
        </div>

        <div>
          <Label>Cargo</Label>
          <Input
            value={formData.cargo}
            onChange={(e) => setFormData({...formData, cargo: e.target.value})}
            placeholder="Ex: Gerente de Compras"
          />
        </div>
      </div>

      <div>
        <Label>Departamento</Label>
        <Select value={formData.departamento} onValueChange={(v) => setFormData({...formData, departamento: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Compras">Compras</SelectItem>
            <SelectItem value="Financeiro">Financeiro</SelectItem>
            <SelectItem value="Obras">Obras</SelectItem>
            <SelectItem value="Engenharia">Engenharia</SelectItem>
            <SelectItem value="Diretoria">Diretoria</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="contato@empresa.com"
          />
        </div>

        <div>
          <Label>WhatsApp</Label>
          <Input
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="space-y-3 p-3 bg-slate-50 rounded">
        <Label className="font-semibold">Preferências de Comunicação (LGPD)</Label>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Receber Transacionais</p>
            <p className="text-xs text-slate-500">NF-e, Boletos, Rastreamento</p>
          </div>
          <Switch
            checked={formData.preferencias_comunicacao?.receber_transacionais}
            onCheckedChange={(v) => setFormData({
              ...formData,
              preferencias_comunicacao: {
                ...formData.preferencias_comunicacao,
                receber_transacionais: v
              }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Receber Marketing</p>
            <p className="text-xs text-slate-500">Promoções, Newsletters</p>
          </div>
          <Switch
            checked={formData.preferencias_comunicacao?.receber_marketing}
            onCheckedChange={(v) => setFormData({
              ...formData,
              preferencias_comunicacao: {
                ...formData.preferencias_comunicacao,
                receber_marketing: v
              }
            })}
          />
        </div>

        <div>
          <Label>Canal Preferencial</Label>
          <Select 
            value={formData.preferencias_comunicacao?.canal_preferencial} 
            onValueChange={(v) => setFormData({
              ...formData,
              preferencias_comunicacao: {
                ...formData.preferencias_comunicacao,
                canal_preferencial: v
              }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Telefone">Telefone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded border border-yellow-200">
        <Label>Contato Principal</Label>
        <Switch
          checked={formData.principal}
          onCheckedChange={(v) => setFormData({...formData, principal: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {contato ? 'Atualizar' : 'Criar Contato'}
        </Button>
      </div>
    </form>
  );
}