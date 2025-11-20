import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Loader2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ChatbotIntentForm({ intent, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(intent || {
    nome_intent: '',
    descricao: '',
    frases_treinamento: [],
    origem_dados: '',
    exige_autenticacao: false,
    canais_permitidos: ['Site', 'WhatsApp'],
    resposta_template: '',
    fluxo_fallback: 'Chamar Humano',
    prioridade: 100,
    taxa_confianca_minima: 0.7,
    ativo: true,
    observacoes: ''
  });
  const [novaFrase, setNovaFrase] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    await onSubmit(formData);
    setSalvando(false);
  };

  const adicionarFrase = () => {
    if (novaFrase.trim()) {
      setFormData({
        ...formData,
        frases_treinamento: [...formData.frases_treinamento, novaFrase.trim()]
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

  const toggleCanal = (canal) => {
    const canais = formData.canais_permitidos || [];
    if (canais.includes(canal)) {
      setFormData({...formData, canais_permitidos: canais.filter(c => c !== canal)});
    } else {
      setFormData({...formData, canais_permitidos: [...canais, canal]});
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Intent *</Label>
        <Input
          value={formData.nome_intent}
          onChange={(e) => setFormData({...formData, nome_intent: e.target.value})}
          placeholder="Ex: status_pedido, 2via_boleto"
          required
        />
      </div>

      <div>
        <Label>Descrição *</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
          required
        />
      </div>

      <div>
        <Label>Frases de Treinamento</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={novaFrase}
            onChange={(e) => setNovaFrase(e.target.value)}
            placeholder="Digite uma frase exemplo..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarFrase())}
          />
          <Button type="button" size="sm" onClick={adicionarFrase}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {formData.frases_treinamento.map((frase, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-sm flex-1">{frase}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removerFrase(idx)}>
                <Trash2 className="w-3 h-3 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Canais Permitidos</Label>
        <div className="flex gap-2 flex-wrap">
          {['Site', 'WhatsApp', 'Portal', 'App', 'Chatbot Widget'].map(canal => (
            <Badge
              key={canal}
              className={`cursor-pointer ${
                formData.canais_permitidos?.includes(canal) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-700'
              }`}
              onClick={() => toggleCanal(canal)}
            >
              {canal}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Template de Resposta</Label>
        <Textarea
          value={formData.resposta_template}
          onChange={(e) => setFormData({...formData, resposta_template: e.target.value})}
          rows={3}
          placeholder="Use {variavel} para substituições dinâmicas"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fluxo Fallback</Label>
          <Select value={formData.fluxo_fallback} onValueChange={(val) => setFormData({...formData, fluxo_fallback: val})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Chamar Humano">Chamar Humano</SelectItem>
              <SelectItem value="Registrar Chamado">Registrar Chamado</SelectItem>
              <SelectItem value="Redirecionar FAQ">Redirecionar FAQ</SelectItem>
              <SelectItem value="Finalizar">Finalizar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Taxa Confiança Mínima</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={formData.taxa_confianca_minima}
            onChange={(e) => setFormData({...formData, taxa_confianca_minima: parseFloat(e.target.value) || 0.7})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Exige Autenticação</Label>
        <Switch
          checked={formData.exige_autenticacao}
          onCheckedChange={(val) => setFormData({...formData, exige_autenticacao: val})}
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
        {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
        {intent ? 'Atualizar Intent' : 'Criar Intent'}
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