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
  Lock
} from "lucide-react";

export default function CaixaPDVCompleto({ empresaAtual, windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState("venda");
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [formasPagamento, setFormasPagamento] = useState([{ forma: "Dinheiro", valor: 0 }]);
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

  const totalEntradas = movimentosHoje.filter(m => m.tipo_movimento === 'Entrada').reduce((s, m) => s + (m.valor || 0), 0);
  const totalSaidas = movimentosHoje.filter(m => m.tipo_movimento === 'Saída').reduce((s, m) => s + (m.valor || 0), 0);
  const saldoAtual = saldoInicial + totalEntradas - totalSaidas;

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
  const totalPago = formasPagamento.reduce((s, f) => s + (f.valor || 0), 0);
  const troco = totalPago - subtotal;

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
        valor_total: subtotal,
        status: 'Faturado'
      });

      for (const fp of formasPagamento) {
        if (fp.valor > 0) {
          await base44.entities.CaixaMovimento.create({
            empresa_id: empresaAtual?.id,
            data_movimento: new Date().toISOString(),
            tipo_movimento: 'Entrada',
            origem: 'Venda PDV',
            forma_pagamento: fp.forma,
            valor: fp.valor,
            descricao: `Venda ${pedido.numero_pedido}`,
            pedido_id: pedido.id,
            usuario_operador_nome: user?.full_name,
            caixa_aberto: true
          });
        }
      }
    },
    onSuccess: () => {
      setCarrinho([]);
      setFormasPagamento([{ forma: "Dinheiro", valor: 0 }]);
      setClienteSelecionado(null);
      queryClient.invalidateQueries();
      toast.success("✅ Venda finalizada!");
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
      <div className={windowMode ? "w-full h-full flex items-center justify-center p-4" : "p-6"}>
        <Dialog open={dialogAbrir} onOpenChange={() => {}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abrir Caixa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Saldo Inicial (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <Button
                onClick={() => abrirCaixa.mutate(saldoInicial)}
                className="w-full bg-emerald-600"
                disabled={abrirCaixa.isPending}
              >
                Abrir Caixa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
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
              <p className="text-xs text-green-700">Entradas</p>
              <p className="text-sm font-bold">R$ {totalEntradas.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="p-2">
              <p className="text-xs text-red-700">Saídas</p>
              <p className="text-sm font-bold">R$ {totalSaidas.toFixed(2)}</p>
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
              <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                <CardHeader className="p-2 flex-shrink-0">
                  <Input
                    placeholder="Buscar produto..."
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    className="h-7 text-xs"
                  />
                </CardHeader>
                <CardContent className="p-2 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 gap-1">
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
                        className="p-2 border rounded hover:border-blue-500 bg-white text-left"
                      >
                        <p className="text-xs font-semibold truncate">{p.descricao}</p>
                        <p className="text-xs font-bold text-blue-600">R$ {(p.preco_venda || 0).toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="p-2 flex-shrink-0">
                  <p className="text-xs font-bold">Carrinho ({carrinho.length})</p>
                </CardHeader>
                <CardContent className="p-2 space-y-2 overflow-y-auto flex-1">
                  <div className="space-y-1 max-h-24 overflow-auto">
                    {carrinho.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-1 bg-slate-50 rounded">
                        <div className="flex-1 min-w-0 mr-1">
                          <p className="text-xs truncate">{item.descricao}</p>
                          <div className="flex gap-1 mt-0.5">
                            <Button size="sm" variant="outline" onClick={() => setCarrinho(carrinho.map(i => i.id === item.id ? {...i, quantidade: i.quantidade - 1} : i).filter(i => i.quantidade > 0))} className="h-4 w-4 p-0 text-xs">-</Button>
                            <span className="text-xs w-6 text-center">{item.quantidade}</span>
                            <Button size="sm" variant="outline" onClick={() => setCarrinho(carrinho.map(i => i.id === item.id ? {...i, quantidade: i.quantidade + 1} : i))} className="h-4 w-4 p-0 text-xs">+</Button>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-blue-600">R$ {(item.preco_venda * item.quantidade).toFixed(2)}</p>
                      </div>
                    ))}
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
                    <div className="flex justify-between mb-2">
                      <span className="text-xs">TOTAL:</span>
                      <span className="text-lg font-bold text-blue-600">R$ {subtotal.toFixed(2)}</span>
                    </div>

                    <div className="space-y-1">
                      {formasPagamento.map((fp, idx) => (
                        <div key={idx} className="flex gap-1">
                          <Select value={fp.forma} onValueChange={(v) => {
                            const novas = [...formasPagamento];
                            novas[idx].forma = v;
                            setFormasPagamento(novas);
                          }}>
                            <SelectTrigger className="h-6 text-xs flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="PIX">PIX</SelectItem>
                              <SelectItem value="Cartão Débito">Débito</SelectItem>
                              <SelectItem value="Cartão Crédito">Crédito</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            step="0.01"
                            value={fp.valor}
                            onChange={(e) => {
                              const novas = [...formasPagamento];
                              novas[idx].valor = parseFloat(e.target.value) || 0;
                              setFormasPagamento(novas);
                            }}
                            className="h-6 w-20 text-xs"
                          />
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => setFormasPagamento([...formasPagamento, { forma: "PIX", valor: 0 }])} className="h-6 text-xs w-full">
                        + Forma
                      </Button>
                    </div>

                    {totalPago !== subtotal && (
                      <div className="bg-slate-100 rounded p-1 text-xs mt-1">
                        {totalPago > subtotal ? (
                          <p className="text-green-600 font-bold">Troco: R$ {troco.toFixed(2)}</p>
                        ) : (
                          <p className="text-red-600 font-bold">Falta: R$ {(subtotal - totalPago).toFixed(2)}</p>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={() => finalizarVenda.mutate()}
                      disabled={carrinho.length === 0 || totalPago < subtotal}
                      className="w-full bg-emerald-600 h-8 text-xs mt-2"
                    >
                      Finalizar
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
          <TabsContent value="movimentos" className="overflow-hidden m-0 mt-2">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardContent className="p-0 overflow-auto">
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
                        <TableCell className="text-xs p-2 truncate max-w-[200px]">{m.descricao}</TableCell>
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