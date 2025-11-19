import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, ShoppingCart } from "lucide-react";

/**
 * V21.1.2: Solicitação Compra Form - Adaptado para Window Mode
 */
export default function SolicitacaoCompraForm({ solicitacao, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(solicitacao || {
    numero_solicitacao: `SC-${Date.now()}`,
    data_solicitacao: new Date().toISOString().split('T')[0],
    solicitante: '',
    setor: '',
    produto_id: '',
    produto_descricao: '',
    quantidade_solicitada: 1,
    unidade_medida: 'UN',
    justificativa: '',
    prioridade: 'Média',
    data_necessidade: '',
    status: 'Pendente',
    observacoes: ''
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setFormData({
        ...formData,
        produto_id: produtoId,
        produto_descricao: produto.descricao,
        unidade_medida: produto.unidade_medida || 'UN'
      });
    }
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
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Solicitação de Compra
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nº Solicitação</Label>
              <Input
                value={formData.numero_solicitacao}
                onChange={(e) => setFormData({ ...formData, numero_solicitacao: e.target.value })}
                readOnly
                className="bg-slate-50"
              />
            </div>

            <div>
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.data_solicitacao}
                onChange={(e) => setFormData({ ...formData, data_solicitacao: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Produto *</Label>
              <Select
                value={formData.produto_id}
                onValueChange={handleProdutoChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {produtos.filter(p => p.status === 'Ativo').map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.codigo ? `${p.codigo} - ` : ''}{p.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantidade *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.quantidade_solicitada}
                  onChange={(e) => setFormData({ ...formData, quantidade_solicitada: parseFloat(e.target.value) || 0 })}
                  required
                  className="flex-1"
                />
                <span className="bg-slate-100 px-3 py-2 rounded border text-sm">
                  {formData.unidade_medida}
                </span>
              </div>
            </div>

            <div>
              <Label>Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(v) => setFormData({ ...formData, prioridade: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">🔥 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Data Necessidade</Label>
              <Input
                type="date"
                value={formData.data_necessidade}
                onChange={(e) => setFormData({ ...formData, data_necessidade: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>Justificativa *</Label>
              <Textarea
                value={formData.justificativa}
                onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                placeholder="Explique o motivo da compra..."
                required
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {solicitacao ? 'Atualizar' : 'Criar'} Solicitação
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}