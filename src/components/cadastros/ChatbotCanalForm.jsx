import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Loader2 } from 'lucide-react';

export default function ChatbotCanalForm({ canal, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(canal || {
    nome_canal: '',
    tipo_canal: 'Site Widget',
    whatsapp_numero: '',
    configuracoes_canal: {
      mensagem_boas_vindas: 'Olá! Como posso ajudar?',
      mensagem_ausencia: 'Estamos fora do horário de atendimento.',
      horario_atendimento_inicio: '08:00',
      horario_atendimento_fim: '18:00',
      timeout_inatividade_minutos: 15,
      permite_anexos: true
    },
    transfere_para_humano: true,
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
        <Label>Nome do Canal *</Label>
        <Input
          value={formData.nome_canal}
          onChange={(e) => setFormData({...formData, nome_canal: e.target.value})}
          required
        />
      </div>

      <div>
        <Label>Tipo de Canal</Label>
        <Select value={formData.tipo_canal} onValueChange={(val) => setFormData({...formData, tipo_canal: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="WhatsApp">WhatsApp Business</SelectItem>
            <SelectItem value="Site Widget">Widget do Site</SelectItem>
            <SelectItem value="Portal">Portal do Cliente</SelectItem>
            <SelectItem value="App Mobile">App Mobile</SelectItem>
            <SelectItem value="Telegram">Telegram</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.tipo_canal === 'WhatsApp' && (
        <div>
          <Label>Número WhatsApp Business</Label>
          <Input
            value={formData.whatsapp_numero}
            onChange={(e) => setFormData({...formData, whatsapp_numero: e.target.value})}
            placeholder="+55 11 99999-9999"
          />
        </div>
      )}

      <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
        <Label className="font-semibold">Configurações do Canal</Label>
        
        <div>
          <Label className="text-xs">Mensagem de Boas-Vindas</Label>
          <Textarea
            value={formData.configuracoes_canal?.mensagem_boas_vindas || ''}
            onChange={(e) => setFormData({
              ...formData,
              configuracoes_canal: {...formData.configuracoes_canal, mensagem_boas_vindas: e.target.value}
            })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Horário Início</Label>
            <Input
              type="time"
              value={formData.configuracoes_canal?.horario_atendimento_inicio || '08:00'}
              onChange={(e) => setFormData({
                ...formData,
                configuracoes_canal: {...formData.configuracoes_canal, horario_atendimento_inicio: e.target.value}
              })}
            />
          </div>
          <div>
            <Label className="text-xs">Horário Fim</Label>
            <Input
              type="time"
              value={formData.configuracoes_canal?.horario_atendimento_fim || '18:00'}
              onChange={(e) => setFormData({
                ...formData,
                configuracoes_canal: {...formData.configuracoes_canal, horario_atendimento_fim: e.target.value}
              })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Transfere para Humano</Label>
        <Switch
          checked={formData.transfere_para_humano}
          onCheckedChange={(val) => setFormData({...formData, transfere_para_humano: val})}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(val) => setFormData({...formData, ativo: val})}
        />
      </div>

      <Button type="submit" className="w-full" disabled={salvando}>
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
        {canal ? 'Atualizar Canal' : 'Criar Canal'}
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