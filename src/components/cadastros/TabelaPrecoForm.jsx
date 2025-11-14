import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";

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

  useEffect(() => {
    if (tabela) {
      setFormData(tabela);
    }
  }, [tabela]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('✅ TabelaPrecoForm - Submetendo:', formData);
    
    if (!formData.nome || !formData.tipo) {
      alert('❌ Preencha os campos obrigatórios: Nome e Tipo');
      return;
    }

    // Limpar campos vazios antes de enviar
    const dadosLimpos = { ...formData };
    if (!dadosLimpos.data_fim) delete dadosLimpos.data_fim;
    if (!dadosLimpos.descricao) delete dadosLimpos.descricao;
    if (!dadosLimpos.observacoes) delete dadosLimpos.observacoes;

    onSubmit(dadosLimpos);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert className="border-green-200 bg-green-50">
        <Sparkles className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-sm text-green-900">
          ✅ A <strong>empresa_id</strong> será injetada automaticamente ao salvar
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-semibold">Nome da Tabela *</Label>
          <Input
            value={formData.nome || ''}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            placeholder="Ex: Tabela Atacado São Paulo"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Descrição</Label>
          <Input
            value={formData.descricao || ''}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Descrição interna (opcional)"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold">Tipo de Tabela *</Label>
          <Select 
            value={formData.tipo} 
            onValueChange={(v) => setFormData({...formData, tipo: v})}
          >
            <SelectTrigger className="mt-1">
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
            <Label className="text-sm font-semibold">Data Início Vigência</Label>
            <Input
              type="date"
              value={formData.data_inicio || ''}
              onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold">Data Fim Vigência</Label>
            <Input
              type="date"
              value={formData.data_fim || ''}
              onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold">Observações</Label>
          <Textarea
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            rows={3}
            placeholder="Observações internas sobre esta tabela"
            className="mt-1"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
          <div>
            <Label className="text-sm font-semibold">Tabela Ativa</Label>
            <p className="text-xs text-slate-500 mt-1">
              Apenas tabelas ativas aparecem no sistema
            </p>
          </div>
          <Switch
            checked={formData.ativo}
            onCheckedChange={(v) => setFormData({...formData, ativo: v})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-green-600 hover:bg-green-700 min-w-32"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>{tabela?.id ? '✅ Atualizar' : '➕ Criar Tabela'}</>
          )}
        </Button>
      </div>
    </form>
  );
}