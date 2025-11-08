import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  User, Package, Factory, Truck, DollarSign, FileText, CheckCircle2, 
  AlertTriangle, Plus, X, Loader2, Shield, TrendingUp 
} from "lucide-react";
import { toast } from "sonner";

/**
 * PEDIDO FORM COMPLETO V21.1 - 8 ABAS
 * Integração total com Hub de Cadastros, IAs e validações
 */
export default function PedidoFormCompleto({ pedido, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('identificacao');
  const [formData, setFormData] = useState(pedido || {
    cliente_id: '',
    vendedor_id: '',
    origem_pedido: 'Manual',
    data_pedido: new Date().toISOString().split('T')[0],
    itens_revenda: [],
    itens_armado_padrao: [],
    itens_corte_dobra: [],
    tipo_frete: 'CIF',
    forma_pagamento: '',
    endereco_entrega_id: '',
    observacoes_publicas: '',
    observacoes_internas: '',
    status: 'Rascunho'
  });

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [validacaoKYC, setValidacaoKYC] = useState(null);
  const [calculoFinanceiro, setCalculoFinanceiro] = useState({
    valor_produtos: 0,
    valor_frete: 0,
    desconto_total: 0,
    valor_total: 0
  });

  // QUERIES
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list()
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list()
  });

  const { data: bitolas = [] } = useQuery({
    queryKey: ['bitolas'],
    queryFn: async () => {
      const prods = await base44.entities.Produto.filter({ eh_bitola: true });
      return prods;
    }
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco'],
    queryFn: () => base44.entities.TabelaPreco.list()
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list()
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => base44.entities.User.list()
  });

  // IA KYC - Validação ao selecionar cliente
  useEffect(() => {
    if (formData.cliente_id) {
      const cliente = clientes.find(c => c.id === formData.cliente_id);
      setClienteSelecionado(cliente);
      
      // IA KYC/KYB - Validação automática
      if (cliente) {
        const validacao = {
          status_fiscal: cliente.status_fiscal_receita || 'Não Verificado',
          bloqueado: cliente.status === 'Bloqueado',
          limite_disponivel: (cliente.condicao_comercial?.limite_credito || 0) - (cliente.condicao_comercial?.limite_credito_utilizado || 0),
          risco_churn: cliente.risco_churn || 'Baixo'
        };
        setValidacaoKYC(validacao);

        // BLOQUEIA se fiscal inapto
        if (validacao.status_fiscal === 'Inapta') {
          toast.error('🚨 Cliente com situação fiscal INAPTA! Pedido bloqueado.');
        }
      }
    }
  }, [formData.cliente_id, clientes]);

  // Recalcula totais
  useEffect(() => {
    const valorProdutos = [
      ...formData.itens_revenda,
      ...formData.itens_armado_padrao,
      ...formData.itens_corte_dobra
    ].reduce((sum, item) => sum + (item.valor_total || 0), 0);

    setCalculoFinanceiro({
      valor_produtos: valorProdutos,
      valor_frete: formData.valor_frete || 0,
      desconto_total: formData.desconto_geral_pedido_valor || 0,
      valor_total: valorProdutos + (formData.valor_frete || 0) - (formData.desconto_geral_pedido_valor || 0)
    });
  }, [formData.itens_revenda, formData.itens_armado_padrao, formData.itens_corte_dobra, formData.valor_frete, formData.desconto_geral_pedido_valor]);

  const handleAdicionarItemRevenda = () => {
    setFormData({
      ...formData,
      itens_revenda: [
        ...formData.itens_revenda,
        { produto_id: '', descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }
      ]
    });
  };

  const handleRemoverItemRevenda = (idx) => {
    setFormData({
      ...formData,
      itens_revenda: formData.itens_revenda.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async () => {
    if (!formData.cliente_id) {
      toast.error('Selecione um cliente');
      return;
    }

    if (validacaoKYC?.status_fiscal === 'Inapta') {
      toast.error('🚨 Cliente bloqueado por situação fiscal irregular');
      return;
    }

    const pedidoData = {
      ...formData,
      valor_produtos: calculoFinanceiro.valor_produtos,
      valor_total: calculoFinanceiro.valor_total,
      peso_total_kg: formData.itens_corte_dobra.reduce((sum, i) => sum + (i.peso_teorico_total || 0), 0)
    };

    try {
      if (pedido?.id) {
        await base44.entities.Pedido.update(pedido.id, pedidoData);
        toast.success('✅ Pedido atualizado!');
      } else {
        await base44.entities.Pedido.create(pedidoData);
        toast.success('✅ Pedido criado!');
      }
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error('Erro ao salvar pedido');
    }
  };

  const podeAvancar = (tab) => {
    if (tab === 'itens' && !formData.cliente_id) {
      toast.error('Selecione um cliente primeiro');
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header com Status KYC */}
      {validacaoKYC && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Alert className={validacaoKYC.status_fiscal === 'Ativa' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <Shield className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Status Fiscal:</strong> {validacaoKYC.status_fiscal}
            </AlertDescription>
          </Alert>

          <Alert className={validacaoKYC.limite_disponivel > 0 ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}>
            <DollarSign className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Crédito Disponível:</strong> R$ {validacaoKYC.limite_disponivel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </AlertDescription>
          </Alert>

          <Alert className="border-purple-200 bg-purple-50">
            <TrendingUp className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <strong>Risco Churn:</strong> {validacaoKYC.risco_churn}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="identificacao">
            <User className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="itens" disabled={!formData.cliente_id}>
            <Package className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="armado" disabled={!formData.cliente_id}>
            <Factory className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="corte" disabled={!formData.cliente_id}>
            <Factory className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="logistica" disabled={!formData.cliente_id}>
            <Truck className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="financeiro" disabled={!formData.cliente_id}>
            <DollarSign className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="documentos" disabled={!formData.cliente_id}>
            <FileText className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="revisao" disabled={!formData.cliente_id}>
            <CheckCircle2 className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        {/* ABA 1 - Identificação */}
        <TabsContent value="identificacao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Identificação e Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cliente *</Label>
                <Select value={formData.cliente_id} onValueChange={(v) => setFormData({...formData, cliente_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome} {c.cnpj && `- ${c.cnpj}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {clienteSelecionado && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-600">Razão Social</p>
                        <p className="font-medium">{clienteSelecionado.razao_social || clienteSelecionado.nome}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">CNPJ/CPF</p>
                        <p className="font-medium">{clienteSelecionado.cnpj || clienteSelecionado.cpf}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Canal Preferencial</p>
                        <p className="font-medium">{clienteSelecionado.canal_preferencial || 'WhatsApp'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Classificação ABC</p>
                        <Badge className="bg-blue-600 text-white">{clienteSelecionado.classificacao_abc || 'Novo'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendedor</Label>
                  <Select value={formData.vendedor_id} onValueChange={(v) => setFormData({...formData, vendedor_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data do Pedido</Label>
                  <Input
                    type="date"
                    value={formData.data_pedido}
                    onChange={(e) => setFormData({...formData, data_pedido: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={() => setActiveTab('itens')} className="w-full">
                Avançar para Itens →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2 - Itens de Revenda */}
        <TabsContent value="itens">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Itens de Revenda
                </CardTitle>
                <Button size="sm" onClick={handleAdicionarItemRevenda}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.itens_revenda.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Select 
                          value={item.produto_id} 
                          onValueChange={(v) => {
                            const prod = produtos.find(p => p.id === v);
                            const itens = [...formData.itens_revenda];
                            itens[idx] = {
                              ...itens[idx],
                              produto_id: v,
                              descricao: prod?.descricao,
                              valor_unitario: prod?.preco_venda || 0,
                              valor_total: (prod?.preco_venda || 0) * (itens[idx].quantidade || 1)
                            };
                            setFormData({...formData, itens_revenda: itens});
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Produto" />
                          </SelectTrigger>
                          <SelectContent>
                            {produtos.filter(p => !p.eh_bitola).map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.descricao}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-20"
                          value={item.quantidade}
                          onChange={(e) => {
                            const itens = [...formData.itens_revenda];
                            itens[idx].quantidade = parseFloat(e.target.value);
                            itens[idx].valor_total = itens[idx].quantidade * itens[idx].valor_unitario;
                            setFormData({...formData, itens_revenda: itens});
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-28"
                          value={item.valor_unitario}
                          onChange={(e) => {
                            const itens = [...formData.itens_revenda];
                            itens[idx].valor_unitario = parseFloat(e.target.value);
                            itens[idx].valor_total = itens[idx].quantidade * itens[idx].valor_unitario;
                            setFormData({...formData, itens_revenda: itens});
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-bold">
                        R$ {(item.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoverItemRevenda(idx)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {formData.itens_revenda.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Nenhum item adicionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3 - Armado Padrão */}
        <TabsContent value="armado">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Armação Padrão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-purple-200 bg-purple-50">
                <AlertDescription>
                  🏗️ Funcionalidade de Armação disponível na próxima versão
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4 - Corte e Dobra */}
        <TabsContent value="corte">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-5 h-5" />
                Corte e Dobra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription>
                  🤖 IA de Leitura de Projetos disponível na próxima versão
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5 - Logística */}
        <TabsContent value="logistica">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Logística e Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Endereço de Entrega</Label>
                <Select 
                  value={formData.endereco_entrega_id} 
                  onValueChange={(v) => setFormData({...formData, endereco_entrega_id: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o endereço" />
                  </SelectTrigger>
                  <SelectContent>
                    {(clienteSelecionado?.locais_entrega || []).map((local, idx) => (
                      <SelectItem key={idx} value={local.apelido}>
                        {local.apelido} - {local.cidade}/{local.estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Frete</Label>
                <Select value={formData.tipo_frete} onValueChange={(v) => setFormData({...formData, tipo_frete: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CIF">CIF - Empresa paga</SelectItem>
                    <SelectItem value="FOB">FOB - Cliente paga</SelectItem>
                    <SelectItem value="Retirada">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valor do Frete (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_frete}
                  onChange={(e) => setFormData({...formData, valor_frete: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label>Data Prevista de Entrega</Label>
                <Input
                  type="date"
                  value={formData.data_prevista_entrega}
                  onChange={(e) => setFormData({...formData, data_prevista_entrega: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 6 - Financeiro */}
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financeiro e Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Forma de Pagamento</Label>
                <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map(f => (
                      <SelectItem key={f.id} value={f.descricao}>{f.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-slate-50 rounded space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Valor Produtos:</span>
                  <span className="font-bold">R$ {calculoFinanceiro.valor_produtos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Valor Frete:</span>
                  <span>R$ {calculoFinanceiro.valor_frete.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Desconto:</span>
                  <span className="text-red-600">- R$ {calculoFinanceiro.desconto_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TOTAL:</span>
                  <span className="text-green-600">R$ {calculoFinanceiro.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 7 - Documentos */}
        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Observações e Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Observações Públicas (cliente pode ver)</Label>
                <Textarea
                  value={formData.observacoes_publicas}
                  onChange={(e) => setFormData({...formData, observacoes_publicas: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <Label>Observações Internas (uso interno)</Label>
                <Textarea
                  value={formData.observacoes_internas}
                  onChange={(e) => setFormData({...formData, observacoes_internas: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 8 - Revisão */}
        <TabsContent value="revisao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Revisão Final
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Cliente</p>
                  <p className="text-sm">{clienteSelecionado?.nome}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {calculoFinanceiro.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold mb-2">✅ Ações Automáticas ao Confirmar:</p>
                <ul className="text-sm space-y-1">
                  <li>• Criar registro em Pedido.json</li>
                  <li>• Gerar ContaReceber.json (se forma pagamento exigir)</li>
                  <li>• Enviar link para Portal do Cliente</li>
                  <li>• Notificar vendedor via WhatsApp (se configurado)</li>
                </ul>
              </div>

              {validacaoKYC?.status_fiscal === 'Inapta' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    🚨 <strong>PEDIDO BLOQUEADO:</strong> Cliente com situação fiscal irregular na Receita Federal
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={validacaoKYC?.status_fiscal === 'Inapta'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}