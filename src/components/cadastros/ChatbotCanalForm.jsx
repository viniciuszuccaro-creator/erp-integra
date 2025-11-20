import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';

export default function ChatbotCanalForm({ canal, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(canal || {
    nome_canal: '',
    tipo_canal: 'WhatsApp',
    transfere_para_humano: true,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome do Canal *</Label>
          <Input
            value={formData.nome_canal}
            onChange={(e) => setFormData({ ...formData, nome_canal: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Tipo de Canal *</Label>
          <Select value={formData.tipo_canal} onValueChange={(v) => setFormData({ ...formData, tipo_canal: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Site Widget">Site Widget</SelectItem>
              <SelectItem value="Portal">Portal</SelectItem>
              <SelectItem value="Telegram">Telegram</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.tipo_canal === 'WhatsApp' && (
        <div>
          <Label>Número do WhatsApp</Label>
          <Input
            value={formData.whatsapp_numero}
            onChange={(e) => setFormData({ ...formData, whatsapp_numero: e.target.value })}
            placeholder="+55 11 99999-9999"
          />
        </div>
      )}

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Transferir para Humano</Label>
          <Switch
            checked={formData.transfere_para_humano}
            onCheckedChange={(v) => setFormData({ ...formData, transfere_para_humano: v })}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
          <Label className="font-semibold">Canal Ativo</Label>
          <Switch
            checked={formData.ativo}
            onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
        {canal ? 'Atualizar' : 'Criar Canal'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-green-50 to-green-100">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {canal ? 'Editar Canal' : 'Novo Canal de Chatbot'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}