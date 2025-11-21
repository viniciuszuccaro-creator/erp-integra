import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Calendar, FileText, Building2, Package, Loader2, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ContaPagarForm({ conta, onSubmit, isSubmitting, windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [formData, setFormData] = useState(() => conta || {
    descricao: '',
    fornecedor: '',
    fornecedor_id: '',
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    status_pagamento: 'Pendente',
    forma_pagamento: 'Boleto',
    numero_documento: '',
    numero_parcela: '',
    centro_custo: '',
    centro_custo_id: '',
    projeto_obra: '',
    categoria: 'Fornecedores',
    ordem_compra_id: '',
    nota_fiscal_id: '',
    observacoes: '',
    empresa_id: ''
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: () => base44.entities.Fornecedor.list(),
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra'],
    queryFn: () => base44.entities.OrdemCompra.list(),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => base44.entities.CentroCusto.list(),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.descricao || !formData.fornecedor || !formData.valor) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (!formData.empresa_id) {
      toast.error('Selecione a empresa');
      return;
    }

    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'h-full overflow-auto p-6' : 'max-h-[75vh] overflow-auto p-6'}`}>
      <Alert className="border-red-300 bg-red-50">
        <AlertDescription className="text-sm text-red-900">
          <strong>💸 Conta a Pagar:</strong> Registre obrigações com fornecedores e controle pagamentos
        </AlertDescription>
      </Alert>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-4 w-full bg-slate-100">
          <TabsTrigger value="dados-gerais">
            <FileText className="w-4 h-4 mr-1" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="w-4 h-4 mr-1" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="vinculacao">
            <Package className="w-4 h-4 mr-1" />
            Vínculos
          </TabsTrigger>
          <TabsTrigger value="aprovacao">
            <TrendingDown className="w-4 h-4 mr-1" />
            Aprovação
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: DADOS GERAIS */}
        <TabsContent value="dados-gerais" className="space-y-4">
          <div>
            <Label>Descrição *</Label>
            <Input
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Ex: Compra de Matéria-Prima - OC #456"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fornecedor *</Label>
              <Select
                value={formData.fornecedor_id}
                onValueChange={(v) => {
                  const forn = fornecedores.find(f => f.id === v);
                  setFormData({
                    ...formData,
                    fornecedor_id: v,
                    fornecedor: forn?.nome || forn?.razao_social || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map(f => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome || f.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Empresa *</Label>
              <Select
                value={formData.empresa_id}
                onValueChange={(v) => setFormData({...formData, empresa_id: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nome_fantasia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Valor *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value) || 0})}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Data Emissão *</Label>
              <Input
                type="date"
                value={formData.data_emissao}
                onChange={(e) => setFormData({...formData, data_emissao: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>Data Vencimento *</Label>
              <Input
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                required
              />
            </div>
          </div>
        </TabsContent>

        {/* ABA 2: FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(v) => setFormData({...formData, categoria: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                  <SelectItem value="Salários">Salários</SelectItem>
                  <SelectItem value="Impostos">Impostos</SelectItem>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Energia">Energia</SelectItem>
                  <SelectItem value="Água">Água</SelectItem>
                  <SelectItem value="Telefone">Telefone</SelectItem>
                  <SelectItem value="Internet">Internet</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Comissões">Comissões</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">💵 Dinheiro</SelectItem>
                  <SelectItem value="Transferência">🏦 Transferência</SelectItem>
                  <SelectItem value="Boleto">📄 Boleto</SelectItem>
                  <SelectItem value="Cartão">💳 Cartão</SelectItem>
                  <SelectItem value="PIX">⚡ PIX</SelectItem>
                  <SelectItem value="Cheque">📝 Cheque</SelectItem>
                  <SelectItem value="TED">🏦 TED</SelectItem>
                  <SelectItem value="DOC">🏦 DOC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número do Documento</Label>
              <Input
                value={formData.numero_documento}
                onChange={(e) => setFormData({...formData, numero_documento: e.target.value})}
                placeholder="Ex: NF-789"
              />
            </div>

            <div>
              <Label>Número Parcela</Label>
              <Input
                value={formData.numero_parcela}
                onChange={(e) => setFormData({...formData, numero_parcela: e.target.value})}
                placeholder="Ex: 2/5"
              />
            </div>
          </div>
        </TabsContent>

        {/* ABA 3: VÍNCULOS */}
        <TabsContent value="vinculacao" className="space-y-4">
          <div>
            <Label>Ordem de Compra Vinculada</Label>
            <Select
              value={formData.ordem_compra_id}
              onValueChange={(v) => setFormData({...formData, ordem_compra_id: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma OC vinculada..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhuma</SelectItem>
                {ordensCompra.map(oc => (
                  <SelectItem key={oc.id} value={oc.id}>
                    {oc.numero_oc} - {oc.fornecedor_nome} - R$ {oc.valor_total?.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Centro de Custo</Label>
            <Select
              value={formData.centro_custo_id}
              onValueChange={(v) => {
                const cc = centrosCusto.find(c => c.id === v);
                setFormData({
                  ...formData,
                  centro_custo_id: v,
                  centro_custo: cc?.nome || ''
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {centrosCusto.map(cc => (
                  <SelectItem key={cc.id} value={cc.id}>
                    {cc.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Projeto/Obra</Label>
            <Input
              value={formData.projeto_obra}
              onChange={(e) => setFormData({...formData, projeto_obra: e.target.value})}
              placeholder="Nome do projeto ou obra..."
            />
          </div>
        </TabsContent>

        {/* ABA 4: APROVAÇÃO */}
        <TabsContent value="aprovacao" className="space-y-4">
          <Alert className="border-blue-300 bg-blue-50">
            <AlertDescription className="text-sm text-blue-900">
              <strong>ℹ️ Workflow de Aprovação:</strong> Contas de alto valor podem exigir aprovação do gestor
            </AlertDescription>
          </Alert>

          <div>
            <Label>Status do Pagamento</Label>
            <Select
              value={formData.status_pagamento}
              onValueChange={(v) => setFormData({...formData, status_pagamento: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aguardando Aprovação">Aguardando Aprovação</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações sobre pagamento..."
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* RESUMO */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Valor Total</p>
              <p className="text-3xl font-bold text-red-600">
                R$ {(formData.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <Badge className={
                formData.status === 'Pago' ? 'bg-green-600' :
                formData.status === 'Aprovado' ? 'bg-blue-600' :
                formData.status === 'Pendente' ? 'bg-yellow-600' :
                'bg-red-600'
              }>
                {formData.status_pagamento}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOTÃO SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 px-8">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {conta ? 'Atualizar Conta' : 'Criar Conta'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}