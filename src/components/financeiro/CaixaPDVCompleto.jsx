import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  Printer,
  FileText,
  Receipt,
  Barcode,
  Trash2,
  Plus,
  CheckCircle2,
  Wallet,
  Calculator,
  User,
  Package,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Send
} from "lucide-react";

/**
 * 💰 CAIXA PDV COMPLETO V21.8
 * Sistema de Ponto de Venda com funcionalidades completas:
 * - Multi-operador
 * - Liquidação Receber e Pagar Unificada
 * - Emissão de Boleto, NF-e e Recibo
 * - Fechamento de vendas (retirada/presencial)
 * - w-full e h-full responsivo
 */
export default function CaixaPDVCompleto({ 
  operadorId, 
  empresaAtual,
  windowMode = false 
}) {
  const [abaAtiva, setAbaAtiva] = useState("venda");
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("Dinheiro");
  const [valorPago, setValorPago] = useState(0);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [documentoFinal, setDocumentoFinal] = useState(null);
  const [dialogFinalizacao, setDialogFinalizacao] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("recibo");
  
  const queryClient = useQueryClient();

  // Queries
  const { data: operador } = useQuery({
    queryKey: ['operador-caixa', operadorId],
    queryFn: () => operadorId ? base44.entities.OperadorCaixa.filter({ id: operadorId }) : null,
    enabled: !!operadorId
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-pdv'],
    queryFn: () => base44.entities.Produto.filter({ 
      status: 'Ativo',
      empresa_id: empresaAtual?.id 
    }),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-pdv'],
    queryFn: () => base44.entities.Cliente.filter({ status: 'Ativo' }),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list('-data_vencimento'),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento'),
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento'],
    queryFn: () => base44.entities.FormaPagamento.list(),
  });

  // Filtros
  const produtosFiltrados = produtos.filter(p =>
    p.descricao?.toLowerCase().includes(buscaProduto.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(buscaProduto.toLowerCase())
  );

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    c.cpf?.includes(buscaCliente) ||
    c.cnpj?.includes(buscaCliente)
  );

  const contasReceberPendentes = contasReceber.filter(c => 
    c.status === 'Pendente' || c.status === 'Atrasado'
  );

  const contasPagarPendentes = contasPagar.filter(c => 
    c.status === 'Pendente' || c.status === 'Aprovado'
  );

  // Cálculos do carrinho
  const totalCarrinho = carrinho.reduce((sum, item) => 
    sum + (item.preco_venda * item.quantidade), 0
  );

  const troco = valorPago - totalCarrinho;

  // Adicionar produto ao carrinho
  const adicionarProduto = (produto) => {
    const itemExistente = carrinho.find(i => i.id === produto.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(i =>
        i.id === produto.id 
          ? { ...i, quantidade: i.quantidade + 1 }
          : i
      ));
    } else {
      setCarrinho([...carrinho, { 
        ...produto, 
        quantidade: 1,
        preco_venda: produto.preco_venda || 0
      }]);
    }
  };

  const removerProduto = (produtoId) => {
    setCarrinho(carrinho.filter(i => i.id !== produtoId));
  };

  const alterarQuantidade = (produtoId, quantidade) => {
    if (quantidade <= 0) {
      removerProduto(produtoId);
    } else {
      setCarrinho(carrinho.map(i =>
        i.id === produtoId ? { ...i, quantidade } : i
      ));
    }
  };

  // Finalizar venda
  const finalizarVendaMutation = useMutation({
    mutationFn: async ({ emitirNFe, emitirBoleto, gerarRecibo }) => {
      // 1. Criar pedido
      const pedido = await base44.entities.Pedido.create({
        empresa_id: empresaAtual?.id,
        numero_pedido: `PDV-${Date.now()}`,
        tipo: 'Pedido',
        tipo_pedido: 'Revenda',
        origem_pedido: 'PDV Presencial',
        canal_preferencial: 'PDV Presencial',
        data_pedido: new Date().toISOString().split('T')[0],
        cliente_id: clienteSelecionado?.id,
        cliente_nome: clienteSelecionado?.nome || 'Cliente Avulso',
        cliente_cpf_cnpj: clienteSelecionado?.cpf || clienteSelecionado?.cnpj || '',
        vendedor: operador?.[0]?.usuario_nome || 'PDV',
        vendedor_id: operador?.[0]?.usuario_id,
        itens_revenda: carrinho.map(item => ({
          produto_id: item.id,
          produto_descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade_principal || 'UN',
          valor_unitario: item.preco_venda,
          valor_total: item.preco_venda * item.quantidade
        })),
        valor_produtos: totalCarrinho,
        valor_total: totalCarrinho,
        forma_pagamento: formaPagamento,
        status: 'Aprovado',
        tipo_frete: 'Retirada'
      });

      // 2. Criar conta a receber (se necessário)
      let contaReceber = null;
      if (formaPagamento !== 'Dinheiro') {
        contaReceber = await base44.entities.ContaReceber.create({
          empresa_id: empresaAtual?.id,
          descricao: `Venda PDV ${pedido.numero_pedido}`,
          cliente: clienteSelecionado?.nome || 'Cliente Avulso',
          cliente_id: clienteSelecionado?.id,
          pedido_id: pedido.id,
          valor: totalCarrinho,
          data_emissao: new Date().toISOString().split('T')[0],
          data_vencimento: new Date().toISOString().split('T')[0],
          status: formaPagamento === 'Dinheiro' ? 'Recebido' : 'Pendente',
          forma_recebimento: formaPagamento,
          canal_origem: 'PDV Presencial',
          origem_tipo: 'pedido'
        });
      }

      // 3. Registrar movimento de caixa
      await base44.entities.CaixaMovimento.create({
        empresa_id: empresaAtual?.id,
        data_movimento: new Date().toISOString(),
        tipo_movimento: 'Entrada',
        origem: 'Venda PDV',
        forma_pagamento: formaPagamento,
        valor: totalCarrinho,
        descricao: `Venda ${pedido.numero_pedido} - ${clienteSelecionado?.nome || 'Cliente Avulso'}`,
        pedido_id: pedido.id,
        conta_receber_id: contaReceber?.id,
        usuario_operador_id: operador?.[0]?.usuario_id,
        usuario_operador_nome: operador?.[0]?.usuario_nome,
        caixa_aberto: true
      });

      // 4. Emitir NF-e (se solicitado)
      let nfe = null;
      if (emitirNFe && clienteSelecionado) {
        nfe = await base44.entities.NotaFiscal.create({
          empresa_faturamento_id: empresaAtual?.id,
          numero: `${Date.now()}`,
          serie: '1',
          tipo: 'NF-e (Saída)',
          cliente_fornecedor: clienteSelecionado.nome,
          cliente_fornecedor_id: clienteSelecionado.id,
          cliente_cpf_cnpj: clienteSelecionado.cpf || clienteSelecionado.cnpj,
          pedido_id: pedido.id,
          data_emissao: new Date().toISOString().split('T')[0],
          valor_produtos: totalCarrinho,
          valor_total: totalCarrinho,
          itens: carrinho.map((item, idx) => ({
            numero_item: idx + 1,
            produto_id: item.id,
            codigo_produto: item.codigo,
            descricao: item.descricao,
            quantidade: item.quantidade,
            unidade: item.unidade_principal || 'UN',
            valor_unitario: item.preco_venda,
            valor_total: item.preco_venda * item.quantidade
          })),
          status: 'Rascunho'
        });
      }

      // 5. Gerar boleto (se solicitado)
      let boleto = null;
      if (emitirBoleto && contaReceber) {
        // Simulação de geração de boleto
        boleto = {
          linha_digitavel: `34191.09008 ${Date.now()} 1 99990000${String(totalCarrinho * 100).padStart(10, '0')}`,
          url_boleto: `https://boleto.simulado.com/${contaReceber.id}`
        };

        await base44.entities.ContaReceber.update(contaReceber.id, {
          forma_cobranca: 'Boleto',
          boleto_linha_digitavel: boleto.linha_digitavel,
          boleto_url: boleto.url_boleto,
          status_cobranca: 'gerada_simulada'
        });
      }

      return { pedido, contaReceber, nfe, boleto, gerarRecibo };
    },
    onSuccess: ({ pedido, nfe, boleto, gerarRecibo }) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
      
      setDocumentoFinal({ pedido, nfe, boleto, gerarRecibo });
      setDialogFinalizacao(true);
      
      // Limpar carrinho
      setCarrinho([]);
      setClienteSelecionado(null);
      setValorPago(0);
      
      toast.success("✅ Venda finalizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao finalizar venda: " + error.message);
    }
  });

  // Liquidar título
  const liquidarTituloMutation = useMutation({
    mutationFn: async ({ titulo, tipo, forma }) => {
      if (tipo === 'receber') {
        await base44.entities.ContaReceber.update(titulo.id, {
          status: 'Recebido',
          data_recebimento: new Date().toISOString(),
          valor_recebido: titulo.valor,
          forma_recebimento: forma
        });

        await base44.entities.CaixaMovimento.create({
          empresa_id: empresaAtual?.id,
          data_movimento: new Date().toISOString(),
          tipo_movimento: 'Entrada',
          origem: 'Liquidação Título Receber',
          forma_pagamento: forma,
          valor: titulo.valor,
          descricao: `Recebimento: ${titulo.cliente} - ${titulo.descricao}`,
          conta_receber_id: titulo.id,
          usuario_operador_id: operador?.[0]?.usuario_id,
          usuario_operador_nome: operador?.[0]?.usuario_nome,
          caixa_aberto: true
        });
      } else {
        await base44.entities.ContaPagar.update(titulo.id, {
          status: 'Pago',
          data_pagamento: new Date().toISOString(),
          valor_pago: titulo.valor,
          forma_pagamento: forma
        });

        await base44.entities.CaixaMovimento.create({
          empresa_id: empresaAtual?.id,
          data_movimento: new Date().toISOString(),
          tipo_movimento: 'Saída',
          origem: 'Liquidação Título Pagar',
          forma_pagamento: forma,
          valor: titulo.valor,
          descricao: `Pagamento: ${titulo.fornecedor} - ${titulo.descricao}`,
          conta_pagar_id: titulo.id,
          usuario_operador_id: operador?.[0]?.usuario_id,
          usuario_operador_nome: operador?.[0]?.usuario_nome,
          caixa_aberto: true
        });
      }
    },
    onSuccess: (_, { tipo }) => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
      toast.success(`✅ Título ${tipo === 'receber' ? 'recebido' : 'pago'}!`);
    }
  });

  const containerClass = windowMode 
    ? "w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50" 
    : "min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6";

  const contentClass = windowMode 
    ? "flex-1 overflow-auto p-6" 
    : "";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {/* HEADER PDV */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Caixa PDV</h1>
                <p className="text-sm text-slate-600">
                  Operador: {operador?.[0]?.usuario_nome || 'Sistema'} • {operador?.[0]?.nome_caixa || 'Caixa Principal'}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              Caixa Aberto
            </Badge>
          </div>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
          <TabsList className="bg-white border shadow-sm grid grid-cols-3">
            <TabsTrigger value="venda" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Nova Venda
            </TabsTrigger>
            <TabsTrigger value="liquidar-receber" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Liquidar Receber ({contasReceberPendentes.length})
            </TabsTrigger>
            <TabsTrigger value="liquidar-pagar" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <TrendingDown className="w-4 h-4 mr-2" />
              Liquidar Pagar ({contasPagarPendentes.length})
            </TabsTrigger>
          </TabsList>

          {/* ABA: NOVA VENDA */}
          <TabsContent value="venda">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* COLUNA 1: PRODUTOS */}
              <Card className="lg:col-span-2">
                <CardHeader className="bg-slate-50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Produtos</CardTitle>
                    <Input
                      placeholder="🔍 Buscar produto..."
                      value={buscaProduto}
                      onChange={(e) => setBuscaProduto(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 max-h-96 overflow-auto">
                  <div className="grid grid-cols-2 gap-3">
                    {produtosFiltrados.slice(0, 20).map(produto => (
                      <button
                        key={produto.id}
                        onClick={() => adicionarProduto(produto)}
                        className="p-4 border-2 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left bg-white"
                      >
                        <p className="font-semibold text-sm truncate">{produto.descricao}</p>
                        <p className="text-xs text-slate-500 mb-2">{produto.codigo}</p>
                        <p className="text-lg font-bold text-blue-600">
                          R$ {(produto.preco_venda || 0).toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* COLUNA 2: CARRINHO E PAGAMENTO */}
              <Card>
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Carrinho ({carrinho.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Itens do carrinho */}
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {carrinho.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.descricao}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                              className="h-6 w-6 p-0"
                            >
                              -
                            </Button>
                            <span className="text-sm font-semibold w-8 text-center">{item.quantidade}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                              className="h-6 w-6 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            R$ {(item.preco_venda * item.quantidade).toFixed(2)}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removerProduto(item.id)}
                            className="h-6 p-0 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cliente */}
                  <div className="border-t pt-4">
                    <Label className="mb-2 block">Cliente</Label>
                    <Input
                      placeholder="🔍 Buscar cliente..."
                      value={buscaCliente}
                      onChange={(e) => setBuscaCliente(e.target.value)}
                      className="mb-2"
                    />
                    {buscaCliente && (
                      <div className="max-h-32 overflow-auto border rounded bg-white">
                        {clientesFiltrados.slice(0, 5).map(cliente => (
                          <button
                            key={cliente.id}
                            onClick={() => {
                              setClienteSelecionado(cliente);
                              setBuscaCliente('');
                            }}
                            className="w-full p-2 hover:bg-blue-50 text-left text-sm"
                          >
                            {cliente.nome}
                          </button>
                        ))}
                      </div>
                    )}
                    {clienteSelecionado && (
                      <Badge className="mt-2">{clienteSelecionado.nome}</Badge>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">TOTAL:</span>
                      <span className="text-3xl font-bold text-blue-600">
                        R$ {totalCarrinho.toFixed(2)}
                      </span>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="space-y-3">
                      <div>
                        <Label>Forma de Pagamento</Label>
                        <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dinheiro">💵 Dinheiro</SelectItem>
                            <SelectItem value="PIX">⚡ PIX</SelectItem>
                            <SelectItem value="Cartão Débito">💳 Débito</SelectItem>
                            <SelectItem value="Cartão Crédito">💳 Crédito</SelectItem>
                            <SelectItem value="Boleto">📄 Boleto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formaPagamento === 'Dinheiro' && (
                        <>
                          <div>
                            <Label>Valor Pago</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={valorPago}
                              onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                            />
                          </div>
                          {valorPago > totalCarrinho && (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              <p className="text-sm text-green-700">Troco:</p>
                              <p className="text-2xl font-bold text-green-600">
                                R$ {troco.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Tipo de Documento */}
                    <div className="mt-4">
                      <Label>Documento a Emitir</Label>
                      <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recibo">📄 Recibo</SelectItem>
                          <SelectItem value="nfe">📋 NF-e + Recibo</SelectItem>
                          <SelectItem value="boleto">📄 Boleto</SelectItem>
                          <SelectItem value="completo">📋 NF-e + Boleto + Recibo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botão Finalizar */}
                    <Button
                      onClick={() => finalizarVendaMutation.mutate({
                        emitirNFe: tipoDocumento === 'nfe' || tipoDocumento === 'completo',
                        emitirBoleto: tipoDocumento === 'boleto' || tipoDocumento === 'completo',
                        gerarRecibo: true
                      })}
                      disabled={carrinho.length === 0 || finalizarVendaMutation.isPending}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 mt-4 h-14 text-lg"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      {finalizarVendaMutation.isPending ? 'Processando...' : 'Finalizar Venda'}
                    </Button>

                    <Button
                      onClick={() => setCarrinho([])}
                      variant="outline"
                      className="w-full mt-2"
                      disabled={carrinho.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Carrinho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA: LIQUIDAR RECEBER */}
          <TabsContent value="liquidar-receber">
            <Card>
              <CardHeader className="bg-green-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Liquidar Contas a Receber
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Canal Origem</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasReceberPendentes.map(conta => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.cliente}</TableCell>
                        <TableCell className="max-w-xs truncate">{conta.descricao}</TableCell>
                        <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          R$ {(conta.valor || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {conta.canal_origem || 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {formasPagamento.slice(0, 3).map(forma => (
                              <Button
                                key={forma.id}
                                size="sm"
                                onClick={() => liquidarTituloMutation.mutate({
                                  titulo: conta,
                                  tipo: 'receber',
                                  forma: forma.nome
                                })}
                                disabled={liquidarTituloMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {forma.nome}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {contasReceberPendentes.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma conta a receber pendente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: LIQUIDAR PAGAR */}
          <TabsContent value="liquidar-pagar">
            <Card>
              <CardHeader className="bg-red-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Liquidar Contas a Pagar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasPagarPendentes.map(conta => (
                      <TableRow key={conta.id}>
                        <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                        <TableCell className="max-w-xs truncate">{conta.descricao}</TableCell>
                        <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-bold text-red-600">
                          R$ {(conta.valor || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {formasPagamento.slice(0, 3).map(forma => (
                              <Button
                                key={forma.id}
                                size="sm"
                                onClick={() => liquidarTituloMutation.mutate({
                                  titulo: conta,
                                  tipo: 'pagar',
                                  forma: forma.nome
                                })}
                                disabled={liquidarTituloMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {forma.nome}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {contasPagarPendentes.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhuma conta a pagar pendente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* DIALOG DE FINALIZAÇÃO */}
        <Dialog open={dialogFinalizacao} onOpenChange={setDialogFinalizacao}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Venda Finalizada com Sucesso!
              </DialogTitle>
            </DialogHeader>

            {documentoFinal && (
              <div className="space-y-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-700">Pedido:</span>
                        <span className="font-bold">{documentoFinal.pedido?.numero_pedido}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Valor:</span>
                        <span className="font-bold text-green-600">
                          R$ {(documentoFinal.pedido?.valor_total || 0).toFixed(2)}
                        </span>
                      </div>
                      {formaPagamento === 'Dinheiro' && troco > 0 && (
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-lg font-semibold">Troco:</span>
                          <span className="text-2xl font-bold text-orange-600">
                            R$ {troco.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Botões de Impressão */}
                <div className="grid grid-cols-2 gap-3">
                  {documentoFinal.gerarRecibo && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      Imprimir Recibo
                    </Button>
                  )}
                  {documentoFinal.nfe && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Imprimir NF-e
                    </Button>
                  )}
                  {documentoFinal.boleto && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Barcode className="w-4 h-4" />
                      Imprimir Boleto
                    </Button>
                  )}
                  <Button 
                    onClick={() => setDialogFinalizacao(false)}
                    className="bg-blue-600 hover:bg-blue-700 col-span-2"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Nova Venda
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}