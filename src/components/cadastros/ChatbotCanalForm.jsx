import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { MessageCircle } from 'lucide-react';

export default function ChatbotCanalForm({ canal, onSubmit, windowMode }) {
  const [formData, setFormData] = useState(canal || {
    nome_canal: '',
    tipo_canal: 'Site Widget',
    configuracoes_canal: {
      mensagem_boas_vindas: '',
      horario_atendimento_inicio: '08:00',
      horario_atendimento_fim: '18:00',
      timeout_inatividade_minutos: 15,
      permite_anexos: true
    },
    transfere_para_humano: true,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label>Tipo *</Label>
          <Select value={formData.tipo_canal} onValueChange={(val) => setFormData({ ...formData, tipo_canal: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Site Widget">Site Widget</SelectItem>
              <SelectItem value="Portal">Portal</SelectItem>
              <SelectItem value="App Mobile">App Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.tipo_canal === 'WhatsApp' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Número WhatsApp</Label>
            <Input
              value={formData.whatsapp_numero}
              onChange={(e) => setFormData({ ...formData, whatsapp_numero: e.target.value })}
              placeholder="+55 11 98765-4321"
            />
          </div>
          <div>
            <Label>Token WhatsApp API</Label>
            <Input
              value={formData.whatsapp_token}
              onChange={(e) => setFormData({ ...formData, whatsapp_token: e.target.value })}
              type="password"
            />
          </div>
        </div>
      )}

      <div>
        <Label>Mensagem de Boas-Vindas</Label>
        <Textarea
          value={formData.configuracoes_canal?.mensagem_boas_vindas}
          onChange={(e) => setFormData({
            ...formData,
            configuracoes_canal: { ...formData.configuracoes_canal, mensagem_boas_vindas: e.target.value }
          })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Horário Início</Label>
          <Input
            type="time"
            value={formData.configuracoes_canal?.horario_atendimento_inicio}
            onChange={(e) => setFormData({
              ...formData,
              configuracoes_canal: { ...formData.configuracoes_canal, horario_atendimento_inicio: e.target.value }
            })}
          />
        </div>
        <div>
          <Label>Horário Fim</Label>
          <Input
            type="time"
            value={formData.configuracoes_canal?.horario_atendimento_fim}
            onChange={(e) => setFormData({
              ...formData,
              configuracoes_canal: { ...formData.configuracoes_canal, horario_atendimento_fim: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Transferir para Humano</Label>
        <Switch
          checked={formData.transfere_para_humano}
          onCheckedChange={(val) => setFormData({ ...formData, transfere_para_humano: val })}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {canal ? 'Atualizar' : 'Criar Canal'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="border-b p-4 bg-gradient-to-r from-green-50 to-emerald-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            {canal ? 'Editar Canal Chatbot' : 'Novo Canal Chatbot'}
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