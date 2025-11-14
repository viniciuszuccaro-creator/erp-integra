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
  // ✅ CORREÇÃO: Verificar se tabela tem dados reais (não apenas _entityName)
  const tabelaReal = (tabela && tabela.id) ? tabela : null;

  const [formData, setFormData] = useState({
    nome: tabelaReal?.nome || '',
    descricao: tabelaReal?.descricao || '',
    tipo: tabelaReal?.tipo || 'Padrão',
    data_inicio: tabelaReal?.data_inicio || new Date().toISOString().split('T')[0],
    data_fim: tabelaReal?.data_fim || '',
    ativo: tabelaReal?.ativo !== undefined ? tabelaReal.ativo : true,
    observacoes: tabelaReal?.observacoes || '',
    quantidade_produtos: tabelaReal?.quantidade_produtos || 0,
    clientes_vinculados: tabelaReal?.clientes_vinculados || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🚀 TABELA PREÇO SUBMIT - Dados do form:', formData);
    console.log('🔍 tabela prop:', tabela);
    console.log('🔍 tabelaReal:', tabelaReal);
    
    if (!formData.nome?.trim()) {
      alert('❌ Nome é obrigatório!');
      return;
    }

    if (!formData.tipo) {
      alert('❌ Tipo é obrigatório!');
      return;
    }

    // ✅ V20.3: Preparar dados limpos (SEM empresa_id - será injetado em Cadastros.jsx)
    const dados = {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      data_inicio: formData.data_inicio,
      ativo: formData.ativo,
      quantidade_produtos: formData.quantidade_produtos || 0,
      clientes_vinculados: formData.clientes_vinculados || []
    };

    if (formData.descricao?.trim()) dados.descricao = formData.descricao.trim();
    if (formData.data_fim) dados.data_fim = formData.data_fim;
    if (formData.observacoes?.trim()) dados.observacoes = formData.observacoes.trim();

    console.log('✅ TabelaPrecoForm - Enviando para parent handleSubmit:', dados);
    
    // ✅ Chamar onSubmit DIRETAMENTE (sem try/catch)
    onSubmit(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Alert className="border-green-200 bg-green-50">
        <Sparkles className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-sm text-green-900">
          ✅ <strong>empresa_id</strong> será injetada automaticamente
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label className="font-semibold">Nome da Tabela <span className="text-red-500">*</span></Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            placeholder="Ex: Tabela Atacado Nacional"
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label className="font-semibold">Descrição</Label>
          <Input
            value={formData.descricao || ''}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Descrição opcional"
            className="mt-2"
          />
        </div>

        <div>
          <Label className="font-semibold">Tipo <span className="text-red-500">*</span></Label>
          <Select 
            value={formData.tipo} 
            onValueChange={(v) => setFormData({...formData, tipo: v})}
          >
            <SelectTrigger className="mt-2">
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
            <Label className="font-semibold">Início Vigência</Label>
            <Input
              type="date"
              value={formData.data_inicio}
              onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="font-semibold">Fim Vigência</Label>
            <Input
              type="date"
              value={formData.data_fim || ''}
              onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label className="font-semibold">Observações</Label>
          <Textarea
            value={formData.observacoes || ''}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            rows={3}
            placeholder="Observações internas"
            className="mt-2"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <Label className="font-semibold">Tabela Ativa</Label>
            <p className="text-xs text-slate-500 mt-1">Controla visibilidade no sistema</p>
          </div>
          <Switch
            checked={formData.ativo}
            onCheckedChange={(v) => setFormData({...formData, ativo: v})}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-green-600 hover:bg-green-700 min-w-40 h-11 text-base font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>{tabelaReal ? '💾 Atualizar' : '➕ Criar Tabela'}</>
          )}
        </Button>
      </div>
    </form>
  );
}