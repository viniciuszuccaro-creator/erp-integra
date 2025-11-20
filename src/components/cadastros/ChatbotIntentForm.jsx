import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function ChatbotIntentForm({ intent, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(intent || {
    nome_intent: '',
    descricao: '',
    frases_treinamento: [],
    origem_dados: '',
    exige_autenticacao: false,
    resposta_template: '',
    ativo: true
  });

  const [novaFrase, setNovaFrase] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const adicionarFrase = () => {
    if (novaFrase.trim()) {
      setFormData({
        ...formData,
        frases_treinamento: [...formData.frases_treinamento, novaFrase]
      });
      setNovaFrase('');
    }
  };

  const removerFrase = (index) => {
    setFormData({
      ...formData,
      frases_treinamento: formData.frases_treinamento.filter((_, i) => i !== index)
    });
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome da Intent *</Label>
          <Input
            value={formData.nome_intent}
            onChange={(e) => setFormData({ ...formData, nome_intent: e.target.value })}
            placeholder="2_via_boleto, status_pedido..."
            required
          />
        </div>
        <div>
          <Label>Origem dos Dados</Label>
          <Input
            value={formData.origem_dados}
            onChange={(e) => setFormData({ ...formData, origem_dados: e.target.value })}
            placeholder="ContaReceber, Pedido, Cliente..."
          />
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label>Frases de Treinamento</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={novaFrase}
            onChange={(e) => setNovaFrase(e.target.value)}
            placeholder="Adicionar frase de exemplo..."
          />
          <Button type="button" onClick={adicionarFrase}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {formData.frases_treinamento.map((frase, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="flex-1 text-sm">{frase}</span>
              <Button type="button" size="sm" variant="ghost" onClick={() => removerFrase(idx)}>
                <Trash2 className="w-3 h-3 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Template de Resposta</Label>
        <Textarea
          value={formData.resposta_template}
          onChange={(e) => setFormData({ ...formData, resposta_template: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Exige Autenticação</Label>
          <Switch
            checked={formData.exige_autenticacao}
            onCheckedChange={(v) => setFormData({ ...formData, exige_autenticacao: v })}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
          <Label className="font-semibold">Intent Ativa</Label>
          <Switch
            checked={formData.ativo}
            onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
        {intent ? 'Atualizar' : 'Criar Intent'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {intent ? 'Editar Intent' : 'Nova Intent de Chatbot'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}