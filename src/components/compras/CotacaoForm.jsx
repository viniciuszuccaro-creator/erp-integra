import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Save, TrendingUp, Plus, Trash2, Building2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * V21.1.2: Cotação Form - Adaptado para Window Mode
 */
export default function CotacaoForm({ cotacao, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(cotacao || {
    numero_cotacao: `COT-${Date.now()}`,
    descricao: '',
    data_criacao: new Date().toISOString().split('T')[0],
    data_limite_resposta: '',
    itens: [{ produto_descricao: '', quantidade: 0, unidade: 'UN', observacoes: '' }],
    fornecedores_selecionados: [],
    observacoes_gerais: ''
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const adicionarItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { produto_descricao: '', quantidade: 0, unidade: 'UN', observacoes: '' }]
    });
  };

  const removerItem = (index) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index)
    });
  };

  const toggleFornecedor = (fornecedorId) => {
    const selecionados = formData.fornecedores_selecionados.includes(fornecedorId)
      ? formData.fornecedores_selecionados.filter(id => id !== fornecedorId)
      : [...formData.fornecedores_selecionados, fornecedorId];
    
    setFormData({ ...formData, fornecedores_selecionados: selecionados });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            Nova Cotação de Compras
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nº Cotação</Label>
              <Input
                value={formData.numero_cotacao}
                readOnly
                className="bg-slate-50"
              />
            </div>

            <div>
              <Label>Data Limite Resposta *</Label>
              <Input
                type="date"
                value={formData.data_limite_resposta}
                onChange={(e) => setFormData({ ...formData, data_limite_resposta: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição da Cotação *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Cotação de Bitolas - Lote Fevereiro"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Itens para Cotação</h3>
            <Button type="button" size="sm" variant="outline" onClick={adicionarItem}>
              <Plus className="w-4 h-4 mr-2" />
              Item
            </Button>
          </div>

          <div className="space-y-3">
            {formData.itens.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="col-span-5">
                  <Select
                    value={item.produto_descricao}
                    onValueChange={(value) => {
                      const novosItens = [...formData.itens];
                      novosItens[idx].produto_descricao = value;
                      setFormData({ ...formData, itens: novosItens });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map(p => (
                        <SelectItem key={p.id} value={p.descricao}>
                          {p.codigo} - {p.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.quantidade}
                    onChange={(e) => {
                      const novosItens = [...formData.itens];
                      novosItens[idx].quantidade = parseFloat(e.target.value);
                      setFormData({ ...formData, itens: novosItens });
                    }}
                    placeholder="Qtd"
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    value={item.unidade}
                    onValueChange={(value) => {
                      const novosItens = [...formData.itens];
                      novosItens[idx].unidade = value;
                      setFormData({ ...formData, itens: novosItens });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UN">UN</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="LT">LT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input
                    value={item.observacoes}
                    onChange={(e) => {
                      const novosItens = [...formData.itens];
                      novosItens[idx].observacoes = e.target.value;
                      setFormData({ ...formData, itens: novosItens });
                    }}
                    placeholder="Obs"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {formData.itens.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removerItem(idx)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="mb-3 block">Fornecedores Convidados * (min. 2)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {fornecedores.filter(f => f.status === 'Ativo').map(fornecedor => (
                <div key={fornecedor.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <Checkbox
                    checked={formData.fornecedores_selecionados.includes(fornecedor.id)}
                    onCheckedChange={() => toggleFornecedor(fornecedor.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{fornecedor.nome}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {fornecedor.categoria}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {formData.fornecedores_selecionados.length < 2 && (
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Selecione ao menos 2 fornecedores
              </p>
            )}
          </div>

          <div>
            <Label>Observações Gerais</Label>
            <Textarea
              value={formData.observacoes_gerais}
              onChange={(e) => setFormData({ ...formData, observacoes_gerais: e.target.value })}
              rows={3}
              placeholder="Condições especiais, prazos..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button 
          type="submit" 
          className="bg-cyan-600 hover:bg-cyan-700"
          disabled={formData.fornecedores_selecionados.length < 2}
        >
          <Save className="w-4 h-4 mr-2" />
          Criar e Enviar Cotação
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}