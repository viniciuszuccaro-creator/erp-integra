import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Eye
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";

export default function CaixaDiarioTab() {
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [movimentoDialog, setMovimentoDialog] = useState(false);
  const [aberturaCaixaDialog, setAberturaCaixaDialog] = useState(false);
  const [fechamentoCaixaDialog, setFechamentoCaixaDialog] = useState(false);
  const [tipoMovimento, setTipoMovimento] = useState('entrada');

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual } = useContextoVisual();

  const [formMovimento, setFormMovimento] = useState({
    tipo: 'entrada',
    valor: 0,
    forma_pagamento: 'Dinheiro',
    categoria: '',
    descricao: '',
    documento: '',
    responsavel: '',
    observacoes: ''
  });

  const [caixaAberto, setCaixaAberto] = useState(null);

  // Buscar movimentos do caixa
  const { data: movimentos = [] } = useQuery({
    queryKey: ['movimentos-caixa', dataFiltro],
    queryFn: async () => {
      // Buscar todos os movimentos financeiros do dia
      const [receber, pagar] = await Promise.all([
        base44.entities.ContaReceber.filter({ 
          data_recebimento: dataFiltro,
          forma_recebimento: { $in: ['Dinheiro', 'PIX'] }
        }),
        base44.entities.ContaPagar.filter({ 
          data_pagamento: dataFiltro,
          forma_pagamento: { $in: ['Dinheiro', 'PIX'] }
        })
      ]);

      const entradas = receber.map(r => ({
        ...r,
        tipo: 'entrada',
        hora: new Date(r.data_recebimento).toLocaleTimeString('pt-BR'),
        valor_movimento: r.valor_recebido || r.valor
      }));

      const saidas = pagar.map(p => ({
        ...p,
        tipo: 'saida',
        hora: new Date(p.data_pagamento).toLocaleTimeString('pt-BR'),
        valor_movimento: p.valor_pago || p.valor
      }));

      return [...entradas, ...saidas].sort((a, b) => 
        new Date(a.created_date) - new Date(b.created_date)
      );
    },
  });

  // Calcular totais
  const totalEntradas = movimentos
    .filter(m => m.tipo === 'entrada')
    .reduce((sum, m) => sum + (m.valor_movimento || 0), 0);

  const totalSaidas = movimentos
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

  const handleAdicionarMovimento = () => {
    // Criar conta a receber ou pagar dependendo do tipo
    const movimento = {
      descricao: formMovimento.descricao,
      valor: formMovimento.valor,
      observacoes: formMovimento.observacoes,
      categoria: formMovimento.categoria,
      empresa_id: empresaAtual?.id,
      group_id: empresaAtual?.grupo_id
    };

    if (formMovimento.tipo === 'entrada') {
      base44.entities.ContaReceber.create({
        ...movimento,
        cliente: formMovimento.responsavel || 'Caixa',
        data_emissao: dataFiltro,
        data_vencimento: dataFiltro,
        data_recebimento: dataFiltro,
        forma_recebimento: formMovimento.forma_pagamento,
        valor_recebido: formMovimento.valor,
        status: 'Recebido',
        origem_tipo: 'manual'
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
        queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
        toast({ title: "✅ Entrada registrada!" });
        setMovimentoDialog(false);
        resetFormMovimento();
      });
    } else {
      base44.entities.ContaPagar.create({
        ...movimento,
        fornecedor: formMovimento.responsavel || 'Caixa',
        data_emissao: dataFiltro,
        data_vencimento: dataFiltro,
        data_pagamento: dataFiltro,
        forma_pagamento: formMovimento.forma_pagamento,
        valor_pago: formMovimento.valor,
        status: 'Pago'
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] });
        queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
        toast({ title: "✅ Saída registrada!" });
        setMovimentoDialog(false);
        resetFormMovimento();
      });
    }
  };

  const resetFormMovimento = () => {
    setFormMovimento({
      tipo: 'entrada',
      valor: 0,
      forma_pagamento: 'Dinheiro',
      categoria: '',
      descricao: '',
      documento: '',
      responsavel: '',
      observacoes: ''
    });
  };

  return (
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
                  {movimentos.filter(m => m.tipo === 'entrada').length} movimentos
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
                  {movimentos.filter(m => m.tipo === 'saida').length} movimentos
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
                    setTipoMovimento('entrada');
                    setFormMovimento({ ...formMovimento, tipo: 'entrada' });
                    setMovimentoDialog(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  + Entrada
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setTipoMovimento('saida');
                    setFormMovimento({ ...formMovimento, tipo: 'saida' });
                    setMovimentoDialog(true);
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
                    setTipoMovimento('sangria');
                    setFormMovimento({ ...formMovimento, tipo: 'saida', categoria: 'Sangria' });
                    setMovimentoDialog(true);
                  }}
                >
                  💰 Sangria
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTipoMovimento('reforco');
                    setFormMovimento({ ...formMovimento, tipo: 'entrada', categoria: 'Reforço' });
                    setMovimentoDialog(true);
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
            Movimentos do Dia ({movimentos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Documento</TableHead>
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
              {movimentos.map((mov, idx) => {
                const saldoAcumulado = (caixaAberto?.saldo_inicial || 0) + 
                  movimentos.slice(0, idx + 1).reduce((sum, m) => 
                    sum + (m.tipo === 'entrada' ? m.valor_movimento : -m.valor_movimento), 0
                  );

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
                    <TableCell className="text-sm">{mov.descricao}</TableCell>
                    <TableCell className="text-sm">{mov.categoria}</TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {mov.forma_recebimento || mov.forma_pagamento}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{mov.numero_documento || '-'}</TableCell>
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

          {movimentos.length === 0 && !caixaAberto && (
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

      {/* DIALOG ADICIONAR MOVIMENTO */}
      <Dialog open={movimentoDialog} onOpenChange={setMovimentoDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {tipoMovimento === 'entrada' ? '+ Entrada de Caixa' : '- Saída de Caixa'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={formMovimento.tipo}
                  onValueChange={(v) => {
                    setFormMovimento({ ...formMovimento, tipo: v });
                    setTipoMovimento(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="w-4 h-4 text-green-600" />
                        Entrada
                      </div>
                    </SelectItem>
                    <SelectItem value="saida">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        Saída
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valor *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formMovimento.valor}
                    onChange={(e) => setFormMovimento({ ...formMovimento, valor: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Forma de Pagamento *</Label>
                <Select
                  value={formMovimento.forma_pagamento}
                  onValueChange={(v) => setFormMovimento({ ...formMovimento, forma_pagamento: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">💵 Dinheiro</SelectItem>
                    <SelectItem value="PIX">🔷 PIX</SelectItem>
                    <SelectItem value="Cartão Débito">💳 Cartão Débito</SelectItem>
                    <SelectItem value="Cartão Crédito">💳 Cartão Crédito</SelectItem>
                    <SelectItem value="Transferência">🏦 Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria *</Label>
                <Select
                  value={formMovimento.categoria}
                  onValueChange={(v) => setFormMovimento({ ...formMovimento, categoria: v })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {formMovimento.tipo === 'entrada' ? (
                      <>
                        <SelectItem value="Venda">Venda</SelectItem>
                        <SelectItem value="Recebimento">Recebimento</SelectItem>
                        <SelectItem value="Reforço">Reforço</SelectItem>
                        <SelectItem value="Devolução">Devolução</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="Compra">Compra</SelectItem>
                        <SelectItem value="Despesa">Despesa</SelectItem>
                        <SelectItem value="Sangria">Sangria</SelectItem>
                        <SelectItem value="Devolução">Devolução</SelectItem>
                        <SelectItem value="Troco">Troco</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição *</Label>
              <Input
                value={formMovimento.descricao}
                onChange={(e) => setFormMovimento({ ...formMovimento, descricao: e.target.value })}
                placeholder="Descreva o movimento..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Documento/Referência</Label>
                <Input
                  value={formMovimento.documento}
                  onChange={(e) => setFormMovimento({ ...formMovimento, documento: e.target.value })}
                  placeholder="Nº NF, Pedido, Cupom..."
                />
              </div>

              <div>
                <Label>Responsável</Label>
                <Input
                  value={formMovimento.responsavel}
                  onChange={(e) => setFormMovimento({ ...formMovimento, responsavel: e.target.value })}
                  placeholder="Cliente ou Fornecedor"
                />
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formMovimento.observacoes}
                onChange={(e) => setFormMovimento({ ...formMovimento, observacoes: e.target.value })}
                rows={2}
              />
            </div>

            {/* PREVIEW DO SALDO */}
            <Card className={`border-2 ${formMovimento.tipo === 'entrada' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Novo Saldo:</p>
                    <p className="text-2xl font-bold">
                      R$ {(saldoCaixa + (formMovimento.tipo === 'entrada' ? formMovimento.valor : -formMovimento.valor)).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Movimento:</p>
                    <p className={`text-xl font-bold ${formMovimento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {formMovimento.tipo === 'entrada' ? '+' : '-'} R$ {formMovimento.valor.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setMovimentoDialog(false)}>
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={handleAdicionarMovimento}
                className={formMovimento.tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {formMovimento.tipo === 'entrada' ? <ArrowUpCircle className="w-4 h-4 mr-2" /> : <ArrowDownCircle className="w-4 h-4 mr-2" />}
                Registrar {formMovimento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}