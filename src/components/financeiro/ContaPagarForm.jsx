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
import FormErrorSummary from "@/components/common/FormErrorSummary";
import { z } from 'zod';
import FormWrapper from "@/components/common/FormWrapper";
import ContaPagarDadosGerais from "./ContaPagarDadosGerais";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import { useUser } from "@/components/lib/UserContext";

export default function ContaPagarForm({ conta, onSubmit, isSubmitting, windowMode = false }) {
  const [errorMessages, setErrorMessages] = useState([]);
  const { empresaAtual, filterInContext, carimbarContexto } = useContextoVisual();
  const schema = z.object({
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    fornecedor_id: z.string().min(1, 'Fornecedor é obrigatório'),
    valor: z.number().positive('Valor deve ser maior que zero'),
    empresa_id: z.string().min(1, 'Empresa é obrigatória'),
    centro_custo_id: z.string().min(1, 'Centro de custo é obrigatório'),
    plano_contas_id: z.string().min(1, 'Plano de contas é obrigatório'),
    data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
    data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  });
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const { user: authUser } = useUser();
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
    forma_pagamento_id: '',
    numero_documento: '',
    numero_parcela: '',
    centro_custo: '',
    centro_custo_id: '',
    plano_contas_id: '',
    projeto_obra: '',
    categoria: 'Fornecedores',
    ordem_compra_id: '',
    nota_fiscal_id: '',
    observacoes: '',
    empresa_id: ''
  });

  const { formasPagamento } = useFormasPagamento({ empresa_id: formData.empresa_id });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores', empresaAtual?.id],
    queryFn: () => filterInContext('Fornecedor', {}, '-updated_date', 9999),
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra', empresaAtual?.id],
    queryFn: () => filterInContext('OrdemCompra', {}, '-updated_date', 9999),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas', empresaAtual?.id],
    queryFn: () => filterInContext('Empresa', {}, '-updated_date', 9999),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto', empresaAtual?.id],
    queryFn: () => filterInContext('CentroCusto', {}, '-updated_date', 9999),
  });

  const { data: planosContas = [] } = useQuery({
    queryKey: ['planosContas', empresaAtual?.id],
    queryFn: () => filterInContext('PlanoDeContas', {}, '-updated_date', 9999),
  });

  const handleSubmit = async () => {
    const parsed = schema.safeParse({
      ...formData,
      valor: Number(formData.valor) || 0,
    });
    if (!parsed.success) {
      const issues = parsed.error.issues || [];
      setErrorMessages(issues.map(i => i.message).filter(Boolean));
      const msg = issues[0]?.message || 'Dados inválidos';
      toast.error(msg);
      return;
    }
    setErrorMessages([]);
    onSubmit(carimbarContexto({
      ...formData,
      valor: Number(formData.valor) || 0,
      criado_por: authUser?.full_name || authUser?.email,
      criado_por_id: authUser?.id
    }, 'empresa_id'));
  };

  const content = (
    <FormWrapper schema={schema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className={`space-y-6 w-full h-full ${windowMode ? 'overflow-auto p-6' : 'max-h-[75vh] overflow-auto p-6'}`}>
      <FormErrorSummary messages={errorMessages} />
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
          <ContaPagarDadosGerais formData={formData} setFormData={setFormData} fornecedores={fornecedores} empresas={empresas} />
          <ContaPagarDadosGerais formData={formData} setFormData={setFormData} fornecedores={fornecedores} empresas={empresas} />
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
                value={formData.forma_pagamento_id || formData.forma_pagamento}
                onValueChange={(formaId) => {
                  const forma = formasPagamento.find(f => f.id === formaId);
                  setFormData({
                    ...formData,
                    forma_pagamento_id: formaId,
                    forma_pagamento: forma?.descricao || formaId
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map(forma => (
                    <SelectItem key={forma.id} value={forma.id}>
                      {forma.icone && `${forma.icone} `}{forma.descricao}
                    </SelectItem>
                  ))}
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
            <Label>Centro de Custo *</Label>
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
            <Label>Plano de Contas *</Label>
            <Select
              value={formData.plano_contas_id}
              onValueChange={(v) => setFormData({ ...formData, plano_contas_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {planosContas.map(pc => (
                  <SelectItem key={pc.id} value={pc.id}>
                    {pc.codigo || pc.id} - {pc.descricao || pc.nome}
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
    </FormWrapper>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}