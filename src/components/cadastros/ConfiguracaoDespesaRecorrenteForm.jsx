import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, Calendar } from "lucide-react";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";

export default function ConfiguracaoDespesaRecorrenteForm({ despesa, onSubmit, windowMode = false }) {
  const { toast } = useToast();
  const { formasPagamento } = useFormasPagamento();

  const [formData, setFormData] = useState(despesa || {
    descricao: "",
    tipo_despesa: "Outro",
    fornecedor: "",
    fornecedor_id: "",
    valor_fixo: 0,
    valor_variavel: false,
    forma_calculo_variavel: "",
    periodicidade: "Mensal",
    dia_vencimento: 10,
    dias_antecedencia_geracao: 5,
    forma_pagamento_padrao_id: "",
    categoria: "Outros",
    centro_custo_id: "",
    ativa: true,
    requer_aprovacao: false,
    notificar_antes_vencimento: true,
    dias_notificacao_antecipada: 3,
    observacoes: ""
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centros-custo'],
    queryFn: () => base44.entities.CentroCusto.list(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const forma = formasPagamento.find(f => f.id === formData.forma_pagamento_padrao_id);
    const centro = centrosCusto.find(c => c.id === formData.centro_custo_id);
    
    const data = {
      ...formData,
      forma_pagamento_padrao_nome: forma?.descricao,
      centro_custo_nome: centro?.descricao
    };

    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <div className={windowMode ? "w-full h-full overflow-y-auto p-6" : ""}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Configuração de Despesa Recorrente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Descrição *</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Aluguel Escritório, Energia Elétrica..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Despesa *</Label>
                <Select value={formData.tipo_despesa} onValueChange={(v) => setFormData({ ...formData, tipo_despesa: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Salário">Salário</SelectItem>
                    <SelectItem value="Tarifa Bancária">Tarifa Bancária</SelectItem>
                    <SelectItem value="Taxa Cartão">Taxa Cartão</SelectItem>
                    <SelectItem value="Impostos">Impostos</SelectItem>
                    <SelectItem value="Energia">Energia</SelectItem>
                    <SelectItem value="Água">Água</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                    <SelectItem value="Software/SaaS">Software/SaaS</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                    <SelectItem value="Salários">Salários</SelectItem>
                    <SelectItem value="Impostos">Impostos</SelectItem>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Energia">Energia</SelectItem>
                    <SelectItem value="Água">Água</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fornecedor</Label>
                <Select value={formData.fornecedor_id} onValueChange={(v) => {
                  const forn = fornecedores.find(f => f.id === v);
                  setFormData({ ...formData, fornecedor_id: v, fornecedor: forn?.nome });
                }}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {fornecedores.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Centro de Custo</Label>
                <Select value={formData.centro_custo_id} onValueChange={(v) => setFormData({ ...formData, centro_custo_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {centrosCusto.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Fixo *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_fixo}
                  onChange={(e) => setFormData({ ...formData, valor_fixo: parseFloat(e.target.value) })}
                  required
                  disabled={formData.valor_variavel}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.valor_variavel}
                  onCheckedChange={(v) => setFormData({ ...formData, valor_variavel: v })}
                />
                <Label>Valor Variável</Label>
              </div>
            </div>

            {formData.valor_variavel && (
              <div>
                <Label>Forma de Cálculo Variável</Label>
                <Input
                  value={formData.forma_calculo_variavel}
                  onChange={(e) => setFormData({ ...formData, forma_calculo_variavel: e.target.value })}
                  placeholder="Ex: 2% sobre vendas do mês"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Periodicidade *</Label>
                <Select value={formData.periodicidade} onValueChange={(v) => setFormData({ ...formData, periodicidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Bimestral">Bimestral</SelectItem>
                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                    <SelectItem value="Semestral">Semestral</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dia Vencimento *</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_vencimento}
                  onChange={(e) => setFormData({ ...formData, dia_vencimento: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Gerar com Antecedência (dias)</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.dias_antecedencia_geracao}
                  onChange={(e) => setFormData({ ...formData, dias_antecedencia_geracao: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Forma de Pagamento Padrão</Label>
              <Select value={formData.forma_pagamento_padrao_id} onValueChange={(v) => setFormData({ ...formData, forma_pagamento_padrao_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {formasPagamento.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.ativa}
                  onCheckedChange={(v) => setFormData({ ...formData, ativa: v })}
                />
                <Label>Ativa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.requer_aprovacao}
                  onCheckedChange={(v) => setFormData({ ...formData, requer_aprovacao: v })}
                />
                <Label>Requer Aprovação</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.notificar_antes_vencimento}
                  onCheckedChange={(v) => setFormData({ ...formData, notificar_antes_vencimento: v })}
                />
                <Label>Notificar Antes do Vencimento</Label>
              </div>
            </div>

            {formData.notificar_antes_vencimento && (
              <div>
                <Label>Dias de Antecedência para Notificação</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.dias_notificacao_antecipada}
                  onChange={(e) => setFormData({ ...formData, dias_notificacao_antecipada: parseInt(e.target.value) })}
                />
              </div>
            )}

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-blue-600">
            {despesa ? 'Atualizar' : 'Criar'} Despesa Recorrente
          </Button>
        </div>
      </form>
    </div>
  );
}