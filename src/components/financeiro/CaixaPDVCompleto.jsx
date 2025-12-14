import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  DollarSign,
  ShoppingCart,
  CreditCard,
  FileText,
  Receipt,
  Trash2,
  Plus,
  CheckCircle2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Lock,
  Percent,
  Printer
} from "lucide-react";

export default function CaixaPDVCompleto({ empresaAtual, windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState("venda");
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([{ forma: "Dinheiro", valor: 0, parcelas: 1 }]);
  const [desconto, setDesconto] = useState(0);
  const [tipoDesconto, setTipoDesconto] = useState("valor");
  const [acrescimo, setAcrescimo] = useState(0);
  const [tipoAcrescimo, setTipoAcrescimo] = useState("valor");
  const [emitirNFe, setEmitirNFe] = useState(false);
  const [emitirRecibo, setEmitirRecibo] = useState(true);
  const [emitirBoleto, setEmitirBoleto] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [dialogAbrir, setDialogAbrir] = useState(true);
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list(),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list(),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const { data: movimentos = [] } = useQuery({
    queryKey: ['movimentos-caixa'],
    queryFn: () => base44.entities.CaixaMovimento.list(),
    enabled: caixaAberto,
    refetchInterval: 10000
  });

  const hoje = new Date().toISOString().split('T')[0];
  const movimentosHoje = movimentos.filter(m => {
    const data = new Date(m.data_movimento).toISOString().split('T')[0];
    return data === hoje && !m.cancelado;
  });

  // SALDO SÓ ALTERA COM DINHEIRO
  const totalEntradasDinheiro = movimentosHoje.filter(m => m.tipo_movimento === 'Entrada' && m.forma_pagamento === 'Dinheiro').reduce((s, m) => s + (m.valor || 0), 0);
  const totalSaidasDinheiro = movimentosHoje.filter(m => m.tipo_movimento === 'Saída' && m.forma_pagamento === 'Dinheiro').reduce((s, m) => s + (m.valor || 0), 0);
  const saldoAtual = saldoInicial + totalEntradasDinheiro - totalSaidasDinheiro;

  // Somatória por tipo de pagamento
  const somatoriaFormasPagamento = movimentosHoje.reduce((acc, m) => {
    const forma = m.forma_pagamento || 'Outros';
    if (!acc[forma]) acc[forma] = { entradas: 0, saidas: 0, total: 0 };
    if (m.tipo_movimento === 'Entrada') {
      acc[forma].entradas += m.valor || 0;
      acc[forma].total += m.valor || 0;
    } else if (m.tipo_movimento === 'Saída') {
      acc[forma].saidas += m.valor || 0;
      acc[forma].total -= m.valor || 0;
    }
    return acc;
  }, {});

  const produtosFiltrados = produtos.filter(p =>
    p.descricao?.toLowerCase().includes(buscaProduto.toLowerCase())
  ).slice(0, 30);

  const clientesFiltrados = clientes.filter(c =>
    c.nome?.toLowerCase().includes(buscaCliente.toLowerCase())
  ).slice(0, 5);

  const contasReceberPendentes = contasReceber.filter(c => c.status === 'Pendente');
  const contasPagarPendentes = contasPagar.filter(c => c.status === 'Pendente');
  const pedidosReceber = pedidos.filter(p => p.status === 'Aprovado' || p.status === 'Pronto para Faturar');

  const subtotal = carrinho.reduce((s, i) => s + (i.preco_venda * i.quantidade), 0);
  
  const valorDesconto = tipoDesconto === 'percentual' ? (subtotal * desconto / 100) : desconto;
  const valorAcrescimo = tipoAcrescimo === 'percentual' ? (subtotal * acrescimo / 100) : acrescimo;
  const totalVenda = subtotal - valorDesconto + valorAcrescimo;
  
  const totalPago = formasPagamento.reduce((s, f) => s + (f.valor || 0), 0);
  const troco = totalPago - totalVenda;

  const abrirCaixa = useMutation({
    mutationFn: async (saldo) => {
      await base44.entities.CaixaMovimento.create({
        empresa_id: empresaAtual?.id,
        data_movimento: new Date().toISOString(),
        tipo_movimento: 'Abertura',
        origem: 'Abertura Caixa',
        forma_pagamento: 'Dinheiro',
        valor: saldo,
        descricao: 'Abertura de Caixa',
        usuario_operador_nome: user?.full_name,
        caixa_aberto: true
      });
    },
    onSuccess: () => {
      setCaixaAberto(true);
      setDialogAbrir(false);
      queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
      toast.success("✅ Caixa aberto!");
    }
  });

  const finalizarVenda = useMutation({
    mutationFn: async () => {
      const pedido = await base44.entities.Pedido.create({
        empresa_id: empresaAtual?.id,
        numero_pedido: `PDV-${Date.now()}`,
        tipo: 'Pedido',
        origem_pedido: 'PDV Presencial',
        data_pedido: hoje,
        cliente_nome: clienteSelecionado?.nome || 'Cliente Avulso',
        cliente_id: clienteSelecionado?.id,
        vendedor: user?.full_name,
        itens_revenda: carrinho.map(item => ({
          produto_id: item.id,
          produto_descricao: item.descricao,
          quantidade: item.quantidade,
          valor_unitario: item.preco_venda,
          valor_total: item.preco_venda * item.quantidade
        })),
        valor_produtos: subtotal,
        desconto_geral_pedido_valor: valorDesconto,
        valor_total: totalVenda,
        status: 'Faturado',
        observacoes_publicas: valorAcrescimo > 0 ? `Acréscimo: R$ ${valorAcrescimo.toFixed(2)}` : ''
      });

      // Criar conta a receber se tiver boleto ou pagamento não-dinheiro
      let contaReceber = null;
      if (emitirBoleto || formasPagamento.some(f => f.forma !== 'Dinheiro')) {
        contaReceber = await base44.entities.ContaReceber.create({
          empresa_id: empresaAtual?.id,
          descricao: `Venda PDV ${pedido.numero_pedido}`,
          cliente: clienteSelecionado?.nome || 'Cliente Avulso',
          cliente_id: clienteSelecionado?.id,
          pedido_id: pedido.id,
          valor: totalVenda,
          data_emissao: hoje,
          data_vencimento: hoje,
          status: emitirBoleto ? 'Pendente' : 'Recebido',
          forma_recebimento: formasPagamento.map(f => f.forma).join(', '),
          origem_tipo: 'pedido'
        });
      }

      // Emitir NF-e se solicitado
      if (emitirNFe && clienteSelecionado) {
        await base44.entities.NotaFiscal.create({
          empresa_faturamento_id: empresaAtual?.id,
          numero: `${Date.now()}`,
          serie: '1',
          tipo: 'NF-e (Saída)',
          cliente_fornecedor: clienteSelecionado.nome,
          cliente_fornecedor_id: clienteSelecionado.id,
          pedido_id: pedido.id,
          data_emissao: hoje,
          valor_produtos: subtotal,
          valor_total: totalVenda,
          status: 'Rascunho'
        });
      }

      // Registrar movimentos
      for (const fp of formasPagamento) {
        if (fp.valor > 0) {
          await base44.entities.CaixaMovimento.create({
            empresa_id: empresaAtual?.id,
            data_movimento: new Date().toISOString(),
            tipo_movimento: 'Entrada',
            origem: 'Venda PDV',
            forma_pagamento: fp.forma,
            valor: fp.valor,
            descricao: `Venda ${pedido.numero_pedido} - Cliente: ${clienteSelecionado?.nome || 'Avulso'} - Pagto: ${fp.forma}${fp.parcelas > 1 ? ` (${fp.parcelas}x)` : ''}`,
            pedido_id: pedido.id,
            conta_receber_id: contaReceber?.id,
            usuario_operador_nome: user?.full_name,
            caixa_aberto: true
          });
        }
      }

      return { pedido, contaReceber };
    },
    onSuccess: ({ pedido }) => {
      setCarrinho([]);
      setFormasPagamento([{ forma: "Dinheiro", valor: 0, parcelas: 1 }]);
      setClienteSelecionado(null);
      setDesconto(0);
      setAcrescimo(0);
      setEmitirNFe(false);
      setEmitirBoleto(false);
      queryClient.invalidateQueries();
      
      if (troco > 0) {
        toast.success(`✅ Venda ${pedido.numero_pedido} finalizada!\n🟢 TROCO: R$ ${troco.toFixed(2)}`);
      } else {
        toast.success(`✅ Venda ${pedido.numero_pedido} finalizada!`);
      }
    }
  });

  const liquidarTitulo = useMutation({
    mutationFn: async ({ titulo, tipo, forma }) => {
      if (tipo === 'receber') {
        await base44.entities.ContaReceber.update(titulo.id, {
          status: 'Recebido',
          data_recebimento: hoje,
          valor_recebido: titulo.valor,
          forma_recebimento: forma
        });

        await base44.entities.CaixaMovimento.create({
          empresa_id: empresaAtual?.id,
          data_movimento: new Date().toISOString(),
          tipo_movimento: 'Entrada',
          origem: 'Liquidação Receber',
          forma_pagamento: forma,
          valor: titulo.valor,
          descricao: `Recebimento: ${titulo.cliente}`,
          conta_receber_id: titulo.id,
          usuario_operador_nome: user?.full_name,
          caixa_aberto: true
        });
      } else {
        await base44.entities.ContaPagar.update(titulo.id, {
          status: 'Pago',
          data_pagamento: hoje,
          valor_pago: titulo.valor,
          forma_pagamento: forma
        });

        await base44.entities.CaixaMovimento.create({
          empresa_id: empresaAtual?.id,
          data_movimento: new Date().toISOString(),
          tipo_movimento: 'Saída',
          origem: 'Liquidação Pagar',
          forma_pagamento: forma,
          valor: titulo.valor,
          descricao: `Pagamento: ${titulo.fornecedor}`,
          conta_pagar_id: titulo.id,
          usuario_operador_nome: user?.full_name,
          caixa_aberto: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("✅ Liquidado!");
    }
  });

  const fecharCaixa = useMutation({
    mutationFn: async () => {
      await base44.entities.CaixaMovimento.create({
        empresa_id: empresaAtual?.id,
        data_movimento: new Date().toISOString(),
        tipo_movimento: 'Fechamento',
        origem: 'Fechamento Caixa',
        forma_pagamento: 'Dinheiro',
        valor: saldoAtual,
        descricao: `Fechamento - Saldo: R$ ${saldoAtual.toFixed(2)}`,
        usuario_operador_nome: user?.full_name,
        caixa_aberto: false
      });
    },
    onSuccess: () => {
      setCaixaAberto(false);
      setDialogAbrir(true);
      queryClient.invalidateQueries();
      toast.success("✅ Caixa fechado!");
    }
  });

  if (!caixaAberto) {
    return (
      <>
        <div className={windowMode ? "w-full h-full flex items-center justify-center p-4" : "p-6"}>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Abrir Caixa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <p className="text-sm"><strong>Operador:</strong> {user?.full_name}</p>
                  <p className="text-sm"><strong>Empresa:</strong> {empresaAtual?.nome_fantasia || empresaAtual?.razao_social}</p>
                </CardContent>
              </Card>
              <div>
                <Label>Saldo Inicial em Dinheiro (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="text-lg"
                />
                <p className="text-xs text-slate-500 mt-1">Digite o valor em dinheiro para iniciar</p>
              </div>
              <Button
                onClick={() => abrirCaixa.mutate(saldoInicial)}
                className="w-full bg-emerald-600 h-10"
                disabled={abrirCaixa.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Abrir Caixa
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-hidden" : "p-4"}>
      <div className={windowMode ? "flex-1 flex flex-col overflow-hidden p-2" : ""}>
        
        {/* HEADER */}
        <div className="mb-2 p-2 bg-white rounded border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-xs font-bold">Caixa PDV</p>
              <p className="text-xs text-slate-500">{user?.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-slate-500">Saldo</p>
              <p className="text-sm font-bold text-emerald-600">R$ {saldoAtual.toFixed(2)}</p>
            </div>
            <Button
              onClick={() => {
                if (confirm(`Fechar caixa?\nSaldo: R$ ${saldoAtual.toFixed(2)}`)) {
                  fecharCaixa.mutate();
                }
              }}
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2"
            >
              Fechar
            </Button>
          </div>
        </div>

        {/* INDICADORES */}
        <div className="grid grid-cols-4 gap-1 mb-2">
          <Card className="border">
            <CardContent className="p-2">
              <p className="text-xs text-blue-700">Vendas</p>
              <p className="text-sm font-bold">{movimentosHoje.filter(m => m.origem === 'Venda PDV').length}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-2">
              <p className="text-xs text-green-700">Entradas 💵</p>
              <p className="text-sm font-bold">R$ {totalEntradasDinheiro.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-2">
              <p className="text-xs text-red-700">Saídas 💵</p>
              <p className="text-sm font-bold">R$ {totalSaidasDinheiro.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-2">
              <p className="text-xs text-slate-700">Movimentos</p>
              <p className="text-sm font-bold">{movimentosHoje.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-5 h-8 flex-shrink-0">
            <TabsTrigger value="venda" className="text-xs p-1">Venda</TabsTrigger>
            <TabsTrigger value="pedidos" className="text-xs p-1">Pedidos</TabsTrigger>
            <TabsTrigger value="receber" className="text-xs p-1">Receber</TabsTrigger>
            <TabsTrigger value="pagar" className="text-xs p-1">Pagar</TabsTrigger>
            <TabsTrigger value="movimentos" className="text-xs p-1">Movimentos</TabsTrigger>
          </TabsList>

          {/* VENDA */}
          <TabsContent value="venda" className="flex-1 overflow-hidden m-0 mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
              <Card className="lg:col-span-2 flex flex-col overflow-hidden border">
                <CardHeader className="p-2 flex-shrink-0 border-b">
                  <Input
                    placeholder="🔍 Buscar produto..."
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    className="h-8 text-sm"
                  />
                </CardHeader>
                <CardContent className="p-2 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    {produtosFiltrados.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          const existe = carrinho.find(i => i.id === p.id);
                          if (existe) {
                            setCarrinho(carrinho.map(i => i.id === p.id ? {...i, quantidade: i.quantidade + 1} : i));
                          } else {
                            setCarrinho([...carrinho, {...p, quantidade: 1}]);
                          }
                        }}
                        className="p-3 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 bg-white text-left transition-all"
                      >
                        <p className="text-sm font-semibold truncate">{p.descricao}</p>
                        <p className="text-sm font-bold text-blue-600 mt-1">R$ {(p.preco_venda || 0).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">Estoque: {p.estoque_atual || 0}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col overflow-hidden border">
                <CardHeader className="p-2 flex-shrink-0 border-b bg-slate-50">
                  <p className="text-sm font-bold">🛒 Carrinho ({carrinho.length} itens)</p>
                </CardHeader>
                <CardContent className="p-2 space-y-2 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  <div className="space-y-2 max-h-32 overflow-auto">
                    {carrinho.length === 0 ? (
                      <div className="text-center py-4 text-slate-400">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">Carrinho vazio</p>
                      </div>
                    ) : (
                      carrinho.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white border rounded-lg">
                          <div className="flex-1 min-w-0 mr-2">
                            <p className="text-sm font-medium truncate">{item.descricao}</p>
                            <div className="flex gap-2 mt-1 items-center">
                              <Button size="sm" variant="outline" onClick={() => setCarrinho(carrinho.map(i => i.id === item.id ? {...i, quantidade: i.quantidade - 1} : i).filter(i => i.quantidade > 0))} className="h-6 w-6 p-0">-</Button>
                              <span className="text-sm font-bold w-8 text-center">{item.quantidade}</span>
                              <Button size="sm" variant="outline" onClick={() => setCarrinho(carrinho.map(i => i.id === item.id ? {...i, quantidade: i.quantidade + 1} : i))} className="h-6 w-6 p-0">+</Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">R$ {item.preco_venda.toFixed(2)}</p>
                            <p className="text-sm font-bold text-blue-600">R$ {(item.preco_venda * item.quantidade).toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t pt-2">
                    <Input
                      placeholder="Cliente..."
                      value={buscaCliente}
                      onChange={(e) => setBuscaCliente(e.target.value)}
                      className="h-6 text-xs mb-1"
                    />
                    {buscaCliente && clientesFiltrados.length > 0 && (
                      <div className="max-h-16 overflow-auto border rounded bg-white text-xs">
                        {clientesFiltrados.map(c => (
                          <button key={c.id} onClick={() => { setClienteSelecionado(c); setBuscaCliente(''); }} className="w-full p-1 hover:bg-blue-50 text-left">
                            {c.nome}
                          </button>
                        ))}
                      </div>
                    )}
                    {clienteSelecionado && <Badge className="text-xs mt-1">{clienteSelecionado.nome}</Badge>}
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Subtotal:</span>
                      <span className="text-sm font-bold">R$ {subtotal.toFixed(2)}</span>
                    </div>

                    {/* DESCONTO E ACRÉSCIMO */}
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div>
                        <Label className="text-xs">Desconto</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={desconto}
                            onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                            className="h-6 text-xs"
                          />
                          <Select value={tipoDesconto} onValueChange={setTipoDesconto}>
                            <SelectTrigger className="h-6 w-12 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="valor">R$</SelectItem>
                              <SelectItem value="percentual">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Acréscimo</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={acrescimo}
                            onChange={(e) => setAcrescimo(parseFloat(e.target.value) || 0)}
                            className="h-6 text-xs"
                          />
                          <Select value={tipoAcrescimo} onValueChange={setTipoAcrescimo}>
                            <SelectTrigger className="h-6 w-12 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="valor">R$</SelectItem>
                              <SelectItem value="percentual">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between mb-2 pb-2 border-b">
                      <span className="text-sm font-semibold">TOTAL:</span>
                      <span className="text-xl font-bold text-blue-600">R$ {totalVenda.toFixed(2)}</span>
                    </div>

                    {/* OPÇÕES DE EMISSÃO */}
                    <div className="space-y-1 mb-2 p-2 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={emitirRecibo} onCheckedChange={setEmitirRecibo} id="recibo" />
                        <Label htmlFor="recibo" className="text-xs">Emitir Recibo</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={emitirNFe} onCheckedChange={setEmitirNFe} id="nfe" />
                        <Label htmlFor="nfe" className="text-xs">Emitir NF-e</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={emitirBoleto} onCheckedChange={setEmitirBoleto} id="boleto" />
                        <Label htmlFor="boleto" className="text-xs">Gerar Boleto</Label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {formasPagamento.map((fp, idx) => (
                        <div key={idx} className="flex gap-1 items-end">
                          <div className="flex-1">
                            <Select value={fp.forma} onValueChange={(v) => {
                              const novas = [...formasPagamento];
                              novas[idx].forma = v;
                              setFormasPagamento(novas);
                            }}>
                              <SelectTrigger className="h-6 text-xs">
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
                          <Input
                            type="number"
                            step="0.01"
                            value={fp.valor}
                            onChange={(e) => {
                              const novas = [...formasPagamento];
                              novas[idx].valor = parseFloat(e.target.value) || 0;
                              setFormasPagamento(novas);
                            }}
                            placeholder="Valor"
                            className="h-6 w-16 text-xs"
                          />
                          {(fp.forma === 'Cartão Crédito' || fp.forma === 'Cartão Débito') && (
                            <Input
                              type="number"
                              min="1"
                              value={fp.parcelas || 1}
                              onChange={(e) => {
                                const novas = [...formasPagamento];
                                novas[idx].parcelas = parseInt(e.target.value) || 1;
                                setFormasPagamento(novas);
                              }}
                              placeholder="Parc."
                              className="h-6 w-12 text-xs"
                            />
                          )}
                          {formasPagamento.length > 1 && (
                            <Button size="sm" variant="ghost" onClick={() => setFormasPagamento(formasPagamento.filter((_, i) => i !== idx))} className="h-6 w-6 p-0">
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => setFormasPagamento([...formasPagamento, { forma: "PIX", valor: 0, parcelas: 1 }])} className="h-6 text-xs w-full">
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar Forma
                      </Button>
                    </div>

                    {totalPago !== totalVenda && (
                      <div className="bg-slate-100 rounded p-1 text-xs mt-1">
                        {totalPago > totalVenda ? (
                          <p className="text-green-600 font-bold">🟢 TROCO: R$ {troco.toFixed(2)}</p>
                        ) : (
                          <p className="text-red-600 font-bold">🔴 FALTA: R$ {(totalVenda - totalPago).toFixed(2)}</p>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={() => finalizarVenda.mutate()}
                      disabled={carrinho.length === 0 || totalPago < totalVenda}
                      className="w-full bg-emerald-600 h-8 text-xs mt-2"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Finalizar Venda
                    </Button>
                    <Button
                      onClick={() => {
                        setCarrinho([]);
                        setClienteSelecionado(null);
                        setFormasPagamento([{ forma: "Dinheiro", valor: 0, parcelas: 1 }]);
                        setDesconto(0);
                        setAcrescimo(0);
                      }}
                      variant="outline"
                      className="w-full h-6 text-xs mt-1"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Limpar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RECEBER PEDIDOS */}
          <TabsContent value="pedidos" className="overflow-hidden m-0 mt-2">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardContent className="p-0 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs p-2">Pedido</TableHead>
                      <TableHead className="text-xs p-2">Cliente</TableHead>
                      <TableHead className="text-xs p-2">Valor</TableHead>
                      <TableHead className="text-xs p-2">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosReceber.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs p-2">{p.numero_pedido}</TableCell>
                        <TableCell className="text-xs p-2">{p.cliente_nome}</TableCell>
                        <TableCell className="text-xs p-2 font-bold">R$ {(p.valor_total || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-xs p-2">
                          <Button size="sm" className="h-6 text-xs" onClick={() => {
                            liquidarTitulo.mutate({ titulo: { id: p.id, cliente: p.cliente_nome, valor: p.valor_total }, tipo: 'receber', forma: 'Dinheiro' });
                          }}>
                            Receber
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RECEBER */}
          <TabsContent value="receber" className="overflow-hidden m-0 mt-2">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardContent className="p-0 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs p-2">Cliente</TableHead>
                      <TableHead className="text-xs p-2">Descrição</TableHead>
                      <TableHead className="text-xs p-2">Valor</TableHead>
                      <TableHead className="text-xs p-2">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasReceberPendentes.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs p-2">{c.cliente}</TableCell>
                        <TableCell className="text-xs p-2 truncate max-w-[150px]">{c.descricao}</TableCell>
                        <TableCell className="text-xs p-2 font-bold text-green-600">R$ {(c.valor || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-xs p-2">
                          <div className="flex gap-1">
                            <Button size="sm" className="h-6 text-xs bg-green-600" onClick={() => liquidarTitulo.mutate({ titulo: c, tipo: 'receber', forma: 'Dinheiro' })}>
                              💵
                            </Button>
                            <Button size="sm" className="h-6 text-xs bg-green-600" onClick={() => liquidarTitulo.mutate({ titulo: c, tipo: 'receber', forma: 'PIX' })}>
                              PIX
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAGAR */}
          <TabsContent value="pagar" className="overflow-hidden m-0 mt-2">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardContent className="p-0 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs p-2">Fornecedor</TableHead>
                      <TableHead className="text-xs p-2">Descrição</TableHead>
                      <TableHead className="text-xs p-2">Valor</TableHead>
                      <TableHead className="text-xs p-2">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasPagarPendentes.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs p-2">{c.fornecedor}</TableCell>
                        <TableCell className="text-xs p-2 truncate max-w-[150px]">{c.descricao}</TableCell>
                        <TableCell className="text-xs p-2 font-bold text-red-600">R$ {(c.valor || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-xs p-2">
                          <div className="flex gap-1">
                            <Button size="sm" className="h-6 text-xs bg-red-600" onClick={() => liquidarTitulo.mutate({ titulo: c, tipo: 'pagar', forma: 'Dinheiro' })}>
                              💵
                            </Button>
                            <Button size="sm" className="h-6 text-xs bg-red-600" onClick={() => liquidarTitulo.mutate({ titulo: c, tipo: 'pagar', forma: 'PIX' })}>
                              PIX
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MOVIMENTOS */}
          <TabsContent value="movimentos" className="overflow-hidden m-0 mt-2 flex flex-col h-full">
            <Card className="flex flex-col overflow-hidden mb-2">
              <CardHeader className="p-2">
                <CardTitle className="text-xs">Somatória por Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(somatoriaFormasPagamento).map(([forma, valores]) => (
                    <Card key={forma} className="border">
                      <CardContent className="p-2">
                        <p className="text-xs font-semibold">{forma}</p>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-green-600">+R$ {valores.entradas.toFixed(2)}</span>
                          <span className="text-red-600">-R$ {valores.saidas.toFixed(2)}</span>
                        </div>
                        <p className={`text-xs font-bold mt-1 ${valores.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Total: R$ {valores.total.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardContent className="p-0 overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs p-2">Hora</TableHead>
                      <TableHead className="text-xs p-2">Tipo</TableHead>
                      <TableHead className="text-xs p-2">Descrição</TableHead>
                      <TableHead className="text-xs p-2 text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentosHoje.map(m => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs p-2">
                          {new Date(m.data_movimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-xs p-2">
                          <Badge className={`text-xs ${m.tipo_movimento === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {m.tipo_movimento}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs p-2">{m.descricao}</TableCell>
                        <TableCell className={`text-xs p-2 text-right font-bold ${m.tipo_movimento === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                          {m.tipo_movimento === 'Entrada' ? '+' : '-'}R$ {(m.valor || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}