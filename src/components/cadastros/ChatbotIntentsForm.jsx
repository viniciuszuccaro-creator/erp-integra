import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageCircle, Lock } from "lucide-react";

export default function ChatbotIntentsForm({ intent, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(intent || {
    nome_intent: '',
    descricao: '',
    palavras_chave: [],
    entidade_vinculada: 'Nenhuma',
    requer_autenticacao: false,
    resposta_padrao: '',
    ativo: true
  });

  const [novaPalavra, setNovaPalavra] = useState('');

  const adicionarPalavraChave = () => {
    if (!novaPalavra.trim()) return;
    setFormData({
      ...formData,
      palavras_chave: [...formData.palavras_chave, novaPalavra.toLowerCase()]
    });
    setNovaPalavra('');
  };

  const removerPalavra = (idx) => {
    setFormData({
      ...formData,
      palavras_chave: formData.palavras_chave.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_intent || !formData.resposta_padrao) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Intent *</Label>
        <Input
          value={formData.nome_intent}
          onChange={(e) => setFormData({...formData, nome_intent: e.target.value})}
          placeholder="Ex: 2_via_boleto, rastrear_entrega"
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="O que essa intent faz?"
          rows={2}
        />
      </div>

      <div>
        <Label>Palavras-Chave de Detecção</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={novaPalavra}
            onChange={(e) => setNovaPalavra(e.target.value)}
            placeholder="Ex: boleto, 2 via, segunda via"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarPalavraChave())}
          />
          <Button type="button" size="sm" onClick={adicionarPalavraChave}>
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.palavras_chave.map((palavra, idx) => (
            <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => removerPalavra(idx)}>
              {palavra} ×
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label>Entidade Vinculada (Dados do ERP)</Label>
        <Select value={formData.entidade_vinculada} onValueChange={(v) => setFormData({...formData, entidade_vinculada: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nenhuma">Nenhuma</SelectItem>
            <SelectItem value="ContaReceber">ContaReceber (Boletos)</SelectItem>
            <SelectItem value="Pedido">Pedido (Status)</SelectItem>
            <SelectItem value="Entrega">Entrega (Rastreamento)</SelectItem>
            <SelectItem value="Cliente">Cliente (Dados)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Requer Autenticação (CPF/CNPJ)</Label>
          <p className="text-xs text-slate-500">Cliente precisa se identificar</p>
        </div>
        <Switch
          checked={formData.requer_autenticacao}
          onCheckedChange={(v) => setFormData({...formData, requer_autenticacao: v})}
        />
      </div>

      <div>
        <Label>Resposta Padrão *</Label>
        <Textarea
          value={formData.resposta_padrao}
          onChange={(e) => setFormData({...formData, resposta_padrao: e.target.value})}
          placeholder="Resposta que o bot vai dar. Use {{variáveis}} para dados dinâmicos."
          rows={4}
        />
        <p className="text-xs text-slate-500 mt-1">
          Variáveis: {'{{cliente_nome}}, {{numero_pedido}}, {{valor_total}}'}
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {intent ? 'Atualizar Intent' : 'Criar Intent'}
        </Button>
      </div>
    </form>
  );
}