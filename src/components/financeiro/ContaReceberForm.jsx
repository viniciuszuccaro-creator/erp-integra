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
import { DollarSign, Calendar, FileText, Building2, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { z } from "zod";

export default function ContaReceberForm({ conta, onSubmit, isSubmitting, windowMode = false }) {
  const schema = z.object({
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    cliente_id: z.string().min(1, 'Cliente é obrigatório'),
    valor: z.number().positive('Valor deve ser maior que zero'),
    empresa_id: z.string().min(1, 'Empresa é obrigatória'),
    centro_custo_id: z.string().min(1, 'Centro de custo é obrigatório'),
    plano_contas_id: z.string().min(1, 'Plano de contas é obrigatório'),
    data_emissao: z.string().min(1, 'Data de emissão é obrigatória'),
    data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  });
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const { user: authUser } = useUser();
  const { filterInContext } = useContextoVisual();
  const [formData, setFormData] = useState(() => conta || {
    descricao: '',
    cliente: '',
    cliente_id: '',
    pedido_id: '',
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    forma_recebimento: 'Boleto',
    forma_recebimento_id: '',
    numero_documento: '',
    numero_parcela: '',
    centro_custo: '',
    centro_custo_id: '',
    plano_contas_id: '',
    projeto_obra: '',
    categoria: '',
    origem_tipo: 'manual',
    observacoes: '',
    empresa_id: '',
    visivel_no_portal: true
  });

  const { formasPagamento } = useFormasPagamento({ empresa_id: formData.empresa_id });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => filterInContext('Cliente', {}, '-updated_date', 9999),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => filterInContext('Pedido', {}, '-updated_date', 9999),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => filterInContext('Empresa', {}, '-updated_date', 9999),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto'],
    queryFn: () => filterInContext('CentroCusto', {}, '-updated_date', 9999),
  });
  const { data: planosContas = [] } = useQuery({
    queryKey: ['planosContas'],
    queryFn: () => filterInContext('PlanoDeContas', {}, '-updated_date', 9999),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsed = schema.safeParse({
      ...formData,
      valor: Number(formData.valor) || 0,
    });
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Dados inválidos';
      toast.error(msg);
      return;
    }

    onSubmit({
      ...formData,
      valor: Number(formData.valor) || 0,
      criado_por: authUser?.full_name || authUser?.email,
      criado_por_id: authUser?.id
    });
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'h-full overflow-auto p-6' : 'max-h-[75vh] overflow-auto p-6'}`}>
      <Alert className="border-green-300 bg-green-50">
        <AlertDescription className="text-sm text-green-900">
          <strong>💰 Conta a Receber:</strong> Registre valores a receber de clientes e gere cobranças
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
            <Building2 className="w-4 h-4 mr-1" />
            Vínculos
          </TabsTrigger>
          <TabsTrigger value="config">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: DADOS GERAIS */}
        <TabsContent value="dados-gerais" className="space-y-4">
          <div>
            <Label>Descrição *</Label>
            <Input
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Ex: Venda de Produtos - Pedido #123"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente *</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(v) => {
                  const cliente = clientes.find(c => c.id === v);
                  setFormData({
                    ...formData,
                    cliente_id: v,
                    cliente: cliente?.nome || cliente?.razao_social || ''
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome || c.razao_social}
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
              <Label>Forma de Recebimento</Label>
              <Select
                value={formData.forma_recebimento_id || formData.forma_recebimento}
                onValueChange={(formaId) => {
                  const forma = formasPagamento.find(f => f.id === formaId);
                  setFormData({
                    ...formData, 
                    forma_recebimento_id: formaId,
                    forma_recebimento: forma?.descricao || formaId
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

            <div>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({...formData, status: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Recebido">Recebido</SelectItem>
                  <SelectItem value="Atrasado">Atrasado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Parcial">Parcial</SelectItem>
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
                placeholder="Ex: NF-123456"
              />
            </div>

            <div>
              <Label>Número Parcela</Label>
              <Input
                value={formData.numero_parcela}
                onChange={(e) => setFormData({...formData, numero_parcela: e.target.value})}
                placeholder="Ex: 1/3"
              />
            </div>
          </div>
        </TabsContent>

        {/* ABA 3: VÍNCULOS */}
        <TabsContent value="vinculacao" className="space-y-4">
          <div>
            <Label>Pedido Vinculado</Label>
            <Select
              value={formData.pedido_id}
              onValueChange={(v) => setFormData({...formData, pedido_id: v})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum pedido vinculado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhum</SelectItem>
                {pedidos.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.numero_pedido} - {p.cliente_nome} - R$ {p.valor_total?.toFixed(2)}
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

        {/* ABA 4: CONFIGURAÇÕES */}
        <TabsContent value="config" className="space-y-4">
          <div>
            <Label>Origem do Título</Label>
            <Select
              value={formData.origem_tipo}
              onValueChange={(v) => setFormData({...formData, origem_tipo: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pedido">Pedido</SelectItem>
                <SelectItem value="financeiro">Financeiro Direto</SelectItem>
                <SelectItem value="contrato">Contrato</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div>
              <Label className="font-semibold">Visível no Portal do Cliente</Label>
              <p className="text-xs text-slate-500">Cliente pode ver no Portal</p>
            </div>
            <input
              type="checkbox"
              checked={formData.visivel_no_portal}
              onChange={(e) => setFormData({...formData, visivel_no_portal: e.target.checked})}
              className="w-5 h-5"
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações adicionais..."
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* RESUMO */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Valor Total</p>
              <p className="text-3xl font-bold text-green-600">
                R$ {(formData.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <Badge className={
                formData.status === 'Recebido' ? 'bg-green-600' :
                formData.status === 'Atrasado' ? 'bg-red-600' :
                'bg-yellow-600'
              }>
                {formData.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BOTÃO SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 px-8">
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