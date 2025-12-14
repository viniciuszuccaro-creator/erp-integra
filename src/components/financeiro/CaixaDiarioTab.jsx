import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CartoesACompensar from "./CartoesACompensar";
import ConciliacaoBancariaTab from "./ConciliacaoBancariaTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useWindow } from "@/components/lib/useWindow";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowDownCircle,
  ArrowUpCircle,
  Lock,
  Unlock,
  Printer,
  Calendar,
  AlertCircle,
  Plus,
  Eye,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useContextoVisual from "@/components/lib/useContextoVisual";

export default function CaixaDiarioTab() {
  const [abaAtiva, setAbaAtiva] = useState("caixa-dia");
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [abaOperador, setAbaOperador] = useState("todos");
  const [liquidacaoDialogOpen, setLiquidacaoDialogOpen] = useState(false);
  const [ordemSelecionada, setOrdemSelecionada] = useState(null);
  const [formaPagamentoLiquidacao, setFormaPagamentoLiquidacao] = useState("");
  const [observacoesLiquidacao, setObservacoesLiquidacao] = useState("");
  const [titulosSelecionadosReceber, setTitulosSelecionadosReceber] = useState([]);
  const [titulosSelecionadosPagar, setTitulosSelecionadosPagar] = useState([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual } = useContextoVisual();
  const { openWindow } = useWindow();

  const [caixaAberto, setCaixaAberto] = useState(null);

  // ETAPA 4: Buscar movimentos DIRETOS do CaixaMovimento
  const { data: movimentos = [] } = useQuery({
    queryKey: ['movimentos-caixa', dataFiltro, empresaAtual?.id],
    queryFn: async () => {
      // Buscar movimentos de caixa da data selecionada
      const movimentosCaixa = await base44.entities.CaixaMovimento.filter({
        data_movimento: {
          $gte: new Date(dataFiltro + 'T00:00:00').toISOString(),
          $lt: new Date(dataFiltro + 'T23:59:59').toISOString()
        },
        empresa_id: empresaAtual?.id,
        cancelado: false
      });

      return movimentosCaixa.map(m => ({
        ...m,
        tipo: m.tipo_movimento === 'Entrada' ? 'entrada' : 'saida',
        hora: new Date(m.data_movimento).toLocaleTimeString('pt-BR'),
        valor_movimento: m.valor,
        descricao: m.descricao,
        categoria: m.origem,
        forma_recebimento: m.forma_pagamento,
        forma_pagamento: m.forma_pagamento,
        numero_documento: m.pedido_id || m.conta_receber_id || m.conta_pagar_id
      })).sort((a, b) => new Date(a.data_movimento) - new Date(b.data_movimento));
    },
  });

  // QUERIES ADICIONAIS PARA CAIXA CENTRAL
  const { data: ordensLiquidacao = [] } = useQuery({
    queryKey: ['caixa-ordens-liquidacao'],
    queryFn: () => base44.entities.CaixaOrdemLiquidacao.list('-created_date'),
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber'],
    queryFn: () => base44.entities.ContaReceber.list('-data_vencimento'),
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar'],
    queryFn: () => base44.entities.ContaPagar.list('-data_vencimento'),
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => base44.entities.Pedido.list(),
  });

  const operadoresUnicos = [...new Set(movimentos.map(m => m.usuario_operador_nome).filter(Boolean))];
  const movimentosFiltrados = abaOperador === "todos" 
    ? movimentos 
    : movimentos.filter(m => m.usuario_operador_nome === abaOperador);

  // Calcular totais
  const totalEntradas = movimentosFiltrados
    .filter(m => m.tipo === 'entrada')
    .reduce((sum, m) => sum + (m.valor_movimento || 0), 0);

  const totalSaidas = movimentosFiltrados
    .filter(m => m.tipo === 'saida')
    .reduce((sum, m) => sum + (m.valor_movimento || 0), 0);

  const saldoCaixa = totalEntradas - totalSaidas;

  const handleAbrirCaixa = () => {
    const saldoInicial = parseFloat(prompt("Digite o saldo inicial do caixa:") || "0");
    if (saldoInicial >= 0) {
      setCaixaAberto({
        data: dataFiltro,
        hora_abertura: new Date().toLocaleTimeString('pt-BR'),
        saldo_inicial: saldoInicial,
        status: 'aberto'
      });
      toast({ title: "✅ Caixa aberto com sucesso!" });
      setAberturaCaixaDialog(false);
    }
  };

  const handleFecharCaixa = () => {
    if (confirm(`Deseja fechar o caixa?\n\nSaldo Final: R$ ${saldoCaixa.toFixed(2)}`)) {
      setCaixaAberto(null);
      toast({ title: "✅ Caixa fechado!" });
      setFechamentoCaixaDialog(false);
    }
  };



  // MUTATIONS PARA CAIXA CENTRAL
  const enviarParaCaixaMutation = useMutation({
    mutationFn: async ({ titulos, tipo }) => {
      const ordens = await Promise.all(titulos.map(async (titulo) => {
        return await base44.entities.CaixaOrdemLiquidacao.create({
          empresa_id: titulo.empresa_id,
          tipo_operacao: tipo === 'receber' ? 'Recebimento' : 'Pagamento',
          origem: tipo === 'receber' ? 'Contas a Receber' : 'Contas a Pagar',
          valor_total: titulo.valor,
          forma_pagamento_pretendida: tipo === 'receber' ? 'PIX' : 'Transferência',
          status: 'Pendente',
          titulos_vinculados: [{
            titulo_id: titulo.id,
            tipo_titulo: tipo === 'receber' ? 'ContaReceber' : 'ContaPagar',
            numero_titulo: titulo.numero_documento || titulo.descricao,
            cliente_fornecedor_nome: tipo === 'receber' ? titulo.cliente : titulo.fornecedor,
            valor_titulo: titulo.valor
          }],
          data_ordem: new Date().toISOString()
        });
      }));
      return ordens;
    },
    onSuccess: (ordens) => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: `✅ ${ordens.length} título(s) enviado(s) para Caixa!` });
      setTitulosSelecionadosReceber([]);
      setTitulosSelecionadosPagar([]);
    }
  });

  const liquidarOrdemMutation = useMutation({
    mutationFn: async ({ ordemId, dados }) => {
      const ordem = ordensLiquidacao.find(o => o.id === ordemId);
      
      if (ordem.titulos_vinculados && ordem.titulos_vinculados.length > 0) {
        for (const titulo of ordem.titulos_vinculados) {
          if (ordem.tipo_operacao === 'Recebimento') {
            await base44.entities.ContaReceber.update(titulo.titulo_id, {
              status: 'Recebido',
              data_recebimento: new Date().toISOString(),
              valor_recebido: titulo.valor_titulo,
              forma_recebimento: dados.forma_pagamento
            });
          } else if (ordem.tipo_operacao === 'Pagamento') {
            await base44.entities.ContaPagar.update(titulo.titulo_id, {
              status: 'Pago',
              data_pagamento: new Date().toISOString(),
              valor_pago: titulo.valor_titulo,
              forma_pagamento: dados.forma_pagamento
            });
          }
        }
      }

      await base44.entities.CaixaOrdemLiquidacao.update(ordemId, {
        status: "Liquidado",
        data_liquidacao: new Date().toISOString(),
        forma_pagamento_pretendida: dados.forma_pagamento,
        observacoes: dados.observacoes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
      toast({ title: "✅ Liquidação realizada!" });
      setLiquidacaoDialogOpen(false);
      setOrdemSelecionada(null);
    }
  });

  const cancelarOrdemMutation = useMutation({
    mutationFn: async (ordemId) => {
      await base44.entities.CaixaOrdemLiquidacao.update(ordemId, {
        status: "Cancelado"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: "✅ Ordem cancelada" });
    }
  });

  // DADOS PARA LIQUIDAÇÃO
  const ordensPendentes = ordensLiquidacao.filter(o => o.status === "Pendente");
  const ordensLiquidadas = ordensLiquidacao.filter(o => o.status === "Liquidado");
  const ordensCanceladas = ordensLiquidacao.filter(o => o.status === "Cancelado");
  const contasReceberPendentes = contasReceber.filter(c => c.status === 'Pendente' || c.status === 'Atrasado');
  const contasPagarPendentes = contasPagar.filter(c => c.status === 'Pendente' || c.status === 'Aprovado');

  const handleLiquidar = (ordem) => {
    setOrdemSelecionada(ordem);
    setFormaPagamentoLiquidacao(ordem.forma_pagamento_pretendida || "");
    setLiquidacaoDialogOpen(true);
  };

  const confirmarLiquidacao = () => {
    if (!formaPagamentoLiquidacao) {
      toast({ title: "⚠️ Selecione a forma de pagamento", variant: "destructive" });
      return;
    }

    liquidarOrdemMutation.mutate({
      ordemId: ordemSelecionada.id,
      dados: {
        forma_pagamento: formaPagamentoLiquidacao,
        observacoes: observacoesLiquidacao
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* TABS PRINCIPAL */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="caixa-dia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Calendar className="w-4 h-4 mr-2" />
            Caixa do Dia
          </TabsTrigger>
          <TabsTrigger value="liquidar-receber" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Liquidar Receber
          </TabsTrigger>
          <TabsTrigger value="liquidar-pagar" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <TrendingDown className="w-4 h-4 mr-2" />
            Liquidar Pagar
          </TabsTrigger>
          <TabsTrigger value="ordens-pendentes" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Ordens ({ordensPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="cartoes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            💳 Cartões a Compensar
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            🏦 Conciliação
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* ABA: CAIXA DO DIA */}
        <TabsContent value="caixa-dia">
          <div className="space-y-6">
            {/* HEADER COM DATA E STATUS */}
            <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Caixa Diário</h2>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
              className="w-48"
            />
          </div>
          {caixaAberto ? (
            <Badge className="bg-green-100 text-green-700">
              <Unlock className="w-3 h-3 mr-1" />
              Caixa Aberto
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700">
              <Lock className="w-3 h-3 mr-1" />
              Caixa Fechado
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {!caixaAberto ? (
            <Button
              onClick={() => setAberturaCaixaDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Abrir Caixa
            </Button>
          ) : (
            <Button
              onClick={() => setFechamentoCaixaDialog(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Fechar Caixa
            </Button>
          )}
          
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* TOTALIZADORES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md bg-blue-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-700">Saldo Inicial</p>
                <p className="text-2xl font-bold text-blue-900">
                  R$ {(caixaAberto?.saldo_inicial || 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-green-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-700">Entradas</p>
                <p className="text-2xl font-bold text-green-900">
                  R$ {totalEntradas.toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {movimentosFiltrados.filter(m => m.tipo === 'entrada').length} movimentos
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-red-50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-red-700">Saídas</p>
                <p className="text-2xl font-bold text-red-900">
                  R$ {totalSaidas.toFixed(2)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {movimentosFiltrados.filter(m => m.tipo === 'saida').length} movimentos
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md ${saldoCaixa >= 0 ? 'bg-emerald-50' : 'bg-orange-50'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm ${saldoCaixa >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                  Saldo Atual
                </p>
                <p className={`text-2xl font-bold ${saldoCaixa >= 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
                  R$ {saldoCaixa.toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${saldoCaixa >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {saldoCaixa >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </div>
              <DollarSign className={`w-6 h-6 ${saldoCaixa >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AÇÕES RÁPIDAS */}
      {caixaAberto && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-blue-900">Ações Rápidas</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    openWindow(
                      "AdicionarMovimentoForm",
                      { 
                        initialData: { tipo: 'entrada' },
                        empresaAtual: empresaAtual,
                        onSubmit: () => {
                          queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
                          queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
                        },
                        onCancel: () => {}
                      },
                      {
                        title: '➕ Entrada de Caixa',
                        width: 900,
                        height: 700
                      }
                    );
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  + Entrada
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    openWindow(
                      "AdicionarMovimentoForm",
                      { 
                        initialData: { tipo: 'saida' },
                        empresaAtual: empresaAtual,
                        onSubmit: () => {
                          queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
                          queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
                        },
                        onCancel: () => {}
                      },
                      {
                        title: '➖ Saída de Caixa',
                        width: 900,
                        height: 700
                      }
                    );
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  - Saída
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    openWindow(
                      "AdicionarMovimentoForm",
                      { 
                        initialData: { tipo: 'saida', categoria: 'Sangria', descricao: 'Sangria de Caixa' },
                        empresaAtual: empresaAtual,
                        onSubmit: () => {
                          queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
                        },
                        onCancel: () => {}
                      },
                      {
                        title: '💸 Sangria de Caixa',
                        width: 900,
                        height: 700
                      }
                    );
                  }}
                >
                  💰 Sangria
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    openWindow(
                      "AdicionarMovimentoForm",
                      { 
                        initialData: { tipo: 'entrada', categoria: 'Reforço', descricao: 'Reforço de Caixa' },
                        empresaAtual: empresaAtual,
                        onSubmit: () => {
                          queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
                        },
                        onCancel: () => {}
                      },
                      {
                        title: '💵 Reforço de Caixa',
                        width: 900,
                        height: 700
                      }
                    );
                  }}
                >
                  💵 Reforço
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TABELA DE MOVIMENTOS */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>
            Movimentos do Dia ({movimentosFiltrados.length})
            {operadorFiltro !== "todos" && <span className="text-sm font-normal text-slate-600 ml-2">• {operadorFiltro}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente / Pedido</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Saldo Inicial */}
              {caixaAberto && (
                <TableRow className="bg-blue-50 font-semibold">
                  <TableCell>{caixaAberto.hora_abertura}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-600">Abertura</Badge>
                  </TableCell>
                  <TableCell colSpan={4}>Saldo Inicial de Caixa</TableCell>
                  <TableCell className="text-blue-900">
                    R$ {caixaAberto.saldo_inicial.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-blue-900">
                    R$ {caixaAberto.saldo_inicial.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}

              {/* Movimentos */}
              {movimentosFiltrados.map((mov, idx) => {
                const saldoAcumulado = (caixaAberto?.saldo_inicial || 0) + 
                  movimentosFiltrados.slice(0, idx + 1).reduce((sum, m) => 
                    sum + (m.tipo === 'entrada' ? m.valor_movimento : -m.valor_movimento), 0
                  );

                const pedidoVinculado = pedidos.find(p => p.id === mov.pedido_id);

                return (
                  <TableRow key={mov.id}>
                    <TableCell className="text-sm">{mov.hora}</TableCell>
                    <TableCell>
                      {mov.tipo === 'entrada' ? (
                        <Badge className="bg-green-100 text-green-700">
                          <ArrowUpCircle className="w-3 h-3 mr-1" />
                          Entrada
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <ArrowDownCircle className="w-3 h-3 mr-1" />
                          Saída
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {pedidoVinculado ? (
                        <div>
                          <p className="font-semibold">{pedidoVinculado.cliente_nome}</p>
                          <p className="text-xs text-slate-500">📋 {pedidoVinculado.numero_pedido}</p>
                        </div>
                      ) : (
                        <p>{mov.descricao || '-'}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{mov.categoria}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {mov.forma_recebimento || mov.forma_pagamento}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{mov.usuario_operador_nome || '-'}</TableCell>
                    <TableCell className={`font-semibold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {mov.tipo === 'entrada' ? '+' : '-'} R$ {mov.valor_movimento.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      R$ {saldoAcumulado.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Saldo Final */}
              {movimentos.length > 0 && (
                <TableRow className="bg-slate-100 font-bold">
                  <TableCell colSpan={6} className="text-right">SALDO FINAL:</TableCell>
                  <TableCell className={saldoCaixa >= 0 ? 'text-green-700' : 'text-red-700'}>
                    R$ {saldoCaixa.toFixed(2)}
                  </TableCell>
                  <TableCell className={saldoCaixa >= 0 ? 'text-green-700' : 'text-red-700'}>
                    R$ {saldoCaixa.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {movimentosFiltrados.length === 0 && !caixaAberto && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">Nenhum movimento registrado hoje</p>
              <Button onClick={() => setAberturaCaixaDialog(true)} className="bg-green-600">
                <Unlock className="w-4 h-4 mr-2" />
                Abrir Caixa do Dia
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOG ABERTURA CAIXA */}
      <Dialog open={aberturaCaixaDialog} onOpenChange={setAberturaCaixaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa do Dia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Data:</strong> {new Date(dataFiltro).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-blue-700">
                  Você está abrindo o caixa para o dia selecionado
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAberturaCaixaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAbrirCaixa} className="bg-green-600 hover:bg-green-700">
                <Unlock className="w-4 h-4 mr-2" />
                Confirmar Abertura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG FECHAMENTO CAIXA */}
      <Dialog open={fechamentoCaixaDialog} onOpenChange={setFechamentoCaixaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa do Dia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-slate-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Saldo Inicial:</span>
                  <span className="font-bold">R$ {(caixaAberto?.saldo_inicial || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">+ Entradas:</span>
                  <span className="font-bold text-green-600">R$ {totalEntradas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">- Saídas:</span>
                  <span className="font-bold text-red-600">R$ {totalSaidas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-slate-300">
                  <span className="text-lg font-semibold">Saldo Final:</span>
                  <span className={`text-lg font-bold ${saldoCaixa >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    R$ {saldoCaixa.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-orange-900 font-semibold">Atenção!</p>
                    <p className="text-sm text-orange-700">
                      Ao fechar o caixa, não será mais possível adicionar movimentos para este dia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFechamentoCaixaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleFecharCaixa} className="bg-red-600 hover:bg-red-700">
                <Lock className="w-4 h-4 mr-2" />
                Confirmar Fechamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


          </div>
        </TabsContent>

        {/* ABA: LIQUIDAR CONTAS A RECEBER */}
        <TabsContent value="liquidar-receber" className="space-y-4">
          <Alert className="border-green-300 bg-green-50">
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-900">💰 Liquidação de Contas a Receber</p>
                <p className="text-xs text-green-700">Selecione títulos para enviar ao Caixa ou liquidar diretamente</p>
              </div>
              {titulosSelecionadosReceber.length > 0 && (
                <Button
                  onClick={() => enviarParaCaixaMutation.mutate({ titulos: contasReceber.filter(c => titulosSelecionadosReceber.includes(c.id)), tipo: 'receber' })}
                  disabled={enviarParaCaixaMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar {titulosSelecionadosReceber.length} para Caixa
                </Button>
              )}
            </AlertDescription>
          </Alert>

          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={titulosSelecionadosReceber.length === contasReceberPendentes.length && contasReceberPendentes.length > 0}
                        onCheckedChange={(checked) => setTitulosSelecionadosReceber(checked ? contasReceberPendentes.map(c => c.id) : [])}
                      />
                    </TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasReceberPendentes.map(conta => (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <Checkbox
                          checked={titulosSelecionadosReceber.includes(conta.id)}
                          onCheckedChange={() => {
                            setTitulosSelecionadosReceber(prev =>
                              prev.includes(conta.id) ? prev.filter(id => id !== conta.id) : [...prev, conta.id]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{conta.cliente}</TableCell>
                      <TableCell className="max-w-xs truncate">{conta.descricao}</TableCell>
                      <TableCell className="text-sm">{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-semibold">R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge className={conta.status === 'Atrasado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {conta.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => enviarParaCaixaMutation.mutate({ titulos: [conta], tipo: 'receber' })}
                          disabled={enviarParaCaixaMutation.isPending}
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Enviar
                        </Button>
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

        {/* ABA: LIQUIDAR CONTAS A PAGAR */}
        <TabsContent value="liquidar-pagar" className="space-y-4">
          <Alert className="border-red-300 bg-red-50">
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-red-900">💸 Liquidação de Contas a Pagar</p>
                <p className="text-xs text-red-700">Selecione títulos para enviar ao Caixa ou liquidar diretamente</p>
              </div>
              {titulosSelecionadosPagar.length > 0 && (
                <Button
                  onClick={() => enviarParaCaixaMutation.mutate({ titulos: contasPagar.filter(c => titulosSelecionadosPagar.includes(c.id)), tipo: 'pagar' })}
                  disabled={enviarParaCaixaMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar {titulosSelecionadosPagar.length} para Caixa
                </Button>
              )}
            </AlertDescription>
          </Alert>

          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={titulosSelecionadosPagar.length === contasPagarPendentes.length && contasPagarPendentes.length > 0}
                        onCheckedChange={(checked) => setTitulosSelecionadosPagar(checked ? contasPagarPendentes.map(c => c.id) : [])}
                      />
                    </TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasPagarPendentes.map(conta => (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <Checkbox
                          checked={titulosSelecionadosPagar.includes(conta.id)}
                          onCheckedChange={() => {
                            setTitulosSelecionadosPagar(prev =>
                              prev.includes(conta.id) ? prev.filter(id => id !== conta.id) : [...prev, conta.id]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                      <TableCell className="max-w-xs truncate">{conta.descricao}</TableCell>
                      <TableCell className="text-sm">{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-semibold">R$ {(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge className={conta.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}>
                          {conta.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => enviarParaCaixaMutation.mutate({ titulos: [conta], tipo: 'pagar' })}
                          disabled={enviarParaCaixaMutation.isPending}
                        >
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Enviar
                        </Button>
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

        {/* ABA: ORDENS PENDENTES */}
        <TabsContent value="ordens-pendentes" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Ordens Pendentes de Liquidação ({ordensPendentes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Títulos Vinculados</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordensPendentes.map(ordem => (
                    <TableRow key={ordem.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm">{new Date(ordem.created_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge className={ordem.tipo_operacao === "Recebimento" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {ordem.tipo_operacao === "Recebimento" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {ordem.tipo_operacao}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{ordem.origem}</Badge></TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {ordem.titulos_vinculados?.map((titulo, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-semibold">{titulo.numero_titulo}</span>
                              <span className="text-slate-500"> • {titulo.cliente_fornecedor_nome}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-base">R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell><Badge className="bg-blue-100 text-blue-700">{ordem.forma_pagamento_pretendida}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleLiquidar(ordem)} className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Liquidar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => cancelarOrdemMutation.mutate(ordem.id)} className="border-red-300 text-red-600">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {ordensPendentes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma ordem pendente de liquidação</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: CARTÕES A COMPENSAR */}
        <TabsContent value="cartoes" className="space-y-4">
          <CartoesACompensar />
        </TabsContent>

        {/* ABA: CONCILIAÇÃO BANCÁRIA */}
        <TabsContent value="conciliacao" className="space-y-4">
          <ConciliacaoBancariaTab />
        </TabsContent>

        {/* ABA: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Liquidações Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data Liquidação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Títulos</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...ordensLiquidadas, ...ordensCanceladas].map(ordem => (
                    <TableRow key={ordem.id} className={ordem.status === "Cancelado" ? "opacity-50" : ""}>
                      <TableCell className="text-sm">
                        {ordem.data_liquidacao ? new Date(ordem.data_liquidacao).toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={ordem.tipo_operacao === "Recebimento" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {ordem.tipo_operacao}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{ordem.origem}</Badge></TableCell>
                      <TableCell>{ordem.titulos_vinculados?.length || 0} título(s)</TableCell>
                      <TableCell className="font-bold">R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge className={ordem.status === "Liquidado" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {ordem.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {ordensLiquidadas.length === 0 && ordensCanceladas.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum histórico ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG DE LIQUIDAÇÃO */}
      <Dialog open={liquidacaoDialogOpen} onOpenChange={setLiquidacaoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Confirmar Liquidação
            </DialogTitle>
          </DialogHeader>

          {ordemSelecionada && (
            <div className="space-y-4">
              <Card className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-600">Tipo</Label>
                      <p className="font-semibold">{ordemSelecionada.tipo_operacao}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Origem</Label>
                      <p className="font-semibold">{ordemSelecionada.origem}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Valor Total</Label>
                      <p className="text-xl font-bold text-emerald-600">
                        R$ {(ordemSelecionada.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Títulos Vinculados</Label>
                      <p className="font-semibold">{ordemSelecionada.titulos_vinculados?.length || 0}</p>
                    </div>
                  </div>

                  {ordemSelecionada.titulos_vinculados?.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Label className="text-xs text-slate-600 mb-2 block">Títulos:</Label>
                      <div className="space-y-1">
                        {ordemSelecionada.titulos_vinculados.map((titulo, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{titulo.numero_titulo} - {titulo.cliente_fornecedor_nome}</span>
                            <span className="font-semibold">R$ {(titulo.valor_titulo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div>
                  <Label>Forma de Pagamento *</Label>
                  <Select value={formaPagamentoLiquidacao} onValueChange={setFormaPagamentoLiquidacao}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">💵 Dinheiro</SelectItem>
                      <SelectItem value="Cartão Crédito">💳 Cartão Crédito</SelectItem>
                      <SelectItem value="Cartão Débito">💳 Cartão Débito</SelectItem>
                      <SelectItem value="PIX">⚡ PIX</SelectItem>
                      <SelectItem value="Boleto">📄 Boleto</SelectItem>
                      <SelectItem value="Transferência">🏦 Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={observacoesLiquidacao}
                    onChange={(e) => setObservacoesLiquidacao(e.target.value)}
                    placeholder="Observações sobre a liquidação..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setLiquidacaoDialogOpen(false)}>Cancelar</Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={confirmarLiquidacao}
                  disabled={liquidarOrdemMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {liquidarOrdemMutation.isPending ? "Liquidando..." : "Confirmar Liquidação"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}