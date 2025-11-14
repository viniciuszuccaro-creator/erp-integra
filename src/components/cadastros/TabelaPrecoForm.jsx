import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";

export default function TabelaPrecoForm({ tabela, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
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
    if (tabela && tabela.id) {
      console.log('✏️ TabelaPrecoForm - MODO EDIÇÃO:', tabela);
      setFormData(tabela);
    } else {
      console.log('➕ TabelaPrecoForm - MODO CRIAÇÃO');
    }
  }, [tabela]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('🚀 TabelaPrecoForm SUBMIT INICIADO');
    console.log('📦 FormData completo:', JSON.stringify(formData, null, 2));
    
    if (!formData.nome?.trim()) {
      alert('❌ Nome da tabela é obrigatório!');
      console.error('❌ Validação falhou: nome vazio');
      return;
    }

    if (!formData.tipo) {
      alert('❌ Tipo da tabela é obrigatório!');
      console.error('❌ Validação falhou: tipo vazio');
      return;
    }

    // Preparar dados para envio
    const dadosParaEnviar = {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      data_inicio: formData.data_inicio,
      ativo: formData.ativo,
      quantidade_produtos: formData.quantidade_produtos || 0,
      clientes_vinculados: formData.clientes_vinculados || []
    };

    // Adicionar campos opcionais apenas se preenchidos
    if (formData.descricao?.trim()) {
      dadosParaEnviar.descricao = formData.descricao.trim();
    }

    if (formData.data_fim) {
      dadosParaEnviar.data_fim = formData.data_fim;
    }

    if (formData.observacoes?.trim()) {
      dadosParaEnviar.observacoes = formData.observacoes.trim();
    }

    console.log('✅ Dados validados e preparados:', dadosParaEnviar);
    console.log('📤 Chamando onSubmit...');
    
    onSubmit(dadosParaEnviar);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert className="border-blue-200 bg-blue-50">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-900">
          💡 A <strong>empresa_id</strong> será adicionada automaticamente ao salvar
        </AlertDescription>
      </Alert>

      <Card className="p-4 bg-slate-50">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900">
              Nome da Tabela <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.nome}
              onChange={(e) => {
                const valor = e.target.value;
                console.log('✏️ Nome alterado para:', valor);
                setFormData({...formData, nome: valor});
              }}
              placeholder="Ex: Tabela Atacado São Paulo"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900">Descrição</Label>
            <Input
              value={formData.descricao || ''}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descrição interna (opcional)"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900">
              Tipo de Tabela <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.tipo} 
              onValueChange={(v) => {
                console.log('📋 Tipo alterado para:', v);
                setFormData({...formData, tipo: v});
              }}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione o tipo" />
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
              <Label className="text-sm font-semibold text-slate-900">Data Início</Label>
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-900">Data Fim (opcional)</Label>
              <Input
                type="date"
                value={formData.data_fim || ''}
                onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900">Observações</Label>
            <Textarea
              value={formData.observacoes || ''}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              rows={3}
              placeholder="Observações internas sobre esta tabela"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-slate-200">
            <div>
              <Label className="text-sm font-semibold text-slate-900">Tabela Ativa</Label>
              <p className="text-xs text-slate-500 mt-1">
                Apenas tabelas ativas aparecem para seleção
              </p>
            </div>
            <Switch
              checked={formData.ativo}
              onCheckedChange={(v) => {
                console.log('🔄 Ativo alterado para:', v);
                setFormData({...formData, ativo: v});
              }}
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-green-600 hover:bg-green-700 min-w-40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>{tabela?.id ? '✅ Atualizar Tabela' : '➕ Criar Tabela de Preço'}</>
          )}
        </Button>
      </div>

      {/* DEBUG PANEL - REMOVER DEPOIS */}
      <Card className="p-3 bg-yellow-50 border-yellow-200">
        <p className="text-xs font-mono text-yellow-900">
          <strong>🔍 DEBUG:</strong> {JSON.stringify({ 
            nome: formData.nome, 
            tipo: formData.tipo, 
            data_inicio: formData.data_inicio,
            ativo: formData.ativo 
          })}
        </p>
      </Card>
    </form>
  );
}