import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText } from "lucide-react";

export default function ModeloDocumentoForm({ modelo, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(modelo || {
    nome_modelo: '',
    tipo_documento: 'Romaneio',
    descricao: '',
    template_html: '',
    orientacao_pagina: 'Retrato',
    tamanho_papel: 'A4',
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_modelo || !formData.tipo_documento) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Modelo *</Label>
        <Input
          value={formData.nome_modelo}
          onChange={(e) => setFormData({...formData, nome_modelo: e.target.value})}
          placeholder="Ex: Romaneio Padrão, Etiqueta Produto"
        />
      </div>

      <div>
        <Label>Tipo de Documento *</Label>
        <Select value={formData.tipo_documento} onValueChange={(v) => setFormData({...formData, tipo_documento: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Romaneio">Romaneio</SelectItem>
            <SelectItem value="Ordem de Carga">Ordem de Carga</SelectItem>
            <SelectItem value="Etiqueta Produto">Etiqueta Produto</SelectItem>
            <SelectItem value="Canhoto">Canhoto de Entrega</SelectItem>
            <SelectItem value="Termo de Entrega">Termo de Entrega</SelectItem>
            <SelectItem value="Orçamento">Orçamento</SelectItem>
            <SelectItem value="Proposta Comercial">Proposta Comercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
          placeholder="Descrição do modelo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Orientação</Label>
          <Select value={formData.orientacao_pagina} onValueChange={(v) => setFormData({...formData, orientacao_pagina: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Retrato">Retrato</SelectItem>
              <SelectItem value="Paisagem">Paisagem</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tamanho</Label>
          <Select value={formData.tamanho_papel} onValueChange={(v) => setFormData({...formData, tamanho_papel: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="A5">A5</SelectItem>
              <SelectItem value="Etiqueta 10x15">Etiqueta 10x15cm</SelectItem>
              <SelectItem value="Carta">Carta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <FileText className="w-4 h-4" />
        <AlertDescription className="text-sm">
          💡 Use variáveis como: cliente_nome, pedido_numero, data_entrega
        </AlertDescription>
      </Alert>

      <div>
        <Label>Template HTML (Avançado)</Label>
        <Textarea
          value={formData.template_html}
          onChange={(e) => setFormData({...formData, template_html: e.target.value})}
          rows={6}
          placeholder="<div>Template HTML...</div>"
          className="font-mono text-xs"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {modelo ? 'Atualizar' : 'Criar Modelo'}
        </Button>
      </div>
    </form>
  );
}