import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";

export default function TabelaPrecoForm({ tabela, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(tabela || {
    nome: '',
    descricao: '',
    tipo: 'Padrão',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    ativo: true,
    observacoes: '',
    quantidade_produtos: 0,
    clientes_vinculados: []
  });

  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    console.log('🔍 DEBUG TabelaPrecoForm - formData:', formData);
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📝 TabelaPrecoForm SUBMIT - Dados:', formData);
    
    if (!formData.nome || !formData.tipo || !formData.data_inicio) {
      alert('❌ Preencha os campos obrigatórios: Nome, Tipo e Data Início');
      setDebugInfo({ erro: 'Campos obrigatórios faltando', formData });
      return;
    }

    setDebugInfo({ sucesso: 'Enviando para onSubmit', formData });
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {debugInfo && (
        <Alert className={debugInfo.erro ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription className="text-xs">
            <strong>DEBUG:</strong> {JSON.stringify(debugInfo, null, 2)}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label>Nome da Tabela *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => {
            const novoValor = e.target.value;
            console.log('✏️ Nome alterado:', novoValor);
            setFormData({...formData, nome: novoValor});
          }}
          placeholder="Ex: Atacado SP, Varejo Nacional"
          required
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Descrição interna"
        />
      </div>

      <div>
        <Label>Tipo de Tabela *</Label>
        <Select value={formData.tipo} onValueChange={(v) => {
          console.log('📋 Tipo alterado:', v);
          setFormData({...formData, tipo: v});
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Padrão">Padrão</SelectItem>
            <SelectItem value="Atacado">Atacado</SelectItem>
            <SelectItem value="Varejo">Varejo</SelectItem>
            <SelectItem value="Especial">Especial</SelectItem>
            <SelectItem value="Promocional">Promocional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data Início Vigência *</Label>
          <Input
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
            required
          />
        </div>

        <div>
          <Label>Data Fim Vigência</Label>
          <Input
            type="date"
            value={formData.data_fim || ''}
            onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          rows={3}
          placeholder="Observações internas sobre esta tabela"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Tabela Ativa</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => console.log('🚀 Botão CRIAR clicado! formData:', formData)}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {tabela?.id ? 'Atualizar Tabela' : 'Criar Tabela'}
        </Button>
      </div>
    </form>
  );
}